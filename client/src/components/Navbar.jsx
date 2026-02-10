/**
 * Navbar — Top navigation bar with links and logout button.
 * Only rendered when the user is authenticated.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span className="navbar-logo">⚡</span>
                <span className="navbar-title">AgentFlow</span>
            </div>

            <div className="navbar-links">
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📊</span> Dashboard
                </NavLink>
                <NavLink to="/agents" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">👥</span> Agents
                </NavLink>
                <NavLink to="/upload" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📁</span> Upload List
                </NavLink>
            </div>

            <div className="navbar-user">
                <span className="user-email">{user?.email}</span>
                <button onClick={handleLogout} className="btn btn-logout" id="logout-btn">
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
