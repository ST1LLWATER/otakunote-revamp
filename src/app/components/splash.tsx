'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import localFont from 'next/font/local';

// Load custom manga-style fonts
const mangaFont = localFont({
  src: '../../../public/fonts/CabinSketch-Bold.ttf',
  variable: '--font-manga',
  display: 'swap',
});

const sketchFont = localFont({
  src: '../../../public/fonts/CabinSketch-Bold.ttf',
  variable: '--font-sketch',
  display: 'swap',
});

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export function SplashScreen({
  onComplete,
  duration = 3500,
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  // Split the brand name into individual letters for animation
  const brandName = 'OtakuNote';
  const letters = brandName.split('');

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0F0F1A] overflow-hidden ${mangaFont.variable} ${sketchFont.variable}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Manga style background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Sketch-style background texture */}
            <div className="absolute inset-0 opacity-10">
              <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <filter id="noise">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.65"
                    numOctaves="3"
                    stitchTiles="stitch"
                  />
                  <feColorMatrix
                    type="matrix"
                    values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"
                  />
                </filter>
                <rect width="100%" height="100%" filter="url(#noise)" />
              </svg>
            </div>

            {/* Speed lines with sketch effect */}
            <div className="absolute inset-0">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-white/10"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: 0,
                    height: `${Math.random() * 2 + 1}px`,
                    width: `${Math.random() * 30 + 70}%`,
                    transform: `rotate(${Math.random() * 5 - 2.5}deg)`,
                    filter: 'url(#sketch-filter)',
                  }}
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{
                    duration: Math.random() * 0.5 + 0.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: 'loop',
                    ease: 'linear',
                    delay: Math.random() * 0.5,
                  }}
                />
              ))}
            </div>

            {/* Manga style action bubbles with sketch effect */}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-white/10"
                style={{
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 80 + 10}%`,
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  boxShadow: 'inset 0 0 10px rgba(255,255,255,0.1)',
                  filter: 'url(#sketch-filter)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: [0, 0.7, 0.5] }}
                transition={{
                  duration: 1,
                  delay: Math.random() * 0.5 + 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Sketch-style pen strokes */}
            {Array.from({ length: 15 }).map((_, i) => {
              const width = Math.random() * 100 + 50;
              const height = Math.random() * 60 + 20;
              return (
                <motion.svg
                  key={i}
                  className="absolute"
                  width={width}
                  height={height}
                  viewBox={`0 0 ${width} ${height}`}
                  style={{
                    top: `${Math.random() * 80 + 10}%`,
                    left: `${Math.random() * 80 + 10}%`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 2,
                    ease: 'easeInOut',
                  }}
                >
                  <path
                    d={`M${Math.random() * 10},${Math.random() * 10} 
                       C${Math.random() * width * 0.3 + width * 0.1},${
                      Math.random() * height * 0.5
                    } 
                        ${Math.random() * width * 0.3 + width * 0.4},${
                      Math.random() * height * 0.5
                    } 
                        ${width - Math.random() * 10},${
                      height - Math.random() * 10
                    }`}
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray="5,5"
                    strokeOpacity="0.3"
                  />
                </motion.svg>
              );
            })}

            {/* Manga style stars with sketch effect */}
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 80 + 10}%`,
                }}
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1.5, 1],
                  opacity: [0, 1, 0],
                  rotate: 360,
                }}
                transition={{
                  duration: 1.5,
                  delay: Math.random() * 1 + 0.5,
                  ease: 'easeOut',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="url(#paint0_linear)"
                    stroke="white"
                    strokeWidth="0.5"
                    strokeDasharray="1,1"
                    style={{ filter: 'url(#sketch-filter)' }}
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear"
                      x1="2"
                      y1="2"
                      x2="22"
                      y2="21.02"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#6366F1" />
                      <stop offset="1" stopColor="#A855F7" />
                    </linearGradient>
                    <filter
                      id="sketch-filter"
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                    >
                      <feTurbulence
                        baseFrequency="0.05"
                        numOctaves="2"
                        seed="5"
                      />
                      <feDisplacementMap in="SourceGraphic" scale="2" />
                    </filter>
                  </defs>
                </svg>
              </motion.div>
            ))}
          </div>

          {/* Anime character */}
          <motion.div
            className="absolute bottom-0 right-0 w-64 h-64 z-10 opacity-70"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 0.7 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Image
              src="/cute.png"
              alt="Anime Character"
              width={300}
              height={400}
              className="object-contain"
            />
          </motion.div>

          {/* Sketch-style SVG filter for the text */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <filter
                id="sketch-text"
                x="-10%"
                y="-10%"
                width="120%"
                height="120%"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.03"
                  numOctaves="3"
                  result="noise"
                />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
              </filter>
              <filter
                id="pencil-texture"
                x="0%"
                y="0%"
                width="100%"
                height="100%"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.5"
                  numOctaves="5"
                  result="noise"
                />
                <feColorMatrix
                  type="matrix"
                  values="1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          0 0 0 0.15 0"
                  in="noise"
                  result="coloredNoise"
                />
                <feComposite
                  operator="in"
                  in="SourceGraphic"
                  in2="coloredNoise"
                  result="textureText"
                />
                <feMerge>
                  <feMergeNode in="textureText" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>

          {/* 3D Brand Name with Manga Sketch Style */}
          <div className="relative z-20">
            <div className="flex justify-center items-center">
              {letters.map((letter, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ y: -100, opacity: 0, rotateX: -90 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.1 * index,
                    type: 'spring',
                    stiffness: 100,
                  }}
                >
                  {/* 3D Letter - Front face with sketch style */}
                  <div
                    className={`text-6xl md:text-8xl ${
                      index === 0 || index === 5
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500'
                        : 'text-white'
                    }`}
                    style={{
                      textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                      filter: 'url(#pencil-texture)',
                      WebkitTextStroke: '0.5px rgba(255,255,255,0.3)',
                      letterSpacing: '1px',
                      fontFamily: 'var(--font-manga)',
                      fontWeight: 700,
                    }}
                  >
                    {letter}
                  </div>

                  {/* Sketch effect overlay */}
                  <div
                    className={`absolute top-0 left-0 text-6xl md:text-8xl ${
                      index === 0 || index === 5
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-500/30 to-purple-500/30'
                        : 'text-white/30'
                    }`}
                    style={{
                      filter: 'url(#sketch-text)',
                      mixBlendMode: 'overlay',
                      fontFamily: 'var(--font-manga)',
                      fontWeight: 700,
                    }}
                  >
                    {letter}
                  </div>

                  {/* 3D Letter - Bottom shadow with sketch effect */}
                  <motion.div
                    className="absolute top-0 left-0 w-full h-full text-6xl md:text-8xl text-transparent"
                    style={{
                      textShadow: '0 6px 0 rgba(99, 102, 241, 0.5)',
                      transform: 'translateY(4px) translateZ(-10px)',
                      opacity: 0.5,
                      filter: 'url(#sketch-text)',
                      fontFamily: 'var(--font-manga)',
                      fontWeight: 700,
                    }}
                    animate={{ y: [4, 6, 4] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'easeInOut',
                    }}
                  >
                    {letter}
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Manga style subtitle with sketch font */}
            <motion.div
              className="text-center mt-4 text-lg md:text-xl text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              style={{
                filter: 'url(#pencil-texture)',
                fontFamily: 'var(--font-sketch)',
              }}
            >
              <span className="inline-block px-4 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-md border border-indigo-500/30">
                Your Anime Journey Begins
              </span>
            </motion.div>

            {/* Manga style action lines around the logo - more sketch-like */}
            <div className="absolute -inset-10 -z-10">
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * 45 * Math.PI) / 180;
                const length = 100 + Math.random() * 50;
                const startX = Math.cos(angle) * 100;
                const startY = Math.sin(angle) * 100;
                const endX = Math.cos(angle) * (100 + length);
                const endY = Math.sin(angle) * (100 + length);

                return (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 h-[2px] bg-gradient-to-r from-indigo-500/80 to-transparent"
                    style={{
                      width: length,
                      transformOrigin: 'left center',
                      rotate: `${(angle * 180) / Math.PI}deg`,
                      x: startX,
                      y: startY,
                      filter: 'url(#sketch-text)',
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: [0, 0.8, 0] }}
                    transition={{
                      duration: 0.7,
                      delay: 0.8 + i * 0.05,
                      ease: 'easeOut',
                    }}
                  />
                );
              })}
            </div>

            {/* Hand-drawn circle around the logo */}
          </div>

          {/* Manga style loading indicator with sketch effect */}
          <motion.div
            className="absolute bottom-10 left-0 right-0 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-indigo-500"
                  style={{ filter: 'url(#sketch-text)' }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 0.8,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Sketch-style sound effect text */}
          <motion.div
            className="absolute top-1/4 right-1/4 font-sketch text-2xl text-white/70 transform rotate-12"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1, delay: 0.8 }}
            style={{ filter: 'url(#sketch-text)' }}
          >
            BOOM!
          </motion.div>

          <motion.div
            className="absolute bottom-1/3 left-1/4 font-sketch text-2xl text-white/70 transform -rotate-6"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1, delay: 1.2 }}
            style={{ filter: 'url(#sketch-text)' }}
          >
            WHOOSH!
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
