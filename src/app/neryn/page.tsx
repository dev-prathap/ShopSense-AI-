"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SimpleSettingsCenter } from "@/components/settings/SimpleSettingsCenter";
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function NerynPage() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const [storeId, setStoreId] = useState("");
  const [loadingStore, setLoadingStore] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function resolveStoreId() {
      const fromQuery = searchParams.get("storeId");
      if (fromQuery) {
        if (!cancelled) {
          setStoreId(fromQuery);
          setLoadingStore(false);
        }
        return;
      }

      try {
        const res = await fetch("/api/app/stores");
        if (!res.ok) {
          if (!cancelled) setLoadingStore(false);
          return;
        }
        const data = await res.json().catch(() => ({ stores: [] }));
        const firstStoreId = data?.stores?.[0]?.id || "";
        if (!cancelled) {
          setStoreId(firstStoreId);
          setLoadingStore(false);
        }
      } catch {
        if (!cancelled) setLoadingStore(false);
      }
    }

    void resolveStoreId();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[#f8fafc] p-6 md:p-10">
      <div className="mx-auto mb-4 flex w-full max-w-6xl items-center justify-end">
        <Button
          onClick={() => {
            if (!storeId) {
              toast.error("No store found. Add ?storeId=... or login to a store first.");
              return;
            }
            setOpen(true);
          }}
          disabled={loadingStore}
          className="bg-[#0078D4] text-white hover:bg-[#106EBE]"
        >
          Open Settings Center
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[94vh] overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:max-w-[1240px]">
          {storeId ? (
            <SimpleSettingsCenter storeId={storeId} inModal />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              No store selected. Open this page with <code>?storeId=your_store_id</code>.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
