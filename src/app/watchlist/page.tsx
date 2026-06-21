'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Share2, Check, List, Play, Clock, CheckCircle, XCircle } from 'lucide-react';
import AllAnimes from './AllAnimes';
import { useWatchlistStore } from '@/store/watchlistStore';
import { toast } from 'sonner';

type TabType = 'All' | 'Watching' | 'Plan to Watch' | 'Completed' | 'Dropped';

const TABS: { name: TabType; key: string; icon: React.ReactNode }[] = [
  { name: 'All', key: 'all', icon: <List className="h-3.5 w-3.5" /> },
  { name: 'Watching', key: 'watching', icon: <Play className="h-3.5 w-3.5" /> },
  { name: 'Plan to Watch', key: 'plan_to_watch', icon: <Clock className="h-3.5 w-3.5" /> },
  { name: 'Completed', key: 'completed', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  { name: 'Dropped', key: 'dropped', icon: <XCircle className="h-3.5 w-3.5" /> },
];

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [copied, setCopied] = useState(false);

  const watchlistStore = useWatchlistStore();
  const items = watchlistStore?.items || [];

  const counts = useMemo(() => {
    return {
      all: items.length,
      watching: items.filter((item) => item.status === 'watching').length,
      plan_to_watch: items.filter((item) => item.status === 'plan_to_watch').length,
      completed: items.filter((item) => item.status === 'completed').length,
      dropped: items.filter((item) => item.status === 'dropped').length,
    };
  }, [items]);

  const filteredIds = useMemo(() => {
    const tab = TABS.find((t) => t.name === activeTab);
    if (!tab || tab.key === 'all') return items.map((item) => item.id);
    return items
      .filter((item) => item.status === tab.key)
      .map((item) => item.id);
  }, [items, activeTab]);

  const handleShare = async () => {
    if (!Array.isArray(items) || items.length === 0) {
      toast.info('Your watchlist is empty');
      return;
    }
    const ids = items.map((item) => item.id).join(',');
    const url = `${window.location.origin}/share?ids=${ids}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Share link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* Subtle ambient gradient */}
      <div className="fixed inset-x-0 top-0 h-72 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-2">
              Your watchlist
            </h1>
            <p className="text-sm sm:text-base text-white/40">
              {items.length === 0
                ? 'Start building your collection'
                : `${items.length} title${items.length === 1 ? '' : 's'} tracked`}
            </p>
          </div>

          <motion.button
            onClick={handleShare}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:text-white"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {copied ? 'Copied' : 'Share'}
          </motion.button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex overflow-x-auto pb-2 mb-8 gap-1 no-scrollbar"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.name;
            const count = counts[tab.key as keyof typeof counts] || 0;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
                <span
                  className={`ml-0.5 text-[10px] tabular-nums ${
                    isActive ? 'text-black/50' : 'text-white/30'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Content */}
        <AllAnimes filterIds={filteredIds} activeTab={activeTab} />
      </div>
    </div>
  );
}
