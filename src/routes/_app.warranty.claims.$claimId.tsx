import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Clock, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, IdLink, Mono } from "@/components/nexus/primitives";
import { KeyValueGrid, Section, DemoNote } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { dateTime } from "@/lib/format";
import type { WarrantyClaim } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/warranty/claims/$claimId")({
  head: () => ({
    meta: [
      { title: "Claim — DPC Nexus" },
      { name: "description", content: "Warranty claim workflow and history." },
      { property: "og:title", content: "Claim — DPC Nexus" },
      { property: "og:description", content: "Warranty claim workflow and history." },
    ],
  }),
  component: ClaimDetailPage,
});

const RESOLUTIONS = ["replacement", "repair", "refund", "store_credit"] as const;

function ClaimDetailPage() {
  const { claimId } = Route.useParams();
  const { claims, warranties, customerById, updateClaim } = useStore();

  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [resolution, setResolution] = useState<string>("replacement");
  const [note, setNote] = useState("");

  const claim: WarrantyClaim | undefined = claims.find((c) => c.id === claimId);
  const warranty = warranties.find((w) => w.id === claim?.warrantyId);
  const customer = warranty ? customerById(warranty.customerId) : undefined;

  if (!claim) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Claim" description="Warranty claim workflow and history." />
        <Panel>
          <EmptyState
            title="Claim not found"
            description={`No warranty claim with id "${claimId}".`}
            action={
              <Button asChild size="sm" variant="outline">
                <Link to="/warranty">Back to warranty registry</Link>
              </Button>
            }
          />
        </Panel>
      </div>
    );
  }

  const canReview = claim.status === "open";
  const canDecide = claim.status === "in_review";
  const canClose = claim.status === "approved" || claim.status === "rejected";
  const terminal = claim.status === "closed";

  const submitDecision = () => {
    if (!note.trim()) {
      toast.error("Add a resolution note before deciding this claim.");
      return;
    }
    if (decision === "approve") {
      updateClaim(
        claim.id,
        { status: "approved", resolution, resolutionNote: note.trim() },
        `Claim approved — ${resolution.replace(/_/g, " ")}`,
      );
      toast.success("Claim approved.");
    } else {
      updateClaim(claim.id, { status: "rejected", resolutionNote: note.trim() }, "Claim rejected");
      toast.warning("Claim rejected.");
    }
    setDecision(null);
    setNote("");
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={claim.id}
        description="Warranty claim workflow and history."
        status={<StatusBadge status={claim.status} />}
        actions={
          <>
            {canReview && (
              <Button
                size="sm"
                onClick={() => {
                  updateClaim(claim.id, { status: "in_review" }, "Review started");
                  toast.success("Claim moved to review.");
                }}
              >
                <Clock className="size-3.5" /> Start review
              </Button>
            )}
            {canDecide && (
              <>
                <Button size="sm" variant="outline" onClick={() => setDecision("reject")}>
                  <ThumbsDown className="size-3.5" /> Reject
                </Button>
                <Button size="sm" onClick={() => setDecision("approve")}>
                  <ThumbsUp className="size-3.5" /> Approve
                </Button>
              </>
            )}
            {canClose && (
              <Button
                size="sm"
                onClick={() => {
                  updateClaim(claim.id, { status: "closed" }, "Claim closed");
                  toast.success("Claim closed.");
                }}
              >
                <Check className="size-3.5" /> Close claim
              </Button>
            )}
          </>
        }
      />

      <Section title="Details">
        <KeyValueGrid
          cols={3}
          items={[
            { label: "Warranty", value: <IdLink to="/warranty/$warrantyId" params={{ warrantyId: claim.warrantyId }}>{claim.warrantyId}</IdLink> },
            {
              label: "Serial",
              value: warranty?.serial ? (
                <Link
                  to="/serials"
                  search={{ serial: warranty.serial }}
                  className="mono underline decoration-border underline-offset-2 hover:text-foreground"
                >
                  {warranty.serial}
                </Link>
              ) : (
                "—"
              ),
            },
            { label: "Product", value: warranty?.productName ?? "—" },
            {
              label: "Customer",
              value: customer ? (
                <IdLink to="/customers/$customerId" params={{ customerId: customer.id }}>{customer.name}</IdLink>
              ) : (
                warranty?.customerName ?? "—"
              ),
            },
            {
              label: "Order",
              value: warranty ? (
                <IdLink to="/orders/$orderId" params={{ orderId: warranty.orderId }}>{warranty.orderId}</IdLink>
              ) : (
                "—"
              ),
            },
            { label: "Filed", value: dateTime(claim.createdAt) },
          ]}
        />
      </Section>

      <Section title="Issue" hint="Reported by the customer">
        <p className="px-4 py-3 text-[13px] text-foreground">{claim.reason}</p>
      </Section>

      <Section
        title="Resolution"
        hint={claim.status === "open" || claim.status === "in_review" ? "Pending decision" : undefined}
      >
        {claim.status === "open" || claim.status === "in_review" ? (
          <div className="px-4 py-3">
            <DemoNote>
              Start review, then approve or reject the claim. Approval records a resolution (replacement, repair,
              refund or store credit) and a note from the technician.
            </DemoNote>
          </div>
        ) : (
          <div className="space-y-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="label-tech">Outcome</span>
              <StatusBadge
                status={claim.status}
                label={claim.resolution ? claim.resolution.replace(/_/g, " ") : claim.status === "approved" ? "Approved" : "Not covered"}
              />
            </div>
            {claim.resolutionNote && (
              <p className="rounded-md border border-border bg-elevated px-3 py-2 text-[13px] text-foreground">
                {claim.resolutionNote}
              </p>
            )}
          </div>
        )}
      </Section>

      <Section title="Timeline" hint={`${claim.timeline.length} events`}>
        {claim.timeline.length === 0 ? (
          <EmptyState title="No timeline events" description="Activity for this claim will appear here." />
        ) : (
          <ol className="space-y-0 px-4 py-3">
            {claim.timeline.map((ev, i) => (
              <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                <span
                  className={cn(
                    "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    i === claim.timeline.length - 1
                      ? "border-info/40 bg-info/10 text-info"
                      : "border-border bg-elevated text-muted-foreground",
                  )}
                >
                  {i === claim.timeline.length - 1 ? <Check className="size-3" /> : <span className="size-1.5 rounded-full bg-current" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-foreground">{ev.label}</p>
                  <p className="mono mt-0.5 text-[10.5px] text-muted-foreground">
                    {dateTime(ev.at)}
                    {ev.actor ? ` · ${ev.actor}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <Dialog open={decision !== null} onOpenChange={(o) => !o && setDecision(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision === "approve" ? "Approve claim" : "Reject claim"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {decision === "approve" && (
              <div className="space-y-1.5">
                <Label htmlFor="claim-resolution">Resolution</Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger id="claim-resolution" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOLUTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="claim-note">Resolution note</Label>
              <Textarea
                id="claim-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  decision === "approve"
                    ? "What will be done (RMA, repair plan, refund path…)?"
                    : "Why is this claim not covered?"
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecision(null)}>Cancel</Button>
            <Button variant={decision === "reject" ? "destructive" : "default"} onClick={submitDecision}>
              {decision === "approve" ? <ThumbsUp className="size-3.5" /> : <X className="size-3.5" />}
              {decision === "approve" ? "Approve claim" : "Reject claim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
