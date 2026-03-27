// client/shell-app/src/main.jsx
// Entry point for the Shell App host
// Wraps the app with BrowserRouter, ApolloProvider, and AuthProvider

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import client from './apollo/client';
import { AuthProvider } from './auth/AuthContext';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ApolloProvider client={client}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ApolloProvider>
    </BrowserRouter>
  </StrictMode>,
);
