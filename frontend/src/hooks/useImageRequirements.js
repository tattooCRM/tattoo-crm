import { useState, useEffect } from 'react';

export const useImageRequirements = () => {
  const [requirements, setRequirements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const baseUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:5000' 
          : '';
        const response = await fetch(`${baseUrl}/api/public-pages/image-requirements`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('La réponse n\'est pas en JSON');
        }
        
        const data = await response.json();
        setRequirements(data.requirements);
      } catch (err) {
        setError(err.message);
        console.warn('Erreur récupération exigences images, utilisation du fallback:', err);
        
        // Fallback avec exigences par défaut
        setRequirements({
          headerImage: {
            minWidth: 1200,
            minHeight: 300,
            maxWidth: 2000,
            maxHeight: 800,
            aspectRatio: { min: 2.5, max: 4 },
            maxSize: 5 * 1024 * 1024
          },
          profilePhoto: {
            minWidth: 200,
            minHeight: 200,
            maxWidth: 1000,
            maxHeight: 1000,
            aspectRatio: { min: 0.8, max: 1.2 },
            maxSize: 2 * 1024 * 1024
          },
          gallery: {
            minWidth: 300,
            minHeight: 300,
            maxWidth: 2000,
            maxHeight: 2000,
            maxSize: 3 * 1024 * 1024
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, []);

  return { requirements, loading, error };
};
