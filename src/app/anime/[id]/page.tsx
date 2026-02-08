'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Star,
  Clock,
  Calendar,
  Play,
  Heart,
  ChevronDown,
  ChevronUp,
  Trophy,
  Users,
  TrendingUp,
  Tv,
  Film,
  BookOpen,
  Globe,
  Hash,
  Timer,
  ArrowLeft,
  Loader2,
  Flame,
  Plus,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAnimeDetailPage } from '@/lib/api/animeApi';
import type { AnimeDetailQuery } from '@/lib/graphql/generated/graphql';
import { useWatchlistStore, addWatchlistChangeListener } from '@/store/watchlistStore';
import { toast } from 'sonner';

type AnimeData = NonNullable<AnimeDetailQuery['Media']>;

const FORMAT_MAP: Record<string, string> = {
  TV: 'TV Series',
  TV_SHORT: 'TV Short',
  MOVIE: 'Movie',
  SPECIAL: 'Special',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Music',
  MANGA: 'Manga',
  NOVEL: 'Novel',
  ONE_SHOT: 'One Shot',
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  FINISHED: { label: 'Finished', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  RELEASING: { label: 'Airing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  NOT_YET_RELEASED: { label: 'Not Yet Aired', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  HIATUS: { label: 'Hiatus', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
};

const SOURCE_MAP: Record<string, string> = {
  ORIGINAL: 'Original',
  MANGA: 'Manga',
  LIGHT_NOVEL: 'Light Novel',
  VISUAL_NOVEL: 'Visual Novel',
  VIDEO_GAME: 'Video Game',
  OTHER: 'Other',
  NOVEL: 'Novel',
  DOUJINSHI: 'Doujinshi',
  ANIME: 'Anime',
  WEB_NOVEL: 'Web Novel',
  LIVE_ACTION: 'Live Action',
  GAME: 'Game',
  COMIC: 'Comic',
  MULTIMEDIA_PROJECT: 'Multimedia Project',
  PICTURE_BOOK: 'Picture Book',
};

const RELATION_TYPE_MAP: Record<string, string> = {
  ADAPTATION: 'Adaptation',
  PREQUEL: 'Prequel',
  SEQUEL: 'Sequel',
  PARENT: 'Parent',
  SIDE_STORY: 'Side Story',
  CHARACTER: 'Character',
  SUMMARY: 'Summary',
  ALTERNATIVE: 'Alternative',
  SPIN_OFF: 'Spin Off',
  OTHER: 'Other',
  SOURCE: 'Source',
  COMPILATION: 'Compilation',
  CONTAINS: 'Contains',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(date: { year?: number | null; month?: number | null; day?: number | null } | null | undefined) {
  if (!date) return null;
  const parts: string[] = [];
  if (date.month) parts.push(MONTHS[date.month - 1]);
  if (date.day) parts.push(String(date.day) + ',');
  if (date.year) parts.push(String(date.year));
  return parts.join(' ') || null;
}

export default function AnimeDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [anime, setAnime] = useState<AnimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [descriptionHeight, setDescriptionHeight] = useState(0);

  useEffect(() => {
    if (descriptionRef.current) {
      setDescriptionHeight(descriptionRef.current.scrollHeight);
    }
  }, [anime?.description]);

  const watchlistStore = useWatchlistStore();

  useEffect(() => {
    if (anime && watchlistStore?.isInWatchlist) {
      setIsInWatchlist(watchlistStore.isInWatchlist(String(anime.id)));
    }
  }, [anime, watchlistStore]);

  useEffect(() => {
    if (!anime) return;
    const animeId = String(anime.id);
    const removeListener = addWatchlistChangeListener((changedId, added) => {
      if (changedId === animeId) {
        setIsInWatchlist(added);
      }
    });
    return removeListener;
  }, [anime]);

  const handleWatchlistToggle = (add: boolean) => {
    if (!anime) return;
    const mediaId = String(anime.id);
    try {
      if (add) {
        if (typeof watchlistStore?.addToWatchlist !== 'function') {
          toast.error('Watchlist functionality is unavailable');
          return;
        }
        watchlistStore.addToWatchlist(mediaId, 'ANIME');
        setIsInWatchlist(true);
        toast.success('Added to watchlist');
      } else {
        if (typeof watchlistStore?.removeFromWatchlist !== 'function') {
          toast.error('Watchlist functionality is unavailable');
          return;
        }
        watchlistStore.removeFromWatchlist(mediaId);
        setIsInWatchlist(false);
        toast.success('Removed from watchlist');
      }
    } catch {
      toast.error(add ? 'Failed to add to watchlist' : 'Failed to remove from watchlist');
    }
  };

  useEffect(() => {
    if (!id || isNaN(id)) {
      setError('Invalid anime ID');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAnimeDetailPage(id);
        if (!data) {
          setError('Anime not found');
          return;
        }
        setAnime(data);
      } catch (err) {
        setError('Failed to load anime details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <LoadingSkeleton />;
  if (error || !anime) return <ErrorState message={error || 'Something went wrong'} />;

  const statusInfo = STATUS_MAP[anime.status || ''] || { label: anime.status, color: 'bg-gray-500/20 text-gray-400' };
  const accentColor = anime.coverImage?.color || '#6366f1';
  const title = anime.title?.english || anime.title?.romaji || anime.title?.userPreferred || '';
  const nativeTitle = anime.title?.native;
  const mainStudios = anime.studios?.edges?.filter(e => e?.isMain).map(e => e?.node?.name).filter(Boolean) || [];
  const producers = anime.studios?.edges?.filter(e => !e?.isMain).map(e => e?.node?.name).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      {/* Banner */}
      <div className="relative w-full h-[300px] md:h-[400px]">
        {anime.bannerImage ? (
          <img
            src={anime.bannerImage}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `linear-gradient(135deg, ${accentColor}33, #0F0F1A)` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] via-[#0F0F1A]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F1A]/80 to-transparent" />

        <div className="absolute top-4 left-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10 -mt-40 md:-mt-52">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover Image - Sidebar */}
          <div className="flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <img
                src={anime.coverImage?.extraLarge || anime.coverImage?.large || ''}
                alt={title}
                className="w-[180px] md:w-[220px] h-auto rounded-xl shadow-2xl border-2 border-white/10 mx-auto md:mx-0"
                style={{ boxShadow: `0 20px 60px ${accentColor}40` }}
              />

              {/* Hotness Score */}
              {anime.averageScore && (
                <div className="absolute -bottom-4 -right-3 flex items-center gap-1.5 bg-[#1a1a2e] border border-white/10 rounded-full px-3 py-1.5 shadow-lg">
                  <Flame
                    className="h-4 w-4"
                    style={{ color: getScoreColor(anime.averageScore) }}
                    fill={anime.averageScore >= 70 ? getScoreColor(anime.averageScore) : 'none'}
                  />
                  <span className="text-sm font-bold" style={{ color: getScoreColor(anime.averageScore) }}>
                    {(anime.averageScore / 10).toFixed(1)}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Action Buttons (below cover on desktop) */}
            <div className="hidden md:flex flex-col gap-2 mt-6 w-[220px]">
              {anime.trailer && (
                <Button
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-none"
                  onClick={() => {
                    const url = anime.trailer?.site === 'youtube'
                      ? `https://www.youtube.com/watch?v=${anime.trailer?.id}`
                      : `https://www.dailymotion.com/video/${anime.trailer?.id}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Play className="h-4 w-4 mr-2" /> Watch Trailer
                </Button>
              )}
              {isInWatchlist ? (
                <Button
                  className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 border-none"
                  onClick={() => handleWatchlistToggle(false)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remove
                </Button>
              ) : (
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-none"
                  onClick={() => handleWatchlistToggle(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add to Watchlist
                </Button>
              )}
            </div>
          </div>

          {/* Title & Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 min-w-0"
          >
            {/* Status & Format Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={`${statusInfo.color} border text-xs`}>
                {statusInfo.label}
              </Badge>
              {anime.format && (
                <Badge variant="outline" className="border-white/20 text-gray-300 text-xs">
                  {FORMAT_MAP[anime.format] || anime.format}
                </Badge>
              )}
              {anime.season && anime.seasonYear && (
                <Badge variant="outline" className="border-white/20 text-gray-300 text-xs">
                  {anime.season.charAt(0) + anime.season.slice(1).toLowerCase()} {anime.seasonYear}
                </Badge>
              )}
              {anime.isAdult && (
                <Badge className="bg-red-600 border-none text-white text-xs">18+</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-1">
              {title}
            </h1>
            {nativeTitle && (
              <p className="text-lg text-gray-400 mb-4">{nativeTitle}</p>
            )}

            {/* Studios */}
            {mainStudios.length > 0 && (
              <p className="text-sm text-indigo-400 font-medium mb-4">
                {mainStudios.join(' • ')}
              </p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {anime.genres?.filter(Boolean).map(genre => (
                <Link href={`/search?genres=${genre}`} key={genre}>
                  <Badge
                    variant="outline"
                    className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 cursor-pointer transition-colors"
                  >
                    {genre}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {anime.averageScore && (
                <QuickStat icon={<Flame className="h-4 w-4 text-yellow-400" />} label="Score" value={`${(anime.averageScore / 10).toFixed(1)}`} />
              )}
              {anime.episodes && (
                <QuickStat icon={<Tv className="h-4 w-4 text-blue-400" />} label="Episodes" value={String(anime.episodes)} />
              )}
              {anime.duration && (
                <QuickStat icon={<Timer className="h-4 w-4 text-green-400" />} label="Duration" value={`${anime.duration} min`} />
              )}
              {anime.popularity && (
                <QuickStat icon={<Users className="h-4 w-4 text-purple-400" />} label="Popularity" value={anime.popularity.toLocaleString()} />
              )}
              {anime.favourites && (
                <QuickStat icon={<Heart className="h-4 w-4 text-pink-400" />} label="Favourites" value={anime.favourites.toLocaleString()} />
              )}
            </div>

            {/* Next Airing Episode */}
            {anime.nextAiringEpisode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-300 font-medium">
                      Episode {anime.nextAiringEpisode.episode} airing
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {formatDistanceToNow(new Date(anime.nextAiringEpisode.airingAt * 1000), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Description */}
            {anime.description && (
              <div className="mb-6">
                <div className="relative">
                  <motion.div
                    animate={{ height: descriptionExpanded ? descriptionHeight : 120 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div
                      ref={descriptionRef}
                      className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(anime.description) }}
                    />
                  </motion.div>
                  <AnimatePresence>
                    {!descriptionExpanded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0F0F1A] to-transparent pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                  className="text-indigo-400 hover:text-indigo-300 mt-1 px-0 relative z-10"
                >
                  {descriptionExpanded ? (
                    <><ChevronUp className="h-4 w-4 mr-1" /> Show Less</>
                  ) : (
                    <><ChevronDown className="h-4 w-4 mr-1" /> Read More</>
                  )}
                </Button>
              </div>
            )}

            {/* Mobile Action Buttons */}
            <div className="flex md:hidden gap-2 mb-6">
              {anime.trailer && (
                <Button
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-none"
                  onClick={() => {
                    const url = anime.trailer?.site === 'youtube'
                      ? `https://www.youtube.com/watch?v=${anime.trailer?.id}`
                      : `https://www.dailymotion.com/video/${anime.trailer?.id}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Play className="h-4 w-4 mr-2" /> Trailer
                </Button>
              )}
              {isInWatchlist ? (
                <Button
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 border-none"
                  onClick={() => handleWatchlistToggle(false)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remove
                </Button>
              ) : (
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-none"
                  onClick={() => handleWatchlistToggle(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add to Watchlist
                </Button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Tabbed Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10"
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="h-auto bg-transparent p-0 border-b border-white/10 rounded-none w-full justify-start gap-0">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent px-5 py-3 text-sm text-gray-400 hover:text-white transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-300 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="characters"
                className="rounded-none border-b-2 border-transparent px-5 py-3 text-sm text-gray-400 hover:text-white transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-300 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Characters
              </TabsTrigger>
              <TabsTrigger
                value="staff"
                className="rounded-none border-b-2 border-transparent px-5 py-3 text-sm text-gray-400 hover:text-white transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-300 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Staff
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="rounded-none border-b-2 border-transparent px-5 py-3 text-sm text-gray-400 hover:text-white transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-300 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Stats
              </TabsTrigger>
              {anime.reviews?.edges && anime.reviews.edges.length > 0 && (
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent px-5 py-3 text-sm text-gray-400 hover:text-white transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-300 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Reviews
                </TabsTrigger>
              )}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Info Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  <InfoCard anime={anime} accentColor={accentColor} mainStudios={mainStudios} producers={producers} />

                  {/* Rankings */}
                  {anime.rankings && anime.rankings.length > 0 && (
                    <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-400" /> Rankings
                      </h3>
                      <div className="space-y-3">
                        {anime.rankings.filter(Boolean).slice(0, 6).map((ranking) => (
                          <div key={ranking!.id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">{ranking!.context}</span>
                            <span className="text-sm font-semibold text-indigo-300">#{ranking!.rank}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {anime.tags && anime.tags.length > 0 && (
                    <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Hash className="h-4 w-4 text-gray-400" /> Tags
                      </h3>
                      <div className="space-y-2">
                        {anime.tags.filter(t => t && !t.isMediaSpoiler).slice(0, 15).map((tag) => (
                          <div key={tag!.id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{tag!.name}</span>
                            <span className="text-xs text-gray-500">{tag!.rank}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* External Links */}
                  {anime.externalLinks && anime.externalLinks.length > 0 && (
                    <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" /> External Links
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {anime.externalLinks.filter(l => l && !l.isDisabled).map((link) => (
                          <a
                            key={link!.id}
                            href={link!.url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-white/10 hover:border-white/20 hover:bg-white/5"
                            style={{ color: link!.color || '#a5b4fc' }}
                          >
                            {link!.icon && (
                              <img src={link!.icon} alt="" className="w-4 h-4" />
                            )}
                            {link!.site}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Relations, Trailer, Streaming, Recommendations */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Trailer */}
                  {anime.trailer?.id && anime.trailer.site === 'youtube' && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Trailer</h3>
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
                        <iframe
                          src={`https://www.youtube.com/embed/${anime.trailer.id}`}
                          title="Trailer"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Relations */}
                  {anime.relations?.edges && anime.relations.edges.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Relations</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {anime.relations.edges.filter(Boolean).map((edge) => {
                          const node = edge!.node;
                          if (!node) return null;
                          return (
                            <Link key={edge!.id} href={node.type === 'ANIME' ? `/anime/${node.id}` : '#'}>
                              <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden hover:border-indigo-500/30 transition-colors group">
                                <img
                                  src={node.coverImage?.large || node.coverImage?.medium || ''}
                                  alt=""
                                  className="w-16 h-24 object-cover flex-shrink-0"
                                />
                                <div className="p-3 flex-1 min-w-0">
                                  <p className="text-xs text-indigo-400 font-medium mb-1">
                                    {RELATION_TYPE_MAP[edge!.relationType || ''] || edge!.relationType}
                                  </p>
                                  <p className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition-colors">
                                    {node.title?.english || node.title?.romaji || node.title?.userPreferred}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {FORMAT_MAP[node.format || ''] || node.format}
                                    {node.status ? ` • ${STATUS_MAP[node.status]?.label || node.status}` : ''}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Streaming Episodes */}
                  {anime.streamingEpisodes && anime.streamingEpisodes.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Watch</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {anime.streamingEpisodes.filter(Boolean).slice(0, 8).map((ep, idx) => (
                          <a
                            key={idx}
                            href={ep!.url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative rounded-lg overflow-hidden border border-white/10 hover:border-indigo-500/30 transition-colors"
                          >
                            <img
                              src={ep!.thumbnail!}
                              alt={ep!.title || ''}
                              className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                              <p className="text-xs text-white font-medium line-clamp-2">{ep!.title}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{ep!.site}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {anime.recommendations?.edges && anime.recommendations.edges.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {anime.recommendations.edges.filter(Boolean).map((rec) => {
                          const media = rec!.node?.mediaRecommendation;
                          if (!media) return null;
                          return (
                            <Link key={media.id} href={`/anime/${media.id}`}>
                              <div className="group cursor-pointer">
                                <div className="relative rounded-lg overflow-hidden border border-white/10 group-hover:border-indigo-500/30 transition-colors mb-2">
                                  <img
                                    src={media.coverImage?.large || media.coverImage?.medium || ''}
                                    alt=""
                                    className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  {media.averageScore && (
                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 flex items-center gap-1">
                                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                      <span className="text-xs font-medium">{(media.averageScore / 10).toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm font-medium text-gray-200 group-hover:text-indigo-300 transition-colors line-clamp-2">
                                  {media.title?.english || media.title?.romaji || media.title?.userPreferred}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Characters Tab */}
            <TabsContent value="characters" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {anime.characters?.edges?.filter(Boolean).map((char) => {
                  const node = char!.node;
                  if (!node) return null;
                  const japaneseVA = char!.voiceActorRoles?.find(
                    (va) => va?.voiceActor?.languageV2 === 'Japanese'
                  )?.voiceActor;

                  return (
                    <div
                      key={node.id}
                      className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-indigo-500/20 transition-colors"
                    >
                      {/* Character Side */}
                      <div className="flex flex-1 min-w-0">
                        <img
                          src={node.image?.large || node.image?.medium || ''}
                          alt={node.name?.full || ''}
                          className="w-16 h-20 object-cover flex-shrink-0"
                        />
                        <div className="p-2.5 flex flex-col justify-center min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {node.name?.full}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {char!.role?.toLowerCase()}
                          </p>
                        </div>
                      </div>

                      {/* VA Side */}
                      {japaneseVA && (
                        <div className="flex flex-1 min-w-0 flex-row-reverse">
                          <img
                            src={japaneseVA.image?.large || japaneseVA.image?.medium || ''}
                            alt={japaneseVA.name?.full || ''}
                            className="w-16 h-20 object-cover flex-shrink-0"
                          />
                          <div className="p-2.5 flex flex-col justify-center items-end min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {japaneseVA.name?.full}
                            </p>
                            <p className="text-xs text-gray-400">Japanese</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Staff Tab */}
            <TabsContent value="staff" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {anime.staff?.edges?.filter(Boolean).map((s) => {
                  const node = s!.node;
                  if (!node) return null;
                  return (
                    <div
                      key={s!.id}
                      className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-indigo-500/20 transition-colors"
                    >
                      <img
                        src={node.image?.large || node.image?.medium || ''}
                        alt={node.name?.full || ''}
                        className="w-16 h-20 object-cover flex-shrink-0"
                      />
                      <div className="p-3 flex flex-col justify-center min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {node.name?.full}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{s!.role}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Score Distribution */}
                {anime.stats?.scoreDistribution && (
                  <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                    <h3 className="font-semibold text-white mb-6">Score Distribution</h3>
                    <div className="flex items-end gap-1 h-40">
                      {anime.stats.scoreDistribution.filter(Boolean).map((item) => {
                        const maxAmount = Math.max(
                          ...anime.stats!.scoreDistribution!.filter(Boolean).map(i => i!.amount || 0)
                        );
                        const heightPercent = maxAmount > 0 ? ((item!.amount || 0) / maxAmount) * 100 : 0;
                        return (
                          <div key={item!.score} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-gray-500">{(item!.amount || 0).toLocaleString()}</span>
                            <div
                              className="w-full rounded-t-md transition-all"
                              style={{
                                height: `${heightPercent}%`,
                                minHeight: '4px',
                                backgroundColor: getScoreBarColor(item!.score || 0),
                              }}
                            />
                            <span className="text-xs text-gray-400">{item!.score}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Status Distribution */}
                {anime.stats?.statusDistribution && (
                  <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                    <h3 className="font-semibold text-white mb-6">Status Distribution</h3>
                    <div className="space-y-4">
                      {anime.stats.statusDistribution.filter(Boolean).map((item) => {
                        const total = anime.stats!.statusDistribution!
                          .filter(Boolean)
                          .reduce((sum, i) => sum + (i!.amount || 0), 0);
                        const percent = total > 0 ? ((item!.amount || 0) / total) * 100 : 0;
                        const statusColors: Record<string, string> = {
                          CURRENT: '#3b82f6',
                          PLANNING: '#a855f7',
                          COMPLETED: '#22c55e',
                          DROPPED: '#ef4444',
                          PAUSED: '#f59e0b',
                        };
                        return (
                          <div key={item!.status}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300 capitalize">
                                {(item!.status || '').replace('_', ' ').toLowerCase()}
                              </span>
                              <span className="text-gray-400">{(item!.amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: statusColors[item!.status || ''] || '#6366f1' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            {anime.reviews?.edges && anime.reviews.edges.length > 0 && (
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {anime.reviews.edges.filter(Boolean).map((review) => {
                    const node = review!.node;
                    if (!node) return null;
                    return (
                      <div
                        key={node.id}
                        className="bg-white/5 rounded-xl border border-white/10 p-5"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {node.user?.avatar?.large && (
                            <img
                              src={node.user.avatar.large}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">{node.user?.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{node.score}/100</span>
                              <span>•</span>
                              <span>{node.rating}/{node.ratingAmount} found helpful</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{node.summary}</p>
                        {node.siteUrl && (
                          <a
                            href={node.siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-block"
                          >
                            Read full review →
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-20" />
    </div>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
      {icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function InfoCard({
  anime,
  accentColor,
  mainStudios,
  producers,
}: {
  anime: AnimeData;
  accentColor: string;
  mainStudios: (string | undefined)[];
  producers: (string | undefined)[];
}) {
  const infoItems: { label: string; value: React.ReactNode }[] = [];

  if (anime.format) infoItems.push({ label: 'Format', value: FORMAT_MAP[anime.format] || anime.format });
  if (anime.episodes) infoItems.push({ label: 'Episodes', value: anime.episodes });
  if (anime.duration) infoItems.push({ label: 'Episode Duration', value: `${anime.duration} mins` });
  if (anime.status) infoItems.push({ label: 'Status', value: STATUS_MAP[anime.status]?.label || anime.status });

  const startDate = formatDate(anime.startDate);
  const endDate = formatDate(anime.endDate);
  if (startDate) infoItems.push({ label: 'Start Date', value: startDate });
  if (endDate) infoItems.push({ label: 'End Date', value: endDate });

  if (anime.season && anime.seasonYear) {
    infoItems.push({
      label: 'Season',
      value: `${anime.season.charAt(0) + anime.season.slice(1).toLowerCase()} ${anime.seasonYear}`,
    });
  }

  if (anime.averageScore) infoItems.push({ label: 'Average Score', value: `${anime.averageScore}%` });
  if (anime.meanScore) infoItems.push({ label: 'Mean Score', value: `${anime.meanScore}%` });
  if (anime.popularity) infoItems.push({ label: 'Popularity', value: anime.popularity.toLocaleString() });
  if (anime.favourites) infoItems.push({ label: 'Favourites', value: anime.favourites.toLocaleString() });

  if (mainStudios.length > 0) infoItems.push({ label: 'Studios', value: mainStudios.join(', ') });
  if (producers.length > 0) infoItems.push({ label: 'Producers', value: producers.join(', ') });

  if (anime.source) infoItems.push({ label: 'Source', value: SOURCE_MAP[anime.source] || anime.source });
  if (anime.hashtag) infoItems.push({ label: 'Hashtag', value: anime.hashtag });

  const romajiTitle = anime.title?.romaji;
  const englishTitle = anime.title?.english;
  if (romajiTitle && englishTitle && romajiTitle !== englishTitle) {
    infoItems.push({ label: 'Romaji', value: romajiTitle });
  }
  if (anime.synonyms && anime.synonyms.length > 0) {
    infoItems.push({ label: 'Synonyms', value: anime.synonyms.filter(Boolean).join(', ') });
  }

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-5">
      <h3 className="font-semibold text-white mb-4">Information</h3>
      <div className="space-y-3">
        {infoItems.map((item) => (
          <div key={item.label}>
            <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
            <p className="text-sm text-gray-200">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      {/* Banner Skeleton */}
      <div className="w-full h-[300px] md:h-[400px] bg-white/5 animate-pulse" />

      <div className="container mx-auto px-4 -mt-40 md:-mt-52">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <div className="w-[180px] md:w-[220px] aspect-[3/4] bg-white/10 rounded-xl animate-pulse mx-auto md:mx-0 flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 space-y-4 pt-12">
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-white/10 rounded-md animate-pulse" />
              <div className="h-6 w-16 bg-white/10 rounded-md animate-pulse" />
            </div>
            <div className="h-10 w-3/4 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-6 w-1/2 bg-white/10 rounded-md animate-pulse" />
            <div className="flex gap-2 mt-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 w-20 bg-white/10 rounded-md animate-pulse" />
              ))}
            </div>
            <div className="flex gap-4 mt-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 w-28 bg-white/10 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="space-y-2 mt-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${100 - i * 15}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="mt-10">
          <div className="h-10 w-96 bg-white/5 rounded-lg animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Oops</h2>
        <p className="text-gray-400 mb-6">{message}</p>
        <Button
          variant="outline"
          className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 60) return '#3b82f6';
  if (score >= 45) return '#f59e0b';
  return '#ef4444';
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#f59e0b';
  if (score >= 20) return '#f97316';
  return '#ef4444';
}
