"use client";

import { useState, useRef } from "react";
import { ProductImage as Image } from "@/components/shared/ProductImage";

interface Props {
  images: string[];
  name: string;
  discount: number;
  blurMap?: Record<string, string>;
}

export function ProductImageGallery({ images, name, discount, blurMap = {} }: Props) {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomLayerRef = useRef<HTMLDivElement>(null);

  const setZoom = (scale: number) => {
    zoomLayerRef.current?.style.setProperty("--zoom-scale", String(scale));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !zoomLayerRef.current) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    zoomLayerRef.current.style.setProperty("--zoom-origin", `${x}% ${y}%`);
  };

  const src = images[active] ?? "/images/products/placeholder.svg";

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative aspect-square rounded-2xl overflow-hidden bg-(--color-surface-alt) cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoom(1.8)}
        onMouseLeave={() => setZoom(1)}
      >
        <div ref={zoomLayerRef} className="zoom-layer">
          <Image
            src={src}
            alt={name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            blurDataURL={blurMap[src]}
          />
        </div>
        {discount > 0 && (
          <span className="absolute top-4 left-4 bg-(--color-accent) text-white text-sm font-bold px-3 py-1 rounded-full z-10 pointer-events-none">
            {discount}% OFF
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-(--color-surface-alt) border-2 transition-colors ${
                i === active
                  ? "border-(--color-primary)"
                  : "border-(--color-border) hover:border-(--color-primary)/50"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill className="object-cover" blurDataURL={blurMap[img]} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
