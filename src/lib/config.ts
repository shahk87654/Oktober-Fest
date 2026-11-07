export const collectionHandles = {
  men: process.env.NEXT_PUBLIC_SHOPIFY_COLLECTION_MEN || "men",
  women: process.env.NEXT_PUBLIC_SHOPIFY_COLLECTION_WOMEN || "women",
  kids: process.env.NEXT_PUBLIC_SHOPIFY_COLLECTION_KIDS || "kids",
  featured: process.env.NEXT_PUBLIC_SHOPIFY_COLLECTION_FEATURED || "featured",
  accessories: process.env.NEXT_PUBLIC_SHOPIFY_COLLECTION_ACCESSORIES || "accessories",
  lederhosen: process.env.NEXT_PUBLIC_SHOPIFY_COLLECTION_LEDERHOSEN || "men",
  dirndl: process.env.NEXT_PUBLIC_SHOPIFY_COLLECTION_DIRNDL || "women",
  shirts: process.env.NEXT_PUBLIC_SHOPIFY_COLLECTION_SHIRTS || "men",
  jackets: process.env.NEXT_PUBLIC_SHOPIFY_COLLECTION_JACKETS || "men",
  shoes: process.env.NEXT_PUBLIC_SHOPIFY_COLLECTION_SHOES || "accessories",
};

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const journalBlogHandle = process.env.NEXT_PUBLIC_SHOPIFY_BLOG_HANDLE || "news";
export const editorialImages = {
  hero: process.env.NEXT_PUBLIC_HERO_IMAGE_URL || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2400&q=85",
  campaign: process.env.NEXT_PUBLIC_CAMPAIGN_IMAGE_URL || "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=2200&q=85",
};
export const campaignCopy = {
  eyebrow: process.env.NEXT_PUBLIC_CAMPAIGN_LABEL || "THE SEASON, IN GOOD COMPANY",
  headline: (process.env.NEXT_PUBLIC_CAMPAIGN_HEADLINE || "Make room|for tradition.").split("|"),
  cta: process.env.NEXT_PUBLIC_CAMPAIGN_CTA || "SHOP THE SEASON",
};
