
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { plan } = await req.json()
    
    // In a real scenario, you'd have these IDs in your .env or DB
    // For now, we will create a one-time product on the fly or use a mock logic if no key
    if (!process.env.STRIPE_SECRET_KEY) {
       return NextResponse.json({ error: "Stripe key not configured" }, { status: 500 })
    }

    // Lazy load stripe to avoid build-time initialization
    const { stripe } = await import("@/lib/stripe")
    const sessionStripe = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "Plano Pro Hunter",
              description: "Acesso total ao Users4U",
            },
            unit_amount: 2900, // R$ 29,00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/subscription?canceled=true`,
      metadata: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({ url: sessionStripe.url })
  } catch (error) {
    console.error("Stripe error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
