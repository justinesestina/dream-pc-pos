import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOps } from "@/lib/ops-store";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import type { ReleaseRecord } from "@/lib/ops-types";

function localDateTimeValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const KINDS: ReleaseRecord["kind"][] = ["build", "service", "order"];

export function NewReleaseDialog({ triggerLabel = "Schedule release" }: { triggerLabel?: string }) {
  const ops = useOps();
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ReleaseRecord["kind"]>("build");
  const [refId, setRefId] = useState("");
  const [method, setMethod] = useState<ReleaseRecord["method"]>("pickup");
  const [scheduled, setScheduled] = useState(() => {
    const d = new Date(Date.now() + 3600000);
    d.setMinutes(0, 0, 0);
    return localDateTimeValue(d);
  });
  const [notes, setNotes] = useState("");

  const taken = (k: ReleaseRecord["kind"], id: string) =>
    ops.releases.some((r) => r.kind === k && r.refId === id && r.status !== "completed");

  const options = useMemo(() => {
    const out: { id: string; label: string; meta: string; customer: string }[] = [];
    if (kind === "build") {
      for (const b of store.builds) {
        if (b.status !== "ready" || taken("build", b.id)) continue;
        out.push({ id: b.id, label: b.purpose, meta: `${money(b.budget)} budget`, customer: b.customerName });
      }
    } else if (kind === "service") {
      for (const t of store.services) {
        if (t.status !== "ready" || taken("service", t.id)) continue;
        out.push({ id: t.id, label: `${t.device} — ${t.issue}`, meta: t.technician, customer: t.customerName });
      }
    } else {
      for (const o of store.orders) {
        if (o.status !== "ready" || taken("order", o.id)) continue;
        out.push({ id: o.id, label: `${o.items.length} item(s)`, meta: money(o.total), customer: o.customerName });
      }
    }
    return out;
  }, [kind, store.builds, store.services, store.orders, ops.releases]);

  const selected = options.find((o) => o.id === refId);

  const submit = () => {
    if (!refId) {
      toast.error("Pick the build, service or order to release.");
      return;
    }
    if (!scheduled) {
      toast.error("Set a scheduled date and time.");
      return;
    }
    const iso = new Date(scheduled).toISOString();
    if (Number.isNaN(Date.parse(iso))) {
      toast.error("Scheduled date is invalid.");
      return;
    }
    ops.createRelease({
      kind,
      refId,
      customerName: selected?.customer ?? "Walk-in Customer",
      method,
      scheduledAt: iso,
      notes: notes.trim() || undefined,
    });
    toast.success(`${kind} ${refId} scheduled for release.`);
    setOpen(false);
    setRefId("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <CalendarClock className="size-3.5" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule a release</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Release type</Label>
            <Select
              value={kind}
              onValueChange={(v) => {
                setKind(v as ReleaseRecord["kind"]);
                setRefId("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KINDS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k === "order" ? "Retail order" : k === "build" ? "Custom build" : "Service ticket"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Reference</Label>
            <Select value={refId} onValueChange={setRefId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={options.length === 0 ? "Nothing ready to release" : "Select an item…"} />
              </SelectTrigger>
              <SelectContent>
                {options.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    No items in “ready” state
                  </SelectItem>
                ) : (
                  options.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      <span className="flex items-center gap-2">
                        <span className="mono">{o.id}</span>
                        <span className="truncate">{o.label}</span>
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as ReleaseRecord["method"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Store pickup</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Scheduled</Label>
              <Input type="datetime-local" value={scheduled} onChange={(e) => setScheduled(e.target.value)} />
            </div>
          </div>
          {selected && (
            <p className="mono text-[11.5px] text-subtle">
              {selected.customer} · {selected.meta}
            </p>
          )}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Handover instructions, contact person, courier…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={options.length === 0}>
            Schedule release
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
