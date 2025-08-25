import { useState, useEffect } from 'react';

// Hook pour gérer les pages publiques
export function usePublicPages(options = {}) {
    const { autoLoadUserPage = true } = options;
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(0);

    // Récupérer l'userId depuis localStorage
    const getUserId = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        return user?.id;
    };

    // Charger la page de l'utilisateur
    const fetchUserPage = async () => {
        const userId = getUserId();
        if (!userId) {
            setError(null);
            setPage(null);
            return null;
        }

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/public-pages/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setPage(data);
                setError(null);
                setLastUpdate(Date.now());
                return data;
            } else if (response.status === 404) {
                setPage(null);
                setError(null);
                setLastUpdate(Date.now());
                return null;
            } else {
                console.log('Erreur fetchUserPage:', response.status, response.statusText);
                const errorData = await response.json().catch(() => ({}));
                console.log('Détails erreur fetchUserPage:', errorData);
                throw new Error('Erreur lors du chargement de la page');
            }
        } catch (err) {
            console.error('Erreur chargement page:', err);
            // Ne pas définir d'erreur pour les erreurs de réseau lors du chargement initial
            if (err.message !== 'Failed to fetch') {
                setError(err.message);
            }
            setPage(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Créer ou mettre à jour une page
    const savePage = async (pageData, isFormData = false) => {
        const userId = getUserId();
        if (!userId) {
            throw new Error("Utilisateur non connecté");
        }

        try {
            setLoading(true);
            
            // Récupérer la page existante d'abord
            const existingPage = await fetchUserPage();
            
            const url = existingPage 
                ? `http://localhost:5000/api/public-pages/${existingPage._id}` 
                : 'http://localhost:5000/api/public-pages';
            
            const method = existingPage ? 'PUT' : 'POST';
            
            console.log('Envoi des données:', { method, url, isFormData, userId, existingPage: !!existingPage });
            
            let requestOptions;
            
            if (isFormData) {
                // Ajouter userId au FormData si pas déjà présent
                if (!pageData.get('userId')) {
                    pageData.append('userId', userId);
                }
                
                requestOptions = {
                    method,
                    body: pageData // Ne pas définir Content-Type, le navigateur le fera automatiquement
                };
            } else {
                // Mode JSON (pour compatibilité arrière)
                const cleanPageData = {
                    username: pageData.username,
                    title: pageData.title,
                    description: pageData.description,
                    theme: pageData.theme || 'dark',
                    instagram: pageData.instagram,
                    phone: pageData.phone,
                    email: pageData.email,
                    address: pageData.address,
                    website: pageData.website,
                    openingHours: pageData.openingHours,
                    pricing: pageData.pricing,
                    slug: pageData.slug
                };
                
                requestOptions = {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...cleanPageData,
                        userId
                    })
                };
            }

            const response = await fetch(url, requestOptions);

            console.log('Réponse:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log('Détails erreur:', errorData);
                
                if (response.status === 400 && errorData.message?.includes('déjà') && !isFormData) {
                    console.log('Page existante détectée, tentative de mise à jour...');
                    
                    // Refetch pour obtenir la page existante
                    const refetchedPage = await fetchUserPage();
                    
                    if (refetchedPage) {
                        // Retry avec PUT (mode JSON uniquement)
                        const cleanPageData = {
                            username: pageData.username,
                            title: pageData.title,
                            description: pageData.description,
                            theme: pageData.theme || 'dark',
                            instagram: pageData.instagram,
                            phone: pageData.phone,
                            email: pageData.email,
                            address: pageData.address,
                            website: pageData.website,
                            openingHours: pageData.openingHours,
                            pricing: pageData.pricing,
                            slug: pageData.slug
                        };
                        
                        const updateResponse = await fetch(`http://localhost:5000/api/public-pages/${refetchedPage._id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...cleanPageData,
                                userId
                            })
                        });
                        
                        if (!updateResponse.ok) {
                            const updateError = await updateResponse.json().catch(() => ({}));
                            throw new Error(updateError.message || `Erreur ${updateResponse.status}: ${updateResponse.statusText}`);
                        }
                        
                        const updatedPage = await updateResponse.json();
                        setPage(updatedPage);
                        setError(null);
                        return updatedPage;
                    }
                }
                
                throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
            }

            const savedPage = await response.json();
            setPage(savedPage);
            setError(null);
            setLastUpdate(Date.now());
            
            // Refresh automatique après sauvegarde
            setTimeout(() => {
                fetchUserPage();
            }, 100);
            
            return savedPage;
        } catch (err) {
            console.error('Erreur sauvegarde page:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Récupérer une page par slug
    const fetchPageBySlug = async (slug) => {
        try {
            const response = await fetch(`http://localhost:5000/api/public-pages/slug/${slug}`);
            if (!response.ok) {
                throw new Error('Page non trouvée');
            }
            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Erreur chargement page par slug:', err);
            setError(err.message);
            throw err;
        }
    };

    // Supprimer une page
    const deletePage = async () => {
        if (!page) return;

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/public-pages/${page._id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression');
            }

            setPage(null);
            setError(null);
            setLastUpdate(Date.now());
            
            // Refresh automatique après suppression
            await fetchUserPage();
        } catch (err) {
            console.error('Erreur suppression page:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const userId = getUserId();
        if (userId && autoLoadUserPage) {
            fetchUserPage();
        }
    }, [autoLoadUserPage]);

    return {
        page,
        loading,
        error,
        lastUpdate,
        savePage,
        fetchPageBySlug,
        deletePage,
        refreshPage: fetchUserPage
    };
}
