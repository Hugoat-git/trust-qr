"use client";

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { QRLoader } from "@/components/ui/qr-loader";
import { ShieldCheck, Pause } from "lucide-react";

interface UpgradePopupProps {
	restaurantId: string;
	restaurantName: string;
	confirmedReviews: number;
}

/* ── sparkle burst ── */
function Sparkles() {
	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
			{[...Array(8)].map((_, i) => {
				const angle = (i / 8) * 360;
				const rad = (angle * Math.PI) / 180;
				const x = Math.cos(rad) * 48;
				const y = Math.sin(rad) * 48;
				return (
					<motion.div
						key={i}
						className="absolute left-1/2 top-1/2 size-1.5 rounded-full bg-white/80"
						initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
						animate={{ x, y, opacity: 0, scale: 0.2 }}
						transition={{ duration: 0.7, delay: 0.15 + i * 0.04, ease: "easeOut" }}
					/>
				);
			})}
		</div>
	);
}

/* ── animated counter ── */
function Counter({ target }: { target: number }) {
	const [count, setCount] = useState(0);

	useEffect(() => {
		let frame: number;
		const duration = 800;
		const start = performance.now();
		function tick(now: number) {
			const t = Math.min((now - start) / duration, 1);
			const eased = 1 - (1 - t) ** 3;
			setCount(Math.round(eased * target));
			if (t < 1) frame = requestAnimationFrame(tick);
		}
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [target]);

	return <>{count}</>;
}

/* ── progress bar ── */
const TARGET = 50;

function ProgressBar({ current }: { current: number }) {
	const pct = Math.min((current / TARGET) * 100, 100);
	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between text-xs">
				<span className="text-muted-foreground font-medium">Votre progression</span>
				<span className="font-semibold text-foreground tabular-nums">
					{current} / {TARGET} avis
				</span>
			</div>
			<div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
				<motion.div
					className="absolute inset-y-0 left-0 rounded-full"
					style={{ background: "linear-gradient(90deg, #b55933, #d4956b)" }}
					initial={{ width: 0 }}
					animate={{ width: `${pct}%` }}
					transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
				/>
				<motion.div
					className="absolute inset-y-0 left-0 rounded-full opacity-40 blur-sm"
					style={{ background: "linear-gradient(90deg, #b55933, #d4956b)" }}
					initial={{ width: 0 }}
					animate={{ width: `${pct}%` }}
					transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
				/>
			</div>
			<p className="text-[11px] text-muted-foreground leading-snug">
				<strong className="text-foreground">73% des consommateurs</strong> ne font confiance
				qu'aux avis de <strong className="text-foreground">moins de 30 jours</strong>
			</p>
		</div>
	);
}

export function UpgradePopup({
	restaurantId,
	restaurantName,
	confirmedReviews,
}: UpgradePopupProps) {
	const [loading, setLoading] = useState(false);

	const [error, setError] = useState(false);

	const handleUpgrade = async () => {
		setLoading(true);
		setError(false);
		try {
			const response = await fetch("/api/stripe/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ restaurantId }),
			});
			if (!response.ok) throw new Error("checkout failed");
			const data = await response.json();
			if (data.url) {
				window.location.href = data.url;
			} else {
				throw new Error("no url");
			}
		} catch {
			setError(true);
			setLoading(false);
		}
	};

	return (
		<Dialog open={true}>
			<DialogContent
				showCloseButton={false}
				className="sm:max-w-[400px] max-h-[90dvh] overflow-y-auto p-0 gap-0 border-0 shadow-2xl"
				onPointerDownOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
			>
				{/* ── Hero header ── */}
				<div
					className="relative overflow-hidden rounded-t-lg px-5 pt-7 pb-5 text-center"
					style={{
						background: "linear-gradient(135deg, #b55933 0%, #d4956b 50%, #b55933 100%)",
					}}
				>
					<div
						className="pointer-events-none absolute inset-0 opacity-[0.03]"
						style={{
							backgroundImage:
								"url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M0 0h1v1H0z'/%3E%3C/g%3E%3C/svg%3E\")",
						}}
					/>

					<div className="relative mx-auto mb-2.5 w-fit">
						<Sparkles />
						<motion.div
							initial={{ scale: 0, rotate: -10 }}
							animate={{ scale: 1, rotate: 0 }}
							transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
							className="relative flex size-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg"
						>
							<span className="text-[28px] font-extrabold text-white tabular-nums leading-none">
								<Counter target={confirmedReviews} />
							</span>
						</motion.div>
					</div>

					<DialogTitle asChild>
						<motion.h2
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.25 }}
							className="text-[17px] font-bold text-white"
						>
							Bravo, ça fonctionne !
						</motion.h2>
					</DialogTitle>
					<DialogDescription asChild>
						<motion.p
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.35 }}
							className="mt-1 text-[13px] text-white/80 leading-snug"
						>
							<strong className="text-white">{restaurantName}</strong> a déjà collecté{" "}
							{confirmedReviews} avis Google
						</motion.p>
					</DialogDescription>
				</div>

				{/* ── Body ── */}
				<div className="px-5 pt-4 pb-5 space-y-4">
					{/* Progress bar */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.45 }}
					>
						<ProgressBar current={confirmedReviews} />
					</motion.div>

					{/* Alert: page paused */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.55 }}
						className="flex items-start gap-2.5 rounded-lg border border-[#b55933]/20 bg-[#b55933]/5 dark:bg-[#b55933]/10 p-3"
					>
						<div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#b55933]/15">
							<Pause className="size-2.5 fill-[#b55933] text-[#b55933]" />
						</div>
						<div className="min-w-0">
							<p className="text-sm font-medium text-foreground leading-tight">
								Votre page est en pause
							</p>
							<p className="text-xs text-muted-foreground mt-0.5 leading-snug">
								Chaque jour sans nouvel avis, vous perdez en visibilité Google.
							</p>
						</div>
					</motion.div>

					{/* CTA */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.65 }}
						className="space-y-2.5"
					>
						<Button
							onClick={handleUpgrade}
							disabled={loading}
							size="lg"
							className="relative w-full h-11 text-[15px] font-semibold rounded-xl shadow-lg shadow-[#b55933]/20 hover:shadow-[#b55933]/30 transition-shadow"
						>
							{loading ? (
								<QRLoader size={16} className="mr-2" />
							) : null}
							Réactiver ma page — 39€/mois
						</Button>

						{error && (
							<p className="text-xs text-center text-destructive">
								Une erreur est survenue. Veuillez réessayer.
							</p>
						)}

						{/* Trust signals — wraps nicely on small screens */}
						<div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
							<span className="flex items-center gap-1">
								<ShieldCheck className="size-3" />
								Paiement sécurisé
							</span>
							<span className="hidden sm:inline h-3 w-px bg-border" />
							<span>Sans engagement</span>
							<span className="hidden sm:inline h-3 w-px bg-border" />
							<span>Annulation en 1 clic</span>
						</div>
					</motion.div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
