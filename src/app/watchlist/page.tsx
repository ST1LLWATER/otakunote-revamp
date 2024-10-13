'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, CheckCircle, Play, Clock, XCircle, Filter } from 'lucide-react';
import AllAnimes from './AllAnimes';

type TabType = 'All' | 'Completed' | 'Watching' | 'Plan to Watch' | 'Dropped';

const AllContent = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {['Completed', 'Watching', 'Plan to Watch', 'Dropped'].map((status) => (
      <div key={status} className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">{status}</h3>
        <p className="text-gray-600">Sample content for {status} items</p>
      </div>
    ))}
  </div>
);

const CompletedContent = () => (
  <div className="space-y-4">
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Completed Show 1</h3>
      <p className="text-gray-600">You finished this show on DD/MM/YYYY</p>
    </div>
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Completed Show 2</h3>
      <p className="text-gray-600">You finished this show on DD/MM/YYYY</p>
    </div>
  </div>
);

const WatchingContent = () => (
  <div className="space-y-4">
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Currently Watching 1</h3>
      <p className="text-gray-600">You're on episode 5 of 12</p>
    </div>
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Currently Watching 2</h3>
      <p className="text-gray-600">You're on episode 3 of 24</p>
    </div>
  </div>
);

const PlanToWatchContent = () => (
  <div className="space-y-4">
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Plan to Watch 1</h3>
      <p className="text-gray-600">Added to your watchlist on DD/MM/YYYY</p>
    </div>
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Plan to Watch 2</h3>
      <p className="text-gray-600">Added to your watchlist on DD/MM/YYYY</p>
    </div>
  </div>
);

const DroppedContent = () => (
  <div className="space-y-4">
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Dropped Show 1</h3>
      <p className="text-gray-600">You dropped this show after 3 episodes</p>
    </div>
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Dropped Show 2</h3>
      <p className="text-gray-600">You dropped this show after 1 episode</p>
    </div>
  </div>
);

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  const tabs: { name: TabType; icon: React.ReactNode }[] = [
    { name: 'All', icon: <List size={20} /> },
    { name: 'Completed', icon: <CheckCircle size={20} /> },
    { name: 'Watching', icon: <Play size={20} /> },
    { name: 'Plan to Watch', icon: <Clock size={20} /> },
    { name: 'Dropped', icon: <XCircle size={20} /> },
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
          <span className="ml-2">{tab.name}</span>
        </motion.button>
      ))}
    </nav>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'All':
        return <AllAnimes />;
      case 'Completed':
        return <AllAnimes />;
      case 'Watching':
        return <WatchingContent />;
      case 'Plan to Watch':
        return <PlanToWatchContent />;
      case 'Dropped':
        return <DroppedContent />;
      default:
        return <div>No content available</div>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100">
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
            <div className="bg-gray-800 p-4">
              <h2 className="text-xl font-bold text-white">Watchlist</h2>
            </div>
            <div className="flex-grow overflow-y-auto p-4">
              <FilterTabs />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Header with Filter button */}
        <div className="bg-white shadow-md p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab == 'All' ? 'All Animes' : activeTab}
          </h2>
          <motion.button
            className="md:hidden bg-gray-800 text-white px-4 py-2 rounded-md flex items-center"
            onClick={toggleSidebar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter size={20} className="mr-2" />
            Filter
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-4">{renderContent()}</div>
      </div>
    </div>
  );
}
