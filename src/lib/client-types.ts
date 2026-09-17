import { Building2, Home, User } from "lucide-react";
import type { ClientType } from "./types";

export interface ClientTypeInfo {
  id: ClientType;
  label: string;
  code: string;
  icon: typeof User;
}

/** A sale with no registered client detail — the default classification. */
export const WALK_IN_CLIENT_TYPE: ClientTypeInfo = {
  id: "walk-in",
  label: "Walk-in",
  code: "WICE-CS26-80001",
  icon: User,
};

/** The three client classifications a sale can be attributed to. */
export const CLIENT_TYPES: ClientTypeInfo[] = [
  WALK_IN_CLIENT_TYPE,
  { id: "business", label: "Business", code: "BCCE-CS26-80001", icon: Building2 },
  { id: "household", label: "Household", code: "HHCE-CS26-80001", icon: Home },
];

export function clientTypeInfo(id: ClientType): ClientTypeInfo {
  return CLIENT_TYPES.find((t) => t.id === id) ?? WALK_IN_CLIENT_TYPE;
}