"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  User, 
  Bot, 
  RefreshCcw, 
  X, 
  ChevronDown, 
  ShoppingBag,
  ExternalLink
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  url?: string;
  title: string;
  price: number;
  currency: string;
  reason: string;
  imageUrl?: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  timestamp: Date;
};

type Props = {
  storeId: string;
  embedded?: boolean;
};

function getOrCreateVisitorId(storeId: string) {
  const key = `asa_widget_visitor:${storeId}`;
  if (typeof window === "undefined") return "server";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}

function getConversationId(storeId: string) {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(`asa_widget_conversation:${storeId}`) || undefined;
}

function setConversationId(storeId: string, conversationId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`asa_widget_conversation:${storeId}`, conversationId);
}

export default function WidgetEmbedClient({ storeId, embedded = false }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversation] = useState<string | undefined>(undefined);
  const [visitorId, setVisitorId] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [tokenExpAt, setTokenExpAt] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickActions = useMemo(
    () => ["Best sellers", "Shipping info", "Return policy", "Order status"],
    []
  );

  async function ensureSessionToken(force = false) {
    const now = Date.now();
    if (!force && token && tokenExpAt - now > 90_000) {
      return token;
    }

    const visitor = visitorId || getOrCreateVisitorId(storeId);
    if (!visitorId) setVisitorId(visitor);

    const res = await fetch("/api/widget/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        visitorId: visitor,
        sessionId: `sess_${visitor}`
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "session_failed");
    }

    setToken(data.token);
    setTokenExpAt(Date.now() + data.expiresInSeconds * 1000);
    return data.token as string;
  }

  // Initial setup
  useEffect(() => {
    const vid = getOrCreateVisitorId(storeId);
    setVisitorId(vid);

    const cid = getConversationId(storeId);
    if (cid) setConversation(cid);

    ensureSessionToken(true)
      .then(async (signedToken) => {
        setError("");
        
        if (cid) {
          try {
            const hRes = await fetch(`/api/chat/history?storeId=${storeId}&conversationId=${cid}&visitorId=${vid}`, {
              headers: { Authorization: `Bearer ${signedToken}` }
            });
            const hData = await hRes.json();
            if (hRes.ok && hData.messages?.length > 0) {
              setMessages(hData.messages.map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp)
              })));
              return; // Skip welcome message if we have history
            }
          } catch (e) {
            console.error("Failed to load history", e);
          }
        }

        // Initial greeting if no messages or history failed
        if (messages.length === 0) {
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: "Hi there! I'm your AI shopping assistant. How can I help you today?",
              timestamp: new Date()
            }
          ]);
        }
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Connection error");
      });
  }, [storeId]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    const prompt = (text ?? input).trim();
    if (!prompt || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const signedToken = await ensureSessionToken();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${signedToken}`
        },
        body: JSON.stringify({
          storeId,
          visitorId,
          conversationId,
          message: prompt
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      if (data.conversationId) {
        setConversation(data.conversationId);
        setConversationId(storeId, data.conversationId);
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "I'm sorry, I couldn't process that.",
        products: data.products || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-slate-50 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="bg-slate-900 px-5 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/20">
              <Bot className="h-6 w-6 text-[#95BF47]" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Shop Assistant</p>
              <div className="mt-1 flex items-center gap-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Online & Ready</p>
              </div>
            </div>
          </div>
          {embedded && (
            <button 
              onClick={() => window.parent?.postMessage({ type: "ASA_WIDGET_CLOSE" }, "*")}
              className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 scroll-smooth custom-scrollbar"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex w-full animate-in slide-in-from-bottom-2 duration-300",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "flex max-w-[90%] gap-2",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}>
              <div className={cn(
                "mt-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                msg.role === "user" ? "bg-slate-200 text-slate-600" : "bg-slate-900 text-white"
              )}>
                {msg.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              </div>
              
              <div className="space-y-2 overflow-hidden">
                <div className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm shadow-sm break-words overflow-wrap-anywhere",
                  msg.role === "user" 
                    ? "bg-slate-900 text-white rounded-tr-none" 
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                )}>
                  <div className="prose prose-sm prose-slate dark:prose-invert max-w-full break-words">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>

                {/* Conditional Product Display */}
                {msg.products && msg.products.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Recommendations</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                      {msg.products.map((p) => (
                        <div 
                          key={p.id}
                          onClick={() => p.url && window.open(p.url, '_blank')}
                          className="flex w-48 shrink-0 flex-col rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-all hover:border-primary/50 hover:shadow-md cursor-pointer group"
                        >
                          <div className="relative h-32 w-full overflow-hidden rounded-lg bg-slate-100">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-200 group-hover:text-primary/20 transition-colors">
                                <ShoppingBag className="h-8 w-8" />
                              </div>
                            )}
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="line-clamp-1 text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">{p.title}</p>
                            <p className="text-[10px] font-black text-emerald-600">{p.currency} {p.price}</p>
                            <p className="text-[9px] text-slate-400 line-clamp-1 italic">{p.reason}</p>
                            <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-1.5 text-[10px] font-bold text-white hover:bg-slate-800 transition-colors">
                              View Product
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-in fade-in">
            <div className="flex max-w-[85%] gap-2 flex-row">
              <div className="bg-slate-900 text-white mt-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                <Bot className="h-3 w-3" />
              </div>
              <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {!loading && messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => sendMessage(action)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer / Input */}
      <div className="border-t bg-white p-4">
        {error && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-bold text-red-600">
            <span>{error}</span>
            <button onClick={() => ensureSessionToken(true)} className="underline uppercase tracking-tighter">Retry</button>
          </div>
        )}
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="h-12 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 pl-4 pr-12 text-sm font-medium transition-all focus:border-primary/20 focus:ring-0 focus:bg-white"
          />
          <button 
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
          Powered by AI Sales Assistant
        </p>
      </div>
    </div>
  );
}
