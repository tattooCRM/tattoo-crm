import React, { useState, useEffect } from "react";
import { Edit3, Trash2, Plus, ExternalLink } from "lucide-react";
import { usePublicPages } from "../../hooks/usePublicPages";
import { useToast } from "../../hooks/useToast";
import ConfirmModal from "./ConfirmModal";

export default function PublicPageBox({ hasPage, setShowPageModal }) {
  const { page, deletePage, refreshPage } = usePublicPages();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await deletePage();
      toast.success("Page supprimée avec succès !");
      // Force un refresh du composant parent
      setTimeout(() => {
        refreshPage();
      }, 100);
    } catch (error) {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVisitPage = () => {
    if (page && page.slug) {
      window.open(`/artist/${page.slug}`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Ma page publique</h2>
        {hasPage && page && (
          <button
            onClick={handleVisitPage}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            title="Voir ma page"
          >
            <ExternalLink size={16} />
            Voir
          </button>
        )}
      </div>

      {hasPage && page ? (
        <div className="space-y-4">
          {/* Infos de la page */}
          <div className="bg-gray-50 rounded-md p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {page.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{page.title || page.username}</p>
                <p className="text-sm text-gray-500">/artist/{page.slug}</p>
              </div>
            </div>
            {page.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {page.description}
              </p>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowPageModal(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit3 size={16} />
              Modifier
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-500 mb-4">Vous n'avez pas encore de page publique</p>
          <button
            onClick={() => setShowPageModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-all shadow-md"
          >
            <Plus size={18} />
            Créer ma page
          </button>
        </div>
      )}

      {/* Modal de confirmation pour suppression */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la page publique"
        message="Êtes-vous sûr de vouloir supprimer votre page publique ? Cette action est irréversible et tous les visiteurs perdront l'accès à votre page."
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
