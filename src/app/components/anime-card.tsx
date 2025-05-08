import React, {
  type MouseEvent,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import type { CardInterface } from '@/lib/types';
import { detailsModalAtom } from '@/store';
import { WATCHLIST_BUTTON } from './watchlist-button';
import { REMOVE_BUTTON } from './remove-button';
import { useAtom } from 'jotai';
import { selectedAnimeAtom } from '@/store';
import { ConstantData } from '@/lib/constants/filter-data';
import Draggable from '@/components/draggable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TruncateText from './truncate-text';
import {
  InfoIcon,
  StarIcon,
  Play,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAnimeDetails } from '@/lib/api/animeApi';
import {
  useWatchlistStore,
  addWatchlistChangeListener,
} from '@/store/watchlistStore';
import type { AnimeItem } from './carousel-item';
import { toast } from 'sonner';

// We create a union type to support both CardInterface and AnimeItem
type AnimeData = CardInterface | AnimeItem;

// Define watchlist status type
type WatchlistStatus = 'watching' | 'completed' | 'plan_to_watch' | 'dropped';

interface IAnimeCard {
  anime: AnimeData;
  watchlisted?: boolean;
  isLoggedIn: boolean;
  typeColor?: string; // Optional prop for custom media type badge color
}

const AnimeCard = ({
  anime,
  watchlisted: externalWatchlisted, // Rename prop to avoid confusion
  isLoggedIn,
  typeColor,
}: IAnimeCard) => {
  const [isModalOpen, setIsModalOpen] = useAtom(detailsModalAtom);
  const [, setSelectedAnime] = useAtom(selectedAnimeAtom);
  const [isHovered, setIsHovered] = useState<string>('translateY(54px)');

  // Access the watchlist store to check if item is in watchlist
  const watchlistStore = useWatchlistStore();
  const isInWatchlist = watchlistStore?.isInWatchlist;
  const getWatchlistStatus = watchlistStore?.getWatchlistStatus;
  const getWatchedEpisodes = watchlistStore?.getWatchedEpisodes;

  // Handle both string and number IDs
  const animeId = typeof anime.id === 'number' ? String(anime.id) : anime.id;

  // Safe check function to determine if anime is in watchlist
  const checkIsInWatchlist = useCallback(
    (id: string) => {
      return typeof isInWatchlist === 'function' ? isInWatchlist(id) : false;
    },
    [isInWatchlist]
  );

  // Initialize state based on watchlist status and external prop
  const [isInWatchlistState, setIsInWatchlistState] = useState(false);
  const [watchlistStatus, setWatchlistStatus] =
    useState<WatchlistStatus>('plan_to_watch');
  const [watchedEpisodes, setWatchedEpisodes] = useState(0);

  useEffect(() => {
    if (animeId) {
      // Check if anime is in watchlist
      const inWatchlist = checkIsInWatchlist(animeId);
      setIsInWatchlistState(inWatchlist);

      // If in watchlist, get status and watched episodes
      if (inWatchlist) {
        if (typeof getWatchlistStatus === 'function') {
          const status = getWatchlistStatus(animeId);
          if (status) {
            setWatchlistStatus(status as WatchlistStatus);
          }
        }

        if (typeof getWatchedEpisodes === 'function') {
          const episodes = getWatchedEpisodes(animeId);
          setWatchedEpisodes(episodes);
        }
      }
    }
  }, [animeId, checkIsInWatchlist, getWatchlistStatus, getWatchedEpisodes]);

  // Use global watchlist change events to update state
  useEffect(() => {
    // Add a listener for watchlist changes
    const removeListener = addWatchlistChangeListener((id, added) => {
      if (id === animeId) {
        setIsInWatchlistState(added);

        // Reset status and episodes if removed from watchlist
        if (!added) {
          setWatchlistStatus('plan_to_watch');
          setWatchedEpisodes(0);
        }
      }
    });

    // Clean up listener when component unmounts
    return removeListener;
  }, [animeId]);

  // Handler for watchlist state changes
  const handleWatchlistChange = (added: boolean) => {
    setIsInWatchlistState(added);
  };

  // Handler for status changes
  const handleStatusChange = (status: WatchlistStatus) => {
    setWatchlistStatus(status);
  };

  // Get the status label for display
  const getStatusLabel = (status: WatchlistStatus): string => {
    switch (status) {
      case 'watching':
        return 'Watching';
      case 'completed':
        return 'Completed';
      case 'plan_to_watch':
        return 'Plan to Watch';
      case 'dropped':
        return 'Dropped';
      default:
        return 'Unknown';
    }
  };

  // Determine badge color based on media type
  const getMediaBadgeColor = () => {
    if (typeColor) return typeColor;
    return anime.type === 'ANIME' ? 'bg-purple-600' : 'bg-green-600';
  };

  const fetchAnimeDetails = async (id: string) => {
    setIsModalOpen(true);
    const details = await getAnimeDetails(id);
    console.log(details);
    setSelectedAnime(details);
  };

  function onHover() {
    setIsHovered('translateY(0px)');
  }

  function exitHover() {
    if (isModalOpen) {
      return;
    }
    setIsHovered('translateY(54px)');
  }

  useEffect(() => {
    if (!isModalOpen) {
      setTimeout(() => {
        setIsHovered('translateY(54px)');
      }, 100);
    }
  }, [isModalOpen]);

  return (
    <>
      <div
        onMouseOver={onHover}
        onMouseLeave={exitHover}
        onFocus={onHover}
        onBlur={exitHover}
        className="relative flex flex-col mx-auto justify-end p-4 select-none overflow-hidden w-full max-w-72 h-[400px] shadow-lg rounded-lg z-10"
      >
        <img
          src={anime.coverImage.extraLarge}
          alt="cover-image"
          loading="lazy"
          className="absolute w-full h-full object-cover top-0 left-0"
        />

        <div
          style={{
            background:
              'linear-gradient(180deg, rgba(34, 32, 39, 0) 0%, #222027 75.52%, #222027 100%)',
          }}
          className="absolute top-0 left-0 w-full h-full z-10"
        />
        {anime.isAdult && (
          <div className="absolute top-0 left-0 bg-red-600 text-white px-2 py-0.5 rounded-br-lg text-xs font-semibold">
            NSFW
          </div>
        )}
        <div
          className={`absolute top-0 right-0 ${getMediaBadgeColor()} text-white px-3 py-0.5 text-xs rounded-bl-lg font-semibold uppercase`}
        >
          {anime.type === 'ANIME' ? 'Anime' : 'Manga'}
        </div>

        {/* Status indicator for watchlisted anime */}
        {isInWatchlistState && (
          <div
            className="absolute top-1 left-1 z-20"
            title={`Status: ${getStatusLabel(
              watchlistStatus
            )} (Click to change)`}
          >
            <Button
              onClick={() => {
                const statusCycle: WatchlistStatus[] = [
                  'plan_to_watch',
                  'watching',
                  'completed',
                  'dropped',
                ];
                const currentIndex = statusCycle.indexOf(watchlistStatus);
                const nextStatus =
                  statusCycle[(currentIndex + 1) % statusCycle.length];

                if (watchlistStore?.updateWatchlistStatus) {
                  watchlistStore.updateWatchlistStatus(animeId, nextStatus);
                  setWatchlistStatus(nextStatus);
                  toast.success(`Status: ${getStatusLabel(nextStatus)}`);
                }
              }}
              variant="ghost"
              size="icon"
              className="h-7 w-7 p-0 rounded-full bg-black bg-opacity-50"
            >
              {watchlistStatus === 'watching' && (
                <Play className="h-4 w-4 text-green-500" />
              )}
              {watchlistStatus === 'completed' && (
                <CheckCircle className="h-4 w-4 text-blue-400" />
              )}
              {watchlistStatus === 'plan_to_watch' && (
                <Clock className="h-4 w-4 text-yellow-400" />
              )}
              {watchlistStatus === 'dropped' && (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
            </Button>
          </div>
        )}

        <div
          style={{
            transform: `${isHovered}`,
          }}
          className="flex flex-col transition-all duration-300 ease-in-out translate-y-[54px] z-20"
        >
          <Draggable className="flex mb-4 overflow-x-auto gap-2 w-full cursor-pointer no-scrollbar">
            <div className="flex gap-2">
              {anime.genres.map((item: string) => {
                return (
                  <p
                    key={`genre-${item}`}
                    className="whitespace-nowrap text-white px-2 py-1.5 text-xs rounded-md bg-[rgba(107,107,107,0.62)] border border-[rgba(142,140,147,0.2)] leading-4"
                  >
                    {item}
                  </p>
                );
              })}
            </div>
          </Draggable>
          <div className="text-lg mb-2 font-bold text-white leading-6">
            <TruncateText
              maxLines={3}
              text={
                anime.title.english?.length !== 0
                  ? anime.title.english
                  : anime.title.romaji
              }
            />
          </div>
          <Draggable className="flex items-center gap-2 mb-6 text-white overflow-x-auto no-scrollbar">
            <>
              <div className="flex items-center justify-center gap-1 px-3 text-xs leading-6 border border-[rgba(161,161,161,0.2)] rounded-full">
                <p>{anime?.averageScore / 10}</p>
                <StarIcon className="w-3 h-3 text-white fill-white" />
              </div>
              {anime.episodes && (
                <div className="flex items-center justify-center gap-1 px-3 text-xs leading-6 border border-[rgba(161,161,161,0.2)] rounded-full">
                  <p>EP</p>
                  {anime.status !== 'RELEASING' ? (
                    <p>{anime.episodes}</p>
                  ) : (
                    <p>{`${anime.nextAiringEpisode?.episode}/${anime.episodes}`}</p>
                  )}
                </div>
              )}
              {anime.startDate.year && (
                <div className="flex items-center justify-center gap-1 px-3 text-xs leading-6 border border-[rgba(161,161,161,0.2)] rounded-full">
                  {anime.startDate.month && (
                    <p>{ConstantData.Months[anime.startDate.month - 1]}</p>
                  )}
                  <p>{anime.startDate.year}</p>
                </div>
              )}
            </>
          </Draggable>
          <div className="grid grid-cols-2 gap-4">
            {isInWatchlistState ? (
              <>
                <REMOVE_BUTTON
                  mediaId={animeId}
                  onRemove={() => handleWatchlistChange(false)}
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      fetchAnimeDetails(animeId);
                    }}
                    variant="outline"
                    className="border-violet-600 px-2 w-full bg-transparent text-white"
                  >
                    <InfoIcon className="w-4 h-4 mr-1" />
                    <p>Details</p>
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <WATCHLIST_BUTTON
                  mediaId={animeId}
                  mediaType={anime.type}
                  isLoggedIn={isLoggedIn}
                  animeData={anime}
                  onWatchlistChange={handleWatchlistChange}
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      fetchAnimeDetails(animeId);
                    }}
                    variant="outline"
                    className="border-violet-600 px-2 w-full bg-transparent text-white"
                  >
                    <InfoIcon className="w-4 h-4 mr-1" />
                    <p>Details</p>
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AnimeCard;
