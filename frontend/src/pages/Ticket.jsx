import { useLocation, useNavigate, useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';
import TopNav from '../components/TopNav';

export default function Ticket() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get ticket data passed from Booking page
  const ticketData = location.state;

  if (!ticketData) {
    return (
      <div className="page-container">
        <p style={{textAlign:'center'}}>Ticket not found.</p>
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>Go Home</button>
      </div>
    );
  }

  const sourceName = ticketData.stations.find(s => s.id === ticketData.sourceId)?.name;
  const destName = ticketData.stations.find(s => s.id === ticketData.destId)?.name;

  return (
    <div className="page-container" style={{ justifyContent: 'flex-start' }}>
      <TopNav title="" showBack />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}
      >
        {/* Decorative ticket notch */}
        <div style={{ position: 'absolute', top: '150px', left: '-20px', width: '40px', height: '40px', background: 'var(--bg-dark)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', top: '150px', right: '-20px', width: '40px', height: '40px', background: 'var(--bg-dark)', borderRadius: '50%' }}></div>

        <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Metro Ticket</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>From</span>
            <strong style={{ fontSize: '1.2rem' }}>{sourceName}</strong>
          </div>
          <div style={{ color: 'var(--primary-color)' }}>➔</div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>To</span>
            <strong style={{ fontSize: '1.2rem' }}>{destName}</strong>
          </div>
        </div>

        <div style={{ borderTop: '2px dashed var(--glass-border)', margin: '2rem -2rem', opacity: 0.5 }}></div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', display: 'inline-block', marginBottom: '1.5rem' }}>
          <QRCode value={ticketData.qr_code} size={180} />
        </div>
        
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Scan at the turnstile to {ticketData.entry_scanned ? 'exit' : 'enter'}
        </p>

        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.5rem', borderRadius: '2rem', display: 'inline-block', fontWeight: 'bold', fontSize: '0.9rem' }}>
          Valid for Journey
        </div>
      </motion.div>
    </div>
  );
}
