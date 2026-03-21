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
      // Simulated Payment: assume user paid
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
  const [activeTab, setActiveTab] = useState('travel');
  const [tickets, setTickets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const phone = localStorage.getItem('phone');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'travel') {
        const res = await api.get(`/tickets/history/${phone}`);
        setTickets(res.data);
      } else {
        const res = await api.get(`/wallet/transactions/${phone}`);
        setTransactions(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [phone, activeTab]);

  const handleDeleteTicket = async (e, ticketId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this ticket from history?')) return;
    try {
      await api.delete(`/tickets/${ticketId}`);
      setTickets(prev => prev.filter(t => t.ticket_id !== ticketId));
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  return (
    <div className="page-container" style={{ justifyContent: 'flex-start' }}>
      <TopNav title="History & Activity" showBack />
      
      {/* Tab Switcher */}
      <div style={{ display: 'flex', background: 'var(--glass-bg)', borderRadius: '1rem', padding: '0.3rem', marginBottom: '1.5rem', border: '1px solid var(--glass-border)' }}>
        <button 
          onClick={() => setActiveTab('travel')}
          style={{ 
            flex: 1, padding: '0.75rem', borderRadius: '0.8rem', border: 'none', 
            background: activeTab === 'travel' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'travel' ? 'white' : 'var(--text-muted)',
            fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s'
          }}
        >
          🎫 Travel
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          style={{ 
            flex: 1, padding: '0.75rem', borderRadius: '0.8rem', border: 'none', 
            background: activeTab === 'payments' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'payments' ? 'white' : 'var(--text-muted)',
            fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s'
          }}
        >
          💳 Payments
        </button>
      </div>
      
      {loading ? <p style={{ textAlign: 'center' }}>Loading activity...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activeTab === 'travel' ? (
            tickets.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <p>No tickets booked yet.</p>
                <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/book')}>Book Now</button>
              </div>
            ) : (
              tickets.map(ticket => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  key={ticket.ticket_id} 
                  className="glass-card" 
                  onClick={() => navigate(`/ticket/${ticket.ticket_id}`)}
                  style={{ cursor: 'pointer', padding: '1.25rem', borderLeft: '4px solid var(--primary-color)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <strong>{ticket.journey_type}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>₹{ticket.fare}</span>
                      <button 
                        onClick={(e) => handleDeleteTicket(e, ticket.ticket_id)}
                        className="btn-delete"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.2rem' }}>
                    {ticket.source_name?.split(': ').pop()} ➔ {ticket.destination_name?.split(': ').pop()}
                  </div>
                  <div style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.6 }}>
                    {new Date(ticket.booked_at).toLocaleString()} • {ticket.passengers} pax
                  </div>
                </motion.div>
              ))
            )
          ) : (
            transactions.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <p>No transactions found.</p>
                <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/wallet')}>Top-up Wallet</button>
              </div>
            ) : (
              transactions.map(tx => (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  key={tx.id} className="glass-card" style={{ padding: '1.25rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', 
                        background: tx.type === 'TOP_UP' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                      }}>
                        {tx.type === 'TOP_UP' ? '💰' : '🎫'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{tx.type.replace('_', ' ')}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.description}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '1rem', 
                        color: tx.amount > 0 ? 'var(--success)' : 'var(--danger)' 
                      }}>
                        {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )
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
          <div style={{ width: '80px', height: '80px', background: 'var(--profile-avatar-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem', border: '1px solid var(--glass-border)' }}>
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
export function MetroNetwork() {
  const [selectedLine, setSelectedLine] = useState('Line 1');
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  const lines = {
    'Line 1': { color: '#4F46E5' },
    'Line 2A': { color: '#F59E0B' },
    'Line 7': { color: '#EF4444' },
    'Line 3': { color: '#06B6D4' }
  };

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/stations/?line=${selectedLine}`);
        setStations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, [selectedLine]);

  const currentLine = lines[selectedLine];

  return (
    <div className="page-container" style={{ justifyContent: 'flex-start' }}>
      <TopNav title="Network Map" showBack />
      
      {/* Line Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {Object.keys(lines).map(lineName => (
          <button
            key={lineName}
            onClick={() => setSelectedLine(lineName)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              border: `1px solid ${selectedLine === lineName ? lines[lineName].color : 'var(--glass-border)'}`,
              background: selectedLine === lineName ? `${lines[lineName].color}22` : 'var(--glass-bg)',
              color: selectedLine === lineName ? lines[lineName].color : 'var(--text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '0.85rem',
              fontWeight: selectedLine === lineName ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            {lineName}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading stations...</p>
        ) : (
          <>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', color: currentLine.color }}>
              {selectedLine}: {stations[0]?.name} - {stations[stations.length - 1]?.name}
            </h3>
            
            <div style={{ position: 'relative', padding: '1rem 0' }}>
              <div style={{ 
                position: 'absolute', 
                left: '25px', 
                top: '0', 
                bottom: '0', 
                width: '4px', 
                background: currentLine.color, 
                borderRadius: '2px',
                opacity: 0.3
              }}></div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                {stations.map((s, i) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                    <div style={{ 
                      width: '14px', 
                      height: '14px', 
                      borderRadius: '50%', 
                      background: currentLine.color, 
                      border: '3px solid white',
                      boxShadow: `0 0 10px ${currentLine.color}88`,
                      zIndex: 2,
                      marginTop: '4px'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem', lineHeight: '1.4' }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {i === 0 || i === stations.length - 1 ? 'Terminal' : (
                          (s.name === 'D.N. Nagar' || s.name === 'Marol Naka' || s.name === 'Dahisar East') ? 'Interchange Station' : 'Stop'
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
