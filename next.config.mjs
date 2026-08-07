/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    instrumentationHook: true
  },
  async headers() {
    return [
      {
        // The embedded admin app. Shopify frames it from the merchant's admin,
        // and frame-ancestors is what permits that; anything else framing the
        // app UI is not wanted.
        //
        // The lookahead keeps /widget out of this rule rather than adding a
        // second, looser rule for it: a browser enforces every CSP it receives,
        // so two Content-Security-Policy headers would intersect and the strict
        // one would still block the storefront.
        source: "/((?!widget).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://*.myshopify.com https://admin.shopify.com;"
          }
        ]
      },
      {
        // The storefront chat widget is framed by the merchant's own shop, which
        // is usually a custom domain — brandname.com, not brandname.myshopify.com.
        // Under the rule above every one of those was blocked, so the widget
        // could never appear on a real storefront. The set of merchant domains
        // is not knowable here, so this frames anywhere; the widget is public by
        // design and its APIs are guarded per store by token, rate limit and
        // subscription checks.
        source: "/widget/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https: http://localhost:* http://127.0.0.1:*;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
