'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface RemoveButtonProps {
  mediaId: number;
}

const removeFromWatchlist = async ({ mediaId }: RemoveButtonProps) => {
  const response = await axios.post('/api/watchlist/remove', { mediaId });
  return response.data;
};

export const REMOVE_BUTTON = ({ mediaId }: RemoveButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: removeFromWatchlist,
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['watchlist']);
      toast.success('Removed from watchlist');
    },
    onError: (error) => {
      toast.error('Failed to remove from watchlist');
      console.error('Failed to remove from watchlist', error);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        className="p-2 w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white"
        onClick={() => mutation.mutate({ mediaId })}
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
          <Trash2 className="h-4 w-4" />
        )}
        <p>Remove</p>
      </Button>
    </motion.div>
  );
};
