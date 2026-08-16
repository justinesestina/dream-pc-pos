import type { AssemblyStageId } from "./ops-types";
import type { BuildStatus } from "./types";

/**
 * Bidirectional map between the build "status" (sales-facing, main store)
 * and the assembly "stage" (workshop-facing, ops store). These two views
 * live in separate demo stores, so every change on one side must be
 * mirrored onto the other to keep boards and status badges consistent.
 *
 * DEMO ONLY — a real backend would expose a single state machine.
 */
export const STAGE_TO_STATUS: Record<AssemblyStageId, BuildStatus> = {
  quote: "quoted",
  approved: "approved",
  parts_reserved: "parts_reserved",
  assembly: "assembly",
  cable_management: "assembly",
  bios: "assembly",
  os_install: "assembly",
  drivers: "assembly",
  testing: "testing",
  qa: "testing",
  ready: "ready",
  release: "ready",
  released: "released",
};

export const STATUS_TO_STAGE: Partial<Record<BuildStatus, AssemblyStageId>> = {
  quoted: "quote",
  approved: "approved",
  parts_reserved: "parts_reserved",
  assembly: "assembly",
  testing: "testing",
  ready: "ready",
  released: "released",
};

/** Status for a stage — returns undefined so cancelled/draft states are never overwritten. */
export function statusForStage(stage: AssemblyStageId): BuildStatus | undefined {
  return STAGE_TO_STATUS[stage];
}

/** Stage for a status — falls back to the previous stage when a status has no stage. */
export function stageForStatus(status: BuildStatus, currentStage: AssemblyStageId): AssemblyStageId {
  return STATUS_TO_STAGE[status] ?? currentStage;
}
