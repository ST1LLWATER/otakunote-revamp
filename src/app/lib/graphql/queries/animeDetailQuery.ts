import { gql } from 'graphql-tag';

export const ANIME_DETAIL_QUERY = gql`
  query AnimeDetail($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
        native
        userPreferred
      }
      type
      format
      status
      description(asHtml: true)
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      season
      seasonYear
      episodes
      duration
      countryOfOrigin
      isLicensed
      source
      hashtag
      trailer {
        id
        site
        thumbnail
      }
      updatedAt
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      genres
      synonyms
      averageScore
      meanScore
      popularity
      isLocked
      trending
      favourites
      isFavourite
      isAdult
      tags {
        id
        name
        description
        category
        rank
        isGeneralSpoiler
        isMediaSpoiler
        isAdult
      }
      relations {
        edges {
          id
          relationType(version: 2)
          node {
            id
            title {
              romaji
              english
              native
              userPreferred
            }
            format
            type
            status
            bannerImage
            coverImage {
              large
              medium
            }
            episodes
            chapters
            averageScore
            popularity
            startDate {
              year
            }
          }
        }
      }
      characters(sort: [ROLE, RELEVANCE, ID], perPage: 25, page: 1) {
        edges {
          id
          role
          name
          voiceActorRoles(sort: [RELEVANCE, ID]) {
            roleNotes
            dubGroup
            voiceActor {
              id
              name {
                full
                native
                userPreferred
              }
              image {
                large
                medium
              }
              languageV2
            }
          }
          node {
            id
            name {
              first
              middle
              last
              full
              native
              userPreferred
              alternative
            }
            image {
              large
              medium
            }
            gender
            age
            dateOfBirth {
              year
              month
              day
            }
            description(asHtml: true)
            isFavourite
            favourites
          }
        }
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
      }
      staff(sort: [RELEVANCE, ID], perPage: 25, page: 1) {
        edges {
          id
          role
          node {
            id
            name {
              full
              native
              userPreferred
            }
            image {
              large
              medium
            }
            languageV2
            primaryOccupations
            isFavourite
          }
        }
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
      }
      studios(sort: [NAME]) {
        edges {
          isMain
          node {
            id
            name
            isAnimationStudio
            siteUrl
            isFavourite
            favourites
          }
        }
      }
      nextAiringEpisode {
        id
        airingAt
        timeUntilAiring
        episode
        mediaId
      }
      airingSchedule(notYetAired: false, perPage: 25, page: 1) {
        nodes {
          id
          airingAt
          timeUntilAiring
          episode
        }
        pageInfo {
          total
          hasNextPage
        }
      }
      trends(sort: [DATE_DESC], releasing: true, perPage: 10) {
        nodes {
          date
          trending
          averageScore
          popularity
          inProgress
          releasing
          episode
        }
      }
      externalLinks {
        id
        url
        site
        siteId
        type
        language
        color
        icon
        notes
        isDisabled
      }
      streamingEpisodes {
        title
        thumbnail
        url
        site
      }
      rankings {
        id
        rank
        type
        format
        year
        season
        allTime
        context
      }
      mediaListEntry {
        id
        userId
        mediaId
        status
        score
        progress
        progressVolumes
        repeat
        priority
        private
        notes
        hiddenFromStatusLists
        advancedScores
        startedAt {
          year
          month
          day
        }
        completedAt {
          year
          month
          day
        }
        updatedAt
        createdAt
      }
      reviews(sort: [RATING_DESC], perPage: 5, page: 1) {
        edges {
          node {
            id
            userId
            mediaId
            summary
            body(asHtml: true)
            rating
            ratingAmount
            userRating
            score
            private
            siteUrl
            createdAt
            updatedAt
            user {
              id
              name
              avatar {
                large
                medium
              }
            }
          }
        }
        pageInfo {
          total
          hasNextPage
        }
      }
      recommendations(sort: [RATING_DESC], perPage: 10, page: 1) {
        edges {
          node {
            id
            rating
            userRating
            mediaRecommendation {
              id
              title {
                romaji
                english
                native
                userPreferred
              }
              format
              type
              status
              coverImage {
                large
                medium
              }
              averageScore
              episodes
            }
            user {
              id
              name
              avatar {
                large
              }
            }
          }
        }
        pageInfo {
          total
          hasNextPage
        }
      }
      stats {
        scoreDistribution {
          score
          amount
        }
        statusDistribution {
          status
          amount
        }
      }
    }
  }
`;
