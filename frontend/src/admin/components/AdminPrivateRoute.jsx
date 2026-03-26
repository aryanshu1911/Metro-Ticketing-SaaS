import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminPrivateRoute = () => {
    const adminToken = localStorage.getItem('adminToken');

    // If there is no token, redirect directly to admin login
    if (!adminToken) {
        return <Navigate to="/admin/login" replace />;
    }

    // Token exists, render the child routes (via Outlet)
    return <Outlet />;
};

export default AdminPrivateRoute;
