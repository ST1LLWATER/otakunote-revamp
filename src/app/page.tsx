'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import AnimeCard from './components/anime-card';
import AnimeCarousel from './components/anime-carousel';
import SeasonHeader from '@/components/season-header';
import { getCalendar } from './lib/api/animeApi';
import { ConstantData } from './lib/constants/filter-data';
import DetailModal from './components/detail-modal';
import CardCarousel from './components/card-carousel';
import Carousel from './components/horizontal-carousel-v2';
import { useAtom } from 'jotai';
import { selectedAnimeAtom } from './store';

export default function Home() {
  const [data, setData] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(
    Object.entries(ConstantData.Season).find(([_, value]) =>
      value.includes(new Date().toLocaleString('default', { month: 'long' }))
    )![0]
  );
  const [year, setYear] = useState(new Date().getFullYear());
  const [debouncedSeason, setDebouncedSeason] = useState(season);
  const [debouncedYear, setDebouncedYear] = useState(year);

  const [selectedData, setSelectedData] = useAtom(selectedAnimeAtom);

  console.log('🚀 ~ file: page.tsx:29 ~ Home ~ selectedData:', selectedData);

  const seasons = Object.keys(ConstantData.Season);

  const fetchAnime = useCallback(async (season: string, year: number) => {
    const data = await getCalendar({ season, year });
    setData(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSeason(season);
      setDebouncedYear(year);
    }, 1500);

    return () => clearTimeout(timer);
  }, [season, year]);

  useEffect(() => {
    fetchAnime(debouncedSeason, debouncedYear);
  }, [debouncedSeason, debouncedYear, fetchAnime]);

  const carouselData = data.slice(0, 5);

  const handlePreviousSeason = () => {
    setLoading(true);

    const currentIndex = seasons.indexOf(season);
    if (currentIndex === 0) {
      setSeason(seasons[seasons.length - 1]);
      setYear(year - 1);
    } else {
      setSeason(seasons[currentIndex - 1]);
    }
  };

  const handleNextSeason = () => {
    setLoading(true);

    const currentIndex = seasons.indexOf(season);
    if (currentIndex === seasons.length - 1) {
      setSeason(seasons[0]);
      setYear(year + 1);
    } else {
      setSeason(seasons[currentIndex + 1]);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
        delay: i * 0.1,
      },
    }),
  };

  console.log(data);

  return (
    <div className="container mx-auto px-4 py-8">
      <DetailModal />
      <AnimeCarousel carouselItems={carouselData} />
      <div className="flex flex-col gap-4 my-6">
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-5xl dark:text-white">
          Trending
        </h1>
        <Carousel cards={data.slice(0, 10)} />
      </div>
      <SeasonHeader
        season={season}
        year={year}
        onPrevious={handlePreviousSeason}
        onNext={handleNextSeason}
      />
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 place-items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {!loading
          ? data.map((anime, index) => (
              <motion.div
                className="w-full h-full"
                key={anime.id}
                variants={itemVariants}
                custom={index} // Pass index as custom prop
              >
                <AnimeCard
                  anime={anime}
                  isLoggedIn={false}
                  watchlisted={false}
                />
              </motion.div>
            ))
          : [...Array(20)].map((_, index) => (
              <div key={index} className="w-full h-full">
                <Shimmer />
              </div>
            ))}
        {/* {data.map((anime, index) => (
          <motion.div
            className="w-full h-full"
            key={anime.id}
            variants={itemVariants}
            custom={index} // Pass index as custom prop
          >
            <AnimeCard anime={anime} isLoggedIn={false} watchlisted={false} />
          </motion.div>
        ))} */}
      </motion.div>
    </div>
  );
}

const Shimmer = () => (
  <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-md w-full h-96">
    <motion.div
      className="absolute left-0 right-0 inset-0 w-full h-full"
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{
        repeat: Infinity,
        duration: 1.5,
        ease: 'easeInOut',
      }}
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
      }}
    />
  </div>
);
