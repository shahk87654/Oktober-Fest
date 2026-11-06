import type { ImageLoaderProps } from "next/image";

export default function shopifyImageLoader({ src, width, quality }: ImageLoaderProps) {
  if (!src.startsWith("https://")) return src;
  const imageUrl = new URL(src);
  if (imageUrl.hostname !== "cdn.shopify.com" && !imageUrl.hostname.endsWith(".myshopify.com")) return src;
  imageUrl.searchParams.set("width", String(width));
  imageUrl.searchParams.set("quality", String(quality ?? 75));
  imageUrl.searchParams.set("format", "webp");
  return imageUrl.toString();
}
