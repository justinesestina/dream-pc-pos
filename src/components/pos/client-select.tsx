import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/nexus/primitives";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { CLIENT_TYPES, clientTypeInfo, type ClientTypeInfo } from "@/lib/client-types";
import type { ClientType } from "@/lib/types";

/** A client attached to a sale. Populated by the Clients feature once available. */
export interface ClientRecord {
  id: string;
  name: string;
  code?: string;
  contact?: string;
  details?: string;
}

function ClientSelectModal({
  type,
  open,
  onOpenChange,
}: {
  type: ClientTypeInfo;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const store = useStore();
  const [query, setQuery] = useState("");
  // The actual client directory comes from the Clients feature. Until that exists,
  // this list stays empty and the modal shows its empty state.
  const [clients] = useState<ClientRecord[]>([]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.code?.toLowerCase().includes(q) ?? false) ||
        (c.contact?.toLowerCase().includes(q) ?? false),
    );
  }, [clients, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <type.icon className="size-4 text-muted-foreground" />
            Select {type.label.toLowerCase()} client
          </DialogTitle>
          <DialogDescription className="mono text-[11px] text-subtle">
            {type.code}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${type.label.toLowerCase()} clients…`}
            className="h-9 pl-8 text-[13px]"
            autoFocus
          />
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={type.icon}
            title="No clients yet"
            description={`${type.label} clients will be listed here for selection once added.`}
            className="py-10"
          />
        ) : (
          <ul
            className="max-h-72 divide-y divide-border overflow-y-auto rounded-md border border-border"
            data-lenis-prevent
          >
            {list.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    store.setCartCustomer(c.id);
                    onOpenChange(false);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-elevated"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-elevated text-muted-foreground">
                    <type.icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-foreground">{c.name}</span>
                    {(c.contact ?? c.details) && (
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {c.contact ?? c.details}
                      </span>
                    )}
                  </span>
                  <Check
                    className={cn(
                      "size-3.5 shrink-0",
                      store.cartCustomerId === c.id ? "text-info" : "text-transparent",
                    )}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Client-type picker for the current sale. Picking a type opens the client modal. */
export function ClientSelector() {
  const store = useStore();
  const [modalType, setModalType] = useState<ClientType | null>(null);
  const active = clientTypeInfo(store.cartClientType);
  const selected = store.customerById(store.cartCustomerId);

  const openType = (type: ClientType) => {
    store.setCartClientType(type);
    setModalType(type);
  };

  const modal = modalType ? clientTypeInfo(modalType) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="label-tech">Client</span>
        {selected && (
          <Button
            size="icon"
            variant="ghost"
            className="size-6"
            aria-label="Clear client"
            onClick={() => {
              store.setCartCustomer(null);
              store.setCartClientType("walk-in");
            }}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {CLIENT_TYPES.map((t) => {
          const isActive = t.id === store.cartClientType;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => openType(t.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md border px-1.5 py-2 transition-colors",
                isActive
                  ? "border-foreground/30 bg-foreground/10 text-foreground"
                  : "border-border bg-elevated text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              <t.icon className="size-3.5" />
              <span className="text-[11.5px] font-medium">{t.label}</span>
              <span className={cn("mono text-[9px] tracking-wide", isActive ? "text-info" : "text-subtle")}>
                {t.code}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mono truncate text-[11px] text-subtle">
        {active.code} · {selected?.name ?? "No client selected"}
      </p>

      {modal && (
        <ClientSelectModal
          key={modal.id}
          type={modal}
          open={modalType !== null}
          onOpenChange={(v) => {
            if (!v) setModalType(null);
          }}
        />
      )}
    </div>
  );
}