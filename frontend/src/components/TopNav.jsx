import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopNav({ title = "", showBack = false }) {
  const navigate = useNavigate();
  const [isLight, setIsLight] = useState(localStorage.getItem('theme') === 'light');

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLight]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '1.5rem', 
      padding: '0.75rem 0', 
      borderBottom: '1px solid var(--glass-border)',
      width: '100%'
    }}>
      {/* Left Side: Back or Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        {showBack ? (
          <button 
            onClick={() => navigate(-1)}
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--primary-color)', fontSize: '1.2rem', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center' }}
          >
            Back
          </button>
        ) : (
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--primary-color)', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
            Mumbai Metro Ticketing System
          </div>
        )}
        {title && (
          <h2 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-light)', borderLeft: '1px solid var(--glass-border)', paddingLeft: '0.75rem', whiteSpace: 'nowrap' }}>
            {title}
          </h2>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => setIsLight(!isLight)}
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', padding: '0', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Toggle Theme"
        >
          {isLight ? '🌙' : '☀️'}
        </button>

        <button 
          onClick={() => navigate('/profile')}
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', padding: '0', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="My Profile"
        >
          👤
        </button>

        <button 
          onClick={handleLogout}
          style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
