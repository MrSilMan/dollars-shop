import {
  BookOpen, Wrench, Baby, Zap, ShoppingBasket, Shirt,
  Gift, Droplets, Bike, Home, Puzzle, ChefHat, Package,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_SLUGS = [
  "kitchenware",
  "plasticware",
  "school-stationery",
  "hardware",
  "baby-necessities",
  "electric-gadgets",
  "daily-necessities",
  "careerday-uniforms",
  "birthday-party-items",
  "swimming-items",
  "bicycles",
  "home-improvement",
  "toys",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const categoryIconMap: Record<string, LucideIcon> = {
  "school-stationery":    BookOpen,
  hardware:               Wrench,
  "baby-necessities":     Baby,
  "electric-gadgets":     Zap,
  "daily-necessities":    ShoppingBasket,
  "careerday-uniforms":   Shirt,
  "birthday-party-items": Gift,
  "swimming-items":       Droplets,
  bicycles:               Bike,
  "home-improvement":     Home,
  toys:                   Puzzle,
  kitchenware:            ChefHat,
  plasticware:            Package,
};

export const categoryColorMap: Record<string, { bg: string; text: string }> = {
  "school-stationery":    { bg: "bg-sky-50",     text: "text-sky-700" },
  hardware:               { bg: "bg-stone-50",   text: "text-stone-700" },
  "baby-necessities":     { bg: "bg-purple-50",  text: "text-purple-700" },
  "electric-gadgets":     { bg: "bg-yellow-50",  text: "text-yellow-700" },
  "daily-necessities":    { bg: "bg-green-50",   text: "text-green-800" },
  "careerday-uniforms":   { bg: "bg-indigo-50",  text: "text-indigo-800" },
  "birthday-party-items": { bg: "bg-pink-50",    text: "text-pink-700" },
  "swimming-items":       { bg: "bg-cyan-50",    text: "text-cyan-700" },
  bicycles:               { bg: "bg-lime-50",    text: "text-lime-700" },
  "home-improvement":     { bg: "bg-orange-50",  text: "text-orange-700" },
  toys:                   { bg: "bg-rose-50",    text: "text-rose-700" },
  kitchenware:            { bg: "bg-amber-50",   text: "text-amber-700" },
  plasticware:            { bg: "bg-blue-50",    text: "text-blue-800" },
};
