import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, IdLink, TechLabel } from "@/components/nexus/primitives";
import { Section, KeyValueGrid, DemoNote } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOps } from "@/lib/ops-store";
import { useStore } from "@/lib/store";
import { money, dateTime, titleCase } from "@/lib/format";
import type { ConsultationStatus } from "@/lib/ops-types";

export const Route = createFileRoute("/_app/consultations/$consultationId")({
  head: () => ({
    meta: [
      { title: "Consultation — DPC Nexus" },
      { name: "description", content: "Requirements, recommendation and conversion path." },
      { property: "og:title", content: "Consultation — DPC Nexus" },
      { property: "og:description", content: "Requirements, recommendation and conversion path." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConsultationDetailPage,
});

const FLOW: ConsultationStatus[] = ["new", "requirements", "recommended", "quoted", "won"];

function TagList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-xs text-subtle">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <Badge key={i} variant="secondary" className="font-normal">
          {i}
        </Badge>
      ))}
    </div>
  );
}

function ConsultationDetailPage() {
  const { consultationId } = Route.useParams();
  const ops = useOps();
  const store = useStore();
  const c = ops.consultationById(consultationId);

  if (!c) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Consultation" description="Requirements, recommendation and conversion path." />
        <Panel>
          <EmptyState title="Consultation not found" description={`No consultation matches "${consultationId}".`} />
        </Panel>
      </div>
    );
  }

  const convert = () => {
    const build = store.createBuild({
      customerId: c.customerId,
      purpose: c.primaryUse,
      budget: c.budget,
      ...(c.notes ? { notes: c.notes } : {}),
    });
    const quote = store.quoteFromBuild(build.id);
    ops.updateConsultation(c.id, {
      recommendedBuildId: build.id,
      quoteId: quote?.id,
      status: "quoted",
    });
    toast.success(`Converted ${c.id} to ${build.id}${quote ? ` and ${quote.id}` : ""}.`);
  };

  const canConvert = !c.recommendedBuildId && c.status !== "lost" && c.status !== "won";

  const advance = () => {
    const idx = FLOW.indexOf(c.status);
    if (idx === -1 || idx === FLOW.length - 1) return;
    const next = FLOW[idx + 1]!;
    ops.updateConsultation(c.id, { status: next });
    toast.success(`Moved to ${titleCase(next)}.`);
  };
  const markLost = () => {
    ops.updateConsultation(c.id, { status: "lost" });
    toast("Marked as lost.");
  };

  const idx = FLOW.indexOf(c.status);
  const canAdvance = c.status !== "won" && c.status !== "lost" && idx < FLOW.length - 1;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            {c.id}
            <StatusBadge status={c.status} />
          </span>
        }
        description={c.primaryUse}
        meta={
          <>
            <span className="text-xs text-muted-foreground">
              Customer:{" "}
              <IdLink to="/customers/$customerId" params={{ customerId: c.customerId }}>
                {c.customerName}
              </IdLink>
            </span>
            <span className="text-xs text-muted-foreground">Consultant: {c.consultant}</span>
            <span className="text-xs text-muted-foreground">Created {dateTime(c.createdAt)}</span>
          </>
        }
        actions={
          <>
            {c.status !== "won" && c.status !== "lost" && (
              <Button size="sm" variant="outline" onClick={markLost}>
                Mark lost
              </Button>
            )}
            {canAdvance && (
              <Button size="sm" onClick={advance}>
                Advance to {titleCase(FLOW[idx + 1]!)}
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Section title="Requirements">
            <KeyValueGrid
              items={[
                { label: "Primary use", value: c.primaryUse },
                { label: "Budget", value: money(c.budget), mono: true },
                { label: "Target resolution", value: c.targetResolution },
                { label: "Upgrade only", value: c.upgradeOnly ? "Yes" : "No" },
                { label: "Consultant", value: c.consultant },
                { label: "Status", value: titleCase(c.status) },
              ]}
            />
          </Section>

          <Section title="Workloads">
            <div className="p-4">
              <TagList items={c.workloads} empty="No workloads recorded." />
            </div>
          </Section>

          <Section title="Preferences">
            <div className="p-4">
              <TagList items={c.preferences} empty="No preferences recorded." />
            </div>
          </Section>

          <Section title="Existing hardware">
            <div className="p-4">
              <TagList items={c.existingHardware} empty="No existing hardware recorded." />
            </div>
          </Section>

          {c.notes && (
            <Section title="Notes">
              <p className="p-4 text-[13px] text-muted-foreground">{c.notes}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Conversion">
            <div className="space-y-3 p-4">
              <div>
                <TechLabel>Recommended build</TechLabel>
                <div className="mt-1">
                  {c.recommendedBuildId ? (
                    <IdLink to="/builds/$buildId" params={{ buildId: c.recommendedBuildId }}>
                      {c.recommendedBuildId}
                    </IdLink>
                  ) : (
                    <p className="text-xs text-subtle">Not yet recommended.</p>
                  )}
                </div>
              </div>
              <div>
                <TechLabel>Quote</TechLabel>
                <div className="mt-1">
                  {c.quoteId ? (
                    <IdLink to="/quotes/$quoteId" params={{ quoteId: c.quoteId }}>
                      {c.quoteId}
                    </IdLink>
                  ) : (
                    <p className="text-xs text-subtle">No quote generated yet.</p>
                  )}
                </div>
              </div>
              {canConvert ? (
                <Button size="sm" className="w-full" onClick={convert}>
                  Convert to build + quote
                </Button>
              ) : c.status === "lost" ? (
                <p className="text-xs text-subtle">This consultation was marked lost and was not converted.</p>
              ) : (
                <p className="text-xs text-subtle">
                  Linked to {c.recommendedBuildId ?? "a build"} and {c.quoteId ?? "a quote"}.
                </p>
              )}
              <DemoNote>
                Conversion creates a build from this consultation and generates a draft quote from its
                components. Add parts on the build page, then regenerate the quote.
              </DemoNote>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
