export interface CardInterface {
  id: string;
  type: CardType;
  isAdult: boolean;
  title: {
    english: string;
    romaji: string;
  };
  coverImage: {
    extraLarge: string;
    large: string;
  };
  startDate: {
    year: number;
    month: number;
    day: number;
  };
  status: string;
  episodes: number;
  genres: string[];
  averageScore: number;
  nextAiringEpisode: {
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
  } | null;
}

enum CardType {
  ANIME = 'ANIME',
  MANGA = 'MANGA',
}
