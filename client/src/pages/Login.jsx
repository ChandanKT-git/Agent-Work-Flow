/**
 * Login Page — Provides email + password form for admin authentication.
 * On success, stores JWT and redirects to dashboard.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    /** Update form field state */
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /** Submit login credentials */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!formData.email.trim()) {
            return toast.error('Please enter your email');
        }
        if (!formData.password.trim()) {
            return toast.error('Please enter your password');
        }

        setLoading(true);
        try {
            const res = await axios.post('/api/auth/login', formData);
            login(res.data.token, res.data.user);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Decorative glow */}
                <div className="login-glow"></div>

                <div className="login-header">
                    <span className="login-logo">⚡</span>
                    <h1>AgentFlow</h1>
                    <p>Sign in to your admin account</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form" id="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="admin@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="login-btn">
                        {loading ? (
                            <span className="btn-loading">
                                <span className="spinner"></span> Signing in...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Default credentials: <strong>admin@example.com</strong> / <strong>admin123</strong></p>
                </div>
            </div>
        </div>
    );
}

export default Login;
