import axios, { AxiosResponse } from 'axios';
import { print } from 'graphql';
import { DocumentNode } from 'graphql';

interface GraphQLResponse<T> {
  data: T;
}

export const graphqlRequest = async <T>(
  query: DocumentNode,
  variables?: Record<string, any>
): Promise<T> => {
  const response: AxiosResponse<GraphQLResponse<T>> = await axios.post(
    'https://graphql.anilist.co',
    {
      query: print(query),
      variables,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  );

  if (response.data.data) {
    return response.data.data;
  } else {
    throw new Error('GraphQL request failed');
  }
};
