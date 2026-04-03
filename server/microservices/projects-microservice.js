// server/microservices/projects-microservice.js
import 'dotenv/config';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSubgraphSchema } from '@apollo/subgraph';
import gql from 'graphql-tag';
import cors from 'cors';
import mongoose from 'mongoose';

const PORT = process.env.PROJECTS_PORT || 4002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/devpilot';

await mongoose.connect(MONGO_URI);
console.log('Projects service connected to MongoDB');

// ─── Mongoose Models ────────────────────────────────────────────────────────

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const featureRequestSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'open' },
  createdAt: { type: Date, default: Date.now },
});

const implementationDraftSchema = new mongoose.Schema({
  featureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeatureRequest', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, required: true },
  content: { type: String, required: true },
  version: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

const Project = mongoose.model('Project', projectSchema);
const FeatureRequest = mongoose.model('FeatureRequest', featureRequestSchema);
const ImplementationDraft = mongoose.model('ImplementationDraft', implementationDraftSchema);

// ─── GraphQL Schema ──────────────────────────────────────────────────────────

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  type User @key(fields: "id", resolvable: false) {
    id: ID!
  }

  type Project @key(fields: "id") {
    id: ID!
    title: String!
    description: String!
    owner: User!
    createdAt: String
    updatedAt: String
  }

  type FeatureRequest @key(fields: "id") {
    id: ID!
    projectId: ID!
    title: String!
    description: String!
    status: String
    createdAt: String
  }

  type ImplementationDraft @key(fields: "id") {
    id: ID!
    featureId: ID!
    author: User!
    content: String!
    version: Int
    createdAt: String
  }

  type Query {
    projectsByUser: [Project!]!
    project(id: ID!): Project
    featureRequests(projectId: ID!): [FeatureRequest!]!
    draftsByFeature(featureId: ID!): [ImplementationDraft!]!
  }

  type Mutation {
    createProject(title: String!, description: String!): Project!
    addFeatureRequest(projectId: ID!, title: String!, description: String!, status: String): FeatureRequest!
    submitDraft(featureId: ID!, content: String!, version: Int): ImplementationDraft!
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function requireAuth(userId) {
  if (!userId) throw new Error('Not authenticated');
}

function serializeProject(p) {
  return {
    id: p._id.toString(),
    title: p.title,
    description: p.description,
    owner: { id: p.owner.toString() },
    createdAt: p.createdAt?.toISOString() || null,
    updatedAt: p.updatedAt?.toISOString() || null,
  };
}

function serializeFeature(f) {
  return {
    id: f._id.toString(),
    projectId: f.projectId.toString(),
    title: f.title,
    description: f.description,
    status: f.status,
    createdAt: f.createdAt?.toISOString() || null,
  };
}

function serializeDraft(d) {
  return {
    id: d._id.toString(),
    featureId: d.featureId.toString(),
    author: { id: d.author.toString() },
    content: d.content,
    version: d.version ?? null,
    createdAt: d.createdAt?.toISOString() || null,
  };
}

// ─── Resolvers ────────────────────────────────────────────────────────────────

const resolvers = {
  Query: {
    projectsByUser: async (_, __, { userId }) => {
      requireAuth(userId);
      const projects = await Project.find({ owner: userId });
      return projects.map(serializeProject);
    },

    project: async (_, { id }, { userId }) => {
      requireAuth(userId);
      const p = await Project.findById(id);
      return p ? serializeProject(p) : null;
    },

    featureRequests: async (_, { projectId }, { userId }) => {
      requireAuth(userId);
      const features = await FeatureRequest.find({ projectId });
      return features.map(serializeFeature);
    },

    draftsByFeature: async (_, { featureId }, { userId }) => {
      requireAuth(userId);
      const drafts = await ImplementationDraft.find({ featureId });
      return drafts.map(serializeDraft);
    },
  },

  Mutation: {
    createProject: async (_, { title, description }, { userId }) => {
      requireAuth(userId);
      const project = await Project.create({ title, description, owner: userId });
      return serializeProject(project);
    },

    addFeatureRequest: async (_, { projectId, title, description, status }, { userId }) => {
      requireAuth(userId);

      // Check whether the incoming project ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid project ID");
      }

      // Find the project that the feature request belongs to
      const project = await Project.findById(projectId);

      // Stop if the selected project does not exist in the database
      if (!project) {
        throw new Error("Project not found");
      }

      // Create the new feature request and link it to the selected project
      const feature = await FeatureRequest.create({
        projectId,
        title,
        description,
        status: status || "open",
      });

      // Return the saved feature request in GraphQL format
      return serializeFeature(feature);
    },

    submitDraft: async (_, { featureId, content, version }, { userId }) => {
      requireAuth(userId);
      const feature = await FeatureRequest.findById(featureId);
      if (!feature) throw new Error('Feature request not found');
      const draft = await ImplementationDraft.create({
        featureId,
        author: userId,
        content,
        version: version ?? undefined,
      });
      return serializeDraft(draft);
    },
  },

  Project: {
    __resolveReference: async ({ id }) => {
      const p = await Project.findById(id);
      return p ? serializeProject(p) : null;
    },
  },

  FeatureRequest: {
    __resolveReference: async ({ id }) => {
      const f = await FeatureRequest.findById(id);
      return f ? serializeFeature(f) : null;
    },
  },

  ImplementationDraft: {
    __resolveReference: async ({ id }) => {
      const d = await ImplementationDraft.findById(id);
      return d ? serializeDraft(d) : null;
    },
  },
};

// ─── Server ───────────────────────────────────────────────────────────────────

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});
await server.start();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(
  '/graphql',
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({
      userId: req.headers['user-id'] || null,
    }),
  })
);

app.listen(PORT, () => {
  console.log(`Projects service running at http://localhost:${PORT}/graphql`);
});
