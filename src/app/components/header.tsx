'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useQuery } from 'react-query';
import { ChevronDown, Menu, Film } from 'lucide-react';
import { useAtom } from 'jotai';
import { watchlistedIdsAtom } from '@/store';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const HEADER_HEIGHT = 60;

interface HeaderResponsiveProps {
  links: { link: string; label: string }[];
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

  const items = links.map((link) => (
    <Link
      className={`block py-2 px-4 text-sm font-semibold rounded-md transition-colors
        ${
          active === link.link
            ? 'bg-primary/50 text-primary-foreground'
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      onClick={() => {
        setActive(link.link);
        setOpened(false);
      }}
      key={link.label}
      href={link.link}
    >
      {link.label}
    </Link>
  ));

  return (
    <header className="relative h-16 z-10 bg-background shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-shrink-0">
            <img src="/logo.svg" alt="" />
          </div>

          <nav className="hidden sm:flex flex-grow justify-end space-x-4">
            {items}
          </nav>

          {/* <div className="hidden sm:flex items-center flex-shrink-0">
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <span>{session.user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <p className="w-full">Import MAL Watchlist</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => console.log('SIGN OUT')}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" onClick={() => console.log('GOOGLE')}>
                Sign In
              </Button>
            )}
          </div> */}

          <Sheet open={opened} onOpenChange={setOpened}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col mt-4">
                {items}
                {/* {session?.user ? (
                  <>
                    <p className="block py-2 px-4 text-sm font-semibold">
                      Import MAL Watchlist
                    </p>
                    <button
                      type="button"
                      className="block py-2 px-4 text-sm font-semibold"
                      onClick={() => console.log('SIGN OUT')}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="block py-2 px-4 text-sm font-semibold"
                    onClick={() => console.log('GOOGLE')}
                  >
                    Sign In
                  </button>
                )} */}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
