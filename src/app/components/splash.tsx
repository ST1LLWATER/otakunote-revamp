'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';
import Image from 'next/image';
import localFont from 'next/font/local';

const mangaFont = localFont({
  src: '../../../public/fonts/CabinSketch-Bold.ttf',
  variable: '--font-manga',
  display: 'swap',
});

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

// Pre-computed positions to avoid Math.random() in render
const SPEED_LINES = [
  { top: 12, width: 78, delay: 0.0, dur: 0.6 },
  { top: 28, width: 85, delay: 0.1, dur: 0.7 },
  { top: 45, width: 72, delay: 0.2, dur: 0.5 },
  { top: 62, width: 90, delay: 0.05, dur: 0.65 },
  { top: 78, width: 68, delay: 0.15, dur: 0.55 },
  { top: 88, width: 82, delay: 0.25, dur: 0.7 },
];

const PARTICLES = [
  { x: 20, y: 30, size: 4, delay: 0.8 },
  { x: 75, y: 20, size: 3, delay: 1.0 },
  { x: 60, y: 70, size: 5, delay: 0.9 },
  { x: 35, y: 80, size: 3, delay: 1.1 },
  { x: 85, y: 55, size: 4, delay: 0.7 },
  { x: 15, y: 60, size: 3, delay: 1.2 },
  { x: 50, y: 15, size: 4, delay: 0.85 },
  { x: 90, y: 40, size: 3, delay: 1.05 },
];

export function SplashScreen({
  onComplete,
  duration = 3200,
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState<'intro' | 'reveal' | 'exit'>('intro');

  const progress = useMotionValue(0);
  const progressWidth = useTransform(progress, [0, 1], ['0%', '100%']);

  const handleComplete = useCallback(() => {
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    // Phase timing
    const revealTimer = setTimeout(() => setPhase('reveal'), 400);
    const exitTimer = setTimeout(() => setPhase('exit'), duration - 500);
    const completeTimer = setTimeout(handleComplete, duration);

    // Animate progress bar
    animate(progress, 1, { duration: duration / 1000 - 0.5, ease: 'easeOut' });

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, handleComplete, progress]);

  const brandName = 'OtakuNote';
  const letters = brandName.split('');

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0F0F1A] overflow-hidden ${mangaFont.variable}`}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {/* Radial gradient backdrop — pure CSS, no JS animation */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
          </div>

          {/* Speed lines — GPU accelerated with will-change: transform */}
          <div className="absolute inset-0 overflow-hidden">
            {SPEED_LINES.map((line, i) => (
              <motion.div
                key={i}
                className="absolute left-0 h-px bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent"
                style={{
                  top: `${line.top}%`,
                  width: `${line.width}%`,
                  willChange: 'transform',
                }}
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                  duration: line.dur,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'linear',
                  delay: line.delay,
                }}
              />
            ))}
          </div>

          {/* Floating particles — simple scale/opacity, no SVG filters */}
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-indigo-400/30"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                willChange: 'transform, opacity',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 1],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 2,
                delay: p.delay,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Central content */}
          <div className="relative z-20 flex flex-col items-center">
            {/* Ink splash behind text */}
            <motion.div
              className="absolute -inset-20 bg-[radial-gradient(circle,rgba(99,102,241,0.2)_0%,transparent_60%)]"
              initial={{ scale: 0, opacity: 0 }}
              animate={
                phase !== 'intro'
                  ? { scale: [0, 1.5, 1.2], opacity: [0, 0.6, 0.3] }
                  : {}
              }
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />

            {/* Letter-by-letter reveal with staggered spring animation */}
            <div className="flex items-center justify-center perspective-[800px]">
              {letters.map((letter, index) => {
                const isAccent = index === 0 || index === 5; // 'O' and 'N'
                return (
                  <motion.span
                    key={index}
                    className={`text-6xl md:text-8xl inline-block ${
                      isAccent
                        ? 'bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 to-purple-500'
                        : 'text-white'
                    }`}
                    style={{
                      fontFamily: 'var(--font-manga)',
                      fontWeight: 700,
                      textShadow: isAccent
                        ? 'none'
                        : '0 0 30px rgba(99,102,241,0.3)',
                      willChange: 'transform, opacity',
                    }}
                    initial={{
                      y: -80,
                      opacity: 0,
                      rotateX: -90,
                      scale: 0.5,
                    }}
                    animate={
                      phase !== 'intro'
                        ? {
                            y: 0,
                            opacity: 1,
                            rotateX: 0,
                            scale: 1,
                          }
                        : {}
                    }
                    transition={{
                      type: 'spring',
                      stiffness: 150,
                      damping: 12,
                      delay: index * 0.06,
                    }}
                  >
                    {letter}
                  </motion.span>
                );
              })}
            </div>

            {/* Subtitle */}
            <motion.p
              className="mt-6 text-lg md:text-xl text-gray-400 tracking-wider"
              initial={{ opacity: 0, y: 15 }}
              animate={
                phase !== 'intro' ? { opacity: 1, y: 0 } : {}
              }
              transition={{ duration: 0.5, delay: 0.7 }}
              style={{ fontFamily: 'var(--font-manga)' }}
            >
              <span className="inline-block px-5 py-1.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/20">
                Your Anime Journey Begins
              </span>
            </motion.p>

            {/* Action lines radiating from center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute h-[1px] bg-gradient-to-r from-indigo-500/60 to-transparent origin-left"
                  style={{
                    width: 120,
                    rotate: `${angle}deg`,
                    willChange: 'transform, opacity',
                  }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={
                    phase !== 'intro'
                      ? { scaleX: [0, 1, 0.6], opacity: [0, 0.8, 0] }
                      : {}
                  }
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + i * 0.03,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Anime character */}
          <motion.div
            className="absolute bottom-0 right-0 w-52 h-52 z-10"
            initial={{ y: 60, opacity: 0 }}
            animate={phase !== 'intro' ? { y: 0, opacity: 0.6 } : {}}
            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
          >
            <Image
              src="/cute.png"
              alt="Anime Character"
              width={250}
              height={330}
              className="object-contain"
              priority
            />
          </motion.div>

          {/* Progress bar at bottom */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48">
            <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
