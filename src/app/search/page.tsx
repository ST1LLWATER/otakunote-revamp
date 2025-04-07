'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AnimeCard from '../components/anime-card';
import { searchAnime } from '../lib/api/animeApi';
import { Search, Filter, RotateCcw, X } from 'lucide-react';
import { ConstantData } from '../lib/constants/filter-data';
import type {
  MediaType,
  MediaSort,
  SearchAnimeQueryVariables,
} from '../lib/graphql/generated/graphql';
import type { CardInterface } from '@/lib/types';

// Since the CardType enum is not exported properly, defining it here
enum CardType {
  ANIME = 'ANIME',
  MANGA = 'MANGA',
}

// Shimmer component copied from page.tsx
const Shimmer = () => (
  <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-md w-full h-96">
    <motion.div
      className="absolute left-0 right-0 inset-0 w-full h-full"
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{
        repeat: Number.POSITIVE_INFINITY,
        duration: 1.5,
        ease: 'easeInOut',
      }}
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
      }}
    />
  </div>
);

// Type for the filters
interface Filters {
  mediaType: string;
  sort: string;
  genres: string[];
}

// Helper function to convert MediaType to CardType
const convertToCardType = (mediaType: string | null | undefined): CardType => {
  if (mediaType === 'ANIME') return CardType.ANIME;
  if (mediaType === 'MANGA') return CardType.MANGA;
  return CardType.ANIME; // Default to ANIME if undefined
};

