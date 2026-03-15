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

  console.log("Creem Checkout Payload:", {
    product_id: params.productId,
    success_url: params.returnUrl,
    metadata: { storeId: params.storeId }
  });

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
  console.log("Creem API Raw Response:", rawText);
  
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

export async function verifyCreemWebhook(payload: any, signature: string) {
  // Signature verification logic here
  // For now, we assume the payload is safe if the secret matches or URL is private
  return true;
}
