'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';

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
    <Button
      className="w-1/2 p-2"
      onClick={handleClick}
      variant="default"
      size="sm"
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="animate-spin mr-2">&#8987;</span>
      ) : (
        <Plus className="mr-2 h-4 w-4" />
      )}
      Add
    </Button>
  );
};
