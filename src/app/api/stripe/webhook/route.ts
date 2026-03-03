import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";

function getStripe() {
	return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: NextRequest) {
	const stripe = getStripe();
	const body = await request.text();
	const signature = request.headers.get("stripe-signature");

	if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
		return NextResponse.json(
			{ error: "Missing signature or webhook secret" },
			{ status: 400 },
		);
	}

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(
			body,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET,
		);
	} catch (err) {
		console.error("Webhook signature verification failed:", err);
		return NextResponse.json(
			{ error: "Invalid signature" },
			{ status: 400 },
		);
	}

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				const restaurantId = session.metadata?.restaurant_id;

				if (restaurantId) {
					// biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
					await (supabaseAdmin.from("restaurants") as any)
						.update({
							plan: "pro",
							stripe_customer_id: session.customer as string,
							stripe_subscription_id: session.subscription as string,
						})
						.eq("id", restaurantId);
				}
				break;
			}

			case "customer.subscription.deleted": {
				const subscription = event.data
					.object as Stripe.Subscription;
				const customerId = subscription.customer as string;

				// Trouver le restaurant par stripe_customer_id
				const { data: restaurant } = await supabaseAdmin
					.from("restaurants")
					.select("id")
					.eq("stripe_customer_id", customerId)
					.single();

				if (restaurant) {
					// biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
					await (supabaseAdmin.from("restaurants") as any)
						.update({
							plan: "free",
							stripe_subscription_id: null,
						})
						.eq("id", (restaurant as { id: string }).id);
				}
				break;
			}
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("Webhook handler error:", error);
		return NextResponse.json(
			{ error: "Webhook handler failed" },
			{ status: 500 },
		);
	}
}
