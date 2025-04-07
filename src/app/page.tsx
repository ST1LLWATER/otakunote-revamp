'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AnimeCard from './components/anime-card';
import AnimeCarousel from './components/anime-carousel';
import SeasonHeader from './components/season-header';
import { getCalendar } from './lib/api/animeApi';
import { ConstantData } from './lib/constants/filter-data';
import Carousel from './components/horizontal-carousel-v2';
import { useAtom } from 'jotai';
import { selectedAnimeAtom } from './store';
import { useWatchlistStore } from '@/store/watchlistStore';
import { Filter, X } from 'lucide-react';
import type { CardInterface } from '@/lib/types';
import type { AnimeItem } from './components/carousel-item';

export default function Home() {
  const [data, setData] = useState<AnimeItem[]>([]);
  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(
    Object.entries(ConstantData.Season).find(([_, value]) =>
      value.includes(new Date().toLocaleString('default', { month: 'long' }))
    )?.[0] ?? 'WINTER'
  );
  const [year, setYear] = useState(new Date().getFullYear());
  const [debouncedSeason, setDebouncedSeason] = useState(season);
  const [debouncedYear, setDebouncedYear] = useState(year);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showGenreFilter, setShowGenreFilter] = useState(false);

  const [selectedData, setSelectedData] = useAtom(selectedAnimeAtom);

  console.log('🚀 ~ file: page.tsx:29 ~ Home ~ selectedData:', selectedData);

  const seasons = Object.keys(ConstantData.Season);

  enum MediaType {
    ANIME = 'ANIME',
    MANGA = 'MANGA',
  }

  const fetchAnime = useCallback(
    async (season: string, year: number) => {
      try {
        const apiData = await getCalendar({
          season,
          year,
          genres: selectedGenres.length > 0 ? selectedGenres : undefined,
        });

        // Format data to match AnimeItem interface
        const formattedData = apiData
          .filter((item) => item !== null)
          .map((item) => ({
            id: Number(item.id),
            type: (item.type || 'ANIME') as string,
            isAdult: item.isAdult || false,
            title: {
              english: item.title?.english || '',
              romaji: item.title?.romaji || '',
            },
            coverImage: {
              extraLarge: item.coverImage?.extraLarge || '',
              large:
                item.coverImage?.large || item.coverImage?.extraLarge || '',
            },
            startDate: {
              year: item.startDate?.year || 0,
              month: item.startDate?.month || 0,
              day: item.startDate?.day || 0,
            },
            status: item.status || '',
            episodes: item.episodes || 0,
            genres:
              item.genres?.filter((g) => g !== null).map((g) => g || '') || [],
            averageScore: item.averageScore || 0,
            // Handle null nextAiringEpisode properly
            nextAiringEpisode: item.nextAiringEpisode
              ? {
                  airingAt: item.nextAiringEpisode.airingAt,
                  timeUntilAiring: item.nextAiringEpisode.timeUntilAiring,
                  episode: item.nextAiringEpisode.episode,
                }
              : {
                  airingAt: 0,
                  timeUntilAiring: 0,
                  episode: 0,
                },
            // Use fallback for bannerImage
            bannerImage:
              item.bannerImage ||
              item.coverImage?.large ||
              item.coverImage?.extraLarge ||
              '',
          })) as AnimeItem[];

        setData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching anime:', error);
        setLoading(false);
      }
    },
    [selectedGenres]
  );

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

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
    setLoading(true);
  };

  const clearGenres = () => {
    setSelectedGenres([]);
    setLoading(true);
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

      {/* Genre Filter Toggle */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          onClick={() => setShowGenreFilter(!showGenreFilter)}
          className="flex items-center gap-2 text-sm"
        >
          <Filter className="h-4 w-4" />
          {showGenreFilter ? 'Hide Genres' : 'Filter by Genre'}
        </Button>

        {selectedGenres.length > 0 && (
          <Button
            variant="ghost"
            onClick={clearGenres}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
            Clear Genres ({selectedGenres.length})
          </Button>
        )}
      </div>

      {/* Genre Filter Panel */}
      {showGenreFilter && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Genres
            </legend>
            <div className="flex flex-wrap gap-2">
              {ConstantData.GenreCollection.map((genre) => (
                <Badge
                  key={genre.value}
                  variant={
                    selectedGenres.includes(genre.value) ? 'default' : 'outline'
                  }
                  className={`
                    px-3 py-1 text-sm cursor-pointer transition-all
                    ${
                      selectedGenres.includes(genre.value)
                        ? 'bg-violet-600 hover:bg-violet-700 text-white'
                        : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                  onClick={() => toggleGenre(genre.value)}
                >
                  {genre.label}
                  {selectedGenres.includes(genre.value) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </fieldset>
        </div>
      )}

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
                <AnimeCard anime={anime} isLoggedIn={true} />
              </motion.div>
            ))
          : [...Array(20)].map((_, index) => (
              <div key={`loading-${index}`} className="w-full h-full">
                <Shimmer />
              </div>
            ))}
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
        repeat: Number.POSITIVE_INFINITY,
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
