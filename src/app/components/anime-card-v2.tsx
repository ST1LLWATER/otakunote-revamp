import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { StarIcon, InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { REMOVE_BUTTON } from '@/components/remove-button';
import { WATCHLIST_BUTTON } from '@/components/watchlist-button';
import Draggable from './draggable';
import TruncateText from './truncate-text';

interface AnimeCardProps {
  anime: {
    id: string;
    coverImage: { extraLarge: string };
    isAdult: boolean;
    type: string;
    genres: string[];
    title: { english: string; romaji: string };
    averageScore: number;
    episodes: number;
    status: string;
    nextAiringEpisode?: { episode: number };
    startDate: { year: number; month: number };
  };
  watchlisted: boolean;
  isLoggedIn: boolean;
  fetchAnimeDetails: (id: string) => void;
}

export default function AnimeCard({
  anime,
  watchlisted,
  isLoggedIn,
  fetchAnimeDetails,
}: AnimeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <motion.div
      ref={cardRef}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative flex flex-col mx-auto justify-end p-4 select-none overflow-hidden w-full max-w-80 h-96 shadow-lg rounded-lg z-10"
    >
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          backgroundImage: `url(${anime.coverImage.extraLarge})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          y,
        }}
      />

      <div
        style={{
          background:
            'linear-gradient(180deg, rgba(34, 32, 39, 0) 0%, #222027 75.52%, #222027 100%)',
        }}
        className="absolute top-0 left-0 w-full h-full z-10"
      />
      {anime.isAdult && (
        <div className="absolute top-0 left-0 bg-red-600 text-white px-2 py-0.5 rounded-br-lg text-xs font-semibold z-20">
          NSFW
        </div>
      )}
      <div className="absolute top-0 right-0 bg-purple-600 text-white px-2 py-0.5 text-xs rounded-bl-lg font-semibold uppercase z-20">
        {anime.type === 'ANIME' ? 'Anime' : 'Manga'}
      </div>
      <motion.div
        animate={{ y: isHovered ? 0 : 54 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex flex-col z-20"
      >
        <Draggable className="flex mb-4 overflow-x-auto gap-2 w-full cursor-pointer no-scrollbar">
          {anime.genres.map((item: string, index: number) => (
            <p
              key={index}
              className="whitespace-nowrap text-white px-2 py-1.5 text-xs rounded-md bg-[rgba(107,107,107,0.62)] border border-[rgba(142,140,147,0.2)] leading-4"
            >
              {item}
            </p>
          ))}
        </Draggable>
        <div className="text-lg mb-2 font-bold text-white leading-6">
          <TruncateText
            maxLines={3}
            text={anime.title.english ?? anime.title.romaji}
          />
        </div>
        <Draggable className="flex items-center gap-2 mb-6 text-white overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-center gap-1 px-3 text-xs leading-6 border border-[rgba(161,161,161,0.2)] rounded-full">
            <p>{anime.averageScore / 10}</p>
            <StarIcon className="w-3 h-3 text-white fill-white" />
          </div>
          {anime.episodes && (
            <div className="flex items-center justify-center gap-1 px-3 text-xs leading-6 border border-[rgba(161,161,161,0.2)] rounded-full">
              <p>EP</p>
              {anime.status != 'RELEASING' ? (
                <p>{anime.episodes}</p>
              ) : (
                <p>{`${anime.nextAiringEpisode?.episode}/${anime.episodes}`}</p>
              )}
            </div>
          )}
          {anime.startDate.year && (
            <div className="flex items-center justify-center gap-1 px-3 text-xs leading-6 border border-[rgba(161,161,161,0.2)] rounded-full">
              {anime.startDate.month && (
                <p>
                  {new Date(0, anime.startDate.month - 1).toLocaleString(
                    'default',
                    { month: 'short' }
                  )}
                </p>
              )}
              <p>{anime.startDate.year}</p>
            </div>
          )}
        </Draggable>
        <div className="grid grid-cols-2 gap-4">
          {watchlisted ? (
            <REMOVE_BUTTON mediaId={anime.id} />
          ) : (
            <WATCHLIST_BUTTON
              mediaId={anime.id}
              mediaType={anime.type}
              isLoggedIn={isLoggedIn}
            />
          )}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => fetchAnimeDetails(anime.id)}
              variant="outline"
              className="border-violet-600 px-2 w-full bg-transparent text-white"
            >
              <InfoIcon className="w-4 h-4 mr-1" />
              <p>Details</p>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
