import React, { useState, useEffect } from 'react';
import { chatAPI } from '../services/chatAPI';

export const ChatBackendTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = [];

    // Test 1: Vérification de la connexion au serveur
    try {
      const response = await fetch('http://localhost:5000/api/chat/tattoo-artists', {
        headers: {
          'Authorization': `Bearer test-token`
        }
      });
      results.push({
        test: 'Connexion serveur',
        status: response.status < 500 ? 'success' : 'error',
        message: `Status: ${response.status}`
      });
    } catch (error) {
      results.push({
        test: 'Connexion serveur',
        status: 'error',
        message: error.message
      });
    }

    // Test 2: Test des routes chat
    const routes = [
      { path: '/chat/tattoo-artists', method: 'GET', name: 'Récupération tatoueurs' },
      { path: '/chat/conversations', method: 'GET', name: 'Récupération conversations' },
      { path: '/chat/unread-count', method: 'GET', name: 'Comptage messages non lus' }
    ];

    for (const route of routes) {
      try {
        const response = await fetch(`http://localhost:5000/api${route.path}`, {
          method: route.method,
          headers: {
            'Authorization': `Bearer test-token`,
            'Content-Type': 'application/json'
          }
        });
        
        results.push({
          test: route.name,
          status: response.status === 401 ? 'auth_required' : response.status < 400 ? 'success' : 'error',
          message: `${route.method} ${route.path} - Status: ${response.status}`
        });
      } catch (error) {
        results.push({
          test: route.name,
          status: 'error',
          message: error.message
        });
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Test Backend Chat</h2>
      
      <button
        onClick={runTests}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Test en cours...' : 'Relancer les tests'}
      </button>

      <div className="space-y-2">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`p-3 rounded border-l-4 ${
              result.status === 'success'
                ? 'bg-green-50 border-green-400 text-green-800'
                : result.status === 'auth_required'
                ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                : 'bg-red-50 border-red-400 text-red-800'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{result.test}</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                result.status === 'success'
                  ? 'bg-green-200 text-green-800'
                  : result.status === 'auth_required'
                  ? 'bg-yellow-200 text-yellow-800'
                  : 'bg-red-200 text-red-800'
              }`}>
                {result.status === 'success' ? 'OK' : 
                 result.status === 'auth_required' ? 'AUTH REQUIRED' : 'ERROR'}
              </span>
            </div>
            <p className="text-sm mt-1">{result.message}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="text-sm space-y-1">
          <li>• <span className="text-green-600">OK</span> : La route fonctionne correctement</li>
          <li>• <span className="text-yellow-600">AUTH REQUIRED</span> : La route nécessite une authentification (normal)</li>
          <li>• <span className="text-red-600">ERROR</span> : Problème de connexion ou erreur serveur</li>
        </ul>
      </div>
    </div>
  );
};
