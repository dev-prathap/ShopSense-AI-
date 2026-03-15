"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SubscribeButtonProps = {
  storeId: string;
  productId: string;
  variant?: "default" | "outline";
  label: string;
  className?: string;
};

export function SubscribeButton({ storeId, productId, variant = "default", label, className }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!productId || productId === "custom") {
      toast.error("Please contact sales for this plan.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/billing/creem/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, productId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate checkout");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      disabled={loading}
      onClick={handleSubscribe}
      className={cn("w-full h-11 rounded-xl font-bold transition-all active:scale-95", className)}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {label}
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
