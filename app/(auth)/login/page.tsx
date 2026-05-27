"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginFormData } from "@/schemas/user.schema";
import { signIn, getSession } from "next-auth/react";
import { mergeGuestCart } from "@/actions/cart";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Suspense } from "react";

function LoginContent() {
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account";

  const form = useForm<LoginFormData>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", { ...data, redirect: false });
    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      await mergeGuestCart();
      const session = await getSession();
      const role = (session?.user as { role?: string })?.role;
      router.push(role === "ADMIN" ? "/admin" : callbackUrl);
    }
  };

  const inputCls = "w-full px-4 py-3 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-(--color-surface-alt)">
      <div className="w-full max-w-md bg-white rounded-2xl border border-(--color-border) p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <Image src="/images/logo-1.png" alt="Dollar Shop" width={160} height={60} className="h-14 w-auto object-contain mb-4" />
          </Link>
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="text-(--color-text-muted) text-sm mt-1">Sign in to your Dollar Shop account</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Email Address</label>
            <input {...form.register("email")} type="email" autoComplete="email" placeholder="you@example.com" className={inputCls} />
            {form.formState.errors.email && <p className="text-xs text-(--color-primary)">{form.formState.errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Password</label>
            <div className="relative">
              <input {...form.register("password")} type={showPwd ? "text" : "password"} autoComplete="current-password" placeholder="Your password" className={`${inputCls} pr-10`} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)" aria-label={showPwd ? "Hide password" : "Show password"}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-(--color-primary) bg-(--color-primary-light) px-4 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-(--color-primary) hover:bg-(--color-primary-dark) disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2 text-sm">
          <p className="text-(--color-text-muted)">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-(--color-primary) font-medium hover:underline">Create one</Link>
          </p>
          <Link href="/" className="block text-(--color-text-muted) hover:text-(--color-primary) transition-colors">← Continue as Guest</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
