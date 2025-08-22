import React from "react";
import { Eye } from "lucide-react";

export default function AppointmentCard({ appt, openApptModal }) {
  return (
    <div className="bg-white rounded-lg p-4 flex items-center justify-between shadow mb-4">
      <div className="flex items-center gap-4">
        <div className="bg-blue-200 text-blue-700 rounded-md px-3 py-1 text-sm font-semibold">
          {appt.time}
        </div>
        <div>
          <p className="font-semibold">{appt.name}</p>
          <p className="text-xs italic text-gray-500">{appt.style}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${appt.statusColor}`}>
          {appt.status}
        </span>
        <button
          onClick={() => openApptModal(appt)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-200 bg-opacity-50 border border-zinc-400 rounded hover:bg-opacity-75"
        >
          <Eye className="w-5 h-5 text-zinc-700" />
          Voir détails
        </button>
      </div>
    </div>
  );
}
