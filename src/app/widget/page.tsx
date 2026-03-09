import WidgetEmbedClient from "@/components/widget/WidgetEmbedClient";

export default async function WidgetPage({ searchParams }: { searchParams: { storeId?: string } }) {
  const storeId = searchParams.storeId || "demo-store";

  return (
    <main className="mx-auto flex w-full max-w-4xl px-4 py-8 md:px-6">
      <div className="h-[720px] w-full max-w-xl">
        <WidgetEmbedClient storeId={storeId} />
      </div>
    </main>
  );
}
