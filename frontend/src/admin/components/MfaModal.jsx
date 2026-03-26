import React from 'react';

const MfaModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div style={{ marginTop: '1rem' }}>
                    <input 
                        type="password" 
                        placeholder="Enter Admin mPIN or Password" 
                        id="mfa_input"
                        style={inputStyle}
                        autoFocus
                    />
                </div>
                <div style={actionRowStyle}>
                    <button className="admin-btn" style={{ background: '#555' }} onClick={onClose}>Cancel</button>
                    <button 
                        className="admin-btn btn-danger" 
                        onClick={() => {
                            const val = document.getElementById('mfa_input').value;
                            onConfirm(val);
                        }}
                    >
                        Confirm Action
                    </button>
                </div>
            </div>
        </div>
    );
};

const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
};

const modalStyle = {
    background: '#1e293b',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    width: '400px',
    maxWidth: '90%',
    color: '#fff'
};

const inputStyle = {
    width: '100%',
    padding: '0.8rem',
    borderRadius: '4px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    boxSizing: 'border-box',
    marginBottom: '1rem'
};

const actionRowStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1rem'
};

export default MfaModal;
