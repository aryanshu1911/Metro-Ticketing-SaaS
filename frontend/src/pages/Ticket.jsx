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

  // Safe names (Handle both state-pushed and API-fetched structures)
  const sourceName = ticket.source_name || ticket.stations?.find(s => s.id === ticket.sourceId)?.name || 'Unknown';
  const destName = ticket.destination_name || ticket.stations?.find(s => s.id === ticket.destId)?.name || 'Unknown';

  return (
    <div className="page-container" style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
      <TopNav title="" showBack />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{ 
          textAlign: 'center', 
          position: 'relative', 
          overflow: 'hidden',
          width: '100%',
          maxWidth: '450px' /* Restored for desktop */
        }}
      >
        {/* Decorative ticket notch */}
        <div style={{ position: 'absolute', top: '150px', left: '-20px', width: '40px', height: '40px', background: 'var(--bg-dark)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', top: '150px', right: '-20px', width: '40px', height: '40px', background: 'var(--bg-dark)', borderRadius: '50%' }}></div>

        <h2 style={{ margin: 0, color: 'var(--text-muted)' }}>Metro E-Ticket</h2>
        <p style={{ margin: '0.4rem 0 0 0', fontSize: '1rem', color: 'var(--primary-color)', textTransform: 'uppercase', fontWeight: 'bold' }}>
          {ticket.journey_type} • {ticket.passengers} Passenger{ticket.passengers > 1 ? 's' : ''}
        </p>
        <p style={{ margin: '0.2rem 0 0 0', fontSize: '1rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          ID: {id ? id.split('-')[0].toUpperCase() : 'N/A'}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>From</span>
            <strong style={{ fontSize: '1.4rem' }}>{sourceName}</strong>
          </div>
          <div style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}>➜</div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>To</span>
            <strong style={{ fontSize: '1.4rem' }}>{destName}</strong>
          </div>
        </div>

        <div style={{ borderTop: '2px dashed var(--glass-border)', margin: '1.5rem -2rem', opacity: 0.5 }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'left' }}>
          <div>
            Booked At:<br/>
            <span style={{ color: 'var(--text-light)' }}>{new Date(ticket.booked_at).toLocaleString()}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            Valid Until:<br/>
            <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{new Date(ticket.valid_till).toLocaleString()}</span>
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.2rem', borderRadius: '1rem', display: 'inline-block', marginBottom: '1rem' }}>
          <QRCode value={String(ticket.qr_code)} size={200} />
        </div>
        
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>
          Scan at turnstile to {ticket.entry_scanned ? 'exit' : 'enter'}
        </p>

        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.6rem 1.2rem', borderRadius: '2rem', display: 'inline-block', fontWeight: 'bold', fontSize: '1rem', marginTop: '0.5rem' }}>
          Valid for Metro Journey Only
        </div>
      </motion.div>
    </div>
  );
}
