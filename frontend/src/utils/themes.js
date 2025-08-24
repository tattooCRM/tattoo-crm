// Thèmes disponibles pour les pages publiques
export const themes = {
  dark: {
    id: 'dark',
    name: 'Dark Tattoo',
    description: 'Thème sombre et moderne pour les tatoueurs',
    preview: '/themes/dark-preview.jpg',
    colors: {
      primary: '#000000',
      secondary: '#1a1a1a',
      accent: '#ff6b6b',
      text: '#ffffff',
      textSecondary: '#cccccc',
      background: '#0a0a0a',
      surface: '#1f1f1f'
    },
    fonts: {
      heading: 'font-bold',
      body: 'font-normal'
    },
    styles: {
      containerClass: 'bg-black text-white min-h-screen',
      headerClass: 'bg-gray-900 border-b border-gray-700',
      cardClass: 'bg-gray-800 border border-gray-700 rounded-lg shadow-xl',
      buttonClass: 'bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors',
      galleryClass: 'grid-cols-2 md:grid-cols-3 gap-4'
    }
  },
  
  minimal: {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Design épuré et minimaliste',
    preview: '/themes/minimal-preview.jpg',
    colors: {
      primary: '#2d3748',
      secondary: '#718096',
      accent: '#3182ce',
      text: '#1a202c',
      textSecondary: '#718096',
      background: '#ffffff',
      surface: '#f7fafc'
    },
    fonts: {
      heading: 'font-light',
      body: 'font-normal'
    },
    styles: {
      containerClass: 'bg-white text-gray-800 min-h-screen',
      headerClass: 'bg-white border-b border-gray-200',
      cardClass: 'bg-white border border-gray-200 rounded-lg shadow-sm',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors',
      galleryClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    }
  },

  vintage: {
    id: 'vintage',
    name: 'Vintage Ink',
    description: 'Style vintage avec des tons chauds',
    preview: '/themes/vintage-preview.jpg',
    colors: {
      primary: '#8b4513',
      secondary: '#d2691e',
      accent: '#cd853f',
      text: '#2f1b14',
      textSecondary: '#5d4e37',
      background: '#f5f5dc',
      surface: '#faebd7'
    },
    fonts: {
      heading: 'font-bold',
      body: 'font-normal'
    },
    styles: {
      containerClass: 'bg-beige text-amber-900 min-h-screen',
      headerClass: 'bg-amber-50 border-b border-amber-200',
      cardClass: 'bg-amber-50 border border-amber-200 rounded-lg shadow-md',
      buttonClass: 'bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded transition-colors',
      galleryClass: 'grid-cols-2 md:grid-cols-3 gap-4'
    }
  },

  neon: {
    id: 'neon',
    name: 'Neon Glow',
    description: 'Style futuriste avec des néons colorés',
    preview: '/themes/neon-preview.jpg',
    colors: {
      primary: '#0f0f23',
      secondary: '#1a1a3e',
      accent: '#00ffff',
      text: '#ffffff',
      textSecondary: '#b8b8ff',
      background: '#050518',
      surface: '#1a1a3e'
    },
    fonts: {
      heading: 'font-bold',
      body: 'font-normal'
    },
    styles: {
      containerClass: 'bg-purple-900 text-white min-h-screen',
      headerClass: 'bg-purple-800 border-b border-purple-600',
      cardClass: 'bg-purple-800 border border-purple-600 rounded-lg shadow-xl shadow-cyan-500/20',
      buttonClass: 'bg-cyan-400 hover:bg-cyan-500 text-purple-900 font-bold py-2 px-4 rounded transition-colors shadow-lg shadow-cyan-400/50',
      galleryClass: 'grid-cols-2 md:grid-cols-3 gap-4'
    }
  },

  elegant: {
    id: 'elegant',
    name: 'Elegant Gold',
    description: 'Design élégant avec des accents dorés',
    preview: '/themes/elegant-preview.jpg',
    colors: {
      primary: '#1a1a1a',
      secondary: '#2d2d2d',
      accent: '#d4af37',
      text: '#1a1a1a',
      textSecondary: '#666666',
      background: '#ffffff',
      surface: '#f8f8f8'
    },
    fonts: {
      heading: 'font-serif font-bold',
      body: 'font-sans'
    },
    styles: {
      containerClass: 'bg-white text-gray-900 min-h-screen',
      headerClass: 'bg-white border-b border-yellow-400',
      cardClass: 'bg-white border border-yellow-400 rounded-lg shadow-lg',
      buttonClass: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-4 rounded transition-colors',
      galleryClass: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
    }
  }
};

// Fonction pour obtenir un thème par ID
export const getThemeById = (themeId) => {
  return themes[themeId] || themes.dark;
};

// Liste des thèmes pour les sélecteurs
export const themeList = Object.values(themes);
