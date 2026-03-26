import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import MfaModal from '../components/MfaModal';
import { motion } from 'framer-motion';
import TopNav from '../../components/TopNav';

const AdminStations = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null); // { type: 'delete', stationId: string }
    
    // Form State (Simplified inline form for MVP)
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', line: 'Line 1', order_index: 0, is_interchange: false });

    const fetchStations = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            // Assuming GET /admin/stations exists, fallback to public /stations if not secured
            const res = await fetch('http://localhost:8000/stations/'); 
            const data = await res.json();
            if (res.ok) setStations(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('http://localhost:8000/admin/stations/', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowForm(false);
                setFormData({ name: '', line: 'Line 1', order_index: 0, is_interchange: false });
                fetchStations();
            } else {
                alert("Failed to save station");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (mfaToken) => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`http://localhost:8000/admin/stations/${modalAction.stationId}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'x-mfa-token': mfaToken
                }
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchStations();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = stations.filter(s => 
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.line || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { header: 'Station Name', cell: (row) => row.name },
        { header: 'Line', cell: (row) => row.line },
        { header: 'Position', cell: (row) => row.order_index },
        { header: 'Type', cell: (row) => row.is_interchange ? '🔄 Interchange' : '🚉 Stop' },
        { header: 'Actions', cell: (row) => (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                    className="admin-btn btn-danger" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => { setModalAction({ type: 'delete', stationId: row.id }); setIsModalOpen(true); }}
                >
                    Delete
                </button>
            </div>
        )}
    ];

    return (
        <div style={{ padding: '3rem 4rem', boxSizing: 'border-box', maxWidth: '100vw' }}>
            <TopNav isAdmin={true} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#0ff', margin: 0 }}>Network Stations</h2>
                <button className="admin-btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Add Station'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSave} style={formStyle}>
                    <input type="text" placeholder="Station Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} required />
                    <input type="text" placeholder="Line (e.g., Blue, Red)" value={formData.line} onChange={e => setFormData({...formData, line: e.target.value})} style={inputStyle} required />
                    <input type="number" placeholder="Order Index" value={formData.order_index} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value)})} style={inputStyle} required />
                    <label style={{ color: '#aaa', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.is_interchange} onChange={e => setFormData({...formData, is_interchange: e.target.checked})} />
                        Interchange Station
                    </label>
                    <button type="submit" className="admin-btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Save Station</button>
                </form>
            )}

            {loading ? <p>Loading...</p> : (
                <DataTable 
                    columns={columns} 
                    data={filtered}
                    onSearch={setSearchTerm}
                    searchPlaceholder="Search station or line..."
                />
            )}

            <MfaModal 
                isOpen={isModalOpen}
                title="Confirm Deletion"
                message="Deleting a station can affect active routes and tickets. Require mPIN authorization."
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
};

const formStyle = {
    display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '1.5rem', alignItems: 'center'
};
const inputStyle = {
    padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff'
};

export default AdminStations;
