import { useEffect, useState } from "react";
import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { CommandPalette } from "@/components/app/command-palette";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const store = useStore();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // DEMO auth gate — UI-level only, not security.
  useEffect(() => {
    if (store.hydrated && !store.user) void navigate({ to: "/", replace: true });
  }, [store.hydrated, store.user, navigate]);

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
        void navigate({ to: "/pos" });
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
        <p className="mono animate-pulse text-xs text-subtle">INITIALIZING DPC NEXUS…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar onOpenPalette={() => setPaletteOpen(true)} />
        <main key={pathname} className="animate-enter min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
