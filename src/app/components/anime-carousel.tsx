'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CarouselItem } from './carousel-item';

const useCarousel = (length: number, interval = 5000) => {
  const [current, setCurrent] = useState(0);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const next = (current + 1) % length;
    const id = setTimeout(() => setCurrent(next), interval);
    return () => clearTimeout(id);
  }, [current, length, interval]);

  useEffect(() => {
    controls.start({ x: `${-current * 100}%` });
  }, [current, controls]);

  const previousSlide = () => {
    setCurrent((prev) => (prev - 1 + length) % length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % length);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 50;
    const draggedDistance = info.offset.x;
    const containerWidth = containerRef.current?.offsetWidth || 0;

    if (draggedDistance > threshold) {
      previousSlide();
    } else if (draggedDistance < -threshold) {
      nextSlide();
    } else {
      controls.start({ x: `${-current * 100}%` });
    }
  };

  return {
    current,
    setCurrent,
    controls,
    previousSlide,
    nextSlide,
    x,
    containerRef,
    handleDragEnd,
  };
};

export default function AnimeCarousel({ carouselItems }) {
  const {
    current,
    setCurrent,
    controls,
    previousSlide,
    nextSlide,
    x,
    containerRef,
    handleDragEnd,
  } = useCarousel(carouselItems.length);

  return (
    <div
      className="relative w-full h-[350px] overflow-hidden rounded-lg group"
      ref={containerRef}
    >
      <motion.div
        className="flex h-full cursor-grab active:cursor-grabbing"
        animate={controls}
        drag="x"
        dragConstraints={{
          left:
            -containerRef.current?.offsetWidth * (carouselItems.length - 1) ||
            0,
          right: 0,
        }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.5 }}
      >
        {carouselItems.map((item, index) => (
          <CarouselItem key={index} index={index} item={item} />
        ))}
      </motion.div>

      <button
        onClick={previousSlide}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-8 h-1 rounded-full transition-all duration-300 ${
              index === current ? 'bg-white w-12' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
