import { gql } from 'graphql-tag';

export const DATA_QUERY = gql`
  query AnimeDetails($id: Int) {
    Media(id: $id) {
      title {
        english
        romaji
      }
      startDate {
        year
        month
      }
      trailer {
        id
        site
        thumbnail
      }
      characterPreview: characters(sort: [ROLE, RELEVANCE, ID]) {
        edges {
          role
          name
          node {
            id
            name {
              full
            }
            image {
              medium
            }
          }
        }
      }
      status
      description
      episodes
      bannerImage
      averageScore
      nextAiringEpisode {
        airingAt
        timeUntilAiring
        episode
      }
    }
  }
`;
