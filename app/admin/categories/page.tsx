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
          Set the order categories appear in across the storefront, and pin the image each one shows.
          Without a pinned image, a product photo from the category is used automatically.
        </p>
      </div>
      <CategoriesManager categories={categories} />
    </div>
  );
}
