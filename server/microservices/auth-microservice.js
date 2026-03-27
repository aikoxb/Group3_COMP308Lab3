import 'dotenv/config';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSubgraphSchema } from '@apollo/subgraph';
import gql from 'graphql-tag';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import cors from 'cors';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/devpilot';
const PORT = process.env.AUTH_PORT || 4001;

await mongoose.connect(MONGO_URI);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, required: true, default: 'developer' },
  createdAt:{ type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  type User @key(fields: "id") {
    id: ID!
    username: String!
    email: String!
    role: String!
    createdAt: String
  }

  type Query {
    currentUser: User
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): User
    login(username: String!, password: String!): User
    logout: Boolean
  }
`;

const resolvers = {
  User: {
    __resolveReference: async (ref) => {
      const user = await User.findById(ref.id);
      if (!user) return null;
      return { id: user._id.toString(), username: user.username, email: user.email, role: user.role, createdAt: user.createdAt?.toISOString() };
    },
  },
  Query: {
    currentUser: async (_, __, { userId }) => {
      if (!userId) return null;
      const user = await User.findById(userId);
      if (!user) return null;
      return { id: user._id.toString(), username: user.username, email: user.email, role: user.role, createdAt: user.createdAt?.toISOString() };
    },
  },
  Mutation: {
    register: async (_, { username, email, password }) => {
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashed });
      return { id: user._id.toString(), username: user.username, email: user.email, role: user.role, createdAt: user.createdAt?.toISOString() };
    },
    login: async (_, { username, password }) => {
      const user = await User.findOne({ username });
      if (!user) throw new Error('Invalid credentials');
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Invalid credentials');
      return { id: user._id.toString(), username: user.username, email: user.email, role: user.role, createdAt: user.createdAt?.toISOString() };
    },
    logout: () => true,
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});
await server.start();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use('/graphql', express.json(), expressMiddleware(server, {
  context: async ({ req }) => ({
    userId: req.headers['user-id'] || null,
  }),
}));

app.listen(PORT, () => {
  console.log(`Auth service running at http://localhost:${PORT}/graphql`);
});
