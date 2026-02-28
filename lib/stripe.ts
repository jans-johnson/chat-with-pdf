import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    const apiKey = process.env.STRIPE_API_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_API_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(apiKey, {
      apiVersion: "2023-10-16",
      typescript: true,
    });
  }
  return _stripe;
}

// Keep backward-compatible named export as a getter
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});
