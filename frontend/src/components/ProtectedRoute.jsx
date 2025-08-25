import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Composant pour protéger les routes dashboard (tatoueurs seulement)
export const ProtectedDashboardRoute = ({ children }) => {
  const { loading, canAccessDashboard } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (!canAccessDashboard()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Composant pour protéger les routes authentifiées (tous les utilisateurs connectés)
export const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Composant pour rediriger les utilisateurs connectés (pages login/signup)
export const PublicRoute = ({ children }) => {
  const { loading, isAuthenticated, canAccessDashboard } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, rediriger selon son rôle
  if (isAuthenticated()) {
    if (canAccessDashboard()) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/client" replace />; // Les clients vont vers leur espace
    }
  }

  return children;
};
