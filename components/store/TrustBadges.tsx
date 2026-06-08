import { ShieldCheck, Truck, MessageCircle } from "lucide-react";

export function TrustBadges() {
  return (
    <div className="grid grid-cols-3 divide-x divide-(--color-border) border border-(--color-border) rounded-xl bg-white">
      <div className="flex flex-col items-center gap-2 py-6 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-(--color-surface-alt) flex items-center justify-center text-(--color-primary)">
          <ShieldCheck size={22} />
        </div>
        <p className="font-semibold text-sm text-(--color-text-primary)">Secure Checkout</p>
        <p className="text-xs text-(--color-text-muted)">EcoCash &amp; InnBucks</p>
      </div>

      <div className="flex flex-col items-center gap-2 py-6 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-(--color-surface-alt) flex items-center justify-center text-(--color-primary)">
          <Truck size={22} />
        </div>
        <p className="font-semibold text-sm text-(--color-text-primary)">Fast Delivery</p>
        <p className="text-xs text-(--color-text-muted)">Free over $15</p>
      </div>

      <div className="flex flex-col items-center gap-2 py-6 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-(--color-surface-alt) flex items-center justify-center text-(--color-primary)">
          <MessageCircle size={22} />
        </div>
        <p className="font-semibold text-sm text-(--color-text-primary)">WhatsApp Support</p>
        <p className="text-xs text-(--color-text-muted)">+263 77 256 6468</p>
      </div>
    </div>
  );
}
