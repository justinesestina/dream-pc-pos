import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Bell,
  Building2,
  Check,
  Database,
  FileText,
  Palette,
  Percent,
  Shield,
  X,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState } from "@/components/nexus/primitives";
import { KeyValueGrid, DemoNote } from "@/components/nexus/detail";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { useStore } from "@/lib/store";
import { useOps } from "@/lib/ops-store";
import { can, roleLabels, type Capability } from "@/lib/permissions";
import { VAT_RATE, dateTime, relative } from "@/lib/format";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — DPC Nexus" },
      { name: "description", content: "Store profile, appearance, tax, roles, notifications and demo system info." },
      { property: "og:title", content: "Settings — DPC Nexus" },
      { property: "og:description", content: "Store profile, appearance, tax, roles, notifications and demo system info." },
    ],
  }),
  component: SettingsPage,
});

const ALL_ROLES: Role[] = ["owner", "admin", "cashier", "inventory"];
const ALL_CAPS: Capability[] = [
  "pos",
  "orders",
  "quotes",
  "customers",
  "products",
  "inventory",
  "inventory.adjust",
  "builds",
  "builds.qa",
  "assembly",
  "services",
  "warranty",
  "reports",
  "settings",
  "costs",
  "purchasing",
  "receiving",
  "returns",
  "shifts",
  "audit",
  "releases",
  "documents",
];

