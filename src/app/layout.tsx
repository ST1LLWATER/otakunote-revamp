import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import ReactQueryProvider from './providers/ReactQueryProvider';
import ThemeProvider from './providers/ThemeProvider';
import { HeaderResponsive } from './components/header';
import { SessionProvider } from './providers/SessionProvider';
import DetailModal from './components/detail-modal';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

const links = [
  {
    link: '/calendar',
    label: 'Calendar',
  },
  {
    link: '/watchlist',
    label: 'Watchlist',
  },
  {
    link: '/search',
    label: 'Search',
  },
];

export const metadata: Metadata = {
  title: 'OtakuNote - Anime & Manga Tracker',
  description:
    'Track, discover, and manage your anime and manga watchlist with OtakuNote',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <ReactQueryProvider>
              <div className="flex flex-col min-h-screen">
                <HeaderResponsive links={links} />
                <main className="flex-grow mt-16">{children}</main>
                <DetailModal />
              </div>
            </ReactQueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
