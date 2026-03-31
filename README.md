# Group3_COMP308Lab3
Micro-frontends and GraphQL microservices project for COMP308 Lab 3.

Instructions 

1) Start MongoDB

2) Install dependencies

cd server
npm install
cd ..\client\shell-app
npm install

3) Start server services

npm run start:all

If you prefer to start individually:

npm run start:auth
npm run start:projects
npm run start:gateway

4) Start the Shell frontend

npm run dev 

Open the URL shown by Vite (usually http://localhost:5173) 

Project structure 
- `client/` — Vite React apps: shell and remotes.
- `server/` — Apollo Gateway and two microservices: Auth and Projects.

Authentication
- Auth microservice stores users (bcrypt) and exposes a GraphQL API.
- Gateway uses `express-session` + `connect-mongo`; successful login sets an HTTP-only session cookie and session data is saved to MongoDB.
- Gateway forwards session context (user-id) to subgraphs.

Completed for this lab milestone 
- Shell + remotes integrated and connected to the Gateway.
- Auth service with session-based auth and MongoDB-backed sessions.
- Projects service scaffolded and reachable via the Gateway.
- AI Review placeholder remote integrated in Shell.
- Frontend performs GraphQL operations through the Gateway.

Planned for final project
- Expand Projects API (create/update/delete projects, tasks, comments, file attachments)
- Implement AI Review features 
- Role-based access control (developers, reviewers, admins) 
- UI polish, tests, CI/CD and deployment configuration
