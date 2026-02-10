/**
 * ProtectedRoute — Wrapper component that redirects unauthenticated
 * users to the login page. Uses React Router's <Outlet />.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
    const { token } = useAuth();

    // If not authenticated, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Render nested routes
    return <Outlet />;
}

export default ProtectedRoute;
