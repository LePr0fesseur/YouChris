// Client Stripe et helpers
import Stripe from "stripe";

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY est manquant dans les variables d'environnement");
  }
  return new Stripe(key, {
    apiVersion: "2026-01-28.clover",
    typescript: true,
  });
}

// Singleton lazy — initialisé uniquement lors du premier appel
let _stripe: Stripe | null = null;
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) _stripe = getStripeClient();
    return (_stripe as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Création d'une session Stripe Checkout pour l'abonnement premium
export async function createCheckoutSession(params: {
  userId: string;
  userEmail: string;
  stripeCustomerId?: string | null;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    throw new Error("STRIPE_PRICE_ID est manquant dans les variables d'environnement");
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId,
    },
    subscription_data: {
      metadata: {
        userId: params.userId,
      },
    },
    locale: "fr",
    allow_promotion_codes: true,
  };

  // Utiliser le client existant si disponible
  if (params.stripeCustomerId) {
    sessionParams.customer = params.stripeCustomerId;
  } else {
    sessionParams.customer_email = params.userEmail;
  }

  return stripe.checkout.sessions.create(sessionParams);
}

// Création d'une session du portail client Stripe
export async function createCustomerPortalSession(params: {
  stripeCustomerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: params.stripeCustomerId,
    return_url: params.returnUrl,
  });
}

// Vérification de la signature du webhook Stripe
export async function verifyStripeWebhook(
  request: Request
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET est manquant");
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    throw new Error("Signature Stripe manquante");
  }

  const body = await request.text();

  return stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
}

// Récupération du revenu mensuel depuis Stripe
export async function getMonthlyRevenue(): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const charges = await stripe.charges.list({
    created: {
      gte: Math.floor(startOfMonth.getTime() / 1000),
    },
    limit: 100,
  });

  return charges.data
    .filter((charge) => charge.paid && !charge.refunded)
    .reduce((sum, charge) => sum + charge.amount, 0) / 100; // Conversion centimes → euros
}
