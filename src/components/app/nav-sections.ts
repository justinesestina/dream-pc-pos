import { useCallback, useEffect, useState } from "react";

const NAV_SECTIONS_KEY = "dpc-nav-sections";
const DEFAULT_EXPANDED = new Set(["Overview", "Sales"]);

/** The persisted expanded/collapsed state for the sidebar's sections. */
export function useNavSections() {
  const [state, setState] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(NAV_SECTIONS_KEY);
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(NAV_SECTIONS_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [state]);

  const isCollapsed = (label: string) => state[label] ?? !DEFAULT_EXPANDED.has(label);
  const setCollapsed = useCallback((label: string, value: boolean) => {
    setState((prev) => ({ ...prev, [label]: value }));
  }, []);
  const toggle = useCallback((label: string) => {
    setState((prev) => ({ ...prev, [label]: !(prev[label] ?? !DEFAULT_EXPANDED.has(label)) }));
  }, []);

  return { isCollapsed, setCollapsed, toggle };
}
