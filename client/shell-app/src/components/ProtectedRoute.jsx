// client/shell-app/src/components/ProtectedRoute.jsx
// Protects routes by checking if a user is authenticated and redirects to login if not
// Used in App.jsx to wrap ProjectsRemote and AIReviewRemote, depends on AuthContext.jsx for user state

import { Navigate } from "react-router-dom";    // Import Navigate to redirect users to another route
import { useAuth } from "../auth/AuthContext";  // Import custom hook to access authentication state

// Component - protects routes that require a logged-in user
function ProtectedRoute({ children }) {
    
    // Get the current user and loading state from AuthContext
    const { user, loading } = useAuth();

    // If authentication is still loading, show a loading message
    if (loading) {
        return <p>Loading...</p>;
    }

    // If there is no logged-in user, redirect to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children; // If user is logged in, render the protected content
}

export default ProtectedRoute;