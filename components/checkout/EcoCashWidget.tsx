"use client";

import { useState, useEffect, useRef } from "react";
import { formatUSD, formatMoney } from "@/lib/utils/currency";
import { Loader2, CheckCircle, XCircle, MessageCircle } from "lucide-react";

async function pollEcoCashStatus(transactionId: string) {
  const res = await fetch(`/api/payment/status/ecocash/${transactionId}`);
  const data = await res.json();
  return data.status as "PENDING" | "PAID" | "FAILED" | "CANCELLED";
}

interface EcoCashWidgetProps {
  orderId: string;
  transactionId: string;
  amount: number;
  currency: "USD" | "ZWG";
  usdAmount: number;
  customerPhone: string;
  onSuccess: () => void;
  onFailed: () => void;
}

type Status = "waiting" | "polling" | "paid" | "failed" | "timeout";

export function EcoCashWidget({ orderId, transactionId, amount, currency, usdAmount, customerPhone, onSuccess, onFailed }: EcoCashWidgetProps) {
  const [status, setStatus] = useState<Status>("polling");
  const [seconds, setSeconds] = useState(180);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const poll = async () => {
      const result = await pollEcoCashStatus(transactionId);
      if (result === "PAID") {
        setStatus("paid");
        clearInterval(intervalRef.current!);
        setTimeout(onSuccess, 1500);
      } else if (result === "FAILED" || result === "CANCELLED") {
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
  }, [transactionId, onSuccess, onFailed]);

  return (
    <div className="rounded-2xl border border-(--color-border) p-6 text-center space-y-4">
      <div className="w-16 h-16 bg-(--color-primary-light) rounded-full flex items-center justify-center mx-auto">
        <span className="text-2xl">📱</span>
      </div>

      {status === "polling" && (
        <>
          <div>
            <p className="font-semibold text-lg">Check Your Phone</p>
            <p className="text-(--color-text-muted) text-sm mt-1">
              A payment request of <span className="price font-bold text-(--color-primary)">{formatMoney(amount, currency)}</span> was sent to <strong>{customerPhone}</strong>
            </p>
            {currency === "ZWG" && (
              <p className="text-(--color-text-muted) text-xs mt-1">≈ {formatUSD(usdAmount)} · charged in ZiG</p>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-(--color-text-muted) text-sm">
            <Loader2 size={16} className="animate-spin text-(--color-primary)" />
            <span>Waiting for confirmation… {seconds}s</span>
          </div>
          <p className="text-xs text-(--color-text-muted)">Enter your EcoCash PIN when prompted on your phone</p>
        </>
      )}

      {status === "paid" && (
        <div className="space-y-2">
          <CheckCircle size={40} className="text-(--color-success) mx-auto" />
          <p className="font-semibold text-(--color-success)">Payment Received!</p>
          <p className="text-sm text-(--color-text-muted)">Redirecting to your order confirmation…</p>
        </div>
      )}

      {(status === "failed" || status === "timeout") && (
        <div className="space-y-3">
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
      )}
    </div>
  );
}
