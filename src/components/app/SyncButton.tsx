"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SyncButtonProps {
  storeId: string;
}

export function SyncButton({ storeId }: SyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storeId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sync failed");
      }

      if (data.ok) {
        toast.success(data.message || "Catalog synced successfully!", {
          description: `Synced ${data.result.synced} products with ${data.result.variants} variants`,
          duration: 5000,
        });
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error: any) {
      console.error("Sync error:", error);
      toast.error("Sync failed", {
        description: error.message || "Please try again or contact support",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      variant="outline"
      className="w-full font-bold text-[13px] h-12 border-white/10 hover:bg-white/5 text-slate-300 rounded-xl transition-all hover:border-white/20 hover:text-white disabled:opacity-50"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          Syncing...
        </div>
      ) : (
        "Sync Catalog Now"
      )}
    </Button>
  );
}