import React from 'react';
import { themeList } from '../../utils/themes';
import { CheckCircle2 } from 'lucide-react';

export default function ThemeSelector({ 
  selectedTheme, 
  onThemeSelect, 
  formData, 
  setFormData 
}) {
  // Utiliser selectedTheme en priorité, sinon formData.theme
  const currentTheme = selectedTheme || formData?.theme || 'dark';
  
  const handleSelect = (themeId) => {
    // Si onThemeSelect est fourni, l'utiliser (cas du PublicPageModal)
    if (onThemeSelect) {
      onThemeSelect(themeId);
    } 
    // Sinon, utiliser setFormData directement si disponible
    else if (setFormData) {
      setFormData(prev => ({ ...prev, theme: themeId }));
    }
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {themeList.map(theme => (
          <button
            key={theme.id}
            type="button"
            onClick={() => handleSelect(theme.id)}
            className={`relative w-full text-left border-2 rounded-xl p-4 transition-all group h-32 flex flex-col justify-between
              ${currentTheme === theme.id
                ? 'border-gray-800 shadow-lg'
                : 'border-gray-200 hover:border-gray-400'}`}
          >
            {/* Checkmark si sélectionné */}
            {currentTheme === theme.id && (
              <div className="absolute top-2 right-2 text-white bg-gray-800 rounded-full p-1">
                <CheckCircle2 size={16} />
              </div>
            )}

            {/* Contenu principal */}
            <div className="flex-1">
              {/* Cercle de couleur - position fixe en haut */}
              <div
                className="w-6 h-6 mb-3 rounded-full"
                style={{
                  background: `linear-gradient(to bottom, ${theme.colors.accent}, ${theme.colors.primary})`
                }}
              />

              {/* Infos du thème */}
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">{theme.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{theme.description}</p>
            </div>

            {/* Palette de couleurs - position fixe en bas */}
            <div className="flex gap-1 mt-2">
              {[theme.colors.primary, theme.colors.accent, theme.colors.text].map((color, idx) => (
                <div
                  key={idx}
                  className="h-2 w-1/3 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
