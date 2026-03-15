import "server-only";

export function getGoogleOAuthUrl(state: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.SHOPIFY_APP_URL}/api/auth/google/callback`;

  if (!clientId || !redirectUri) {
    throw new Error("Google OAuth configuration is incomplete. Please set GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI (or SHOPIFY_APP_URL).");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCodeForProfile(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.SHOPIFY_APP_URL}/api/auth/google/callback`;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth configuration is incomplete. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI.");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  if (!tokenRes.ok) {
    throw new Error(`google_token_exchange_failed_${tokenRes.status}`);
  }

  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) {
    throw new Error("google_access_token_missing");
  }

  const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });

  if (!userRes.ok) {
    throw new Error(`google_userinfo_failed_${userRes.status}`);
  }

  const profile = (await userRes.json()) as {
    sub?: string;
    email?: string;
    name?: string;
  };

  if (!profile.sub || !profile.email) {
    throw new Error("google_profile_incomplete");
  }

  return {
    sub: profile.sub,
    email: profile.email.toLowerCase(),
    name: profile.name || null
  };
}
