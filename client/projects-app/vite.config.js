// client/projects-app/vite.config.js
// Configures Vite and Module Federation for the Projects App remote
// Exposes the Projects App so the Shell host can load it dynamically

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
    plugins: [
        react(),
        federation({
            name: "projects_app", // Remote app name
            filename: "remoteEntry.js", // Entry file for the remote
            exposes: {
                "./App": "./src/App.jsx",
            },

            // Shared packages used across apps
            shared: ["react", "react-dom", "react-router-dom", "@apollo/client", "graphql"],
        }),
    ],
    server: {
        port: 5174,
    },
    build: {
        target: "esnext",
    },
});