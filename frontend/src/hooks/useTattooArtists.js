import { useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../services/chatAPI';
import { useAuth } from '../contexts/AuthContext';

export const useTattooArtists = () => {
  const [tattooArtists, setTattooArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Charger la liste des tatoueurs disponibles
  const loadTattooArtists = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await chatAPI.getTattooArtists();
      setTattooArtists(data);
    } catch (err) {
      console.error('Erreur chargement tatoueurs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Créer une conversation avec un tatoueur
  const startConversationWith = useCallback(async (tattooArtistId, projectType = 'autre', projectData = null) => {
    try {
      const conversation = await chatAPI.createConversation(tattooArtistId, projectType, projectData);
      return conversation;
    } catch (err) {
      console.error('Erreur création conversation:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Récupérer un tatoueur par son slug (pour page publique)
  const getTattooArtistBySlug = useCallback(async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const artist = await chatAPI.getTattooArtistBySlug(slug);
      return artist;
    } catch (err) {
      console.error('Erreur récupération tatoueur par slug:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger au montage si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'client') {
      loadTattooArtists();
    }
  }, [loadTattooArtists, isAuthenticated, user]);

  return {
    tattooArtists,
    loading,
    error,
    loadTattooArtists,
    startConversationWith,
    getTattooArtistBySlug
  };
};
