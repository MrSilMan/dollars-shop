"use client";

import { X } from "lucide-react";
import { useState } from "react";

export function PromoBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-linear-to-r from-primary-dark via-primary to-primary-dark text-white text-sm py-2 px-4 text-center flex items-center justify-center gap-2 relative">
      <span className="font-medium">🚚 Free delivery on orders over $15 · Pay with EcoCash or InnBucks</span>
      <button
        onClick={() => setVisible(false)}
        aria-label="Close banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-75 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}
