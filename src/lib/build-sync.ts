import type { BuildStatus } from "./types";

type BuildStatusListener = (buildId: string, status: BuildStatus) => void;

const listeners = new Set<BuildStatusListener>();

export function onBuildStatus(listener: BuildStatusListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitBuildStatus(buildId: string, status: BuildStatus): void {
  for (const listener of listeners) listener(buildId, status);
}
