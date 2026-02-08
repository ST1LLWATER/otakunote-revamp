'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  List,
  CheckCircle,
  Play,
  Clock,
  XCircle,
  Layers,
} from 'lucide-react';
import AllAnimes from './AllAnimes';
import { useWatchlistStore } from '@/store/watchlistStore';
import {
  getAnimeRecommendations,
  type RecommendationItem,
} from '@/lib/api/animeApi';

type TabType = 'All' | 'Watching' | 'Plan to Watch' | 'Completed' | 'Dropped';

const TAB_CONFIG: {
  name: TabType;
  icon: React.ReactNode;
  key: string;
  gradient: string;
  bgColor: string;
}[] = [
  {
    name: 'All',
    icon: <List className="h-4 w-4" />,
    key: 'all',
    gradient: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
  },
  {
    name: 'Watching',
    icon: <Play className="h-4 w-4" />,
    key: 'watching',
    gradient: 'from-sky-500 to-blue-500',
    bgColor: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
  },
  {
    name: 'Plan to Watch',
    icon: <Clock className="h-4 w-4" />,
    key: 'plan_to_watch',
    gradient: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/15 border-violet-500/30 text-violet-300',
  },
  {
    name: 'Completed',
    icon: <CheckCircle className="h-4 w-4" />,
    key: 'completed',
    gradient: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  },
  {
    name: 'Dropped',
    icon: <XCircle className="h-4 w-4" />,
    key: 'dropped',
    gradient: 'from-rose-500 to-red-500',
    bgColor: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
  },
];

const STAT_CARDS = [
  { key: 'watching', label: 'Watching', icon: Play, color: 'from-sky-500 to-blue-600' },
  { key: 'plan_to_watch', label: 'Planned', icon: Clock, color: 'from-violet-500 to-purple-600' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'from-emerald-500 to-teal-600' },
  { key: 'dropped', label: 'Dropped', icon: XCircle, color: 'from-rose-500 to-red-600' },
];

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    []
  );
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const watchlistStore = useWatchlistStore();
  const items = watchlistStore?.items || [];

  const counts: Record<string, number> = {
    all: Array.isArray(items) ? items.length : 0,
    watching: Array.isArray(items)
      ? items.filter((item) => item.status === 'watching').length
      : 0,
    plan_to_watch: Array.isArray(items)
      ? items.filter((item) => item.status === 'plan_to_watch').length
      : 0,
    completed: Array.isArray(items)
      ? items.filter((item) => item.status === 'completed').length
      : 0,
    dropped: Array.isArray(items)
      ? items.filter((item) => item.status === 'dropped').length
      : 0,
  };

  // Get all valid anime IDs from watchlist for recommendations
  const watchlistIds = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items
      .map((item) => item.id)
      .filter((id) => id);
  }, [items]);

  // Fetch recommendations from 2 random animes
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (watchlistIds.length === 0) {
        setRecommendations([]);
        return;
      }

      setLoadingRecommendations(true);

      try {
        // Shuffle and take exactly 2 random anime (or just 1 if only 1 exists)
        const shuffled = [...watchlistIds].sort(() => Math.random() - 0.5);
        const selectedIds = shuffled.slice(0, Math.min(2, shuffled.length));

        // Fetch recommendations for each selected anime
        const allRecommendations = await Promise.all(
          selectedIds.map((id) => getAnimeRecommendations(Number(id)))
        );

        // Flatten and deduplicate by anime ID
        const seen = new Set<string>();
        const currentWatchlistSet = new Set(items.map((item) => item.id));

        const uniqueRecommendations = allRecommendations
          .flat()
          .filter((rec) => {
            // Skip if we've already seen this anime or it's in the watchlist
            if (
              seen.has(rec.anime.id) ||
              currentWatchlistSet.has(rec.anime.id)
            ) {
              return false;
            }
            seen.add(rec.anime.id);
            return true;
          });

        // Shuffle the final list and take top 12
        const finalRecommendations = uniqueRecommendations
          .sort(() => Math.random() - 0.5)
          .slice(0, 12);

        setRecommendations(finalRecommendations);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [watchlistIds, items]);

  const getFilteredAnimeIds = () => {
    if (!Array.isArray(items) || items.length === 0) return [];
    const tab = TAB_CONFIG.find((t) => t.name === activeTab);
    if (!tab || tab.key === 'all') return items.map((item) => item.id);
    return items
      .filter((item) => item.status === tab.key)
      .map((item) => item.id);
  };

  const activeTabConfig =
    TAB_CONFIG.find((t) => t.name === activeTab) || TAB_CONFIG[0];

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-[#0F0F1A] to-purple-950/30" />

        {/* Decorative orbs */}
        <motion.div
          className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
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

        <div className="relative container mx-auto px-4 pt-12 pb-8">
          {/* Main header content */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8"
          >
            <div className="flex items-start gap-4">
              {/* Animated icon container */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Layers className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 -z-10" />
              </motion.div>

              <div>
                <motion.h1
                  className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Watchlist
                </motion.h1>
                <motion.p
                  className="text-gray-400 mt-1 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {counts.all === 0
                    ? 'Start tracking your anime journey'
                    : `Tracking ${counts.all} ${counts.all === 1 ? 'title' : 'titles'}`
                  }
                </motion.p>
              </div>
            </div>

            {/* Stat cards */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {STAT_CARDS.map((stat, index) => {
                const Icon = stat.icon;
                const count = counts[stat.key] || 0;
                return (
                  <motion.button
                    key={stat.key}
                    onClick={() => setActiveTab(TAB_CONFIG.find(t => t.key === stat.key)?.name || 'All')}
                    className="group relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 hover:bg-white/[0.06] transition-all duration-300"
                    whileHover={{ y: -2 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-xl font-bold text-white tabular-nums">{count}</p>
                        <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            {TAB_CONFIG.map((tab) => {
              const isActive = activeTab === tab.name;
              const count = counts[tab.key] || 0;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? `${tab.bgColor} border`
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r opacity-10"
                      style={{
                        backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {tab.icon}
                    {tab.name}
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-xs tabular-nums ${
                        isActive
                          ? 'bg-white/10'
                          : 'bg-white/5 text-gray-500'
                      }`}
                    >
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Bottom border with gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <AllAnimes
              filterIds={getFilteredAnimeIds()}
              activeTab={activeTab}
              recommendations={activeTab === 'All' ? recommendations : []}
              loadingRecommendations={
                activeTab === 'All' ? loadingRecommendations : false
              }
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
