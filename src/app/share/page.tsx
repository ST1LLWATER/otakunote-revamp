"use client";

import { motion } from "framer-motion";
import { BookmarkPlus, Check, Copy, ListStart, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { searchAnime } from "@/lib/api/animeApi";
import type { CardInterface } from "@/lib/types";
import { useWatchlistStore } from "@/store/watchlistStore";
import AnimeCard from "../components/anime-card";

function parseSharedIds(raw: string | null): number[] {
	if (!raw) return [];
	return raw
		.split(",")
		.map((id) => Number.parseInt(id.trim(), 10))
		.filter((id) => !Number.isNaN(id) && id > 0);
}

function formatShareUrl(ids: number[]): string {
	if (typeof window === "undefined") return "";
	const params = new URLSearchParams({ ids: ids.join(",") });
	return `${window.location.origin}/share?${params.toString()}`;
}

function SharePageContent() {
	const searchParams = useSearchParams();
	const ids = useMemo(
		() => parseSharedIds(searchParams.get("ids")),
		[searchParams],
	);

	const [animeList, setAnimeList] = useState<CardInterface[]>([]);
	const [loading, setLoading] = useState(true);
	const [copied, setCopied] = useState(false);
	const watchlistStore = useWatchlistStore();

	useEffect(() => {
		if (ids.length === 0) {
			setLoading(false);
			return;
		}

		let cancelled = false;

		const fetchData = async () => {
			try {
				setLoading(true);
				const all: CardInterface[] = [];
				const pageSize = 50;

				for (let i = 0; i < ids.length; i += pageSize) {
					const chunk = ids.slice(i, i + pageSize);
					const results = await searchAnime({
						id_in: chunk,
						perPage: pageSize,
					});
					const formatted = results
						.filter((item): item is NonNullable<typeof item> => item !== null)
						.map(
							(item) =>
								({
									id: String(item.id),
									type: (item.type || "ANIME") as CardInterface["type"],
									isAdult: item.isAdult || false,
									title: {
										english: item.title?.english || "",
										romaji: item.title?.romaji || "",
									},
									coverImage: {
										extraLarge: item.coverImage?.extraLarge || "",
										large: item.coverImage?.extraLarge || "",
									},
									startDate: {
										year: item.startDate?.year || 0,
										month: item.startDate?.month || 0,
										day: item.startDate?.day || 0,
									},
									status: item.status || "",
									episodes: item.episodes || 0,
									genres:
										item.genres?.filter((g): g is string => g !== null) || [],
									averageScore: item.averageScore || 0,
									nextAiringEpisode: item.nextAiringEpisode
										? {
												airingAt: item.nextAiringEpisode.airingAt,
												timeUntilAiring: item.nextAiringEpisode.timeUntilAiring,
												episode: item.nextAiringEpisode.episode,
											}
										: null,
								}) as CardInterface,
						);
					all.push(...formatted);
				}

				if (!cancelled) {
					setAnimeList(all);
				}
			} catch (error) {
				toast.error("Failed to load shared watchlist");
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		fetchData();
		return () => {
			cancelled = true;
		};
	}, [ids]);

	const handleCopyLink = async () => {
		const url = formatShareUrl(ids);
		if (!url) return;
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			toast.success("Link copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy link");
		}
	};

	const handleSaveAll = () => {
		if (!watchlistStore?.addToWatchlist) return;
		let added = 0;
		for (const anime of animeList) {
			if (!watchlistStore.isInWatchlist(anime.id)) {
				watchlistStore.addToWatchlist(anime.id, anime.type, anime);
				added++;
			}
		}
		if (added > 0) {
			toast.success(`Added ${added} anime to your watchlist`);
		} else {
			toast.info("All anime are already in your watchlist");
		}
	};

	return (
		<div className="min-h-screen bg-[#0a0a12] text-white">
			{/* Subtle top gradient */}
			<div className="fixed inset-x-0 top-0 h-80 pointer-events-none">
				<div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-transparent" />
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
			</div>

			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="max-w-2xl mb-12 sm:mb-16"
				>
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/60 mb-5">
						<ListStart className="h-3.5 w-3.5" />
						<span>Shared watchlist</span>
					</div>

					<h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
						Curated for you
					</h1>
					<p className="text-base text-white/50 leading-relaxed">
						A hand-picked collection of anime. Browse the list and save anything
						that catches your eye to your own watchlist.
					</p>

					{ids.length > 0 && (
						<div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/40">
							<span>
								<strong className="text-white/70">{animeList.length}</strong>{" "}
								titles
							</span>
						</div>
					)}

					{/* Actions */}
					{ids.length > 0 && !loading && (
						<div className="mt-8 flex flex-wrap items-center gap-3">
							<Button
								onClick={handleSaveAll}
								className="bg-white text-black hover:bg-white/90 rounded-full px-5 h-10 font-medium"
							>
								<BookmarkPlus className="h-4 w-4 mr-2" />
								Save all
							</Button>
							<Button
								onClick={handleCopyLink}
								variant="outline"
								className="rounded-full px-5 h-10 border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06] hover:text-white"
							>
								{copied ? (
									<Check className="h-4 w-4 mr-2" />
								) : (
									<Copy className="h-4 w-4 mr-2" />
								)}
								{copied ? "Copied" : "Copy link"}
							</Button>
						</div>
					)}
				</motion.div>

				{/* Loading */}
				{loading && (
					<div className="flex flex-col items-center justify-center py-24 gap-4">
						<Loader2 className="w-6 h-6 animate-spin text-white/30" />
						<p className="text-sm text-white/40">Loading shared titles…</p>
					</div>
				)}

				{/* Empty state */}
				{!loading && ids.length === 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="flex flex-col items-center justify-center py-24 text-center"
					>
						<div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
							<ListStart className="h-6 w-6 text-white/30" />
						</div>
						<h2 className="text-lg font-medium text-white/80 mb-1">
							Nothing to see here
						</h2>
						<p className="text-sm text-white/40 max-w-sm">
							This shared watchlist link appears to be empty or invalid. Ask the
							sender to share a valid link.
						</p>
					</motion.div>
				)}

				{/* Grid */}
				{!loading && ids.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
					>
						{animeList.map((anime, index) => (
							<motion.div
								key={anime.id}
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.3,
									delay: Math.min(index * 0.04, 0.4),
								}}
							>
								<AnimeCard anime={anime} isLoggedIn={true} />
							</motion.div>
						))}
					</motion.div>
				)}
			</div>
		</div>
	);
}

export default function SharePage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
					<div className="flex flex-col items-center gap-3">
						<Loader2 className="w-6 h-6 animate-spin text-white/30" />
						<p className="text-sm text-white/40">Loading shared watchlist…</p>
					</div>
				</div>
			}
		>
			<SharePageContent />
		</Suspense>
	);
}
