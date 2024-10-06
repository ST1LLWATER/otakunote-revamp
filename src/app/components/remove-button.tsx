'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';

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
    <Button
      className="w-1/2 p-2"
      onClick={() => mutation.mutate({ mediaId })}
      variant="destructive"
      size="sm"
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="animate-spin mr-2">&#8987;</span>
      ) : (
        <Trash2 className="mr-2 h-4 w-4" />
      )}
      Remove
    </Button>
  );
};
