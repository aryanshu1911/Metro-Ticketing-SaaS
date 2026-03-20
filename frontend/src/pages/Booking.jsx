import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import TopNav from '../components/TopNav';

export default function Booking() {
  const [stations, setStations] = useState([]);
  const [sourceId, setSourceId] = useState('');
  const [destId, setDestId] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await api.get('/stations/');
        setStations(res.data);
        if (res.data.length > 0) {
          setSourceId(res.data[0].id);
          setDestId(res.data[res.data.length - 1].id);
        }
      } catch (err) {
        setError('Failed to load stations');
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  // Calculate fare dynamically purely for display preview (optional)
  const getEstimatedFare = () => {
    if (!sourceId || !destId || stations.length === 0) return 0;
    const source = stations.find(s => s.id === sourceId);
    const dest = stations.find(s => s.id === destId);
    if (!source || !dest) return 0;
    
    const diff = Math.abs(source.order_index - dest.order_index);
    if (diff <= 3) return 10;
    if (diff <= 7) return 20;
    if (diff <= 11) return 30;
    return 40;
  };

  const handleBook = async () => {
    if (sourceId === destId) {
      setError("Source and destination cannot be the same.");
      return;
    }
    setError('');
    setBooking(true);
    try {
      const phone = localStorage.getItem('phone');
      const res = await api.post('/tickets/book', {
        phone,
        source_station_id: sourceId,
        destination_station_id: destId
      });
      // Redirect to ticket pass with full context
      navigate(`/ticket/${res.data.ticket_id}`, { state: { ...res.data, sourceId, destId, stations } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Booking failed');
      setBooking(false);
    }
  };

  if (loading) return <div className="page-container"><p style={{textAlign:'center'}}>Loading stations...</p></div>;

  return (
    <div className="page-container" style={{ justifyContent: 'flex-start' }}>
      <TopNav title="Book Ticket" showBack />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}

        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>From</label>
        <select 
          value={sourceId} 
          onChange={(e) => setSourceId(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem' }}
        >
          {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>To</label>
        <select 
          value={destId} 
          onChange={(e) => setDestId(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem' }}
        >
          {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Estimated Fare</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{getEstimatedFare()}</span>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleBook}
          disabled={booking || sourceId === destId}
        >
          {booking ? 'Booking...' : 'Pay & Book'}
        </button>
      </motion.div>
    </div>
  );
}
