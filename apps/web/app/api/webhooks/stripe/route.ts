/**
 * Clisonix Cloud - Stripe Webhook Handler
 *
 * Handles all Stripe webhook events for subscriptions
 *
 * @author Ledjan Ahmati
 * @copyright 2026 Clisonix Cloud
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Subscription plan mapping
const PLAN_MAPPING: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER_MONTHLY!]: "starter",
  [process.env.STRIPE_PRICE_STARTER_YEARLY!]: "starter",
  [process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY!]: "professional",
  [process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY!]: "professional",
  [process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!]: "enterprise",
  [process.env.STRIPE_PRICE_ENTERPRISE_YEARLY!]: "enterprise",
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  console.log("✅ Checkout completed:", session.id);

  const customerId = session.customer as string;
  const customerEmail = session.customer_email;
  const subscriptionId = session.subscription as string;

  // Update user in database
  await updateUserSubscription({
    email: customerEmail!,
    stripeCustomerId: customerId,
    subscriptionId: subscriptionId,
    status: "active",
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log("📝 Subscription updated:", subscription.id);

  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const plan = PLAN_MAPPING[priceId] || "free";

  await updateUserSubscription({
    stripeCustomerId: customerId,
    subscriptionId: subscription.id,
    plan: plan,
    status: subscription.status,
    currentPeriodEnd: new Date(
      (subscription as unknown as { current_period_end: number })
        .current_period_end * 1000,
    ),
  });
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  console.log("❌ Subscription cancelled:", subscription.id);

  const customerId = subscription.customer as string;

  await updateUserSubscription({
    stripeCustomerId: customerId,
    subscriptionId: subscription.id,
    plan: "free",
    status: "cancelled",
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("💰 Payment succeeded:", invoice.id);
  // Log successful payment for analytics
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log("⚠️ Payment failed:", invoice.id);
  // Send notification to user, update status
}

interface SubscriptionUpdate {
  email?: string;
  stripeCustomerId: string;
  subscriptionId: string;
  plan?: string;
  status: string;
  currentPeriodEnd?: Date;
}

async function updateUserSubscription(data: SubscriptionUpdate) {
  // Call internal API to update user
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${apiUrl}/internal/update-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": process.env.INTERNAL_API_KEY || "internal-secret",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    console.log("✅ User subscription updated in database");
  } catch (error) {
    console.error("Failed to update user subscription:", error);
    // Don't throw - webhook should still return 200
  }
}
