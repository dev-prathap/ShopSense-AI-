import "server-only";

export type CreemCheckoutParams = {
  storeId: string;
  productId: string;
  returnUrl: string;
  cancelUrl: string;
};

export async function createCreemCheckout(params: CreemCheckoutParams) {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) {
    throw new Error("Missing CREEM_API_KEY");
  }

  // Debug logging removed to prevent data exposure in production

  const res = await fetch("https://api.creem.io/v1/checkouts", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: params.productId,
      success_url: params.returnUrl,
    }),
  });

  const rawText = await res.text();

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    throw new Error(`Invalid JSON from Creem: ${rawText.substring(0, 100)}`);
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to create Creem checkout");
  }

  // Expecting { checkout_url: "..." }
  return data;
}

export async function verifyCreemWebhook(payload: string, signature: string): Promise<boolean> {
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing CREEM_WEBHOOK_SECRET environment variable");
    return false;
  }

  if (!signature) {
    console.error("Missing webhook signature");
    return false;
  }

  try {
    // Import crypto dynamically to ensure it works in edge runtime
    const crypto = await import('crypto');

    // Create HMAC signature using SHA-256
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');

    // Creem typically sends signature in format "sha256=<hash>"
    // Handle both formats: with and without prefix
    const receivedSignature = signature.startsWith('sha256=')
      ? signature.substring(7)
      : signature;

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return false;
  }
}
