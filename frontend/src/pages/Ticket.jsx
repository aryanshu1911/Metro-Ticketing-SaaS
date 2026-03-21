import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { QRCode } from 'react-qr-code';
import { motion } from 'framer-motion';
import api from '../api';
import TopNav from '../components/TopNav';

export default function Ticket() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticket && id) {
        try {
          const res = await api.get(`/tickets/${id}`);
          setTicket(res.data);
        } catch (err) {
          setError('Ticket not found or expired.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id, ticket]);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary-color)' }}>Loading Ticket...</h2>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="page-container" style={{ textAlign: 'center' }}>
        <div className="glass-card">
          <h2 style={{ color: 'var(--danger)' }}>Ticket Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {error || 'Unable to load ticket details.'}
          </p>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const sourceStation = ticket.stations?.find(s => s.id === (ticket.source_station_id || ticket.sourceId));
  const destStation = ticket.stations?.find(s => s.id === (ticket.destination_station_id || ticket.destId));
  
  const lineName = ticket.line || 'Metro Network';
  const sourceName = sourceStation?.name || ticket.source_name?.split(': ').pop() || 'Unknown';
  const destName = destStation?.name || ticket.destination_name?.split(': ').pop() || 'Unknown';

  return (
    <div className="page-container" style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
      <TopNav title="" showBack />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          width: '100%',
          maxWidth: '380px',
          background: 'var(--bg-dark)',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          border: '1px solid var(--glass-border)'
        }}
      >
        {/* Top Header */}
        <div style={{ background: 'var(--primary-color)', padding: '1.25rem 1rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', padding: '0.2rem 0.8rem', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', marginBottom: '0.5rem', fontSize: '0.68rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>
            {lineName.toUpperCase()}
          </div>
          <h3 style={{ margin: 0, fontSize: '0.7rem', letterSpacing: '0.2em', fontWeight: '800', opacity: 0.9 }}>MUMBAI METRO</h3>
          <h2 style={{ margin: '0.1rem 0 0 0', fontSize: '1.1rem', fontWeight: '500' }}>DIGITAL TICKET</h2>
        </div>

        {/* Journey Info */}
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>FROM</span>
              <strong style={{ fontSize: '1.1rem', letterSpacing: '0.01em' }}>{sourceName}</strong>
            </div>
            <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>➔</div>
            </div>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>TO</span>
              <strong style={{ fontSize: '1.1rem', letterSpacing: '0.01em' }}>{destName}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
             <span style={{ color: 'var(--text-muted)' }}>Type: <b>{(ticket.journey_type || ticket.journeyType || 'single').toUpperCase()}</b></span>
             <span style={{ color: 'var(--text-muted)' }}>Qty: <b>{ticket.passengers || 1}</b></span>
          </div>
        </div>

        {/* Separator dots */}
        <div style={{ position: 'relative', height: '1px', borderTop: '2px dashed var(--glass-border)', margin: '0 1rem', opacity: 0.3 }}>
           <div style={{ position: 'absolute', top: '-10px', left: '-25px', width: '20px', height: '20px', background: 'var(--bg-dark)', borderRadius: '50%', border: '1px solid var(--glass-border)' }}></div>
           <div style={{ position: 'absolute', top: '-10px', right: '-25px', width: '20px', height: '20px', background: 'var(--bg-dark)', borderRadius: '50%', border: '1px solid var(--glass-border)' }}></div>
        </div>

        {/* QR Section */}
        <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '1.25rem', display: 'inline-block', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <QRCode value={String(ticket.qr_code)} size={180} />
          </div>
          <p style={{ marginTop: '1.2rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            ID: {id ? id.split('-')[0].toUpperCase() : 'METRO'} - {id ? id.split('-').pop().toUpperCase() : ''}
          </p>
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
             <div style={{ padding: '0.3rem 0.8rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 'bold' }}>
               {ticket.entry_scanned ? 'READY FOR EXIT' : 'READY FOR ENTRY'}
             </div>
          </div>
        </div>

        {/* Stub / Valid Section */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)' }}>
          <div>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block' }}>VALID UNTIL</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{new Date(ticket.valid_till).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block' }}>BOOKED</span>
            <span style={{ fontSize: '0.8rem' }}>{new Date(ticket.booked_at).toLocaleDateString()}</span>
          </div>
        </div>

      </motion.div>

      <button 
        className="btn-primary" 
        style={{ 
          marginTop: '2.5rem', 
          width: '100%', 
          maxWidth: '380px', 
          height: '56px',
          background: 'var(--primary-color)', 
          borderRadius: '1rem',
          fontSize: '1rem',
          fontWeight: 'bold',
          color: 'white',
          boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)',
          border: 'none',
          cursor: 'pointer'
        }}
        onClick={() => navigate('/dashboard')}
      >
        Back to Dashboard
      </button>
    </div>
  );
}
