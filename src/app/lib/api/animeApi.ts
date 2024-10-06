import { graphqlRequest } from '@/lib/graphql/client';
import { SEARCH_QUERY } from '@/lib/graphql/queries/searchQuery';
import { DATA_QUERY } from '@/lib/graphql/queries/dataQuery';
import { RECOMMENDATION_QUERY } from '@/lib/graphql/queries/recommendationQuery';
import {
  SearchAnimeQuery,
  SearchAnimeQueryVariables,
  AnimeDetailsQuery,
  AnimeDetailsQueryVariables,
  AnimeRecommendationsQuery,
  AnimeRecommendationsQueryVariables,
} from '@/lib/graphql/generated/graphql';

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
  id: number
): Promise<AnimeDetailsQuery['Media']> => {
  const data = await graphqlRequest<AnimeDetailsQuery>(DATA_QUERY, { id });
  return data.Media;
};

export const getRecommendations = async (
  mediaId: number,
  page: number = 1
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
