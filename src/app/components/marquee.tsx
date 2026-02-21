'use client';

import { motion } from 'framer-motion';

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
  pauseOnHover?: boolean;
}

export default function Marquee({ 
  children, 
  speed = 30, 
  direction = 'left',
  className = '',
  pauseOnHover = true,
}: MarqueeProps) {
  const isLeft = direction === 'left';
  
  return (
    <div 
      className={`overflow-hidden ${className}`}
      style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
    >
      <motion.div
        className={`flex gap-6 w-max ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
        animate={{ x: isLeft ? [0, '-50%'] : ['-50%', 0] }}
        transition={{
          x: {
            duration: speed,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
