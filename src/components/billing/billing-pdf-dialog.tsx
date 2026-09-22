import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createBillingPdf } from "@/lib/billing-pdf";
import type { BillingStatement, Customer } from "@/lib/types";

/**
 * View the whole billing statement as a real PDF inside the app, with options
 * to open it in the browser (printable) or download the actual file.
 */
export function BillingPdfDialog({
  open,
  onOpenChange,
  statement,
  customer,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  statement: BillingStatement;
  customer?: Customer | undefined;
}) {
  const [pdf, setPdf] = useState<{ url: string | URL; download: () => void } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setBusy(true);
    createBillingPdf(statement, customer).then((created) => {
      if (!active) return;
      setPdf({
        url: created.url,
        download: () => created.doc.save(`${statement.id}.pdf`),
      });
      setBusy(false);
    });
    return () => {
      active = false;
    };
  }, [open, statement, customer]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <span className="mono">{statement.id}</span> — whole statement as PDF
          </DialogTitle>
        </DialogHeader>

        <div className="h-[62vh] w-full overflow-hidden rounded-lg border border-border bg-surface/60">
          {busy || !pdf ? (
            <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
              Generating PDF…
            </div>
          ) : (
            <iframe
              title={`${statement.id} PDF preview`}
              src={String(pdf.url)}
              className="h-full w-full"
            />
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            <X className="size-3.5" /> Close
          </Button>
          <Button
            variant="outline"
            onClick={() => pdf && window.open(String(pdf.url), "_blank", "noopener")}
          >
            <ExternalLink className="size-3.5" /> Open in browser
          </Button>
          <Button disabled={!pdf} onClick={() => pdf?.download()}>
            <Download className="size-3.5" /> Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
