import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import TopNav from '../components/TopNav';
import { QRCode } from 'react-qr-code';

export default function Booking() {
  const [stations, setStations] = useState([]);
  const [sourceId, setSourceId] = useState('');
  const [destId, setDestId] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [journeyType, setJourneyType] = useState('single');
  
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('wallet'); 
  const [showUpiQR, setShowUpiQR] = useState(false);
  
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

  const handleBook = async () => {
    setError('');
    setBooking(true);
    try {
      const totalFare = getEstimatedFare();
      
      if (paymentMethod === 'wallet' && walletBalance < totalFare) {
        throw new Error(`Insufficient wallet balance. You need ₹${totalFare}.`);
      }

      const res = await api.post('/tickets/book', {
        phone,
        source_station_id: sourceId,
        destination_station_id: destId,
        passengers: parseInt(passengers),
        journey_type: journeyType,
        payment_method: paymentMethod
      });
      
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

  const totalFare = getEstimatedFare();

  return (
    <div className="page-container" style={{ justifyContent: 'flex-start' }}>
      <TopNav title={step === 1 ? "Plan Journey" : "Checkout"} showBack />
      
      <motion.div 
        key={step + (showUpiQR ? 'qr' : '')}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}

        {step === 1 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>From Station</label>
                <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem' }}>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>To Station</label>
                <select value={destId} onChange={(e) => setDestId(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem' }}>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Travel Type</label>
                <select value={journeyType} onChange={(e) => setJourneyType(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem' }}>
                  <option value="single">Single Journey</option>
                  <option value="return">Return Journey</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Count</label>
                <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem' }}>
                  {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num} {num > 1 ? '' : ''}</option>)}
                </select>
              </div>
            </div>

            <button className="btn-primary" onClick={() => (sourceId === destId) ? setError("Same stations!") : setStep(2)}>
              Check Fare (₹{totalFare})
            </button>
          </>
        )}

        {step === 2 && !showUpiQR && (
          <>
            <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Review Order</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {stations.find(s=>s.id===sourceId)?.name} ➔ {stations.find(s=>s.id===destId)?.name} • {journeyType}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select Payment Method</label>
              
              <div 
                onClick={() => setPaymentMethod('wallet')}
                style={{ 
                  padding: '1rem', 
                  borderRadius: '1rem', 
                  border: `2px solid ${paymentMethod === 'wallet' ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                  background: paymentMethod === 'wallet' ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  marginBottom: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>💳 Wallet Balance</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Available: ₹{walletBalance}</div>
                </div>
                {paymentMethod === 'wallet' && <span>✓</span>}
              </div>

              <div 
                onClick={() => setPaymentMethod('upi')}
                style={{ 
                  padding: '1rem', 
                  borderRadius: '1rem', 
                  border: `2px solid ${paymentMethod === 'upi' ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                  background: paymentMethod === 'upi' ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>📡 Direct UPI Pay</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pay using GPAY/PhonePe</div>
                </div>
                {paymentMethod === 'upi' && <span>✓</span>}
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              margin: '2rem 0', 
              paddingTop: '1rem', 
              borderTop: '2px solid var(--glass-border)' 
            }}>
              <span style={{ fontSize: '1.1rem' }}>Total Amount</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{totalFare}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <button className="btn-primary" onClick={() => setStep(1)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white' }}>
                Edit
              </button>
              <button 
                className="btn-primary" 
                onClick={() => paymentMethod === 'upi' ? setShowUpiQR(true) : handleBook()}
                disabled={booking}
              >
                {paymentMethod === 'upi' ? 'Show UPI QR' : (booking ? 'Processing...' : 'Pay from Wallet')}
              </button>
            </div>
          </>
        )}

        {step === 2 && showUpiQR && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Scan to Pay ₹{totalFare}</h3>
             <div style={{ background: 'white', padding: '1.2rem', borderRadius: '1.2rem', display: 'inline-block', marginBottom: '1.5rem' }}>
                <QRCode value={`upi://pay?pa=metro@upi&pn=Metro&am=${totalFare}&cu=INR`} size={180} />
             </div>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
               After successful payment in your UPI app, click below:
             </p>
             <button className="btn-primary" onClick={handleBook} disabled={booking}>
                {booking ? 'Generating Ticket...' : 'I Have Paid'}
             </button>
             <button 
               onClick={() => setShowUpiQR(false)}
               style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', marginTop: '1rem', cursor: 'pointer' }}
             >
               Change Payment Method
             </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
