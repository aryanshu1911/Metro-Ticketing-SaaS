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
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.2rem' }}>
                  {ticket.source_name?.split(': ').pop()} ➔ {ticket.destination_name?.split(': ').pop()}
                </div>
                <div style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.6 }}>
                  {ticket.booked_at ? new Date(ticket.booked_at).toLocaleString() : 'N/A'} • {ticket.passengers} pax
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
export function MetroNetwork() {
  const [selectedLine, setSelectedLine] = useState('Line 1');

  const lines = {
    'Line 1': {
      color: '#4F46E5', // Blue
      stations: ["Ghatkopar", "Jagruti Nagar", "Asalpha", "Saki Naka", "Marol Naka", "Airport Road", "Chakala", "Western Express Highway", "Andheri", "Azad Nagar", "D.N. Nagar", "Versova"]
    },
    'Line 2A': {
      color: '#F59E0B', // Yellow
      stations: ["Dahisar East", "Anand Nagar", "Kandarpada", "Mandapeshwar", "Eksar", "Borivali West", "Pahadi Eksar", "Kandivali West", "Dhanukarwadi", "Valnai", "Mith Chowki", "Lower Malad", "Lower Oshiwara", "Oshiwara", "Goregaon West", "Bangur Nagar", "D.N. Nagar"]
    },
    'Line 7': {
      color: '#EF4444', // Red
      stations: ["Dahisar East", "Ovaripada", "National Park", "Devipada", "Magathane", "Poisar", "Akurli", "Kurar", "Dindoshi", "Aarey", "JVLR", "Shankarwadi", "Mogra", "Gundavali"]
    },
    'Line 3': {
      color: '#06B6D4', // Aqua
      stations: [
        "Aarey Colony", "SEEPZ", "MIDC", "Marol Naka", "CSMIA T2", "Sahar Road", 
        "CSMIA T1", "Santacruz", "Vidyanagari", "BKC", "Dharavi", "Shitladevi", 
        "Dadar", "Siddhivinayak", "Worli", "Acharya Atre Chowk", "Science Museum", 
        "Mahalaxmi", "Mumbai Central", "Grant Road", "Girgaon", "Kalbadevi", 
        "CSMT", "Hutatma Chowk", "Churchgate", "Vidhan Bhavan", "Cuffe Parade"
      ]
    }
    
  };

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
        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', color: currentLine.color }}>
          {selectedLine}: {currentLine.stations[0]} - {currentLine.stations[currentLine.stations.length - 1]}
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
            {currentLine.stations.map((name, i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ 
                  width: '14px', 
                  height: '14px', 
                  borderRadius: '50%', 
                  background: currentLine.color, 
                  border: '3px solid white',
                  boxShadow: `0 0 10px ${currentLine.color}88`,
                  zIndex: 2
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {i === 0 || i === currentLine.stations.length - 1 ? 'Terminal' : (
                      (name === 'D.N. Nagar' || name === 'Marol Naka' || name === 'Dahisar East') ? 'Interchange Station' : 'Stop'
                    )}
                  </div>
                </div>
                {(name === 'D.N. Nagar' || name === 'Marol Naka' || name === 'Dahisar East') && (
                  <div style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
                    🔄 Interchange
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
