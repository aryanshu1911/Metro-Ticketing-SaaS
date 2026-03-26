import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import { Wallet, History, Profile, Support, MetroNetwork } from './pages/Utilities';
import Ticket from './pages/Ticket';
import AdminLayout from './admin/components/AdminLayout';
import AdminPrivateRoute from './admin/components/AdminPrivateRoute';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminUsers from './admin/pages/AdminUsers';
import AdminTransactions from './admin/pages/AdminTransactions';
import AdminRefunds from './admin/pages/AdminRefunds';
import AdminTickets from './admin/pages/AdminTickets';
import AdminStations from './admin/pages/AdminStations';
import './index.css';
import './admin/components/AdminLayout.css'; // FORCE CSS RELOAD

// Simple Error Boundary
import React from 'react';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', background: 'white', minHeight: '100vh' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Simple auth check component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="app-bg">
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/book" element={<PrivateRoute><Booking /></PrivateRoute>} />
            <Route path="/ticket/:id" element={<PrivateRoute><Ticket /></PrivateRoute>} />
            <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/support" element={<PrivateRoute><Support /></PrivateRoute>} />
            <Route path="/map" element={<PrivateRoute><MetroNetwork /></PrivateRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminPrivateRoute><AdminLayout /></AdminPrivateRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="refunds" element={<AdminRefunds />} />
                <Route path="tickets" element={<AdminTickets />} />
                <Route path="stations" element={<AdminStations />} />
                <Route path="lines" element={<AdminStations />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
