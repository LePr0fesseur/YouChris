// Webhook Stripe — traitement des événements d'abonnement
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyStripeWebhook } from "@/lib/stripe";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let event: Stripe.Event;

  try {
    event = await verifyStripeWebhook(request);
  } catch (error) {
    console.error("Erreur vérification webhook Stripe:", error);
    return NextResponse.json(
      { error: "Signature webhook invalide" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        // Événement non géré — ignorer silencieusement
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Erreur traitement webhook ${event.type}:`, error);
    return NextResponse.json(
      { error: "Erreur traitement de l'événement" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("userId manquant dans les métadonnées checkout");
    return;
  }

  const subscriptionId = session.subscription as string;
  if (!subscriptionId) return;

  // Mise à jour du stripeCustomerId
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: session.customer as string },
  });

  // Récupération des détails de l'abonnement via l'API Stripe
  const { stripe } = await import("@/lib/stripe");
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

  // In Stripe API 2026-01-28.clover, current_period fields are on subscription items
  const firstItem = stripeSubscription.items.data[0];
  const periodStart = firstItem?.current_period_start ?? 0;
  const periodEnd = firstItem?.current_period_end ?? 0;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: firstItem?.price.id || "",
      status: "ACTIVE",
      currentPeriodStart: new Date(periodStart * 1000),
      currentPeriodEnd: new Date(periodEnd * 1000),
    },
    update: {
      stripeSubscriptionId: subscriptionId,
      stripePriceId: firstItem?.price.id || "",
      status: "ACTIVE",
      currentPeriodStart: new Date(periodStart * 1000),
      currentPeriodEnd: new Date(periodEnd * 1000),
      cancelledAt: null,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "SUBSCRIPTION_CREATED",
      details: { subscriptionId },
      userId,
    },
  });
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const existingSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existingSubscription) {
    console.warn(`Abonnement Stripe inconnu: ${subscription.id}`);
    return;
  }

  const status = mapStripeStatus(subscription.status);

  // In Stripe API 2026-01-28.clover, current_period fields are on subscription items
  const firstItem = subscription.items.data[0];
  const periodStart = firstItem?.current_period_start ?? 0;
  const periodEnd = firstItem?.current_period_end ?? 0;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status,
      currentPeriodStart: new Date(periodStart * 1000),
      currentPeriodEnd: new Date(periodEnd * 1000),
      cancelledAt: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000)
        : null,
    },
  });
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  // In Stripe API 2026-01-28.clover, subscription is accessed via invoice.parent
  const subscriptionId =
    (invoice.parent?.subscription_details?.subscription as string) || null;
  if (!subscriptionId) return;

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: "PAST_DUE" },
  });
}

function mapStripeStatus(stripeStatus: string): "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE" {
  switch (stripeStatus) {
    case "active":
      return "ACTIVE";
    case "canceled":
      return "CANCELLED";
    case "past_due":
      return "PAST_DUE";
    case "unpaid":
      return "PAST_DUE";
    default:
      return "EXPIRED";
  }
}
