import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Instagram, ExternalLink, Mail, Phone, MapPin, Clock, Star } from 'lucide-react';
import { usePublicPages } from '../../hooks/usePublicPages';
import { getThemeById } from '../../utils/themes';

export default function ArtistPage() {
  const { slug } = useParams();
  const { fetchPageBySlug } = usePublicPages();
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const data = await fetchPageBySlug(slug);
        setPage(data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (slug) {
      loadPage();
    }
  }, [slug, fetchPageBySlug]);

  // Affichage immédiat avec contenu par défaut pendant le chargement
  const displayPage = page || {
    username: slug || 'artiste',
    title: slug?.charAt(0).toUpperCase() + slug?.slice(1) || 'Artiste',
    description: 'Chargement des informations...',
    theme: 'dark',
    instagram: null
  };

  if (error && !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Page non trouvée</h1>
          <p className="text-gray-600 mb-4">
            Cette page d'artiste n'existe pas ou a été supprimée.
          </p>
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  const theme = getThemeById(displayPage.theme);
  
  return (
    <div 
      className={theme.styles.containerClass}
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Image de header */}
      {displayPage.headerImage && (
        <div className="w-full h-48 md:h-64 lg:h-80 overflow-hidden">
          <img 
            src={displayPage.headerImage}
            alt={`${displayPage.username} header`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header avec photo de profil et titre */}
      <div 
        className={`${theme.styles.headerClass} py-16 ${displayPage.headerImage ? '-mt-24' : ''}`}
        style={{ 
          backgroundColor: displayPage.headerImage ? 'rgba(0,0,0,0.7)' : theme.colors.primary,
          position: displayPage.headerImage ? 'relative' : 'static'
        }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Photo de profil */}
          <div className="w-32 h-32 mx-auto mb-6 rounded-full shadow-lg overflow-hidden">
            {displayPage.profilePhoto ? (
              <img 
                src={displayPage.profilePhoto}
                alt={`${displayPage.username} profil`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: theme.colors.accent }}
              >
                <span 
                  className="text-4xl font-bold"
                  style={{ color: theme.colors.text }}
                >
                  {displayPage.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <h1 
            className={`text-4xl ${theme.fonts.heading} mb-2`}
            style={{ color: theme.colors.text }}
          >
            {displayPage.title || displayPage.username}
          </h1>
          
          <p 
            className={`text-lg opacity-90 mb-6`}
            style={{ color: theme.colors.textSecondary }}
          >
            {displayPage.description || `Artiste tatoueur • @${displayPage.username}`}
          </p>

          {/* Boutons de contact */}
          <div className="flex flex-wrap justify-center gap-4">
            {displayPage.instagram && (
              <a 
                href={displayPage.instagram.startsWith('http') 
                  ? displayPage.instagram 
                  : `https://instagram.com/${displayPage.instagram}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-6 py-3 rounded-lg hover:opacity-90 transition-all shadow-lg ${theme.styles.buttonClass}`}
              >
                <Instagram size={20} />
                Instagram
              </a>
            )}
            
            {displayPage.phone && (
              <a 
                href={`tel:${displayPage.phone}`}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg hover:opacity-90 transition-all shadow-lg ${theme.styles.buttonClass}`}
              >
                <Phone size={20} />
                Appeler
              </a>
            )}
            
            {displayPage.email && (
              <a 
                href={`mailto:${displayPage.email}`}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg hover:opacity-80 transition-all shadow-lg`}
                style={{ 
                  backgroundColor: theme.colors.accent,
                  color: theme.colors.background 
                }}
              >
                <Mail size={20} />
                Contact
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div 
        className="max-w-4xl mx-auto px-6 py-12"
        style={{ backgroundColor: theme.colors.background }}
      >
        {/* Description */}
        <div 
          className={`${theme.styles.cardClass} p-8 shadow-lg mb-8`}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <h2 
            className={`text-2xl ${theme.fonts.heading} mb-4`}
            style={{ color: theme.colors.text }}
          >
            À propos
          </h2>
          <div className={`text-lg leading-relaxed ${theme.fonts.body}`}>
            {page ? (
              <p style={{ color: theme.colors.textSecondary }}>
                {displayPage.description}
              </p>
            ) : (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            )}
          </div>
        </div>

        {/* Galerie */}
        <div 
          className={`${theme.styles.cardClass} p-8 shadow-lg mb-8`}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <h2 
            className={`text-2xl ${theme.fonts.heading} mb-6`}
            style={{ color: theme.colors.text }}
          >
            Galerie
          </h2>
          
          {displayPage.gallery && displayPage.gallery.length > 0 ? (
            <div className={`grid ${theme.styles.galleryClass}`}>
              {displayPage.gallery.map((imageUrl, index) => (
                <div 
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <img 
                    src={imageUrl}
                    alt={`Œuvre ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className={`grid ${theme.styles.galleryClass}`}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div 
                  key={item}
                  className={`aspect-square rounded-lg flex items-center justify-center ${
                    page ? 'bg-gradient-to-br from-gray-200 to-gray-300' : 'bg-gray-200 animate-pulse'
                  }`}
                >
                  {page && (
                    <span className="text-gray-500 text-lg font-medium">
                      Photo {item}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <p 
            className={`text-center mt-6 opacity-75`}
            style={{ color: theme.colors.textSecondary }}
          >
            {displayPage.gallery && displayPage.gallery.length > 0 
              ? `${displayPage.gallery.length} œuvre(s) en galerie`
              : page ? 'Aucune œuvre en galerie pour le moment' : 'Chargement de la galerie...'
            }
          </p>
        </div>

        {/* Informations de contact */}
        <div 
          className={`${theme.styles.cardClass} p-8 shadow-lg`}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <h2 
            className={`text-2xl ${theme.fonts.heading} mb-6`}
            style={{ color: theme.colors.text }}
          >
            Informations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              
              {displayPage.phone && (
                <div className="flex items-center gap-3">
                  <Phone 
                    size={20} 
                    style={{ color: theme.colors.accent }}
                  />
                  <a 
                    href={`tel:${displayPage.phone}`} 
                    className="hover:underline"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {displayPage.phone}
                  </a>
                </div>
              )}
              
              {displayPage.email && (
                <div className="flex items-center gap-3">
                  <Mail 
                    size={20} 
                    style={{ color: theme.colors.accent }}
                  />
                  <a 
                    href={`mailto:${displayPage.email}`} 
                    className="hover:underline"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {displayPage.email}
                  </a>
                </div>
              )}
              
              {displayPage.address && (
                <div className="flex items-center gap-3">
                  <MapPin 
                    size={20} 
                    style={{ color: theme.colors.accent }}
                  />
                  <span style={{ color: theme.colors.textSecondary }}>
                    {displayPage.address}
                  </span>
                </div>
              )}
              
              {displayPage.openingHours && (
                <div className="flex items-center gap-3">
                  <Clock 
                    size={20} 
                    style={{ color: theme.colors.accent }}
                  />
                  <span style={{ color: theme.colors.textSecondary }}>
                    {displayPage.openingHours}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {displayPage.website && (
                <div className="flex items-center gap-3">
                  <ExternalLink 
                    size={20} 
                    style={{ color: theme.colors.accent }}
                  />
                  <a 
                    href={displayPage.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Site web
                  </a>
                </div>
              )}
              
              {displayPage.pricing && (
                <div className="flex items-center gap-3">
                  <Star 
                    size={20} 
                    style={{ color: theme.colors.accent }}
                  />
                  <span style={{ color: theme.colors.textSecondary }}>
                    {displayPage.pricing}
                  </span>
                </div>
              )}
              
              {displayPage.instagram && (
                <div className="flex items-center gap-3">
                  <Instagram 
                    size={20} 
                    style={{ color: theme.colors.accent }}
                  />
                  <a 
                    href={displayPage.instagram.startsWith('http') 
                      ? displayPage.instagram 
                      : `https://instagram.com/${displayPage.instagram}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    @{displayPage.instagram.replace('https://instagram.com/', '').replace('/', '')}
                  </a>
                </div>
              )}

              {/* Placeholder si aucune info */}
              {!displayPage.phone && !displayPage.email && !displayPage.address && 
               !displayPage.website && !displayPage.pricing && !displayPage.openingHours && 
               !displayPage.instagram && page && (
                <div 
                  className="text-center py-4 opacity-75"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Aucune information de contact disponible
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer 
        className="py-8 text-center"
        style={{ 
          backgroundColor: theme.colors.primary,
          color: theme.colors.text
        }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <p className="opacity-75">
            © 2024 {displayPage.title || displayPage.username} • Créé avec InkFlow
          </p>
        </div>
      </footer>
    </div>
  );
}
