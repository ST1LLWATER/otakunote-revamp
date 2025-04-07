import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import type { CardInterface } from '@/lib/types';
import type { AnimeItem } from '../components/carousel-item';
import { useCallback } from 'react';

// Define the possible media types
type MediaType = 'ANIME' | 'MANGA';

// Create a union type for anime data
type AnimeData = CardInterface | AnimeItem;

// Define the shape of the watchlist item
interface WatchlistItem {
  id: string;
  type: MediaType;
  addedAt: number;
  status: 'watching' | 'completed' | 'plan_to_watch' | 'dropped';
  watchedEpisodes: number; // Track the number of episodes watched
  animeData?: AnimeData; // Store the full anime data
}

// Create a global event emitter for watchlist changes
const watchlistChangeListeners: Array<(id: string, added: boolean) => void> =
  [];

export const emitWatchlistChange = (id: string, added: boolean) => {
  for (const listener of watchlistChangeListeners) {
    listener(id, added);
  }
};

export const addWatchlistChangeListener = (
  listener: (id: string, added: boolean) => void
) => {
  watchlistChangeListeners.push(listener);
  return () => {
    const index = watchlistChangeListeners.indexOf(listener);
    if (index !== -1) {
      watchlistChangeListeners.splice(index, 1);
    }
  };
};

// Create the base atom with storage persistence
export const watchlistItemsAtom = atomWithStorage<WatchlistItem[]>(
  'otakunote-watchlist',
  [], // Ensure default value is an empty array
  {
    // Customize storage to handle potential serialization issues
    getItem: (key, initialValue) => {
      try {
        const storedValue = localStorage.getItem(key);
        if (!storedValue) return initialValue;
        const parsed = JSON.parse(storedValue);
        return Array.isArray(parsed) ? parsed : initialValue;
      } catch (e) {
        console.error('Error reading from localStorage', e);
        return initialValue;
      }
    },
    setItem: (key, value) => {
      try {
        // Ensure value is always an array before storing
        const valueToStore = Array.isArray(value) ? value : [];
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (e) {
        console.error('Error writing to localStorage', e);
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error removing from localStorage', e);
      }
    },
  }
);

// Create helper atoms for derived state and actions
// Add item to watchlist
export const addToWatchlistAction = atom(
  null,
  (
    get,
    set,
    payload: { id: string; type: MediaType; animeData?: AnimeData }
  ) => {
    const { id, type, animeData } = payload;
    const items = get(watchlistItemsAtom) || []; // Ensure items is an array

    // Check if item already exists
    const existingItem = Array.isArray(items)
      ? items.find((item) => item.id === id)
      : undefined;

    if (existingItem) {
      // If item exists but animeData is provided, update the animeData
      if (animeData) {
        set(
          watchlistItemsAtom,
          items.map((item) => (item.id === id ? { ...item, animeData } : item))
        );
      }
      return; // Item already in watchlist
    }

    // Add new item
    set(watchlistItemsAtom, [
      ...(Array.isArray(items) ? items : []),
      {
        id,
        type,
        addedAt: Date.now(),
        status: 'plan_to_watch', // Default status for new items
        watchedEpisodes: 0, // Default watchedEpisodes for new items
        animeData, // Store the anime data if provided
      },
    ]);

    // Emit global event
    emitWatchlistChange(id, true);
  }
);

// Remove item from watchlist
export const removeFromWatchlistAction = atom(null, (get, set, id: string) => {
  const items = get(watchlistItemsAtom) || [];

  if (!Array.isArray(items)) {
    set(watchlistItemsAtom, []);
    return;
  }

  set(
    watchlistItemsAtom,
    items.filter((item) => item.id !== id)
  );

  // Emit global event
  emitWatchlistChange(id, false);
});

// Update watchlist item status
export const updateWatchlistStatusAction = atom(
  null,
  (get, set, payload: { id: string; status: WatchlistItem['status'] }) => {
    const { id, status } = payload;
    const items = get(watchlistItemsAtom) || [];

    if (!Array.isArray(items)) {
      set(watchlistItemsAtom, []);
      return;
    }

    set(
      watchlistItemsAtom,
      items.map((item) => (item.id === id ? { ...item, status } : item))
    );

    // Emit a custom event for components to listen to
    const event = new CustomEvent('watchlist-updated', {
      detail: { id, status },
    });
    window.dispatchEvent(event);
  }
);

// Update watched episodes
export const updateWatchedEpisodesAction = atom(
  null,
  (get, set, payload: { id: string; watchedEpisodes: number }) => {
    const { id, watchedEpisodes } = payload;
    const items = get(watchlistItemsAtom) || [];

    if (!Array.isArray(items)) {
      set(watchlistItemsAtom, []);
      return;
    }

    set(
      watchlistItemsAtom,
      items.map((item) =>
        item.id === id ? { ...item, watchedEpisodes } : item
      )
    );

    // Emit a custom event for components to listen to
    const event = new CustomEvent('watchlist-updated', {
      detail: { id, watchedEpisodes },
    });
    window.dispatchEvent(event);
  }
);

// Create a React hook that mimics the Zustand store API
export function useWatchlistStore() {
  // Get the watchlist items - ensure it's always an array
  const [itemsValue] = useAtom(watchlistItemsAtom);
  // Ensure items is always an array
  const items = Array.isArray(itemsValue) ? itemsValue : [];

  // Get the action setters
  const addToWatchlistSet = useSetAtom(addToWatchlistAction);
  const removeFromWatchlistSet = useSetAtom(removeFromWatchlistAction);
  const updateWatchlistStatusSet = useSetAtom(updateWatchlistStatusAction);
  const updateWatchedEpisodesSet = useSetAtom(updateWatchedEpisodesAction);

  // Create and memoize the helper functions that mimic the original Zustand API
  const isInWatchlist = useCallback(
    (id: string) => {
      return Array.isArray(items) && items.some((item) => item.id === id);
    },
    [items]
  );

  const getWatchlistStatus = useCallback(
    (id: string) => {
      if (!Array.isArray(items)) return null;
      const item = items.find((item) => item.id === id);
      return item ? item.status : null;
    },
    [items]
  );

  const getWatchedEpisodes = useCallback(
    (id: string) => {
      if (!Array.isArray(items)) return 0;
      const item = items.find((item) => item.id === id);
      return item ? item.watchedEpisodes : 0;
    },
    [items]
  );

  const getAnimeData = useCallback(
    (id: string) => {
      if (!Array.isArray(items)) return undefined;
      const item = items.find((item) => item.id === id);
      return item?.animeData;
    },
    [items]
  );

  const addToWatchlist = useCallback(
    (id: string, type: MediaType, animeData?: AnimeData) => {
      addToWatchlistSet({ id, type, animeData });
    },
    [addToWatchlistSet]
  );

  const removeFromWatchlist = useCallback(
    (id: string) => {
      removeFromWatchlistSet(id);
    },
    [removeFromWatchlistSet]
  );

  const updateWatchlistStatus = useCallback(
    (id: string, status: WatchlistItem['status']) => {
      updateWatchlistStatusSet({ id, status });
    },
    [updateWatchlistStatusSet]
  );

  const updateWatchedEpisodes = useCallback(
    (id: string, watchedEpisodes: number) => {
      updateWatchedEpisodesSet({ id, watchedEpisodes });
    },
    [updateWatchedEpisodesSet]
  );

  // Return an object with the same API as the original Zustand store
  return {
    items,
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistStatus,
    updateWatchedEpisodes,
    isInWatchlist,
    getWatchlistStatus,
    getWatchedEpisodes,
    getAnimeData,
  };
}
