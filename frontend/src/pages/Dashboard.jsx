import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import TopNav from '../components/TopNav';

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const phone = localStorage.getItem('phone');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await api.get(`/wallet/balance/${phone}`);
        setBalance(res.data.balance);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [phone, navigate]);

  const menuItems = [
    { title: 'Book Ticket', icon: '🎫', path: '/book', color: '#4F46E5', desc: 'New Journey' },
    { title: 'History & Activity', icon: '🕒', path: '/history', color: '#10B981', desc: 'Tickets & Payments' },
    { title: 'Wallet', icon: '💳', path: '/wallet', color: '#F59E0B', desc: `Balance: ₹${balance}` },
    { title: 'Metro Map', icon: '🗺️', path: '/map', color: '#6366F1', desc: 'Network View' },
    { title: 'Support', icon: '🎧', path: '/support', color: '#8B5CF6', desc: '24/7 Help' },
  ];

  return (
    <div className="page-container">
      <TopNav title="" />

      <div style={{ padding: '0 1rem', maxWidth: '100%' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '2rem' }}>Welcome back,</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
          width: '100%'
        }}>
          {menuItems.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className="glass-card"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                minHeight: '120px',
                border: `1px solid ${item.color}22`
              }}
            >
              <div style={{
                fontSize: '2rem',
                background: `${item.color}22`,
                width: '45px',
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0.75rem',
                marginBottom: '1rem'
              }}>
                {item.icon}
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem' }}>{item.title}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card"
          style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--accent-bg)' }}
        >
          <div style={{ fontSize: '1.5rem' }}>📢</div>
          <div style={{ fontSize: '1rem', color: 'var(--text-light)' }}>
            <strong>System Update:</strong> Now book for Mumbai Metro Lines 1, 2A, 3, & 7 seamlessly.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
