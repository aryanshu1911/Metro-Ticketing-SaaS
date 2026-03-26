import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import MfaModal from '../components/MfaModal';
import { motion } from 'framer-motion';
import TopNav from '../../components/TopNav';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null); // { type: 'delete'|'ban', userId: string }
    const [actionError, setActionError] = useState('');

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('http://localhost:8000/admin/users/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setUsers(data.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const triggerAction = (type, userId) => {
        setModalAction({ type, userId });
        setActionError('');
        setIsModalOpen(true);
    };

    const handleConfirmAction = async (mfaToken) => {
        if (!mfaToken) {
            setActionError('MFA Token is required');
            return;
        }

        const token = localStorage.getItem('adminToken');
        const { type, userId } = modalAction;
        
        let url = `http://localhost:8000/admin/users/${userId}`;
        let method = 'DELETE'; // soft delete

        try {
            const res = await fetch(url, {
                method,
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'x-mfa-token': mfaToken
                }
            });
            
            if (res.ok) {
                setIsModalOpen(false);
                fetchUsers(); // Refresh list
            } else {
                const data = await res.json();
                setActionError(data.detail || 'Action failed');
            }
        } catch (err) {
            setActionError('Server connection error');
        }
    };

    const filteredUsers = users.filter(u => 
        (u.phone || '').includes(searchTerm) || (u.email || '').includes(searchTerm)
    );

    const columns = [
        { header: 'ID', cell: (row) => row.id.split('-')[0] + '...' },
        { header: 'Phone', cell: (row) => row.phone },
        { header: 'Email', cell: (row) => row.email },
        { header: 'Wallet (₹)', cell: (row) => row.wallet_balance },
        { header: 'Joined', cell: (row) => new Date(row.created_at).toLocaleDateString() },
        { header: 'Actions', cell: (row) => (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="admin-btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => triggerAction('delete', row.id)}>Delete</button>
            </div>
        )}
    ];

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ padding: '3rem 4rem', boxSizing: 'border-box', maxWidth: '100vw' }}>
            <TopNav isAdmin={true} />
            <h2 style={{ marginBottom: '1.5rem', color: '#0ff' }}>Manage Users</h2>
            
            {loading ? (
                <p>Loading users...</p>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredUsers} 
                    onSearch={setSearchTerm} 
                    searchPlaceholder="Search phone or email..."
                />
            )}

            <MfaModal 
                isOpen={isModalOpen}
                title="Confirm Account Deletion"
                message="This is a critical action. Please authenticate with your mPIN."
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmAction}
            />
            
            {actionError && (
                <div style={{ color: 'red', marginTop: '1rem', background: 'rgba(255,0,0,0.1)', padding: '1rem', borderRadius: '8px' }}>
                    {actionError}
                </div>
            )}
        </motion.div>
    );
};

export default AdminUsers;
