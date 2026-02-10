/**
 * Dashboard Page — Overview page shown after login.
 * Displays summary stats: total agents, total distributed items.
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Dashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState({ agents: 0, items: 0 });
    const [loading, setLoading] = useState(true);

    /** Fetch summary stats on mount */
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const [agentsRes, listsRes] = await Promise.all([
                    axios.get('/api/agents', { headers }),
                    axios.get('/api/lists', { headers }),
                ]);
                setStats({
                    agents: agentsRes.data.length,
                    items: listsRes.data.totalItems || 0,
                });
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [token]);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p className="page-subtitle">Welcome to AgentFlow — manage your agents and distribute tasks</p>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner-lg"></div>
                    <p>Loading dashboard...</p>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card stat-card-purple">
                            <div className="stat-icon">👥</div>
                            <div className="stat-info">
                                <h3>{stats.agents}</h3>
                                <p>Total Agents</p>
                            </div>
                        </div>
                        <div className="stat-card stat-card-blue">
                            <div className="stat-icon">📋</div>
                            <div className="stat-info">
                                <h3>{stats.items}</h3>
                                <p>Distributed Items</p>
                            </div>
                        </div>
                        <div className="stat-card stat-card-green">
                            <div className="stat-icon">📊</div>
                            <div className="stat-info">
                                <h3>{stats.agents > 0 ? Math.ceil(stats.items / stats.agents) : 0}</h3>
                                <p>Avg Items/Agent</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="section">
                        <h2 className="section-title">Quick Actions</h2>
                        <div className="actions-grid">
                            <Link to="/agents" className="action-card" id="action-agents">
                                <span className="action-icon">👥</span>
                                <h3>Manage Agents</h3>
                                <p>Add, edit, or remove agents from the system</p>
                            </Link>
                            <Link to="/upload" className="action-card" id="action-upload">
                                <span className="action-icon">📁</span>
                                <h3>Upload & Distribute</h3>
                                <p>Upload a CSV/XLSX file and distribute items among agents</p>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Dashboard;
