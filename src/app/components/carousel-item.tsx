import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

export interface AnimeItem {
  id: number;
  type: string;
  isAdult: boolean;
  title: {
    english: string;
    romaji: string;
  };
  coverImage: {
    large: string;
    extraLarge: string;
  };
  bannerImage: string;
  startDate: {
    year: number;
    month: number;
    day: number;
  };
  status: string;
  episodes: number;
  genres: string[];
  averageScore: number;
  nextAiringEpisode: {
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
  };
}

interface CarouselItemProps {
  item: AnimeItem;
  index: number;
}

export const CarouselItem: React.FC<CarouselItemProps> = ({ item, index }) => {
  const nextEpisodeDate =
    new Date(item?.nextAiringEpisode?.airingAt * 1000) ?? null;

  return (
    <motion.div key={item.id} className="w-full h-full flex-shrink-0 relative">
      <picture>
        <source media="(min-width: 640px)" srcSet={item.bannerImage} />
        <img
          src={item.coverImage.extraLarge}
          alt={item.title.english || item.title.romaji}
          className="w-full h-full object-cover"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 to-black/20 pointer-events-none" />
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex flex-col gap-2">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {item.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="px-1 sm:px-2 py-0.5 sm:py-1 bg-primary text-primary-foreground rounded-full text-[10px] sm:text-xs font-semibold"
            >
              {genre}
            </span>
          ))}
          {item.genres.length > 3 && (
            <span className="px-1 sm:px-2 py-0.5 sm:py-1 bg-primary text-primary-foreground rounded-full text-[10px] sm:text-xs font-semibold">
              +{item.genres.length - 3}
            </span>
          )}
        </div>
        {/* <div className="inline-block px-1 sm:px-2 py-0.5 sm:py-1 bg-secondary text-secondary-foreground rounded-full text-[10px] sm:text-xs font-semibold">
          {item.status}
        </div> */}
      </div>
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-wide text-orange-500">{`#${
            index + 1
          } Spotlight`}</h2>
          <h2 className="text-white text-lg sm:text-2xl font-bold line-clamp-2">
            {item.title.english || item.title.romaji}
          </h2>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {!!item.averageScore && (
              <div className="inline-block px-1 sm:px-2 py-0.5 sm:py-1 bg-primary text-primary-foreground rounded-full text-[10px] sm:text-xs font-semibold">
                Score: {item.averageScore}
              </div>
            )}
            {!!item.episodes && (
              <div className="inline-block px-1 sm:px-2 py-0.5 sm:py-1 bg-primary text-primary-foreground rounded-full text-[10px] sm:text-xs font-semibold">
                Episodes: {item.episodes}
              </div>
            )}
            <div className="text-white text-[10px] sm:text-xs">
              Started:{' '}
              {format(
                new Date(
                  item.startDate.year,
                  item.startDate.month - 1,
                  item.startDate.day
                ),
                'MMM d, yyyy'
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            {item.nextAiringEpisode && (
              <div className="text-white text-[10px] sm:text-sm font-semibold">
                Next Ep: {item.nextAiringEpisode.episode}
              </div>
            )}
            {nextEpisodeDate && !isNaN(new Date(nextEpisodeDate).getTime()) ? (
              <div className="text-white text-sm sm:text-xs">
                Airing:{' '}
                {formatDistanceToNow(new Date(nextEpisodeDate), {
                  addSuffix: true,
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
