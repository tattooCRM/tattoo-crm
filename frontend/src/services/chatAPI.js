const API_URL = 'http://localhost:5000/api';

// Utilitaire pour récupérer le token d'authentification
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Utilitaire pour les requêtes avec authentification
const authFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers
  };

  // Ne pas définir Content-Type pour FormData
  if (!options.body || !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur serveur');
  }

  return response.json();
};

export const chatAPI = {
  // Récupérer toutes les conversations de l'utilisateur
  getConversations: async () => {
    const response = await authFetch(`${API_URL}/chat/conversations`);
    // Le backend retourne { conversations: [...] } donc on extrait le tableau
    return response.conversations || response;
  },

  // Créer une nouvelle conversation
  createConversation: async (tattooArtistId, projectType = 'autre', projectData = null) => {
    // Si projectData contient un fichier, utiliser FormData
    if (projectData && projectData.placementPhoto instanceof File) {
      const formData = new FormData();
      formData.append('tattooArtistId', tattooArtistId);
      formData.append('projectType', projectType);
      
      // Ajouter la photo
      formData.append('placementPhoto', projectData.placementPhoto);
      
      // Ajouter les autres données du projet
      const projectDataWithoutFile = { ...projectData };
      delete projectDataWithoutFile.placementPhoto;
      delete projectDataWithoutFile.placementPhotoPreview; // Ne pas envoyer l'URL de preview
      formData.append('projectData', JSON.stringify(projectDataWithoutFile));
      
      return authFetch(`${API_URL}/chat/conversations`, {
        method: 'POST',
        body: formData
      });
    } else {
      // Requête JSON normale
      return authFetch(`${API_URL}/chat/conversations`, {
        method: 'POST',
        body: JSON.stringify({ tattooArtistId, projectType, projectData })
      });
    }
  },

  // Récupérer les messages d'une conversation
  getMessages: async (conversationId) => {
    const response = await authFetch(`${API_URL}/chat/conversations/${conversationId}/messages`);
    // Le backend retourne { messages: [...] } donc on extrait le tableau
    return response.messages || response;
  },

  // Envoyer un message
  sendMessage: async (conversationId, content) => {
    return authFetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  },

  // Marquer une conversation comme lue
  markAsRead: async (conversationId) => {
    return authFetch(`${API_URL}/chat/conversations/${conversationId}/read`, {
      method: 'PUT'
    });
  },

  // Récupérer la liste des tatoueurs (pour les clients)
  getTattooArtists: async () => {
    return authFetch(`${API_URL}/chat/tattoo-artists`);
  },

  // Récupérer le nombre de messages non lus
  getUnreadCount: async () => {
    return authFetch(`${API_URL}/chat/unread-count`);
  },

  // Récupérer un tatoueur par son slug (route publique)
  getTattooArtistBySlug: async (slug) => {
    const response = await fetch(`${API_URL}/public-pages/tattoo-artist/${slug}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new Error(error.message || 'Tatoueur introuvable');
    }
    return response.json();
  }
};

export default chatAPI;
