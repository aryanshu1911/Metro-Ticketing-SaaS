import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import Ticket from './pages/Ticket';
import './index.css';

// Simple auth check component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="app-bg">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/book" element={<PrivateRoute><Booking /></PrivateRoute>} />
          <Route path="/ticket/:id" element={<PrivateRoute><Ticket /></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
