import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono, IdLink } from "@/components/nexus/primitives";
import { Section, KeyValueGrid, ProgressBar, DemoNote } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
import { StatCard } from "@/components/nexus/stat-card";
import { useStore } from "@/lib/store";
import { num, dateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";

export const Route = createFileRoute("/_app/inventory/$productId")({
  head: () => ({
    meta: [
      { title: "Stock Item — DPC POS" },
      { name: "description", content: "Stock levels, movements and serial numbers for one product." },
      { property: "og:title", content: "Stock Item — DPC POS" },
      { property: "og:description", content: "Stock levels, movements and serial numbers for one product." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InventoryItemPage,
});

function InventoryItemPage() {
  const { productId } = Route.useParams();
  const { productById, invFor, serials, movements, adjustStock } = useStore();
  const product = productById(productId);
  const inv = invFor(productId);
  const [delta, setDelta] = useState("0");
  const [note, setNote] = useState("");

  const productSerials = useMemo(
    () => serials.filter((s) => s.productId === productId),
    [serials, productId],
  );
  const productMovements = useMemo(
    () =>
      movements
        .filter((m) => m.productId === productId)
        .sort((a, b) => +new Date(b.at) - +new Date(a.at)),
    [movements, productId],
  );

  if (!product) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Stock Item" description="Stock levels, movements and serial numbers for one product." />
        <Panel>
          <EmptyState title="Product not found" description="This inventory item does not exist." />
        </Panel>
      </div>
    );
  }

  const onHand = inv?.onHand ?? 0;
  const reorderPoint = inv?.reorderPoint ?? 0;
  const reserved = inv?.reserved ?? 0;
  const available = Math.max(0, onHand - reserved);
  const ratio = reorderPoint > 0 ? Math.min(100, (onHand / (reorderPoint * 2)) * 100) : 100;
  const tone = onHand <= 0 ? "warning" : onHand <= reorderPoint ? "warning" : "success";

  const submit = () => {
    const n = Number(delta);
    if (!Number.isFinite(n) || n === 0) {
      toast.error("Enter a non-zero quantity.");
      return;
    }
    if (!note.trim()) {
      toast.error("A note is required for stock adjustments.");
      return;
    }
    adjustStock(productId, n, note.trim());
    toast.success(`Stock adjusted (${n > 0 ? "+" : ""}${n})`);
    setDelta("0");
    setNote("");
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={`Stock — ${product.name}`}
        description="Stock levels, movements and serial numbers for one product."
        meta={<Mono>{product.sku}</Mono>}
        actions={
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link to="/products/$productId" params={{ productId: product.id }}>
              <Package className="size-3.5" /> View product
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="On hand" numericValue={onHand} format={(n) => num(Math.round(n))} accent="info" />
        <StatCard label="Reserved" numericValue={reserved} format={(n) => num(Math.round(n))} accent="neutral" />
        <StatCard label="Available" numericValue={available} format={(n) => num(Math.round(n))} accent="success" />
        <StatCard label="Damaged" numericValue={inv?.damaged ?? 0} format={(n) => num(Math.round(n))} accent="warning" />
      </div>

      <Section title="Reorder status" hint={`Reorder point: ${num(reorderPoint)}`}>
        <div className="space-y-2 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>On hand: {num(onHand)}</span>
            <StatusBadge status={onHand <= 0 ? "out_of_stock" : onHand <= reorderPoint ? "low_stock" : "in_stock"} />
          </div>
          <ProgressBar value={ratio} tone={tone} />
        </div>
      </Section>

      <Section title="Adjust stock" hint="Manual correction, recorded as a movement">
        <div className="space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor="inv-delta">Quantity delta</Label>
              <Input id="inv-delta" type="number" className="mono" value={delta} onChange={(e) => setDelta(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-note">Note</Label>
              <Textarea id="inv-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Reason for adjustment" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <DemoNote>Adjustments write directly to local demo state; no backend sync occurs.</DemoNote>
            <Button onClick={submit} className="shrink-0">Save adjustment</Button>
          </div>
        </div>
      </Section>

      <Section title="Serial numbers" hint={`${productSerials.length} tracked units`}>
        {productSerials.length === 0 ? (
          <EmptyState title="No serials tracked" description="This product has no individual serial records." />
        ) : (
          <div className="divide-y divide-border">
            {productSerials.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 px-4 py-2.5">
                <Mono className="text-xs">{s.serial}</Mono>
                <div className="flex items-center gap-3">
                  {s.orderId && <IdLink to="/orders/$orderId" params={{ orderId: s.orderId }}>{s.orderId}</IdLink>}
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Movement history" hint={`${productMovements.length} recorded movements`}>
        {productMovements.length === 0 ? (
          <EmptyState title="No movement history" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="label-tech px-4 py-2.5 font-normal">Type</th>
                  <th className="label-tech px-4 py-2.5 text-right font-normal">Qty</th>
                  <th className="label-tech px-4 py-2.5 font-normal">Date</th>
                  <th className="label-tech px-4 py-2.5 font-normal">Actor</th>
                  <th className="label-tech px-4 py-2.5 font-normal">Reference / note</th>
                </tr>
              </thead>
              <tbody>
                {productMovements.map((m) => (
                  <tr key={m.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-2.5"><StatusBadge status={m.type} tone="neutral" /></td>
                    <td className={`px-4 py-2.5 text-right mono tabular-nums ${m.qty >= 0 ? "text-success" : "text-destructive"}`}>
                      {m.qty >= 0 ? "+" : ""}{m.qty}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{dateTime(m.at)}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{m.actor}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{m.reference ?? m.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}
