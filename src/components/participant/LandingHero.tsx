"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, Sparkles } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Restaurant, Prize } from "@/types";

interface LandingHeroProps {
  restaurant: Restaurant;
  onStart: () => void;
}

// Animation des cartes preview - ELEMENT PRINCIPAL
function AnimatedCardPreview({ prizes, primaryColor }: { prizes: Prize[]; primaryColor: string }) {
  const [phase, setPhase] = useState<'entering' | 'shuffling' | 'revealing' | 'waiting'>('entering');
  const [revealedIndex, setRevealedIndex] = useState<number | null>(null);
  const [shuffleOffsets, setShuffleOffsets] = useState<{ x: number; y: number; rotate: number }[]>(
    Array(6).fill(null).map(() => ({ x: 0, y: 0, rotate: 0 }))
  );

  // Toujours 6 cartes - duplique si nécessaire
  const displayPrizes: Prize[] = [];
  for (let i = 0; i < 6; i++) {
    displayPrizes.push(prizes[i % prizes.length]);
  }

  useEffect(() => {
    // Cycle d'animation
    const runAnimation = async () => {
      // Phase 1: Entrée des cartes (staggered)
      setPhase('entering');
      await delay(1200);

      // Phase 2: Shuffle spectaculaire
      setPhase('shuffling');

      // 4 rounds de shuffle avec intensité croissante
      for (let round = 0; round < 4; round++) {
        const intensity = 1 + round * 0.4;
        setShuffleOffsets(displayPrizes.map(() => ({
          x: (Math.random() - 0.5) * 120 * intensity,
          y: (Math.random() - 0.5) * 50 * intensity,
          rotate: (Math.random() - 0.5) * 35 * intensity,
        })));
        await delay(200);
      }

      // Retour à la position
      setShuffleOffsets(displayPrizes.map(() => ({ x: 0, y: 0, rotate: 0 })));
      await delay(500);

      // Phase 3: Révéler une carte au hasard
      setPhase('revealing');
      const randomIndex = Math.floor(Math.random() * displayPrizes.length);
      setRevealedIndex(randomIndex);
      await delay(2500);

      // Phase 4: Reset et attendre
      setPhase('waiting');
      setRevealedIndex(null);
      await delay(1200);

      // Recommencer
      runAnimation();
    };

    runAnimation();
  }, [displayPrizes.length]);

  return (
    <div className="relative py-6">
      {/* Glow effect derrière les cartes */}
      <motion.div
        className="absolute inset-0 blur-3xl"
        animate={{
          opacity: phase === 'revealing' ? 0.5 : phase === 'shuffling' ? 0.4 : 0.25,
          scale: phase === 'revealing' ? 1.3 : 1,
        }}
        transition={{ duration: 0.5 }}
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
        }}
      />

      {/* Grille de cartes - 6 cartes en 3x2, pleine largeur */}
      <div className="relative grid grid-cols-3 gap-3 w-full px-2">
        {displayPrizes.map((prize, index) => (
          <motion.div
            key={index}
            className="relative aspect-[3/4]"
            style={{ perspective: '1000px' }}
            initial={{ opacity: 0, y: 40, scale: 0.7, rotateX: -20 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              rotateX: 0,
              x: phase === 'shuffling' ? shuffleOffsets[index]?.x || 0 : 0,
              rotateZ: phase === 'shuffling' ? shuffleOffsets[index]?.rotate || 0 : 0,
            }}
            transition={{
              opacity: { duration: 0.5, delay: index * 0.1 },
              y: { duration: 0.6, delay: index * 0.1, type: 'spring', stiffness: 100 },
              scale: { duration: 0.5, delay: index * 0.1 },
              rotateX: { duration: 0.5, delay: index * 0.1 },
              x: { duration: 0.18, ease: 'easeOut' },
              rotateZ: { duration: 0.18, ease: 'easeOut' },
            }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{
                rotateY: revealedIndex === index ? 180 : 0,
              }}
              transition={{
                duration: 0.7,
                ease: [0.4, 0, 0.2, 1],
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Face arrière (cachée) - avec la couleur du restaurant */}
              <div
                className="absolute inset-0 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: primaryColor,
                  backfaceVisibility: 'hidden',
                  boxShadow: `0 8px 20px ${primaryColor}40`,
                }}
              >
                <div className="text-center text-white">
                  <Gift className="w-8 h-8 mx-auto opacity-80" />
                  <span className="text-sm font-bold opacity-70 mt-1 block">?</span>
                </div>
                {/* Motif décoratif */}
                <div className="absolute inset-2 rounded-lg border-2 border-white/20" />
              </div>

              {/* Face avant (prix) */}
              <div
                className="absolute inset-0 rounded-xl flex flex-col items-center justify-center bg-white shadow-lg border-2 border-gray-100"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <span className="text-3xl mb-1">{prize.emoji}</span>
                <span className="text-lg font-bold text-gray-800">{prize.label}</span>
              </div>
            </motion.div>

            {/* Sparkle effect sur la carte révélée */}
            {revealedIndex === index && (
              <motion.div
                className="absolute -top-2 -right-2 z-10"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                <div className="bg-yellow-400 rounded-full p-1.5 shadow-lg">
                  <Sparkles className="w-4 h-4 text-yellow-800" />
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Particules flottantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor: primaryColor,
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.5, 0.2],
              scale: [0.6, 1.2, 0.6],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function LandingHero({ restaurant, onStart }: LandingHeroProps) {
  const prizes = restaurant.prizes as Prize[];
  const [isHovered, setIsHovered] = useState(false);

  // Trouver le meilleur prix
  const bestPrize = prizes.reduce((best, current) =>
    current.value > best.value ? current : best
  , prizes[0]);

  return (
    <Card className="text-center overflow-hidden">
      <CardContent className="pt-5 pb-5 space-y-3">
        {/* Logo du restaurant - plus petit */}
        {restaurant.logo_url ? (
          <motion.div
            className="w-16 h-16 mx-auto relative rounded-lg overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <Image
              src={restaurant.logo_url}
              alt={restaurant.name}
              fill
              className="object-contain"
            />
          </motion.div>
        ) : (
          <motion.div
            className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center text-white text-lg font-bold"
            style={{ backgroundColor: restaurant.primary_color }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            {restaurant.name.charAt(0)}
          </motion.div>
        )}

        {/* Titre - plus compact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h1 className="text-lg font-bold">{restaurant.name}</h1>
          <p className="text-gray-500 text-xs">Merci pour votre visite !</p>
        </motion.div>

        {/* Animation des cartes - ELEMENT PRINCIPAL - plus grand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="py-2"
        >
          <AnimatedCardPreview prizes={prizes} primaryColor={restaurant.primary_color} />
        </motion.div>

        {/* Prix à gagner - plus compact */}
        <motion.div
          className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-xl p-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="font-medium text-gray-700 text-xs">Gagnez jusqu'à</p>
          <motion.p
            className="text-2xl font-black text-primary"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {bestPrize.label}
          </motion.p>
          <p className="text-[10px] text-gray-500">sur votre prochaine visite</p>
        </motion.div>

        {/* Bouton CTA - seulement un emoji à droite */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          <Button
            onClick={onStart}
            size="lg"
            className="w-full text-lg py-6 relative overflow-hidden group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: isHovered ? ['0%', '200%'] : '-100%',
              }}
              transition={{
                duration: 0.8,
                ease: 'easeInOut',
              }}
            />

            <span className="relative flex items-center justify-center gap-2">
              Tenter ma chance
              <motion.span
                animate={{
                  rotate: [0, 20, -20, 0],
                  scale: [1, 1.2, 1.2, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 1.5
                }}
              >
                🎁
              </motion.span>
            </span>
          </Button>
        </motion.div>

        <p className="text-[10px] text-gray-400">
          En participant, vous acceptez de recevoir votre bon par email
        </p>
      </CardContent>
    </Card>
  );
}

// Helper
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
