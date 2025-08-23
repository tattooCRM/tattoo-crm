import React from "react";
import { Eye } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export default function AppointmentCard({ appt, openApptModal }) {
  // Formater la date pour un affichage plus convivial
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const appointmentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if (appointmentDate.getTime() === today.getTime()) {
        return "Aujourd'hui";
      } else if (appointmentDate.getTime() === tomorrow.getTime()) {
        return "Demain";
      } else {
        return format(date, "EEE dd MMM", { locale: fr });
      }
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 flex items-center justify-between shadow mb-4">
      <div className="flex items-center gap-4">
        <div className="bg-blue-200 text-blue-700 rounded-md px-3 py-1 text-sm font-semibold">
          {appt.time}
        </div>
        <div>
          <p className="font-semibold">{appt.name}</p>
          <p className="text-xs italic text-gray-500">{appt.style}</p>
          {appt.date && (
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(appt.date)}
            </p>
          )}
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
