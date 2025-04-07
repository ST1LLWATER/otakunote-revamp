'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useWatchlistStore } from '@/store/watchlistStore';

interface RemoveButtonProps {
  mediaId: string;
  onRemove?: () => void;
}

export const REMOVE_BUTTON = ({ mediaId, onRemove }: RemoveButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const watchlistStore = useWatchlistStore();
  const removeFromWatchlist = watchlistStore?.removeFromWatchlist;

  const handleClick = async () => {
    if (typeof removeFromWatchlist !== 'function') {
      toast.error('Watchlist functionality is unavailable');
      console.error('removeFromWatchlist function not available');
      return;
    }

    setIsLoading(true);

    try {
      removeFromWatchlist(mediaId);
      toast.success('Removed from watchlist');

      // Call onRemove callback if provided
      if (onRemove) {
        onRemove();
      }
    } catch (error) {
      toast.error('Failed to remove from watchlist');
      console.error('Failed to remove from watchlist', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        className="p-2 w-full flex gap-2 items-center justify-center bg-red-600 hover:bg-red-700 text-white"
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
          <Trash2 className="h-4 w-4" />
        )}
        <p>Remove</p>
      </Button>
    </motion.div>
  );
};
