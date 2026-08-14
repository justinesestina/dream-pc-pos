import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, IdLink, Mono } from "@/components/nexus/primitives";
import { Section, KeyValueGrid, DemoNote } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
import { PrintButton } from "@/components/nexus/document";
import { Timeline } from "@/components/nexus/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOps } from "@/lib/ops-store";
import { useStore } from "@/lib/store";
import { completeReleaseSource } from "@/lib/release-complete";
import { dateTime, titleCase } from "@/lib/format";
import type { ReleaseRecord } from "@/lib/ops-types";
import type { TimelineEvent } from "@/lib/types";

export const Route = createFileRoute("/_app/releases/$releaseId")({
  head: () => ({
    meta: [
      { title: "Release detail — DPC Nexus" },
      { name: "description", content: "Pickup and delivery handover record." },
      { property: "og:title", content: "Release detail — DPC Nexus" },
      { property: "og:description", content: "Pickup and delivery handover record." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReleasesReleaseidPage,
});

const REF_ROUTE: Record<ReleaseRecord["kind"], string> = {
  build: "/builds/$buildId",
  service: "/services/$ticketId",
  order: "/orders/$orderId",
};
const REF_PARAM: Record<ReleaseRecord["kind"], string> = {
  build: "buildId",
  service: "ticketId",
  order: "orderId",
};

function ReleasesReleaseidPage() {
  const { releaseId } = Route.useParams();
  const ops = useOps();
  const store = useStore();
  const release = ops.releases.find((r) => r.id === releaseId);
  const [receivedBy, setReceivedBy] = useState("");

  if (!release) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Release detail" description="Pickup and delivery handover record." />
        <Panel>
          <EmptyState
            title="Release not found"
            description={`No release record matches "${releaseId}".`}
            action={
              <Button asChild size="sm" variant="outline">
                <Link to="/releases">Back to releases</Link>
              </Button>
            }
          />
        </Panel>
      </div>
    );
  }

  const timeline: TimelineEvent[] = [
    { label: "Scheduled", at: release.scheduledAt, state: "done" },
    {
      label: "Handed to courier / customer",
      at: release.releasedAt ?? "",
      state: release.status === "scheduled" ? "active" : "done",
    },
    {
      label: "Handover completed",
      at: release.completedAt ?? "",
      state: release.status === "completed" ? "done" : "pending",
    },
  ];

  const markReleased = () => {
    ops.markReleaseReleased(release.id, ops.actor);
    completeReleaseSource(
      (id, status) => store.updateOrderStatus(id, status),
      (id, status) => store.setBuildStatus(id, status),
      (id, status) => store.setServiceStatus(id, status),
      release.kind,
      release.refId,
    );
    if (release.kind === "build") ops.setBuildStage(release.refId, "released");
    toast.success(`${release.refId} marked as released.`);
  };

  const complete = () => {
    if (!receivedBy.trim()) {
      toast.error("Enter who received the item.");
      return;
    }
    ops.completeRelease(release.id, receivedBy.trim());
    toast.success(`${release.refId} handover completed.`);
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={<Mono className="text-[19px] text-foreground">{release.id}</Mono>}
        status={<StatusBadge status={release.status} />}
        description={`${titleCase(release.kind)} handover for ${release.customerName}`}
        actions={<PrintButton label="Print handover" />}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Section title="Handover">
            <KeyValueGrid
              cols={2}
              items={[
                {
                  label: "Reference",
                  value: (
                    <IdLink to={REF_ROUTE[release.kind]} params={{ [REF_PARAM[release.kind]]: release.refId }}>
                      {release.refId}
                    </IdLink>
                  ),
                },
                { label: "Type", value: titleCase(release.kind) },
                { label: "Customer", value: release.customerName },
                { label: "Method", value: titleCase(release.method) },
                { label: "Scheduled", value: dateTime(release.scheduledAt) },
                {
                  label: "Released at",
                  value: release.releasedAt ? dateTime(release.releasedAt) : "—",
                },
                {
                  label: "Completed at",
                  value: release.completedAt ? dateTime(release.completedAt) : "—",
                },
                { label: "Released by", value: release.releasedBy ?? "—" },
                { label: "Received by", value: release.receivedBy ?? "—" },
              ]}
            />
            {release.notes && (
              <p className="border-t border-border px-4 py-3 text-[13px] text-muted-foreground">{release.notes}</p>
            )}
          </Section>

          <Section title="Timeline">
            <div className="p-4">
              <Timeline events={timeline} />
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Complete handover">
            {release.status === "completed" ? (
              <p className="p-4 text-[13px] text-muted-foreground">
                This release is closed. The source {release.kind} was marked{" "}
                {titleCase(release.kind === "build" ? "released" : release.kind === "order" ? "completed" : "released")}.
              </p>
            ) : release.status === "scheduled" ? (
              <div className="space-y-3 p-4">
                <p className="text-[12.5px] text-muted-foreground">
                  Confirm the item has left the store. The source {release.kind} is marked released; a separate
                  handover step records who received it.
                </p>
                <Button className="w-full" onClick={markReleased}>
                  Mark as released
                </Button>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                <div className="space-y-1.5">
                  <Label htmlFor="received-by">Received by</Label>
                  <Input
                    id="received-by"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    placeholder="Customer or courier name"
                  />
                </div>
                <Button className="w-full" onClick={complete}>
                  Complete handover
                </Button>
              </div>
            )}
          </Section>

          <DemoNote>
            Marking a release as released also advances the linked build, service or order status so the two demo
            stores stay consistent; completing the handover closes the release record.
          </DemoNote>
        </div>
      </div>
    </div>
  );
}
