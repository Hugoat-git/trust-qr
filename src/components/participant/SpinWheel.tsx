'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import type { Restaurant, Prize } from '@/types';
import { toast } from 'sonner';
import { Loader2, Gift, Sparkles, Hand } from 'lucide-react';
import Confetti from './Confetti';

interface ParticipationData {
  email: string;
  firstName: string;
  phone?: string;
}

interface ResultData {
  prizeLabel: string;
  prizeValue: number;
  voucherCode: string;
  expiresAt: string;
}

interface SpinWheelProps {
  restaurant: Restaurant;
  participationData: ParticipationData;
  onComplete: (result: ResultData) => void;
}

// Helper function
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function SpinWheel({
  restaurant,
  participationData,
  onComplete,
}: SpinWheelProps) {
  const [gamePhase, setGamePhase] = useState<'intro' | 'shuffling' | 'ready' | 'playing' | 'revealing' | 'won'>('intro');
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shuffleOffsets, setShuffleOffsets] = useState<{ x: number; y: number; rotate: number; scale: number }[]>([]);
  const [highlightedCard, setHighlightedCard] = useState<number | null>(null);

  const prizes = restaurant.prizes as Prize[];

  // Créer 6 cartes
  const cards = [
    { ...prizes[0], id: 0 },
    { ...prizes[1 % prizes.length], id: 1 },
    { ...prizes[2 % prizes.length], id: 2 },
    { ...prizes[3 % prizes.length], id: 3 },
    { ...prizes[0], id: 4 },
    { ...prizes[1 % prizes.length], id: 5 },
  ];

  // Initialiser les offsets
  useEffect(() => {
    setShuffleOffsets(cards.map(() => ({ x: 0, y: 0, rotate: 0, scale: 1 })));
  }, [cards.length]);

  // Animation d'introduction spectaculaire
  useEffect(() => {
    const runIntroAnimation = async () => {
      // Attendre que les cartes entrent
      await delay(800);

      // Phase de shuffle épique
      setGamePhase('shuffling');

      // 5 rounds de shuffle avec intensité croissante
      for (let round = 0; round < 5; round++) {
        const intensity = 1 + round * 0.5;
        setShuffleOffsets(cards.map(() => ({
          x: (Math.random() - 0.5) * 100 * intensity,
          y: (Math.random() - 0.5) * 40 * intensity,
          rotate: (Math.random() - 0.5) * 30 * intensity,
          scale: 0.9 + Math.random() * 0.15,
        })));
        await delay(180 - round * 20);
      }

      // Rassembler au centre façon "stack"
      setShuffleOffsets(cards.map((_, i) => ({
        x: (i - 2.5) * 5,
        y: 0,
        rotate: (i - 2.5) * 2,
        scale: 1,
      })));
      await delay(300);

      // Redistribuer en éventail
      for (let i = 0; i < cards.length; i++) {
        await delay(80);
        setShuffleOffsets(prev => prev.map((offset, idx) =>
          idx <= i ? { x: 0, y: 0, rotate: 0, scale: 1 } : offset
        ));
      }

      await delay(200);

      // Animation de highlight qui passe sur les cartes
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < cards.length; j++) {
          setHighlightedCard(j);
          await delay(80);
        }
      }
      setHighlightedCard(null);

      // Prêt à jouer
      setGamePhase('ready');
    };

    runIntroAnimation();
  }, []);

  const handleCardClick = async (cardIndex: number) => {
    if (gamePhase !== 'ready' || isSubmitting) return;

    setSelectedCardIndex(cardIndex);
    setGamePhase('playing');
    setIsSubmitting(true);

    try {
      // Appel API pour enregistrer la participation
      const response = await fetch('/api/participate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          email: participationData.email,
          firstName: participationData.firstName,
          phone: participationData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setResult({
        prizeLabel: data.prizeLabel,
        prizeValue: data.prizeValue,
        voucherCode: data.voucherCode,
        expiresAt: data.expiresAt,
      });

      // Animation de suspense : retourner d'autres cartes d'abord
      await revealOtherCards(cardIndex);

    } catch (err) {
      setGamePhase('ready');
      setSelectedCardIndex(null);
      setIsSubmitting(false);
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      toast.error(message);
    }
  };

  const revealOtherCards = async (selectedIndex: number) => {
    // Attendre un peu
    await delay(600);

    // Révéler 2-3 autres cartes progressivement (pas celle sélectionnée)
    const otherIndices = [0, 1, 2, 3, 4, 5].filter(i => i !== selectedIndex);
    const shuffled = otherIndices.sort(() => Math.random() - 0.5).slice(0, 3);

    for (const idx of shuffled) {
      await delay(400);
      setRevealedCards(prev => new Set([...prev, idx]));
    }

    // Petite pause de suspense
    await delay(1000);

    // Révéler la carte sélectionnée
    setGamePhase('revealing');
    setRevealedCards(prev => new Set([...prev, selectedIndex]));

    // Attendre l'animation de retournement
    await delay(700);

    // Confetti et état gagné
    setShowConfetti(true);
    setGamePhase('won');
  };

  // Mettre à jour onComplete quand result change et qu'on est en état won
  useEffect(() => {
    if (gamePhase === 'won' && result) {
      const timer = setTimeout(() => {
        onComplete(result);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, result, onComplete]);

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <div className="text-red-500 text-5xl">😕</div>
          <p className="text-lg font-medium text-red-600">{error}</p>
          <p className="text-sm text-gray-500">
            Veuillez réessayer ou contacter le restaurant.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden relative">
      {showConfetti && <Confetti />}

      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: gamePhase === 'won' ? 0.3 : gamePhase === 'shuffling' ? 0.2 : 0.1,
        }}
        style={{
          background: `radial-gradient(circle at center, ${restaurant.primary_color}40 0%, transparent 70%)`,
        }}
      />

      <CardContent className="py-8 text-center space-y-6 relative">
        {/* Titre dynamique */}
        <motion.div className="space-y-2" layout>
          <AnimatePresence mode="wait">
            <motion.h2
              key={gamePhase}
              className="text-xl font-bold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {gamePhase === 'intro' && '✨ Préparez-vous...'}
              {gamePhase === 'shuffling' && '🎴 Mélange des cartes...'}
              {gamePhase === 'ready' && '👆 Choisissez une carte !'}
              {gamePhase === 'playing' && '✨ Voyons ce que vous avez gagné...'}
              {gamePhase === 'revealing' && '🥁 Roulement de tambour...'}
              {gamePhase === 'won' && '🎉 Félicitations !'}
            </motion.h2>
          </AnimatePresence>

          {gamePhase === 'ready' && (
            <motion.p
              className="text-sm text-gray-500 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Hand className="w-4 h-4" />
              Touchez une carte pour découvrir votre réduction
            </motion.p>
          )}
        </motion.div>

        {/* Grille de cartes */}
        <div className="grid grid-cols-3 gap-3 px-2 py-4">
          {cards.map((card, index) => (
            <PrizeCard
              key={card.id}
              prize={card}
              index={index}
              isSelected={selectedCardIndex === index}
              isRevealed={revealedCards.has(index)}
              isWinningCard={selectedCardIndex === index && gamePhase === 'won'}
              isHighlighted={highlightedCard === index}
              actualPrize={selectedCardIndex === index && result ? {
                value: result.prizeValue,
                label: result.prizeLabel,
                emoji: prizes.find(p => p.value === result.prizeValue)?.emoji || '🎁',
                probability: 0,
              } : card}
              onClick={() => handleCardClick(index)}
              disabled={gamePhase !== 'ready' || isSubmitting}
              primaryColor={restaurant.primary_color}
              shuffleOffset={shuffleOffsets[index] || { x: 0, y: 0, rotate: 0, scale: 1 }}
              gamePhase={gamePhase}
            />
          ))}
        </div>

        {/* Message de résultat */}
        {gamePhase === 'won' && result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="space-y-3"
          >
            <p className="text-lg text-gray-600">Vous avez gagné</p>
            <motion.p
              className="text-5xl font-black"
              style={{ color: restaurant.primary_color }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              {result.prizeLabel}
            </motion.p>
            <motion.div
              className="flex items-center justify-center gap-2 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Préparation de votre bon...</span>
            </motion.div>
          </motion.div>
        )}

        {gamePhase === 'playing' && (
          <motion.div
            className="flex items-center justify-center gap-2 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Enregistrement en cours...</span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Composant carte individuelle
interface PrizeCardProps {
  prize: Prize;
  index: number;
  isSelected: boolean;
  isRevealed: boolean;
  isWinningCard: boolean;
  isHighlighted: boolean;
  actualPrize: Prize;
  onClick: () => void;
  disabled: boolean;
  primaryColor: string;
  shuffleOffset: { x: number; y: number; rotate: number; scale: number };
  gamePhase: string;
}

function PrizeCard({
  index,
  isSelected,
  isRevealed,
  isWinningCard,
  isHighlighted,
  actualPrize,
  onClick,
  disabled,
  primaryColor,
  shuffleOffset,
  gamePhase,
}: PrizeCardProps) {
  return (
    <motion.div
      className="relative aspect-[3/4] cursor-pointer"
      style={{ perspective: '1000px' }}
      initial={{ opacity: 0, y: 50, rotateX: -30 }}
      animate={{
        opacity: 1,
        y: 0,
        rotateX: 0,
        x: shuffleOffset.x,
        rotateZ: shuffleOffset.rotate,
        scale: isHighlighted ? 1.1 : (isSelected ? 1.05 : shuffleOffset.scale),
      }}
      transition={{
        opacity: { duration: 0.4, delay: index * 0.1 },
        y: { duration: 0.5, delay: index * 0.1, type: 'spring' },
        rotateX: { duration: 0.5, delay: index * 0.1 },
        x: { duration: 0.15, ease: 'easeOut' },
        rotateZ: { duration: 0.15, ease: 'easeOut' },
        scale: { duration: 0.2 },
      }}
      whileHover={!disabled && gamePhase === 'ready' ? { scale: 1.08, y: -5 } : {}}
      whileTap={!disabled && gamePhase === 'ready' ? { scale: 0.95 } : {}}
      onClick={onClick}
    >
      {/* Glow effect pour carte highlighted */}
      {(isHighlighted || isSelected) && (
        <motion.div
          className="absolute -inset-2 rounded-2xl blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: isWinningCard ? 0.6 : 0.4 }}
          style={{ backgroundColor: primaryColor }}
        />
      )}

      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{
          rotateY: isRevealed ? 180 : 0,
        }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Face arrière (cachée) */}
        <div
          className="absolute inset-0 rounded-xl flex items-center justify-center shadow-lg"
          style={{
            backgroundColor: primaryColor,
            backfaceVisibility: 'hidden',
            boxShadow: isSelected
              ? `0 0 0 3px white, 0 0 0 6px ${primaryColor}, 0 10px 30px ${primaryColor}50`
              : isHighlighted
                ? `0 0 20px ${primaryColor}60`
                : '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <div className="text-center text-white">
            <Gift className="w-8 h-8 mx-auto mb-1 opacity-90" />
            <span className="text-sm font-bold opacity-80">?</span>
          </div>

          {/* Pattern décoratif */}
          <div
            className="absolute inset-2 rounded-lg border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
            }}
          />
        </div>

        {/* Face avant (prix) */}
        <div
          className={`absolute inset-0 rounded-xl flex flex-col items-center justify-center bg-white shadow-lg ${
            isWinningCard
              ? 'border-4 border-yellow-400 bg-gradient-to-b from-yellow-50 via-amber-50 to-orange-50'
              : 'border-2 border-gray-100'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            boxShadow: isWinningCard
              ? '0 0 30px rgba(251, 191, 36, 0.5), 0 10px 40px rgba(0,0,0,0.2)'
              : '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <motion.span
            className="text-3xl mb-1"
            animate={isWinningCard ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: isWinningCard ? 3 : 0 }}
          >
            {actualPrize.emoji}
          </motion.span>
          <span
            className="text-xl font-bold"
            style={{ color: isWinningCard ? primaryColor : '#666' }}
          >
            {actualPrize.label}
          </span>
          {isWinningCard && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="absolute -top-2 -right-2"
            >
              <div className="bg-yellow-400 rounded-full p-1">
                <Sparkles className="w-4 h-4 text-yellow-800" />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
