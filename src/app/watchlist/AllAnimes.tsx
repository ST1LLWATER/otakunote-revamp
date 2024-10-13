import AnimeCard from '@/components/anime-card';
import React from 'react';

const AllAnimes = () => {
  const data = {
    id: 171018,
    type: 'ANIME',
    isAdult: false,
    title: {
      english: 'DAN DA DAN',
      romaji: 'Dandadan',
    },
    bannerImage:
      'https://s4.anilist.co/file/anilistcdn/media/anime/banner/171018-SpwPNAduszXl.jpg',
    coverImage: {
      extraLarge:
        'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-2ldCj6QywuOa.jpg',
    },
    startDate: {
      year: 2024,
      month: 10,
      day: 4,
    },
    status: 'RELEASING',
    episodes: 12,
    genres: ['Action', 'Comedy', 'Drama', 'Romance', 'Sci-Fi', 'Supernatural'],
    averageScore: 84,
    nextAiringEpisode: {
      airingAt: 1728573960,
      timeUntilAiring: 180180,
      episode: 2,
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 place-items-center">
      {[...Array(23)].map((_, index) => (
        <AnimeCard anime={data} />
      ))}
    </div>
  );
};

export default AllAnimes;
