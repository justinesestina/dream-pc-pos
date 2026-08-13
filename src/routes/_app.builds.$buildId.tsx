import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  CircleDashed,
  FlaskConical,
  Info,
  Minus,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState, Mono, IdLink, TechLabel } from "@/components/nexus/primitives";
import { Section, KeyValueGrid, TotalsRows, DemoNote, ProgressBar } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useOps, stageProgress } from "@/lib/ops-store";
import { ASSEMBLY_STAGES, type AssemblyStageId } from "@/lib/ops-types";
import { NewReleaseDialog } from "@/components/releases/new-release-dialog";
import { stageForStatus, statusForStage } from "@/lib/build-state";
import { money, dateTime, titleCase } from "@/lib/format";
import { checkCompatibility, type CompatibilityIssue, type IssueSeverity } from "@/lib/compatibility";
import type { BuildSlot, BuildStatus, ProductCategory } from "@/lib/types";

export const Route = createFileRoute("/_app/builds/$buildId")({
  head: () => ({
    meta: [
      { title: "Build detail — DPC Nexus" },
      { name: "description", content: "Parts list, compatibility checks, QA results and timeline." },
      { property: "og:title", content: "Build detail — DPC Nexus" },
      { property: "og:description", content: "Parts list, compatibility checks, QA results and timeline." },
    ],
  }),
  component: BuildsBuildidPage,
});

const BUILD_STATUSES: BuildStatus[] = [
  "draft",
  "consultation",
  "quoted",
  "approved",
  "parts_reserved",
  "assembly",
  "testing",
  "ready",
  "released",
  "cancelled",
];

const TECHS = ["Unassigned", "Marco Reyes", "Angelo Cruz", "Bea Santos", "Jun Dela Cruz"];

const SLOT_CATEGORY_MAP: Record<BuildSlot, ProductCategory> = {
  CPU: "CPU",
  Motherboard: "Motherboard",
  RAM: "RAM",
  GPU: "GPU",
  Storage: "Storage",
  PSU: "PSU",
  Case: "Case",
  Cooling: "Cooling",
  Fans: "Fans",
  Software: "Software",
  Accessories: "Accessories",
};

const ALL_SLOTS: BuildSlot[] = [
  "CPU", "Motherboard", "RAM", "GPU", "Storage", "PSU", "Case", "Cooling", "Fans", "Software", "Accessories",
];

const SEVERITY_CONFIG: Record<IssueSeverity, { icon: typeof AlertTriangle; className: string }> = {
  error: { icon: XCircle, className: "text-destructive bg-destructive/10 border-destructive/30" },
  warning: { icon: AlertTriangle, className: "text-warning bg-warning/10 border-warning/30" },
  info: { icon: Info, className: "text-info bg-info/10 border-info/30" },
};

/* ───────────────────────────────── Add Component Dialog ──── */

