'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, CheckCircle, Play, Clock, XCircle, Filter } from 'lucide-react';
import AllAnimes from './AllAnimes';
import { useWatchlistStore } from '@/store/watchlistStore';

type TabType = 'All' | 'Completed' | 'Watching' | 'Plan to Watch' | 'Dropped';

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Access the watchlist store to get watchlist items
  const watchlistStore = useWatchlistStore();
  const items = watchlistStore?.items || [];
  const updateWatchlistStatus = watchlistStore?.updateWatchlistStatus;

  // Calculate the counts for each status
  const counts = {
    all: Array.isArray(items) ? items.length : 0,
    completed: Array.isArray(items)
      ? items.filter((item) => item.status === 'completed').length
      : 0,
    watching: Array.isArray(items)
      ? items.filter((item) => item.status === 'watching').length
      : 0,
    plan_to_watch: Array.isArray(items)
      ? items.filter((item) => item.status === 'plan_to_watch').length
      : 0,
    dropped: Array.isArray(items)
      ? items.filter((item) => item.status === 'dropped').length
      : 0,
  };

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isDesktop &&
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDesktop, isSidebarOpen]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const tabs: { name: TabType; icon: React.ReactNode; count: number }[] = [
    { name: 'All', icon: <List size={20} />, count: counts.all },
    {
      name: 'Completed',
      icon: <CheckCircle size={20} />,
      count: counts.completed,
    },
    { name: 'Watching', icon: <Play size={20} />, count: counts.watching },
    {
      name: 'Plan to Watch',
      icon: <Clock size={20} />,
      count: counts.plan_to_watch,
    },
    { name: 'Dropped', icon: <XCircle size={20} />, count: counts.dropped },
  ];

  const FilterTabs = () => (
    <nav className="space-y-2">
      {tabs.map((tab) => (
        <motion.button
          key={tab.name}
          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium flex items-center ${
            activeTab === tab.name
              ? 'bg-gray-700 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => {
            setActiveTab(tab.name);
            if (!isDesktop) {
              setIsSidebarOpen(false);
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {tab.icon}
          <span className="ml-2 flex-grow">{tab.name}</span>
          <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full text-xs">
            {tab.count}
          </span>
        </motion.button>
      ))}
    </nav>
  );

  // Filter anime IDs based on the active tab
  const getFilteredAnimeIds = () => {
    if (!Array.isArray(items) || items.length === 0) return [];

    switch (activeTab) {
      case 'All':
        return items.map((item) => item.id); // Return all IDs
      case 'Completed':
        console.log('COMPLETED ITEMS', items);
        return items
          .filter((item) => item.status === 'completed')
          .map((item) => item.id);
      case 'Watching':
        return items
          .filter((item) => item.status === 'watching')
          .map((item) => item.id);
      case 'Plan to Watch':
        return items
          .filter((item) => item.status === 'plan_to_watch')
          .map((item) => item.id);
      case 'Dropped':
        return items
          .filter((item) => item.status === 'dropped')
          .map((item) => item.id);
      default:
        return items.map((item) => item.id); // Default to all
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background text-foreground">
      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || isDesktop) && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`${
              isDesktop ? 'w-64' : 'fixed top-0 left-0 h-full w-64 z-40'
            } bg-gray-900 shadow-lg flex flex-col`}
          >
            {/* <div className="bg-gray-800 p-4">
              <h2 className="text-xl font-bold text-white">Watchlist</h2>
            </div> */}
            <div className="flex-grow overflow-y-auto p-4">
              <FilterTabs />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
        {/* Header with Filter button */}
        <div className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-100">
            {activeTab === 'All' ? 'All Animes' : activeTab}
          </h2>
          <motion.button
            className="md:hidden bg-gray-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={toggleSidebar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter size={20} className="mr-2" />
            Filter
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 bg-gray-900">
          <AllAnimes filterIds={getFilteredAnimeIds()} />
        </div>
      </div>
    </div>
  );
}
