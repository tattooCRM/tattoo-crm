import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { X, Eye, Palette, User, Instagram, ExternalLink, Settings, Phone, Mail, MapPin, Globe, Zap } from "lucide-react";
import { themeList, getThemeById } from "../../utils/themes";
import { usePublicPages } from "../../hooks/usePublicPages";
import { useToast } from "../../hooks/useToast";
import HeaderImageUpload from "./HeaderImageUpload";
import ThemeSelector from "./ThemeSelector";

export default function PublicPageModal({ hasPage, setShowPageModal }) {
  const { page, savePage, loading, refreshPage } = usePublicPages();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('basics');
  // Initialiser le formData avec les données de la page ou des valeurs par défaut
  const getInitialFormData = () => ({
    username: page?.username || "",
    title: page?.title || "",
    description: page?.description || "",
    instagram: page?.instagram || "",
    theme: page?.theme || "dark",
    headerImage: page?.headerImage || null, // URL existante ou null pour nouveau fichier
    profilePhoto: page?.profilePhoto || null, // URL existante ou null pour nouveau fichier
    gallery: page?.gallery || [], // URLs existantes ou [] pour nouveaux fichiers
    // Nouveaux champs avancés
    phone: page?.phone || "",
    email: page?.email || "",
    address: page?.address || "",
    website: page?.website || "",
    openingHours: page?.openingHours || "",
    pricing: page?.pricing || "",
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [selectedTheme, setSelectedTheme] = useState(page?.theme || "dark");
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, tablet, mobile

  // Mettre à jour formData quand page change (pour la modification)
  useEffect(() => {
    console.log('📝 Page chargée dans le modal:', page);
    if (page) {
      const newFormData = {
        username: page.username || "",
        title: page.title || "",
        description: page.description || "",
        instagram: page.instagram || "",
        theme: page.theme || "dark",
        headerImage: page.headerImage || null,
        profilePhoto: page.profilePhoto || null,
        gallery: page.gallery || [],
        phone: page.phone || "",
        email: page.email || "",
        address: page.address || "",
        website: page.website || "",
        openingHours: page.openingHours || "",
        pricing: page.pricing || "",
      };
      console.log('📋 Données du formulaire mises à jour:', newFormData);
      setFormData(newFormData);
      setSelectedTheme(page.theme || "dark");
    }
  }, [page]);

  const tabs = [
    { id: 'basics', label: 'Informations', icon: User, color: 'gray' },
    { id: 'design', label: 'Design', icon: Palette, color: 'gray' },
    { id: 'contact', label: 'Contact', icon: Phone, color: 'gray' },
    { id: 'advanced', label: 'Avancé', icon: Settings, color: 'gray' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
    setFormData((prev) => ({ ...prev, theme: themeId }));
  };

  // Calculer la progression de chaque onglet
  const getTabCompletion = (tabId) => {
    switch (tabId) {
      case 'basics':
        return formData.username && formData.title && formData.description;
      case 'design':
        // Un onglet design est complété si un thème est explicitement choisi ET qu'il y a au moins une image
        return formData.theme && (formData.headerImage || formData.profilePhoto || formData.gallery.length > 0);
      case 'contact':
        return formData.instagram || formData.phone || formData.email;
      case 'advanced':
        // Un onglet avancé est complété si au moins un champ est rempli
        return formData.openingHours || formData.pricing || formData.address || formData.website;
      default:
        return false;
    }
  };

  // Générer un slug à partir du username
  const generateSlug = (username) => {
    return username
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const onDropGallery = (acceptedFiles) => {
    // Remplacer par les nouveaux fichiers (ne pas conserver les URLs existantes)
    setFormData((prev) => ({ ...prev, gallery: acceptedFiles }));
  };

  const onDropProfile = (acceptedFiles) => {
    // Remplacer par le nouveau fichier (ne pas conserver l'URL existante)
    setFormData((prev) => ({ ...prev, profilePhoto: acceptedFiles[0] }));
  };

  const handleHeaderImageChange = (file) => {
    setFormData((prev) => ({ ...prev, headerImage: file }));
  };

  const handleHeaderImageRemove = () => {
    setFormData((prev) => ({ ...prev, headerImage: null }));
  };

  const { getRootProps: getRootPropsGallery, getInputProps: getInputPropsGallery } = useDropzone({
    onDrop: onDropGallery,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp']
    },
    multiple: true,
  });

  const { getRootProps: getRootPropsProfile, getInputProps: getInputPropsProfile } = useDropzone({
    onDrop: onDropProfile,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp']
    },
    multiple: false,
  });

  const submitForm = async (e) => {
    e.preventDefault();
    
    try {
      // Déterminer s'il y a de nouveaux fichiers à uploader
      const hasNewHeaderImage = formData.headerImage instanceof File;
      const hasNewProfilePhoto = formData.profilePhoto instanceof File;
      const hasNewGalleryFiles = formData.gallery.some(item => item instanceof File);
      const hasNewFiles = hasNewHeaderImage || hasNewProfilePhoto || hasNewGalleryFiles;

      if (hasNewFiles) {
        // Utiliser FormData pour l'upload
        const formDataToSend = new FormData();
        
        // Ajouter les données texte
        formDataToSend.append('username', formData.username);
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('theme', formData.theme);
        formDataToSend.append('instagram', formData.instagram);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('website', formData.website);
        formDataToSend.append('openingHours', formData.openingHours);
        formDataToSend.append('pricing', formData.pricing);
        formDataToSend.append('slug', generateSlug(formData.username));
        
        // Ajouter l'image de header si c'est un nouveau fichier
        if (hasNewHeaderImage) {
          formDataToSend.append('headerImage', formData.headerImage);
        }
        
        // Ajouter la photo de profil si c'est un nouveau fichier
        if (hasNewProfilePhoto) {
          formDataToSend.append('profilePhoto', formData.profilePhoto);
        }
        
        // Ajouter les images de galerie si ce sont de nouveaux fichiers
        if (hasNewGalleryFiles) {
          formData.gallery.forEach((file) => {
            if (file instanceof File) {
              formDataToSend.append('gallery', file);
            }
          });
        }
        
        console.log('📤 Envoi FormData avec fichiers:', Object.fromEntries(formDataToSend));
        await savePage(formDataToSend, true); // true = avec FormData
        
      } else {
        // Utiliser JSON classique (pas de nouveaux fichiers)
        const pageData = {
          username: formData.username,
          title: formData.title,
          description: formData.description,
          theme: formData.theme,
          instagram: formData.instagram,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          website: formData.website,
          openingHours: formData.openingHours,
          pricing: formData.pricing,
          slug: generateSlug(formData.username),
          // Garder les URLs existantes si pas de nouveaux fichiers
          headerImage: formData.headerImage,
          profilePhoto: formData.profilePhoto,
          gallery: formData.gallery
        };
        
        console.log('📤 Envoi JSON sans fichiers:', pageData);
        await savePage(pageData, false); // false = JSON classique
      }
      
      // Animation de succès
      const completedTabs = tabs.filter(tab => getTabCompletion(tab.id)).length;
      
      toast.success(
        `${completedTabs}/${tabs.length} sections complétées • /artist/${generateSlug(formData.username)}`, 
        `🎉 Page ${hasPage ? 'mise à jour' : 'créée'} avec succès !`
      );
      
      setShowPageModal(false);
      
      // Force un refresh après création/modification
      setTimeout(() => {
        refreshPage();
      }, 200);
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(
        error.message, 
        `❌ Erreur lors de la ${hasPage ? 'mise à jour' : 'création'}`
      );
    }
  };

  const currentTheme = getThemeById(selectedTheme);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowPageModal(false)}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
              <Palette size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {hasPage ? "Modifier ma page" : "Créer ma page"}
              </h2>
              <p className="text-sm text-gray-600">Créez votre vitrine en ligne personnalisée</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Eye size={16} />
              Aperçu
            </button>
            <button
              onClick={() => setShowPageModal(false)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Navigation par onglets */}
          <div className="w-64 border-r bg-gray-50 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                      isActive 
                        ? `bg-${tab.color}-100 text-${tab.color}-700 border border-${tab.color}-200` 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Progress indicator */}
            <div className="mt-8 p-4 bg-white rounded-lg border">
              <h4 className="font-medium text-sm text-gray-800 mb-3">Progression</h4>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <div key={tab.id} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      getTabCompletion(tab.id) ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className="text-xs text-gray-600">{tab.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contenu des onglets */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={submitForm} className="space-y-6">
              
              {/* Onglet Informations de base */}
              {activeTab === 'basics' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="text-gray-600" size={24} />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Informations de base</h3>
                      <p className="text-gray-600">Les informations essentielles de votre page</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium mb-2">
                        Nom d'utilisateur * <span className="text-red-500">✦</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                        placeholder="johntattoo"
                        required
                      />
                      {formData.username && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-md flex items-center gap-2">
                          <ExternalLink size={14} className="text-gray-600" />
                          <span className="text-sm text-gray-700 font-medium">
                            /artist/{generateSlug(formData.username)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium mb-2">
                        Titre de la page * <span className="text-red-500">✦</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                        placeholder="John Doe - Tatoueur professionnel"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                      Description * <span className="text-red-500">✦</span>
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                      rows="4"
                      placeholder="Décrivez votre style, votre expérience, votre approche artistique..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.description.length}/500 caractères
                    </p>
                  </div>
                </div>
              )}

              {/* Onglet Design */}
              {activeTab === 'design' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Palette className="text-gray-600" size={24} />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Design & Thème</h3>
                      <p className="text-gray-600">Personnalisez l'apparence de votre page</p>
                    </div>
                  </div>

                  {/* Sélecteur de thèmes */}
                  <ThemeSelector 
                    formData={formData} 
                    setFormData={setFormData}
                    selectedTheme={selectedTheme}
                    onThemeSelect={handleThemeSelect}
                  />

                  {/* Section Upload Images */}
                  <div className="border-t pt-8 mt-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Eye size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">Photos & Images</h4>
                        <p className="text-gray-600">Ajoutez vos photos pour personnaliser votre page</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {/* Image de header */}
                      <HeaderImageUpload
                        headerImage={formData.headerImage}
                        onHeaderImageChange={handleHeaderImageChange}
                        onHeaderImageRemove={handleHeaderImageRemove}
                      />

                      {/* Photo de profil et Galerie */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Photo de profil */}
                        <div>
                        <label className="block text-sm font-medium mb-3">Photo de profil</label>
                        <div
                          {...getRootPropsProfile()}
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <input {...getInputPropsProfile()} />
                          {formData.profilePhoto ? (
                            <div className="space-y-2">
                              <img
                                src={formData.profilePhoto instanceof File 
                                  ? URL.createObjectURL(formData.profilePhoto)
                                  : formData.profilePhoto
                                }
                                alt="Profile preview"
                                className="w-20 h-20 rounded-full mx-auto object-cover"
                              />
                              <p className="text-sm text-gray-600">
                                {formData.profilePhoto instanceof File 
                                  ? formData.profilePhoto.name 
                                  : 'Image existante'
                                }
                              </p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData(prev => ({ ...prev, profilePhoto: null }));
                                }}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                Supprimer
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                                <User size={24} className="text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-600">
                                Glissez votre photo ici ou cliquez pour sélectionner
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 5MB</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Galerie d'images */}
                      <div>
                        <label className="block text-sm font-medium mb-3">Galerie (max 8 images)</label>
                        <div
                          {...getRootPropsGallery()}
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <input {...getInputPropsGallery()} />
                          {formData.gallery.length > 0 ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                {formData.gallery.slice(0, 4).map((file, idx) => (
                                  <img
                                    key={idx}
                                    src={file instanceof File 
                                      ? URL.createObjectURL(file)
                                      : file
                                    }
                                    alt={`Gallery ${idx}`}
                                    className="w-full h-16 object-cover rounded"
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-gray-600">
                                {formData.gallery.length} image(s) sélectionnée(s)
                                {formData.gallery.length > 4 && ` (${formData.gallery.length - 4} autres...)`}
                              </p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData(prev => ({ ...prev, gallery: [] }));
                                }}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                Supprimer toutes
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                                <Eye size={24} className="text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-600">
                                Ajoutez vos œuvres et créations
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 5MB chacune</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              )}

              {/* Onglet Contact */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Phone className="text-gray-600" size={24} />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Informations de contact</h3>
                      <p className="text-gray-600">Comment vos clients peuvent vous contacter</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="instagram" className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Instagram size={16} className="text-gray-500" />
                        Instagram
                      </label>
                      <input
                        type="text"
                        name="instagram"
                        id="instagram"
                        value={formData.instagram}
                        onChange={handleInputChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                        placeholder="mon_compte_insta"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Phone size={16} className="text-gray-500" />
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                        placeholder="+33 X XX XX XX XX"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Mail size={16} className="text-gray-500" />
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                        placeholder="contact@monsite.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="website" className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Globe size={16} className="text-gray-500" />
                        Site web
                      </label>
                      <input
                        type="url"
                        name="website"
                        id="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                        placeholder="https://monsite.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <MapPin size={16} className="text-gray-500" />
                      Adresse du studio
                    </label>
                    <textarea
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                      rows="2"
                      placeholder="123 Rue de l'Art, 75001 Paris"
                    />
                  </div>
                </div>
              )}

              {/* Onglet Avancé */}
              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Settings className="text-gray-600" size={24} />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Paramètres avancés</h3>
                      <p className="text-gray-600">Options supplémentaires pour votre page</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="openingHours" className="block text-sm font-medium mb-2">
                        Horaires d'ouverture
                      </label>
                      <input
                        type="text"
                        name="openingHours"
                        id="openingHours"
                        value={formData.openingHours}
                        onChange={handleInputChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                        placeholder="Lun-Ven: 9h-18h"
                      />
                    </div>

                    <div>
                      <label htmlFor="pricing" className="block text-sm font-medium mb-2">
                        Tarification
                      </label>
                      <input
                        type="text"
                        name="pricing"
                        id="pricing"
                        value={formData.pricing}
                        onChange={handleInputChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                        placeholder="À partir de 80€"
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="text-gray-600" size={24} />
                      <h4 className="font-bold text-gray-800">Fonctionnalités premium</h4>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        <span>Domaine personnalisé (bientôt)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        <span>Analytics avancées (bientôt)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        <span>Intégration système de réservation (bientôt)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons de navigation */}
              <div className="flex justify-between pt-8 border-t-2 border-gray-100">
                <div className="flex gap-3">
                  {activeTab !== 'basics' && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                        if (currentIndex > 0) {
                          setActiveTab(tabs[currentIndex - 1].id);
                        }
                      }}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                      disabled={loading}
                    >
                      ← Précédent
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPageModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  
                  {activeTab !== 'advanced' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                        if (currentIndex < tabs.length - 1) {
                          setActiveTab(tabs[currentIndex + 1].id);
                        }
                      }}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-medium shadow-lg"
                      disabled={loading}
                    >
                      Suivant →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg hover:from-gray-700 hover:to-gray-900 transition-all font-bold shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sauvegarde...
                        </div>
                      ) : (
                        `✨ ${hasPage ? 'Mettre à jour' : 'Créer ma page'}`
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Aperçu */}
          {showPreview && (
            <div className="w-96 border-l bg-gray-100">
              <div className="p-4 border-b bg-white">
                <h3 className="font-semibold text-gray-800">Aperçu en temps réel</h3>
              </div>
              <div className="p-4 overflow-y-auto h-full">
                <div
                  className={`${currentTheme.styles.containerClass} rounded-lg shadow-lg min-h-96 overflow-hidden`}
                  style={{ backgroundColor: currentTheme.colors.background }}
                >
                  {/* Header image */}
                  {formData.headerImage && (
                    <div className="w-full h-24 mb-4">
                      <img
                        src={formData.headerImage instanceof File 
                          ? URL.createObjectURL(formData.headerImage)
                          : formData.headerImage
                        }
                        alt="Header"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="text-center mb-6">
                      {formData.profilePhoto && (
                        <img
                          src={formData.profilePhoto instanceof File 
                            ? URL.createObjectURL(formData.profilePhoto)
                            : formData.profilePhoto
                          }
                          alt="Profile"
                          className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                        />
                      )}
                      <h1
                        className={`text-2xl ${currentTheme.fonts.heading} mb-2`}
                        style={{ color: currentTheme.colors.text }}
                      >
                        {formData.title || 'Votre titre'}
                      </h1>
                      <p
                        className="text-sm"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        {formData.description || 'Votre description apparaîtra ici'}
                      </p>
                    </div>
                    
                    {formData.gallery.length > 0 && (
                      <div className={`grid ${currentTheme.styles.galleryClass}`}>
                        {formData.gallery.slice(0, 6).map((image, idx) => (
                          <div key={idx} className="aspect-square rounded overflow-hidden">
                            <img
                              src={image instanceof File 
                                ? URL.createObjectURL(image)
                                : image
                              }
                              alt={`Gallery ${idx}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
