import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
