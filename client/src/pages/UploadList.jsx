/**
 * UploadList Page — Upload CSV/XLSX/XLS files and view distributed items per agent.
 * Includes drag-and-drop zone, file validation, and tabbed agent view.
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function UploadList() {
    const { token } = useAuth();
    const [distribution, setDistribution] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dragActive, setDragActive] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const headers = { Authorization: `Bearer ${token}` };

    /** Fetch existing distribution data */
    const fetchDistribution = useCallback(async () => {
        try {
            const res = await axios.get('/api/lists', { headers });
            setDistribution(res.data.distribution || []);
            setTotalItems(res.data.totalItems || 0);
        } catch (err) {
            console.error('Failed to fetch distribution:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchDistribution();
    }, [fetchDistribution]);

    /** Validate file type */
    const isValidFile = (f) => {
        const allowedTypes = ['.csv', '.xlsx', '.xls'];
        const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
        return allowedTypes.includes(ext);
    };

    /** Handle file selection via input */
    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            if (!isValidFile(selected)) {
                toast.error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.');
                return;
            }
            setFile(selected);
        }
    };

    /** Handle drag events */
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    /** Handle file drop */
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const dropped = e.dataTransfer.files[0];
        if (dropped) {
            if (!isValidFile(dropped)) {
                toast.error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.');
                return;
            }
            setFile(dropped);
        }
    };

    /** Upload the file to the backend */
    const handleUpload = async () => {
        if (!file) {
            return toast.error('Please select a file first');
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/api/lists/upload', formData, {
                headers: {
                    ...headers,
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success(res.data.message);

            // Show any warnings from parsing
            if (res.data.warnings) {
                res.data.warnings.forEach((w) => toast(w, { icon: '⚠️' }));
            }

            setFile(null);
            // Reset file input
            const fileInput = document.getElementById('file-input');
            if (fileInput) fileInput.value = '';

            fetchDistribution();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Upload & Distribute</h1>
                    <p className="page-subtitle">Upload a CSV/XLSX file to distribute items among agents</p>
                </div>
            </div>

            {/* Upload Section */}
            <div className="card upload-card">
                <h2 className="card-title">📁 Upload File</h2>
                <p className="upload-hint">
                    File must contain columns: <strong>FirstName</strong>, <strong>Phone</strong>, and optionally <strong>Notes</strong>
                </p>

                {/* Drag & Drop Zone */}
                <div
                    className={`drop-zone ${dragActive ? 'drop-zone-active' : ''} ${file ? 'drop-zone-ready' : ''}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input').click()}
                    id="drop-zone"
                >
                    {file ? (
                        <div className="drop-zone-file">
                            <span className="file-icon">📄</span>
                            <p className="file-name">{file.name}</p>
                            <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    ) : (
                        <div className="drop-zone-placeholder">
                            <span className="upload-icon">☁️</span>
                            <p>Drag & drop your file here, or <span className="browse-link">browse</span></p>
                            <p className="file-types">Supported: .csv, .xlsx, .xls</p>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    id="file-input"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />

                <div className="upload-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        id="upload-btn"
                    >
                        {uploading ? (
                            <span className="btn-loading"><span className="spinner"></span> Distributing...</span>
                        ) : (
                            '🚀 Upload & Distribute'
                        )}
                    </button>
                    {file && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setFile(null);
                                const fi = document.getElementById('file-input');
                                if (fi) fi.value = '';
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Distribution Results */}
            {loading ? (
                <div className="loading-container">
                    <div className="spinner-lg"></div>
                    <p>Loading distribution data...</p>
                </div>
            ) : distribution.length > 0 && totalItems > 0 ? (
                <div className="card distribution-card">
                    <div className="distribution-header">
                        <h2 className="card-title">📊 Distributed Lists</h2>
                        <span className="badge badge-purple">{totalItems} total items</span>
                    </div>

                    {/* Agent Tabs */}
                    <div className="tabs">
                        {distribution.map((d, i) => (
                            <button
                                key={d.agent._id}
                                className={`tab ${activeTab === i ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab(i)}
                            >
                                {d.agent.name}
                                <span className="tab-count">{d.itemCount}</span>
                            </button>
                        ))}
                    </div>

                    {/* Active Tab Content */}
                    {distribution[activeTab] && (
                        <div className="tab-content">
                            <div className="agent-info-bar">
                                <span>📧 {distribution[activeTab].agent.email}</span>
                                <span className="badge badge-green">{distribution[activeTab].itemCount} items</span>
                            </div>

                            {distribution[activeTab].items.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table" id="distribution-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>First Name</th>
                                                <th>Phone</th>
                                                <th>Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {distribution[activeTab].items.map((item, idx) => (
                                                <tr key={item._id}>
                                                    <td className="td-num">{idx + 1}</td>
                                                    <td>{item.firstName}</td>
                                                    <td>{item.phone}</td>
                                                    <td className="td-notes">{item.notes || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="no-items">No items assigned to this agent</p>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="empty-state">
                    <span className="empty-icon">📋</span>
                    <h3>No distributions yet</h3>
                    <p>Upload a CSV/XLSX file above to distribute items among your agents</p>
                </div>
            )}
        </div>
    );
}

export default UploadList;
