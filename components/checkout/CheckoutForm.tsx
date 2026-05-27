"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutFormSchema, type CheckoutFormData } from "@/schemas/checkout.schema";
import { createOrder, initiatePayment } from "@/actions/checkout";
import { EcoCashWidget } from "./EcoCashWidget";
import { InnBucksWidget } from "./InnBucksWidget";
import { formatUSD } from "@/lib/utils/currency";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const PROVINCES = [
  "Harare","Bulawayo","Manicaland","Mashonaland Central","Mashonaland East",
  "Mashonaland West","Masvingo","Matabeleland North","Matabeleland South","Midlands",
];

interface CartItem {
  id: string;
  quantity: number;
  product: { name: string; price: number | string | { toNumber: () => number }; images: string[] };
}

interface CheckoutFormProps {
  cartItems: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  defaultEmail?: string;
  defaultPhone?: string;
  defaultName?: string;
}

const STEPS = ["Contact", "Address", "Payment", "Review"];

export function CheckoutForm({ cartItems, deliveryFee, total, defaultEmail, defaultPhone, defaultName }: Omit<CheckoutFormProps, "subtotal"> & { subtotal?: number }) {
  const [step, setStep] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<Awaited<ReturnType<typeof initiatePayment>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      name: defaultName ?? "",
      email: defaultEmail ?? "",
      phone: defaultPhone ?? "",
      method: "ECOCASH",
    },
  });

  const next = async () => {
    const fields: (keyof CheckoutFormData)[][] = [
      ["name", "email", "phone"],
      ["line1", "city", "province"],
      ["method"],
      [],
    ];
    const valid = await form.trigger(fields[step]);
    if (valid) setStep((s) => Math.min(s + 1, 3));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = form.handleSubmit(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createOrder(data);
      if ("error" in result) { setError(result.error); setLoading(false); return; }

      setOrderId(result.orderId);
      const phone = data.method === "ECOCASH" ? data.ecocashNumber! : data.innbucksNumber!;
      const payment = await initiatePayment(result.orderId, phone || data.phone);
      setPaymentResult(payment);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  });

  if (paymentResult?.success && paymentResult.method === "ECOCASH") {
    return (
      <EcoCashWidget
        orderId={orderId!}
        transactionId={paymentResult.transactionId}
        amount={paymentResult.amount}
        customerPhone={form.getValues("ecocashNumber") || form.getValues("phone")}
        onSuccess={() => router.push(`/checkout/success?order=${orderId}`)}
        onFailed={() => setError("Payment failed. Please try again.")}
      />
    );
  }

  if (paymentResult?.success && paymentResult.method === "INNBUCKS") {
    return (
      <InnBucksWidget
        orderId={orderId!}
        amount={paymentResult.amount}
        qrCode={paymentResult.qrCode}
        transactionRef={paymentResult.transactionRef}
        customerPhone={form.getValues("innbucksNumber") || form.getValues("phone")}
      />
    );
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const w = form.watch();

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i < step ? "bg-(--color-success) text-white" : i === step ? "bg-(--color-primary) text-white" : "bg-(--color-surface-alt) text-(--color-text-muted)"}`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-(--color-primary)" : "text-(--color-text-muted)"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-(--color-success)" : "bg-(--color-border)"}`} />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Step 0: Contact */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Contact Information</h2>
            <Field label="Full Name" error={form.formState.errors.name?.message}>
              <input {...form.register("name")} type="text" placeholder="Your full name" className={inputCls} />
            </Field>
            <Field label="Email Address" error={form.formState.errors.email?.message}>
              <input {...form.register("email")} type="email" placeholder="you@example.com" className={inputCls} />
            </Field>
            <Field label="Phone Number" error={form.formState.errors.phone?.message}>
              <input {...form.register("phone")} type="tel" placeholder="07X XXXXXXX" className={inputCls} />
            </Field>
          </div>
        )}

        {/* Step 1: Address */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Delivery Address</h2>
            <Field label="Street Address" error={form.formState.errors.line1?.message}>
              <input {...form.register("line1")} type="text" placeholder="123 Main Street" className={inputCls} />
            </Field>
            <Field label="Apartment / Suite (optional)">
              <input {...form.register("line2")} type="text" placeholder="Flat 4B" className={inputCls} />
            </Field>
            <Field label="City" error={form.formState.errors.city?.message}>
              <input {...form.register("city")} type="text" placeholder="Harare" className={inputCls} />
            </Field>
            <Field label="Province" error={form.formState.errors.province?.message}>
              <select {...form.register("province")} className={inputCls}>
                <option value="">Select province…</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Payment Method</h2>
            <div className="space-y-3">
              <PaymentOption
                value="ECOCASH"
                current={w.method}
                onChange={() => form.setValue("method", "ECOCASH")}
                label="EcoCash"
                badge="Most Popular ⭐"
                desc="USSD push payment to your EcoCash number"
                emoji="📱"
              >
                {w.method === "ECOCASH" && (
                  <Field label="EcoCash Number" error={form.formState.errors.ecocashNumber?.message}>
                    <input {...form.register("ecocashNumber")} type="tel" placeholder="077XXXXXXX" className={inputCls} />
                  </Field>
                )}
              </PaymentOption>

              <PaymentOption
                value="INNBUCKS"
                current={w.method}
                onChange={() => form.setValue("method", "INNBUCKS")}
                label="InnBucks"
                desc="Pay via InnBucks app — push or QR code"
                emoji="💳"
              >
                {w.method === "INNBUCKS" && (
                  <Field label="InnBucks Number (optional)">
                    <input {...form.register("innbucksNumber")} type="tel" placeholder="077XXXXXXX" className={inputCls} />
                  </Field>
                )}
              </PaymentOption>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Review & Confirm</h2>
            <div className="bg-(--color-surface-alt) rounded-xl p-4 space-y-2 text-sm">
              <p><span className="text-(--color-text-muted)">Name:</span> {w.name}</p>
              <p><span className="text-(--color-text-muted)">Email:</span> {w.email}</p>
              <p><span className="text-(--color-text-muted)">Phone:</span> {w.phone}</p>
              <p><span className="text-(--color-text-muted)">Address:</span> {w.line1}{w.line2 ? `, ${w.line2}` : ""}, {w.city}, {w.province}</p>
              <p><span className="text-(--color-text-muted)">Payment:</span> {w.method === "ECOCASH" ? "EcoCash" : "InnBucks"}</p>
            </div>
            <div className="space-y-1.5 text-sm">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="line-clamp-1 flex-1">{item.product.name} ×{item.quantity}</span>
                  <span className="price ml-3">{formatUSD(Number(item.product.price) * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-(--color-border) pt-2 flex justify-between">
                <span>Delivery</span>
                <span className="price">{deliveryFee === 0 ? "FREE" : formatUSD(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="price text-(--color-primary)">{formatUSD(total)}</span>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-(--color-primary) text-sm bg-(--color-primary-light) px-4 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button type="button" onClick={back} className="flex items-center gap-1 px-5 py-2.5 border border-(--color-border) rounded-xl text-sm font-medium hover:bg-(--color-surface-alt) transition-colors">
              <ChevronLeft size={16} /> Back
            </button>
          )}
          {step < 3 ? (
            <button type="button" onClick={next} className="flex-1 flex items-center justify-center gap-1 bg-(--color-primary) hover:bg-(--color-primary-dark) text-white font-semibold py-2.5 px-6 rounded-xl transition-colors">
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button type="submit" disabled={loading} className="flex-1 bg-(--color-primary) hover:bg-(--color-primary-dark) disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl transition-colors">
              {loading ? "Processing…" : "Place Order & Pay"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-(--color-text-primary)">{label}</label>
      {children}
      {error && <p className="text-xs text-(--color-primary)">{error}</p>}
    </div>
  );
}

function PaymentOption({ value, current, onChange, label, badge, desc, emoji, children }: {
  value: string; current: string; onChange: () => void;
  label: string; badge?: string; desc: string; emoji: string;
  children?: React.ReactNode;
}) {
  const selected = current === value;
  return (
    <div
      onClick={onChange}
      className={`rounded-xl border-2 p-4 cursor-pointer transition-colors space-y-3 ${selected ? "border-(--color-primary) bg-(--color-primary-light)" : "border-(--color-border) hover:border-primary/50"}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-(--color-primary)" : "border-(--color-border)"}`}>
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-(--color-primary)" />}
        </div>
        <span className="text-lg">{emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{label}</span>
            {badge && <span className="text-xs bg-(--color-accent) text-white px-2 py-0.5 rounded-full">{badge}</span>}
          </div>
          <p className="text-xs text-(--color-text-muted)">{desc}</p>
        </div>
      </div>
      {selected && children && <div onClick={(e) => e.stopPropagation()}>{children}</div>}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) transition-colors bg-white";
