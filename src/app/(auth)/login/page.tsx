"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuthShell } from "@/components/auth/AuthShell";
import { Eye, EyeOff } from "lucide-react";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.9-.1-1.3H12z" />
      <path fill="#34A853" d="M3.8 7.3l3.2 2.3c.9-1.8 2.8-3 5-3 1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 8.4 2 5.3 4.1 3.8 7.3z" />
      <path fill="#FBBC05" d="M12 20.4c2.6 0 4.8-.9 6.4-2.5l-3-2.4c-.8.6-2 1.1-3.4 1.1-3.2 0-5.8-2.1-6.8-5.1l-3.3 2.5C3.5 17.9 7.4 20.4 12 20.4z" />
      <path fill="#4285F4" d="M21.1 13.1c0-.5 0-.9-.1-1.3H12v3.9h5.5c-.3 1.4-1.2 2.5-2.1 3.2l3 2.4c1.8-1.7 2.7-4.1 2.7-7.2z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    setGoogleError(window.location.search.includes("error="));

    // Check if user is already authenticated
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const out = await response.json().catch(() => ({ authenticated: false }));
        if (response.ok && out.authenticated) {
          // User is already authenticated, redirect to dashboard
          router.push("/dashboard");
          return;
        }
      } catch (error) {
        // User is not authenticated, continue to login
      }
      setIsCheckingAuth(false);
    };

    checkAuthStatus();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const out = await res.json().catch(() => ({ error: "Login failed" }));
      setError(typeof out.error === "string" ? out.error : "Login failed");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  // Show loading spinner while checking authentication status
  if (isCheckingAuth) {
    return (
      <AuthShell
        title="Verifying Session"
        subtitle="Accessing your merchant dashboard, onboarding flow, and sales analytics."
        sideTitle="Enterprise-grade AI sales operations"
        sideBody="Secure authentication, Shopify-integrated onboarding, and high-visibility conversion workflows."
      >
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm text-slate-600">Checking authentication...</span>
            </div>
          </CardContent>
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Sign in to your workspace"
      subtitle="Access your merchant dashboard, onboarding flow, and sales analytics."
      sideTitle="Enterprise-grade AI sales operations"
      sideBody="Secure authentication, Shopify-integrated onboarding, and high-visibility conversion workflows for fast-moving commerce teams."
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <Input type="email" placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          window.location.href = "/api/auth/google/start?next=/dashboard";
        }}
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </Button>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {googleError ? <p className="text-sm text-destructive">Google login failed. Try again.</p> : null}

      <p className="text-sm text-muted-foreground">
        New user? <a className="font-medium text-foreground underline underline-offset-4" href="/signup">Create an account</a>
      </p>
    </AuthShell>
  );
}
