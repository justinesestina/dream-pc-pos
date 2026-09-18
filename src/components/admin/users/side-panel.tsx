import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const SidePanelTitle = SheetTitle;
export const SidePanelDescription = SheetDescription;

export function SidePanelHeader({ children }: { children: ReactNode }) {
  return <SheetHeader>{children}</SheetHeader>;
}

export function SidePanelBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex-1 overflow-y-auto py-4", className)}>{children}</div>;
}

export function SidePanelFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <SheetFooter className={cn("border-t border-border py-4", className)}>{children}</SheetFooter>
  );
}

/** Right-hand drawer used for quick assignment/editing workflows. */
export function SidePanel({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  widthClass = "sm:max-w-md",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  widthClass?: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={`overflow-y-auto pb-0 ${widthClass}`}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 py-4">{children}</div>
        {footer && <SheetFooter className="border-t border-border py-4">{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
