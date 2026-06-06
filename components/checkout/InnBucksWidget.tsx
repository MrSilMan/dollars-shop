"use client";

import { useState, useEffect, useRef } from "react";
import { formatUSD } from "@/lib/utils/currency";
import Image from "next/image";
import { Loader2, Smartphone, QrCode, CheckCircle, XCircle, MessageCircle } from "lucide-react";

async function pollInnBucksStatus(transactionRef: string) {
  const res = await fetch(`/api/payment/status/innbucks/${transactionRef}`);
  const data = await res.json();
  return data.status as "PENDING" | "PAID" | "FAILED";
}

interface InnBucksWidgetProps {
  orderId: string;
  amount: number;
  qrCode?: string;
  transactionRef: string;
  customerPhone?: string;
  onSuccess: () => void;
  onFailed: () => void;
}

type Status = "polling" | "paid" | "failed" | "timeout";

export function InnBucksWidget({ orderId, amount, qrCode, transactionRef, customerPhone, onSuccess, onFailed }: InnBucksWidgetProps) {
  const [mode, setMode] = useState<"push" | "qr">(customerPhone ? "push" : "qr");
  const [status, setStatus] = useState<Status>("polling");
  const [seconds, setSeconds] = useState(300);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const poll = async () => {
      const result = await pollInnBucksStatus(transactionRef);
      if (result === "PAID") {
        setStatus("paid");
        clearInterval(intervalRef.current!);
        setTimeout(onSuccess, 1500);
      } else if (result === "FAILED") {
        setStatus("failed");
        clearInterval(intervalRef.current!);
        onFailed();
      }
    };

    intervalRef.current = setInterval(poll, 5000);
    const countdown = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(countdown);
          clearInterval(intervalRef.current!);
          setStatus("timeout");
          onFailed();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    poll();

    return () => {
      clearInterval(intervalRef.current!);
      clearInterval(countdown);
    };
  }, [transactionRef, onSuccess, onFailed]);

  if (status === "paid") {
    return (
      <div className="rounded-2xl border border-(--color-border) p-6 text-center space-y-4">
        <CheckCircle size={40} className="text-(--color-success) mx-auto" />
        <p className="font-semibold text-(--color-success)">Payment Received!</p>
        <p className="text-sm text-(--color-text-muted)">Redirecting to your order confirmation…</p>
      </div>
    );
  }

  if (status === "failed" || status === "timeout") {
    return (
      <div className="rounded-2xl border border-(--color-border) p-6 text-center space-y-4">
        <XCircle size={40} className="text-(--color-primary) mx-auto" />
        <p className="font-semibold text-(--color-primary)">
          {status === "timeout" ? "Payment Timed Out" : "Payment Failed"}
        </p>
        <p className="text-sm text-(--color-text-muted)">
          {status === "timeout"
            ? "The payment window expired. Please try again."
            : "Your payment was not completed. Please try again."}
        </p>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "263772566468"}?text=Hi, I need help with my order ${orderId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#1da851] transition-colors"
        >
          <MessageCircle size={16} />
          Get Help on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-(--color-border) p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          Amount: <span className="price text-(--color-primary)">{formatUSD(amount)}</span>
        </p>
        <div className="flex bg-(--color-surface-alt) rounded-full p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => setMode("push")}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${mode === "push" ? "bg-white shadow-sm text-(--color-primary)" : "text-(--color-text-muted)"}`}
          >
            <Smartphone size={12} />
            Number Push
          </button>
          <button
            type="button"
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
            <span>Waiting for payment… {seconds}s</span>
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
            <span>Waiting for payment… {seconds}s</span>
          </div>
          <p className="text-xs text-(--color-text-muted)">Ref: {transactionRef}</p>
        </div>
      )}
    </div>
  );
}
