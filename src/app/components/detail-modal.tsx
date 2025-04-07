'use client';

import { ConstantData } from '@/lib/constants/filter-data';
import { StarIcon } from 'lucide-react';
import React, { MouseEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Draggable from './draggable';
import DOMPurify from 'dompurify';
import { Dialog, DialogContent } from './ui/dialog';
import { useAtom } from 'jotai';
import { detailsModalAtom, selectedAnimeAtom } from '@/store';
import { ScrollArea } from './ui/scroll-area';

type ModalType = {
  session?: boolean;
  watchlisted?: boolean;
};

const DetailModal = ({ session = true, watchlisted = true }: ModalType) => {
  const [isOpen, setIsOpen] = useAtom(detailsModalAtom);
  const [data, setData] = useAtom(selectedAnimeAtom);

  const [watchedEpisodes, setWatchedEpisodes] = useState(1);

  if (!data) {
    return <Loader isOpen={isOpen} />;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setData(null);
        setIsOpen(!isOpen);
      }}
    >
      <DialogContent className="max-w-4xl rounded-lg overflow-hidden p-0">
        <ScrollArea className="max-h-[80vh]">
          <div className="relative">
            <div
              style={{
                backgroundImage: `url(${data.bannerImage})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                height: '200px',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/70 via-40%" />
            </div>
            <div className="absolute bottom-0 left-0 p-4 z-10">
              <div className="flex items-center gap-2 text-white mb-2">
                <div className="flex items-center justify-center gap-1 bg-gray-500/70 px-2 py-1 text-xs leading-4 rounded-full">
                  <p>{data.averageScore ?? 0 / 10}</p>
                  <StarIcon className="w-3 h-3" />
                </div>
                {data.episodes && (
                  <div className="flex items-center justify-center gap-1 bg-gray-500/70 px-2 py-1 text-xs leading-4 rounded-full">
                    <p>EP {data.episodes}</p>
                  </div>
                )}
                {data.startDate?.year && (
                  <div className="flex items-center justify-center gap-1 bg-gray-500/70 px-2 py-1 text-xs leading-4 rounded-full">
                    <p>
                      {ConstantData.Months[(data.startDate?.month ?? 1) - 1]}{' '}
                      {data.startDate?.year}
                    </p>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">
                {data.title?.romaji}
              </h2>
              {data.title?.english &&
                data.title.english !== data.title.romaji && (
                  <p className="text-lg text-gray-300">{data.title.english}</p>
                )}
            </div>
          </div>
          <div className="p-4 bg-neutral-900">
            <div className="text-sm leading-6 mb-4">
              {data.description && (
                <div
                  ref={(node) => {
                    if (node) {
                      node.innerHTML = DOMPurify.sanitize(
                        data.description || ''
                      );
                    }
                  }}
                />
              )}
            </div>
            {(data.characterPreview?.edges?.length ?? 0) > 0 && (
              <Draggable className="flex mb-4 gap-5 w-full pb-2.5 cursor-pointer overflow-x-auto scrollbar-custom">
                <div className="flex gap-5">
                  {data.characterPreview?.edges?.map((character, index) => {
                    if (
                      !character ||
                      !character.node ||
                      !character.node.name ||
                      !character.node.image?.medium ||
                      !character?.node.name.full
                    )
                      return null;

                    return (
                      <div
                        key={character.node.name.full}
                        className="whitespace-nowrap select-none flex flex-shrink-0 rounded-lg px-4 py-1 bg-gray-700/70 gap-2.5 items-center justify-start leading-6"
                      >
                        <img
                          loading="lazy"
                          className="w-14 h-14 rounded-full object-cover"
                          src={character?.node?.image?.medium}
                          alt={character.node.name.full}
                        />
                        <div className="flex flex-col justify-between">
                          <div className="text-lg text-white">
                            {character.node.name.full}
                          </div>
                          <div className="text-xs font-normal text-gray-100">
                            {character.role}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Draggable>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

function Loader({ isOpen }: { isOpen: boolean }) {
  const shimmer = {
    hidden: {
      backgroundPosition: '-200% 0',
    },
    visible: {
      backgroundPosition: '200% 0',
    },
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-4xl flex flex-col gap-0 h-[80vh] rounded-full overflow-hidden p-0">
        <motion.div
          className="relative"
          variants={shimmer}
          initial="hidden"
          animate="visible"
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 1.5,
            ease: 'linear',
          }}
          style={{
            background:
              'linear-gradient(to right, #2a2a2a 8%, #3a3a3a 18%, #2a2a2a 33%)',
            backgroundSize: '200% 100%',
          }}
        >
          {/* Banner image shimmer */}
          <div className="h-[200px]" />
          {/* Title area shimmer */}
          <div className="absolute bottom-0 left-0 p-4 z-10 w-full">
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-6 w-16 bg-neutral-700/50 rounded-full"
                />
              ))}
            </div>
            <div className="h-8 w-3/4 bg-neutral-700/50 rounded mb-2" />
            <div className="h-6 w-1/2 bg-neutral-700/50 rounded" />
          </div>
        </motion.div>
        <motion.div
          className="p-4 h-full bg-neutral-900 flex flex-col"
          variants={shimmer}
          initial="hidden"
          animate="visible"
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 1.5,
            ease: 'linear',
          }}
          style={{
            background:
              'linear-gradient(to right, #1a1a1a 8%, #2a2a2a 18%, #1a1a1a 33%)',
            backgroundSize: '200% 100%',
          }}
        >
          {/* Description shimmer */}
          <div className="space-y-2 mb-4">
            {[...Array(10)].map((i) => (
              <div key={i} className="h-6 bg-neutral-800/50 rounded" />
            ))}
          </div>
          {/* Character list shimmer */}
          <div className="flex gap-5 overflow-x-auto pb-2.5 mt-auto">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-48 h-16 bg-neutral-800/50 rounded-lg"
              />
            ))}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export default DetailModal;
