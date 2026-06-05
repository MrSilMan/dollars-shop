"use client";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 text-sm text-(--color-text-muted) hover:text-(--color-primary) transition-colors print:hidden"
    >
      <Printer size={15} />
      Save / Print receipt
    </button>
  );
}
