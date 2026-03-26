import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import MfaModal from '../components/MfaModal';
import { motion } from 'framer-motion';
import TopNav from '../../components/TopNav';

const AdminRefunds = () => {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // '', 'pending', 'completed', 'failed'

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTxId, setSelectedTxId] = useState(null);
    const [actionError, setActionError] = useState('');

    const fetchRefunds = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            let url = 'http://localhost:8000/admin/refunds/';
            if (statusFilter) url += `?status=${statusFilter}`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setRefunds(data.refunds || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRefunds();
    }, [statusFilter]);

    const handleProcessRefund = (txId) => {
        setSelectedTxId(txId);
        setActionError('');
        setIsModalOpen(true);
    };

    const confirmRefund = async (mfaToken) => {
        if (!mfaToken) {
            setActionError('MFA Token is required');
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`http://localhost:8000/admin/refunds/${selectedTxId}/process`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'x-mfa-token': mfaToken
                }
            });
            
            if (res.ok) {
                setIsModalOpen(false);
                fetchRefunds();
            } else {
                const data = await res.json();
                setActionError(data.detail || 'Refund processing failed');
            }
        } catch (err) {
            setActionError('Server connection error');
        }
    };

    const displayData = refunds.filter(r => 
        r.transaction_id.includes(searchTerm) || 
        r.user_id.includes(searchTerm)
    );

    const getStatusStyle = (status) => {
        if(status === 'completed') return { color: '#4ade80', fontWeight: 'bold' };
        if(status === 'failed') return { color: '#f87171', fontWeight: 'bold' };
        return { color: '#fbbf24', fontWeight: 'bold' }; // pending
    };

    const columns = [
        { header: 'Refund ID', cell: (row) => row.id.split('-')[0] + '...' },
        { header: 'Txn ID', cell: (row) => row.transaction_id.split('-')[0] + '...' },
        { header: 'Amount (₹)', cell: (row) => row.amount },
        { header: 'Status', cell: (row) => <span style={getStatusStyle(row.status)}>{row.status.toUpperCase()}</span> },
        { header: 'Reason', cell: (row) => row.reason },
        { header: 'Requested At', cell: (row) => new Date(row.created_at).toLocaleString() },
        { header: 'Action', cell: (row) => (
            row.status === 'pending' && 
            <button className="admin-btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleProcessRefund(row.transaction_id)}>
                Process
            </button>
        )}
    ];

    return (
        <div style={{ padding: '3rem 4rem', boxSizing: 'border-box', maxWidth: '100vw' }}>
            <TopNav isAdmin={true} />
            <h2 style={{ marginBottom: '1.5rem', color: '#0ff' }}>Refund Management</h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <select 
                    style={selectStyle} 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            {loading ? (
                <p>Loading refunds...</p>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={displayData}
                    onSearch={setSearchTerm}
                    searchPlaceholder="Search Transaction or User ID..."
                />
            )}

            <MfaModal 
                isOpen={isModalOpen}
                title="Process Manual Refund"
                message="Are you sure you want to process this refund? It will revert the payment back to the user's wallet."
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmRefund}
            />

            {actionError && (
                <div style={{ color: 'red', marginTop: '1rem', background: 'rgba(255,0,0,0.1)', padding: '1rem', borderRadius: '8px' }}>
                    {actionError}
                </div>
            )}
        </div>
    );
};

const selectStyle = {
    padding: '0.8rem',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    outline: 'none'
};

export default AdminRefunds;
