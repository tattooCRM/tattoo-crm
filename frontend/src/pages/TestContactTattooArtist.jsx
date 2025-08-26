import React, { useEffect, useState } from 'react';
import { useTattooArtists } from '../hooks/useTattooArtists';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle } from 'lucide-react';

export default function TestContactTattooArtist() {
  const { tattooArtists, loading, error, loadTattooArtists, startConversationWith } = useTattooArtists();
  const { user, isAuthenticated } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [isContactLoading, setIsContactLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'client') {
      loadTattooArtists();
    }
  }, [isAuthenticated, user, loadTattooArtists]);

  const testContactArtist = async (artistId, artistName) => {
    setIsContactLoading(true);
    setTestResult(null);

    const testProjectData = {
      projectType: 'first',
      bodyZone: 'arm',
      style: 'geometric',
      size: 'medium',
      description: 'Test de création d\'une conversation avec ' + artistName,
      budget: '200-500',
      availability: 'flexible'
    };

    try {
      const conversation = await startConversationWith(artistId, 'autre', testProjectData);
      
      setTestResult({
        type: 'success',
        message: `✅ Conversation créée avec succès ! ID: ${conversation._id}`,
        data: conversation
      });
    } catch (err) {
      setTestResult({
        type: 'error',
        message: `❌ Erreur: ${err.message}`,
        error: err
      });
    } finally {
      setIsContactLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">⚠️ Vous devez être connecté en tant que client pour tester cette fonctionnalité.</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'client') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">❌ Seuls les clients peuvent contacter les tatoueurs. Votre rôle: {user?.role}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🧪 Test Contact Tatoueurs</h1>

      {/* Informations utilisateur */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h2 className="font-semibold mb-2">Informations utilisateur</h2>
        <p>Email: {user?.email}</p>
        <p>Rôle: {user?.role}</p>
        <p>ID: {user?.id}</p>
      </div>

      {/* État de chargement */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Chargement des tatoueurs...</p>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-red-800">Erreur lors du chargement</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Liste des tatoueurs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Tatoueurs disponibles ({tattooArtists.length})
        </h2>

        {tattooArtists.length === 0 && !loading ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">Aucun tatoueur disponible</p>
          </div>
        ) : (
          tattooArtists.map((artist) => (
            <div key={artist._id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{artist.name}</h3>
                  <p className="text-gray-600 text-sm">ID: {artist._id}</p>
                  {artist.slug && <p className="text-gray-600 text-sm">Slug: {artist.slug}</p>}
                  {artist.specialty && <p className="text-gray-600">Spécialité: {artist.specialty}</p>}
                  {artist.bio && <p className="text-gray-600">{artist.bio}</p>}
                  {artist.instagram && <p className="text-gray-600">Instagram: {artist.instagram}</p>}
                </div>
                
                <button
                  onClick={() => testContactArtist(artist._id, artist.name)}
                  disabled={isContactLoading}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <MessageCircle size={16} />
                  {isContactLoading ? 'Test...' : 'Tester Contact'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Résultat du test */}
      {testResult && (
        <div className={`mt-8 p-4 rounded-lg border ${
          testResult.type === 'success' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <h3 className="font-semibold mb-2">Résultat du test</h3>
          <p className={testResult.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {testResult.message}
          </p>
          
          {testResult.data && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium">Voir les détails</summary>
              <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
