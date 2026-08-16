import { useMemo, useState } from "react";
import { LayoutGrid, List, PackageX, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, Panel, RowsSkeleton } from "@/components/nexus/primitives";
import { SearchInput, Segmented, Toolbar } from "@/components/nexus/toolbar";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductBrowser({ loading }: { loading: boolean }) {
  const store = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const categories = useMemo(
    () => store.categories.filter((c) => !c.archived).sort((a, b) => a.name.localeCompare(b.name)),
    [store.categories],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.products.filter((p) => {
      if (p.archived) return false;
      if (category !== "all" && p.categoryId !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    });
  }, [store.products, query, category]);

  const add = (p: Product) => {
    const res = store.addToCart(p.id, 1);
    if (!res.ok) toast.error(res.error ?? "Could not add item");
    else toast.success(`${p.name} added`, { duration: 1400 });
  };

  return (
    <Panel className="flex min-h-0 flex-col">
      <Toolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search name, SKU or brand…  (F2)"
          data-pos-search
        />
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "grid", label: <LayoutGrid className="size-3.5" /> },
            { value: "list", label: <List className="size-3.5" /> },
          ]}
          className="ml-auto"
        />
      </Toolbar>

      <div className="flex flex-wrap gap-1.5 border-b border-border px-3 py-2">
        <CategoryChip active={category === "all"} onClick={() => setCategory("all")}>
          All
        </CategoryChip>
        {categories.map((c) => (
          <CategoryChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.name}
          </CategoryChip>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <RowsSkeleton rows={8} />
        ) : results.length === 0 ? (
          <EmptyState
            icon={PackageX}
            title="No products match"
            description="Try a different search term or clear the category filter."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
              >
                Reset filters
              </Button>
            }
          />
        ) : view === "grid" ? (
          <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={add} />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {results.map((p) => (
              <ProductRow key={p.id} product={p} onAdd={add} />
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "mono rounded border px-2 py-1 text-[10.5px] tracking-wide uppercase transition-colors",
        active
          ? "border-border-strong bg-foreground/10 text-foreground"
          : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function useStock(productId: string) {
  const store = useStore();
  const avail = store.availableOf(productId);
  const isService = store.productById(productId)?.isService;
  return { avail, isService, out: !isService && avail <= 0 };
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const { avail, isService, out } = useStock(product.id);
  return (
    <button
      type="button"
      disabled={out}
      onClick={() => onAdd(product)}
      className={cn(
        "group flex flex-col rounded-md border border-border bg-elevated/40 p-3 text-left transition-colors",
        out
          ? "cursor-not-allowed opacity-50"
          : "hover:border-border-strong hover:bg-elevated focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
      )}
    >
      <span className="mono text-[10px] tracking-wide text-subtle">{product.sku}</span>
      <span className="mt-1 line-clamp-2 text-[13px] leading-snug font-medium text-foreground">
        {product.name}
      </span>
      <span className="mt-auto flex items-end justify-between gap-2 pt-3">
        <span className="mono text-sm text-foreground">{money(product.price)}</span>
        <span
          className={cn(
            "mono text-[10.5px]",
            isService ? "text-info" : out ? "text-destructive" : avail <= 3 ? "text-warning" : "text-subtle",
          )}
        >
          {isService ? "SERVICE" : out ? "OUT OF STOCK" : `${avail} IN STOCK`}
        </span>
      </span>
    </button>
  );
}

function ProductRow({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const { avail, isService, out } = useStock(product.id);
  const store = useStore();
  return (
    <li className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-elevated/60">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-foreground">{product.name}</p>
        <p className="mono text-[10.5px] text-subtle">
          {product.sku} · {product.brand} · {store.categoryNameOf(product.categoryId)}
        </p>
      </div>
      <span
        className={cn(
          "mono w-24 text-right text-[11px]",
          isService ? "text-info" : out ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {isService ? "service" : `${avail} avail`}
      </span>
      <span className="mono w-24 text-right text-[13px] text-foreground">{money(product.price)}</span>
      <Button size="sm" variant="outline" className="h-7" disabled={out} onClick={() => onAdd(product)}>
        <Plus className="size-3.5" /> Add
      </Button>
    </li>
  );
}
