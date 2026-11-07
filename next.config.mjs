/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "oktoberfestoutfits.com", pathname: "/cdn/shop/files/**" },
    ],
  },
};

export default nextConfig;
