'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface WatchListPayload {
  isLoggedIn: boolean;
  mediaId: number;
  mediaType: string;
}

const addToWatchlist = async ({
  mediaId,
  mediaType,
}: Omit<WatchListPayload, 'isLoggedIn'>) => {
  const response = await axios.post('/api/watchlist/add', {
    mediaId,
    mediaType,
  });
  return response.data;
};

export const WATCHLIST_BUTTON = ({
  isLoggedIn,
  mediaId,
  mediaType,
}: WatchListPayload) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addToWatchlist,
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['watchlist']);
      toast.success('Added to watchlist');
    },
    onError: (error) => {
      toast.error('Failed to add to watchlist');
      console.error('Failed to add to watchlist', error);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleClick = () => {
    if (!isLoggedIn) {
      toast.error('Please log in to add to watchlist');
      return;
    }
    mutation.mutate({ mediaId, mediaType });
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
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
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
