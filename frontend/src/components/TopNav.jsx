import { useNavigate } from 'react-router-dom';

export default function TopNav({ title = "Metro Ticketing", showBack = false }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem 0', borderBottom: '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {showBack && (
          <button 
            onClick={() => navigate(-1)}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', fontSize: '1.5rem', cursor: 'pointer', padding: 0 }}
          >
            ←
          </button>
        )}
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-light)' }}>{title}</h2>
      </div>
      <button 
        onClick={handleLogout}
        style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}
      >
        Logout
      </button>
    </div>
  );
}
