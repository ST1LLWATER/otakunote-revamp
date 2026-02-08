import { graphqlRequest } from '@/lib/graphql/client';
import { SEARCH_QUERY } from '@/lib/graphql/queries/searchQuery';
import { DATA_QUERY } from '@/lib/graphql/queries/dataQuery';
import {
  RECOMMENDATION_QUERY,
  ANIME_RECOMMENDATIONS_QUERY,
} from '@/lib/graphql/queries/recommendationQuery';
import { ANIME_DETAIL_QUERY } from '@/lib/graphql/queries/animeDetailQuery';
import {
  type SearchAnimeQuery,
  type SearchAnimeQueryVariables,
  type AnimeDetailsQuery,
  AnimeDetailsQueryVariables,
  type AnimeDetailQuery,
  type AnimeDetailQueryVariables,
  type AnimeRecommendationsQuery,
  AnimeRecommendationsQueryVariables,
  type MediaType,
  type MediaSeason,
} from '@/lib/graphql/generated/graphql';
import { ConstantData } from '../constants/filter-data';

export const searchAnime = async (
  variables: SearchAnimeQueryVariables
): Promise<NonNullable<NonNullable<SearchAnimeQuery['Page']>['media']>> => {
  const data = await graphqlRequest<SearchAnimeQuery>(SEARCH_QUERY, variables);

  if (!data || !data.Page || !data.Page.media) {
    throw new Error('No search results found');
  }

  return data.Page.media.filter(
    (item): item is NonNullable<typeof item> => item !== null
  );
};

export const getAnimeDetails = async (
  id: string
): Promise<AnimeDetailsQuery['Media']> => {
  const data = await graphqlRequest<AnimeDetailsQuery>(DATA_QUERY, { id });
  return data.Media;
};

export const getRecommendations = async (
  mediaId: number,
  page = 1
): Promise<
  NonNullable<NonNullable<AnimeRecommendationsQuery['Page']>['recommendations']>
> => {
  const data = await graphqlRequest<AnimeRecommendationsQuery>(
    RECOMMENDATION_QUERY,
    { mediaId, page }
  );
  if (!data || !data.Page || !data.Page.recommendations) {
    throw new Error('No search results found');
  }

  return data.Page.recommendations;
};

export const getAnimeDetailPage = async (
  id: number
): Promise<AnimeDetailQuery['Media']> => {
  const data = await graphqlRequest<AnimeDetailQuery>(ANIME_DETAIL_QUERY, {
    id,
  });
  return data.Media;
};

export const getCalendar = async ({
  season,
  year,
  genres,
}: {
  season: string;
  year: number;
  genres?: string[];
}) => {
  const variables: SearchAnimeQueryVariables = {
    type: 'ANIME' as MediaType,
    season: season as MediaSeason,
    seasonYear: year,
  };

  // Add genres if provided
  if (genres && genres.length > 0) {
    variables.genres = genres;
  }

  const data = await searchAnime(variables);

  return data;
};

export interface RecommendationItem {
  id: string;
  rating: number;
  sourceAnime: {
    id: string;
    title: string;
  };
  anime: {
    id: string;
    title: {
      romaji: string;
      english: string;
    };
    type: string;
    format: string;
    status: string;
    coverImage: {
      extraLarge: string;
      large: string;
    };
    averageScore: number;
    episodes: number;
    genres: string[];
    isAdult: boolean;
    startDate: {
      year: number;
    };
  };
}

interface AnimeRecommendationsResponse {
  Media: {
    id: number;
    title: {
      romaji: string;
      english: string;
    };
    recommendations: {
      edges: Array<{
        node: {
          id: number;
          rating: number;
          mediaRecommendation: {
            id: number;
            title: {
              romaji: string;
              english: string;
            };
            type: string;
            format: string;
            status: string;
            coverImage: {
              extraLarge: string;
              large: string;
            };
            averageScore: number;
            episodes: number;
            genres: string[];
            isAdult: boolean;
            startDate: {
              year: number;
            };
          } | null;
        };
      }>;
    };
  };
}

export const getAnimeRecommendations = async (
  animeId: number
): Promise<RecommendationItem[]> => {
  try {
    const data = await graphqlRequest<AnimeRecommendationsResponse>(
      ANIME_RECOMMENDATIONS_QUERY,
      { id: animeId }
    );

    if (!data?.Media?.recommendations?.edges) {
      return [];
    }

    const sourceTitle =
      data.Media.title.english || data.Media.title.romaji || '';

    return data.Media.recommendations.edges
      .filter((edge) => edge.node.mediaRecommendation !== null)
      .map((edge) => ({
        id: `${data.Media.id}-${edge.node.mediaRecommendation!.id}`,
        rating: edge.node.rating,
        sourceAnime: {
          id: String(data.Media.id),
          title: sourceTitle,
        },
        anime: {
          id: String(edge.node.mediaRecommendation!.id),
          title: {
            romaji: edge.node.mediaRecommendation!.title.romaji || '',
            english: edge.node.mediaRecommendation!.title.english || '',
          },
          type: edge.node.mediaRecommendation!.type || 'ANIME',
          format: edge.node.mediaRecommendation!.format || '',
          status: edge.node.mediaRecommendation!.status || '',
          coverImage: {
            extraLarge: edge.node.mediaRecommendation!.coverImage?.extraLarge || '',
            large: edge.node.mediaRecommendation!.coverImage?.large || '',
          },
          averageScore: edge.node.mediaRecommendation!.averageScore || 0,
          episodes: edge.node.mediaRecommendation!.episodes || 0,
          genres: edge.node.mediaRecommendation!.genres || [],
          isAdult: edge.node.mediaRecommendation!.isAdult || false,
          startDate: {
            year: edge.node.mediaRecommendation!.startDate?.year || 0,
          },
        },
      }));
  } catch (error) {
    console.error('Error fetching recommendations for anime:', animeId, error);
    return [];
  }
};
