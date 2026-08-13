import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { DemoNote } from "@/components/nexus/detail";
import { ProductBrowser } from "@/components/pos/product-browser";
import { CartPanel } from "@/components/pos/cart-panel";
import { useStore, useSimulatedLoad } from "@/lib/store";

export const Route = createFileRoute("/_app/pos")({
  head: () => ({
    meta: [
      { title: "Point of Sale — DPC Nexus" },
      { name: "description", content: "Ring up walk-in sales, apply discounts and take payment." },
      { property: "og:title", content: "Point of Sale — DPC Nexus" },
      { property: "og:description", content: "Ring up walk-in sales, apply discounts and take payment." },
    ],
  }),
  component: PosPage,
});

function PosPage() {
  const store = useStore();
  const navigate = useNavigate();
  const loading = useSimulatedLoad();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>("[data-pos-search]")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const checkout = () => {
    const order = store.completeSale("cash");
    setNotes("");
    toast.success(`Sale ${order.id} completed`);
    void navigate({ to: "/orders/$orderId", params: { orderId: order.id } });
  };

  return (
    <div className="flex min-h-0 flex-col gap-4 p-4 sm:p-6">
      <PageHeader
        title="Point of Sale"
        description="Ring up walk-in sales, apply discounts and take payment."
      />
      <DemoNote>
        Payments, receipt printing and cash-drawer hardware are simulated in this demo build.
      </DemoNote>
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_360px]">
        <ProductBrowser loading={loading} />
        <CartPanel notes={notes} onNotesChange={setNotes} onCheckout={checkout} />
      </div>
    </div>
  );
}
