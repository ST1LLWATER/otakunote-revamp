'use client';

import React from 'react';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Search,
  List,
  Star,
  Calendar,
  LayoutGrid,
  Bell,
  Bookmark,
  TrendingUp,
  BarChart,
  Users,
  Layers,
  ChevronRight,
  Eye,
  Home,
  Compass,
} from 'lucide-react';
import GradientBackground from '@/components/gradient-background';
import FeatureTab from '@/components/feature-tab';
import StatCard from '@/components/stat-card';
import TestimonialCard from '@/components/testimonial-card';
import ParallaxImage from '@/components/parallax-image';
import Image from 'next/image';
import { SplashScreen } from './components/splash';

// Mock navigation links for testing
const navLinks = [
  { link: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
  {
    link: '/discover',
    label: 'Discover',
    icon: <Compass className="h-4 w-4" />,
  },
  {
    link: '/watchlist',
    label: 'Watchlist',
    icon: <Bookmark className="h-4 w-4" />,
  },
  {
    link: '/calendar',
    label: 'Calendar',
    icon: <Calendar className="h-4 w-4" />,
  },
  { link: '/stats', label: 'Stats', icon: <BarChart className="h-4 w-4" /> },
];

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSplash, setShowSplash] = useState(true);

  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // Add this function inside the LandingPage component, near the top
  const [isLowPerfDevice, setIsLowPerfDevice] = useState(false);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Add this useEffect after the other useEffect in the component
  useEffect(() => {
    // Check if device is likely to have performance issues
    const checkPerformance = () => {
      // Check for mobile devices which typically have lower performance
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // Check if the device has a low refresh rate
      const hasLowRefreshRate = window.screen.availWidth <= 768;

      // Set low performance mode if either condition is true
      setIsLowPerfDevice(isMobile || hasLowRefreshRate);
    };

    checkPerformance();
  }, []);

  const features = [
    {
      title: 'Track Your Progress',
      description:
        'Keep track of episodes watched, set reminders, and never lose your place again.',
      icon: <Clock className="h-6 w-6" />,
      color: 'from-emerald-500 to-teal-500',
      details: [
        'Episode tracking with timestamps',
        'Season and episode organization',
        'Watch history and statistics',
        'Custom notes and ratings',
      ],
    },
    {
      title: 'Discover New Content',
      description:
        'Get personalized recommendations based on your watching history and preferences.',
      icon: <Search className="h-6 w-6" />,
      color: 'from-amber-500 to-orange-500',
      details: [
        'AI-powered recommendations',
        'Trending and popular content',
        'Genre-based discovery',
        'Similar content suggestions',
      ],
    },
    {
      title: 'Create Collections',
      description:
        'Organize your content into custom lists and categories that work for you.',
      icon: <List className="h-6 w-6" />,
      color: 'from-blue-500 to-indigo-500',
      details: [
        'Custom collection creation',
        'Smart auto-categorization',
        'Drag and drop organization',
        'Shareable collections',
      ],
    },
    {
      title: 'Analyze Your Habits',
      description:
        'Gain insights into your watching patterns with detailed analytics.',
      icon: <BarChart className="h-6 w-6" />,
      color: 'from-purple-500 to-pink-500',
      details: [
        'Watching time statistics',
        'Genre preferences analysis',
        'Completion rate tracking',
        'Seasonal watching patterns',
      ],
    },
  ];

  return (
    <div
      className="relative min-h-screen bg-[#0F0F1A] text-white overflow-hidden"
      ref={containerRef}
    >
      <SplashScreen onComplete={() => setShowSplash(false)} />
      {/* Gradient Background */}
      <GradientBackground />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Simplified Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0F0F1A] via-[#0F0F1A] to-transparent opacity-90"></div>

          {/* Reduced number of abstract shapes with simpler animations */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 z-10 relative">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 border-none text-white px-4 py-1.5 text-sm mb-6">
                Organize • Track • Discover
              </Badge>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                Your Digital
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                  Anime Companion
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-10 max-w-xl">
                OtakuNote helps you organize, track, and discover your favorite
                anime with a beautiful, intuitive interface designed for
                enthusiasts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 border-none text-lg px-8 hover:opacity-90 hover:from-indigo-600 hover:to-purple-600"
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10 text-lg px-8"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Abstract UI Mockup with Anime Character - Simplified */}
            <div className="md:w-1/2 relative">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* UI Frame - Simplified with fewer animations */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-indigo-500/30 overflow-hidden shadow-xl">
                  {/* UI Header */}
                  <div className="h-14 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 flex items-center px-4 border-b border-indigo-500/20">
                    <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400 mr-4"></div>
                    <div className="flex-1 h-6 bg-white/10 rounded-md"></div>
                  </div>

                  {/* UI Content - Simplified static version */}
                  <div className="p-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-20 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                            {i === 1 ? (
                              <Clock className="h-4 w-4" />
                            ) : i === 2 ? (
                              <Star className="h-4 w-4" />
                            ) : (
                              <List className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Content Rows - Static */}
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-16 mb-3 bg-white/5 rounded-lg border border-white/10 flex items-center px-4"
                      >
                        <div className="w-8 h-8 rounded-md bg-gradient-to-r from-indigo-500/30 to-purple-500/30 mr-3"></div>
                        <div className="flex-1">
                          <div className="h-3 w-24 bg-white/20 rounded-md mb-2"></div>
                          <div className="h-2 w-32 bg-white/10 rounded-md"></div>
                        </div>
                        <div className="w-12 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center">
                          <div className="w-4 h-1 bg-indigo-400 rounded-full"></div>
                        </div>
                      </div>
                    ))}

                    {/* Bottom Navigation */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-t border-indigo-500/20 flex items-center justify-around px-6">
                      {[
                        <LayoutGrid key="layout" />,
                        <Search key="search" />,
                        <Bell key="bell" />,
                        <Bookmark key="bookmark" />,
                      ].map((icon, i) => (
                        <div
                          key={i}
                          className={`w-10 h-10 rounded-full ${
                            i === 0 ? 'bg-indigo-500/30' : 'bg-transparent'
                          } flex items-center justify-center`}
                        >
                          {React.cloneElement(icon as React.ReactElement, {
                            className: 'h-5 w-5',
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Decorative Elements - Static */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

                {/* Anime Character - Static Image */}
                <div className="absolute -right-20 -bottom-10 w-64 h-64 z-20">
                  <Image
                    src="/esdeath.png"
                    alt="Anime Character"
                    width={300}
                    height={400}
                    className="object-contain"
                  />
                </div>

                {/* Floating Elements - Reduced animations */}
                <div className="absolute -top-5 -right-5 w-20 h-20 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-xl backdrop-blur-sm border border-indigo-500/30 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-indigo-300" />
                </div>

                <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-xl backdrop-blur-sm border border-pink-500/30 flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-pink-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F1A] via-[#1A1A2E] to-[#0F0F1A] opacity-90"></div>

          {/* Decorative lines */}
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M0,100 Q250,200 500,100 T1000,100"
              stroke="rgba(99, 102, 241, 0.1)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2 }}
            />
            <motion.path
              d="M0,200 Q250,300 500,200 T1000,200"
              stroke="rgba(168, 85, 247, 0.1)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
            />
            <motion.path
              d="M0,300 Q250,400 500,300 T1000,300"
              stroke="rgba(236, 72, 153, 0.1)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, delay: 1 }}
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful Features for Anime Fans
            </h2>
            <p className="text-xl text-gray-300">
              OtakuNote transforms how you organize and discover anime with
              these powerful tools
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Feature Selector */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
            >
              {features.map((feature, index) => (
                <FeatureTab
                  key={index}
                  feature={feature}
                  isActive={activeFeature === index}
                  onClick={() => setActiveFeature(index)}
                />
              ))}
            </motion.div>

            {/* Feature Details with Anime Character */}
            <motion.div
              className="relative rounded-xl overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className={`bg-gradient-to-br ${
                    features[activeFeature].color
                  }/10 backdrop-blur-sm rounded-xl border border-${
                    features[activeFeature].color.split(' ')[1]
                  }/20 p-8`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-r ${features[activeFeature].color}`}
                    >
                      {features[activeFeature].icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">
                        {features[activeFeature].title}
                      </h3>
                      <p className="text-gray-300">
                        {features[activeFeature].description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {features[activeFeature].details.map((detail, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * i }}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-gradient-to-r ${features[activeFeature].color} flex items-center justify-center flex-shrink-0`}
                        >
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span>{detail}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    className="mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      className={`bg-gradient-to-r ${features[activeFeature].color} border-none hover:opacity-90`}
                    >
                      Explore {features[activeFeature].title}
                    </Button>
                  </motion.div>

                  {/* Anime Character - Cute with Parallax - ENABLED */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-60 z-10">
                    <ParallaxImage
                      src="/cute.png"
                      alt="Cute Anime Character"
                      width={200}
                      height={300}
                      depth={5}
                      disabled={false} // Keeping parallax effect enabled only here
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-tl from-[#0F0F1A] via-[#1A1A2E] to-[#0F0F1A] opacity-90"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                Anime Enthusiasts
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Join our growing community of anime lovers who use OtakuNote to
              enhance their experience
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            <StatCard
              value="10,000+"
              label="Anime Titles"
              icon={<Layers />}
              color="from-indigo-500 to-purple-500"
            />
            <StatCard
              value="4K+"
              label="Tracked Episodes"
              icon={<BarChart />}
              color="from-purple-500 to-pink-500"
            />
            <StatCard
              value="250+"
              label="Active Users"
              icon={<Users />}
              color="from-pink-500 to-rose-500"
            />
            <StatCard
              value="99.9%"
              label="Uptime"
              icon={<TrendingUp />}
              color="from-rose-500 to-indigo-500"
            />
          </div>

          {/* Testimonials */}
          <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center">
            What Our Users Say
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              aria-role="article"
              quote="OtakuNote completely changed how I keep track of my anime. The interface is beautiful and the tracking features are exactly what I needed."
              author="Alex K."
              role="Anime Content Creator"
              rating={5}
            />
            <TestimonialCard
              aria-role="article"
              quote="I've tried many anime tracking apps, but this one stands out with its clean design and powerful organization tools. Highly recommended!"
              author="Jamie T."
              role="Digital Artist"
              rating={5}
            />
            <TestimonialCard
              quote="The analytics feature is amazing! I love seeing my watching patterns and getting recommendations based on my taste."
              author="Sam R."
              role="Anime Enthusiast"
              rating={4}
            />
          </div>
        </div>
      </section>

      {/* Interface Preview */}
      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F1A] via-[#1A1A2E] to-[#0F0F1A] opacity-90"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Beautiful,{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                  Intuitive
                </span>{' '}
                Interface
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Our sleek, user-friendly dashboard makes organizing your anime
                collection a visual delight. Designed with both aesthetics and
                functionality in mind.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span>Dark mode optimized for late-night anime sessions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span>Customizable dashboard layouts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span>Responsive design for all your devices</span>
                </div>
              </div>

              <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 border-none hover:opacity-90">
                Explore Interface
              </Button>
            </motion.div>

            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                {/* Dashboard Mockup */}
                <div className="relative rounded-xl overflow-hidden border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 bg-[#0F0F1A]">
                  {/* Dashboard Header */}
                  <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-4 border-b border-indigo-500/20">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                          <Layers className="h-4 w-4" />
                        </div>
                        <span className="font-bold">Dashboard</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <Search className="h-4 w-4" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30">
                          {/* Avatar placeholder */}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="p-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[
                        {
                          label: 'Watching',
                          value: '24',
                          icon: <Eye className="h-4 w-4" />,
                          color: 'bg-indigo-500/20 border-indigo-500/30',
                        },
                        {
                          label: 'Completed',
                          value: '142',
                          icon: <Check className="h-4 w-4" />,
                          color: 'bg-green-500/20 border-green-500/30',
                        },
                        {
                          label: 'Planned',
                          value: '67',
                          icon: <Bookmark className="h-4 w-4" />,
                          color: 'bg-amber-500/20 border-amber-500/30',
                        },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          className={`rounded-lg ${stat.color} p-4 flex flex-col items-center justify-center`}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                        >
                          <div className="flex items-center justify-center mb-1">
                            {stat.icon}
                          </div>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="text-xs text-gray-400">
                            {stat.label}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Recent Activity */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Recent Activity</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-300 hover:text-indigo-200"
                        >
                          View All <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>

                      {/* Activity Items */}
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            className="bg-white/5 rounded-lg border border-white/10 p-3 flex items-center"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                          >
                            <div className="w-10 h-10 rounded-md bg-gradient-to-r from-indigo-500/20 to-purple-500/20 flex items-center justify-center mr-3">
                              {i === 1 ? (
                                <Clock className="h-5 w-5 text-indigo-400" />
                              ) : i === 2 ? (
                                <Star className="h-5 w-5 text-amber-400" />
                              ) : (
                                <Bookmark className="h-5 w-5 text-purple-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">
                                    {i === 1
                                      ? 'Continued watching'
                                      : i === 2
                                      ? 'Rated anime'
                                      : 'Added to watchlist'}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {i === 1
                                      ? 'Episode 5'
                                      : i === 2
                                      ? 'Gave 5 stars'
                                      : "Added to 'Must Watch'"}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {i === 1
                                    ? '2h ago'
                                    : i === 2
                                    ? 'Yesterday'
                                    : '3d ago'}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Recommended For You</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-300 hover:text-indigo-200"
                        >
                          More <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="bg-white/5 rounded-lg border border-white/10 p-3 flex items-center"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                          >
                            <div className="w-12 h-12 rounded-md bg-gradient-to-r from-indigo-500/20 to-purple-500/20 flex items-center justify-center mr-3">
                              <div className="w-6 h-6 rounded-full bg-white/20"></div>
                            </div>
                            <div className="flex-1">
                              <div className="h-3 w-20 bg-white/20 rounded-md mb-2"></div>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className="h-3 w-3 text-amber-400 fill-amber-400"
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-400 ml-2">
                                  5.0
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-5 -right-5 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>

                {/* Floating UI elements */}
                <motion.div
                  className="absolute top-10 -right-10 bg-black/50 backdrop-blur-md rounded-lg p-3 border border-indigo-500/30"
                  animate={{ y: [0, -5, 0], rotate: [0, 2, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm">Top Rated</span>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-5 -left-10 bg-black/50 backdrop-blur-md rounded-lg p-3 border border-purple-500/30"
                  animate={{ y: [0, 5, 0], rotate: [0, -2, 0] }}
                  transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">Release Calendar</span>
                  </div>
                </motion.div>

                {/* Anime Character - Military with Parallax - DISABLED */}
                <div className="absolute -bottom-20 -right-10 w-48 h-48 z-20">
                  <ParallaxImage
                    src="/asuramaru.png"
                    alt="Anime Character"
                    width={300}
                    height={300}
                    depth={7}
                    disabled={true} // Disabled parallax effect
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] via-[#1A1A2E] to-[#0F0F1A] opacity-90"></div>

          {/* Animated background elements */}
          <motion.div
            className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-indigo-500/20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Transform Your Anime Experience?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Join thousands of anime fans who are already using OtakuNote to
                discover, track, and enjoy their favorite shows in a whole new
                way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 border-none text-lg px-8 hover:opacity-90"
                >
                  Get Started Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10 text-lg px-8"
                >
                  View Demo
                </Button>
              </div>
            </div>

            {/* Anime Character - Cute with Parallax - DISABLED */}
            <div className="absolute -bottom-10 -right-10 w-40 h-60 z-10">
              <ParallaxImage
                src="/cute.png"
                alt="Cute Anime Character"
                width={200}
                height={300}
                depth={5}
                disabled={true} // Disabled parallax effect
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12">
        <div className="absolute inset-0 bg-[#0A0A15] z-0"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="border-t border-indigo-500/20 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} OtakuNote. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Check(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>Check</title>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
