import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [regStep, setRegStep] = useState(1); // 1: Info, 2: OTP, 3: mPIN
  
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [mpin, setMpin] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAction = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isRegistering) {
        // LOGIN FLOW
        const res = await api.post('/auth/login', { phone, mpin });
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('phone', phone);
        navigate('/dashboard');
      } else {
        // REGISTRATION FLOW
        if (regStep === 1) {
          await api.post('/auth/register', { phone, email });
          setRegStep(2);
        } else if (regStep === 2) {
          await api.post('/auth/verify-otp', { phone, otp });
          setRegStep(3);
        } else if (regStep === 3) {
          const res = await api.post('/auth/set-mpin', { phone, mpin });
          localStorage.setItem('token', res.data.access_token);
          localStorage.setItem('phone', phone);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setRegStep(1);
    setError('');
    setPhone('');
    setEmail('');
    setOtp('');
    setMpin('');
  };

  return (
    <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <h2 style={{ textAlign: 'center', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
          Metro Ticketing System
        </h2>
        
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {!isRegistering ? 'Welcome back! Please login' : 
           regStep === 1 ? 'Step 1: Enter your details' : 
           regStep === 2 ? 'Step 2: Verify your Email' : 
           'Step 3: Secure your account'}
        </p>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleAction}>
          {/* STEP 1: LOGIN OR REGISTER */}
          {(!isRegistering || regStep === 1) && (
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          )}

          {isRegistering && regStep === 1 && (
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          )}

          {/* STEP 2: OTP Validation*/}
          {isRegistering && regStep === 2 && (
            <input
              type="text"
              placeholder="6-Digit OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
          )}

          {/* STEP 3: MPIN Validation*/}
          {(!isRegistering || (isRegistering && regStep === 3)) && (
            <input
              type="password"
              placeholder="4-Digit mPIN"
              maxLength={4}
              value={mpin}
              onChange={(e) => setMpin(e.target.value)}
              required
              disabled={loading}
              autoFocus={isRegistering && regStep === 3}
            />
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Processing...' : 
             !isRegistering ? 'Login' : 
             regStep === 1 ? 'Send OTP' : 
             regStep === 2 ? 'Verify OTP' : 
             'Complete Registration'}
          </button>
        </form>

        {regStep === 1 && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            <span 
              style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={toggleMode}
            >
              {isRegistering ? 'Login' : 'Register'}
            </span>
          </p>
        )}
        
        {isRegistering && regStep > 1 && (
          <p 
            style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
            onClick={() => setRegStep(regStep - 1)}
          >
            Go Back
          </p>
        )}
      </motion.div>
    </div>
  );
}
