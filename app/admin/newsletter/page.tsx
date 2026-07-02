import type { Metadata } from "next";
import { getAllSubscribers } from "@/actions/admin/newsletter";
import { NewsletterManager } from "./_components/NewsletterManager";

export const metadata: Metadata = { title: "Newsletter — Admin | Dollar Shop" };

export default async function AdminNewsletterPage() {
  const subscribers = await getAllSubscribers();
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-(--color-text-primary)">Newsletter</h1>
        <p className="text-sm text-(--color-text-muted) mt-0.5">View subscribers and send deal announcements</p>
      </div>
      <NewsletterManager subscribers={subscribers.map(s => ({ ...s, createdAt: s.createdAt.toISOString() }))} />
    </div>
  );
}