function AddComponentDialog({ buildId }: { buildId: string }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<BuildSlot>("CPU");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState("1");

  const category = SLOT_CATEGORY_MAP[slot];
  const availableProducts = useMemo(
    () =>
      store.products.filter((p) => {
        if (p.category !== category) return false;
        if (p.isService) return false;
        return true;
      }),
    [store.products, category],
  );

  const submit = () => {
    if (!selectedProduct) {
      toast.error("Select a product.");
      return;
    }
    const n = Number(qty) || 1;
    store.addBuildComponent(buildId, slot, selectedProduct, n);
    toast.success("Component added to build.");
    setOpen(false);
    setSelectedProduct("");
    setQty("1");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="size-3.5" /> Add part
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add component</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Slot</Label>
            <Select value={slot} onValueChange={(v) => { setSlot(v as BuildSlot); setSelectedProduct(""); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_SLOTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Product</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a product…" />
              </SelectTrigger>
              <SelectContent>
                {availableProducts.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    No products in this category
                  </SelectItem>
                ) : (
                  availableProducts.map((p) => {
                    const avail = store.availableOf(p.id);
                    return (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="flex items-center gap-2">
                          <span className="truncate">{p.name}</span>
                          <span className="mono text-[10px] text-subtle">{money(p.price)}</span>
                          <span className="mono text-[10px] text-subtle">({avail} avail)</span>
                        </span>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Qty</Label>
            <Input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-24"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────────────────────── Main Page ──── */

function BuildsBuildidPage() {
  const { buildId } = Route.useParams();
  const store = useStore();
  const ops = useOps();
  const navigate = useNavigate();
  const build = store.builds.find((b) => b.id === buildId);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const issues = useMemo(
    () => (build ? checkCompatibility(build.components, store.products) : []),
    [build, store.products],
  );

  if (!build) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Build detail" description="Parts list, compatibility checks, QA results and timeline." />
        <Panel>
          <EmptyState title="Build not found" description={`No build matches "${buildId}".`} />
        </Panel>
      </div>
    );
  }

  const o = ops.opsForBuild(build.id);
  const pct = stageProgress(o.stage);

  const partsTotal = build.components.reduce((s, c) => {
    const p = store.productById(c.productId);
    return s + (p ? p.price * c.qty : 0);
  }, 0);
  const servicesTotal = build.services.reduce((s, x) => s + x.amount, 0);

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  const handleGenerateQuote = () => {
    const quote = store.quoteFromBuild(build.id);
    if (!quote) {
      toast.error("Could not generate a quote for this build.");
      return;
    }
    toast.success(`Quote ${quote.id} generated.`);
    navigate({ to: "/quotes/$quoteId", params: { quoteId: quote.id } });
  };

  const canFinalizeQa = build.qa.length > 0 && build.qa.every((c) => c.passed !== null);
  const allQaPassed = build.qa.every((c) => c.passed === true);

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            {build.id}
            <StatusBadge status={build.status} />
          </span>
        }
        description={build.purpose}
        meta={
          <>
            <span className="text-xs text-muted-foreground">
              Customer: <span className="text-foreground">{build.customerName}</span>
            </span>
            <span className="text-xs text-muted-foreground">
              Budget: <span className="mono text-foreground">{money(build.budget)}</span>
            </span>
            <span className="text-xs text-muted-foreground">Created {dateTime(build.createdAt)}</span>
          </>
        }
        actions={
          <>
            <Select
              value={build.status}
              onValueChange={(v) => {
                const status = v as BuildStatus;
                if (status === "cancelled") {
                  setConfirmCancel(true);
                  return;
                }
                store.setBuildStatus(build.id, status);
                ops.setBuildStage(build.id, stageForStatus(status, o.stage));
              }}
            >
              <SelectTrigger className="h-8 w-40 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUILD_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {titleCase(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleGenerateQuote} disabled={build.components.length === 0}>
              Generate quote
            </Button>
            {build.status === "ready" && <NewReleaseDialog triggerLabel="Schedule release" />}
          </>
        }
      />

      <Section title="Assembly stage" hint={`${pct}% through pipeline`}>
        <div className="space-y-3 p-4">
          <ProgressBar value={pct} tone={pct === 100 ? "success" : "info"} />
          <div className="flex flex-wrap gap-1.5">
            {ASSEMBLY_STAGES.map((s) => {
              const idx = ASSEMBLY_STAGES.findIndex((x) => x.id === o.stage);
              const sIdx = ASSEMBLY_STAGES.findIndex((x) => x.id === s.id);
              const state = sIdx < idx ? "done" : sIdx === idx ? "active" : "pending";
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    ops.setBuildStage(build.id, s.id);
                    const st = statusForStage(s.id);
                    if (st && build.status !== "cancelled") store.setBuildStatus(build.id, st);
                  }}
                  className={cn(
                    "rounded border px-2 py-1 text-[11px] transition-colors",
                    state === "done" && "border-success/30 bg-success/10 text-success",
                    state === "active" && "border-info/40 bg-info/10 text-info",
                    state === "pending" && "border-border bg-elevated text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── Compatibility issues ───────────────────────────────── */}
      {issues.length > 0 && (
        <Section
          title="Compatibility check"
          hint={
            errorCount > 0
              ? `${errorCount} error${errorCount > 1 ? "s" : ""}`
              : warningCount > 0
                ? `${warningCount} warning${warningCount > 1 ? "s" : ""}`
                : "All checks passed"
          }
        >
          <div className="space-y-1.5 p-3">
            {issues.map((issue, i) => {
              const cfg = SEVERITY_CONFIG[issue.severity];
              const Icon = cfg.icon;
              return (
                <div
                  key={`${issue.title}-${i}`}
                  className={cn("flex items-start gap-2.5 rounded-md border px-3 py-2", cfg.className)}
                >
                  <Icon className="mt-0.5 size-3.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium">{issue.title}</p>
                    <p className="text-[11.5px] opacity-80">{issue.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Section
            title="Parts list"
            hint={`${build.components.length} components`}
            action={<AddComponentDialog buildId={build.id} />}
          >
            {build.components.length === 0 ? (
              <EmptyState title="No parts assigned yet" description="Add components before generating a quote." />
            ) : (
              <div className="divide-y divide-border/60">
                {build.components.map((c) => {
                  const p = store.productById(c.productId);
                  return (
                    <div key={c.productId} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="min-w-0">
                        <TechLabel>{c.slot}</TechLabel>
                        <p className="truncate text-[13px] text-foreground">{p?.name ?? c.productId}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            disabled={c.qty <= 1}
                            onClick={() => store.setBuildComponentQty(build.id, c.productId, c.qty - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="mono w-6 text-center text-[12px]" title="Quantity">
                            {c.qty}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => store.setBuildComponentQty(build.id, c.productId, c.qty + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                        <div className="w-20 text-right text-[13px]">
                          <p className="mono text-foreground">{money((p?.price ?? 0) * c.qty)}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-subtle hover:text-destructive"
                          onClick={() => setRemoving(c.productId)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="border-t border-border p-4">
              <TotalsRows
                rows={[
                  { label: "Parts subtotal", value: money(partsTotal) },
                  { label: "Services", value: money(servicesTotal) },
                  { label: "Total", value: money(partsTotal + servicesTotal), strong: true },
                ]}
              />
            </div>
          </Section>

          <Section title="Assembly checklist" hint={`${o.assembly.filter((a) => a.done).length}/${o.assembly.length} complete`}>
            <div className="divide-y divide-border/60">
              {o.assembly.map((a) => (
                <label key={a.label} className="flex cursor-pointer items-center gap-3 px-4 py-2.5">
                  <Checkbox
                    checked={a.done}
                    onCheckedChange={(v) => ops.toggleAssemblyStep(build.id, a.label, v === true)}
                  />
                  <span className={cn("text-[13px]", a.done ? "text-foreground" : "text-muted-foreground")}>
                    {a.label}
                  </span>
                </label>
              ))}
            </div>
          </Section>

          <Section title="Test results" hint={`${o.tests.filter((t) => t.result === "pass").length}/${o.tests.length} passing`}>
            <div className="divide-y divide-border/60">
              {o.tests.map((t) => (
                <div key={t.label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="size-3.5 text-subtle" />
                    <span className="text-[13px] text-foreground">{t.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={t.reading ?? ""}
                      placeholder="reading"
                      onChange={(e) => ops.setTestResult(build.id, t.label, t.result, e.target.value)}
                      className="h-7 w-32 text-xs"
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={t.result === "pass" ? "default" : "outline"}
                        className="h-7 px-2 text-xs"
                        onClick={() => ops.setTestResult(build.id, t.label, "pass")}
                      >
                        Pass
                      </Button>
                      <Button
                        size="sm"
                        variant={t.result === "fail" ? "destructive" : "outline"}
                        className="h-7 px-2 text-xs"
                        onClick={() => ops.setTestResult(build.id, t.label, "fail")}
                      >
                        Fail
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="QA sign-off" hint={build.qaResult ? `Result: ${titleCase(build.qaResult)}` : "Pending"}>
            <div className="divide-y divide-border/60">
              {build.qa.map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="text-[13px] text-foreground">{c.label}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={c.passed === true ? "default" : "outline"}
                      className="h-7 px-2 text-xs"
                      onClick={() => store.toggleQaCheck(build.id, c.label, true)}
                    >
                      <Check className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={c.passed === false ? "destructive" : "outline"}
                      className="h-7 px-2 text-xs"
                      onClick={() => store.toggleQaCheck(build.id, c.label, false)}
                    >
                      Fail
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => store.toggleQaCheck(build.id, c.label, null)}
                    >
                      <CircleDashed className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border p-4">
              <DemoNote className="flex-1">
                Finalizing QA records a pass/fail result and moves the build to "Ready" on pass.
              </DemoNote>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canFinalizeQa}
                  onClick={() => {
                    store.finalizeQa(build.id, allQaPassed ? "pass" : "fail");
                    ops.signQa(build.id, o.qaStaff !== "Unassigned" ? o.qaStaff : store.user?.name ?? "QA Staff");
                    toast.success(`QA finalized: ${allQaPassed ? "pass" : "fail"}`);
                  }}
                >
                  Finalize QA
                </Button>
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Assignment">
            <div className="space-y-3 p-4">
              <div className="space-y-1.5">
                <TechLabel>Technician</TechLabel>
                <Select
                  value={build.technician}
                  onValueChange={(v) => {
                    store.updateBuild(build.id, { technician: v });
                    ops.assignBuildStaff(build.id, { technician: v });
                  }}
                >
                  <SelectTrigger className="h-8 text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TECHS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <TechLabel>QA staff</TechLabel>
                <Select value={o.qaStaff} onValueChange={(v) => ops.assignBuildStaff(build.id, { qaStaff: v })}>
                  <SelectTrigger className="h-8 text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TECHS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {o.qaSignedAt && (
                <p className="mono text-[11px] text-subtle">Signed {dateTime(o.qaSignedAt)}</p>
              )}
            </div>
          </Section>

          <Section title="Links">
            <KeyValueGrid
              cols={2}
              items={[
                {
                  label: "Quote",
                  value: build.quoteId ? (
                    <IdLink to="/quotes/$quoteId" params={{ quoteId: build.quoteId }}>
                      {build.quoteId}
                    </IdLink>
                  ) : (
                    "—"
                  ),
                },
                {
                  label: "Order",
                  value: build.orderId ? (
                    <IdLink to="/orders/$orderId" params={{ orderId: build.orderId }}>
                      {build.orderId}
                    </IdLink>
                  ) : (
                    "—"
                  ),
                },
                {
                  label: "Customer",
                  value: build.customerId ? (
                    <IdLink to="/customers/$customerId" params={{ customerId: build.customerId }}>
                      {build.customerName}
                    </IdLink>
                  ) : (
                    build.customerName
                  ),
                },
              ]}
            />
          </Section>

          {build.notes && (
            <Section title="Notes">
              <p className="p-4 text-[13px] text-muted-foreground">{build.notes}</p>
            </Section>
          )}
        </div>
      </div>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel {build.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              The build will be marked cancelled and dropped from the active pipeline. Parts stay reserved until
              released elsewhere.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep build</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                store.setBuildStatus(build.id, "cancelled");
                toast.success(`${build.id} cancelled.`);
              }}
            >
              Cancel build
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={removing !== null} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove component?</AlertDialogTitle>
            <AlertDialogDescription>
              {removing
                ? `${store.productById(removing)?.name ?? removing} will be removed from ${build.id}.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep part</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (removing) {
                  store.removeBuildComponent(build.id, removing);
                  toast.success(`Removed from ${build.id}.`);
                }
                setRemoving(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
