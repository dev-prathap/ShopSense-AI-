/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    instrumentationHook: true
  },
  async headers() {
    // Shopify embedded apps must allow being framed by the merchant's admin.
    // frame-ancestors is the modern replacement for X-Frame-Options and is
    // required to pass Shopify App Store review for embedded apps.
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors https://*.myshopify.com https://admin.shopify.com;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
