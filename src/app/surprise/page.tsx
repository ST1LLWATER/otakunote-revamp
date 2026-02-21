'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Shuffle,
  Star,
  Wand2,
  ArrowRight,
  BookOpen,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useWatchlistStore } from '@/store/watchlistStore';
import {
  getAnimeRecommendations,
  searchAnime,
  type RecommendationItem,
} from '@/lib/api/animeApi';

type PageState = 'idle' | 'loading' | 'revealed';

interface SeedAnime {
  id: number;
  title: { romaji: string; english: string | null };
  coverImage: { extraLarge: string; large: string };
  genres: string[];
}

// Floating sparkle particle component
function FloatingParticle({
  delay,
  x,
  y,
  size,
}: {
  delay: number;
  x: number;
  y: number;
  size: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        y: [0, -30, -60],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    >
      <Sparkles
        className="text-amber-400/60"
        style={{ width: size, height: size }}
      />
    </motion.div>
  );
}

export default function SurprisePage() {
  const [state, setState] = useState<PageState>('idle');
  const [seedAnime, setSeedAnime] = useState<SeedAnime | null>(null);
  const [recommendations, setRecommendations] = useState<
    RecommendationItem[]
  >([]);

  const watchlistStore = useWatchlistStore();
  const items = watchlistStore?.items || [];

  const watchlistIds = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.map((item) => item.id).filter(Boolean);
  }, [items]);

  const hasItems = watchlistIds.length > 0;

  const handleSurprise = useCallback(async () => {
    if (watchlistIds.length === 0) return;

    setState('loading');
    setSeedAnime(null);
    setRecommendations([]);

    try {
      // Pick a random anime from the watchlist
      const randomId =
        watchlistIds[Math.floor(Math.random() * watchlistIds.length)];

      // Fetch the seed anime's full data
      const seedResults = await searchAnime({ id_in: [Number(randomId)] });
      const seedData = seedResults?.[0];

      if (!seedData) {
        setState('idle');
        return;
      }

      const seed: SeedAnime = {
        id: seedData.id,
        title: {
          romaji: seedData.title?.romaji || '',
          english: seedData.title?.english || null,
        },
        coverImage: {
          extraLarge: seedData.coverImage?.extraLarge || '',
          large: seedData.coverImage?.large || '',
        },
        genres: (seedData.genres?.filter(Boolean) as string[]) || [],
      };
      setSeedAnime(seed);

      // Fetch recommendations
      const recs = await getAnimeRecommendations(Number(randomId));

      // Filter out adult content, watchlist items, and deduplicate
      const watchlistSet = new Set(watchlistIds);
      const seen = new Set<string>();
      const filtered = recs.filter((rec) => {
        if (rec.anime.isAdult) return false;
        if (watchlistSet.has(rec.anime.id)) return false;
        if (seen.has(rec.anime.id)) return false;
        seen.add(rec.anime.id);
        return true;
      });

      // Take top 8
      setRecommendations(filtered.slice(0, 8));
      setState('revealed');
    } catch (error) {
      console.error('Error fetching surprise recommendations:', error);
      setState('idle');
    }
  }, [watchlistIds]);

  return (
    <div className={`bg-[#0F0F1A] text-white relative ${state === 'idle' ? 'h-[calc(100vh-4rem)] overflow-hidden' : 'min-h-screen overflow-hidden'}`}>
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {/* ==================== IDLE STATE ==================== */}
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] gap-8"
            >
              {hasItems ? (
                <>
                  {/* Header */}
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <motion.div
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/25"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Wand2 className="h-7 w-7 text-white" />
                      </motion.div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                      Surprise Me!
                    </h1>
                    <p className="text-gray-400 mt-3 text-lg max-w-md mx-auto">
                      Discover something new based on your watchlist. We'll pick
                      a random anime and find similar titles you might love.
                    </p>
                  </motion.div>

                  {/* Big surprise button with sparkles */}
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {/* Floating particles around button */}
                    <FloatingParticle delay={0} x={-15} y={20} size={16} />
                    <FloatingParticle delay={0.5} x={105} y={30} size={14} />
                    <FloatingParticle delay={1} x={10} y={-10} size={12} />
                    <FloatingParticle delay={1.5} x={90} y={-5} size={18} />
                    <FloatingParticle delay={2} x={50} y={-20} size={14} />
                    <FloatingParticle delay={0.8} x={-10} y={60} size={10} />
                    <FloatingParticle delay={1.2} x={110} y={65} size={12} />

                    {/* Glow behind button */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl blur-xl"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />

                    <motion.button
                      onClick={handleSurprise}
                      className="relative flex items-center gap-3 px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl shadow-2xl shadow-purple-500/30 cursor-pointer"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <Sparkles className="h-6 w-6" />
                      Surprise Me!
                      <Shuffle className="h-6 w-6" />
                    </motion.button>
                  </motion.div>

                  {/* Subtle hint */}
                  <motion.p
                    className="text-gray-500 text-sm flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <BookOpen className="h-4 w-4" />
                    Based on {watchlistIds.length}{' '}
                    {watchlistIds.length === 1 ? 'title' : 'titles'} in your
                    watchlist
                  </motion.p>
                </>
              ) : (
                /* ==================== EMPTY STATE ==================== */
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="h-10 w-10 text-gray-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    No anime in your watchlist yet
                  </h2>
                  <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                    Add some anime to your watchlist first, then come back for
                    personalized surprises!
                  </p>
                  <Link href="/search">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white gap-2">
                      <Search className="h-4 w-4" />
                      Browse Anime
                    </Button>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ==================== LOADING STATE ==================== */}
          {state === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center min-h-[70vh] gap-6"
            >
              {/* Animated spinner */}
              <motion.div
                className="relative w-24 h-24"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 border-r-purple-500" />
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-indigo-500 border-l-purple-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wand2 className="h-8 w-8 text-purple-400" />
                </div>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-xl font-semibold text-white mb-1">
                  Finding your surprise...
                </p>
                <p className="text-gray-400">
                  Picking recommendations just for you
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* ==================== REVEALED STATE ==================== */}
          {state === 'revealed' && seedAnime && (
            <motion.div
              key="revealed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              {/* Header */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-center gap-2 text-amber-400 mb-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    Your Surprise Picks
                  </span>
                  <Sparkles className="h-5 w-5" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Because you liked...
                </h1>
              </motion.div>

              {/* Seed anime spotlight card */}
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative group">
                  {/* Glowing border */}
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl opacity-60 group-hover:opacity-80 transition-opacity blur-sm" />
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl opacity-40" />

                  <div className="relative bg-[#161627] rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center">
                    {/* Cover image */}
                    <div className="relative w-32 h-44 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                      <Image
                        src={
                          seedAnime.coverImage.extraLarge ||
                          seedAnime.coverImage.large
                        }
                        alt={
                          seedAnime.title.english ||
                          seedAnime.title.romaji
                        }
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <Link href={`/anime/${seedAnime.id}`}>
                        <h2 className="text-2xl font-bold text-white hover:text-purple-300 transition-colors">
                          {seedAnime.title.english || seedAnime.title.romaji}
                        </h2>
                      </Link>
                      {seedAnime.title.english && seedAnime.title.romaji && seedAnime.title.english !== seedAnime.title.romaji && (
                        <p className="text-gray-400 text-sm mt-1">
                          {seedAnime.title.romaji}
                        </p>
                      )}
                      {seedAnime.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                          {seedAnime.genres.slice(0, 5).map((genre) => (
                            <span
                              key={genre}
                              className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recommendations */}
              {recommendations.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Recommended for You
                      </h3>
                      <p className="text-sm text-gray-400">
                        {recommendations.length} anime you might enjoy
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {recommendations.map((rec, index) => (
                      <motion.div
                        key={rec.id}
                        className="h-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.5 + index * 0.07,
                        }}
                      >
                        <Link href={`/anime/${rec.anime.id}`} className="block h-full">
                          <div className="group relative h-full flex flex-col bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
                            {/* Cover */}
                            <div className="relative flex-1 min-h-0 aspect-[2/3] overflow-hidden">
                              <Image
                                src={
                                  rec.anime.coverImage.extraLarge ||
                                  rec.anime.coverImage.large
                                }
                                alt={
                                  rec.anime.title.english ||
                                  rec.anime.title.romaji
                                }
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                              />
                              {/* Gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                              {/* Score badge */}
                              {rec.anime.averageScore > 0 && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm border border-amber-500/30">
                                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                  <span className="text-xs font-semibold text-amber-300">
                                    {(rec.anime.averageScore / 10).toFixed(1)}
                                  </span>
                                </div>
                              )}

                              {/* Rating badge */}
                              {rec.rating > 0 && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm border border-purple-500/30">
                                  <span className="text-xs font-semibold text-purple-300">
                                    +{rec.rating}
                                  </span>
                                </div>
                              )}

                              {/* Bottom info overlay */}
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <div className="flex items-center gap-2 text-xs text-gray-300">
                                  {rec.anime.format && (
                                    <span className="px-1.5 py-0.5 rounded bg-white/10">
                                      {rec.anime.format}
                                    </span>
                                  )}
                                  {rec.anime.startDate?.year > 0 && (
                                    <span>{rec.anime.startDate.year}</span>
                                  )}
                                  {rec.anime.episodes > 0 && (
                                    <span>{rec.anime.episodes} ep</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Title */}
                            <div className="p-3">
                              <h4 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                                {rec.anime.title.english ||
                                  rec.anime.title.romaji}
                              </h4>
                            </div>

                            {/* Hover arrow */}
                            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight className="h-4 w-4 text-purple-400" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-gray-400">
                    No recommendations found for this anime. Try again!
                  </p>
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Surprise Me Again button */}
      {state === 'revealed' && (
        <motion.div
          className="sticky bottom-0 z-20 flex justify-center py-4 bg-gradient-to-t from-[#0F0F1A] via-[#0F0F1A]/95 to-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={handleSurprise}
            className="flex items-center gap-3 px-8 py-3 text-base font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg shadow-purple-500/30 cursor-pointer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Shuffle className="h-5 w-5" />
            Surprise Me Again!
            <Sparkles className="h-5 w-5" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
