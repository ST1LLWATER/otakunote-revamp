'use client';

import type React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  type PanInfo,
  AnimatePresence,
} from 'framer-motion';
import { cn } from '@/lib/utils';

// Define proper type for card
interface CardType {
  id: number;
  name?: string;
  bannerImage: string;
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
  const scale = useTransform(mouseX, [-0.5, 0, 0.5], [0.95, 1.05, 0.95]);
  const brightness = useTransform(mouseY, [-0.5, 0.5], [1.2, 0.8]);

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
      className="bg-transparent rounded-lg overflow-visible shadow-lg transition-all duration-300 ease-out group"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setMouseEnter(true)}
      onMouseLeave={() => setMouseEnter(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        scale: 1.02,
        boxShadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: { duration: 0.3 },
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1200px',
        rotateX: mouseEnter ? rotateX : 0,
        rotateY: mouseEnter ? rotateY : 0,
        scale: mouseEnter ? scale : 1,
      }}
    >
      <motion.div
        className="h-96 w-full bg-cover bg-center relative"
        style={{
          backgroundImage: `url('${card.coverImage.extraLarge}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: mouseEnter
            ? `brightness(${brightness.get()})`
            : 'brightness(1)',
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-70"
          animate={{
            opacity: mouseEnter ? 0.3 : 0.7,
          }}
        />

        {/* Index number positioned at top right */}
        <motion.div
          className="absolute top-2 right-2 z-20"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(20px)',
          }}
        >
          <motion.span
            className="text-fuchsia-600 bg-white/80 p-4 font-bold text-2xl w-10 h-10 flex items-center justify-center rounded-full"
            animate={{
              scale: mouseEnter ? 1.2 : 1,
              rotate: mouseEnter ? -5 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            {(index + 1).toString().padStart(2, '0')}
          </motion.span>
        </motion.div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            rotateX: mouseEnter ? rotateX : 0,
            rotateY: mouseEnter ? rotateY : 0,
            transformStyle: 'preserve-3d',
          }}
        >
          <motion.div
            className="w-full px-6 py-8 absolute bottom-0 left-0"
            initial={{ opacity: 1, y: 0, z: 0 }}
            animate={
              mouseEnter
                ? { opacity: 1, y: 0, z: 50 }
                : { opacity: 1, y: 0, z: 0 }
            }
            transition={{ duration: 0.3 }}
            style={{
              transform: mouseEnter ? 'translateZ(50px)' : 'translateZ(0)',
            }}
          >
            <motion.h3
              className="text-white text-xl font-bold"
              animate={{
                scale: mouseEnter ? 1.1 : 1,
                y: mouseEnter ? -5 : 0,
              }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {card.title.english?.length !== 0
                ? card.title.english
                : card.title.romaji}
            </motion.h3>

            <motion.div
              className="w-0 h-1 bg-fuchsia-500 mt-2"
              animate={{ width: mouseEnter ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default function HorizontalCarousel({ cards }: { cards: CardType[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [hoveredButton, setHoveredButton] = useState<'prev' | 'next' | null>(
    null
  );

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

  const jumpToIndex = (index: number) => {
    setCurrentIndex(index);
    scrollToIndex(index);
  };

  const paginationItems = useMemo(
    () =>
      Array.from({ length: Math.ceil(cards.length - visibleCards + 1) }).map(
        (_, index) => ({ id: `page-${cards[0]?.id || 0}-${index}`, index })
      ),
    [cards, visibleCards]
  );

  return (
    <div className="w-full mx-auto px-6 py-8" ref={containerRef}>
      <div className="relative">
        <motion.div
          className="overflow-visible rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          ref={carouselRef}
        >
          <motion.div
            className="flex"
            style={{
              width: `${(cards.length / visibleCards) * 100}%`,
              perspective: '1000px',
            }}
            drag="x"
            dragConstraints={{
              left:
                -(cards.length - visibleCards) *
                ((100 / cards.length) * visibleCards),
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
                className="flex-shrink-0 snap-start px-2 py-3"
                style={{
                  width: `${100 / cards.length}%`,
                }}
              >
                <Card3D card={card} index={index} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            x: currentIndex === 0 ? -30 : -20,
            opacity: currentIndex === 0 ? 0.5 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onHoverStart={() => setHoveredButton('prev')}
          onHoverEnd={() => setHoveredButton(null)}
        >
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg transition-all',
              hoveredButton === 'prev' ? 'bg-white' : 'bg-white/80',
              currentIndex === 0
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer'
            )}
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft
              className={cn(
                'h-6 w-6 transition-colors',
                hoveredButton === 'prev' ? 'text-fuchsia-600' : 'text-gray-800'
              )}
            />
            <span className="sr-only">Previous slide</span>
          </Button>
        </motion.div>

        <motion.div
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            x: currentIndex + visibleCards >= cards.length ? 30 : 20,
            opacity: currentIndex + visibleCards >= cards.length ? 0.5 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onHoverStart={() => setHoveredButton('next')}
          onHoverEnd={() => setHoveredButton(null)}
        >
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg transition-all',
              hoveredButton === 'next' ? 'bg-white' : 'bg-white/80',
              currentIndex + visibleCards >= cards.length
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer'
            )}
            onClick={nextSlide}
            disabled={currentIndex + visibleCards >= cards.length}
          >
            <ChevronRight
              className={cn(
                'h-6 w-6 transition-colors',
                hoveredButton === 'next' ? 'text-fuchsia-600' : 'text-gray-800'
              )}
            />
            <span className="sr-only">Next slide</span>
          </Button>
        </motion.div>
      </div>

      {/* Pagination indicators */}
      <div className="flex justify-center mt-6 gap-2">
        {paginationItems.map((item) => (
          <motion.button
            key={item.id}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all',
              currentIndex === item.index
                ? 'bg-fuchsia-600 w-8'
                : 'bg-gray-300 hover:bg-gray-400'
            )}
            onClick={() => jumpToIndex(item.index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item.index * 0.05 }}
          />
        ))}
      </div>
    </div>
  );
}
