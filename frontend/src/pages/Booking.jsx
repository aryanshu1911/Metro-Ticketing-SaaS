import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import TopNav from '../components/TopNav';

export default function Booking() {
  const [stations, setStations] = useState([]);
  const [sourceId, setSourceId] = useState('');
  const [destId, setDestId] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [journeyType, setJourneyType] = useState('single');
  
  const [step, setStep] = useState(1); // 1 = Details, 2 = Payment Payment
  
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  
  const navigate = useNavigate();
  const phone = localStorage.getItem('phone');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [stationsRes, walletRes] = await Promise.all([
          api.get('/stations/'),
          api.get(`/wallet/balance/${phone}`)
        ]);
        
        setStations(stationsRes.data);
        setWalletBalance(walletRes.data.balance);
        
        if (stationsRes.data.length > 0) {
          setSourceId(stationsRes.data[0].id);
          setDestId(stationsRes.data[stationsRes.data.length - 1].id);
        }
      } catch (err) {
        setError('Failed to load required data.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [phone]);

  const getEstimatedFare = () => {
    if (!sourceId || !destId || stations.length === 0) return 0;
    const source = stations.find(s => s.id === sourceId);
    const dest = stations.find(s => s.id === destId);
    if (!source || !dest) return 0;
    
    const diff = Math.abs(source.order_index - dest.order_index);
    let base = 40;
    if (diff <= 3) base = 10;
    else if (diff <= 7) base = 20;
    else if (diff <= 11) base = 30;
    
    return base * passengers * (journeyType === 'return' ? 2 : 1);
  };

  const proceedToPay = () => {
    if (sourceId === destId) {
      setError("Source and destination cannot be the same.");
      return;
    }
    setError('');
    setStep(2);
  };

  const handleBook = async () => {
    setError('');
    setBooking(true);
    try {
      const totalFare = getEstimatedFare();
      if (walletBalance < totalFare) {
        throw new Error(`Insufficient wallet balance. You need ₹${totalFare}.`);
      }

      const res = await api.post('/tickets/book', {
        phone,
        source_station_id: sourceId,
        destination_station_id: destId,
        passengers: parseInt(passengers),
        journey_type: journeyType
      });
      // Pass full context safely to avoid crashes
      navigate(`/ticket/${res.data.ticket_id}`, { 
        state: { 
          ...res.data, 
          sourceId, 
          destId, 
          stations,
          passengers,
          journeyType 
        } 
      });
    } catch (err) {
      setError(err.message || err.response?.data?.detail || 'Booking failed');
      setBooking(false);
    }
  };

  if (loading) return <div className="page-container"><p style={{textAlign:'center'}}>Loading booking engine...</p></div>;

  return (
    <div className="page-container" style={{ justifyContent: 'flex-start' }}>
      <TopNav title={step === 1 ? "Plan Journey" : "Payment Summary"} showBack />
      
      <motion.div 
        key={step}
        initial={{ opacity: 0, x: step === 1 ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card"
      >
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}

        {step === 1 && (
          <>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>From</label>
            <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem' }}>
              {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>To</label>
            <select value={destId} onChange={(e) => setDestId(e.target.value)} style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem' }}>
              {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Type</label>
                <select value={journeyType} onChange={(e) => setJourneyType(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem' }}>
                  <option value="single">Single Journey</option>
                  <option value="return">Return Journey</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Passengers</label>
                <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem' }}>
                  {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num} Person{num > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>

            <button className="btn-primary" onClick={proceedToPay} disabled={sourceId === destId}>
              Proceed to Pay (₹{getEstimatedFare()})
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Order Summary</h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Route</span>
                <strong>{stations.find(s=>s.id===sourceId)?.name} ➔ {stations.find(s=>s.id===destId)?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Passengers</span>
                <strong>{passengers}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>Type</span>
                <strong style={{ textTransform: 'capitalize' }}>{journeyType}</strong>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Fare</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{getEstimatedFare()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Current Wallet Balance:</span>
              <span style={{ color: walletBalance >= getEstimatedFare() ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                ₹{walletBalance}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" onClick={() => setStep(1)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white' }} disabled={booking}>
                Back
              </button>
              <button className="btn-primary" onClick={handleBook} disabled={booking || walletBalance < getEstimatedFare()}>
                {booking ? 'Processing...' : 'Confirm & Book'}
              </button>
            </div>
            {walletBalance < getEstimatedFare() && (
               <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--danger)' }}>
                 You need to top up your wallet first.
               </p>
            )}
          </>
        )}

      </motion.div>
    </div>
  );
}
