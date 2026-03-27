import 'dotenv/config';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSubgraphSchema } from '@apollo/subgraph';
import gql from 'graphql-tag';
import cors from 'cors';

const PORT = process.env.PROJECTS_PORT || 4002;

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  type Query {
    _projectsPlaceholder: String
  }
`;

const resolvers = {
  Query: {
    _projectsPlaceholder: () => 'Projects service placeholder',
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});
await server.start();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use('/graphql', express.json(), expressMiddleware(server));

app.listen(PORT, () => {
  console.log(`Projects service running at http://localhost:${PORT}/graphql`);
});
