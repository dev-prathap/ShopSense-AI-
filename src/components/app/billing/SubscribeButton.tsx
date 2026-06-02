"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SubscribeButtonProps = {
  managedPricingUrl: string;
  variant?: "default" | "outline";
  label: string;
  className?: string;
  disabled?: boolean;
};

/**
 * Redirects the merchant to Shopify's Managed Pricing page where they pick/change
 * a plan. Shopify then fires `app_subscriptions/update` webhook to sync state back.
 *
 * When embedded, App Bridge intercepts the top-level navigation so the redirect
 * works correctly out of the iframe. No JS is needed to trigger that — a plain
 * window.top navigation is what App Bridge expects.
 */
export function SubscribeButton({
  managedPricingUrl,
  variant = "default",
  label,
  className,
  disabled
}: SubscribeButtonProps) {
  const handleClick = () => {
    if (disabled) return;
    if (typeof window !== "undefined") {
      // Managed Pricing lives in admin.shopify.com — must break out of iframe.
      const target = window.top ?? window;
      target.location.href = managedPricingUrl;
    }
  };

  return (
    <Button
      variant={variant}
      disabled={disabled}
      onClick={handleClick}
      className={cn("w-full h-11 rounded-xl font-bold transition-all active:scale-95", className)}
    >
      {label}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}
