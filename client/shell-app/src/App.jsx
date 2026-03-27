// client/shell-app/src/App.jsx
// Controls the routing and main layout for the Shell App host
// Connects the login flow, protected routes, and remote frontend apps

import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProjectsRemote from "./remotes/ProjectsRemote";
import AIReviewRemote from "./remotes/AIReviewRemote";
import { useAuth } from './auth/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route
          path="/projects/*"
          element={
            <ProtectedRoute>
              <ProjectsRemote />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-review/*"
          element={
            <ProtectedRoute>
              <div className="container mt-4">
                <h2>AI Review</h2>
                <p>AI Review module will be loaded here.</p>
              </div>
              <AIReviewRemote />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
