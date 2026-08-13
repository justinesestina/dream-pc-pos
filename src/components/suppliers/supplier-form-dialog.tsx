import { useEffect, useState } from "react";
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

const KNOWN_CATEGORIES = [
  "CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU", "Case", "Cooling",
  "Fans", "Monitor", "Keyboard", "Mouse", "Headset", "Networking", "Software",
];

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  supplier?: Supplier | undefined;
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
  const [categories, setCategories] = useState("");
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
    setCategories(supplier?.categories.join(", ") ?? "");
    setNotes(supplier?.notes ?? "");
  }, [open, supplier]);

  const submit = () => {
    if (!name.trim() || !contact.trim()) {
      toast.error("Supplier name and contact are required.");
      return;
    }
    const cats = categories
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const lead = Math.max(1, Math.floor(Number(leadTimeDays) || 1));
    const payload = {
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim() || "—",
      terms: terms.trim() || "Net 30",
      leadTimeDays: lead,
      categories: cats.length ? cats : ["General"],
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
        <div className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nexlogic Distribution" />
          </div>
          <div className="space-y-1.5">
            <Label>Contact person</Label>
            <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="e.g. Juan Dela Cruz" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sales@supplier.ph" />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0917 123 4567" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 123 Shaw Blvd, Mandaluyong" />
          </div>
          <div className="space-y-1.5">
            <Label>Payment terms</Label>
            <Input value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="e.g. Net 30" />
          </div>
          <div className="space-y-1.5">
            <Label>Lead time (days)</Label>
            <Input type="number" min={1} value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Categories (comma-separated)</Label>
            <Input value={categories} onChange={(e) => setCategories(e.target.value)} placeholder={KNOWN_CATEGORIES.join(", ")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional internal notes…" />
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
