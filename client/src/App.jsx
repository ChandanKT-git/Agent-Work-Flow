/**
 * App.jsx — Route definitions and layout.
 * Includes protected routes that require authentication.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import UploadList from './pages/UploadList';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
    const { token } = useAuth();

    return (
        <>
            {/* Global toast notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1e293b',
                        color: '#f1f5f9',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                    },
                    success: { iconTheme: { primary: '#22c55e', secondary: '#f1f5f9' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
                }}
            />

            {/* Show Navbar only when authenticated */}
            {token && <Navbar />}

            <main className={token ? 'main-content' : ''}>
                <Routes>
                    {/* Public route */}
                    <Route
                        path="/login"
                        element={token ? <Navigate to="/dashboard" replace /> : <Login />}
                    />

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/agents" element={<Agents />} />
                        <Route path="/upload" element={<UploadList />} />
                    </Route>

                    {/* Default redirect */}
                    <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
                </Routes>
            </main>
        </>
    );
}

export default App;
