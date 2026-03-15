import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex flex-col gap-0.5">
            <div className="flex gap-0.5">
              <div className="w-3 h-3 bg-black rounded-[2px]" />
              <div className="w-3 h-3 bg-black/40 rounded-[2px]" />
            </div>
            <div className="flex gap-0.5">
              <div className="w-3 h-3 bg-black/40 rounded-[2px]" />
              <div className="w-3 h-3 bg-black rounded-[2px]" />
            </div>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">Neryn</span>
        </div>

        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-8xl font-black text-slate-200 mb-4 select-none">
            404
          </div>
          <div className="relative">
            <Search className="w-16 h-16 text-slate-300 mx-auto animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-slate-600 mb-2">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <p className="text-sm text-slate-500">
            The page might have been moved, deleted, or you may have mistyped the URL.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex gap-3 justify-center">
            <Button asChild variant="default" size="lg">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}