import { getImageBlurMap } from "@/lib/redis";

/** Collects every image URL referenced by a list of products/items and looks up cached blur placeholders for them. */
export async function getBlurMapForProducts(products: { images: string[] }[]): Promise<Record<string, string>> {
  const urls = products.flatMap((p) => p.images);
  return getImageBlurMap(urls);
}
