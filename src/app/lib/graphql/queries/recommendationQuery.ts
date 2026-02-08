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

export const ANIME_RECOMMENDATIONS_QUERY = gql`
  query AnimeRecommendations($id: Int!) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
      }
      recommendations(sort: [RATING_DESC], perPage: 20, page: 1) {
        edges {
          node {
            id
            rating
            mediaRecommendation {
              id
              title {
                romaji
                english
              }
              type
              format
              status
              coverImage {
                extraLarge
                large
              }
              averageScore
              episodes
              genres
              isAdult
              startDate {
                year
              }
            }
          }
        }
      }
    }
  }
`;
