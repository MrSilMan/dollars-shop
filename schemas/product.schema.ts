import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).optional().or(z.literal("")),
  sku: z.string().min(2).max(50),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0),
  lowStockAlert: z.number().int().min(0).default(10),
  categoryId: z.string().cuid(),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  weight: z.number().positive().nullable().optional(),
});

export type ProductFormData = z.infer<typeof ProductSchema>;
