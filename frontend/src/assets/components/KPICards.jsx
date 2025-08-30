import React, { useState, useEffect } from "react";
import { RotateCw } from "lucide-react";
import KPISection from "./KPISection";
import PublicPageBox from "./PublicPageBox";
import AppointmentsSection from "./AppointmentsSection";
import AppointmentModal from "./AppointmentModal";
import PublicPageModal from "./PublicPageModal";
import { useEvents } from "../../hooks/useEvents";
import { usePublicPages } from "../../hooks/usePublicPages";

export default function KPICards() {
  const [showApptModal, setShowApptModal] = useState(false);
  const [currentAppt, setCurrentAppt] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showPageModal, setShowPageModal] = useState(false);
  const [pageRefreshKey, setPageRefreshKey] = useState(0);

  // Utiliser les hooks
  const { getUpcomingAppointments, refreshEvents, loading } = useEvents();
  const { page: userPage, loading: pageLoading, lastUpdate, refreshPage: refreshUserPage } = usePublicPages();

  // Effect pour rafraîchir quand lastUpdate change
  useEffect(() => {
    if (lastUpdate > 0) {
      setPageRefreshKey((prev) => prev + 1);
    }
  }, [lastUpdate]);

  const openApptModal = (appt) => {
    setCurrentAppt(appt);
    setShowApptModal(true);
  };

  const handleRefresh = () => {
    refreshEvents();
    refreshUserPage(); // Refresh également la page publique
    setRefreshKey((prev) => prev + 1);
    setPageRefreshKey((prev) => prev + 1);
  };

  const handlePageModalClose = () => {
    setShowPageModal(false);
    // Refresh la page après fermeture du modal
    setTimeout(() => {
      setPageRefreshKey((prev) => prev + 1);
    }, 100);
  };

  const handlePageUpdated = () => {
    // Callback appelé quand la page est mise à jour avec succès
    setPageRefreshKey((prev) => prev + 1);
    // Re-fetch les données pour s'assurer d'avoir les dernières infos
    setTimeout(() => {
      refreshUserPage();
      setPageRefreshKey((prev) => prev + 1);
    }, 300);
  };

  // Obtenir les prochains RDV depuis la base de données
  const upcomingAppointments = getUpcomingAppointments(5);

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      {/* En-tête avec bouton refresh global */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          title="Actualiser toutes les données"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Contenu principal */}
      <div className="flex gap-6 items-start">
        {/* Colonne gauche */}
        <div className="flex flex-col gap-6 w-2/5">
          <KPISection />
          <PublicPageBox 
            key={pageRefreshKey}
            hasPage={!!userPage} 
            setShowPageModal={setShowPageModal} 
            onPageUpdated={handlePageUpdated}
            loading={pageLoading} 
          />
        </div>

        {/* Colonne droite */}
        <AppointmentsSection
          appointments={upcomingAppointments}
          refreshKey={refreshKey}
          openApptModal={openApptModal}
          loading={loading}
        />
      </div>

      {/* Modals */}
      {showApptModal && (
        <AppointmentModal
          currentAppt={currentAppt}
          setShowApptModal={setShowApptModal}
        />
      )}
      {showPageModal && (
        <PublicPageModal
          hasPage={!!userPage}
          setShowPageModal={handlePageModalClose}
          onPageUpdated={handlePageUpdated}
        />
      )}
    </div>
  );
}
