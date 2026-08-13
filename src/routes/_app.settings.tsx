import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader } from "@/components/nexus/primitives";
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
import { EmptyState } from "@/components/nexus/primitives";
import { VAT_RATE } from "@/lib/format";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — DPC Nexus" },
      { name: "description", content: "Store profile, roles, tax rules and preferences." },
      { property: "og:title", content: "Settings — DPC Nexus" },
      { property: "og:description", content: "Store profile, roles, tax rules and preferences." },
    ],
  }),
  component: SettingsPage,
});

const ALL_ROLES: Role[] = ["owner", "admin", "cashier", "technician", "inventory"];
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
  "services",
  "warranty",
  "reports",
  "settings",
  "costs",
  "purchasing",
  "receiving",
  "returns",
  "shifts",
  "consultations",
  "tasks",
  "staff",
  "audit",
  "releases",
  "documents",
];

function SettingsPage() {
  const store = useStore();
  const ops = useOps();
  const [profile, setProfile] = useState({
    name: "Dream PC Build & IT Solutions",
    address: "88 Marcos Highway, Cainta, Rizal, Philippines",
    phone: "+63 917 000 1234",
    email: "hello@dpcnexus.local",
  });

  if (!can(store.user?.role ?? "owner", "settings")) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader
          title="Settings"
          description="Store profile, roles, tax rules and preferences."
        />
        <Panel>
          <EmptyState
            title="No access to settings"
            description={`The ${roleLabels[store.user?.role ?? "owner"]} role does not include the settings capability. Sign in as an Owner or Admin to manage store settings.`}
          />
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Settings" description="Store profile, roles, tax rules and preferences." />

      <Panel>
        <PanelHeader
          title="Store profile"
          hint="Business details shown on receipts and documents"
        />
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
            <Label htmlFor="store-vat" className="label-tech">
              VAT rate
            </Label>
            <Input id="store-vat" value={`${(VAT_RATE * 100).toFixed(0)}%`} disabled />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
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
        <PanelHeader
          title="Role & permissions matrix"
          hint="UI-level capability map — not real authorization"
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="label-tech px-4 py-2.5 font-normal">
                  Capability
                </th>
                {ALL_ROLES.map((r) => (
                  <th
                    key={r}
                    scope="col"
                    className="label-tech px-3 py-2.5 text-center font-normal"
                  >
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
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Appearance & preferences" />
          <div className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-[13px] text-foreground">Collapse sidebar</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Show icon-only navigation to maximize workspace.
              </p>
            </div>
            <Switch
              checked={store.sidebarCollapsed}
              onCheckedChange={(v) => store.setSidebarCollapsed(v)}
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Session" hint="Currently signed-in user" />
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
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Demo data controls" hint="Reset all local demo state" />
        <div className="flex items-center justify-between gap-3 p-4">
          <p className="max-w-md text-xs text-muted-foreground">
            Restores every module — orders, inventory, builds, services, purchasing, shifts,
            returns, consultations and tasks — to the original seeded demo dataset. Your signed-in
            session is preserved.
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
                  This clears every change made in this demo session — orders, inventory
                  adjustments, builds, service tickets, purchasing, shifts, returns, consultations
                  and tasks — and reseeds the original dataset. This cannot be undone.
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
    </div>
  );
}
