'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';
import { StarIcon } from 'lucide-react';
import { CardInterface } from '@/lib/types';
import { animeModalAtom, selectedAnimeAtom } from '@/store';
import { WATCHLIST_BUTTON } from './watchlist-button';
import { REMOVE_BUTTON } from './remove-button';
import { ConstantData } from '@/lib/constants/filter-data';
import Draggable from '@/components/draggable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TruncateText from './truncate-text';

interface IAnimeCard {
  anime: CardInterface;
  watchlisted: boolean;
  isLoggedIn: boolean;
}

export default function AnimeCard({
  anime,
  watchlisted,
  isLoggedIn,
}: IAnimeCard) {
  const [isModalOpen, setIsModalOpen] = useAtom(animeModalAtom);
  const [, setSelectedAnime] = useAtom(selectedAnimeAtom);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isModalOpen) {
      setIsHovered(false);
    }
  }, [isModalOpen]);

  return (
    <motion.div
      className="relative flex flex-col justify-end p-4 select-none overflow-hidden max-w-64 w-full h-96 shadow-lg rounded-lg z-10"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => !isModalOpen && setIsHovered(false)}
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
        <Badge className="absolute top-0 left-0 bg-red-600 text-white px-2.5 py-1 rounded-br-lg text-xs font-semibold">
          NSFW
        </Badge>
      )}
      <Badge className="absolute top-0 right-0 bg-purple-600 text-white px-2.5 py-1 rounded-bl-lg text-xs font-semibold">
        {anime.type === 'ANIME' ? 'Anime' : 'Manga'}
      </Badge>
      <motion.div
        className="flex flex-col z-20"
        initial={{ y: 54 }}
        animate={{ y: isHovered ? 0 : 54 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Draggable className="flex mb-4 overflow-x-auto gap-2 w-full cursor-pointer scrollbar-hide">
          {anime.genres.map((item: string, index: number) => (
            <p
              key={index}
              className="whitespace-nowrap text-white px-2 py-1.5 text-xs rounded-md bg-[rgba(35,35,37,0.616)] border border-[rgba(142,140,147,0.2)] leading-4"
            >
              {item}
            </p>
          ))}
        </Draggable>
        <div className="text-lg mb-2 font-bold text-white leading-6">
          <TruncateText
            maxLines={2}
            text={anime.title.english ?? anime.title.romaji}
          />
        </div>
        <Draggable className="flex items-center gap-2 mb-6 text-white overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-center gap-1 px-3 text-xs leading-6 border border-[rgba(161,161,161,0.2)] rounded-full">
            <p>{anime?.averageScore / 10}</p>
            <StarIcon />
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
                <p>{ConstantData.Months[anime.startDate.month - 1]}</p>
              )}
              <p>{anime.startDate.year}</p>
            </div>
          )}
        </Draggable>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              {watchlisted ? (
                <REMOVE_BUTTON mediaId={anime.id} />
              ) : (
                <WATCHLIST_BUTTON
                  mediaId={anime.id}
                  mediaType={anime.type}
                  isLoggedIn={isLoggedIn}
                />
              )}
              <Button
                onClick={() => {
                  setSelectedAnime({ id: anime.id, watchlisted });
                  setIsModalOpen(true);
                }}
                variant="outline"
                size="sm"
                color="violet"
              >
                Details
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
