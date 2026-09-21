import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export interface BrandCount {
  brand: string;
  count: number;
}

/** Products-derived brand counts for the given product ids. */
export function collectBrands(
  productIds: string[] | undefined,
  products: Product[],
): BrandCount[] {
  const counts = new Map<string, number>();
  for (const id of productIds ?? []) {
    const product = products.find((p) => p.id === id);
    if (product?.brand) counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
  }
  return Array.from(counts, ([brand, count]) => ({ brand, count })).sort((a, b) =>
    a.brand.localeCompare(b.brand),
  );
}

export function BrandChips({
  brands,
  productIds,
  products,
  limit,
  className,
}: {
  /** Canonical brand list (may include brands with no catalog products yet). */
  brands?: string[] | undefined;
  productIds: string[] | undefined;
  products: Product[];
  limit?: number;
  className?: string;
}) {
  const derived = collectBrands(productIds, products);
  const countOf = new Map(derived.map((d) => [d.brand, d.count]));
  const merged: BrandCount[] = [];
  const seen = new Set<string>();
  for (const brand of brands ?? []) {
    if (!brand || seen.has(brand)) continue;
    seen.add(brand);
    merged.push({ brand, count: countOf.get(brand) ?? 0 });
  }
  for (const d of derived) {
    if (seen.has(d.brand)) continue;
    seen.add(d.brand);
    merged.push({ brand: d.brand, count: d.count });
  }
  if (merged.length === 0) {
    return <span className="text-[12.5px] text-muted-foreground">No brands</span>;
  }
  const shown = limit ? merged.slice(0, limit) : merged;
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {shown.map(({ brand, count }) => (
        <span
          key={brand}
          className="inline-flex items-center gap-1 rounded border border-border bg-elevated px-1.5 py-0.5 text-[10.5px] text-muted-foreground"
        >
          {brand}
          {count > 0 && <span className="mono text-[9.5px] text-subtle">{count}</span>}
        </span>
      ))}
      {limit && merged.length > limit && (
        <span className="text-[10.5px] text-subtle">+{merged.length - limit}</span>
      )}
    </div>
  );
}