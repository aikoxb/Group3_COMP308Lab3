// client/shell-app/vite.config.js
// Configures Vite and Module Federation for the Shell App host
// It loads the Projects App and AI Review App as remote frontend modules

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
      react(),
      federation({
          name: "shell_app", // host app name

          // Remote frontend apps loaded by the host
          remotes: {
              projects_app: "http://localhost:5174/assets/remoteEntry.js",
              ai_review_app: "http://localhost:5175/assets/remoteEntry.js",
          },

          // Shared packages used across apps
          shared: ["react", "react-dom", "react-router-dom", "@apollo/client", "graphql"],
      }),
  ],
  server: {
      port: 5173,
  },
  build: {
      target: "esnext",
  },
});