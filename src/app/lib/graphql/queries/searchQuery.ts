import { gql } from 'graphql-tag';

export const SEARCH_QUERY = gql`
  query SearchAnime(
    $page: Int = 1
    $perPage: Int = 15
    $type: MediaType
    $search_query: String
    $id_in: [Int]
    $idMal_in: [Int]
    $season: MediaSeason
    $isAdult: Boolean
    $genres: [String]
    $seasonYear: Int
    $sort: [MediaSort] = [POPULARITY_DESC]
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(
        type: $type
        search: $search_query
        id_in: $id_in
        idMal_in: $idMal_in
        season: $season
        seasonYear: $seasonYear
        genre_in: $genres
        isAdult: $isAdult
        sort: $sort
      ) {
        id
        type
        isAdult
        title {
          english
          romaji
        }
        bannerImage
        coverImage {
          extraLarge
        }
        startDate {
          year
          month
          day
        }
        status
        episodes
        genres
        averageScore
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
  }
`;
