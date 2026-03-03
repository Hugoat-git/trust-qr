'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import type { Restaurant, Prize } from '@/types';
import { toast } from 'sonner';
import { Gift, Sparkles, Hand, Loader2 } from 'lucide-react';
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
  reviewStatus: 'pending' | 'verified' | 'expired' | 'skipped';
}

interface SpinWheelProps {
  restaurant: Restaurant;
  participationData: ParticipationData;
  initialReviewCount: number;
  initialLatestReviewTime: number | null;
  onComplete: (result: ResultData) => void;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const CARD_COUNT = 6;

export function SpinWheel({
  restaurant,
  participationData,
  initialReviewCount,
  initialLatestReviewTime,
  onComplete,
}: SpinWheelProps) {
  const [gamePhase, setGamePhase] = useState<'intro' | 'shuffling' | 'ready' | 'playing' | 'revealing' | 'won'>('intro');
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [highlightedCard, setHighlightedCard] = useState<number | null>(null);
  const [cardOrder, setCardOrder] = useState<number[]>([0, 1, 2, 3, 4, 5]);

  const prizes = restaurant.prizes as Prize[];

  // Build 6 cards from available prizes
  const cards: (Prize & { id: number })[] = Array.from({ length: CARD_COUNT }, (_, i) => ({
    ...prizes[i % prizes.length],
    id: i,
  }));

  // Intro animation with shuffle
  useEffect(() => {
    const runIntroAnimation = async () => {
      await delay(800);
      setGamePhase('shuffling');

      // 3 random swaps
      let order = [0, 1, 2, 3, 4, 5];
      for (let swap = 0; swap < 3; swap++) {
        const idx1 = Math.floor(Math.random() * CARD_COUNT);
        let idx2 = Math.floor(Math.random() * CARD_COUNT);
        while (idx2 === idx1) idx2 = Math.floor(Math.random() * CARD_COUNT);

        const temp = order[idx1];
        order[idx1] = order[idx2];
        order[idx2] = temp;
        setCardOrder([...order]);
        await delay(800);
      }

      await delay(300);

      // Highlight sweep
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < CARD_COUNT; j++) {
          setHighlightedCard(j);
          await delay(80);
        }
      }
      setHighlightedCard(null);

      setGamePhase('ready');
    };

    runIntroAnimation();
  }, []);

  const handleCardClick = async (gridIndex: number) => {
    if (gamePhase !== 'ready' || isSubmitting) return;

    setSelectedCardIndex(gridIndex);
    setGamePhase('playing');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/participate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          email: participationData.email,
          firstName: participationData.firstName,
          phone: participationData.phone,
          initialReviewCount: initialReviewCount,
          initialLatestReviewTime: initialLatestReviewTime,
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
        reviewStatus: data.reviewStatus || 'skipped',
      });

      await revealOtherCards(gridIndex);
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
    await delay(600);

    const otherIndices = Array.from({ length: CARD_COUNT }, (_, i) => i).filter(i => i !== selectedIndex);
    const shuffled = otherIndices.sort(() => Math.random() - 0.5);

    for (const idx of shuffled) {
      await delay(300);
      setRevealedCards(prev => new Set([...prev, idx]));
    }

    await delay(800);

    setGamePhase('revealing');
    setRevealedCards(prev => new Set([...prev, selectedIndex]));

    await delay(700);

    setShowConfetti(true);
    setGamePhase('won');
  };

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
      <Card className="w-full border-0 shadow-none rounded-none bg-transparent">
        <CardContent className="py-12 text-center space-y-4">
          <div className="text-red-500 text-5xl">😕</div>
          <p className="text-lg font-medium text-red-600">{error}</p>
          <p className="text-sm text-muted-foreground">
            Veuillez réessayer ou contacter le restaurant.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden relative border-0 shadow-none rounded-none bg-transparent">
      {showConfetti && <Confetti />}

      {/* Background glow */}
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
        {/* Dynamic title */}
        <motion.div className="space-y-2">
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
              className="text-sm text-muted-foreground flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Hand className="w-4 h-4" />
              Touchez une carte pour découvrir votre réduction
            </motion.p>
          )}
        </motion.div>

        {/* Card grid — stable keys per card, layout animates swaps */}
        <div className="grid grid-cols-3 gap-3 px-2 py-4">
          {cardOrder.map((cardId, gridPosition) => {
            const card = cards[cardId];
            return (
              <motion.div
                key={`card-${cardId}`}
                layout
                transition={{ layout: { type: 'spring', stiffness: 150, damping: 20, mass: 0.8 } }}
              >
                <PrizeCard
                  cardId={cardId}
                  prize={card}
                  gridPosition={gridPosition}
                  isSelected={selectedCardIndex === gridPosition}
                  isRevealed={revealedCards.has(gridPosition)}
                  isWinningCard={selectedCardIndex === gridPosition && gamePhase === 'won'}
                  isHighlighted={highlightedCard === gridPosition}
                  actualPrize={selectedCardIndex === gridPosition && result ? {
                    value: result.prizeValue,
                    label: result.prizeLabel,
                    emoji: prizes.find(p => p.value === result.prizeValue)?.emoji || '🎁',
                    probability: 0,
                  } : card}
                  onClick={() => handleCardClick(gridPosition)}
                  disabled={gamePhase !== 'ready' || isSubmitting}
                  primaryColor={restaurant.primary_color}
                  gamePhase={gamePhase}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Result message */}
        {gamePhase === 'won' && result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="space-y-3"
          >
            <p className="text-lg text-muted-foreground">Vous avez gagné</p>
            <motion.p
              className="text-5xl font-black text-primary"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              {result.prizeLabel}
            </motion.p>
            <motion.div
              className="flex items-center justify-center gap-2 text-muted-foreground"
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
            className="flex items-center justify-center gap-2 text-muted-foreground"
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

// Individual card component
interface PrizeCardProps {
  cardId: number;
  prize: Prize;
  gridPosition: number;
  isSelected: boolean;
  isRevealed: boolean;
  isWinningCard: boolean;
  isHighlighted: boolean;
  actualPrize: Prize;
  onClick: () => void;
  disabled: boolean;
  primaryColor: string;
  gamePhase: string;
}

function PrizeCard({
  gridPosition,
  isSelected,
  isRevealed,
  isWinningCard,
  isHighlighted,
  actualPrize,
  onClick,
  disabled,
  primaryColor,
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
        scale: isHighlighted ? 1.1 : (isSelected ? 1.05 : 1),
      }}
      transition={{
        opacity: { duration: 0.4, delay: gridPosition * 0.1 },
        y: { duration: 0.5, delay: gridPosition * 0.1, type: 'spring' },
        rotateX: { duration: 0.5, delay: gridPosition * 0.1 },
        scale: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      }}
      whileHover={!disabled && gamePhase === 'ready' ? { scale: 1.08, y: -5 } : {}}
      whileTap={!disabled && gamePhase === 'ready' ? { scale: 0.95 } : {}}
      onClick={onClick}
    >
      {/* Glow effect */}
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
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Back face (hidden) */}
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
            <Gift className="w-6 h-6 mx-auto opacity-90" />
          </div>

          {/* Decorative pattern */}
          <div
            className="absolute inset-2 rounded-lg border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
            }}
          />
        </div>

        {/* Front face (prize) */}
        <div
          className={`absolute inset-0 rounded-xl flex flex-col items-center justify-center bg-white shadow-lg ${
            isWinningCard
              ? 'border-4 border-yellow-400 bg-gradient-to-b from-yellow-50 via-amber-50 to-orange-50'
              : 'border-2 border-border'
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
            className="text-2xl mb-0.5"
            animate={isWinningCard ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: isWinningCard ? 3 : 0 }}
          >
            {actualPrize.emoji}
          </motion.span>
          <span
            className="text-sm font-bold leading-tight"
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
