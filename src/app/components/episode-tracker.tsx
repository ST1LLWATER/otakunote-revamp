"use client";

import { Check } from "lucide-react";
import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface EpisodeTrackerProps {
	animeId: string;
	totalEpisodes: number;
	watchedEpisodes: number;
	onEpisodeChange: (animeId: string, episode: number) => void;
	className?: string;
}

export function EpisodeTracker({
	animeId,
	totalEpisodes,
	watchedEpisodes,
	onEpisodeChange,
	className,
}: EpisodeTrackerProps) {
	if (!totalEpisodes || totalEpisodes <= 0) return null;

	// Cap display to a reasonable number to avoid rendering thousands of boxes
	// for long-running shows (e.g. One Piece). User can still mark all as watched.
	const displayCount = Math.min(totalEpisodes, 999);
	const episodes = Array.from({ length: displayCount }, (_, i) => i + 1);

	const handleEpisodeClick = (episode: number) => {
		// Toggle off the current last watched episode when clicked again.
		// Middle episodes cannot be individually toggled.
		if (episode === watchedEpisodes && watchedEpisodes > 0) {
			onEpisodeChange(animeId, episode - 1);
		} else {
			onEpisodeChange(animeId, episode);
		}
	};

	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<div className="flex items-center justify-between text-[10px] text-white/70">
				<span>Episodes</span>
				<span>
					{watchedEpisodes}/{totalEpisodes}
				</span>
			</div>
			<ScrollArea className="h-36 sm:h-40 w-full rounded-md border border-white/10 bg-black/20 p-2">
				<div
					className="grid gap-1.5"
					style={{
						gridTemplateColumns: "repeat(auto-fit, minmax(2.25rem, 1fr))",
					}}
				>
					{episodes.map((episode) => {
						const isWatched = episode <= watchedEpisodes;
						return (
							<button
								key={episode}
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									handleEpisodeClick(episode);
								}}
								className={cn(
									"relative h-6 w-full min-w-0 rounded-md text-[10px] sm:text-xs font-medium transition-all duration-150",
									"flex items-center justify-center",
									"hover:scale-105 active:scale-95",
									isWatched
										? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm shadow-indigo-500/25"
										: "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
								)}
								title={`Mark up to episode ${episode} as watched`}
							>
								{isWatched &&
								episode === watchedEpisodes &&
								watchedEpisodes > 0 ? (
									<Check className="h-3 w-3" />
								) : (
									episode
								)}
							</button>
						);
					})}
				</div>
				<ScrollBar className="bg-white/10" />
			</ScrollArea>
		</div>
	);
}

export default EpisodeTracker;
