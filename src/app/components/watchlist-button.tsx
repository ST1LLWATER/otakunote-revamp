'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useWatchlistStore } from '@/store/watchlistStore';
import type { CardInterface } from '@/lib/types';
import type { AnimeItem } from './carousel-item';

// Create a union type for anime data
type AnimeData = CardInterface | AnimeItem;

interface WatchListPayload {
  isLoggedIn: boolean;
  mediaId: string;
  mediaType: string;
  animeData?: AnimeData;
  onWatchlistChange?: (added: boolean) => void; // Add callback
}

export const WATCHLIST_BUTTON = ({
  isLoggedIn,
  mediaId,
  mediaType,
  animeData,
  onWatchlistChange,
}: WatchListPayload) => {
  const [isLoading, setIsLoading] = useState(false);
  const watchlistStore = useWatchlistStore();
  const addToWatchlist = watchlistStore?.addToWatchlist;
  const isInWatchlist = watchlistStore?.isInWatchlist;

  // Safe function to check if something is in watchlist
  const safeIsInWatchlist = useCallback(
    (id: string) => {
      return typeof isInWatchlist === 'function' ? isInWatchlist(id) : false;
    },
    [isInWatchlist]
  );

  const handleClick = () => {
    if (!isLoggedIn) {
      toast.error('Please log in to add to watchlist');
      return;
    }

    // Check if addToWatchlist function exists
    if (typeof addToWatchlist !== 'function') {
      toast.error('Watchlist functionality is unavailable');
      console.error('addToWatchlist function not available');
      return;
    }

    setIsLoading(true);

    try {
      // Pass the anime data to the store
      addToWatchlist(mediaId, mediaType as 'ANIME' | 'MANGA', animeData);

      // Notify parent component about the change
      if (onWatchlistChange) {
        onWatchlistChange(true);
      }

      toast.success('Added to watchlist');
    } catch (error) {
      toast.error('Failed to add to watchlist');
      console.error('Failed to add to watchlist', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        className="p-2 w-full flex gap-2 items-center justify-center bg-purple-600 hover:bg-purple-700 text-white"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <motion.span
            className="inline-block mr-2"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          >
            Loading...
          </motion.span>
        ) : (
          <Plus className="h-4 w-4" />
        )}
        <p>Add</p>
      </Button>
    </motion.div>
  );
};
