import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function PublicPageModal({ hasPage, setHasPage, setShowPageModal }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instagram: "",
    profilePhoto: null,
    gallery: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onDropGallery = (acceptedFiles) => {
    setFormData((prev) => ({ ...prev, gallery: acceptedFiles }));
  };

  const onDropProfile = (acceptedFiles) => {
    setFormData((prev) => ({ ...prev, profilePhoto: acceptedFiles[0] }));
  };

  const { getRootProps: getRootPropsGallery, getInputProps: getInputPropsGallery } = useDropzone({
    onDrop: onDropGallery,
    accept: "image/*",
    multiple: true,
  });

  const { getRootProps: getRootPropsProfile, getInputProps: getInputPropsProfile } = useDropzone({
    onDrop: onDropProfile,
    accept: "image/*",
    multiple: false,
  });

  const submitForm = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setHasPage(true);
    setShowPageModal(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setShowPageModal(false)}
    >
      <div
        className="bg-white p-6 rounded-md w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">
          {hasPage ? "Modifier ma page" : "Créer ma page"}
        </h2>

        <form onSubmit={submitForm}>
          {/* Champ titre */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-semibold">
              Titre
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Champ description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-semibold">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md"
              rows="4"
              required
            />
          </div>

          {/* Lien Instagram */}
          <div className="mb-4">
            <label htmlFor="instagram" className="block text-sm font-semibold">
              Lien Instagram
            </label>
            <input
              type="url"
              name="instagram"
              id="instagram"
              value={formData.instagram}
              onChange={handleInputChange}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            />
          </div>

          {/* Photo de profil */}
          <div className="mb-4">
            <label className="block text-sm font-semibold">Photo de profil</label>
            <div
              {...getRootPropsProfile()}
              className="w-full p-6 mt-2 border border-dashed border-gray-300 rounded-md bg-gray-50 flex justify-center items-center cursor-pointer transition-colors duration-300 hover:bg-gray-100"
            >
              <input {...getInputPropsProfile()} className="hidden" />
              <p className="text-gray-500">Glissez-déposez une photo ou cliquez</p>
            </div>
            {formData.profilePhoto && (
              <div className="mt-4">
                <img
                  src={URL.createObjectURL(formData.profilePhoto)}
                  alt="Profile Preview"
                  className="w-32 h-32 object-cover rounded-full mt-2"
                />
              </div>
            )}
          </div>

          {/* Galerie */}
          <div className="mb-4">
            <label className="block text-sm font-semibold">Galerie d'images</label>
            <div
              {...getRootPropsGallery()}
              className="w-full p-6 mt-2 border border-dashed border-gray-300 rounded-md bg-gray-50 flex justify-center items-center cursor-pointer transition-colors duration-300 hover:bg-gray-100"
            >
              <input {...getInputPropsGallery()} className="hidden" />
              <p className="text-gray-500">Glissez-déposez vos images ici</p>
            </div>
            {formData.gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {formData.gallery.map((image, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(image)}
                    alt={`img-${idx}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setShowPageModal(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {hasPage ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
