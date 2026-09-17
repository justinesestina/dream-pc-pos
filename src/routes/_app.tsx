import { useEffect, useRef, useState } from "react";
import {
  Outlet,
  createFileRoute,
  useNavigate,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { CommandPalette } from "@/components/app/command-palette";
import { ScrollProgress } from "@/components/nexus/motion";
import { useStore } from "@/lib/store";
import { can, capForPath, homeFor } from "@/lib/permissions";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const store = useStore();
  const router = useRouter();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const syncedUserId = useRef<string | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Refresh only the current page — reloads the active route's loaders and
  // remounts its component, leaving the sidebar/topbar and other pages alone.
  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    const started = performance.now();
    try {
      await router.invalidate();
      setRefreshTick((t) => t + 1);
    } finally {
      const wait = Math.max(0, 400 - (performance.now() - started));
      window.setTimeout(() => setRefreshing(false), wait);
    }
  };

  // DEMO auth gate — UI-level only, not security.
  useEffect(() => {
    if (store.hydrated && !store.user) void navigate({ to: "/", replace: true });
    else if (store.hydrated && store.user) {
      if (syncedUserId.current !== store.user.id) {
        syncedUserId.current = store.user.id;
        void store.syncWithBackend();
      }
    }
  }, [store.hydrated, store.user?.id, navigate]);

  // Per-role access control: block direct URLs to sections the role cannot use.
  useEffect(() => {
    if (!store.hydrated || !store.user) return;
    const cap = capForPath(pathname);
    if (cap && !can(store.user.role, cap)) {
      toast.error(
        `${store.user.name}, that page is outside the ${homeFor(store.user.role)} scope.`,
      );
      void navigate({ to: homeFor(store.user.role), replace: true });
    }
  }, [store.hydrated, store.user, pathname, navigate]);

  // Smooth scroll to top on navigation.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const lenis = (
      window as Window & {
        __lenis?: { scrollTo: (t: number, o?: { immediate?: boolean }) => void };
      }
    ).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [pathname]);

  // Keyboard-first operation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (e.key === "F1") {
        e.preventDefault();
        void navigate({ to: "/orders" });
      }
      if (e.key === "F2") {
        e.preventDefault();
        const el = document.querySelector<HTMLInputElement>("[data-pos-search]");
        if (el) el.focus();
        else setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  if (!store.hydrated || !store.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="mono animate-pulse text-xs text-subtle">INITIALIZING DPC POS…</p>
      </div>
    );
  }

  return (
    <div className="isolate flex min-h-screen bg-background">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[-10]">
        <div className="bg-anim-aurora ambient-glow absolute inset-0 opacity-70" />
        <div className="bg-anim-grid grid-backdrop absolute inset-0 opacity-[0.08]" />
      </div>
      <ScrollProgress />
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          onOpenPalette={() => setPaletteOpen(true)}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
        <main key={`${pathname}|${refreshTick}`} className="animate-enter min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
