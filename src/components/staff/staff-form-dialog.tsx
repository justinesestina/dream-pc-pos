import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOps } from "@/lib/ops-store";
import type { StaffMember } from "@/lib/ops-types";

const ROLES = ["Owner", "Admin", "Technician", "Cashier", "Inventory"];

export function StaffFormDialog({
  open,
  onOpenChange,
  staff,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  staff?: StaffMember | undefined;
}) {
  const { createStaff, updateStaff } = useOps();
  const isEdit = Boolean(staff);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Technician");
  const [skills, setSkills] = useState("");
  const [shift, setShift] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(staff?.name ?? "");
    setRole(staff?.role ?? "Technician");
    setSkills(staff?.skills.join(", ") ?? "");
    setShift(staff?.shift ?? "");
  }, [open, staff]);

  const submit = () => {
    if (!name.trim()) {
      toast.error("Staff name is required.");
      return;
    }
    const trimmed = name.trim();
    const initials = trimmed
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
    const payload = {
      name: trimmed,
      initials: initials || "?",
      role,
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      shift: shift.trim() || "As scheduled",
    };
    if (isEdit && staff) {
      updateStaff(staff.id, payload);
      toast.success(`${payload.name} updated.`);
    } else {
      createStaff(payload);
      toast.success(`${payload.name} added to the roster.`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit staff member" : "Add staff member"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maria Santos" />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Skills (comma-separated)</Label>
            <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Assembly, Diagnostics, POS" />
          </div>
          <div className="space-y-1.5">
            <Label>Shift</Label>
            <Input value={shift} onChange={(e) => setShift(e.target.value)} placeholder="e.g. Mon–Sat 09:00–18:00" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{isEdit ? "Save changes" : "Add staff"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
