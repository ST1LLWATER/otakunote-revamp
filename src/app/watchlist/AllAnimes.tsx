import AnimeCard from '../components/anime-card';
import React, { useEffect, useState, useCallback } from 'react';
import {
  useWatchlistStore,
  addWatchlistChangeListener,
} from '@/store/watchlistStore';
import { searchAnime } from '@/lib/api/animeApi';
import type { CardInterface } from '@/lib/types';
import { Loader2, BookOpen, Search } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-gray-400">Loading your watchlist...</p>
      </div>
    );
  }

  const isFiltered = activeTab && activeTab !== 'All';
  const showEmptyState = animeData.length === 0 && isFiltered;
  const showAllEmptyState =
    animeData.length === 0 && activeTab === 'All';

  if (showEmptyState) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Search className="w-7 h-7 text-gray-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-1">
            Nothing here yet
          </h3>
          <p className="text-sm text-gray-400 max-w-sm">
            No anime marked as &quot;{activeTab}&quot;. Update the status of
            your tracked anime to see them here.
          </p>
        </div>
      </div>
    );
  }

  if (showAllEmptyState) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-gray-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-1">
            Your watchlist is empty
          </h3>
          <p className="text-sm text-gray-400 max-w-sm">
            Start building your watchlist by browsing anime and adding titles
            you want to track.
          </p>
        </div>
        <Link href="/">
          <Button className="mt-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-none">
            <Search className="h-4 w-4 mr-2" /> Browse Anime
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Watchlist Grid */}
      {animeData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
