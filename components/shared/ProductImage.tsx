import Image, { type ImageProps } from "next/image";

/**
 * next/image's optimizer can't resolve locally-uploaded files in this Next.js
 * version — it simulates an internal request rather than reading the upload
 * straight off disk, and that path has no route once /uploads/ is served by
 * nginx. Skip optimization for those; everything else still goes through it.
 */
export function ProductImage({ src, blurDataURL, placeholder, ...props }: ImageProps) {
  const unoptimized = typeof src === "string" && src.startsWith("/uploads/");
  return (
    <Image
      src={src}
      unoptimized={unoptimized}
      blurDataURL={blurDataURL}
      placeholder={blurDataURL ? placeholder ?? "blur" : placeholder}
      {...props}
    />
  );
}
