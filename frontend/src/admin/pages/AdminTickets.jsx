import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import MfaModal from '../components/MfaModal';
import { motion } from 'framer-motion';
import TopNav from '../../components/TopNav';

const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [actionError, setActionError] = useState('');

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('http://localhost:8000/admin/tickets/?limit=500', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setTickets(data.tickets || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleRevoke = (ticketId) => {
        setSelectedTicketId(ticketId);
        setActionError('');
        setIsModalOpen(true);
    };

    const confirmRevoke = async (mfaToken) => {
        if (!mfaToken) {
            setActionError('MFA Token is required');
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`http://localhost:8000/admin/tickets/${selectedTicketId}/revoke`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'x-mfa-token': mfaToken
                }
            });
            
            if (res.ok) {
                setIsModalOpen(false);
                fetchTickets(); // Refresh list to catch new status
            } else {
                const data = await res.json();
                setActionError(data.detail || 'Failed to revoke ticket');
            }
        } catch (err) {
            setActionError('Server connection error');
        }
    };

    const filteredTickets = tickets.filter(t => 
        t.id.includes(searchTerm) || 
        t.user_phone.includes(searchTerm) || 
        t.origin.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status) => {
        if(status === 'active') return { color: '#4ade80', fontWeight: 'bold' };
        if(status === 'revoked') return { color: '#f87171', fontWeight: 'bold' };
        return { color: '#fbbf24', fontWeight: 'bold' }; // used
    };

    const columns = [
        { header: 'Pass ID', cell: (row) => row.id.split('-')[0] + '...' },
        { header: 'User Phone', cell: (row) => row.user_phone },
        { header: 'Route', cell: (row) => `${row.origin} → ${row.destination}` },
        { header: 'Fare (₹)', cell: (row) => row.fare },
        { header: 'Status', cell: (row) => <span style={getStatusStyle(row.status)}>{row.status.toUpperCase()}</span> },
        { header: 'Created', cell: (row) => new Date(row.created_at).toLocaleString() },
        { header: 'Action', cell: (row) => (
            row.status === 'active' && 
            <button className="admin-btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleRevoke(row.id)}>
                Revoke Pass
            </button>
        )}
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ padding: '3rem 4rem', boxSizing: 'border-box', maxWidth: '100vw' }}>
            <TopNav isAdmin={true} />
            <h2 style={{ marginBottom: '1.5rem', color: '#0ff' }}>Active Network Passes</h2>
            
            {loading ? (
                <p>Loading passes...</p>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredTickets} 
                    onSearch={setSearchTerm} 
                    searchPlaceholder="Search phone, route, or Pass ID..."
                />
            )}

            <MfaModal 
                isOpen={isModalOpen}
                title="Revoke Ticket Pass"
                message="Are you sure you want to abruptly invalidate this active QR pass? This action requires mPIN verification."
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmRevoke}
            />
            
            {actionError && (
                <div style={{ color: 'red', marginTop: '1rem', background: 'rgba(255,0,0,0.1)', padding: '1rem', borderRadius: '8px' }}>
                    {actionError}
                </div>
            )}
        </motion.div>
    );
};

export default AdminTickets;