const SECTIONS = [
  { id: "general", label: "General", icon: Building2, cap: "settings" },
  { id: "appearance", label: "Appearance", icon: Palette, cap: "settings" },
  { id: "tax", label: "VAT & tax", icon: Percent, cap: "settings" },
  { id: "roles", label: "Roles & permissions", icon: Shield, cap: "settings" },
  { id: "notifications", label: "Notifications", icon: Bell, cap: "settings" },
  { id: "documents", label: "Documents", icon: FileText, cap: "documents" },
  { id: "system", label: "System & demo", icon: Database, cap: "settings" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function SettingsPage() {
  const store = useStore();
  const ops = useOps();
  const role = store.user?.role ?? "owner";
  const [section, setSection] = useState<SectionId>("general");
  const [profile, setProfile] = useState({
    name: "Dream PC Build & IT Solutions",
    address: "88 Marcos Highway, Cainta, Rizal, Philippines",
    phone: "+63 917 000 1234",
    email: "hello@dpcnexus.local",
  });

  if (!can(role, "settings")) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Settings" description="Store profile, roles, tax rules and preferences." />
        <Panel>
          <EmptyState
            title="No access to settings"
            description={`The ${roleLabels[role]} role does not include the settings capability. Sign in as an Owner or Admin to manage store settings.`}
          />
        </Panel>
      </div>
    );
  }

  const unread = store.notifications.filter((n) => !n.read).length;
  const visibleSections = SECTIONS.filter((s) => can(role, s.cap));
  const activeSection =
    visibleSections.find((s) => s.id === section) ?? visibleSections[0] ?? SECTIONS[0];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Settings" description="Store profile, roles, tax rules and preferences." />

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav
          aria-label="Settings sections"
          className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
        >
          {visibleSections.map((s) => {
            const active = activeSection.id === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-md border px-2.5 py-2 text-left text-[13px] transition-colors",
                  active
                    ? "border-info/30 bg-info/10 text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-elevated hover:text-foreground",
                )}
              >
                <s.icon className="size-4 shrink-0 text-subtle" />
                <span className="truncate">{s.label}</span>
                {s.id === "notifications" && unread > 0 && (
                  <span className="mono ml-auto size-5 shrink-0 rounded-full bg-info/15 text-center text-[10px] leading-5 text-info">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 space-y-5" key={activeSection.id}>
          {activeSection.id === "general" && <GeneralSection store={store} ops={ops} />}
          {activeSection.id === "appearance" && <AppearanceSection store={store} />}
          {activeSection.id === "tax" && <TaxSection />}
          {activeSection.id === "roles" && <RolesSection />}
          {activeSection.id === "notifications" && <NotificationsSection store={store} />}
          {activeSection.id === "documents" && <DocumentsSection />}
          {activeSection.id === "system" && <SystemSection store={store} ops={ops} />}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ sections */

function GeneralSection({
  store,
  ops,
}: {
  store: ReturnType<typeof useStore>;
  ops: ReturnType<typeof useOps>;
}) {
  const [profile, setProfile] = useState({
    name: "Dream PC Build & IT Solutions",
    address: "88 Marcos Highway, Cainta, Rizal, Philippines",
    phone: "+63 917 000 1234",
    email: "hello@dpcnexus.local",
  });
  return (
    <>
      <Panel>
        <PanelHeader title="Store profile" hint="Business details shown on receipts and documents" />
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="store-name" className="label-tech">
              Store name
            </Label>
            <Input
              id="store-name"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="store-email" className="label-tech">
              Contact email
            </Label>
            <Input
              id="store-email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="store-phone" className="label-tech">
              Contact phone
            </Label>
            <Input
              id="store-phone"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="store-address" className="label-tech">
              Address
            </Label>
            <Input
              id="store-address"
              value={profile.address}
              onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
            />
          </div>
        </div>
        <div className="px-4 pb-4">
          <DemoNote>
            Store profile edits are held in local component state only — nothing is persisted. Wire
            this form to a settings API to make changes durable.
          </DemoNote>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Active session" hint="Currently signed-in user" />
        {store.user ? (
          <KeyValueGrid
            cols={2}
            items={[
              { label: "Name", value: store.user.name },
              { label: "Email", value: store.user.email, mono: true },
              { label: "Role", value: roleLabels[store.user.role] },
              { label: "Initials", value: store.user.initials },
            ]}
          />
        ) : (
          <div className="p-4 text-sm text-muted-foreground">No user signed in.</div>
        )}
        {ops.actor && (
          <div className="px-4 pb-4">
            <DemoNote>Operations store acting user: {ops.actor}.</DemoNote>
          </div>
        )}
      </Panel>
    </>
  );
}

function AppearanceSection({ store }: { store: ReturnType<typeof useStore> }) {
  return (
    <Panel>
      <PanelHeader title="Appearance & preferences" hint="Workspace layout" />
      <div className="divide-y divide-border/60">
        <div className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-[13px] text-foreground">Collapse sidebar</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Show icon-only navigation to maximize workspace. Persisted across sessions.
            </p>
          </div>
          <Switch
            checked={store.sidebarCollapsed}
            onCheckedChange={(v) => store.setSidebarCollapsed(v)}
          />
        </div>
      </div>
      <div className="px-4 pb-4">
        <DemoNote>
          The visual theme is a fixed dark, minimalist, engineering-inspired design. A light-mode
          theme toggle is not part of the current demo.
        </DemoNote>
      </div>
    </Panel>
  );
}

function TaxSection() {
  return (
    <Panel>
      <PanelHeader title="VAT & tax" hint={`Value-added tax is ${(VAT_RATE * 100).toFixed(0)}%`} />
      <div className="p-4">
        <KeyValueGrid
          cols={3}
          items={[
            { label: "VAT rate", value: `${(VAT_RATE * 100).toFixed(0)}%`, mono: true },
            { label: "Base (ex-VAT)", value: `${((1 / (1 + VAT_RATE)) * 100).toFixed(1)}% of gross` },
            { label: "Rounding", value: "2 decimal places" },
          ]}
        />
      </div>
      <div className="px-4 pb-4">
        <DemoNote>
          The VAT rate is a compile-time constant shared by the POS, quotes, builds, orders and
          receipts. Editing it requires a code change in this demo build.
        </DemoNote>
      </div>
    </Panel>
  );
}

function RolesSection() {
  return (
    <Panel>
      <PanelHeader title="Role & permissions matrix" hint="UI-level capability map — not real authorization" />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="label-tech px-4 py-2.5 font-normal">
                Capability
              </th>
              {ALL_ROLES.map((r) => (
                <th key={r} scope="col" className="label-tech px-3 py-2.5 text-center font-normal">
                  {roleLabels[r]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_CAPS.map((cap) => (
              <tr key={cap} className="border-b border-border/60 last:border-0">
                <td className="mono px-4 py-2 text-xs text-foreground">{cap}</td>
                {ALL_ROLES.map((r) => (
                  <td key={r} className="px-3 py-2 text-center">
                    {can(r, cap) ? (
                      <Check className="mx-auto size-3.5 text-success" />
                    ) : (
                      <X className="mx-auto size-3.5 text-subtle" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 pb-4">
        <DemoNote>
          Capabilities gate navigation, page access and actions. They are enforced only in the UI —
          a real backend would need to enforce them server-side.
        </DemoNote>
      </div>
    </Panel>
  );
}

function NotificationsSection({ store }: { store: ReturnType<typeof useStore> }) {
  const unread = store.notifications.filter((n) => !n.read).length;
  return (
    <Panel>
      <PanelHeader
        title="Notifications"
        hint={`${store.notifications.length} on file · ${unread} unread`}
        action={
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={unread === 0}
            onClick={() => {
              store.markAllNotificationsRead();
              toast.success("All notifications marked as read.");
            }}
          >
            Mark all read
          </Button>
        }
      />
      <div className="divide-y divide-border/60">
        {store.notifications.slice(0, 8).map((n) => (
          <div key={n.id} className="flex items-start gap-3 px-4 py-2.5">
            <span
              className={cn(
                "mono mt-1.5 size-1.5 shrink-0 rounded-full",
                n.read ? "bg-border" : "bg-info",
              )}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="truncate text-[13px] text-foreground">{n.title}</p>
              <p className="line-clamp-2 text-[11.5px] text-muted-foreground">{n.body}</p>
              <p className="mono mt-0.5 text-[10px] text-subtle">
                {n.kind} · {relative(n.at)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4">
        <DemoNote>
          Notifications are generated by demo workflows (stock, builds, quotes, warranty, services,
          payments). No push or e-mail delivery is performed.
        </DemoNote>
      </div>
    </Panel>
  );
}

function DocumentsSection() {
  return (
    <Panel>
      <PanelHeader title="Documents & printing" hint="Receipts, quotations, POs and handover notes" />
      <div className="space-y-3 p-4">
        <KeyValueGrid
          cols={2}
          items={[
            { label: "Print engine", value: "Browser print (window.print)" },
            { label: "Paper", value: "A4 · 80mm receipt-friendly layout" },
            { label: "Demo marker", value: "Every document is stamped DEMO" },
            { label: "Thermal printer", value: "Not connected" },
          ]}
        />
        <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
          <li>Receipts &amp; invoices print from order detail or the Documents register.</li>
          <li>Quotations print from quote detail.</li>
          <li>Purchase orders print from PO detail.</li>
          <li>Service tickets print from ticket detail.</li>
          <li>Release / handover notes print from release detail.</li>
        </ul>
      </div>
      <div className="px-4 pb-4">
        <DemoNote>
          Documents are rendered from local demo data and printed through the browser — no BIR-accredited
          receipt, e-invoicing or thermal printer integration is performed.
        </DemoNote>
      </div>
    </Panel>
  );
}

function SystemSection({
  store,
  ops,
}: {
  store: ReturnType<typeof useStore>;
  ops: ReturnType<typeof useOps>;
}) {
  const totalProducts = store.products.length;
  const serials = store.serials.length;
  const orders = store.orders.length;
  const builds = store.builds.length;
  const tickets = store.services.length;
  const suppliers = ops.suppliers.length;
  const releases = ops.releases.length;
  const shifts = ops.shifts.length;

  return (
    <>
      <Panel>
        <PanelHeader title="Demo data volumes" hint="Seeded in localStorage" />
        <div className="p-4">
          <KeyValueGrid
            cols={4}
            items={[
              { label: "Products", value: totalProducts, mono: true },
              { label: "Serials", value: serials, mono: true },
              { label: "Orders", value: orders, mono: true },
              { label: "Builds", value: builds, mono: true },
              { label: "Service tickets", value: tickets, mono: true },
              { label: "Suppliers", value: suppliers, mono: true },
              { label: "Shifts", value: shifts, mono: true },
              { label: "Releases", value: releases, mono: true },
              { label: "Notifications", value: store.notifications.length, mono: true },
            ]}
          />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Storage & runtime" hint="Where demo state lives" />
        <KeyValueGrid
          cols={2}
          items={[
            { label: "Retail store key", value: "dpc-nexus-demo-v1", mono: true },
            { label: "Operations store key", value: "dpc-nexus-ops-v1", mono: true },
            { label: "Persistence", value: "localStorage (per browser)" },
            { label: "Auth", value: "Demo roles only — no real auth" },
            { label: "Backend", value: "None — everything is local" },
            { label: "Last activity", value: store.auditLogs[0] ? dateTime(store.auditLogs[0].at) : "—" },
          ]}
        />
      </Panel>

      <Panel>
        <PanelHeader title="Demo data controls" hint="Reset all local demo state" />
        <div className="flex items-center justify-between gap-3 p-4">
          <p className="max-w-md text-xs text-muted-foreground">
            Restores every module — orders, inventory, builds, services, purchasing, shifts, returns,
            releases and assembly state — to the original seeded demo dataset. Your signed-in session is
            preserved.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Reset demo data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This clears every change made in this demo session — orders, inventory adjustments,
                  builds, service tickets, purchasing, shifts, returns, releases and assembly state — and
                  reseeds the original dataset. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    store.resetDemoData();
                    ops.resetOpsData();
                    toast.success("Demo data has been reset.");
                  }}
                >
                  Reset data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Panel>
    </>
  );
}
