'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift } from 'lucide-react';

const prizes = [
  { value: 10, label: '-10%', emoji: '🎁' },
  { value: 15, label: '-15%', emoji: '🎉' },
  { value: 20, label: '-20%', emoji: '🔥' },
  { value: 25, label: '-25%', emoji: '⭐' },
  { value: 30, label: '-30%', emoji: '💎' },
  { value: 50, label: '-50%', emoji: '🏆' },
];

interface CardProps {
  prize: typeof prizes[0];
  index: number;
  isRevealed: boolean;
  isShuffling: boolean;
  shufflePosition: number;
}

function Card({ prize, index, isRevealed, isShuffling, shufflePosition }: CardProps) {
  return (
    <motion.div
      className="relative aspect-[3/4] cursor-pointer"
      style={{ perspective: '1000px' }}
      initial={{ x: 0, y: 0, rotate: 0 }}
      animate={{
        x: isShuffling ? shufflePosition : 0,
        y: isShuffling ? Math.sin(index * 1.5) * 10 : 0,
        rotate: isShuffling ? (index % 2 === 0 ? 5 : -5) : 0,
        scale: isShuffling ? 0.95 : 1,
      }}
      transition={{
        duration: 0.4,
        ease: 'easeInOut',
      }}
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
          delay: isRevealed ? index * 0.1 : 0,
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Face arrière (cachée) */}
        <div
          className="absolute inset-0 rounded-xl flex items-center justify-center shadow-lg"
          style={{
            backgroundColor: '#18181b',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="text-center text-white">
            <Gift className="w-6 h-6 mx-auto mb-1 opacity-50" />
            <span className="text-xs font-medium opacity-50">?</span>
          </div>
        </div>

        {/* Face avant (prix) */}
        <div
          className="absolute inset-0 rounded-xl flex flex-col items-center justify-center bg-white border-2 border-gray-100 shadow-lg"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className="text-xl mb-1">{prize.emoji}</span>
          <span className="text-sm font-bold text-gray-900">
            {prize.label}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function CardPreview() {
  const [phase, setPhase] = useState<'hidden' | 'shuffling' | 'revealed' | 'flipping'>('hidden');
  const [shufflePositions, setShufflePositions] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    // Démarrer l'animation après un court délai
    const startTimer = setTimeout(() => {
      setPhase('shuffling');
    }, 500);

    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (phase === 'shuffling') {
      // Animation de mélange (3 fois)
      let shuffleCount = 0;
      const maxShuffles = 3;

      const shuffleInterval = setInterval(() => {
        setShufflePositions(
          prizes.map(() => (Math.random() - 0.5) * 40)
        );
        shuffleCount++;

        if (shuffleCount >= maxShuffles) {
          clearInterval(shuffleInterval);
          // Revenir à la position initiale
          setShufflePositions([0, 0, 0, 0, 0, 0]);

          // Passer à revealed après le dernier shuffle
          setTimeout(() => {
            setPhase('revealed');
          }, 400);
        }
      }, 300);

      return () => clearInterval(shuffleInterval);
    }

    if (phase === 'revealed') {
      // Retourner les cartes après un délai
      const flipTimer = setTimeout(() => {
        setPhase('flipping');
      }, 800);

      return () => clearTimeout(flipTimer);
    }

    if (phase === 'flipping') {
      // Recommencer le cycle après avoir montré les cartes
      const resetTimer = setTimeout(() => {
        setPhase('hidden');
        // Relancer l'animation
        setTimeout(() => {
          setPhase('shuffling');
        }, 1000);
      }, 4000);

      return () => clearTimeout(resetTimer);
    }
  }, [phase]);

  return (
    <div className="relative">
      {/* Grille de cartes */}
      <div className="grid grid-cols-6 gap-2 max-w-sm mx-auto">
        {prizes.map((prize, index) => (
          <Card
            key={index}
            prize={prize}
            index={index}
            isRevealed={phase === 'flipping'}
            isShuffling={phase === 'shuffling'}
            shufflePosition={shufflePositions[index]}
          />
        ))}
      </div>

      {/* Effet de brillance */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 'flipping' ? [0, 0.3, 0] : 0,
        }}
        transition={{
          duration: 1,
          times: [0, 0.5, 1],
        }}
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
