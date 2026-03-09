import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function ConnectPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.1),transparent_40%),radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.05),transparent_40%)] px-4 py-20">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-xl">
        <Link 
          href="/dashboard" 
          className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>

        <Card className="border-border/40 bg-card/60 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-4 pb-8 text-center pt-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#95BF47]/10 shadow-inner">
              <svg viewBox="0 0 150 172" className="h-12 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M129.5 38.6c-.1-.1-.3-.2-.4-.2L117.8 35 105.3 2.3c-.3-.9-1.1-1.5-2-1.5-.9 0-1.7.6-2 1.5L88.8 35l-11.3 3.6c-.2.1-.3.1-.4.2-.1.1-.3.3-.3.5l-6.8 59.1V102c0 10.7 8.7 19.3 19.3 19.3h51c10.7 0 19.3-8.7 19.3-19.3v-3.6l-6.8-59.1c0-.2-.1-.5-.3-.7zm-11.7 81.3c0 1.2-1 2.2-2.2 2.2H69.8c-1.2 0-2.2-1-2.2-2.2v-3.6l5.9-51.5 12.3-3.9 4-10.4 20 4.1 4 10.4 12.3 3.9 5.9 51.5v3.6z" fill="#95BF47"/>
              </svg>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight">Connect Your Shopify Store</CardTitle>
              <CardDescription className="text-base">
                Link your storefront to start training the AI on your brand.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form action="/api/shopify/install" method="GET" className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="shop">
                  Store Domain (.myshopify.com)
                </label>
                <div className="relative">
                  <Input
                    id="shop"
                    name="shop"
                    required
                    placeholder="your-brand-name.myshopify.com"
                    className="h-12 border-border/60 bg-white/50 px-4 text-lg transition-all focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>
              
              <Button type="submit" size="lg" className="w-full text-lg shadow-lg shadow-primary/20">
                Install and Connect
              </Button>
            </form>

            <div className="mt-8 rounded-xl border border-border/50 bg-muted/30 p-4">
              <div className="flex gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <span className="text-[10px] font-bold">i</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <strong>Pro Tip:</strong> You can find your specific domain in the Shopify Admin URL. It usually looks like 
                  <code className="mx-1 rounded bg-muted-foreground/10 px-1 py-0.5 font-mono text-primary">admin.shopify.com/store/your-store</code>.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center border-t border-border/40 pt-6">
              <a 
                href="https://help.shopify.com/en/manual/intro-to-shopify/initial-setup" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                Learn more about Shopify settings
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

