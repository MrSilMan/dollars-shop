"use client";

import { useState, useTransition } from "react";
import { Mail, Gift, CheckCircle, Zap, Tag, Bell } from "lucide-react";
import { subscribeToNewsletter } from "@/actions/newsletter";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await subscribeToNewsletter(email);
      setStatus(result.success ? "success" : "error");
      setMessage(result.message);
      if (result.success) setEmail("");
    });
  }

  return (
    <section className="relative overflow-hidden rounded-2xl" style={{ background: "linear-gradient(135deg, #1A4D3A 0%, #0F3326 60%, #143D2E 100%)" }}>
      {/* Decorative blobs */}
      <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />
      <div className="absolute -bottom-16 -left-8 w-48 h-48 rounded-full" style={{ background: "rgba(245,166,35,0.08)" }} />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.03)" }} />

      <div className="relative z-10 px-6 py-8 md:px-12 md:py-10">
        <div className="flex flex-col md:flex-row items-center gap-8">

          {/* Left: icon + text + perks */}
          <div className="flex-1 min-w-0 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              <Gift size={12} />
              Members-Only Deals
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
              Get Exclusive Deals<br className="hidden sm:block" /> Before Everyone Else
            </h2>
            <p className="text-white/60 text-sm mb-5">
              Flash sale alerts, promo codes & restocks — straight to your inbox.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {[
                { icon: Zap, label: "Flash sale alerts" },
                { icon: Tag,  label: "Exclusive coupons" },
                { icon: Bell, label: "Restock notices" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 bg-white/10 text-white/75 text-xs font-medium px-3 py-1.5 rounded-full">
                  <Icon size={12} className="text-[#F5A623]" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="w-full md:w-auto shrink-0 flex flex-col items-center md:items-start gap-3">
            {status === "success" ? (
              <div className="flex items-center gap-3 bg-white/15 border border-white/20 text-white font-semibold text-sm px-6 py-4 rounded-2xl w-full sm:w-auto">
                <CheckCircle size={20} className="text-green-300 shrink-0" />
                <span>{message}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 sm:w-72">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-9 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-white/40 bg-white/10 border border-white/20 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-7 py-3.5 font-bold text-sm text-white rounded-xl transition-colors shrink-0 disabled:opacity-60"
                  style={{ background: isPending ? "#b8791a" : "#F5A623" }}
                >
                  {isPending ? "Subscribing…" : "Get Deals"}
                </button>
              </form>
            )}

            {status === "error" && (
              <p className="text-red-300 text-xs flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-300 inline-block" />
                {message}
              </p>
            )}

            <p className="text-white/35 text-[11px]">
              No spam, ever. Unsubscribe at any time.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
