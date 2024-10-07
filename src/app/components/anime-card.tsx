import React, { MouseEvent, useState, useEffect } from 'react';
import { CardInterface } from '@/lib/types';
import { animeModalAtom } from '@/store';
import { WATCHLIST_BUTTON } from './watchlist-button';
import { REMOVE_BUTTON } from './remove-button';
import { useAtom } from 'jotai';
import { selectedAnimeAtom } from '@/store';
import { ConstantData } from '@/lib/constants/filter-data';
import Draggable from '@/components/draggable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TruncateText from './truncate-text';
import { InfoIcon, StarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

// const [description, setDescription] = useState(props.description);

interface IAnimeCard {
  anime: CardInterface;
  watchlisted: boolean;
  isLoggedIn: boolean;
}

const AnimeCard = ({ anime, watchlisted, isLoggedIn }: IAnimeCard) => {
  const [isModalOpen, setIsModalOpen] = useAtom(animeModalAtom);
  const [, setSelectedAnime] = useAtom(selectedAnimeAtom);
  const [isHovered, setIsHovered] = useState<string>('translateY(54px)');

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
        className="relative flex flex-col justify-end p-4 select-none overflow-hidden max-w-80 w-full h-96 shadow-lg rounded-lg z-10"
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
        ></div>
        {anime.isAdult && (
          <div className="absolute top-0 left-0 bg-red-600 text-white px-2 py-0.5 rounded-br-lg text-xs font-semibold">
            NSFW
          </div>
        )}
        <div className="absolute top-0 right-0 bg-purple-600 text-white px-2 py-0.5 text-xs rounded-bl-lg font-semibold uppercase">
          {anime.type === 'ANIME' ? 'Anime' : 'Manga'}
        </div>
        <div
          style={{
            transform: `${isHovered}`,
          }}
          className="flex flex-col transition-all duration-300 ease-in-out translate-y-[54px] z-20"
        >
          <Draggable className="flex mb-4 overflow-x-auto gap-2 w-full cursor-pointer no-scrollbar">
            <>
              {anime.genres.map((item: string, index: number) => {
                return (
                  <p
                    key={index}
                    className="whitespace-nowrap text-white px-2 py-1.5 text-xs rounded-md bg-[rgba(107,107,107,0.62)] border border-[rgba(142,140,147,0.2)] leading-4"
                  >
                    {item}
                  </p>
                );
              })}
            </>
          </Draggable>
          <div className="text-lg mb-2 font-bold text-white leading-6">
            <TruncateText
              maxLines={3}
              text={anime.title.english ?? anime.title.romaji}
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
            </>
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
                // onClick={(e: MouseEvent<HTMLButtonElement>) => {
                //   setSelectedAnime({ id: anime.id, watchlisted });
                //   setIsModalOpen(true);
                // }}
                variant="outline"
                className="border-violet-600 px-2 w-full bg-transparent text-white"
              >
                <InfoIcon className="w-4 h-4 mr-1" />
                <p>Details</p>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnimeCard;
