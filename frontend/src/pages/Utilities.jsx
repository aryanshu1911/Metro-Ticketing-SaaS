import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import TopNav from '../components/TopNav';
import { QRCode } from 'react-qr-code';

export function Wallet() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const phone = localStorage.getItem('phone');

  const fetchBalance = async () => {
    try {
      const res = await api.get(`/wallet/balance/${phone}`);
      setBalance(res.data.balance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [phone]);

  const handlePaymentConfirm = async () => {
    setLoading(true);
    try {
      // Simulation: assume user paid
      await api.post('/wallet/top-up', { phone, amount: parseInt(amount) });
      fetchBalance();
      setShowQR(false);
      setAmount('');
      alert('Payment Successful! Wallet updated.');
    } catch (err) {
      alert('Failed to update wallet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ justifyContent: 'flex-start' }}>
      <TopNav title="My Wallet" showBack />
      
      {!showQR ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass-card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Current Balance</span>
            <h1 style={{ fontSize: '3rem', color: 'var(--primary-color)', margin: '0.5rem 0' }}>₹{balance}</h1>
          </div>

          <div className="glass-card">
            <h3>Add Money</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Top up your wallet to book tickets instantly.
            </p>
            <input 
              type="number" 
              placeholder="Enter Amount (₹)" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ marginBottom: '1rem' }}
            />
            <button 
              className="btn-primary" 
              onClick={() => amount > 0 ? setShowQR(true) : alert('Please enter amount')}
              disabled={loading}
            >
              Proceed to Pay
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <h3>UPI Payment</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scan QR or pay to: <strong>metro@upi</strong></p>
            
            <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', display: 'inline-block', margin: '1.5rem 0' }}>
              <QRCode value={`upi://pay?pa=metro@upi&pn=Metro&am=${amount}&cu=INR`} size={180} />
            </div>

            <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <small style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Instructions:</small>
              <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.75rem' }}>
                <li>Open PhonePe, GPay or any UPI app.</li>
                <li>Scan the QR and pay ₹{amount}.</li>
                <li>Click "I Have Paid" after success.</li>
              </ul>
            </div>

            <button className="btn-primary" onClick={handlePaymentConfirm} disabled={loading}>
              {loading ? 'Verifying...' : 'I Have Paid'}
            </button>
            <button 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', marginTop: '1rem', cursor: 'pointer' }}
              onClick={() => setShowQR(false)}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function History() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const phone = localStorage.getItem('phone');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/tickets/history/${phone}`);
        setTickets(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [phone]);

  return (
    <div className="page-container" style={{ justifyContent: 'flex-start' }}>
      <TopNav title="My Tickets" showBack />
      
      {loading ? <p style={{ textAlign: 'center' }}>Loading history...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tickets.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <p>No tickets booked yet.</p>
              <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/book')}>Book Now</button>
            </div>
          ) : (
            tickets.map(ticket => (
              <div 
                key={ticket.id} 
                className="glass-card" 
                onClick={() => navigate(`/ticket/${ticket.ticket_id}`)}
                style={{ cursor: 'pointer', padding: '1.25rem', borderLeft: '4px solid var(--primary-color)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{ticket.journey_type}</strong>
                  <span style={{ color: 'var(--primary-color)' }}>₹{ticket.fare}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {ticket.source_name} ➔ {ticket.destination_name}
                </div>
                <div style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.6 }}>
                  {new Date(ticket.booked_at).toLocaleDateString()} • {ticket.passengers} pax
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function Profile() {
  const phone = localStorage.getItem('phone');
  const navigate = useNavigate();
  
  return (
    <div className="page-container" style={{ justifyContent: 'flex-start' }}>
      <TopNav title="My Profile" showBack />
      <div className="glass-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem' }}>
            👤
          </div>
          <h2 style={{ margin: 0 }}>Active User</h2>
          <span style={{ color: 'var(--text-muted)' }}>{phone}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Phone</span>
            <strong>{phone}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Status</span>
            <strong style={{ color: 'var(--success)' }}>Verified ✅</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Security</span>
            <strong>mPIN Enabled</strong>
          </div>
        </div>

        <button 
          className="btn-primary" 
          style={{ marginTop: '2.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          onClick={() => { localStorage.clear(); navigate('/login'); }}
        >
          Logout Account
        </button>
      </div>
    </div>
  );
}

export function Transactions() {
  const navigate = useNavigate();
  return (
    <div className="page-container" style={{ justifyContent: 'flex-start' }}>
      <TopNav title="Transactions" showBack />
      <div className="glass-card" style={{ textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-muted)' }}>Payment History</h3>
        <p>Your recent wallet top-ups will appear here.</p>
        <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '2rem' }}>Back</button>
      </div>
    </div>
  );
}

export function Support() {
  const navigate = useNavigate();
  return (
    <div className="page-container" style={{ justifyContent: 'flex-start' }}>
      <TopNav title="Help & Support" showBack />
      <div className="glass-card" style={{ textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-muted)' }}>24/7 Helpline</h3>
        <p>Call: 1800-METRO-HELP</p>
        <p>Email: support@metro.gov</p>
        <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '2rem' }}>Back</button>
      </div>
    </div>
  );
}
