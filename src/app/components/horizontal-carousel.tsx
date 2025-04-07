'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  motion,
  useAnimation,
  useMotionValue,
  type PanInfo,
} from 'framer-motion';
import TruncateText from './truncate-text';

// Define proper type for card
interface CardType {
  id: number;
  coverImage: {
    extraLarge: string;
    large?: string;
  };
  title: {
    english: string | null;
    romaji: string;
  };
}

export default function HorizontalCarousel({ cards }: { cards: CardType[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);

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

  if (!cards) {
    return null;
  }

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
            {cards.map((card, index) => (
              // <motion.div
              //   key={card.id}
              //   className="flex-shrink-0 snap-start"
              //   style={{
              //     width: `${100 / cards.length}%`,
              //   }}
              // >
              //   <div className="mx-2 bg-transparent rounded-lg shadow-md overflow-hidden">
              //     <div className="flex items-end relative">
              //       <div className="pr-2 flex-shrink-0 relative">
              //         <div
              //           className="absolute bottom-full left-0 mb-2"
              //           style={{
              //             transform: 'rotate(-90deg)',
              //             transformOrigin: 'left bottom',
              //             width: '96px',
              //             height: '24px',
              //           }}
              //         >
              //           <span className="absolute bottom-0 right-0 text-sm font-semibold text-fuchsia-600 whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm">
              //             Lorem ipsum
              //           </span>
              //         </div>
              //         <span
              //           className="text-fuchsia-600 font-bold text-4xl"
              //           style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
              //         >
              //           {(index + 1).toString().padStart(2, '0')}
              //         </span>
              //       </div>
              //       <div
              //         className="h-96 max-w-64 flex-1 flex-shrink-0 bg-cover bg-center relative group"
              //         style={{
              //           backgroundImage: `url('${card.coverImage.extraLarge}')`,
              //         }}
              //       >
              //         <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              //         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              //           <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg p-4 rounded-lg">
              //             <h3 className="text-white text-xl font-bold text-center">
              //               {card.title.romaji}
              //             </h3>
              //           </div>
              //         </div>
              //       </div>
              //     </div>
              //   </div>
              // </motion.div>
              <motion.div
                key={card.id}
                className="flex-shrink-0 snap-start"
                style={{
                  width: `${100 / cards.length}%`,
                }}
              >
                <div className="mx-2 bg-transparent rounded-lg shadow-md overflow-hidden">
                  <div className="flex items-end">
                    <div className="pr-2 flex-shrink-0">
                      <span
                        className="text-fuchsia-600 font-bold text-4xl"
                        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
                      >
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div
                      className="h-96 max-w-64 flex-1 flex-shrink-0 bg-cover bg-center relative group"
                      style={{
                        backgroundImage: `url('${card.coverImage.extraLarge}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {/* add overlay of black to reduce opacity of background */}
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg p-4 rounded-lg">
                          <h3 className="text-white text-xl font-bold text-center">
                            <TruncateText
                              maxLines={3}
                              text={card.title.romaji}
                            />
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <Button
          variant="outline"
          size="icon"
          className="absolute bg-purple-700 left-0 hover:bg-purple-800 top-1/2 transform -translate-y-1/2 -translate-x-1/2"
          onClick={prevSlide}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous slide</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 bg-purple-700 hover:bg-purple-800 top-1/2 transform -translate-y-1/2 translate-x-1/2"
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
