import WidgetEmbedClient from "@/components/widget/WidgetEmbedClient";

export default function WidgetEmbedPage({ searchParams }: { searchParams: { storeId?: string } }) {
  const storeId = searchParams.storeId || "demo-store";

  return (
    <main className="h-screen w-screen overflow-hidden bg-transparent p-2">
      <WidgetEmbedClient storeId={storeId} embedded />
    </main>
  );
}
