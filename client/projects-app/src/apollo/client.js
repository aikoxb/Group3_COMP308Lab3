// client/projects-app/src/apollo/client.js
// Creates the Apollo Client used by the Projects App in standalone mode
// Connects the Projects App to the gateway so Apollo hooks can access GraphQL data

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
    link: new HttpLink({
        uri: "http://localhost:4000/graphql",
        credentials: "include",
    }),
    cache: new InMemoryCache(),
});

export default client;