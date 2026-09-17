import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono, IdLink } from "@/components/nexus/primitives";
import { KeyValueGrid, Section, KeyValue } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
import { useStore } from "@/lib/store";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { money, num, dateTime, titleCase } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Archive, ArchiveRestore, Boxes, Pencil } from "lucide-react";

export const Route = createFileRoute("/_app/products/$productId")({
  head: () => ({
    meta: [
      { title: "Product detail — DPC POS" },
      { name: "description", content: "Specifications, pricing, stock and movement history." },
      { property: "og:title", content: "Product detail — DPC POS" },
      { property: "og:description", content: "Specifications, pricing, stock and movement history." },
    ],
  }),
  component: ProductsProductidPage,
});

function ProductsProductidPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const { productById, invFor, serials, movements, categoryNameOf, archiveProduct, reactivateProduct } = useStore();
  const product = productById(productId);
  const inv = invFor(productId);
  const [editOpen, setEditOpen] = useState(false);

  const productSerials = useMemo(
    () => serials.filter((s) => s.productId === productId),
    [serials, productId],
  );
  const productMovements = useMemo(
    () =>
      movements
        .filter((m) => m.productId === productId)
        .sort((a, b) => +new Date(b.at) - +new Date(a.at))
        .slice(0, 20),
    [movements, productId],
  );

  if (!product) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Product detail" description="Specifications, pricing, stock and movement history." />
        <Panel>
          <EmptyState title="Product not found" description="This product may have been removed from the catalog." />
        </Panel>
      </div>
    );
  }

  const margin = product.price > 0 ? ((product.price - product.cost) / product.price) * 100 : 0;
  const available = Math.max(0, (inv?.onHand ?? 0) - (inv?.reserved ?? 0));
  const categoryName = categoryNameOf(product.categoryId);
  const typeLabel =
    product.productType === "service"
      ? "Service"
      : product.productType === "bundle"
        ? "Bundle / Package"
        : "Product";

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={product.name}
        description={`${product.brand} · ${categoryName} · ${product.sku}`}
        status={
          <div className="flex items-center gap-2">
            <StatusBadge status="active" tone="neutral" label={typeLabel} />
            {product.archived && <StatusBadge status="inactive" label="Archived" />}
          </div>
        }
        meta={
          <>
            <Mono>{product.sku}</Mono>
            <span className="text-xs text-muted-foreground">Price {money(product.price)}</span>
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link to="/inventory/$productId" params={{ productId: product.id }}>
                <Boxes className="size-3.5" /> View inventory
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditOpen(true)}>
              <Pencil className="size-3.5" /> Edit
            </Button>
            {product.archived ? (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  reactivateProduct(product.id);
                  toast.success(`${product.name} reactivated.`);
                }}
              >
                <ArchiveRestore className="size-3.5" /> Reactivate
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-muted-foreground"
                onClick={() => {
                  archiveProduct(product.id);
                  toast.success(`${product.name} archived.`);
                }}
              >
                <Archive className="size-3.5" /> Archive
              </Button>
            )}
          </div>
        }
      />

      <ProductFormDialog open={editOpen} onOpenChange={setEditOpen} product={product} />

      {product.description && (
        <Section title="Description">
          <p className="px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">{product.description}</p>
        </Section>
      )}

      <Section title="Overview">
        <KeyValueGrid
          cols={4}
          items={[
            { label: "SKU", value: <Mono className="text-xs">{product.sku}</Mono> },
            { label: "Brand", value: product.brand },
            { label: "Category", value: categoryName },
            { label: "Type", value: typeLabel },
            { label: "Price", value: money(product.price), mono: true },
            { label: "Cost", value: money(product.cost), mono: true },
            { label: "Margin", value: `${margin.toFixed(1)}%`, mono: true },
            { label: "Warranty", value: product.warrantyMonths > 0 ? `${product.warrantyMonths} months` : "None" },
            { label: "Location", value: <Mono className="text-xs">{product.location}</Mono> },
            { label: "Supplier", value: product.supplier },
            { label: "Serial tracked", value: product.serialTracked ? "Yes" : "No" },
          ]}
        />
      </Section>

      <Section title="Specifications" hint="Attributes captured for this product">
        {Object.keys(product.specs).length === 0 ? (
          <EmptyState title="No specifications recorded" />
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(product.specs)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => (
                <KeyValue key={k} label={titleCase(k)} value={String(v)} />
              ))}
          </div>
        )}
      </Section>

      <Section title="Stock summary" hint="Live inventory snapshot">
        <KeyValueGrid
          cols={4}
          items={[
            { label: "On hand", value: num(inv?.onHand ?? 0), mono: true },
            { label: "Reserved", value: num(inv?.reserved ?? 0), mono: true },
            { label: "Available", value: num(available), mono: true },
            { label: "Damaged", value: num(inv?.damaged ?? 0), mono: true },
            { label: "Sold", value: num(inv?.sold ?? 0), mono: true },
            { label: "Reorder point", value: num(inv?.reorderPoint ?? 0), mono: true },
          ]}
        />
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

      <Section title="Recent movements" hint="Last 20 inventory movements">
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
                  <th className="label-tech px-4 py-2.5 font-normal">Reference</th>
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
