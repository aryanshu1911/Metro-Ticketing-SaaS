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

  useEffect(() => {
    fetchBalance();
  }, [phone]);

  const handleTopUp = async () => {
    try {
      // For Demo: add 100 INR
      setLoading(true);
      await api.post('/wallet/top-up', { phone, amount: 100 });
      await fetchBalance();
    } catch (err) {
      alert('Failed to top up');
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ justifyContent: 'flex-start' }}>
      <TopNav title="" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{ textAlign: 'center', marginBottom: '2rem', padding: '3rem 2rem' }}
      >
        <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Wallet Balance</h3>
        <h1 style={{ fontSize: '3.5rem', margin: 0, color: 'var(--primary-color)' }}>
          ₹{loading ? '...' : balance}
        </h1>
        
        <button 
          className="btn-primary" 
          onClick={handleTopUp}
          disabled={loading}
          style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)' }}
        >
          {loading ? 'Processing...' : '+ Add ₹100'}
        </button>
      </motion.div>

      <motion.button 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="btn-primary" 
        onClick={() => navigate('/book')}
        style={{ padding: '1.25rem', fontSize: '1.25rem' }}
      >
        Book a Ticket
      </motion.button>
    </div>
  );
}
