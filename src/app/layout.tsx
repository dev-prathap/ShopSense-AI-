import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "AI Sales Agent for Shopify",
  description: "Conversion-focused AI sales assistant for Shopify stores."
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
                window.__AI_SALES_AGENT__ = {
                  storeId: "cmmjno09c0000nf1n86uueagn",
                  host: "http://localhost:3000",
                  position: "right"
                };
                const s = document.createElement('script');
                s.src = 'http://localhost:3000/widget.js';
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
