// src/components/auth/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

const ProtectedRoute = ({ children, allowedUserTypes }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!authService.isAuthenticated()) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const user = authService.getCachedUserData() || await authService.getUserData();
      const tipo = user.tipo_usuario.toLowerCase();

      setAuthorized(allowedUserTypes.includes(tipo));
      setLoading(false);
    };

    check();
  }, [allowedUserTypes]);

  if (loading) return <p>Carregando...</p>;

  if (!authorized) {
    authService.logout();
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
