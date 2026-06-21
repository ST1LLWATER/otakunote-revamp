import AnimeCard from '../components/anime-card';
import React, { useEffect, useState, useCallback } from 'react';
import {
  useWatchlistStore,
  addWatchlistChangeListener,
} from '@/store/watchlistStore';
import { searchAnime } from '@/lib/api/animeApi';
import type { CardInterface } from '@/lib/types';
import { Loader2, BookOpen, Search, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

enum CardType {
  ANIME = 'ANIME',
  MANGA = 'MANGA',
}

interface AllAnimesProps {
  filterIds?: string[];
  activeTab?: string;
}

const AllAnimes = ({
  filterIds,
  activeTab,
}: AllAnimesProps) => {
  const watchlistStore = useWatchlistStore();
  const items = watchlistStore?.items || [];
  const getAnimeData = watchlistStore?.getAnimeData;

  const [animeData, setAnimeData] = useState<CardInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [allWatchlistAnimes, setAllWatchlistAnimes] = useState<
    Map<string, CardInterface>
  >(new Map());

  const safeGetAnimeData = useCallback(
    (id: string) => {
      if (typeof getAnimeData === 'function') {
        return getAnimeData(id);
      }
      return undefined;
    },
    [getAnimeData]
  );

  const fetchWatchlistAnime = useCallback(async () => {
    if (!Array.isArray(items) || items.length === 0) {
      setAllWatchlistAnimes(new Map());
      setLoading(false);
      return;
    }

    try {
      const newCache = new Map<string, CardInterface>();
      const idsToFetch: number[] = [];

      for (const item of items) {
        const cachedAnime = safeGetAnimeData(item.id);

        if (cachedAnime) {
          newCache.set(item.id, cachedAnime as CardInterface);
        } else {
          const numId = Number.parseInt(item.id);
          if (!Number.isNaN(numId)) {
            idsToFetch.push(numId);
          }
        }
      }

      if (idsToFetch.length > 0) {
        const fetchedData = await searchAnime({
          id_in: idsToFetch,
        });

        if (Array.isArray(fetchedData)) {
          const formattedData = fetchedData
            .filter((item) => item !== null)
            .map((item) => ({
              id: String(item.id),
              type: (item.type || 'ANIME') as CardType,
              isAdult: item.isAdult || false,
              title: {
                english: item.title?.english || '',
                romaji: item.title?.romaji || '',
              },
              coverImage: {
                extraLarge: item.coverImage?.extraLarge || '',
                large: item.coverImage?.extraLarge || '',
              },
              startDate: {
                year: item.startDate?.year || 0,
                month: item.startDate?.month || 0,
                day: item.startDate?.day || 0,
              },
              status: item.status || '',
              episodes: item.episodes || 0,
              genres:
                item.genres?.filter((g) => g !== null).map((g) => g || '') ||
                [],
              averageScore: item.averageScore || 0,
              nextAiringEpisode: item.nextAiringEpisode
                ? {
                    airingAt: item.nextAiringEpisode.airingAt,
                    timeUntilAiring: item.nextAiringEpisode.timeUntilAiring,
                    episode: item.nextAiringEpisode.episode,
                  }
                : null,
            })) as CardInterface[];

          for (const anime of formattedData) {
            newCache.set(anime.id, anime);
          }
        }
      }

      setAllWatchlistAnimes(newCache);
    } catch (error) {
      console.error('Error fetching watchlisted anime:', error);
    } finally {
      setLoading(false);
    }
  }, [items, safeGetAnimeData]);

  const filterAnimeData = useCallback(() => {
    if (allWatchlistAnimes.size === 0) return [];
    if (!filterIds || !Array.isArray(filterIds)) {
      return Array.from(allWatchlistAnimes.values());
    }
    return filterIds
      .map((id) => allWatchlistAnimes.get(id))
      .filter((item): item is CardInterface => !!item);
  }, [filterIds, allWatchlistAnimes]);

  useEffect(() => {
    const handleWatchlistChange = () => {
      fetchWatchlistAnime();
    };
    window.addEventListener('watchlist-updated', handleWatchlistChange);
    return () => {
      window.removeEventListener('watchlist-updated', handleWatchlistChange);
    };
  }, [fetchWatchlistAnime]);

  useEffect(() => {
    const filteredData = filterAnimeData();
    setAnimeData(filteredData);
  }, [filterAnimeData]);

  useEffect(() => {
    setLoading(true);
    fetchWatchlistAnime();
  }, [fetchWatchlistAnime]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        <p className="text-sm text-white/40">Loading titles…</p>
      </div>
    );
  }

  const isFiltered = activeTab && activeTab !== 'All';
  const showEmptyState = animeData.length === 0 && isFiltered;
  const showAllEmptyState =
    animeData.length === 0 && activeTab === 'All';

  if (showEmptyState) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <Search className="w-5 h-5 text-white/30" />
        </div>
        <div>
          <h3 className="text-base font-medium text-white/80 mb-1">
            Nothing here yet
          </h3>
          <p className="text-sm text-white/40 max-w-sm">
            No anime marked as &quot;{activeTab}&quot;. Update a title&apos;s status to see it here.
          </p>
        </div>
      </div>
    );
  }

  if (showAllEmptyState) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white/30" />
        </div>
        <div>
          <h3 className="text-base font-medium text-white/80 mb-1">
            Your watchlist is empty
          </h3>
          <p className="text-sm text-white/40 max-w-sm">
            Browse anime and add titles you want to track.
          </p>
        </div>
        <Link href="/calendar">
          <Button className="mt-1 rounded-full px-5 h-10 bg-white text-black hover:bg-white/90 border-none font-medium">
            <Compass className="h-4 w-4 mr-2" /> Browse anime
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {animeData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {animeData.map((anime, index) => (
            <motion.div
              key={anime.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
            >
              <AnimeCard
                anime={anime}
                isLoggedIn={true}
                typeColor={
                  anime.type === 'ANIME' ? 'bg-purple-600' : 'bg-green-600'
                }
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllAnimes;
