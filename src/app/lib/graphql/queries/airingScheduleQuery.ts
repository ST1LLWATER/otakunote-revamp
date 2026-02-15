import { gql } from 'graphql-tag';

export const AIRING_SCHEDULE_QUERY = gql`
  query AiringSchedule(
    $page: Int = 1
    $perPage: Int = 50
    $airingAt_greater: Int
    $airingAt_lesser: Int
    $notYetAired: Boolean
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      airingSchedules(
        airingAt_greater: $airingAt_greater
        airingAt_lesser: $airingAt_lesser
        notYetAired: $notYetAired
        sort: [TIME]
      ) {
        id
        airingAt
        timeUntilAiring
        episode
        media {
          id
          type
          isAdult
          title {
            english
            romaji
          }
          coverImage {
            extraLarge
            large
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
          format
          nextAiringEpisode {
            airingAt
            timeUntilAiring
            episode
          }
        }
      }
    }
  }
`;
