'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  Tv,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getAiringSchedule,
  type AiringScheduleItem,
} from '@/lib/api/animeApi';
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  isToday,
  isSameDay,
  addDays,
} from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useWatchlistStore } from '@/store/watchlistStore';

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface DaySchedule {
  date: Date;
  items: AiringScheduleItem[];
}

export default function AiringSchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [scheduleData, setScheduleData] = useState<AiringScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1;
  });

  const watchlistStore = useWatchlistStore();
  const isInWatchlist = watchlistStore?.isInWatchlist;

  const currentWeekStart = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    return weekOffset === 0 ? start : addWeeks(start, weekOffset);
  }, [weekOffset]);

  const currentWeekEnd = useMemo(() => {
    return endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  }, [currentWeekStart]);

  useEffect(() => {
    let cancelled = false;
    const startTimestamp = Math.floor(currentWeekStart.getTime() / 1000);
    const endTimestamp = Math.floor(currentWeekEnd.getTime() / 1000);
    const cacheKey = `schedule_${startTimestamp}_${endTimestamp}`;

    const cached = (() => {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { expiresAt: number; data: AiringScheduleItem[] };
        if (Date.now() > parsed.expiresAt) {
          localStorage.removeItem(cacheKey);
          return null;
        }
        return parsed.data;
      } catch {
        localStorage.removeItem(cacheKey);
        return null;
      }
    })();

    if (cached) {
      setScheduleData(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    getAiringSchedule(startTimestamp, endTimestamp)
      .then((data) => {
        if (cancelled) return;
        setScheduleData(data);
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ expiresAt: currentWeekEnd.getTime(), data })
          );
        } catch {}
      })
      .catch((error) => {
        console.error('Error fetching airing schedule:', error);
        if (!cancelled) setScheduleData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentWeekStart, currentWeekEnd]);

  const weekSchedule: DaySchedule[] = useMemo(() => {
    return WEEKDAYS.map((_, index) => {
      const dayDate = addDays(currentWeekStart, index);
      const dayItems = scheduleData.filter((item) => {
        const airingDate = new Date(item.airingAt * 1000);
        return isSameDay(airingDate, dayDate);
      });
      dayItems.sort((a, b) => a.airingAt - b.airingAt);
      return { date: dayDate, items: dayItems };
    });
  }, [scheduleData, currentWeekStart]);

  const totalAiring = scheduleData.length;
  const todayCount = weekSchedule.find((d) => isToday(d.date))?.items.length || 0;

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-transparent to-indigo-950/15" />
        <motion.div
          className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative container mx-auto px-4 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <CalendarClock className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl blur opacity-30 -z-10" />
              </motion.div>

              <div>
                <motion.h1
                  className="text-4xl md:text-5xl font-bold tracking-tight text-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Airing Schedule
                </motion.h1>
                <motion.p
                  className="text-gray-400 mt-1 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {format(currentWeekStart, 'MMM d')} &ndash;{' '}
                  {format(currentWeekEnd, 'MMM d, yyyy')}
                </motion.p>
              </div>
            </div>

            {/* Stats + Week Navigation */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mr-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <Tv className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-gray-300">
                    {totalAiring} airing
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium text-gray-300">
                    {todayCount} today
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  className="h-9 w-9 bg-white/5 border-white/10 hover:bg-white/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWeekOffset(0)}
                  className="bg-white/5 border-white/10 hover:bg-white/10 text-sm"
                >
                  This Week
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  className="h-9 w-9 bg-white/5 border-white/10 hover:bg-white/10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>

          {/* Day Tabs */}
          <motion.div
            className="flex gap-2 overflow-x-auto pb-1 no-scrollbar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            {WEEKDAYS.map((day, index) => {
              const dayDate = weekSchedule[index]?.date;
              const dayCount = weekSchedule[index]?.items.length || 0;
              const isDayToday = dayDate ? isToday(dayDate) : false;
              const isActive = selectedDay === index;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(index)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{WEEKDAYS_SHORT[index]}</span>
                    {isDayToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-xs tabular-nums ${
                        isActive
                          ? 'bg-white/10'
                          : 'bg-white/5 text-gray-500'
                      }`}
                    >
                      {dayCount}
                    </span>
                  </span>
                </button>
              );
            })}
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-sm text-gray-400">
              Loading airing schedule...
            </p>
          </div>
        ) : (
          <DayContent
            schedule={weekSchedule[selectedDay]}
            dayName={WEEKDAYS[selectedDay]}
            isInWatchlist={
              typeof isInWatchlist === 'function' ? isInWatchlist : () => false
            }
          />
        )}
      </div>
    </div>
  );
}

function DayContent({
  schedule,
  dayName,
  isInWatchlist,
}: {
  schedule: DaySchedule;
  dayName: string;
  isInWatchlist: (id: string) => boolean;
}) {
  if (!schedule || schedule.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <CalendarClock className="w-7 h-7 text-gray-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-1">
            No anime airing
          </h3>
          <p className="text-sm text-gray-400 max-w-sm">
            Nothing is scheduled to air on {dayName},{' '}
            {format(schedule.date, 'MMM d')}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schedule.items.map((item, index) => (
        <ScheduleCard
          key={item.id}
          item={item}
          index={index}
          inWatchlist={isInWatchlist(String(item.media.id))}
        />
      ))}
    </div>
  );
}

function ScheduleCard({
  item,
  index,
  inWatchlist,
}: {
  item: AiringScheduleItem;
  index: number;
  inWatchlist: boolean;
}) {
  const airingDate = new Date(item.airingAt * 1000);
  const timeStr = format(airingDate, 'h:mm a');
  const title = item.media.title.english || item.media.title.romaji;
  const isPast = item.airingAt * 1000 < Date.now();
  const tzAbbr = airingDate
    .toLocaleTimeString('en-US', { timeZoneName: 'short' })
    .split(' ')
    .pop();
  const totalEps = item.media.episodes;
  const airedEps = Math.max(0, item.episode - 1);
  const progressPct = totalEps ? Math.min((airedEps / totalEps) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
    >
      <Link href={`/anime/${item.media.id}`}>
        <div
          className={`group relative flex gap-4 p-4 rounded-2xl bg-white/[0.02] border transition-all duration-300 hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-lg ${
            inWatchlist
              ? 'border-cyan-500/20 hover:border-cyan-500/40'
              : 'border-white/[0.06] hover:border-white/10'
          }`}
        >
          {/* Time */}
          <div className="flex flex-col items-center justify-center min-w-[72px] shrink-0">
            <span className="text-lg font-bold tabular-nums text-white">
              {timeStr.split(' ')[0]}
            </span>
            <span className="text-xs text-gray-500 uppercase">
              {timeStr.split(' ')[1]}
            </span>
            <span className="text-[10px] text-gray-600 mt-0.5">
              {tzAbbr}
            </span>
          </div>

          {/* Divider */}
          <div className="relative flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full border-2 mt-1 shrink-0 ${
                isPast
                  ? 'bg-gray-600 border-gray-500'
                  : inWatchlist
                    ? 'bg-cyan-500 border-cyan-400'
                    : 'bg-indigo-500 border-indigo-400'
              }`}
            />
            <div className="w-px flex-1 bg-white/5 mt-1" />
          </div>

          {/* Cover Image */}
          <div className="w-16 h-22 rounded-xl overflow-hidden shrink-0 relative">
            <Image
              src={
                item.media.coverImage.extraLarge ||
                item.media.coverImage.large
              }
              alt={title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 py-0.5">
            <div className="flex items-start gap-2 mb-1.5">
              <h3 className="text-base font-semibold text-gray-100 line-clamp-1 group-hover:text-white transition-colors">
                {title}
              </h3>
              {inWatchlist && (
                <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                  In List
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="font-medium text-white/80">
                Episode {item.episode}
                {item.media.episodes
                  ? ` / ${item.media.episodes}`
                  : ''}
              </span>

              {item.media.format && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span>{item.media.format.replace(/_/g, ' ')}</span>
                </>
              )}

              {item.media.averageScore > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {item.media.averageScore}%
                  </span>
                </>
              )}
            </div>

            {item.media.genres.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {item.media.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/5 text-gray-400 border border-white/5"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Episode Progress */}
            {totalEps && totalEps > 0 && (
              <div className="mt-3 flex items-center gap-3">
                {/* Segmented arc-style progress */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalEps, 24) }).map((_, i) => {
                    const segmentEp = totalEps <= 24 ? i + 1 : Math.ceil(((i + 1) / 24) * totalEps);
                    const isCompleted = segmentEp <= airedEps;
                    const isNext = !isCompleted && segmentEp <= item.episode;

                    return (
                      <div key={i} className="relative">
                        <div
                          className={`h-1 rounded-full transition-all duration-500 ${
                            totalEps <= 12 ? 'w-3' : totalEps <= 24 ? 'w-1.5' : 'w-1'
                          } ${
                            isNext
                              ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]'
                              : isCompleted
                                ? 'bg-cyan-500/70'
                                : 'bg-white/[0.08]'
                          }`}
                        />
                        {isNext && (
                          <motion.div
                            className={`absolute inset-0 rounded-full bg-cyan-400/50 ${
                              totalEps <= 12 ? 'w-3' : totalEps <= 24 ? 'w-1.5' : 'w-1'
                            }`}
                            animate={{ opacity: [0.3, 0.8, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Compact episode counter chip */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                  <span className="text-[11px] font-semibold tabular-nums text-cyan-400">
                    EP {item.episode}
                  </span>
                  <span className="text-[11px] text-gray-600">/</span>
                  <span className="text-[11px] tabular-nums text-gray-500">
                    {totalEps}
                  </span>
                </div>

                {/* Percentage pill */}
                <span className="text-[10px] font-medium tabular-nums text-gray-500">
                  {Math.round(progressPct)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
