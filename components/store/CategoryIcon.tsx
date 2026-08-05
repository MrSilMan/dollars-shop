import { createElement } from "react";
import { resolveCategoryIcon } from "@/lib/categories";

interface CategoryIconProps {
  slug: string;
  name?: string;
  size?: number;
  className?: string;
}

/**
 * Renders the best-matching lucide icon for a category (curated override →
 * keyword match → basket fallback; see resolveCategoryIcon). Rendering through
 * createElement keeps the dynamic icon out of JSX component position, which the
 * react-hooks/static-components rule requires.
 */
export function CategoryIcon({ slug, name, size = 22, className }: CategoryIconProps) {
  const Icon = resolveCategoryIcon(slug, name);
  return createElement(Icon, { size, className, "aria-hidden": true });
}
