import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Plus, X, Search, List, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOps } from "@/lib/ops-store";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { collectBrands } from "./brand-chips";
import type { Supplier } from "@/lib/ops-types";
import type { Product } from "@/lib/types";

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
  availableProducts,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  supplier?: Supplier | undefined;
  availableProducts: Product[];
}) {
  const { createSupplier, updateSupplier, setSupplierProducts } = useOps();
  const { updateProduct, brands: wcBrands, createBrand } = useStore();
  const isEdit = Boolean(supplier);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [terms, setTerms] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState("");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [extraBrands, setExtraBrands] = useState<string[]>([]);
  const [brandInput, setBrandInput] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [showProducts, setShowProducts] = useState(false);
  const [notes, setNotes] = useState("");
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(supplier?.name ?? "");
    setContact(supplier?.contact ?? "");
    setEmail(supplier?.email ?? "");
    setPhone(supplier?.phone ?? "");
    setAddress(supplier?.address ?? "");
    setTerms(supplier?.terms ?? "");
    setLeadTimeDays(supplier ? String(supplier.leadTimeDays) : "");
    setProductIds(supplier?.productIds ?? []);
    const derived = new Set(
      collectBrands(supplier?.productIds, availableProducts).map((b) => b.brand),
    );
    const catalogOnly = new Set(
      availableProducts.map((p) => p.brand).filter(Boolean) as string[],
    );
    setExtraBrands(
      (supplier?.categories ?? []).filter(
        (brand) => !derived.has(brand) && !catalogOnly.has(brand),
      ),
    );
    setBrandInput("");
    setProductQuery("");
    setShowProducts(supplier ? (supplier.productIds?.length ?? 0) > 0 : false);
    setNotes(supplier?.notes ?? "");
  }, [open, supplier, availableProducts]);

  const wcBrandNames = useMemo(
    () => new Set(wcBrands.map((b) => b.name)),
    [wcBrands],
  );

  const catalogBrands = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const product of availableProducts) {
      if (!product.brand) continue;
      if (!wcBrandNames.has(product.brand)) continue;
      const ids = map.get(product.brand) ?? [];
      ids.push(product.id);
      map.set(product.brand, ids);
    }
    return map;
  }, [availableProducts, wcBrandNames]);

  const derivedBrands = useMemo(
    () => collectBrands(productIds, availableProducts),
    [productIds, availableProducts],
  );

  const chips = useMemo(() => {
    const seen = new Set<string>();
    const list: { brand: string; total: number; covered: number }[] = [];
    for (const [brand, ids] of catalogBrands) {
      seen.add(brand);
      list.push({
        brand,
        total: ids.length,
        covered: derivedBrands.find((d) => d.brand === brand)?.count ?? 0,
      });
    }
    for (const brand of extraBrands) {
      if (seen.has(brand)) continue;
      list.push({ brand, total: catalogBrands.get(brand)?.length ?? 0, covered: derivedBrands.find((d) => d.brand === brand)?.count ?? 0 });
    }
    list.sort((a, b) => a.brand.localeCompare(b.brand));
    return list;
  }, [catalogBrands, derivedBrands, extraBrands]);

  const carriedBrands = useMemo(
    () =>
      chips.filter((c) =>
        c.total === 0 ? extraBrands.includes(c.brand) : c.covered > 0,
      ).length,
    [chips, extraBrands],
  );

  const availableWcBrands = useMemo(() => {
    const currentBrands = new Set([
      ...chips.map((c) => c.brand),
    ]);
    const query = brandSearch.toLowerCase();
    return wcBrands
      .map((b) => b.name)
      .filter(
        (brand) => !currentBrands.has(brand) && brand.toLowerCase().includes(query),
      );
  }, [wcBrands, chips, brandSearch]);

  const toggleBrand = (brand: string) => {
    const ids = catalogBrands.get(brand);
    if (!ids || ids.length === 0) {
      setExtraBrands((current) =>
        current.includes(brand) ? current.filter((b) => b !== brand) : [...current, brand],
      );
      return;
    }
    const coversAll = ids.every((id) => productIds.includes(id));
    setProductIds((current) => {
      const next = new Set(current);
      if (coversAll) for (const id of ids) next.delete(id);
      else for (const id of ids) next.add(id);
      return Array.from(next);
    });
  };

  const addCustomBrand = async () => {
    const brand = brandInput.trim();
    if (!brand) return;
    const wcBrandExists = wcBrands.some(
      (b) => b.name.toLowerCase() === brand.toLowerCase(),
    );
    if (!wcBrandExists) {
      const created = await createBrand(brand);
      if (created) {
        toast.success(`Brand "${created.name}" added to WooCommerce.`);
      }
    }
    const ids = catalogBrands.get(brand);
    if (ids && ids.length > 0) {
      setProductIds((current) => Array.from(new Set([...current, ...ids])));
    } else {
      setExtraBrands((current) =>
        current.includes(brand) ? current : [...current, brand],
      );
    }
    setBrandInput("");
  };

  const addWcBrand = (brand: string) => {
    const ids = catalogBrands.get(brand);
    if (ids && ids.length > 0) {
      setProductIds((current) => Array.from(new Set([...current, ...ids])));
    } else {
      setExtraBrands((current) =>
        current.includes(brand) ? current : [...current, brand],
      );
    }
    setShowBrandPicker(false);
    setBrandSearch("");
  };

  const removeExtraBrand = (brand: string) => {
    setExtraBrands((current) => current.filter((b) => b !== brand));
  };

  const matchingProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();
    if (!query) return availableProducts;
    return availableProducts.filter((product) =>
      `${product.name} ${product.sku} ${product.brand}`.toLowerCase().includes(query),
    );
  }, [availableProducts, productQuery]);

  const submit = async () => {
    if (!name.trim() || !contact.trim()) {
      toast.error("Supplier name and contact are required.");
      return;
    }
    if (productIds.length === 0 && extraBrands.length === 0) {
      toast.error("Add at least one brand or product before saving.");
      return;
    }
    const lead = Math.max(1, Math.floor(Number(leadTimeDays) || 1));
    const payload = {
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim() || "—",
      terms: terms.trim() || "Net 30",
      leadTimeDays: lead,
      categories: Array.from(
        new Set([
          ...availableProducts
            .filter((product) => productIds.includes(product.id))
            .map((product) => product.brand)
            .filter((b): b is string => Boolean(b) && wcBrandNames.has(b)),
          ...extraBrands,
        ]),
      ),
      productIds,
      notes: notes.trim() || undefined,
    };
    const savedSupplier =
      isEdit && supplier
        ? await updateSupplier(supplier.id, payload)
        : await createSupplier(payload);
    if (!savedSupplier) {
      toast.error("Could not save supplier. Check the backend connection.");
      return;
    }

    for (const product of availableProducts) {
      const wasAssigned = product.supplier === (supplier?.name ?? "");
      const shouldBeAssigned = productIds.includes(product.id);
      if (shouldBeAssigned && product.supplier !== savedSupplier.name) {
        updateProduct(product.id, { supplier: savedSupplier.name });
      } else if (isEdit && wasAssigned && !shouldBeAssigned) {
        updateProduct(product.id, { supplier: "—" });
      }
    }

    if (isEdit && supplier) {
      toast.success(`${payload.name} updated.`);
    } else {
      toast.success(`${payload.name} added to the directory.`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit supplier" : "New supplier"}</DialogTitle>
        </DialogHeader>
        <div
          className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
          data-lenis-prevent
        >
          <div className="space-y-1.5">
            <Label htmlFor="sf-name">Name</Label>
            <Input
              id="sf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nexlogic Distribution"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sf-contact">Contact person</Label>
            <Input
              id="sf-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sf-email">Email</Label>
            <Input
              id="sf-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sales@supplier.ph"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sf-phone">Phone</Label>
            <Input
              id="sf-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0917 123 4567"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sf-address">Address</Label>
            <Input
              id="sf-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Shaw Blvd, Mandaluyong"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sf-terms">Payment terms</Label>
            <Input
              id="sf-terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="e.g. Net 30"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sf-lead">Lead time (days)</Label>
            <Input
              id="sf-lead"
              type="number"
              min={1}
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label>Brands supplied</Label>
              <span className="mono text-[11px] text-muted-foreground">
                {carriedBrands} brands · {productIds.length} products
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Click a brand to toggle all its products. Use the input to add custom brands.
            </p>

            {/* Brand chips area */}
            <div className="flex flex-wrap gap-1.5 min-h-[40px]">
              {chips.length === 0 ? (
                <div className="w-full flex items-center justify-center py-4 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                  No brands added yet
                </div>
              ) : (
                chips.map(({ brand, total, covered }) => {
                  const full = covered === total && total > 0;
                  const isPartial = covered > 0 && covered < total;
                  const isExtra = total === 0;
                  const isEmpty = covered === 0 && total > 0;

                  return (
                    <div
                      key={brand}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150",
                        full
                          ? "border-info/40 bg-info/10 text-info"
                          : isPartial
                          ? "border-info/30 bg-info/5 text-info"
                          : isExtra
                          ? "border-warning/30 bg-warning/5 text-warning"
                          : "border-border bg-elevated text-muted-foreground hover:bg-muted hover:border-border/50",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleBrand(brand)}
                        className="flex items-center gap-1.5"
                      >
                        {/* Status indicator */}
                        <span
                          className={cn(
                            "flex-shrink-0 w-1.5 h-1.5 rounded-full",
                            full && "bg-info",
                            isPartial && "bg-info/60",
                            isExtra && "bg-warning",
                            isEmpty && "bg-transparent border border-border",
                          )}
                        />
                        {brand}
                        <span className="mono text-[10px] text-subtle">
                          {isExtra
                            ? "custom"
                            : isPartial
                            ? `${covered}/${total}`
                            : full
                            ? total
                            : `0/${total}`}
                        </span>
                      </button>
                      {(isExtra || covered > 0) && (
                        <button
                          type="button"
                          onClick={() => isExtra ? removeExtraBrand(brand) : toggleBrand(brand)}
                          className="ml-0.5 flex items-center justify-center w-5 h-5 rounded text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label={isExtra ? `Remove ${brand}` : `Remove all ${brand} products`}
                        >
                          {isExtra ? <X className="size-3" /> : <Minus className="size-3" />}
                        </button>
                      )}
                    </div>
                  );
                })
              )}

              {/* Add brand input - always visible at end */}
              <div className="relative flex items-center gap-1.5">
                <div className="relative w-40">
                  <Input
                    type="text"
                    value={brandInput}
                    onChange={(e) => setBrandInput(e.target.value)}
                    placeholder="Add brand…"
                    className="text-xs h-8 pr-9 bg-background"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void addCustomBrand();
                      }
                    }}
                    onFocus={() => setShowBrandPicker(true)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant={brandInput.trim() ? "default" : "ghost"}
                    onClick={() => void addCustomBrand()}
                    disabled={!brandInput.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    aria-label="Add brand"
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
                <Popover open={showBrandPicker} onOpenChange={setShowBrandPicker}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-3 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                      <List className="size-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 max-h-[340px] overflow-y-auto" side="bottom" align="end" style={{ overscrollBehavior: 'contain' }}>
                    <div className="p-2">
                      <div className="sticky top-0 z-10 mb-2 bg-popover/95 backdrop-blur-sm border-b border-border pb-2 relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          placeholder="Search brands…"
                          className="pl-8"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-0.5" style={{ scrollbarWidth: 'thin' }}>
                        {availableWcBrands.length > 0 ? (
                          <>
                            <p className="px-2 py-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                              WooCommerce brands
                            </p>
                            {availableWcBrands.map((brand) => {
                              const ids = catalogBrands.get(brand);
                              const count = ids?.length ?? 0;
                              return (
                                <button
                                  key={brand}
                                  type="button"
                                  onClick={() => addWcBrand(brand)}
                                  className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-elevated rounded-lg transition-colors group"
                                >
                                  <span className="font-medium">{brand}</span>
                                  <div className="flex items-center gap-2">
                                    {count > 0 && (
                                      <span className="mono text-[11px] text-muted-foreground">
                                        {count} product{count !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                    <Plus className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                  </div>
                                </button>
                              );
                            })}
                          </>
                        ) : (
                          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                            All WooCommerce brands already added
                          </p>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => setShowProducts((v) => !v)}
              >
                <ChevronDown
                  className={cn("size-3.5 transition-transform", showProducts && "rotate-180")}
                />
                Fine-tune specific products
              </Button>
            </div>
            {showProducts && (
              <div className="space-y-2 rounded-md border border-border p-2">
                <Input
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="Search product name, SKU, or brand…"
                  aria-label="Search supplied products"
                />
                <p className="mono text-[11px] text-muted-foreground">
                  {productIds.length} selected · {matchingProducts.length} shown
                </p>
                <div
                  className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2"
                  data-lenis-prevent
                >
                  {matchingProducts.length === 0 ? (
                    <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                      No products match that search.
                    </p>
                  ) : (
                    matchingProducts.map((product) => {
                      const selected = productIds.includes(product.id);
                      return (
                        <label
                          key={product.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-elevated"
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              setProductIds((current) =>
                                selected
                                  ? current.filter((id) => id !== product.id)
                                  : [...current, product.id],
                              )
                            }
                          />
                          <span className="min-w-0 flex-1 truncate">{product.name}</span>
                          <span className="mono text-[10px] text-muted-foreground">
                            {product.brand} · {product.sku}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}
            {(productIds.length === 0 && extraBrands.length === 0) && (
              <p className="text-xs text-warning">Add at least one brand or product before saving.</p>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sf-notes">Notes</Label>
            <Textarea
              id="sf-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional internal notes…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void submit()}>{isEdit ? "Save changes" : "Add supplier"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}