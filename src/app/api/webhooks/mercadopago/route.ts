import { NextResponse } from "next/server"
import MercadoPagoConfig, { Payment } from "mercadopago"

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN ?? "" })

export async function POST(req: Request) {
  const url = new URL(req.url)
  const topic = url.searchParams.get("topic") || url.searchParams.get("type")
  const id = url.searchParams.get("id") || url.searchParams.get("data.id")

  if (topic === "payment" && id) {
    try {
      const payment = new Payment(client)
      const paymentData = await payment.get({ id })
      
      if (paymentData.status === "approved") {
        // TODO: Fulfill the purchase (update user subscription)
        console.log("Payment approved:", paymentData.id)
      }
    } catch (error) {
      console.error("Error fetching payment:", error)
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
