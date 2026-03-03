import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuthUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

function getStripe() {
	return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST() {
	try {
		const stripe = getStripe();
		const user = await getAuthUser();
		if (!user) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		// Récupérer le restaurant du user
		const { data: restaurant, error } = await supabaseAdmin
			.from("restaurants")
			.select("id, slug, name, stripe_customer_id")
			.eq("user_id", user.id)
			.single();

		if (error || !restaurant) {
			return NextResponse.json(
				{ error: "Restaurant non trouvé" },
				{ status: 404 },
			);
		}

		const rest = restaurant as {
			id: string;
			slug: string;
			name: string;
			stripe_customer_id: string | null;
		};

		// Créer ou réutiliser le Stripe Customer
		let customerId = rest.stripe_customer_id;

		if (!customerId) {
			const customer = await stripe.customers.create({
				email: user.email,
				metadata: {
					restaurant_id: rest.id,
					restaurant_slug: rest.slug,
				},
			});
			customerId = customer.id;

			// Sauvegarder le customer ID
			// biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
			await (supabaseAdmin.from("restaurants") as any)
				.update({ stripe_customer_id: customerId })
				.eq("id", rest.id);
		}

		const siteUrl =
			process.env.NEXT_PUBLIC_SITE_URL || "https://trustqr.dev";

		// Créer la Checkout Session
		const session = await stripe.checkout.sessions.create({
			customer: customerId,
			mode: "subscription",
			line_items: [
				{
					price: process.env.STRIPE_PRICE_ID!,
					quantity: 1,
				},
			],
			success_url: `${siteUrl}/admin/${rest.slug}?upgraded=true`,
			cancel_url: `${siteUrl}/admin/${rest.slug}`,
			metadata: {
				restaurant_id: rest.id,
			},
		});

		return NextResponse.json({ url: session.url });
	} catch (error) {
		console.error("Stripe checkout error:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la création du paiement" },
			{ status: 500 },
		);
	}
}
