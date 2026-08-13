import type { BuildStatus, OrderStatus, ServiceStatus } from "./types";

/**
 * Propagates a completed release back onto its source entity so the
 * handover workflow stays consistent across the two demo stores.
 * DEMO ONLY — the real backend would do this in one transaction.
 */
export function completeReleaseSource(
  updateOrderStatus: (id: string, status: OrderStatus) => void,
  setBuildStatus: (id: string, status: BuildStatus) => void,
  setServiceStatus: (id: string, status: ServiceStatus) => void,
  kind: "build" | "service" | "order",
  refId: string,
) {
  if (kind === "build") setBuildStatus(refId, "released");
  else if (kind === "service") setServiceStatus(refId, "released");
  else updateOrderStatus(refId, "completed");
}
