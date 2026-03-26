import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:8000/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                // Store isolated admin token
                localStorage.setItem('adminToken', data.access_token);
                localStorage.setItem('adminRole', data.role);
                localStorage.setItem('adminEmail', data.email);
                navigate('/admin');
            } else {
                setError(data.detail || 'Invalid login credentials');
            }
        } catch (err) {
            setError('Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={loginContainerStyle}>
            <div style={loginBoxStyle}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#0ff' }}>Admin Portal</h2>
                {error && <div style={errorStyle}>{error}</div>}
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input 
                        type="email" 
                        placeholder="Admin Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        required
                    />
                    <button type="submit" style={btnStyle} disabled={loading}>
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const loginContainerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    color: '#fff',
    fontFamily: 'Inter, sans-serif'
};

const loginBoxStyle = {
    background: 'rgba(255,255,255,0.05)',
    padding: '3rem',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    width: '350px'
};

const inputStyle = {
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(0,0,0,0.2)',
    color: '#fff',
    outline: 'none'
};

const btnStyle = {
    padding: '1rem',
    borderRadius: '8px',
    border: 'none',
    background: '#0ff',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: '0.3s'
};

const errorStyle = {
    background: 'rgba(255,0,0,0.2)',
    color: '#ff4d4f',
    padding: '0.8rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    textAlign: 'center',
    border: '1px solid rgba(255,0,0,0.5)'
};

export default AdminLogin;
