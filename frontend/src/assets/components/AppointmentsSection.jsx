import React from "react";
import AppointmentCard from "./AppointmentCard";

export default function AppointmentsSection({ appointments, refreshKey, openApptModal, loading }) {
  return (
    <div className="p-6 bg-gray-300 rounded-lg w-3/5">
      <div className="mb-4">
        <h2 className="font-semibold text-lg">Agenda</h2>
      </div>

      <div key={refreshKey}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-600">Chargement des rendez-vous...</div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-gray-600">
              <p className="text-lg font-medium">Aucun rendez-vous à venir</p>
              <p className="text-sm mt-1">Vos prochains RDV apparaîtront ici</p>
            </div>
          </div>
        ) : (
          appointments.map((appt, idx) => (
            <AppointmentCard key={appt.id || idx} appt={appt} openApptModal={openApptModal} />
          ))
        )}
      </div>
    </div>
  );
}
