import React from 'react';

const StatsCard = ({ title, value, subtext }) => {
    return (
        <div style={cardStyle}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--admin-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
            <h2 style={{ margin: '0', fontSize: '1.8rem', color: 'var(--admin-accent)' }}>{value}</h2>
            {subtext && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>{subtext}</p>}
        </div>
    );
};

const cardStyle = {
    background: 'var(--admin-card-bg)',
    border: '1px solid var(--admin-border)',
    borderRadius: '12px',
    padding: '1.25rem',
    backdropFilter: 'blur(10px)',
    minWidth: '200px',
    flex: '1',
    boxSizing: 'border-box'
};

export default StatsCard;
