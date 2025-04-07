import AnimeCard from '../components/anime-card';
import React, { useEffect, useState, useCallback } from 'react';
import {
  useWatchlistStore,
  addWatchlistChangeListener,
} from '@/store/watchlistStore';
import { searchAnime } from '@/lib/api/animeApi';
import type { CardInterface } from '@/lib/types';
import { Loader2 } from 'lucide-react';

// Define the CardType enum locally to match the one in IAnimeCard.ts
enum CardType {
  ANIME = 'ANIME',
  MANGA = 'MANGA',
}

interface AllAnimesProps {
  filterIds?: string[]; // Optional prop to filter anime by IDs
}

const AllAnimes = ({ filterIds }: AllAnimesProps = {}) => {
  console.log('🚀 ~ AllAnimes ~ filterIds:', filterIds);

  const watchlistStore = useWatchlistStore();
  const items = watchlistStore?.items || [];
  const getAnimeData = watchlistStore?.getAnimeData;

  const [animeData, setAnimeData] = useState<CardInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [allWatchlistAnimes, setAllWatchlistAnimes] = useState<
    Map<string, CardInterface>
  >(new Map());

  // Safely get anime data from store
  const safeGetAnimeData = useCallback(
    (id: string) => {
      if (typeof getAnimeData === 'function') {
        return getAnimeData(id);
      }
      return undefined;
    },
    [getAnimeData]
  );

  // Function to fetch watchlist anime data
  const fetchWatchlistAnime = useCallback(async () => {
    // If we have no items in the watchlist, clear data and return early
    if (!Array.isArray(items) || items.length === 0) {
      setAllWatchlistAnimes(new Map());
      setLoading(false);
      return;
    }

    try {
      // Start with a fresh cache for this fetch operation
      const newCache = new Map<string, CardInterface>();

      // First, let's see what we can get from the store's cache
      const idsToFetch: number[] = [];

      for (const item of items) {
        // Check the global store cache first
        const cachedAnime = safeGetAnimeData(item.id);

        if (cachedAnime) {
          // If we have cached data in the store, add it to our new cache
          newCache.set(item.id, cachedAnime as CardInterface);
        } else {
          // If not cached, we need to fetch it
          const numId = Number.parseInt(item.id);
          if (!Number.isNaN(numId)) {
            idsToFetch.push(numId);
          }
        }
      }

      // If we need to fetch data not in the store cache
      if (idsToFetch.length > 0) {
        console.log('Fetching data for IDs:', idsToFetch);

        const fetchedData = await searchAnime({
          id_in: idsToFetch,
        });

        if (Array.isArray(fetchedData)) {
          // Convert to CardInterface
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

          // Add fetched data to our new cache
          for (const anime of formattedData) {
            newCache.set(anime.id, anime);
          }
        } else {
          console.error('Invalid response from searchAnime');
        }
      }

      // Update our cache with the complete set
      setAllWatchlistAnimes(newCache);
    } catch (error) {
      console.error('Error fetching watchlisted anime:', error);
    } finally {
      setLoading(false);
    }
  }, [items, safeGetAnimeData]);

  // Function to filter anime data based on filterIds
  const filterAnimeData = useCallback(() => {
    // If no data is available, return empty array
    if (allWatchlistAnimes.size === 0) {
      return [];
    }

    // If no filter IDs are provided or it's an empty array, return all cached anime
    console.log('FILTERED DIS', filterIds);

    if (!filterIds || !Array.isArray(filterIds)) {
      console.log('RETURNING ALL CACHED ANIME');
      return Array.from(allWatchlistAnimes.values());
    }

    // Return only anime matching the filter IDs
    return filterIds
      .map((id) => allWatchlistAnimes.get(id))
      .filter((item): item is CardInterface => !!item);
  }, [filterIds, allWatchlistAnimes]);

  // Set up a listener for watchlist changes
  useEffect(() => {
    // This will trigger a refresh when any watchlist item status changes
    const handleWatchlistChange = () => {
      // Refresh data when watchlist is updated
      fetchWatchlistAnime();
    };

    // Listen to changes
    window.addEventListener('watchlist-updated', handleWatchlistChange);

    return () => {
      window.removeEventListener('watchlist-updated', handleWatchlistChange);
    };
  }, [fetchWatchlistAnime]);

  // Effect to update displayed anime whenever filterAnimeData changes
  useEffect(() => {
    const filteredData = filterAnimeData();
    console.log('Setting filtered anime data:', filteredData.length, 'items');
    setAnimeData(filteredData);
  }, [filterAnimeData]);

  // Initial fetch of watchlist anime
  useEffect(() => {
    setLoading(true);
    fetchWatchlistAnime();
  }, [fetchWatchlistAnime]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
        <span className="ml-2 text-lg">Loading your watchlist...</span>
      </div>
    );
  }

  if (animeData.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">No items found</h2>
        <p className="text-gray-500">
          {filterIds && filterIds.length > 0
            ? 'No items found in this category. Try adding some anime to this watchlist status.'
            : 'Your watchlist is empty. Browse the anime catalog and add some titles to your watchlist.'}
        </p>
      </div>
    );
  }

  console.log('ANIME DATA', animeData);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center">
      {animeData.map((anime) => (
        <AnimeCard
          key={anime.id}
          anime={anime}
          isLoggedIn={true}
          typeColor={anime.type === 'ANIME' ? 'bg-purple-600' : 'bg-green-600'}
        />
      ))}
    </div>
  );
};

export default AllAnimes;
