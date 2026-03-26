import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import { motion } from 'framer-motion';
import TopNav from '../../components/TopNav';

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterReconciled, setFilterReconciled] = useState('ALL'); // 'ALL', 'YES', 'NO'

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            let url = 'http://localhost:8000/admin/transactions/?limit=500';
            
            if (filterReconciled === 'YES') url += '&reconciled=true';
            if (filterReconciled === 'NO') url += '&reconciled=false';

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setTransactions(data.transactions || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [filterReconciled]);

    const handleReconcile = async (txId) => {
        if (!window.confirm("Mark this transaction as manually reconciled?")) return;

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`http://localhost:8000/admin/transactions/${txId}/reconcile`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchTransactions();
            else alert("Failed to reconcile");
        } catch (err) {
            console.error(err);
        }
    };

    const displayData = transactions.filter(tx => 
        tx.id.includes(searchTerm) || 
        (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const columns = [
        { header: 'TXN ID', cell: (row) => row.id.split('-')[0] + '...' },
        { header: 'Date', cell: (row) => new Date(row.timestamp).toLocaleString() },
        { header: 'Type', cell: (row) => row.type },
        { header: 'Amount (₹)', cell: (row) => row.amount },
        { header: 'Description', cell: (row) => row.description || 'N/A' },
        { header: 'Reconciled', cell: (row) => row.reconciled ? '✅ Yes' : '❌ No' },
        { header: 'Action', cell: (row) => (
            !row.reconciled && 
            <button className="admin-btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleReconcile(row.id)}>
                Reconcile
            </button>
        )}
    ];

    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} style={{ padding: '3rem 4rem', boxSizing: 'border-box', maxWidth: '100vw' }}>
            <TopNav isAdmin={true} />
            <h2 style={{ marginBottom: '2rem', color: '#0ff' }}>Transaction Ledger</h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <select 
                    style={selectStyle} 
                    value={filterReconciled} 
                    onChange={(e) => setFilterReconciled(e.target.value)}
                >
                    <option value="ALL">All Transactions</option>
                    <option value="NO">Pending Reconciliation</option>
                    <option value="YES">Reconciled</option>
                </select>
            </div>

            {loading ? (
                <p>Loading transactions...</p>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={displayData}
                    onSearch={setSearchTerm}
                    searchPlaceholder="Search ID or description..."
                />
            )}
        </motion.div>
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

export default AdminTransactions;
