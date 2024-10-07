import { ConstantData } from '@/lib/constants/filter-data';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Separator } from './ui/separator';

interface SeasonHeaderProps {
  season: string;
  year: number;
  onPrevious: () => void;
  onNext: () => void;
}

const seasonMonths = ConstantData.Season;

export default function SeasonHeader({
  season,
  year,
  onPrevious,
  onNext,
}: SeasonHeaderProps) {
  const months = seasonMonths[season as keyof typeof seasonMonths];
  const dateRange = `${months[0]} ${year}-${months[2]} ${year}`;

  return (
    <div className="my-8">
      <div className="flex flex-col items-center">
        <p className="text-sm text-gray-500">{dateRange}</p>
        <div className="flex items-center justify-between w-full">
          <button
            onClick={onPrevious}
            className="p-2"
            aria-label="Previous season"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl md:text-3xl font-bold">
            {season.toUpperCase()} {year} Anime
          </h2>
          <button onClick={onNext} className="p-2" aria-label="Next season">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
      <Separator className="mt-4" />
    </div>
  );
}