// Create a separate component that uses useSearchParams
function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('query') || ''
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState<string>(searchQuery);
  const [filters, setFilters] = useState<Filters>({
    mediaType: searchParams.get('mediaType') || 'ALL',
    sort: searchParams.get('sort') || 'POPULARITY_DESC',
    genres: searchParams.get('genres')?.split(',').filter(Boolean) || [],
  });
  const [results, setResults] = useState<CardInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Update the URL when filters or search query change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (filters.mediaType !== 'ALL') params.set('mediaType', filters.mediaType);
    params.set('sort', filters.sort);
    if (filters.genres.length > 0)
      params.set('genres', filters.genres.join(','));

    router.push(`/search?${params.toString()}`);
  }, [filters, searchQuery, router]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const variables: SearchAnimeQueryVariables = {
        page,
        perPage: 20,
        sort: [filters.sort as MediaSort],
      };

      if (debouncedSearchQuery.trim()) {
        variables.search_query = debouncedSearchQuery;
      }

      if (filters.mediaType !== 'ALL') {
        variables.type = filters.mediaType as MediaType;
      }

      if (filters.genres.length > 0) {
        variables.genres = filters.genres;
      }

      const data = await searchAnime(variables);
      // Map the API data to match CardInterface
      const formattedData = data
        .filter((item) => item !== null)
        .map((item) => ({
          id: String(item.id),
          type: convertToCardType(item.type),
          isAdult: item.isAdult || false,
          title: {
            english: item.title?.english || '',
            romaji: item.title?.romaji || '',
          },
          coverImage: {
            extraLarge: item.coverImage?.extraLarge || '',
            large: item.coverImage?.extraLarge || '', // Using extraLarge as fallback for large
          },
          startDate: {
            year: item.startDate?.year || 0,
            month: item.startDate?.month || 0,
            day: item.startDate?.day || 0,
          },
          status: item.status || '',
          episodes: item.episodes || 0,
          genres:
            item.genres?.filter((g) => g !== null).map((g) => g || '') || [],
          averageScore: item.averageScore || 0,
          nextAiringEpisode: item.nextAiringEpisode
            ? {
                airingAt: item.nextAiringEpisode.airingAt,
                timeUntilAiring: item.nextAiringEpisode.timeUntilAiring,
                episode: item.nextAiringEpisode.episode,
              }
            : null,
        }));

      // Cast to CardInterface[] to satisfy type checking
      setResults(formattedData as CardInterface[]);
    } catch (error) {
      console.error('Error searching anime:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearchQuery,
    filters.mediaType,
    filters.sort,
    filters.genres,
    page,
  ]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleMediaTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, mediaType: value }));
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sort: value }));
    setPage(1);
  };

  const handleGenreChange = (genre: string) => {
    setFilters((prev) => {
      const newGenres = prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres: newGenres };
    });
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      mediaType: 'ALL',
      sort: 'POPULARITY_DESC',
      genres: [],
    });
    setPage(1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
        delay: i * 0.1,
      },
    }),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-5xl dark:text-white mb-6">
          Search Anime & Manga
        </h1>

        {/* Enhanced Search Bar */}
        <div className="relative w-full mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search for anime or manga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 w-full text-base rounded-xl border-2 border-gray-300 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-500 shadow-sm"
          />
        </div>

        {/* Filter Toggle Button */}
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>

          {showFilters && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label
                  htmlFor="mediaType"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Media Type
                </label>
                <select
                  id="mediaType"
                  value={filters.mediaType}
                  onChange={(e) => handleMediaTypeChange(e.target.value)}
                  className="w-full h-12 rounded-lg border border-input bg-background px-4 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                >
                  <option value="ALL">All Types</option>
                  <option value="ANIME">Anime Only</option>
                  <option value="MANGA">Manga Only</option>
                </select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="sortBy"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Sort By
                </label>
                <select
                  id="sortBy"
                  value={filters.sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full h-12 rounded-lg border border-input bg-background px-4 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                >
                  <option value="START_DATE">Start Date (Asc)</option>
                  <option value="START_DATE_DESC">Start Date (Desc)</option>
                  <option value="END_DATE">End Date (Asc)</option>
                  <option value="END_DATE_DESC">End Date (Desc)</option>
                  <option value="SCORE">Score (Asc)</option>
                  <option value="SCORE_DESC">Score (Desc)</option>
                  <option value="POPULARITY">Popularity (Asc)</option>
                  <option value="POPULARITY_DESC">Popularity (Desc)</option>
                </select>
              </div>
            </div>

            {/* Genre Filter Section */}
            <div className="space-y-2">
              <label
                id="genre-group-label"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Genres
              </label>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-labelledby="genre-group-label"
              >
                {ConstantData.GenreCollection.map((genre) => (
                  <Badge
                    key={genre.value}
                    variant={
                      filters.genres.includes(genre.value)
                        ? 'default'
                        : 'outline'
                    }
                    className={`
                      px-3 py-1 text-sm cursor-pointer transition-all
                      ${
                        filters.genres.includes(genre.value)
                          ? 'bg-violet-600 hover:bg-violet-700 text-white'
                          : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                    onClick={() => handleGenreChange(genre.value)}
                  >
                    {genre.label}
                    {filters.genres.includes(genre.value) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
              {filters.genres.length > 0 && (
                <div className="flex justify-end mt-2">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, genres: [] }))
                    }
                    className="text-xs text-gray-500"
                  >
                    Clear genre filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      {!loading && results.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Found {results.length} result{results.length !== 1 ? 's' : ''}
        </p>
      )}

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 place-items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
          Array.from({ length: 20 }).map((_, index) => (
            <div
              key={`shimmer-${Date.now()}-${Math.random()}`}
              className="w-full h-full"
            >
              <Shimmer />
            </div>
          ))
        ) : results.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              No results found
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
          </div>
        ) : (
          results.map((anime, index) => (
            <motion.div
              className="w-full h-full"
              key={anime.id}
              variants={itemVariants}
              custom={index}
            >
              <AnimeCard
                anime={anime}
                isLoggedIn={true}
                typeColor={
                  anime.type === 'ANIME' ? 'bg-purple-600' : 'bg-green-600'
                }
              />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {results.length > 0 && !loading && (
        <div className="flex justify-center mt-8 gap-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="px-6 py-2 rounded-lg"
          >
            Previous
          </Button>
          <div className="flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            <span className="text-sm font-medium">Page {page}</span>
          </div>
          <Button
            variant="outline"
            onClick={() => setPage((prev) => prev + 1)}
            className="px-6 py-2 rounded-lg"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// Main component with Suspense
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          Loading search page...
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
