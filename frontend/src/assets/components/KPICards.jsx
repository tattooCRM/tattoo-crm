import React, { useState } from "react";
import { RotateCw } from "lucide-react";
import KPISection from "./KPISection";
import PublicPageBox from "./PublicPageBox";
import AppointmentsSection from "./AppointmentsSection";
import AppointmentModal from "./AppointmentModal";
import PublicPageModal from "./PublicPageModal";

const appointments = [
  { time: "09:00", name: "Alice Dupont", style: "Old School", status: "Confirmé", statusColor: "bg-green-200 text-green-700" },
  { time: "11:30", name: "Maxime Leroy", style: "Réalisme", status: "En attente", statusColor: "bg-yellow-200 text-yellow-700" },
  { time: "14:00", name: "Chloé Martin", style: "Minimaliste", status: "Confirmé", statusColor: "bg-green-200 text-green-700" },
  { time: "16:00", name: "Lucas Bernard", style: "Traditionnel", status: "Confirmé", statusColor: "bg-green-200 text-green-700" },
  { time: "18:00", name: "Emma Roche", style: "Old School", status: "En attente", statusColor: "bg-yellow-200 text-yellow-700" },
];

export default function KPICards() {
  const [showApptModal, setShowApptModal] = useState(false);
  const [currentAppt, setCurrentAppt] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showPageModal, setShowPageModal] = useState(false);
  const [hasPage, setHasPage] = useState(false);

  const openApptModal = (appt) => {
    setCurrentAppt(appt);
    setShowApptModal(true);
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg flex gap-6 items-start">
      {/* Colonne gauche */}
      <div className="flex flex-col gap-6 w-2/5">
        <KPISection />
        <PublicPageBox hasPage={hasPage} setShowPageModal={setShowPageModal} />
      </div>

      {/* Colonne droite */}
      <AppointmentsSection
        appointments={appointments}
        refreshKey={refreshKey}
        setRefreshKey={setRefreshKey}
        openApptModal={openApptModal}
      />

      {/* Modals */}
      {showApptModal && (
        <AppointmentModal
          currentAppt={currentAppt}
          setShowApptModal={setShowApptModal}
        />
      )}
      {showPageModal && (
        <PublicPageModal
          hasPage={hasPage}
          setHasPage={setHasPage}
          setShowPageModal={setShowPageModal}
        />
      )}
    </div>
  );
}
