/**
 * DPC NEXUS — build compatibility checker.
 *
 * Lightweight rules engine that flags mismatches between components
 * in a custom build. Runs entirely in the browser against the product
 * specs defined in demo-data.ts.
 *
 * DEMO ONLY — a production system would use a richer parts database.
 */
import type { BuildComponent, Product } from "./types";

export type IssueSeverity = "error" | "warning" | "info";

export interface CompatibilityIssue {
  severity: IssueSeverity;
  title: string;
  detail: string;
  /** Which slots are involved, for highlighting */
  slots: string[];
}

type Spec = Product["specs"];

/** Resolve the semantic role (category key) for a product id. */
export type CategoryKeyResolver = (productId: string) => string | undefined;

function spec(
  products: Product[],
  components: BuildComponent[],
  keyOf: CategoryKeyResolver,
  key: string,
): Spec | undefined {
  const comp = components.find((c) => keyOf(c.productId) === key);
  if (!comp) return undefined;
  return products.find((p) => p.id === comp.productId)?.specs;
}

function allOfCategory(
  products: Product[],
  components: BuildComponent[],
  keyOf: CategoryKeyResolver,
  key: string,
): Spec[] {
  return components
    .map((c) => products.find((p) => p.id === c.productId))
    .filter((p): p is Product => !!p && keyOf(p.id) === key)
    .map((p) => p.specs);
}

/**
 * Run all compatibility rules against a build's component list.
 */
export function checkCompatibility(
  components: BuildComponent[],
  products: Product[],
  keyOf: CategoryKeyResolver,
): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];

  const cpuSpec = spec(products, components, keyOf, "cpu");
  const mbSpec = spec(products, components, keyOf, "motherboard");
  const ramSpecs = allOfCategory(products, components, keyOf, "ram");
  const gpuSpec = spec(products, components, keyOf, "gpu");
  const psuSpec = spec(products, components, keyOf, "psu");
  const caseSpec = spec(products, components, keyOf, "case");

  // ── CPU ↔ Motherboard socket ──────────────────────────────────────
  if (cpuSpec?.socket && mbSpec?.socket && cpuSpec.socket !== mbSpec.socket) {
    issues.push({
      severity: "error",
      title: "Socket mismatch",
      detail: `CPU requires ${cpuSpec.socket} but motherboard provides ${mbSpec.socket}.`,
      slots: ["CPU", "Motherboard"],
    });
  }

  // ── RAM type ↔ Motherboard memory type ────────────────────────────
  if (mbSpec?.memoryType && ramSpecs.length > 0) {
    for (const ram of ramSpecs) {
      if (ram.memoryType && ram.memoryType !== mbSpec.memoryType) {
        issues.push({
          severity: "error",
          title: "Memory type mismatch",
          detail: `Motherboard supports ${mbSpec.memoryType} but RAM is ${ram.memoryType}.`,
          slots: ["RAM", "Motherboard"],
        });
        break; // one warning is enough
      }
    }
  }

  // ── PSU wattage vs total TDP ──────────────────────────────────────
  if (psuSpec?.wattage) {
    const wattage = Number(psuSpec.wattage);
    let totalTdp = 0;
    if (cpuSpec?.tdp) totalTdp += Number(cpuSpec.tdp);
    if (gpuSpec?.tdp) totalTdp += Number(gpuSpec.tdp);

    if (totalTdp > 0) {
      const headroom = wattage - totalTdp;
      const pct = (headroom / wattage) * 100;
      if (headroom < 0) {
        issues.push({
          severity: "error",
          title: "PSU insufficient",
          detail: `Combined CPU+GPU TDP (${totalTdp}W) exceeds PSU capacity (${wattage}W).`,
          slots: ["PSU", "CPU", "GPU"],
        });
      } else if (pct < 20) {
        issues.push({
          severity: "warning",
          title: "PSU headroom tight",
          detail: `Only ${headroom}W headroom (${pct.toFixed(0)}%). Recommend at least 20% buffer.`,
          slots: ["PSU"],
        });
      }
    }
  }

  // ── Case form factor vs Motherboard ───────────────────────────────
  if (caseSpec?.formFactor && mbSpec?.formFactor) {
    const caseFF = String(caseSpec.formFactor).toLowerCase();
    const mbFF = String(mbSpec.formFactor).toLowerCase();
    // mITX case can't fit ATX/mATX boards
    if (caseFF === "mitx" && (mbFF === "atx" || mbFF === "matx")) {
      issues.push({
        severity: "error",
        title: "Form factor mismatch",
        detail: `${mbSpec.formFactor} motherboard won't fit in a mini-ITX case.`,
        slots: ["Motherboard", "Case"],
      });
    }
    // mATX case can't fit ATX boards
    if (caseFF === "matx" && mbFF === "atx") {
      issues.push({
        severity: "warning",
        title: "Tight form factor fit",
        detail: `ATX motherboard in an mATX case — verify clearance.`,
        slots: ["Motherboard", "Case"],
      });
    }
  }

  // ── Missing essential components ──────────────────────────────────
  const essentials: { key: string; slot: string; label: string }[] = [
    { key: "cpu", slot: "CPU", label: "CPU" },
    { key: "motherboard", slot: "Motherboard", label: "Motherboard" },
    { key: "ram", slot: "RAM", label: "RAM" },
    { key: "psu", slot: "PSU", label: "PSU" },
    { key: "case", slot: "Case", label: "Case" },
    { key: "storage", slot: "Storage", label: "Storage" },
  ];
  for (const e of essentials) {
    const has = components.some((c) => keyOf(c.productId) === e.key);
    if (!has) {
      issues.push({
        severity: "info",
        title: `Missing ${e.label}`,
        detail: `No ${e.label.toLowerCase()} has been added to this build yet.`,
        slots: [e.slot],
      });
    }
  }

  return issues;
}
