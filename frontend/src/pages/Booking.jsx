import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import TopNav from '../components/TopNav';
import { QRCode } from 'react-qr-code';

export default function Booking() {
  const [stations, setStations] = useState([]);
  const [selectedLine, setSelectedLine] = useState('Line 1');
  const [sourceId, setSourceId] = useState('');
  const [destId, setDestId] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [journeyType, setJourneyType] = useState('single');
  const [estimatedFare, setEstimatedFare] = useState(0);
  const [fareLoading, setFareLoading] = useState(false);
  
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('wallet'); 
  const [showUpiQR, setShowUpiQR] = useState(false);
  
  const navigate = useNavigate();
  const phone = localStorage.getItem('phone');

  const metroLines = ['Line 1', 'Line 2A', 'Line 3', 'Line 7'];

  // Fetch stations when line changes
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await api.get(`/stations/?line=${selectedLine}`);
        setStations(res.data);
        if (res.data.length > 0) {
          setSourceId(res.data[0].id);
          setDestId(res.data[res.data.length - 1].id);
        }
      } catch (err) {
        setError('Failed to fetch stations.');
      }
    };
    fetchStations();
  }, [selectedLine]);

  // Initial data (balance)
  useEffect(() => {
    const fetchBalance = async () => {
       try {
         const res = await api.get(`/wallet/balance/${phone}`);
         setWalletBalance(res.data.balance);
       } catch (err) {
         setError('Failed to load wallet data.');
       } finally {
         setLoading(false);
       }
    };
    fetchBalance();
  }, [phone]);

  // Calculate fare via API
  useEffect(() => {
    const fetchFare = async () => {
      if (!sourceId || !destId || sourceId === destId) {
        setEstimatedFare(0);
        return;
      }
      setFareLoading(true);
      try {
        const res = await api.get('/tickets/calculate-fare', {
          params: { 
            source_id: sourceId, 
            dest_id: destId, 
            passengers, 
            journey_type: journeyType 
          }
        });
        setEstimatedFare(res.data.fare);
      } catch (err) {
        console.error('Fare calculation error:', err);
      } finally {
        setFareLoading(false);
      }
    };
    fetchFare();
  }, [sourceId, destId, passengers, journeyType]);

  const handleBook = async () => {
    setError('');
    setBooking(true);
    try {
      if (paymentMethod === 'wallet' && walletBalance < estimatedFare) {
        throw new Error(`Insufficient wallet balance. You need ₹${estimatedFare}.`);
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
            <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>SELECT METRO LINE</label>
              <select 
                value={selectedLine} 
                onChange={(e) => {
                  setSelectedLine(e.target.value);
                  const filtered = stations.filter(s => s.line === e.target.value);
                  if (filtered.length > 0) {
                    setSourceId(filtered[0].id);
                    setDestId(filtered[filtered.length - 1].id);
                  }
                }} 
                style={{ width: '100%', padding: '0.8rem', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '1rem' }}
              >
                {metroLines.map(line => <option key={line} value={line}>{line}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>From Station</label>
                <select value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>To Station</label>
                <select value={destId} onChange={(e) => setDestId(e.target.value)}>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Travel Type</label>
                <select value={journeyType} onChange={(e) => setJourneyType(e.target.value)}>
                  <option value="single">Single Journey</option>
                  <option value="return">Return Journey</option>
                </select>
              </div>
              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Count</label>
                <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))}>
                  {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num} {num > 1 ? '' : ''}</option>)}
                </select>
              </div>
            </div>

            <button 
              className="btn-primary" 
              disabled={fareLoading || !sourceId || !destId || sourceId === destId}
              onClick={() => setStep(2)}
            >
              {fareLoading ? 'Calculating...' : `Proceed to Checkout (₹${estimatedFare})`}
            </button>
          </>
        )}

        {step === 2 && !showUpiQR && (
          <>
            <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Review Order</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {selectedLine}: {stations.find(s=>s.id===sourceId)?.name} ➔ {stations.find(s=>s.id===destId)?.name} • {journeyType}
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
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{estimatedFare}</span>
            </div>

            {paymentMethod === 'wallet' && walletBalance < estimatedFare && (
              <div style={{ color: 'var(--danger)', fontSize: '1rem', marginBottom: '1.5rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                ⚠️ Low balance. Top up or use UPI instead.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <button className="btn-primary" onClick={() => setStep(1)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-light)' }}>
                Back
              </button>
              <button 
                className="btn-primary" 
                onClick={() => paymentMethod === 'upi' ? setShowUpiQR(true) : handleBook()}
                disabled={booking || (paymentMethod === 'wallet' && walletBalance < estimatedFare)}
              >
                {paymentMethod === 'upi' ? 'Show UPI QR' : (booking ? 'Processing...' : (walletBalance < estimatedFare ? 'Insufficient Balance' : 'Pay from Wallet'))}
              </button>
            </div>
          </>
        )}

        {step === 2 && showUpiQR && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Scan to Pay ₹{estimatedFare}</h3>
             <div style={{ background: 'white', padding: '1.2rem', borderRadius: '1.2rem', display: 'inline-block', marginBottom: '1.5rem' }}>
                <QRCode value={`upi://pay?pa=metro@upi&pn=Metro&am=${estimatedFare}&cu=INR`} size={180} />
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
