'use client';

import { ConstantData } from '@/lib/constants/filter-data';
import { StarIcon } from 'lucide-react';
import React, { MouseEvent, useState } from 'react';
import Draggable from './draggable';
import { Dialog, DialogContent } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

type ModalType = {
  data: any;
  session?: boolean;
  watchlisted?: boolean;
};

const DetailModal = ({
  data,
  session = true,
  watchlisted = true,
}: ModalType) => {
  const [watchedEpisodes, setWatchedEpisodes] = useState(0);

  if (!data) {
    return null;
  }

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-4xl rounded-full overflow-hidden p-0">
        <ScrollArea className="h-[80vh]">
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
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/70 via-40%"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-4 z-10">
              <div className="flex items-center gap-2 text-white mb-2">
                <div className="flex items-center justify-center gap-1 bg-gray-500/70 px-2 py-1 text-xs leading-4 rounded-full">
                  <p>{data.averageScore / 10}</p>
                  <StarIcon className="w-3 h-3" />
                </div>
                {data.episodes && (
                  <div className="flex items-center justify-center gap-1 bg-gray-500/70 px-2 py-1 text-xs leading-4 rounded-full">
                    <p>EP {data.episodes}</p>
                  </div>
                )}
                {data.startDate.year && (
                  <div className="flex items-center justify-center gap-1 bg-gray-500/70 px-2 py-1 text-xs leading-4 rounded-full">
                    <p>
                      {ConstantData.Months[data.startDate.month - 1]}{' '}
                      {data.startDate.year}
                    </p>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">
                {data.title.romaji}
              </h2>
              {data.title.english &&
                data.title.english !== data.title.romaji && (
                  <p className="text-lg text-gray-300">{data.title.english}</p>
                )}
            </div>
          </div>
          <div className="p-4 bg-neutral-900">
            <div
              className="text-sm leading-6 mb-4"
              dangerouslySetInnerHTML={{ __html: data.description }}
            ></div>
            {data.characterPreview.edges.length > 0 && (
              <Draggable className="flex mb-4 gap-5 w-full pb-2.5 cursor-pointer overflow-x-auto scrollbar-custom">
                <>
                  {data.characterPreview.edges.map((character, index) => {
                    return (
                      <div
                        key={index}
                        className="whitespace-nowrap select-none flex flex-shrink-0 rounded-lg px-4 py-1 bg-gray-700/70 gap-2.5 items-center justify-start leading-6"
                      >
                        <img
                          loading="lazy"
                          className="w-14 h-14 rounded-full object-cover"
                          src={character.node.image.medium}
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
                </>
              </Draggable>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DetailModal;
