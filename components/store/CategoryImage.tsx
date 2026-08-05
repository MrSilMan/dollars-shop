import { ProductImage } from "@/components/shared/ProductImage";
import { CategoryIcon } from "@/components/store/CategoryIcon";

interface CategoryImageProps {
  slug: string;
  name: string;
  /** Resolved category photo — Category.imageUrl, else a representative product image. */
  image?: string | null;
  /** Intrinsic size in px for the image optimizer — set it to the largest size the box reaches. */
  size: number;
  /** Glyph size for the icon fallback; defaults to ~55% of the intrinsic size. */
  iconSize?: number;
  /**
   * Box classes. Must carry the rendered width/height, responsively where the
   * call site needs it (e.g. "w-12 h-12 sm:w-15 sm:h-15"), alongside rounding,
   * background, and icon colour — the icon inherits currentColor.
   */
  className?: string;
}

/**
 * A category's picture: the resolved photo square-cropped, falling back to the
 * lucide icon for categories with neither an upload nor a product photo. Both
 * branches fill the same box so layouts don't shift between them.
 * The image is decorative — every call site shows the category name beside it.
 */
export function CategoryImage({ slug, name, image, size, iconSize, className = "" }: CategoryImageProps) {
  return (
    <span className={`shrink-0 inline-flex items-center justify-center overflow-hidden ${className}`}>
      {image ? (
        <ProductImage src={image} alt="" width={size} height={size} className="w-full h-full object-cover" />
      ) : (
        <CategoryIcon slug={slug} name={name} size={iconSize ?? Math.round(size * 0.55)} />
      )}
    </span>
  );
}
