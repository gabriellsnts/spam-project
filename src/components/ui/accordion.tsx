import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function Accordion({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

export function AccordionItem({ children, className }: { children: React.ReactNode; value?: string; className?: string }) {
  return <div className={cn("border border-border rounded-lg overflow-hidden", className)}>{children}</div>;
}

export function AccordionTrigger({ children, onClick, isOpen }: { children: React.ReactNode; onClick?: () => void; isOpen?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between p-4 font-medium transition-all hover:bg-muted/50 text-sm text-left"
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
    </button>
  );
}

export function AccordionContent({ children, isOpen }: { children: React.ReactNode; isOpen?: boolean }) {
  if (!isOpen) return null;
  return <div className="p-4 pt-0 border-t border-border bg-card text-sm">{children}</div>;
}
