"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutFormSchema, type CheckoutFormData } from "@/schemas/checkout.schema";
import { createOrder, initiatePayment } from "@/actions/checkout";
import { EcoCashWidget } from "./EcoCashWidget";
import { InnBucksWidget } from "./InnBucksWidget";
import { formatUSD, formatZWG, convertUsdToZwg } from "@/lib/utils/currency";
import {
  ChevronRight, ChevronLeft, Tag, X, Loader2, CheckCircle2,
  User, Mail, Phone, MapPin, Building2, Map, CreditCard, ClipboardList, Star,
  ShieldCheck, Truck, BadgeCheck, Store, Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ProductImage as Image } from "@/components/shared/ProductImage";
import { DeliveryProgressBar } from "@/app/(store)/cart/_components/DeliveryProgressBar";
import { STORE_PICKUP_LOCATION } from "@/lib/store-location";
import { FREE_DELIVERY_THRESHOLD_USD, DELIVERY_AREA_LABEL } from "@/lib/delivery";

const PROVINCES = [
  "Harare","Bulawayo","Manicaland","Mashonaland Central","Mashonaland East",
  "Mashonaland West","Masvingo","Matabeleland North","Matabeleland South","Midlands",
];

interface CartItem {
  id: string;
  quantity: number;
  product: { name: string; price: number | string | { toNumber: () => number }; images: string[] };
  variant?: { groupName: string; value: string } | null;
}

interface CheckoutFormProps {
  cartItems: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  defaultEmail?: string;
  defaultPhone?: string;
  defaultName?: string;
  blurMap?: Record<string, string>;
  zwgRate: number;
  /** Resolved on the server — InnBucks is hidden until it has real credentials. */
  innBucksEnabled: boolean;
}

interface AppliedCoupon {
  couponId: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  discountAmount: number;
}

const stepLabels = (isPickup: boolean) => ["Contact", isPickup ? "Pickup" : "Address", "Payment", "Review"];

