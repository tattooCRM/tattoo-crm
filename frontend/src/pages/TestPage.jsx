import React from 'react';
import { ChatBackendTest } from '../components/ChatBackendTest';

export const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Tests Backend Tattoo CRM</h1>
        
        <div className="grid gap-6">
          <ChatBackendTest />
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Instructions de test</h2>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                <h3 className="font-semibold">1. Démarrer le backend</h3>
                <code className="text-sm">cd backend && npm start</code>
              </div>
              
              <div className="p-3 bg-green-50 border-l-4 border-green-400">
                <h3 className="font-semibold">2. Vérifier MongoDB</h3>
                <p className="text-sm">Assurez-vous que MongoDB est démarré et accessible</p>
              </div>
              
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400">
                <h3 className="font-semibold">3. Variables d'environnement</h3>
                <p className="text-sm">Vérifiez que le fichier .env contient MONGO_URI et JWT_SECRET</p>
              </div>
              
              <div className="p-3 bg-purple-50 border-l-4 border-purple-400">
                <h3 className="font-semibold">4. Test des routes</h3>
                <p className="text-sm">Les routes doivent retourner 401 (authentification requise) ou 200/201 si connecté</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
