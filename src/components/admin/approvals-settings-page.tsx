import { GitBranch, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState } from "@/components/nexus/primitives";
import { SectionCard } from "@/components/admin/users/panels";

const CHAINS = [
  { module: "Purchase Orders", steps: ["Manager", "Administrator", "Owner"] },
  { module: "Expense Requests", steps: ["Manager", "Accountant"] },
  { module: "Stock Transfers", steps: ["Inventory Staff", "Manager"] },
  { module: "Inventory Adjustments", steps: ["Inventory Staff", "Manager", "Administrator"] },
];

export function ApprovalsSettingsPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Workflow Settings"
        description="Define who reviews and approves each kind of request. Chains apply to every new request."
      />

      <Panel>
        <PanelHeader
          title="Approval chains"
          hint="Requests move through each step in order until fully approved."
        />
        <EmptyState
          title="No approval workflows configured"
          description="Workflow editing will be enabled once the approval engine exposes its settings endpoints. The intended chains are shown below."
          icon={Settings2}
        />
        <div className="grid gap-3 border-t border-border p-4 sm:grid-cols-2">
          {CHAINS.map((c) => (
            <SectionCard key={c.module} title={c.module} description="Approval order">
              <div className="flex flex-wrap items-center gap-2">
                {c.steps.map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="label-tech rounded border border-border bg-elevated px-2 py-1 text-foreground">
                      {step}
                    </span>
                    {i < c.steps.length - 1 && (
                      <GitBranch className="size-3.5 rotate-90 text-subtle" />
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      </Panel>
    </div>
  );
}