export function CheckoutForm({
  cartItems,
  subtotal: initialSubtotal,
  deliveryFee: deliveryFeeProp,
  defaultEmail,
  defaultPhone,
  defaultName,
  blurMap = {},
  zwgRate,
  innBucksEnabled,
}: Omit<CheckoutFormProps, "total"> & { subtotal: number }) {
  const [step, setStep] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<Awaited<ReturnType<typeof initiatePayment>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const router = useRouter();

  const discount = appliedCoupon?.discountAmount ?? 0;

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      name: defaultName ?? "",
      email: defaultEmail ?? "",
      phone: defaultPhone ?? "",
      method: "ECOCASH",
      paymentCurrency: "USD",
      fulfillmentType: "DELIVERY",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const w = form.watch();

  // Collecting in store is always free, whatever the cart is worth.
  const isPickup = w.fulfillmentType === "PICKUP";
  const deliveryFee = isPickup ? 0 : deliveryFeeProp;
  const total = Math.max(0, initialSubtotal + deliveryFee - discount);
  const zwgTotal = convertUsdToZwg(total, zwgRate);

  const next = async () => {
    const paymentFields: (keyof CheckoutFormData)[] =
      w.method === "ECOCASH" ? ["method", "ecocashNumber"] :
      w.method === "INNBUCKS" ? ["method", "innbucksNumber"] :
      ["method"];

    const fields: (keyof CheckoutFormData)[][] = [
      ["name", "email", "phone"],
      isPickup ? ["fulfillmentType"] : ["line1", "city", "province"],
      paymentFields,
      [],
    ];
    const valid = await form.trigger(fields[step]);
    if (valid) {
      setStep((s) => Math.min(s + 1, 3));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal: initialSubtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(data);
        form.setValue("couponId", data.couponId);
        form.setValue("couponCode", data.code);
        form.setValue("discountAmount", data.discountAmount);
        setCouponInput("");
      } else {
        setCouponError(data.error);
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    form.setValue("couponId", undefined);
    form.setValue("couponCode", undefined);
    form.setValue("discountAmount", undefined);
  };

  const submitOrder = form.handleSubmit(async (data) => {
    if (orderId) return; // prevent double-submit if already created an order
    setLoading(true);
    setError(null);
    try {
      const result = await createOrder({ ...data, discountAmount: discount });
      if ("error" in result) { setError(result.error); setLoading(false); return; }

      setOrderId(result.orderId);

      if (data.method === "CASH_ON_DELIVERY") {
        router.push(`/checkout/success?order=${result.orderId}`);
        return;
      }

      const phone = data.method === "ECOCASH" ? data.ecocashNumber! : data.innbucksNumber!;
      const payment = await initiatePayment(
        result.orderId,
        phone || data.phone,
        data.method === "ECOCASH" ? (data.paymentCurrency ?? "USD") : "USD"
      );
      if (!payment.success) { setError(payment.error); setLoading(false); return; }
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
        amount={paymentResult.chargeAmount}
        currency={paymentResult.currency}
        usdAmount={paymentResult.amount}
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
        onSuccess={() => router.push(`/checkout/success?order=${orderId}`)}
        onFailed={() => setError("Payment failed. Please try again.")}
      />
    );
  }

  const STEPS = stepLabels(isPickup);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2">
    <div className="space-y-5">
      {/* Progress stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step
                ? "bg-(--color-success) text-white"
                : i === step
                ? "bg-(--color-primary) text-white ring-4 ring-primary/20"
                : "bg-(--color-surface-alt) text-(--color-text-muted)"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-(--color-primary)" : "text-(--color-text-muted)"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full transition-colors ${i < step ? "bg-(--color-success)" : "bg-(--color-border)"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-(--color-border) shadow-sm p-6">
        <form onSubmit={(e) => e.preventDefault()} noValidate>

          {/* Step 0: Contact */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-(--color-primary-light) flex items-center justify-center shrink-0">
                  <User size={14} className="text-(--color-primary)" />
                </span>
                Contact Information
              </h2>
              <Field label="Full Name" error={form.formState.errors.name?.message}>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
                  <input {...form.register("name")} type="text" placeholder="Your full name" className={iconInputCls} />
                </div>
              </Field>
              <Field label="Email Address" error={form.formState.errors.email?.message}>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
                  <input {...form.register("email")} type="email" placeholder="you@example.com" className={iconInputCls} />
                </div>
              </Field>
              <Field label="Phone Number" error={form.formState.errors.phone?.message}>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
                  <input {...form.register("phone")} type="tel" placeholder="07X XXXXXXX" className={iconInputCls} />
                </div>
                <p className="text-xs text-(--color-text-muted)">
                  Ordering from outside Zimbabwe? Include your country code, starting with +.
                </p>
              </Field>
            </div>
          )}

          {/* Step 1: Delivery or pickup */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-(--color-primary-light) flex items-center justify-center shrink-0">
                  {isPickup
                    ? <Store size={14} className="text-(--color-primary)" />
                    : <MapPin size={14} className="text-(--color-primary)" />}
                </span>
                How would you like to get your order?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FulfillmentOption
                  active={!isPickup}
                  onClick={() => form.setValue("fulfillmentType", "DELIVERY")}
                  icon={<Truck size={18} />}
                  label="Deliver to me"
                  desc={`To your door in ${DELIVERY_AREA_LABEL} — 2–4 business days`}
                  note={deliveryFeeProp === 0 ? "FREE delivery" : `${formatUSD(deliveryFeeProp)} delivery`}
                />
                <FulfillmentOption
                  active={isPickup}
                  onClick={() => form.setValue("fulfillmentType", "PICKUP")}
                  icon={<Store size={18} />}
                  label={`Collect at ${STORE_PICKUP_LOCATION.name}`}
                  desc="Pick it up in store once we tell you it's ready"
                  note="Always FREE"
                />
              </div>

              {isPickup ? (
                <div className="bg-(--color-surface-alt) rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={15} className="text-(--color-primary) mt-0.5 shrink-0" />
                    <div className="text-sm leading-relaxed">
                      <p className="font-semibold">{STORE_PICKUP_LOCATION.name}</p>
                      <p className="text-(--color-text-muted)">{STORE_PICKUP_LOCATION.line1}</p>
                      <p className="text-(--color-text-muted)">
                        {STORE_PICKUP_LOCATION.city}, {STORE_PICKUP_LOCATION.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-(--color-text-muted)">
                    <Clock size={15} className="shrink-0" />
                    <span>{STORE_PICKUP_LOCATION.hours}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-(--color-text-muted)">
                    <Phone size={15} className="shrink-0" />
                    <span>{STORE_PICKUP_LOCATION.phone}</span>
                  </div>
                  <p className="text-xs text-(--color-text-muted) bg-white rounded-lg px-3 py-2 border border-(--color-border)">
                    We&apos;ll message you as soon as your order is packed. Bring your order number and an ID to collect.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Field label="Street Address" error={form.formState.errors.line1?.message}>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
                      <input {...form.register("line1")} type="text" placeholder="123 Main Street" className={iconInputCls} />
                    </div>
                  </Field>
                  <Field label="Apartment / Suite (optional)">
                    <div className="relative">
                      <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
                      <input {...form.register("line2")} type="text" placeholder="Flat 4B" className={iconInputCls} />
                    </div>
                  </Field>
                  <Field label="City" error={form.formState.errors.city?.message}>
                    <div className="relative">
                      <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
                      <input {...form.register("city")} type="text" placeholder="Harare" className={iconInputCls} />
                    </div>
                  </Field>
                  <Field label="Province" error={form.formState.errors.province?.message}>
                    <div className="relative">
                      <Map size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none z-10" />
                      <select {...form.register("province")} className={`${iconInputCls} appearance-none`}>
                        <option value="">Select province…</option>
                        {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-(--color-primary-light) flex items-center justify-center shrink-0">
                  <CreditCard size={14} className="text-(--color-primary)" />
                </span>
                Payment Method
              </h2>
              <div className="space-y-3">
                <PaymentOption
                  value="ECOCASH"
                  current={w.method}
                  onChange={() => form.setValue("method", "ECOCASH")}
                  label="EcoCash"
                  badge="Most Popular"
                  desc="USSD push payment to your EcoCash number"
                  emoji="📱"
                  color="red"
                >
                  {w.method === "ECOCASH" && (
                    <div className="space-y-3">
                      <Field label="EcoCash Number" error={form.formState.errors.ecocashNumber?.message}>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
                          <input {...form.register("ecocashNumber")} type="tel" placeholder="077XXXXXXX" className={iconInputCls} />
                        </div>
                      </Field>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-(--color-text-primary)">Pay in</label>
                        <div className="grid grid-cols-2 gap-2.5">
                          <CurrencyChoice
                            active={(w.paymentCurrency ?? "USD") === "USD"}
                            onClick={() => form.setValue("paymentCurrency", "USD")}
                            flag="🇺🇸"
                            label="US Dollar"
                            amount={formatUSD(total)}
                          />
                          <CurrencyChoice
                            active={w.paymentCurrency === "ZWG"}
                            onClick={() => form.setValue("paymentCurrency", "ZWG")}
                            flag="🇿🇼"
                            label="ZiG"
                            amount={formatZWG(zwgTotal)}
                          />
                        </div>
                        {w.paymentCurrency === "ZWG" && (
                          <p className="flex items-center gap-1.5 text-xs text-(--color-text-muted) bg-(--color-surface-alt) rounded-lg px-2.5 py-2">
                            <ShieldCheck size={13} className="text-(--color-success) shrink-0" />
                            You&apos;ll be charged <strong className="price">{formatZWG(zwgTotal)}</strong> at today&apos;s rate of US$1 = {zwgRate} ZiG.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </PaymentOption>

                {innBucksEnabled && (
                  <PaymentOption
                    value="INNBUCKS"
                    current={w.method}
                    onChange={() => form.setValue("method", "INNBUCKS")}
                    label="InnBucks"
                    desc="Pay via InnBucks app — push or QR code"
                    emoji="💳"
                    color="blue"
                  >
                    {w.method === "INNBUCKS" && (
                      <Field label="InnBucks Number (optional)" error={form.formState.errors.innbucksNumber?.message}>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
                          <input {...form.register("innbucksNumber")} type="tel" placeholder="077XXXXXXX" className={iconInputCls} />
                        </div>
                      </Field>
                    )}
                  </PaymentOption>
                )}

                <PaymentOption
                  value="CASH_ON_DELIVERY"
                  current={w.method}
                  onChange={() => form.setValue("method", "CASH_ON_DELIVERY")}
                  label={isPickup ? "Cash on Collection" : "Cash on Delivery"}
                  desc={isPickup ? "Pay with cash in store when you collect" : "Pay with cash when your order arrives"}
                  emoji="💵"
                  color="amber"
                />
              </div>

              {/* Coupon code */}
              <div className="pt-2 border-t border-(--color-border)">
                <p className="text-sm font-medium mb-2">Promo Code</p>
                {appliedCoupon ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span className="flex-1 text-sm font-semibold text-emerald-700 font-mono">{appliedCoupon.code}</span>
                    <span className="text-sm text-emerald-600 font-medium">-{formatUSD(appliedCoupon.discountAmount)}</span>
                    <button type="button" onClick={removeCoupon} aria-label="Remove coupon" className="text-emerald-500 hover:text-emerald-700 transition-colors">
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                      placeholder="Enter promo code"
                      className={`${inputCls} flex-1 uppercase font-mono`}
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-(--color-surface-alt) border border-(--color-border) rounded-xl text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                      {couponLoading ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />}
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-600 mt-1.5">{couponError}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-(--color-primary-light) flex items-center justify-center shrink-0">
                  <ClipboardList size={14} className="text-(--color-primary)" />
                </span>
                Review & Confirm
              </h2>
              <div className="bg-(--color-surface-alt) rounded-xl p-4 space-y-2 text-sm">
                <p><span className="text-(--color-text-muted)">Name:</span> {w.name}</p>
                <p><span className="text-(--color-text-muted)">Email:</span> {w.email}</p>
                <p><span className="text-(--color-text-muted)">Phone:</span> {w.phone}</p>
                {isPickup ? (
                  <p>
                    <span className="text-(--color-text-muted)">Collect at:</span>{" "}
                    {STORE_PICKUP_LOCATION.name}, {STORE_PICKUP_LOCATION.line1}, {STORE_PICKUP_LOCATION.city}
                  </p>
                ) : (
                  <p><span className="text-(--color-text-muted)">Address:</span> {w.line1}{w.line2 ? `, ${w.line2}` : ""}, {w.city}, {w.province}</p>
                )}
                <p>
                  <span className="text-(--color-text-muted)">Payment:</span>{" "}
                  {w.method === "ECOCASH"
                    ? `EcoCash · ${w.paymentCurrency === "ZWG" ? `${formatZWG(zwgTotal)} (ZiG)` : `${formatUSD(total)} (USD)`}`
                    : w.method === "INNBUCKS" ? "InnBucks" : isPickup ? "Cash on Collection" : "Cash on Delivery"}
                </p>
              </div>
              <div className="space-y-1.5 text-sm">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="line-clamp-1 flex-1">
                      {item.product.name}
                      {item.variant ? <span className="text-(--color-text-muted)"> ({item.variant.groupName}: {item.variant.value})</span> : ""}
                      {" "}×{item.quantity}
                    </span>
                    <span className="price ml-3">{formatUSD(Number(item.product.price) * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-(--color-border) pt-2 flex justify-between">
                  <span>{isPickup ? "Collection" : "Delivery"}</span>
                  <span className="price">{deliveryFee === 0 ? "FREE" : formatUSD(deliveryFee)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="price">-{formatUSD(appliedCoupon.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="price text-(--color-primary)">{formatUSD(total)}</span>
                </div>
              </div>

              {w.method === "CASH_ON_DELIVERY" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                  💵 You will pay <strong>{formatUSD(total)}</strong> in cash{" "}
                  {isPickup
                    ? `when you collect at ${STORE_PICKUP_LOCATION.name}. We'll let you know once your order is ready.`
                    : "when your order is delivered. Our team will contact you to confirm."}
                </div>
              )}

              {isPickup && w.method !== "CASH_ON_DELIVERY" && (
                <div className="bg-(--color-surface-alt) border border-(--color-border) rounded-xl p-3 text-sm">
                  🏬 Collect at <strong>{STORE_PICKUP_LOCATION.name}</strong>, {STORE_PICKUP_LOCATION.line1},{" "}
                  {STORE_PICKUP_LOCATION.city} · {STORE_PICKUP_LOCATION.hours}. We&apos;ll message you when it&apos;s ready.
                </div>
              )}
            </div>
          )}

          {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mt-4">{error}</p>}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button type="button" onClick={back} className="flex items-center gap-1 px-5 py-2.5 border border-(--color-border) rounded-xl text-sm font-medium hover:bg-(--color-surface-alt) transition-colors">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={next}
                className="flex-1 flex items-center justify-center gap-2 bg-(--color-accent) hover:bg-(--color-accent-dark) active:scale-[0.98] text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={submitOrder}
                disabled={loading}
                className="flex-1 bg-(--color-accent) hover:bg-(--color-accent-dark) active:scale-[0.98] disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                {loading ? "Processing…" : w.method === "CASH_ON_DELIVERY" ? "Place Order" : "Place Order & Pay"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
    </div>

    {/* Order summary sidebar */}
    <div className="lg:col-span-1">
      <div className="bg-white border border-(--color-border) rounded-2xl p-5 space-y-4 sticky top-24 shadow-sm">
        <h2 className="font-semibold text-base">Order Summary</h2>

        {isPickup ? (
          <div className="flex items-start gap-2 bg-(--color-surface-alt) rounded-xl px-3 py-2.5 text-xs">
            <Store size={14} className="text-(--color-primary) mt-0.5 shrink-0" />
            <span>
              Collecting at <strong>{STORE_PICKUP_LOCATION.name}</strong> — {STORE_PICKUP_LOCATION.line1},{" "}
              {STORE_PICKUP_LOCATION.city}
            </span>
          </div>
        ) : initialSubtotal < FREE_DELIVERY_THRESHOLD_USD && (
          <div className="bg-(--color-accent-light) rounded-xl px-3 py-2.5 text-xs">
            Add <strong className="price">{formatUSD(FREE_DELIVERY_THRESHOLD_USD - initialSubtotal)}</strong> more for free delivery!
            <DeliveryProgressBar percent={(initialSubtotal / FREE_DELIVERY_THRESHOLD_USD) * 100} />
          </div>
        )}

        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-(--color-surface-alt)">
                <Image
                  src={item.product.images[0] ?? "/placeholder.svg"}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  blurDataURL={blurMap[item.product.images[0]]}
                />
              </div>
              <span className="line-clamp-2 flex-1 text-(--color-text-muted) text-xs leading-tight">
                {item.product.name} ×{item.quantity}
              </span>
              <span className="price font-medium text-xs shrink-0 ml-1">
                {formatUSD(Number(item.product.price) * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-(--color-border) pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-(--color-text-muted)">Subtotal</span>
            <span className="price">{formatUSD(initialSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-(--color-text-muted)">{isPickup ? "Collection" : "Delivery"}</span>
            <span className={`price ${deliveryFee === 0 ? "text-(--color-success) font-semibold" : ""}`}>
              {deliveryFee === 0 ? "FREE" : formatUSD(deliveryFee)}
            </span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount ({appliedCoupon.code})</span>
              <span className="price">-{formatUSD(appliedCoupon.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t border-(--color-border)">
            <span>Total</span>
            <span className="price text-(--color-primary)">{formatUSD(total)}</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1 border-t border-(--color-border)">
          <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
            <ShieldCheck size={13} className="text-(--color-success) shrink-0" />
            <span>Secure checkout</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
            {isPickup ? <Store size={13} className="shrink-0" /> : <Truck size={13} className="shrink-0" />}
            <span>{isPickup ? `Free collection at ${STORE_PICKUP_LOCATION.name}` : `Delivery in ${DELIVERY_AREA_LABEL}`}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
            <BadgeCheck size={13} className="shrink-0" />
            <span>Quality guaranteed on every item</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

function FulfillmentOption({ active, onClick, icon, label, desc, note }: {
  active: boolean; onClick: () => void; icon: React.ReactNode;
  label: string; desc: string; note: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-left rounded-xl border-2 p-4 transition-all h-full ${
        active
          ? "border-(--color-primary) bg-(--color-primary-light)"
          : "border-(--color-border) hover:border-gray-300 bg-white"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={active ? "text-(--color-primary)" : "text-(--color-text-muted)"}>{icon}</span>
        <span className="font-semibold text-sm flex-1">{label}</span>
        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-(--color-primary)" : "border-(--color-border)"}`}>
          {active && <span className="w-2 h-2 rounded-full bg-(--color-primary)" />}
        </span>
      </div>
      <p className="text-xs text-(--color-text-muted) mt-1.5 leading-relaxed">{desc}</p>
      <p className="text-xs font-semibold text-(--color-success) mt-1.5">{note}</p>
    </button>
  );
}

function CurrencyChoice({ active, onClick, flag, label, amount }: {
  active: boolean; onClick: () => void; flag: string; label: string; amount: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
        active
          ? "border-(--color-primary) bg-(--color-primary-light)"
          : "border-(--color-border) hover:border-gray-300 bg-white"
      }`}
    >
      <span className="text-xl leading-none">{flag}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight">{label}</p>
        <p className="price text-xs text-(--color-text-muted) leading-tight">{amount}</p>
      </div>
      <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-(--color-primary)" : "border-(--color-border)"}`}>
        {active && <div className="w-2 h-2 rounded-full bg-(--color-primary)" />}
      </div>
    </button>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-(--color-text-primary)">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function PaymentOption({ value, current, onChange, label, badge, desc, emoji, color = "primary", children }: {
  value: string; current: string; onChange: () => void;
  label: string; badge?: string; desc: string; emoji: string;
  color?: "primary" | "red" | "blue" | "amber";
  children?: React.ReactNode;
}) {
  const selected = current === value;
  const styles = {
    primary: { card: "border-(--color-primary) bg-(--color-primary-light)", radio: "border-(--color-primary)", dot: "bg-(--color-primary)" },
    red:     { card: "border-red-400 bg-red-50",     radio: "border-red-400",   dot: "bg-red-400"   },
    blue:    { card: "border-blue-400 bg-blue-50",   radio: "border-blue-400",  dot: "bg-blue-400"  },
    amber:   { card: "border-amber-400 bg-amber-50", radio: "border-amber-400", dot: "bg-amber-400" },
  };
  const s = styles[color];
  return (
    <div
      onClick={onChange}
      className={`rounded-xl border-2 p-4 cursor-pointer transition-all space-y-3 ${selected ? s.card : "border-(--color-border) hover:border-gray-300 hover:bg-gray-50/50"}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? s.radio : "border-(--color-border)"}`}>
          {selected && <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />}
        </div>
        <span className="text-xl">{emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{label}</span>
            {badge && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-amber-400 text-white px-2 py-0.5 rounded-full font-semibold tracking-wide">
                <Star size={9} fill="currentColor" strokeWidth={0} />
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-(--color-text-muted) mt-0.5">{desc}</p>
        </div>
      </div>
      {selected && children && <div onClick={(e) => e.stopPropagation()}>{children}</div>}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) transition-colors bg-white";
const iconInputCls = "w-full pl-10 pr-4 py-2.5 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) transition-colors bg-white";
