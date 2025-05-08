'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useMousePosition } from '@/hooks/use-mouse-position';

interface ParallaxImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  depth?: number;
  containerClassName?: string;
  disabled?: boolean;
}

export default function ParallaxImage({
  src,
  alt,
  width,
  height,
  className = '',
  depth = 5,
  containerClassName = '',
  disabled = false,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elementPosition, setElementPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isHovering, setIsHovering] = useState(false);
  const mousePosition = useMousePosition();

  // Normalize depth to a reasonable range
  const normalizedDepth = Math.max(1, Math.min(10, depth)) / 40; // Reduced to 25% of original intensity

  // Create smooth spring animations for x and y with lighter settings
  const springConfig = { damping: 30, stiffness: 100, mass: 0.5 }; // Lighter spring
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);
  const relativeX = useRef(0);
  const relativeY = useRef(0);

  // Update element position when component mounts or window resizes
  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setElementPosition({
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updatePosition();

    // Use a more efficient way to handle resize and scroll
    const debouncedUpdatePosition = () => {
      let timeout: NodeJS.Timeout;
      return () => {
        clearTimeout(timeout);
        timeout = setTimeout(updatePosition, 100);
      };
    };

    const optimizedUpdatePosition = debouncedUpdatePosition();
    window.addEventListener('resize', optimizedUpdatePosition);
    window.addEventListener('scroll', optimizedUpdatePosition);

    return () => {
      window.removeEventListener('resize', optimizedUpdatePosition);
      window.removeEventListener('scroll', optimizedUpdatePosition);
    };
  }, []);

  useEffect(() => {
    relativeX.current =
      mousePosition.x - elementPosition.x - elementPosition.width / 2;
    relativeY.current =
      mousePosition.y - elementPosition.y - elementPosition.height / 2;
  }, [mousePosition, elementPosition]);

  // Update spring values when mouse moves
  useEffect(() => {
    if (!disabled) {
      if (isHovering) {
        x.set(relativeX.current * normalizedDepth);
        y.set(relativeY.current * normalizedDepth);
      } else {
        x.set(0);
        y.set(0);
      }
    }
  }, [
    mousePosition,
    isHovering,
    normalizedDepth,
    relativeX,
    relativeY,
    x,
    y,
    disabled,
  ]);

  // Reduced rotation values
  const rotateX = useTransform(y, [0, 100], [0, -1]);
  const rotateY = useTransform(x, [-100, 100], [-1, 1]);

  if (disabled) {
    return (
      <div className={`relative ${containerClassName}`}>
        <Image
          src={src || '/placeholder.svg'}
          alt={alt}
          width={width}
          height={height}
          className={`object-contain ${className}`}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${containerClassName}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <motion.div
        style={{
          x,
          y,
          rotateX,
          rotateY,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 100 }}
        className="will-change-transform"
      >
        <Image
          src={src || '/placeholder.svg'}
          alt={alt}
          width={width}
          height={height}
          className={`object-contain ${className}`}
          loading="lazy"
          priority={false}
        />
      </motion.div>
    </div>
  );
}
