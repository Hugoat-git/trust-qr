'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import type { Restaurant, Prize } from '@/types';
import { toast } from 'sonner';
import { Loader2, Gift, Sparkles } from 'lucide-react';
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

export function SpinWheel({
  restaurant,
  participationData,
  onComplete,
}: SpinWheelProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'revealing' | 'won'>('ready');
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const prizes = restaurant.prizes as Prize[];

  // Créer 6 cartes (certaines avec le même prix pour l'illusion)
  const cards = [
    { ...prizes[0], id: 0 },
    { ...prizes[1], id: 1 },
    { ...prizes[2], id: 2 },
    { ...prizes[3], id: 3 },
    { ...prizes[0], id: 4 },
    { ...prizes[1], id: 5 },
  ];

  const handleCardClick = async (cardIndex: number) => {
    if (gameState !== 'ready' || isSubmitting) return;

    setSelectedCardIndex(cardIndex);
    setGameState('playing');
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
      await revealOtherCards(cardIndex, data.prizeValue);

    } catch (err) {
      setGameState('ready');
      setSelectedCardIndex(null);
      setIsSubmitting(false);
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      toast.error(message);
    }
  };

  const revealOtherCards = async (selectedIndex: number, wonValue: number) => {
    // Attendre un peu
    await delay(500);

    // Révéler 2-3 autres cartes progressivement (pas celle sélectionnée)
    const otherIndices = [0, 1, 2, 3, 4, 5].filter(i => i !== selectedIndex);
    const shuffled = otherIndices.sort(() => Math.random() - 0.5).slice(0, 3);

    for (const idx of shuffled) {
      await delay(400);
      setRevealedCards(prev => new Set([...prev, idx]));
    }

    // Petite pause de suspense
    await delay(800);

    // Révéler la carte sélectionnée
    setGameState('revealing');
    setRevealedCards(prev => new Set([...prev, selectedIndex]));

    // Attendre l'animation de retournement
    await delay(600);

    // Confetti et état gagné
    setShowConfetti(true);
    setGameState('won');
  };

  // Mettre à jour onComplete quand result change et qu'on est en état won
  useEffect(() => {
    if (gameState === 'won' && result) {
      const timer = setTimeout(() => {
        onComplete(result);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [gameState, result, onComplete]);

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
    <Card className="overflow-hidden">
      {showConfetti && <Confetti />}

      <CardContent className="py-8 text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">
            {gameState === 'ready' && '🎁 Choisissez une carte !'}
            {gameState === 'playing' && '✨ Voyons ce que vous avez gagné...'}
            {gameState === 'revealing' && '🥁 Roulement de tambour...'}
            {gameState === 'won' && '🎉 Félicitations !'}
          </h2>
          {gameState === 'ready' && (
            <p className="text-sm text-gray-500">
              Touchez une carte pour découvrir votre réduction
            </p>
          )}
        </div>

        {/* Grille de cartes */}
        <div className="grid grid-cols-3 gap-3 px-2">
          {cards.map((card, index) => (
            <PrizeCard
              key={card.id}
              prize={card}
              index={index}
              isSelected={selectedCardIndex === index}
              isRevealed={revealedCards.has(index)}
              isWinningCard={selectedCardIndex === index && gameState === 'won'}
              actualPrize={selectedCardIndex === index && result ? {
                value: result.prizeValue,
                label: result.prizeLabel,
                emoji: prizes.find(p => p.value === result.prizeValue)?.emoji || '🎁',
                probability: 0,
              } : card}
              onClick={() => handleCardClick(index)}
              disabled={gameState !== 'ready' || isSubmitting}
              primaryColor={restaurant.primary_color}
            />
          ))}
        </div>

        {/* Message de résultat */}
        {gameState === 'won' && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <p className="text-lg">Vous avez gagné</p>
            <p
              className="text-4xl font-bold"
              style={{ color: restaurant.primary_color }}
            >
              {result.prizeLabel}
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Préparation de votre bon...</span>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Enregistrement en cours...</span>
          </div>
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
  actualPrize: Prize;
  onClick: () => void;
  disabled: boolean;
  primaryColor: string;
}

function PrizeCard({
  prize,
  index,
  isSelected,
  isRevealed,
  isWinningCard,
  actualPrize,
  onClick,
  disabled,
  primaryColor,
}: PrizeCardProps) {
  return (
    <motion.div
      className="relative aspect-[3/4] cursor-pointer perspective-1000"
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      style={{ perspective: '1000px' }}
    >
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
          className="absolute inset-0 rounded-xl flex items-center justify-center backface-hidden"
          style={{
            backgroundColor: primaryColor,
            backfaceVisibility: 'hidden',
            boxShadow: isSelected ? `0 0 0 4px white, 0 0 0 8px ${primaryColor}` : 'none',
          }}
        >
          <div className="text-center text-white">
            <Gift className="w-8 h-8 mx-auto mb-1" />
            <span className="text-xs font-medium">?</span>
          </div>
        </div>

        {/* Face avant (prix) */}
        <div
          className={`absolute inset-0 rounded-xl flex flex-col items-center justify-center bg-white border-2 backface-hidden ${
            isWinningCard ? 'border-yellow-400 bg-gradient-to-b from-yellow-50 to-amber-50' : 'border-gray-200'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className="text-2xl mb-1">{actualPrize.emoji}</span>
          <span
            className="text-lg font-bold"
            style={{ color: isWinningCard ? primaryColor : '#666' }}
          >
            {actualPrize.label}
          </span>
          {isWinningCard && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <Sparkles className="w-4 h-4 text-yellow-500 mt-1" />
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
