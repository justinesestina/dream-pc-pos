import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { useOps } from "@/lib/ops-store";
import type { Order } from "@/lib/types";
import type { ReturnRequest } from "@/lib/ops-types";

export function NewReturnDialog({ order }: { order?: Order }) {
  const { orders, productById } = useStore();
  const { createReturn } = useOps();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState(order?.id ?? "");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState("");
  const [condition, setCondition] = useState<ReturnRequest["condition"]>("used_good");

  const reset = () => {
    setOrderId(order?.id ?? "");
    setProductId("");
    setQty("1");
    setReason("");
    setCondition("used_good");
  };

  const selectedOrder = useMemo(() => orders.find((o) => o.id === orderId), [orders, orderId]);
  const effective = order ?? selectedOrder;
  const availableItems = effective?.items ?? [];

  const submit = () => {
    if (!effective) {
      toast.error("Select an order.");
      return;
    }
    const item = availableItems.find((i) => i.productId === productId);
    if (!item) {
      toast.error("Select the returned product.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Enter a return reason.");
      return;
    }
    const product = productById(productId);
    const rma = createReturn({
      orderId: effective.id,
      customerId: effective.customerId,
      customerName: effective.customerName,
      productId,
      productName: product?.name ?? item.name,
      qty: Number(qty) || 1,
      reason: reason.trim(),
      condition,
      resolution: "none",
      refundMethod: null,
      refundAmount: 0,
      restock: false,
    });
    toast.success(`Return ${rma.id} created.`);
    setOpen(false);
    reset();
    navigate({ to: "/returns/$returnId", params: { returnId: rma.id } });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1.5 text-xs">
          <Plus className="size-3.5" /> New return
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New return request</DialogTitle>
          <DialogDescription>Create an RMA against an existing order.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {!order && (
            <div className="space-y-1.5">
              <Label htmlFor="rma-order">Order</Label>
              <Select
                value={orderId}
                onValueChange={(v) => {
                  setOrderId(v);
                  setProductId("");
                }}
              >
                <SelectTrigger id="rma-order" className="w-full">
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.id} — {o.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rma-product">Product</Label>
              <Select value={productId} onValueChange={setProductId} disabled={!effective}>
                <SelectTrigger id="rma-product" className="w-full">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {availableItems.map((i) => (
                    <SelectItem key={i.productId} value={i.productId}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qty">Quantity</Label>
              <Input id="qty" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rma-condition">Condition</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as ReturnRequest["condition"])}>
              <SelectTrigger id="rma-condition" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sealed">Sealed</SelectItem>
                <SelectItem value="used_good">Used — good</SelectItem>
                <SelectItem value="used_damaged">Used — damaged</SelectItem>
                <SelectItem value="defective">Defective</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Customer-reported reason for the return" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Create return</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
