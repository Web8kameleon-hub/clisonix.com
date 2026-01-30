/**
 * Stripe Webhook Handler
 * POST /api/billing/webhook - Handle Stripe events
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (
      !process.env.STRIPE_SECRET_KEY ||
      !process.env.STRIPE_WEBHOOK_SECRET ||
      process.env.STRIPE_SECRET_KEY.includes("YOUR_")
    ) {
      console.error("Stripe not configured");
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 400 },
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      
    });

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature!,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Webhook signature verification failed";
      console.error("Webhook signature verification failed:", errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("✅ Checkout completed:", session.id);
        // TODO: Update user subscription in database
        // await updateUserSubscription(session.customer, session.subscription)
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object;
        console.log("✅ Subscription created:", subscription.id);
        // TODO: Activate subscription for user
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log("📝 Subscription updated:", subscription.id);
        // TODO: Update subscription status
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log("❌ Subscription canceled:", subscription.id);
        // TODO: Deactivate subscription
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        console.log("💰 Invoice paid:", invoice.id);
        // TODO: Record payment, send receipt
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log("⚠️ Payment failed:", invoice.id);
        // TODO: Notify user, retry payment
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

// Disable body parsing for webhooks (Stripe needs raw body)
export const config = {
  api: {
    bodyParser: false,
  },
};

