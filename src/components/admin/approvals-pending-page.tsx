import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState } from "@/components/nexus/primitives";
import { Toolbar, SearchInput, FilterSelect } from "@/components/nexus/toolbar";

const TYPES = [
  { value: "purchase_order", label: "Purchase Orders" },
  { value: "expense_request", label: "Expense Requests" },
  { value: "stock_transfer", label: "Stock Transfers" },
  { value: "inventory_adjustment", label: "Inventory Adjustments" },
];

export function ApprovalsPendingPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Pending Approvals"
        description="Central queue for requests that need review across purchasing, expenses and inventory."
      />

      <Panel>
        <PanelHeader
          title="Approval queue"
          hint="Requests route here automatically based on the configured workflows."
        />
        <Toolbar>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search reference, requester or amount…"
          />
          <FilterSelect value={type} onChange={setType} options={TYPES} label="TYPE" />
          <FilterSelect
            value={status}
            onChange={setStatus}
            options={[
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ]}
            label="STATUS"
          />
        </Toolbar>
        <EmptyState
          title="No pending approvals"
          description="Approval requests from purchase orders, expenses, stock transfers and inventory adjustments will appear here once those modules start submitting them."
          icon={ClipboardCheck}
        />
      </Panel>
    </div>
  );
}
