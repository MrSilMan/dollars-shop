import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";
import { getCategoriesForAdmin } from "@/actions/products";
import { CategoriesManager } from "./_components/CategoriesManager";

export const metadata: Metadata = { title: "Categories — Admin | Dollar Shop" };

export default async function AdminCategoriesPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "";
  if (!canAccess("products", role)) redirect("/admin");

  const categories = await getCategoriesForAdmin();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-(--color-text-primary)">Categories</h1>
        <p className="text-sm text-(--color-text-muted) mt-0.5">
          Add categories, edit their name, URL and description, hide the ones you&apos;re not selling
          right now, and set the order they appear in across the storefront. Pin an image to any
          category — without one, a product photo from that category is used automatically.
        </p>
      </div>
      <CategoriesManager categories={categories} />
    </div>
  );
}
