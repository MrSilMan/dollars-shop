import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "263772566468";
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-20 right-4 md:bottom-6 sm:right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold pl-3 pr-4 py-3 rounded-full shadow-lg transition-all duration-150 hover:scale-105 active:scale-95"
    >
      <MessageCircle size={20} fill="white" />
      <span className="text-sm hidden sm:inline">WhatsApp Us</span>
    </a>
  );
}
