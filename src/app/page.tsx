import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:px-6">
      <section className="grid gap-6 rounded-2xl border bg-card p-6 md:grid-cols-[1.2fr_0.8fr] md:p-10">
        <div className="space-y-4">
          <Badge variant="secondary" className="w-fit">Built for Shopify DTC Brands</Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Turn store visitors into buyers with a 24/7 AI Sales Agent
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            Conversational product discovery, instant product Q&A, order tracking, and cart recovery prompts in one embedded Shopify experience.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link className={cn(buttonVariants({ size: "lg" }))} href="/signup">
              Get Started Free
            </Link>
            <Link className={cn(buttonVariants({ size: "lg", variant: "outline" }))} href="/login">
              Login
            </Link>
            <Link className={cn(buttonVariants({ size: "lg", variant: "outline" }))} href="/widget">
              Live Widget Preview
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">No-code install. 14-day free trial. Revenue attribution included.</p>
        </div>
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Why it converts</CardTitle>
            <CardDescription>Sales-first behavior, not support-only bot logic.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md border p-3"><strong>+ Product fit guidance</strong><p className="text-muted-foreground">Answers what to buy and why.</p></div>
            <div className="rounded-md border p-3"><strong>+ Faster decisions</strong><p className="text-muted-foreground">Removes uncertainty at checkout moment.</p></div>
            <div className="rounded-md border p-3"><strong>+ Measurable ROI</strong><p className="text-muted-foreground">Tracks AI-attributed revenue and conversions.</p></div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Catalog Intelligence</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Understands product data, pricing, inventory, and buyer intent from natural language queries.</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Order + Recovery</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Handles order status and triggers contextual recovery offers when buyer intent drops.</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Merchant Analytics</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Surface top intents, conversion impact, and attributable revenue in one dashboard.</CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-accent/10 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Launch in days, not months</h2>
            <p className="text-sm text-muted-foreground">Install the app, sync catalog, and go live with AI-assisted selling.</p>
          </div>
          <div className="flex gap-3">
            <Link className={cn(buttonVariants())} href="/signup">Start Onboarding</Link>
            <Link className={cn(buttonVariants({ variant: "outline" }))} href="/dashboard/inbox?storeId=demo-store">View Inbox</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
