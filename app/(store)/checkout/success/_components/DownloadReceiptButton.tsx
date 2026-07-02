"use client";
import { Download } from "lucide-react";

export function DownloadReceiptButton({ orderId }: { orderId: string }) {
  return (
    <a
      href={`/api/orders/${orderId}/receipt`}
      className="inline-flex items-center gap-2 text-sm text-(--color-text-muted) hover:text-(--color-primary) transition-colors print:hidden"
    >
      <Download size={15} />
      Download Receipt (PDF)
    </a>
  );
}
