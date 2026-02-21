
import Stripe from "stripe"

// Lazy initialization to avoid build-time issues
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set")
  }
  return new Stripe(key, {
    apiVersion: "2024-12-18.acacia" as any,
    typescript: true,
  })
}

export const stripe = {
  get checkout() {
    return getStripe().checkout
  }
}
