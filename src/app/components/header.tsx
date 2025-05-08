'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useQuery } from 'react-query';
import {
  ChevronDown,
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  BookOpen,
  Heart,
  Settings,
  Home,
  Compass,
  Calendar,
  BarChart4,
} from 'lucide-react';
import { useAtom } from 'jotai';
import { watchlistedIdsAtom } from '@/store';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SignInPopup } from '@/components/sign-in-popup';

interface HeaderResponsiveProps {
  links: { link: string; label: string; icon?: React.ReactNode }[];
}

// Mock function to fetch watchlist data
const fetchWatchlist = async (userId: string) => {
  // Replace this with your actual API call
  const response = await fetch(`/api/watchlist?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export function HeaderResponsive({ links }: HeaderResponsiveProps) {
  const { data: session } = useSession();
  const [watchlistedIds, setWatchlistedIds] = useAtom(watchlistedIdsAtom);
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSignInPopupOpen, setIsSignInPopupOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const { data: watchlistData } = useQuery(
    ['watchlist', session?.user?.email],
    () => fetchWatchlist(session?.user?.email as string),
    {
      enabled: !!session?.user?.email && !watchlistedIds,
      onSuccess: (data) => {
        setWatchlistedIds(data.watchlist);
      },
    }
  );

  useEffect(() => {
    setActive(pathname);
  }, [pathname]);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignInClick = () => {
    setIsSignInPopupOpen(true);
  };

  // Default icons for common navigation items if not provided
  const getDefaultIcon = (label: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Home: <Home className="h-4 w-4" />,
      Discover: <Compass className="h-4 w-4" />,
      Watchlist: <BookOpen className="h-4 w-4" />,
      Calendar: <Calendar className="h-4 w-4" />,
      Stats: <BarChart4 className="h-4 w-4" />,
      Search: <Search className="h-4 w-4" />,
    };

    return iconMap[label] || null;
  };

  const items = links.map((link) => {
    const icon = link.icon || getDefaultIcon(link.label);

    return (
      <Link
        className={`flex items-center py-2 px-4 text-sm font-medium rounded-md transition-all duration-200
          ${
            active === link.link
              ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white'
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        onClick={() => {
          setActive(link.link);
          setOpened(false);
        }}
        key={link.label}
        href={link.link}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {link.label}
        {link.label === 'Watchlist' &&
          watchlistedIds &&
          watchlistedIds.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 bg-indigo-500 text-white"
            >
              {watchlistedIds.length}
            </Badge>
          )}
      </Link>
    );
  });

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-md shadow-md'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.svg" alt="logo" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">{items}</nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full"></span>
              </Button>

              {session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 text-gray-300 hover:text-white"
                    >
                      <Avatar className="h-8 w-8 border border-indigo-500/30">
                        <AvatarImage
                          src={session.user.image || ''}
                          alt={session.user.name || ''}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white">
                          {session.user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline-block">
                        {session.user.name}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-background/95 backdrop-blur-md border-indigo-500/20"
                  >
                    <div className="px-2 py-1.5 text-sm font-medium text-gray-400">
                      Signed in as{' '}
                      <span className="text-white">{session.user.email}</span>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favorites</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer flex items-center"
                      onSelect={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={handleSignInClick}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none hover:opacity-90"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-gray-300">
                <Search className="h-5 w-5" />
              </Button>

              <Sheet open={opened} onOpenChange={setOpened}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-300">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[280px] bg-background/95 backdrop-blur-md border-indigo-500/20"
                >
                  <div className="flex items-center space-x-2 mb-8 mt-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                      OtakuNote
                    </span>
                  </div>

                  {session?.user && (
                    <div className="mb-6 pb-6 border-b border-indigo-500/20">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border border-indigo-500/30">
                          <AvatarImage
                            src={session.user.image || ''}
                            alt={session.user.name || ''}
                          />
                          <AvatarFallback className="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white">
                            {session.user.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <nav className="flex flex-col space-y-1">{items}</nav>

                  {session?.user ? (
                    <div className="mt-auto pt-6 border-t border-indigo-500/20 space-y-1">
                      <button
                        className="flex w-full items-center py-2 px-4 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white rounded-md"
                        onClick={() => signOut()}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 pt-6 border-t border-indigo-500/20">
                      <Button
                        onClick={handleSignInClick}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none hover:opacity-90"
                      >
                        Sign In
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Animated Highlight Line */}
        <motion.div
          className="h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isScrolled ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </header>

      {/* Sign In Popup */}
      <SignInPopup
        isOpen={isSignInPopupOpen}
        onClose={() => setIsSignInPopupOpen(false)}
      />
    </>
  );
}
