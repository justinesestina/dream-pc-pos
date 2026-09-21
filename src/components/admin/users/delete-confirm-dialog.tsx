import { useState, useEffect } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * GitHub-style destructive confirmation dialog.
 * The user must type the exact username before the delete button becomes enabled.
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  displayName,
  username,
  busy,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Friendly display name shown in the header, e.g. "Parvitkumar" */
  displayName: string;
  /** The value the user must type to confirm, e.g. "parvitkumar" */
  username: string;
  busy?: boolean;
  onConfirm: () => void;
}) {
  const [typed, setTyped] = useState("");

  // Reset the input whenever the dialog opens/closes
  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  const isMatch = typed === username;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md p-0 overflow-hidden border-destructive/30 shadow-2xl">
        {/* Danger header */}
        <div className="relative overflow-hidden bg-destructive/10 px-6 pt-6 pb-5 border-b border-destructive/20">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent" />
          <div className="relative flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/15 border border-destructive/30 text-destructive shadow-sm">
              <AlertTriangle className="size-6" />
            </div>
            <AlertDialogHeader className="text-left space-y-1.5 p-0">
              <AlertDialogTitle className="text-lg font-black text-foreground tracking-tight">
                Delete {displayName}?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                This action <strong className="text-destructive font-bold">cannot be undone</strong>. The account and all
                its role assignments will be permanently removed. Login and activity history is retained for audit purposes.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
        </div>

        {/* Confirmation input */}
        <div className="px-6 py-5 space-y-4">
          <div className="rounded-xl bg-destructive/5 border border-destructive/15 p-4">
            <Label
              htmlFor="delete-confirm-input"
              className="text-sm text-foreground leading-relaxed block mb-3"
            >
              To confirm, type{" "}
              <strong className="font-black text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                {username}
              </strong>{" "}
              below:
            </Label>
            <Input
              id="delete-confirm-input"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={username}
              autoComplete="off"
              spellCheck={false}
              className="h-11 font-mono text-sm bg-background/80 border-destructive/30 focus-visible:ring-destructive/40 placeholder:text-muted-foreground/40"
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <AlertDialogFooter className="px-6 pb-6 pt-0 gap-3 sm:gap-3">
          <AlertDialogCancel disabled={busy} className="h-10 px-5 font-semibold">
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!isMatch || busy}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="h-10 px-5 font-bold shadow-sm gap-2"
          >
            <Trash2 className="size-4" />
            {busy ? "Deleting…" : "I understand, delete this user"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
