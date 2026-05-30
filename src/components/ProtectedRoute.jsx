import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // const tok="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzYWlrcmlzaG5hYml0MjAwM0BnbWFpbC5jb20iLCJleHAiOjE3NzgyNTQ2NzB9.8UriBcsUQZfvqMmzwqQXAYw2lw7PXzUIoJvN_Nd0r_U"
  if (!token) {
    // Redirect to login if no token is found
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
