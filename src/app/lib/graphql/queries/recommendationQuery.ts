import { gql } from 'graphql-tag';

export const RECOMMENDATION_QUERY = gql`
  query AnimeRecommendations($page: Int = 1, $mediaId: Int) {
    GenreCollection
    Page(page: $page, perPage: 50) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      recommendations(sort: RATING_DESC, mediaId: $mediaId) {
        mediaRecommendation {
          title {
            romaji
            english
          }
          description
        }
      }
    }
  }
`;
