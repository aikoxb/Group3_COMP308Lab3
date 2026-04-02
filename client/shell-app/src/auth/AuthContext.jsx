// client/shell-app/src/auth/AuthContext.jsx
// Provides authentication context and hooks for the Shell App
// Manages user state, login, registration, and logout using GraphQL API

import { createContext, useContext } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

const CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      id
      username
      email
      role
      createdAt
    }
  }
`;

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      username
      email
      role
    }
  }
`;

const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      id
      username
      email
      role
    }
  }
`;

const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data, loading, refetch } = useQuery(CURRENT_USER, {
    fetchPolicy: 'network-only',
  });
  const [loginMutation] = useMutation(LOGIN);
  const [registerMutation] = useMutation(REGISTER);
  const [logoutMutation] = useMutation(LOGOUT);

  const user = data?.currentUser || null;

  const login = async (username, password) => {
    const { data } = await loginMutation({ variables: { username, password } });
    await refetch();
    return data.login;
  };

  const register = async (username, email, password) => {
    const { data } = await registerMutation({ variables: { username, email, password } });
    await refetch();
    return data.register;
  };

  const logout = async () => {
    await logoutMutation();
    await refetch();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
