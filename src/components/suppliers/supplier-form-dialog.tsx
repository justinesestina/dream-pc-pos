import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import { useOps } from "@/lib/ops-store";
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
  const { createSupplier, updateSupplier } = useOps();
  const isEdit = Boolean(supplier);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [terms, setTerms] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState("");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [notes, setNotes] = useState("");

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
    setProductQuery("");
    setNotes(supplier?.notes ?? "");
  }, [open, supplier]);

  const matchingProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();
    if (!query) return availableProducts;
    return availableProducts.filter((product) =>
      `${product.name} ${product.sku} ${product.brand}`.toLowerCase().includes(query),
    );
  }, [availableProducts, productQuery]);

  const submit = () => {
    if (!name.trim() || !contact.trim()) {
      toast.error("Supplier name and contact are required.");
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
        new Set(
          availableProducts
            .filter((product) => productIds.includes(product.id))
            .map((product) => product.brand)
            .filter(Boolean),
        ),
      ),
      productIds,
      notes: notes.trim() || undefined,
    };
    if (isEdit && supplier) {
      updateSupplier(supplier.id, payload);
      toast.success(`${payload.name} updated.`);
    } else {
      createSupplier(payload);
      toast.success(`${payload.name} added to the directory.`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit supplier" : "New supplier"}</DialogTitle>
        </DialogHeader>
        <div
          className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
          data-lenis-prevent
        >
          <div className="space-y-1.5">
            <Label htmlFor="sf-name">Name</Label>
            <Input id="sf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nexlogic Distribution" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sf-contact">Contact person</Label>
            <Input id="sf-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="e.g. Juan Dela Cruz" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sf-email">Email</Label>
            <Input id="sf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sales@supplier.ph" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sf-phone">Phone</Label>
            <Input id="sf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0917 123 4567" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sf-address">Address</Label>
            <Input id="sf-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 123 Shaw Blvd, Mandaluyong" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sf-terms">Payment terms</Label>
            <Input id="sf-terms" value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="e.g. Net 30" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sf-lead">Lead time (days)</Label>
            <Input id="sf-lead" type="number" min={1} value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Products supplied</Label>
            <p className="text-xs text-muted-foreground">Select the catalog products this supplier can provide. Brands are summarized automatically.</p>
            <Input
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Search product name, SKU, or brand…"
              aria-label="Search supplied products"
            />
            <p className="mono text-[11px] text-muted-foreground">
              {productIds.length} selected · {matchingProducts.length} shown
            </p>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2" data-lenis-prevent>
              {matchingProducts.length === 0 ? (
                <p className="px-2 py-4 text-center text-xs text-muted-foreground">No products match that search.</p>
              ) : matchingProducts.map((product) => {
                const selected = productIds.includes(product.id);
                return (
                  <label key={product.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-elevated">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => setProductIds((current) => selected ? current.filter((id) => id !== product.id) : [...current, product.id])}
                    />
                    <span className="min-w-0 flex-1 truncate">{product.name}</span>
                    <span className="mono text-[10px] text-muted-foreground">{product.brand} · {product.sku}</span>
                  </label>
                );
              })}
            </div>
            {productIds.length === 0 && <p className="text-xs text-warning">Select at least one product before saving.</p>}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sf-notes">Notes</Label>
            <Textarea id="sf-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional internal notes…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{isEdit ? "Save changes" : "Add supplier"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
