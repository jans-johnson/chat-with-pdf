import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { getDefaultUserId } from "@lib/account";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logger } from "@lib/logger";

export const dynamic = "force-dynamic";

const returnUrl = process.env.NEXT_BASE_URL;
const priceId = process.env.STRIPE_PRICE_ID;

export async function GET() {
  const userId = await getDefaultUserId();

  try {
    const _userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

    if (_userSubscriptions[0] && _userSubscriptions[0].stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: _userSubscriptions[0].stripeCustomerId,
        return_url: returnUrl,
      });
      return NextResponse.json({ url: stripeSession.url });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: returnUrl,
      cancel_url: returnUrl,
      metadata: {
        userId,
      },
    });
    return NextResponse.json({ url: stripeSession.url });
  } catch (err) {
    logger.error("Error when creating checkout session:", {
      userId,
      error: err,
    });
    return new NextResponse("internal server error", { status: 500 });
  }
}
