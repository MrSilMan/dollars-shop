"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Images, LayoutTemplate, Tag } from "lucide-react";
import { deleteHeroSlide, deleteSidePromo, deletePromoCard, updateHeroSlide, updateSidePromo, updatePromoCard } from "@/actions/homepage";
import { SlideForm } from "./SlideForm";
import { SidePromoForm } from "./SidePromoForm";
import { PromoCardForm } from "./PromoCardForm";
import { useRouter } from "next/navigation";

type Slide = {
  id: string;
  tag: string;
  tagBg: string;
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string | null;
  bgFrom: string;
  bgTo: string;
  sortOrder: number;
  isActive: boolean;
};

type SidePromo = {
  id: string;
  label: string;
  headline: string;
  href: string;
  imageUrl: string | null;
  bgFrom: string;
  bgTo: string;
  sortOrder: number;
  isActive: boolean;
};

type PromoCard = {
  id: string;
  amount: string;
  label: string;
  desc: string;
  sub: string;
  href: string;
  leftBg: string;
  rightBg: string;
  sortOrder: number;
  isActive: boolean;
};

type Props = {
  slides: Slide[];
  sidePromos: SidePromo[];
  promoCards: PromoCard[];
};

type Tab = "slides" | "promos" | "cards";

export function HomepageManager({ slides, sidePromos, promoCards }: Props) {
  const [tab, setTab] = useState<Tab>("slides");
  const [addingSlide, setAddingSlide] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [addingPromo, setAddingPromo] = useState(false);
  const [editingPromo, setEditingPromo] = useState<SidePromo | null>(null);
  const [addingCard, setAddingCard] = useState(false);
  const [editingCard, setEditingCard] = useState<PromoCard | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function refresh() { router.refresh(); }

  function done() {
    setAddingSlide(false); setEditingSlide(null);
    setAddingPromo(false); setEditingPromo(null);
    setAddingCard(false); setEditingCard(null);
    refresh();
  }

  async function toggleSlide(slide: Slide) {
    startTransition(async () => { await updateHeroSlide(slide.id, { isActive: !slide.isActive }); refresh(); });
  }
  async function deleteSlide(id: string) {
    if (!confirm("Delete this slide?")) return;
    startTransition(async () => { await deleteHeroSlide(id); refresh(); });
  }

  async function togglePromo(promo: SidePromo) {
    startTransition(async () => { await updateSidePromo(promo.id, { isActive: !promo.isActive }); refresh(); });
  }
  async function deletePromo(id: string) {
    if (!confirm("Delete this promo?")) return;
    startTransition(async () => { await deleteSidePromo(id); refresh(); });
  }

  async function toggleCard(card: PromoCard) {
    startTransition(async () => { await updatePromoCard(card.id, { isActive: !card.isActive }); refresh(); });
  }
  async function deleteCard(id: string) {
    if (!confirm("Delete this promo card?")) return;
    startTransition(async () => { await deletePromoCard(id); refresh(); });
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: "slides", label: "Hero Slides", icon: Images, count: slides.length },
    { id: "promos", label: "Side Promos", icon: LayoutTemplate, count: sidePromos.length },
    { id: "cards", label: "Promo Cards", icon: Tag, count: promoCards.length },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setAddingSlide(false); setEditingSlide(null); setAddingPromo(false); setEditingPromo(null); setAddingCard(false); setEditingCard(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${tab === id ? "bg-white shadow-sm text-orange-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Icon size={14} />
            {label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === id ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-500"}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* ── Hero Slides ── */}
      {tab === "slides" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Hero Carousel Slides</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage the main banner slides. Upload images or use gradient backgrounds.</p>
            </div>
            {!addingSlide && !editingSlide && (
              <button onClick={() => setAddingSlide(true)} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
                <Plus size={13} /> Add Slide
              </button>
            )}
          </div>

          {(addingSlide || editingSlide) && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4">{editingSlide ? "Edit Slide" : "New Slide"}</h3>
              <SlideForm slide={editingSlide ?? undefined} onDone={done} />
            </div>
          )}

          {slides.length === 0 && !addingSlide && (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
              <Images size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No slides yet. Add your first slide.</p>
            </div>
          )}

          <div className="space-y-2">
            {slides.map((slide) => (
              <div key={slide.id} className={`bg-white rounded-xl border p-4 flex items-start gap-3 transition-opacity ${!slide.isActive ? "opacity-60" : ""} ${pending ? "pointer-events-none" : ""}`}>
                <GripVertical size={16} className="text-gray-300 mt-1 shrink-0" />

                {/* Preview */}
                <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${slide.bgFrom}, ${slide.bgTo})` }}>
                  {slide.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 flex items-end p-1">
                    <span className="text-[8px] text-white font-bold leading-tight line-clamp-1 drop-shadow">{slide.headline.split("\n")[0]}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-gray-800 truncate">{slide.tag}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${slide.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {slide.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{slide.headline.replace("\n", " · ")}</p>
                  <p className="text-[10px] text-gray-400 truncate">{slide.sub}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleSlide(slide)} title={slide.isActive ? "Hide" : "Show"} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
                    {slide.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={() => { setAddingSlide(false); setEditingSlide(slide); }} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deleteSlide(slide.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Side Promos ── */}
      {tab === "promos" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Side Promo Panels</h2>
              <p className="text-xs text-gray-500 mt-0.5">The two panels on the right of the hero (e.g. HOT DEALS, PAY YOUR WAY).</p>
            </div>
            {!addingPromo && !editingPromo && (
              <button onClick={() => setAddingPromo(true)} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
                <Plus size={13} /> Add Promo
              </button>
            )}
          </div>

          {(addingPromo || editingPromo) && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4">{editingPromo ? "Edit Promo" : "New Promo"}</h3>
              <SidePromoForm promo={editingPromo ?? undefined} onDone={done} />
            </div>
          )}

          {sidePromos.length === 0 && !addingPromo && (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
              <LayoutTemplate size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No side promos yet.</p>
            </div>
          )}

          <div className="space-y-2">
            {sidePromos.map((promo) => (
              <div key={promo.id} className={`bg-white rounded-xl border p-4 flex items-start gap-3 transition-opacity ${!promo.isActive ? "opacity-60" : ""} ${pending ? "pointer-events-none" : ""}`}>
                <GripVertical size={16} className="text-gray-300 mt-1 shrink-0" />

                <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${promo.bgFrom}, ${promo.bgTo})` }}>
                  {promo.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={promo.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 flex items-end p-1">
                    <span className="text-[8px] text-white font-bold leading-tight drop-shadow">{promo.label}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800 truncate">{promo.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${promo.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {promo.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{promo.headline.replace("\n", " · ")}</p>
                  <p className="text-[10px] text-gray-400 truncate">{promo.href}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => togglePromo(promo)} title={promo.isActive ? "Hide" : "Show"} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
                    {promo.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={() => { setAddingPromo(false); setEditingPromo(promo); }} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deletePromo(promo.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Promo Cards ── */}
      {tab === "cards" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Promo Filter Cards</h2>
              <p className="text-xs text-gray-500 mt-0.5">The 4 cards below the hero: 30% OFF, FREE SHIP, NEW IN, FLASH DEALS — and their filter subtitles.</p>
            </div>
            {!addingCard && !editingCard && (
              <button onClick={() => setAddingCard(true)} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
                <Plus size={13} /> Add Card
              </button>
            )}
          </div>

          {(addingCard || editingCard) && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4">{editingCard ? "Edit Card" : "New Card"}</h3>
              <PromoCardForm card={editingCard ?? undefined} onDone={done} />
            </div>
          )}

          {promoCards.length === 0 && !addingCard && (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
              <Tag size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No promo cards yet.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {promoCards.map((card) => (
              <div key={card.id} className={`bg-white rounded-xl border p-3 transition-opacity ${!card.isActive ? "opacity-60" : ""} ${pending ? "pointer-events-none" : ""}`}>
                <div className="flex items-start gap-3">
                  {/* Mini preview */}
                  <div className="flex rounded-lg overflow-hidden border border-gray-100 shrink-0 w-28">
                    <div className={`${card.leftBg} w-10 flex flex-col items-center justify-center text-white py-3 px-0.5`}>
                      <span className="text-xs font-black leading-none">{card.amount}</span>
                      <span className="text-[8px] font-bold text-white/80 mt-0.5 text-center">{card.label}</span>
                    </div>
                    <div className={`${card.rightBg} flex-1 px-2 py-2 flex flex-col justify-center`}>
                      <p className="font-bold text-[9px] text-gray-800 leading-tight truncate">{card.desc}</p>
                      <p className="text-[8px] text-gray-500 mt-0.5 truncate">{card.sub}</p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-gray-800">{card.desc}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${card.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {card.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-[10px] text-orange-500 font-semibold mt-0.5">{card.sub}</p>
                    <p className="text-[10px] text-gray-400 truncate">{card.href}</p>
                  </div>
                </div>

                <div className="flex gap-1 mt-3 justify-end">
                  <button onClick={() => toggleCard(card)} title={card.isActive ? "Hide" : "Show"} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
                    {card.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={() => { setAddingCard(false); setEditingCard(card); }} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deleteCard(card.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
