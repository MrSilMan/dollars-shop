"use client";

import { useState } from "react";
import { formatUSD } from "@/lib/utils/currency";
import Image from "next/image";
import { Loader2, Smartphone, QrCode } from "lucide-react";

interface InnBucksWidgetProps {
  orderId: string;
  amount: number;
  qrCode?: string;
  transactionRef: string;
  customerPhone?: string;
}

export function InnBucksWidget({ amount, qrCode, transactionRef, customerPhone }: Omit<InnBucksWidgetProps, "orderId"> & { orderId?: string }) {
  const [mode, setMode] = useState<"push" | "qr">(customerPhone ? "push" : "qr");

  return (
    <div className="rounded-2xl border border-(--color-border) p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          Amount: <span className="price text-(--color-primary)">{formatUSD(amount)}</span>
        </p>
        <div className="flex bg-(--color-surface-alt) rounded-full p-0.5 gap-0.5">
          <button
            onClick={() => setMode("push")}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${mode === "push" ? "bg-white shadow-sm text-(--color-primary)" : "text-(--color-text-muted)"}`}
          >
            <Smartphone size={12} />
            Number Push
          </button>
          <button
            onClick={() => setMode("qr")}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${mode === "qr" ? "bg-white shadow-sm text-(--color-primary)" : "text-(--color-text-muted)"}`}
          >
            <QrCode size={12} />
            QR Code
          </button>
        </div>
      </div>

      {mode === "push" && (
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 bg-(--color-accent-light) rounded-full flex items-center justify-center mx-auto">
            <Smartphone size={22} className="text-(--color-accent)" />
          </div>
          <p className="text-sm text-(--color-text-muted)">
            A payment request has been sent to <strong>{customerPhone}</strong>. Open your InnBucks app to approve.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-(--color-text-muted)">
            <Loader2 size={14} className="animate-spin" />
            <span>Waiting for payment…</span>
          </div>
          <p className="text-xs text-(--color-text-muted)">Ref: {transactionRef}</p>
        </div>
      )}

      {mode === "qr" && (
        <div className="space-y-3 text-center">
          <p className="text-sm text-(--color-text-muted)">Scan this QR code with your InnBucks app</p>
          {qrCode ? (
            <div className="flex justify-center">
              <Image
                src={qrCode}
                alt="InnBucks QR Code"
                width={180}
                height={180}
                className="rounded-lg border border-(--color-border)"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-44 h-44 mx-auto bg-(--color-surface-alt) rounded-lg flex items-center justify-center">
              <QrCode size={48} className="text-(--color-text-muted)" />
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-sm text-(--color-text-muted)">
            <Loader2 size={14} className="animate-spin" />
            <span>Waiting for payment…</span>
          </div>
          <p className="text-xs text-(--color-text-muted)">Ref: {transactionRef}</p>
        </div>
      )}
    </div>
  );
}
