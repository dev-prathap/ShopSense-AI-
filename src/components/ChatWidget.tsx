"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  title: string;
  price: number;
  currency: string;
  reason: string;
};

export default function ChatWidget({ token }: { token?: string }) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim()) {
      return;
    }

    const { searchParams } = new URL(window.location.href);
    const storeId = searchParams.get("storeId") || "demo-store";

    setLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        storeId,
        visitorId: "demo-visitor",
        conversationId,
        message
      })
    });

    const data = await res.json();
    setConversationId(data.conversationId);
    setReply(data.reply || "");
    setProducts(data.products || []);
    setMessage("");
    setLoading(false);
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>AI Sales Chat</CardTitle>
        <CardDescription>Ask for products, shipping, returns, and order tracking.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="I need black running shoes under $100"
          />
          <Button onClick={sendMessage} disabled={loading}>{loading ? "..." : "Send"}</Button>
        </div>

        {reply ? (
          <div className="space-y-3 rounded-md border p-3">
            <p className="text-sm">{reply}</p>
            {products.map((product) => (
              <div key={product.id} className="rounded-md border p-2 text-sm">
                <p className="font-medium">{product.title}</p>
                <p className="text-muted-foreground">{product.reason}</p>
                <p>{product.currency} {product.price}</p>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
