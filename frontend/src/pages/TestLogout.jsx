import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestLogout = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Test Déconnexion & Debug</h1>
      
      {/* Section Debug */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="font-semibold mb-2">Debug - Informations utilisateur :</h2>
        <div className="space-y-2">
          <p><strong>Authentifié :</strong> {isAuthenticated() ? 'Oui' : 'Non'}</p>
          {user ? (
            <>
              <p><strong>Nom :</strong> {user.name}</p>
              <p><strong>Email :</strong> {user.email}</p>
              <p><strong>Rôle :</strong> {user.role}</p>
              <p><strong>ID :</strong> {user.id}</p>
            </>
          ) : (
            <p>Aucun utilisateur connecté</p>
          )}
        </div>
        {user && user.role !== 'client' && (
          <div className="mt-3 p-3 bg-red-100 border border-red-400 rounded">
            <p className="text-red-800">⚠️ Problème détecté : Votre rôle n'est pas 'client' mais '{user.role}'</p>
            <p className="text-red-600 text-sm mt-1">
              Solution : Déconnectez-vous et reconnectez-vous avec un compte client valide.
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="font-semibold mb-2">Instructions pour tester :</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Connectez-vous avec un compte tatoueur</li>
          <li>Allez sur le dashboard : <code>http://localhost:5173/dashboard</code></li>
          <li>Cliquez sur votre avatar/profil en haut à droite</li>
          <li>Cliquez sur "Se déconnecter" dans le menu déroulant</li>
          <li>Confirmez la déconnexion dans la modale</li>
          <li>Vous devriez être redirigé vers la page d'accueil</li>
        </ol>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-semibold mb-2">Comptes de test :</h2>
        <div className="space-y-2">
          <div className="p-2 bg-blue-50 rounded">
            <p><strong>Tatoueur :</strong></p>
            <p>Email: alex@tattoo.com</p>
            <p>Password: 123456</p>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <p><strong>Client (nouveau) :</strong></p>
            <p>Email: nouveauclient@test.com</p>
            <p>Password: 123456</p>
          </div>
          <div className="p-2 bg-yellow-50 rounded">
            <p><strong>Client (ancien) :</strong></p>
            <p>Email: client@test.com</p>
            <p>Password: 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLogout;
