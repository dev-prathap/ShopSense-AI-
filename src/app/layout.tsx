import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Neryn | AI Sales Agent for High-Growth Brands",
  description: "Neryn is a conversion-focused AI sales assistant that lives on your storefront, boosts sales, and provides 24/7 support automatically.",
  metadataBase: new URL("https://neryn.pro"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Neryn | AI Sales Agent for High-Growth Brands",
    description: "Automate your storefront sales with Neryn's intelligent AI agents. Boost conversions and support customers 24/7.",
    url: "https://neryn.pro",
    siteName: "Neryn",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Neryn AI Sales Agent",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Neryn | AI Sales Agent for High-Growth Brands",
    description: "Automate your storefront sales with Neryn's intelligent AI agents.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        
        {/* Only load the sales agent widget if we are the top-level window */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.self === window.top) {
                const host = window.location.origin;
                window.__AI_SALES_AGENT__ = {
                  storeId: "cmmjno09c0000nf1n86uueagn",
                  host: host,
                  position: "right"
                };
                const s = document.createElement('script');
                s.src = host + '/widget.js';
                s.defer = true;
                document.body.appendChild(s);
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
