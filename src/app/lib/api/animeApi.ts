import { graphqlRequest } from '@/lib/graphql/client';
import { SEARCH_QUERY } from '@/lib/graphql/queries/searchQuery';
import { DATA_QUERY } from '@/lib/graphql/queries/dataQuery';
import { RECOMMENDATION_QUERY } from '@/lib/graphql/queries/recommendationQuery';
import {
  type SearchAnimeQuery,
  type SearchAnimeQueryVariables,
  type AnimeDetailsQuery,
  AnimeDetailsQueryVariables,
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
