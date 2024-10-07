'use client';

import { useEffect, useState, useCallback } from 'react';
import AnimeCard from './components/anime-card';
import AnimeCarousel from './components/anime-carousel';
import SeasonHeader from '@/components/season-header';
import { getCalendar } from './lib/api/animeApi';
import { ConstantData } from './lib/constants/filter-data';

export default function Home() {
  const [data, setData] = useState([]);
  const [season, setSeason] = useState(
    Object.entries(ConstantData.Season).find(([_, value]) =>
      value.includes(new Date().toLocaleString('default', { month: 'long' }))
    )![0]
  );
  const [year, setYear] = useState(new Date().getFullYear());
  const [debouncedSeason, setDebouncedSeason] = useState(season);
  const [debouncedYear, setDebouncedYear] = useState(year);

  const seasons = Object.keys(ConstantData.Season);

  const fetchAnime = useCallback(async (season: string, year: number) => {
    const data = await getCalendar({ season, year });
    setData(data);
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
    const currentIndex = seasons.indexOf(season);
    if (currentIndex === 0) {
      setSeason(seasons[seasons.length - 1]);
      setYear(year - 1);
    } else {
      setSeason(seasons[currentIndex - 1]);
    }
  };

  const handleNextSeason = () => {
    const currentIndex = seasons.indexOf(season);
    if (currentIndex === seasons.length - 1) {
      setSeason(seasons[0]);
      setYear(year + 1);
    } else {
      setSeason(seasons[currentIndex + 1]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimeCarousel carouselItems={carouselData} />
      <SeasonHeader
        season={season}
        year={year}
        onPrevious={handlePreviousSeason}
        onNext={handleNextSeason}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 place-items-center">
        {data.map((anime) => (
          <AnimeCard
            key={anime.id}
            anime={anime}
            isLoggedIn={false}
            watchlisted={false}
          />
        ))}
      </div>
    </div>
  );
}
