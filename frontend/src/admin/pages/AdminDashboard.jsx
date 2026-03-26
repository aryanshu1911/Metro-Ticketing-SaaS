import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import TopNav from '../../components/TopNav';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, txs: 0, refunds: 0 });
    const [feeds, setFeeds] = useState({ tickets: [], txs: [], users: [] });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('adminToken');
            if (!token) { navigate('/'); return; }
            
            const headers = { 'Authorization': `Bearer ${token}` };
            
            try {
                // Fetch high level stats
                const [uRes, tRes, rRes, tkRes] = await Promise.all([
                    fetch('http://localhost:8000/admin/users/?limit=100', { headers }),
                    fetch('http://localhost:8000/admin/transactions/?limit=5', { headers }),
                    fetch('http://localhost:8000/admin/refunds/?status=pending', { headers }),
                    fetch('http://localhost:8000/admin/tickets/?limit=5', { headers })
                ]);
                
                const uData = await uRes.json();
                const txData = await tRes.json();
                const rData = await rRes.json();
                const tkData = await tkRes.json();

                setStats({
                    users: uData.total || uData.users?.length || 0,
                    txs: txData.total || txData.transactions?.length || 0,
                    refunds: rData.refunds?.length || 0,
                    tickets: tkData.total || tkData.tickets?.length || 0
                });

                setFeeds({
                    tickets: tkData.tickets || [],
                    txs: txData.transactions || [],
                    users: Array.isArray(uData.users) ? uData.users.slice(0, 5) : []
                });
            } catch (err) {
                console.error("Dashboard fetch error", err);
            }
        };
        fetchData();
    }, [navigate]);
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ padding: '1rem 1rem' }}>
            <TopNav isAdmin={true} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--admin-accent)', margin: 0 }}>Command Center</h2>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={() => navigate('/admin/stations')} style={{ padding: ' 0 0.6rem', height: '40px', backgroundColor: 'var(--admin-accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px var(--admin-accent-hover)', boxSizing: 'border-box' }}>
                        MANAGE STATIONS
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <StatsCard title="Total Network Users" value={stats.users} />
                <StatsCard title="Pending Refunds" value={stats.refunds} />
                <StatsCard title="Tickets Booked" value={stats.tickets} subtext="Total tickets generated" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                <motion.div 
                    initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: 0.1 }}
                    style={feedContainerStyle}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--admin-text)' }}>Newest Users</h3>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/users'); }} style={{ color: 'var(--admin-accent)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}>VIEW ALL</a>
                    </div>
                    {feeds.users.map((u, i) => (
                        <div key={i} style={feedRowStyle}>
                            <span>{u.phone}</span>
                            <span style={{ color: '#aaa' }}>₹{u.wallet_balance}</span>
                        </div>
                    ))}
                    {feeds.users.length === 0 && <p style={{ color: '#888', fontSize: '0.85rem' }}>No recent users.</p>}
                </motion.div>

                <motion.div 
                    initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: 0.2 }}
                    style={feedContainerStyle}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--admin-text)' }}>Recent Ledger</h3>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/transactions'); }} style={{ color: 'var(--admin-accent)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}>VIEW ALL</a>
                    </div>
                    {feeds.txs.map((tx, i) => (
                        <div key={i} style={feedRowStyle}>
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>{tx.type} • {tx.id.split('-')[0]}</span>
                            <span style={{ fontWeight: 'bold' }}>₹{Math.abs(tx.amount)}</span>
                        </div>
                    ))}
                    {feeds.txs.length === 0 && <p style={{ color: '#888', fontSize: '0.85rem' }}>No recent transactions.</p>}
                </motion.div>

                <motion.div 
                    initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: 0.3 }}
                    style={feedContainerStyle}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--admin-text)' }}>Live Tickets</h3>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/tickets'); }} style={{ color: 'var(--admin-accent)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}>VIEW ALL</a>
                    </div>
                    {feeds.tickets.map((tk, i) => (
                        <div key={i} style={feedRowStyle}>
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>{tk.origin} → {tk.destination}</span>
                            <span style={{ color: tk.status === 'active' ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>{tk.status.toUpperCase()}</span>
                        </div>
                    ))}
                    {feeds.tickets.length === 0 && <p style={{ color: '#888', fontSize: '0.85rem' }}>No live tickets.</p>}
                </motion.div>
            </div>
        </motion.div>
    );
};

const globalSearchStyle = {
    padding: '0 1.2rem',
    borderRadius: '8px',
    border: '1px solid var(--admin-accent-hover)',
    background: 'var(--admin-input-bg)',
    color: 'var(--admin-text)',
    outline: 'none',
    width: '250px',
    fontSize: '0.85rem',
    height: '40px',
    boxSizing: 'border-box',
    margin: 0
};

const feedContainerStyle = {
    background: 'var(--admin-card-bg)',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid var(--admin-border)',
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box'
};

const feedRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.6rem 0',
    borderBottom: '1px solid var(--admin-border)',
    color: 'var(--admin-text)',
    fontSize: '0.9rem'
};

export default AdminDashboard;
