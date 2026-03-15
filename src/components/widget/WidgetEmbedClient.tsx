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

      // Handle Cart Action
      if (data.action?.type === "add_to_cart") {
        window.parent?.postMessage({
          type: "ASA_CART_ADD",
          variantId: data.action.variantId,
          productTitle: data.action.productTitle
        }, "*");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/80 backdrop-blur-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500 ring-1 ring-black/5">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 px-5 py-5 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIwIDE1djEwTTE1IDIwaDEwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner ring-1 ring-white/30">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold tracking-tight leading-none">Neryn AI</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Active Assistant</p>
              </div>
            </div>
          </div>
          {embedded && (
            <button 
              onClick={() => window.parent?.postMessage({ type: "ASA_WIDGET_CLOSE" }, "*")}
              className="rounded-xl p-2 hover:bg-white/10 transition-all hover:scale-110 active:scale-90"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-8 scroll-smooth custom-scrollbar bg-white/40"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex w-full animate-in slide-in-from-bottom-4 duration-500 ease-out",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "flex max-w-[88%] gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}>
              <div className={cn(
                "mt-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold shadow-sm transition-transform hover:scale-110",
                msg.role === "user" ? "bg-white border border-slate-200 text-slate-600" : "bg-gradient-to-br from-indigo-600 to-blue-600 text-white"
              )}>
                {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>
              
              <div className="space-y-3 overflow-hidden">
                <div className={cn(
                  "rounded-2xl px-4 py-3 text-[14px] shadow-sm transition-all duration-300",
                  msg.role === "user" 
                    ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-tr-none border border-white/10" 
                    : "bg-white/80 backdrop-blur-md border border-slate-200 text-slate-800 rounded-tl-none hover:shadow-md"
                )}>
                  <div className="prose prose-sm prose-slate dark:prose-invert max-w-full break-words font-medium leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>

                {/* Conditional Product Display */}
                {msg.products && msg.products.length > 0 && (
                  <div className="flex flex-col gap-3 mt-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/60 px-1">Curated For You</p>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
                      {msg.products.map((p) => (
                        <div 
                          key={p.id}
                          onClick={() => p.url && window.open(p.url, '_blank')}
                          className="flex w-52 shrink-0 flex-col rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm p-2.5 shadow-sm transition-all hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
                        >
                          <div className="relative h-36 w-full overflow-hidden rounded-xl bg-slate-50">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-200 group-hover:text-indigo-500/20 transition-colors">
                                <ShoppingBag className="h-10 w-10" strokeWidth={1.5} />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Shop Now
                            </div>
                          </div>
                          <div className="mt-3 space-y-1.5 px-1">
                            <p className="line-clamp-1 text-[13px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.title}</p>
                            <div className="flex items-center justify-between">
                                <p className="text-[12px] font-black text-indigo-600">{p.currency} {p.price}</p>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed opacity-80">{p.reason}</p>
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
          <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="flex max-w-[85%] gap-2 flex-row">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white mt-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-sm">
                <Bot className="h-3 w-3" />
              </div>
              <div className="bg-white/80 backdrop-blur-md border border-slate-200 text-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:0.2s]" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {!loading && messages.length === 1 && (
        <div className="px-4 pb-3 bg-white/40">
          <div className="flex flex-wrap gap-2.5">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => sendMessage(action)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-bold text-slate-600 shadow-sm transition-all hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 active:scale-95"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer / Input */}
      <div className="border-t bg-white p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-red-100 bg-red-50/50 px-4 py-2.5 text-[11px] font-bold text-red-600 animate-in slide-in-from-bottom-2">
            <span>{error}</span>
            <button onClick={() => ensureSessionToken(true)} className="underline uppercase tracking-widest text-[10px]">Retry</button>
          </div>
        )}
        <div className="relative group">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask me anything..."
            className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 pl-5 pr-14 text-sm font-semibold transition-all focus:border-indigo-500/30 focus:ring-0 focus:bg-white focus:shadow-lg"
          />
          <button 
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white shadow-md transition-all hover:bg-black hover:scale-105 active:scale-95 disabled:opacity-20 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 opacity-30">
            <div className="h-[1px] flex-1 bg-slate-400" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-800">
                Neryn AI
            </p>
            <div className="h-[1px] flex-1 bg-slate-400" />
        </div>
      </div>
    </div>
  );
}
