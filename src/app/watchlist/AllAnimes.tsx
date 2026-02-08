import AnimeCard from '../components/anime-card';
import React, { useEffect, useState, useCallback } from 'react';
import {
  useWatchlistStore,
  addWatchlistChangeListener,
} from '@/store/watchlistStore';
import { searchAnime, type RecommendationItem } from '@/lib/api/animeApi';
import type { CardInterface } from '@/lib/types';
import { Loader2, BookOpen, Search, Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

enum CardType {
  ANIME = 'ANIME',
  MANGA = 'MANGA',
}

interface AllAnimesProps {
  filterIds?: string[];
  activeTab?: string;
  recommendations?: RecommendationItem[];
  loadingRecommendations?: boolean;
}

const AllAnimes = ({
  filterIds,
  activeTab,
  recommendations = [],
  loadingRecommendations = false,
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
    animeData.length === 0 && activeTab === 'All' && !loadingRecommendations;

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

  if (showAllEmptyState && recommendations.length === 0) {
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

  const showRecommendations =
    activeTab === 'All' && recommendations.length > 0;

  return (
    <div className="space-y-10">
      {/* Recommendations Section */}
      {activeTab === 'All' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
           {/* Decorative background glow for recommendations */}
           <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 rounded-3xl blur-2xl -z-10 opacity-50" />

          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
               <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 z-10 relative">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-amber-500 blur-lg opacity-40 rounded-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-100">
                  Recommended For You
                </h2>
                <p className="text-sm text-amber-200/60 font-medium">
                  Curated picks based on your collection
                </p>
              </div>
            </div>
            {/* Optional: Add a refresh button here if we wanted to let user re-roll recommendations */}
          </div>

          {/* Loading State */}
          {loadingRecommendations && (
            <div className="flex items-center justify-center py-20 bg-white/[0.02] rounded-3xl border border-white/5 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  </div>
                </div>
                <p className="text-sm font-medium text-amber-200/70 animate-pulse">
                  Finding hidden gems...
                </p>
              </div>
            </div>
          )}

          {/* No Recommendations State (Fallback) */}
          {!loadingRecommendations && recommendations.length === 0 && (
            <div className="py-12 px-6 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-3xl border border-amber-500/10 text-center backdrop-blur-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                <Star className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Need more data
              </h3>
              <p className="text-base text-gray-400 max-w-md mx-auto leading-relaxed">
                Add more anime to your watchlist and we&apos;ll define your taste profile to suggest similar titles.
              </p>
            </div>
          )}

          {/* Recommendations Grid */}
          {!loadingRecommendations && recommendations.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index * 0.05, 0.5),
                    type: "spring",
                    stiffness: 100
                  }}
                  className="h-full"
                >
                  <Link href={`/anime/${rec.anime.id}`} className="block h-full">
                    <div className="group relative h-full overflow-hidden rounded-2xl bg-[#1A1A24] ring-1 ring-white/5 hover:ring-amber-500/50 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)] hover:-translate-y-1">
                      {/* Cover Image */}
                      <div className="aspect-[2/3] relative overflow-hidden">
                        <Image
                          src={
                            rec.anime.coverImage.extraLarge ||
                            rec.anime.coverImage.large
                          }
                          alt={
                            rec.anime.title.english || rec.anime.title.romaji
                          }
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#15151e] via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                        {/* Top Info */}
                        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0">
                           {rec.anime.averageScore > 0 && (
                            <div className="px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-lg">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span className="text-xs font-bold text-white">
                                {rec.anime.averageScore}%
                              </span>
                            </div>
                          )}
                        </div>
                        
                      </div>

                      {/* Content */}
                      <div className="p-4 relative">
                        {/* Decorative glow line */}
                        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-amber-500/50 transition-colors duration-300" />
                        
                        <h3 className="text-sm font-bold text-gray-100 line-clamp-2 leading-tight mb-2 group-hover:text-amber-100 transition-colors">
                            {rec.anime.title.english || rec.anime.title.romaji}
                        </h3>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400">
                           <div className="flex items-center gap-2">
                             <span>{rec.anime.format.replace('_', ' ')}</span>
                             {rec.anime.startDate?.year > 0 && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                                  <span>{rec.anime.startDate.year}</span>
                                </>
                             )}
                           </div>
                           <div className="flex items-center gap-1 group-hover:text-amber-400/80 transition-colors">
                              <Sparkles className="w-3 h-3" />
                              <span>{rec.rating}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Divider between recommendations and watchlist */}
      {showRecommendations && animeData.length > 0 && (
        <div className="relative py-4">
           <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#0F0F1A] px-4 text-sm font-semibold text-gray-500 uppercase tracking-widest">
              Your Watchlist
            </span>
          </div>
        </div>
      )}

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
