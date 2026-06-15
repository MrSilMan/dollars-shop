"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterFormData } from "@/schemas/user.schema";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Star, Truck, BadgePercent } from "lucide-react";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

function RegisterContent() {
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account";

  const form = useForm<RegisterFormData>({ resolver: zodResolver(RegisterSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Registration failed. Please try again.");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    router.push("/account");
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    signIn("google", { callbackUrl });
  };

  const inputCls = "w-full px-4 py-3 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all bg-(--color-bg) placeholder:text-(--color-text-muted)/50";

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel (hidden on mobile) ── */}
      <div className="auth-panel-bg hidden lg:flex lg:w-[46%] flex-col relative overflow-hidden">
        <div className="auth-dot-grid absolute inset-0 opacity-[0.07]" />
        <div className="auth-orb-top absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20" />
        <div className="auth-orb-bottom absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-10" />

        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/">
            <Image src="/images/logo-1.png" alt="Dollar Shop" width={160} height={60}
                   className="h-12 w-auto object-contain brightness-0 invert" />
          </Link>

          <div className="flex-1 flex flex-col justify-center mt-12">
            <h2 className="text-white text-4xl font-bold leading-tight mb-4">
              Join thousands of<br />smart shoppers.
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-12 max-w-xs">
              Create your free account and unlock exclusive deals, fast delivery, and a seamless checkout experience.
            </p>

            <div className="space-y-4">
              {[
                { icon: Star,          text: "Member-only prices & early access" },
                { icon: Truck,         text: "Track every order in real time" },
                { icon: BadgePercent,  text: "Save wishlists & reorder in one tap" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="auth-feature-icon-bg w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-accent" />
                  </div>
                  <span className="text-white/75 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/30 text-xs">© {new Date().getFullYear()} Softwise Investments</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile-only branded top bar */}
        <div className="lg:hidden auth-panel-bg py-10 flex items-center justify-center">
          <Link href="/">
            <Image src="/images/logo-1.png" alt="Dollar Shop" width={140} height={52}
                   className="h-12 w-auto object-contain brightness-0 invert" />
          </Link>
        </div>

        {/* Form content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-(--color-text-primary) mb-1">Create account</h1>
            <p className="text-(--color-text-muted) text-sm">Join Dollar Shop — it only takes a minute</p>
          </div>

          {/* Google button — primary CTA */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-(--color-border) rounded-xl py-3 px-4 text-sm font-semibold text-(--color-text-primary) hover:bg-(--color-bg) active:scale-[0.99] disabled:opacity-60 transition-all duration-150 shadow-sm mb-5"
          >
            <GoogleIcon />
            {googleLoading ? "Redirecting…" : "Sign up with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-(--color-border)" />
            <span className="text-xs text-(--color-text-muted) font-medium">or sign up with email</span>
            <div className="flex-1 h-px bg-(--color-border)" />
          </div>

          {/* Registration form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">
                  Full Name
                </label>
                <input {...form.register("name")} type="text" autoComplete="name"
                       placeholder="Your name" className={inputCls} />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">
                  Email Address
                </label>
                <input {...form.register("email")} type="email" autoComplete="email"
                       placeholder="you@example.com" className={inputCls} />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">
                  Phone{" "}
                  <span className="normal-case font-normal text-(--color-text-muted)">— optional</span>
                </label>
                <input {...form.register("phone")} type="tel"
                       placeholder="07X XXXXXXX" className={inputCls} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input {...form.register("password")} type={showPwd ? "text" : "password"}
                         autoComplete="new-password" placeholder="Min. 8 chars"
                         className={`${inputCls} pr-10`} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors p-0.5"
                          aria-label={showPwd ? "Hide password" : "Show password"}>
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">
                  Confirm
                </label>
                <input {...form.register("confirmPassword")} type="password"
                       autoComplete="new-password" placeholder="Repeat"
                       className={inputCls} />
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                <span className="mt-px">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
                    className="w-full bg-(--color-primary) hover:bg-(--color-primary-dark) active:scale-[0.99] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all duration-150 shadow-sm">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-(--color-text-muted) text-xs leading-relaxed">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-(--color-primary) hover:underline">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-(--color-primary) hover:underline">Privacy Policy</Link>.
          </p>

          <p className="mt-4 text-center text-sm text-(--color-text-muted)">
            Already have an account?{" "}
            <Link href="/login" className="text-(--color-primary) font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}
