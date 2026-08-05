import {
  BookOpen, Wrench, Baby, Zap, ShoppingBasket, Shirt,
  Gift, Droplets, Bike, Home, Puzzle, ChefHat, Package,
  Bath, Gamepad2, SprayCan, Dumbbell, Sparkles, Utensils, Venus,
  Car, Watch, HeartPulse, Palette, Music, Flower2, Footprints,
  Wine, Scissors, PawPrint, Cpu, Smartphone, Pill, Leaf,
  Hammer, ShoppingBag, Tv, Lightbulb, Bed, Armchair,
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

/**
 * Curated slug → icon overrides. These take priority over keyword matching so
 * long-standing categories keep their intentional icons. Categories NOT listed
 * here fall back to keyword matching (see resolveCategoryIcon), so adding a new
 * category no longer requires editing this file.
 */
export const categoryIconMap: Record<string, LucideIcon> = {
  "bathroom-and-toilet":       Bath,
  women:                       Venus,
  "board-games":               Gamepad2,
  "sports-and-gym":            Dumbbell,
  "cleaning-items":            SprayCan,
  "beauty-and-personal-care":  Sparkles,
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

/**
 * Keyword → icon rules, checked in order against the category's name + slug.
 * First match wins, so put more specific keywords before broader ones.
 */
const ICON_KEYWORD_RULES: ReadonlyArray<readonly [readonly string[], LucideIcon]> = [
  [["bathroom", "toilet", "bath", "shower"], Bath],
  [["beauty", "cosmetic", "makeup", "make-up", "skincare", "personal care", "personal-care"], Sparkles],
  [["cleaning", "cleaner", "detergent", "laundry", "wash"], SprayCan],
  [["sport", "gym", "fitness", "workout", "exercise"], Dumbbell],
  [["board game", "board-game", "boardgame", "video game", "gaming", "console", "game"], Gamepad2],
  [["women", "woman", "ladies", "men", "clothing", "apparel", "fashion", "wear", "uniform"], Shirt],
  [["shoe", "footwear", "sneaker", "boot", "sandal"], Footprints],
  [["watch", "jewel", "jewellery", "jewelry", "accessor"], Watch],
  [["health", "medic", "pharma", "wellness", "first aid", "first-aid"], HeartPulse],
  [["drug", "pill", "vitamin", "supplement", "tablet"], Pill],
  [["hair", "salon", "barber", "grooming"], Scissors],
  [["baby", "infant", "toddler", "nappy", "diaper"], Baby],
  [["kitchen", "cookware", "cooking", "utensil"], Utensils],
  [["food", "grocery", "snack", "beverage", "drink"], Wine],
  [["stationery", "stationary", "book", "school", "office", "paper"], BookOpen],
  [["hardware", "tool", "diy", "construction", "building"], Hammer],
  [["home improvement", "home-improvement", "renovat", "fixture"], Home],
  [["furniture", "sofa", "couch", "chair", "table"], Armchair],
  [["bed", "mattress", "bedding", "linen", "duvet"], Bed],
  [["light", "lamp", "bulb", "lighting"], Lightbulb],
  [["electric", "electronic", "appliance", "gadget"], Zap],
  [["computer", "laptop", "pc", "tech"], Cpu],
  [["phone", "mobile", "cellphone", "smartphone"], Smartphone],
  [["tv", "television", "screen", "monitor"], Tv],
  [["car", "auto", "vehicle", "motor"], Car],
  [["bicycle", "bike", "cycling"], Bike],
  [["pet", "dog", "cat", "animal"], PawPrint],
  [["garden", "plant", "flower", "outdoor", "lawn"], Flower2],
  [["eco", "green", "organic", "natural"], Leaf],
  [["art", "craft", "paint", "hobby"], Palette],
  [["music", "instrument", "audio"], Music],
  [["party", "birthday", "celebrat", "gift", "present"], Gift],
  [["swim", "pool", "water"], Droplets],
  [["toy", "puzzle", "play"], Puzzle],
  [["plastic", "storage", "container"], Package],
  [["bag", "luggage", "backpack"], ShoppingBag],
];

/**
 * Resolve the best icon for a category:
 *   1. curated slug override (categoryIconMap)
 *   2. keyword match against name + slug
 *   3. ShoppingBasket fallback
 * This means new categories get a sensible icon with no code change / redeploy.
 */
export function resolveCategoryIcon(slug: string, name?: string): LucideIcon {
  if (categoryIconMap[slug]) return categoryIconMap[slug];

  const haystack = `${name ?? ""} ${slug}`.toLowerCase();
  for (const [keywords, Icon] of ICON_KEYWORD_RULES) {
    if (keywords.some((kw) => haystack.includes(kw))) return Icon;
  }
  return ShoppingBasket;
}

const COLOR_PALETTE: ReadonlyArray<{ bg: string; text: string }> = [
  { bg: "bg-sky-50",     text: "text-sky-700" },
  { bg: "bg-purple-50",  text: "text-purple-700" },
  { bg: "bg-pink-50",    text: "text-pink-700" },
  { bg: "bg-cyan-50",    text: "text-cyan-700" },
  { bg: "bg-lime-50",    text: "text-lime-700" },
  { bg: "bg-orange-50",  text: "text-orange-700" },
  { bg: "bg-rose-50",    text: "text-rose-700" },
  { bg: "bg-amber-50",   text: "text-amber-700" },
  { bg: "bg-blue-50",    text: "text-blue-800" },
  { bg: "bg-green-50",   text: "text-green-800" },
  { bg: "bg-indigo-50",  text: "text-indigo-800" },
  { bg: "bg-teal-50",    text: "text-teal-700" },
  { bg: "bg-fuchsia-50", text: "text-fuchsia-700" },
  { bg: "bg-emerald-50", text: "text-emerald-700" },
  { bg: "bg-violet-50",  text: "text-violet-700" },
];

export const categoryColorMap: Record<string, { bg: string; text: string }> = {
  "bathroom-and-toilet":      { bg: "bg-teal-50",    text: "text-teal-700" },
  women:                      { bg: "bg-fuchsia-50", text: "text-fuchsia-700" },
  "board-games":              { bg: "bg-violet-50",  text: "text-violet-700" },
  "sports-and-gym":           { bg: "bg-emerald-50", text: "text-emerald-700" },
  "cleaning-items":           { bg: "bg-cyan-50",    text: "text-cyan-700" },
  "beauty-and-personal-care": { bg: "bg-rose-50",    text: "text-rose-700" },
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

/**
 * Resolve colors for a category: curated override, else a deterministic palette
 * choice derived from the slug so unmatched categories still get varied (never
 * identical) colors instead of all sharing one fallback.
 */
export function resolveCategoryColors(slug: string): { bg: string; text: string } {
  if (categoryColorMap[slug]) return categoryColorMap[slug];

  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return COLOR_PALETTE[hash % COLOR_PALETTE.length];
}
