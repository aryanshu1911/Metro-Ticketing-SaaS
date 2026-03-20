import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [needsOtp, setNeedsOtp] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [mpin, setMpin] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering && !needsOtp) {
        // Trigger Registration
        await api.post('/auth/register', { phone, email, mpin });
        setNeedsOtp(true);
      } else if (isRegistering && needsOtp) {
        // Verify OTP
        const res = await api.post('/auth/verify-otp', { phone, otp });
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('phone', phone);
        navigate('/dashboard');
      } else {
        // Normal Login
        const res = await api.post('/auth/login', { phone, mpin });
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('phone', phone);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h2 style={{ textAlign: 'center', color: 'var(--primary-color)' }}>
          Metro Ticketing
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>
          {isRegistering ? (needsOtp ? 'Verify your Email OTP' : 'Create your account') : 'Welcome back'}
        </p>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          {!needsOtp && (
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          )}

          {isRegistering && !needsOtp && (
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          )}

          {!needsOtp && (
            <input
              type="password"
              placeholder="4-Digit mPIN"
              maxLength={4}
              value={mpin}
              onChange={(e) => setMpin(e.target.value)}
              required
              disabled={loading}
            />
          )}

          {needsOtp && (
            <input
              type="text"
              placeholder="6-Digit OTP from Email"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={loading}
            />
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : (isRegistering ? (needsOtp ? 'Verify & Login' : 'Send OTP') : 'Login')}
          </button>
        </form>

        {!needsOtp && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            <span 
              style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            >
              {isRegistering ? 'Login' : 'Register'}
            </span>
          </p>
        )}
      </motion.div>
    </div>
  );
}
