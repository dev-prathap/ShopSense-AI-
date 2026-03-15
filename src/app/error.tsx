"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (e.g., Sentry)
    console.error("Application error:", error);
  }, [error]);

  // Determine error type for better user messaging
  const isNetworkError = error.message?.includes('fetch') || error.message?.includes('network');
  const isAuthError = error.message?.includes('auth') || error.message?.includes('unauthorized');
  const isTimeoutError = error.message?.includes('timeout') || error.message?.includes('abort');

  let errorTitle = "Something went wrong";
  let errorDescription = "An unexpected error occurred. Please try again.";

  if (isNetworkError) {
    errorTitle = "Connection Problem";
    errorDescription = "Unable to connect to our servers. Please check your internet connection and try again.";
  } else if (isAuthError) {
    errorTitle = "Authentication Error";
    errorDescription = "Your session may have expired. Please log in again.";
  } else if (isTimeoutError) {
    errorTitle = "Request Timeout";
    errorDescription = "The request took too long to complete. Please try again.";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-4">
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

        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {errorTitle}
          </h1>
          <p className="text-lg text-slate-600 mb-4">
            {errorDescription}
          </p>

          {/* Technical Details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
              <summary className="font-medium text-gray-800 cursor-pointer">
                Technical Details
              </summary>
              <div className="mt-2 text-sm text-gray-600 font-mono whitespace-pre-wrap">
                {error.message}
                {error.digest && (
                  <div className="mt-2">
                    <strong>Error ID:</strong> {error.digest}
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex gap-3 justify-center">
            <Button
              onClick={reset}
              variant="default"
              size="lg"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
          </div>

          {/* Help Options */}
          <div className="pt-8 border-t border-slate-200 mt-8">
            <p className="text-sm text-slate-500 mb-4">
              If the problem persists, we're here to help:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href="https://status.neryn.pro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Service Status
              </a>
            </div>
          </div>

          {/* Error Reporting */}
          {error.digest && (
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Error ID:</strong> {error.digest}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Please include this ID when contacting support for faster assistance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}