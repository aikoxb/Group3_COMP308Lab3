import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/devpilot';
const PORT = process.env.GATEWAY_PORT || 4000;

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    if (context.userId) {
      request.http.headers.set('user-id', context.userId);
    }
  }
}

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'auth', url: process.env.AUTH_URL || 'http://localhost:4001/graphql' },
      { name: 'projects', url: process.env.PROJECTS_URL || 'http://localhost:4002/graphql' },
    ],
  }),
  buildService({ url }) {
    return new AuthenticatedDataSource({ url });
  },
});

const sessionPlugin = {
  async requestDidStart() {
    return {
      async willSendResponse({ contextValue, response }) {
        const data = response.body?.singleResult?.data;
        if (!data) return;

        if (data.login?.id) {
          contextValue.req.session.userId = data.login.id;
        }
        if (data.register?.id) {
          contextValue.req.session.userId = data.register.id;
        }
        if (data.logout === true) {
          await new Promise((resolve, reject) => {
            contextValue.req.session.destroy((err) => {
              if (err) reject(err);
              contextValue.res.clearCookie('connect.sid');
              resolve();
            });
          });
        }
      },
    };
  },
};

const server = new ApolloServer({
  gateway,
  plugins: [sessionPlugin],
});
await server.start();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'devpilot-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'lax',
  },
}));

app.use('/graphql', express.json(), expressMiddleware(server, {
  context: async ({ req, res }) => ({
    userId: req.session?.userId || null,
    req,
    res,
  }),
}));

app.listen(PORT, () => {
  console.log(`Gateway running at http://localhost:${PORT}/graphql`);
});
