import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import TopNav from '../../components/TopNav';
import './AdminLayout.css';

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('adminEmail');
        navigate('/admin/login');
    };

    const linkBase = { display: 'block', padding: '15px 20px', color: '#fff', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold' };

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 20000, margin: 0, padding: 0, backgroundColor: '#050B14', overflow: 'hidden' }}>
            {/* FORCE RENDER SIDEBAR */}
            <div style={{ width: '280px', flexShrink: 0, backgroundColor: '#0B1323', borderRight: '2px solid #00ffff', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2 style={{ color: '#00ffff', margin: 0 }}>METRO ADMIN</h2>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '10px 0' }}>
                    <NavLink to="/admin" end style={({isActive}) => ({ ...linkBase, color: isActive ? '#00ffff' : '#888' })}>▶ Command Center</NavLink>
                    <NavLink to="/admin/tickets" style={({isActive}) => ({ ...linkBase, color: isActive ? '#00ffff' : '#888' })}>▶ Tickets</NavLink>
                    <NavLink to="/admin/users" style={({isActive}) => ({ ...linkBase, color: isActive ? '#00ffff' : '#888' })}>▶ User Directory</NavLink>
                    <NavLink to="/admin/transactions" style={({isActive}) => ({ ...linkBase, color: isActive ? '#00ffff' : '#888' })}>▶ Ledger & Transact</NavLink>
                    <NavLink to="/admin/refunds" style={({isActive}) => ({ ...linkBase, color: isActive ? '#00ffff' : '#888' })}>▶ Refunds</NavLink>
                    <NavLink to="/admin/stations" style={({isActive}) => ({ ...linkBase, color: isActive ? '#00ffff' : '#888' })}>▶ Stations & Lines</NavLink>
                </div>

                <div style={{ padding: '20px' }}>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '12px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>LOGOUT EXECUTOR</button>
                </div>
            </div>

            {/* MAIN DASHBOARD */}
            <div style={{ flex: 1, backgroundColor: '#0f172a', padding: '50px', overflowY: 'auto', boxSizing: 'border-box' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box' }}>
                    <TopNav isAdmin={true} />
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
