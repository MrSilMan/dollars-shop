import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  anchor?: string;
}

export function HomePagination({ page, totalPages, total, pageSize, anchor }: Props) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const hash = anchor ? `#${anchor}` : "";

  function pageHref(p: number) {
    return p === 1 ? `/${hash}` : `/?page=${p}${hash}`;
  }

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-(--color-border)">
      <p className="text-sm text-(--color-text-muted)">
        {from}–{to} of {total} product{total !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link
            href={pageHref(page - 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-(--color-text-muted) hover:bg-(--color-surface-alt) transition-colors"
          >
            <ChevronLeft size={15} />
          </Link>
        ) : (
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-(--color-text-muted) opacity-30">
            <ChevronLeft size={15} />
          </span>
        )}

        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`dots-${i}`}
              className="w-8 h-8 flex items-center justify-center text-xs text-(--color-text-muted)"
            >
              …
            </span>
          ) : (
            <Link
              key={p}
              href={pageHref(p as number)}
              className={`w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${
                p === page
                  ? "bg-(--color-primary) text-white pointer-events-none"
                  : "hover:bg-(--color-surface-alt) text-(--color-text-primary)"
              }`}
            >
              {p}
            </Link>
          )
        )}

        {page < totalPages ? (
          <Link
            href={pageHref(page + 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-(--color-text-muted) hover:bg-(--color-surface-alt) transition-colors"
          >
            <ChevronRight size={15} />
          </Link>
        ) : (
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-(--color-text-muted) opacity-30">
            <ChevronRight size={15} />
          </span>
        )}
      </div>
    </div>
  );
}
