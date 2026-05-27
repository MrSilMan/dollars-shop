"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterFormData } from "@/schemas/user.schema";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      setError(body.error ?? "Registration failed");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    router.push("/account");
  };

  const inputCls = "w-full px-4 py-3 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-(--color-surface-alt)">
      <div className="w-full max-w-md bg-white rounded-2xl border border-(--color-border) p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <Image src="/images/logo-1.png" alt="Dollar Shop" width={160} height={60} className="h-14 w-auto object-contain mb-4" />
          </Link>
          <h1 className="font-display text-2xl font-bold">Create Account</h1>
          <p className="text-(--color-text-muted) text-sm mt-1">Join Dollar Shop for a better shopping experience</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Full Name</label>
            <input {...form.register("name")} type="text" autoComplete="name" placeholder="Your name" className={inputCls} />
            {form.formState.errors.name && <p className="text-xs text-(--color-primary)">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Email Address</label>
            <input {...form.register("email")} type="email" autoComplete="email" placeholder="you@example.com" className={inputCls} />
            {form.formState.errors.email && <p className="text-xs text-(--color-primary)">{form.formState.errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Phone (optional)</label>
            <input {...form.register("phone")} type="tel" placeholder="07X XXXXXXX" className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Password</label>
            <div className="relative">
              <input {...form.register("password")} type={showPwd ? "text" : "password"} autoComplete="new-password" placeholder="Min. 8 characters" className={`${inputCls} pr-10`} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)" aria-label={showPwd ? "Hide password" : "Show password"}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.formState.errors.password && <p className="text-xs text-(--color-primary)">{form.formState.errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Confirm Password</label>
            <input {...form.register("confirmPassword")} type="password" autoComplete="new-password" placeholder="Repeat password" className={inputCls} />
            {form.formState.errors.confirmPassword && <p className="text-xs text-(--color-primary)">{form.formState.errors.confirmPassword.message}</p>}
          </div>

          {error && <p className="text-sm text-(--color-primary) bg-(--color-primary-light) px-4 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-(--color-primary) hover:bg-(--color-primary-dark) disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors">
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-(--color-text-muted)">
            Already have an account?{" "}
            <Link href="/login" className="text-(--color-primary) font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
