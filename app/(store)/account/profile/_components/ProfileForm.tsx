"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/profile";
import { CheckCircle } from "lucide-react";

interface Props {
  name: string;
  email: string;
  phone: string;
}

const inputCls =
  "w-full px-4 py-3 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) transition-colors disabled:bg-(--color-surface-alt) disabled:text-(--color-text-muted)";

export default function ProfileForm({ name, email, phone }: Props) {
  const [state, action, pending] = useActionState(updateProfile, null);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">Full Name</label>
        <input
          name="name"
          type="text"
          defaultValue={name}
          autoComplete="name"
          required
          minLength={2}
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium">Email Address</label>
        <input
          type="email"
          value={email}
          disabled
          readOnly
          className={inputCls}
        />
        <p className="text-xs text-(--color-text-muted)">Email cannot be changed.</p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium">Phone Number</label>
        <input
          name="phone"
          type="tel"
          defaultValue={phone}
          autoComplete="tel"
          placeholder="07X XXXXXXX"
          className={inputCls}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-(--color-primary) bg-(--color-primary-light) px-4 py-2 rounded-lg">
          {state.error}
        </p>
      )}

      {state?.success && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">
          <CheckCircle size={16} />
          Profile updated successfully.
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-(--color-primary) hover:bg-(--color-primary-dark) disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm"
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
