"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { ROLE_LABELS } from "@/lib/permissions";
import { adminLandingPage } from "@/lib/permissions";

const inputCls = "w-full px-4 py-3 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all bg-(--color-bg) placeholder:text-(--color-text-muted)/50";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [invite, setInvite]   = useState<{ email: string; role: string } | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName]         = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) { setInviteError("Missing invitation token."); setLoading(false); return; }
    fetch(`/api/auth/accept-invite?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setInviteError(data.error);
        else setInvite(data);
      })
      .catch(() => setInviteError("Could not load invitation."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setFormError("Passwords do not match."); return; }
    if (password.length < 8)  { setFormError("Password must be at least 8 characters."); return; }
    setSubmitting(true);
    setFormError(null);
    const res = await fetch("/api/auth/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name, password }),
    });
    const body = await res.json();
    if (!res.ok) { setFormError(body.error ?? "Something went wrong."); setSubmitting(false); return; }
    setDone(true);
    // Auto sign in
    await signIn("credentials", { email: body.email, password, redirect: false });
    router.push(adminLandingPage(invite?.role ?? ""));
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="auth-panel-bg py-10 flex items-center justify-center">
        <Link href="/">
          <Image src="/images/logo-1.png" alt="Dollar Shop" width={140} height={52}
                 className="h-12 w-auto object-contain brightness-0 invert" />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {loading && (
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 size={32} className="animate-spin text-(--color-primary)" />
              <p className="text-sm text-(--color-text-muted)">Validating invitation…</p>
            </div>
          )}

          {!loading && inviteError && (
            <div className="text-center space-y-4">
              <XCircle size={48} className="mx-auto text-red-400" />
              <h1 className="text-xl font-bold text-(--color-text-primary)">Invalid Invitation</h1>
              <p className="text-sm text-(--color-text-muted)">{inviteError}</p>
              <Link href="/login" className="inline-block mt-2 text-sm text-(--color-primary) font-semibold hover:underline">
                Go to Sign In
              </Link>
            </div>
          )}

          {!loading && invite && !done && (
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-bold text-(--color-text-primary) mb-1">Accept Invitation</h1>
                <p className="text-(--color-text-muted) text-sm">
                  You've been invited as <strong className="text-(--color-primary)">{ROLE_LABELS[invite.role] ?? invite.role}</strong>
                </p>
              </div>

              <div className="bg-(--color-surface-alt) rounded-xl px-4 py-3 mb-6 text-sm">
                <span className="text-(--color-text-muted)">Joining as: </span>
                <span className="font-semibold text-(--color-text-primary)">{invite.email}</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">Full Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                         placeholder="Your name" className={inputCls} />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <input type={showPwd ? "text" : "password"} required value={password}
                           onChange={e => setPassword(e.target.value)}
                           placeholder="Min. 8 chars" className={`${inputCls} pr-10`} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors p-0.5">
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">Confirm Password</label>
                  <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                         placeholder="Repeat password" className={inputCls} />
                </div>

                {formError && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                    <span className="mt-px">⚠</span><span>{formError}</span>
                  </div>
                )}

                <button type="submit" disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-dark) disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all">
                  {submitting ? <><Loader2 size={15} className="animate-spin" /> Setting up…</> : "Activate Account"}
                </button>
              </form>
            </>
          )}

          {done && (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="mx-auto text-green-500" />
              <h1 className="text-xl font-bold">Account activated!</h1>
              <p className="text-sm text-(--color-text-muted)">Redirecting you to your dashboard…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteContent />
    </Suspense>
  );
}
