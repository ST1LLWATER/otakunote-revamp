'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion';

// Define proper type for card
interface CardType {
  id: number;
  name?: string;
  coverImage: {
    extraLarge: string;
    large?: string;
  };
  title: {
    english: string | null;
    romaji: string;
  };
}

const Card3D = ({ card, index }: { card: CardType; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mouseEnter, setMouseEnter] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ['17.5deg', '-17.5deg']);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ['-17.5deg', '17.5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } =
      cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <motion.div
      ref={cardRef}
      className="mx-2 bg-transparent rounded-lg overflow-hidden shadow-md transition-all duration-300 ease-out"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setMouseEnter(true)}
      onMouseLeave={() => setMouseEnter(false)}
      style={{
        transformStyle: 'preserve-3d',
        rotateX: mouseEnter ? rotateX : 0,
        rotateY: mouseEnter ? rotateY : 0,
      }}
    >
      <div className="flex items-end relative">
        <div className="pr-2 flex-shrink-0 relative">
          {/* <div
            className="absolute bottom-full left-0 mb-2"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'left bottom',
              width: '96px',
              height: '24px',
            }}
          >
            <span className="absolute bottom-0 right-0 text-sm font-semibold text-fuchsia-600 whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm">
              Lorem ipsum
            </span>
          </div> */}
          <span
            className="text-fuchsia-600 font-bold text-4xl"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
          >
            {(index + 1).toString().padStart(2, '0')}
          </span>
        </div>
        <div
          className="h-96 max-w-64 flex-1 flex-shrink-0 bg-cover bg-center relative"
          style={{
            backgroundImage: `url('${card.coverImage.extraLarge}')`,
          }}
        >
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              rotateX: mouseEnter ? rotateX : 0,
              rotateY: mouseEnter ? rotateY : 0,
              transformStyle: 'preserve-3d',
            }}
          >
            <motion.div
              className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg p-4 rounded-lg"
              initial={{ opacity: 0, y: 20, z: 0 }}
              animate={
                mouseEnter
                  ? { opacity: 1, y: 0, z: 50 }
                  : { opacity: 0, y: 20, z: 0 }
              }
              transition={{ duration: 0.3 }}
              style={{
                transform: 'translateZ(50px)',
              }}
            >
              <h3 className="text-white text-xl font-bold text-center">
                {card.title.english ?? card.title.romaji}
              </h3>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default function HorizoontalCarousel({ cards }: { cards: CardType[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = window.innerWidth;
        if (width >= 1280) setVisibleCards(5); // xl
        else if (width >= 1024) setVisibleCards(4); // lg
        else if (width >= 768) setVisibleCards(3); // md
        else if (width >= 640) setVisibleCards(2); // sm
        else setVisibleCards(1); // xs
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth / visibleCards;
      controls.start({
        x: -index * cardWidth,
        transition: { type: 'spring', stiffness: 300, damping: 30 },
      });
    }
  };

  const nextSlide = () => {
    if (currentIndex < cards.length - visibleCards) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      scrollToIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth / visibleCards;
      const draggedDistance = info.offset.x;
      const draggedCards = Math.round(draggedDistance / cardWidth);
      const newIndex = currentIndex - draggedCards;

      if (newIndex < 0) {
        setCurrentIndex(0);
        scrollToIndex(0);
      } else if (newIndex > cards.length - visibleCards) {
        setCurrentIndex(cards.length - visibleCards);
        scrollToIndex(cards.length - visibleCards);
      } else {
        setCurrentIndex(newIndex);
        scrollToIndex(newIndex);
      }
    }
  };

  return (
    <div className="w-full mx-auto px-4" ref={containerRef}>
      <div className="relative">
        <motion.div className="overflow-hidden" ref={carouselRef}>
          <motion.div
            className="flex"
            style={{
              width: `${(cards.length / visibleCards) * 100}%`,
            }}
            drag="x"
            dragConstraints={{
              left: -(cards.length - visibleCards) * (100 / visibleCards),
              right: 0,
            }}
            dragElastic={0.1}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            animate={controls}
          >
            {cards.map((card: CardType, index: number) => (
              <motion.div
                key={card.id}
                className="flex-shrink-0 snap-start"
                style={{
                  width: `${100 / cards.length}%`,
                }}
              >
                <Card3D card={card} index={index} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2"
          onClick={prevSlide}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous slide</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2"
          onClick={nextSlide}
          disabled={currentIndex + visibleCards >= cards.length}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next slide</span>
        </Button>
      </div>
    </div>
  );
}
