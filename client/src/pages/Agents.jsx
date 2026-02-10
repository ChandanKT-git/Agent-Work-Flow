/**
 * Agents Page — Add, view, edit, and delete agents.
 * Shows a form to create new agents and a table listing all agents.
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

/** Initial empty form state */
const INITIAL_FORM = {
    name: '',
    email: '',
    countryCode: '+91',
    mobile: '',
    password: '',
};

function Agents() {
    const { token } = useAuth();
    const [agents, setAgents] = useState([]);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    /** Auth header helper */
    const headers = { Authorization: `Bearer ${token}` };

    /** Fetch all agents from the API */
    const fetchAgents = useCallback(async () => {
        try {
            const res = await axios.get('/api/agents', { headers });
            setAgents(res.data);
        } catch (err) {
            toast.error('Failed to load agents');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    /** Update form field state */
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /** Submit form — create or update agent */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!formData.name.trim()) return toast.error('Name is required');
        if (!formData.email.trim()) return toast.error('Email is required');
        if (!formData.countryCode.trim()) return toast.error('Country code is required');
        if (!formData.mobile.trim()) return toast.error('Mobile number is required');
        if (!editingId && !formData.password.trim()) return toast.error('Password is required');

        setSubmitting(true);
        try {
            if (editingId) {
                // Update existing agent (only send password if changed)
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await axios.put(`/api/agents/${editingId}`, updateData, { headers });
                toast.success('Agent updated successfully');
            } else {
                // Create new agent
                await axios.post('/api/agents', formData, { headers });
                toast.success('Agent created successfully');
            }
            setFormData(INITIAL_FORM);
            setEditingId(null);
            setShowForm(false);
            fetchAgents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    /** Populate form with agent data for editing */
    const handleEdit = (agent) => {
        setFormData({
            name: agent.name,
            email: agent.email,
            countryCode: agent.countryCode || '+91',
            mobile: agent.mobile,
            password: '', // Don't prefill password
        });
        setEditingId(agent._id);
        setShowForm(true);
        // Scroll to top to show form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /** Delete an agent with confirmation */
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete agent "${name}"? This will also remove all their assigned items.`)) {
            return;
        }

        try {
            await axios.delete(`/api/agents/${id}`, { headers });
            toast.success('Agent deleted successfully');
            fetchAgents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete agent');
        }
    };

    /** Cancel editing and reset form */
    const handleCancel = () => {
        setFormData(INITIAL_FORM);
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Agents</h1>
                    <p className="page-subtitle">Manage your team of agents</p>
                </div>
                {!showForm && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                        id="add-agent-btn"
                    >
                        + Add Agent
                    </button>
                )}
            </div>

            {/* Add / Edit Agent Form */}
            {showForm && (
                <div className="card form-card">
                    <h2 className="card-title">{editingId ? '✏️ Edit Agent' : '➕ Add New Agent'}</h2>
                    <form onSubmit={handleSubmit} className="agent-form" id="agent-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="agent-email">Email Address</label>
                                <input
                                    type="email"
                                    id="agent-email"
                                    name="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group form-group-small">
                                <label htmlFor="countryCode">Code</label>
                                <input
                                    type="text"
                                    id="countryCode"
                                    name="countryCode"
                                    placeholder="+91"
                                    value={formData.countryCode}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="mobile">Mobile Number</label>
                                <input
                                    type="text"
                                    id="mobile"
                                    name="mobile"
                                    placeholder="9876543210"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="agent-password">
                                    Password {editingId && <span className="label-hint">(leave blank to keep current)</span>}
                                </label>
                                <input
                                    type="password"
                                    id="agent-password"
                                    name="password"
                                    placeholder={editingId ? '••••••' : 'Min 4 characters'}
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={submitting} id="save-agent-btn">
                                {submitting ? (
                                    <span className="btn-loading"><span className="spinner"></span> Saving...</span>
                                ) : editingId ? 'Update Agent' : 'Create Agent'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Agents Table */}
            {loading ? (
                <div className="loading-container">
                    <div className="spinner-lg"></div>
                    <p>Loading agents...</p>
                </div>
            ) : agents.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">👥</span>
                    <h3>No agents yet</h3>
                    <p>Click "Add Agent" to create your first agent</p>
                </div>
            ) : (
                <div className="card">
                    <div className="table-responsive">
                        <table className="table" id="agents-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agents.map((agent, index) => (
                                    <tr key={agent._id}>
                                        <td className="td-num">{index + 1}</td>
                                        <td className="td-name">{agent.name}</td>
                                        <td className="td-email">{agent.email}</td>
                                        <td className="td-mobile">{agent.countryCode} {agent.mobile}</td>
                                        <td className="td-date">{new Date(agent.createdAt).toLocaleDateString()}</td>
                                        <td className="td-actions">
                                            <button
                                                className="btn btn-sm btn-edit"
                                                onClick={() => handleEdit(agent)}
                                                title="Edit agent"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-sm btn-delete"
                                                onClick={() => handleDelete(agent._id, agent.name)}
                                                title="Delete agent"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Agents;
