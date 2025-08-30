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

  // Créer une conversation avec un tatoueur (utilisateur authentifié)
  const startConversationWith = useCallback(async (tattooArtistId, projectType = 'autre', projectData = null) => {
    
    try {
      if (!tattooArtistId) {
        throw new Error('ID du tatoueur manquant');
      }
      
      const conversation = await chatAPI.createConversation(tattooArtistId, projectType, projectData);
      
      return conversation;
    } catch (err) {
      console.error('❌ Erreur création conversation:', err);
      
      // Messages d'erreur plus explicites
      let errorMessage = err.message;
      if (err.message.includes('Tatoueur non trouvé') || err.message.includes('Tatoueur introuvable')) {
        errorMessage = 'Une erreur s\'est produite lors de l\'envoi de votre demande. Le tatoueur recevra votre message dès qu\'il sera de retour !';
      } else if (err.message.includes('ID de tatoueur invalide')) {
        errorMessage = 'Impossible de contacter ce tatoueur (ID invalide)';
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Créer une conversation publique (pour les visiteurs non connectés)
  const submitPublicProject = useCallback(async (tattooArtistSlug, clientName, clientEmail, projectType = 'autre', projectData = null) => {
    
    try {
      if (!tattooArtistSlug || !clientName || !clientEmail) {
        throw new Error('Données manquantes pour la demande');
      }
      
      const conversation = await chatAPI.createPublicConversation(tattooArtistSlug, clientName, clientEmail, projectType, projectData);
      
      return conversation;
    } catch (err) {
      console.error('❌ Erreur création conversation publique:', err);
      
      // Messages d'erreur plus explicites
      let errorMessage = err.message;
      if (err.message.includes('Tatoueur non trouvé')) {
        errorMessage = 'Une erreur s\'est produite lors de l\'envoi de votre demande. Le tatoueur recevra votre message dès qu\'il sera de retour !';
      } else if (err.message.includes('requis')) {
        errorMessage = 'Veuillez remplir tous les champs obligatoires';
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
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
    submitPublicProject,
    getTattooArtistBySlug
  };
};
