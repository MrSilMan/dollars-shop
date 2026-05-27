"use client";

import Link from "next/link";

export default function StoreError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
      <p className="text-4xl">😕</p>
      <h2 className="font-display text-xl font-bold">Something went wrong</h2>
      <p className="text-(--color-text-muted) text-sm">{error.message}</p>
      <div className="flex gap-3 justify-center">
        <button onClick={reset} className="bg-(--color-primary) text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-(--color-primary-dark) transition-colors">
          Try again
        </button>
        <Link href="/" className="px-5 py-2.5 border border-(--color-border) rounded-xl text-sm font-medium hover:bg-(--color-surface-alt) transition-colors">
          Go home
        </Link>
      </div>
    </div>
  );
}
