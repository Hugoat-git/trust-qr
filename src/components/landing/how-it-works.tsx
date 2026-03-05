'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { QrCode, Gift, Star, TrendingUp } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: QrCode,
    title: 'Le client scanne',
    description: 'Il scanne le QR code affiché en caisse ou sur table. En 2 secondes, il est sur la page.',
    accent: true,
    visual: (
      <div className="relative flex items-center justify-center">
        {/* Phone outline */}
        <div className="relative flex h-28 w-16 flex-col items-center rounded-2xl border-2 border-[#141414]/30 bg-[#141414]/20 pt-2">
          <div className="mb-2 h-1 w-6 rounded-full bg-[#141414]/30" />
          {/* Mini QR grid */}
          <div className="grid grid-cols-5 gap-0.5 p-1">
            {[1,1,0,1,1, 1,0,0,0,1, 0,0,1,0,0, 1,0,0,0,1, 1,1,0,1,1].map((on, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-[2px] ${on ? 'bg-[#141414]/60' : 'bg-transparent'}`}
              />
            ))}
          </div>
        </div>
        {/* Scan line */}
        <motion.div
          className="absolute h-0.5 w-14 rounded-full bg-[#141414]/40"
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    ),
  },
  {
    number: '02',
    icon: Gift,
    title: 'Il joue',
    description: 'Il retourne une carte mystère pour découvrir sa réduction. Fun, engageant, mémorable.',
    visual: (
      <div className="flex items-center justify-center gap-2">
        {/* Card 1 - face down */}
        <motion.div
          className="flex h-16 w-11 items-center justify-center rounded-xl border border-[#B55933]/40 bg-[#3F3835]"
          animate={{ rotateY: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
        >
          <div className="grid grid-cols-3 gap-0.5 opacity-30">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-[#B55933]" />
            ))}
          </div>
        </motion.div>
        {/* Card 2 - revealed */}
        <motion.div
          className="flex h-16 w-11 items-center justify-center rounded-xl bg-[#B55933]"
          initial={{ rotateY: 180 }}
          animate={{ rotateY: 0 }}
          transition={{ duration: 0.8, delay: 1.5, repeat: Infinity, repeatDelay: 3 }}
        >
          <span className="[font-family:var(--font-oswald)] text-sm font-bold text-[#141414]">−15%</span>
        </motion.div>
        {/* Card 3 - face down */}
        <motion.div
          className="flex h-16 w-11 items-center justify-center rounded-xl border border-[#B55933]/40 bg-[#3F3835]"
          animate={{ rotateY: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
        >
          <div className="grid grid-cols-3 gap-0.5 opacity-30">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-[#B55933]" />
            ))}
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    number: '03',
    icon: Star,
    title: 'Il laisse un avis',
    description: "Redirigé vers Google Reviews pour booster votre réputation en ligne.",
    visual: (
      <div className="flex flex-col gap-2">
        {[
          { name: 'Marie L.', stars: 5, delay: 0 },
          { name: 'Pierre D.', stars: 5, delay: 0.3 },
          { name: 'Sophie M.', stars: 4, delay: 0.6 },
        ].map(({ name, stars, delay }) => (
          <motion.div
            key={name}
            className="flex items-center gap-2 rounded-lg border border-[#3F3835] bg-[#3F3835]/50 px-3 py-1.5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: delay + 2, repeat: Infinity, repeatDelay: 4 }}
          >
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-2.5 w-2.5 ${i < stars ? 'fill-[#B55933] text-[#B55933]' : 'text-[#4E4E4E]'}`}
                />
              ))}
            </div>
            <span className="[font-family:var(--font-jetbrains)] text-[10px] text-[#A1887D]">{name}</span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Il revient',
    description: "Son bon de réduction l'attend par email. Il revient. Et vous recommande.",
    visual: (
      <div className="flex flex-col items-center gap-3">
        {/* Email mockup */}
        <div className="w-full rounded-xl border border-[#3F3835] bg-[#3F3835]/40 p-3">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-[#B55933]" />
            <div className="h-1.5 w-16 rounded bg-[#A1887D]/50" />
          </div>
          <div className="mb-1.5 h-2 w-3/4 rounded bg-[#A1887D]/30" />
          {/* Voucher pill */}
          <motion.div
            className="inline-flex items-center gap-1.5 rounded-full bg-[#B55933] px-3 py-1"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Gift className="h-2.5 w-2.5 text-[#141414]" />
            <span className="[font-family:var(--font-oswald)] text-[11px] font-bold text-[#141414]">−15% OFFERT</span>
          </motion.div>
        </div>
      </div>
    ),
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const lineVariants = {
    hidden: { scaleX: 0, originX: 0 as const },
    visible: { scaleX: 1, transition: { duration: 1.1, delay: 0.5 } },
  };

  return (
    <section ref={sectionRef} className="bg-[#141414] px-6 py-20 lg:px-[120px] lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Header */}
          <motion.div variants={headerVariants} className="mb-16 text-center">
            <p className="mb-3 [font-family:var(--font-jetbrains)] text-xs text-[#4E4E4E]">
              // comment_ca_marche
            </p>
            <h2 className="[font-family:var(--font-oswald)] text-4xl font-bold uppercase text-white lg:text-5xl">
              Comment ça marche ?
            </h2>
            <p className="mt-4 [font-family:var(--font-jetbrains)] text-sm text-[#A1887D]">
              Un parcours simple, engageant et mémorable pour vos clients
            </p>
          </motion.div>

          {/* Steps grid */}
          <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Animated connector line (desktop only) */}
            <div className="pointer-events-none absolute left-0 right-0 top-[52px] hidden lg:block">
              <motion.div
                variants={lineVariants}
                className="mx-auto h-px bg-gradient-to-r from-[#B55933] via-[#B55933]/40 to-transparent"
                style={{ marginLeft: '12.5%', marginRight: '12.5%' }}
              />
            </div>

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={cardVariants}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                    step.accent
                      ? 'bg-[#B55933] shadow-lg shadow-[#B55933]/20'
                      : 'border border-[#3F3835] bg-[#1C1917] hover:border-[#B55933]/30 hover:shadow-md hover:shadow-[#B55933]/5'
                  }`}
                >
                  {/* Large faint step number */}
                  <div
                    className={`pointer-events-none absolute right-3 top-0 select-none [font-family:var(--font-oswald)] text-[100px] font-bold leading-none ${
                      step.accent ? 'text-[#141414]/20' : 'text-[#B55933]/[0.07]'
                    }`}
                  >
                    {step.number}
                  </div>

                  {/* Visual illustration area */}
                  <div className="flex min-h-[140px] items-center justify-center px-6 pt-6">
                    {step.visual}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2 p-6 pt-4">
                    {/* Icon + title */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                          step.accent ? 'bg-[#141414]/20' : 'bg-[#B55933]/10'
                        }`}
                      >
                        <Icon
                          className={`h-3.5 w-3.5 ${step.accent ? 'text-[#141414]' : 'text-[#B55933]'}`}
                        />
                      </div>
                      <h3
                        className={`[font-family:var(--font-oswald)] text-base font-bold ${
                          step.accent ? 'text-[#141414]' : 'text-white'
                        }`}
                      >
                        {step.title}
                      </h3>
                    </div>

                    <p
                      className={`[font-family:var(--font-jetbrains)] text-xs leading-relaxed ${
                        step.accent ? 'text-[#3F1A0A]' : 'text-[#A1887D]'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Bottom accent bar for dark cards */}
                  {!step.accent && (
                    <div className="h-0.5 w-0 bg-[#B55933] transition-all duration-500 group-hover:w-full" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
