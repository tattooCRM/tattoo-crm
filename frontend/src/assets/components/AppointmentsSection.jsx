import React from "react";
import { RotateCw } from "lucide-react";
import AppointmentCard from "./AppointmentCard";

export default function AppointmentsSection({ appointments, refreshKey, setRefreshKey, openApptModal }) {
  return (
    <div className="p-6 bg-gray-300 rounded-lg w-3/5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Prochains RDV</h2>
        <button
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="flex items-center gap-2 px-3 py-1 border border-zinc-400 rounded bg-zinc-200 bg-opacity-50 hover:bg-opacity-25 text-sm text-zinc-700"
        >
          <RotateCw className="w-5 h-5" />
        </button>
      </div>

      <div key={refreshKey}>
        {appointments.map((appt, idx) => (
          <AppointmentCard key={idx} appt={appt} openApptModal={openApptModal} />
        ))}
      </div>
    </div>
  );
}
