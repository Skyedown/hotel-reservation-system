import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getAdminToken } from './utils';

const getGraphQLURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.peterlehocky.site/graphql';
  }
  return process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';
};

const httpLink = createHttpLink({
  uri: getGraphQLURL(),
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication token using our utility function (handles expiration)
  const token = getAdminToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});