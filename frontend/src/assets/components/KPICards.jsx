import React, { useState } from "react";
import { Calendar, Mail, ClipboardList, DollarSign, Eye, RotateCw } from "lucide-react";

const kpis = [
  {
    id: 1,
    title: "RDV Aujourd’hui",
    value: 3,
    icon: <Calendar className="w-6 h-6 text-yellow-500" />,
    color: "bg-yellow-100",
    iconColor: "text-yellow-500",
  },
  {
    id: 2,
    title: "Messages non lus",
    value: 5,
    icon: <Mail className="w-6 h-6 text-blue-500" />,
    color: "bg-blue-100",
    iconColor: "text-blue-500",
  },
  {
    id: 3,
    title: "Projets en cours",
    value: 7,
    icon: <ClipboardList className="w-6 h-6 text-purple-500" />,
    color: "bg-purple-100",
    iconColor: "text-purple-500",
  },
  {
    id: 4,
    title: "Revenus ce mois-ci",
    value: "1 250 €",
    icon: <DollarSign className="w-6 h-6 text-green-500" />,
    color: "bg-green-100",
    iconColor: "text-green-500",
  },
];

const appointments = [
  { time: "09:00", name: "Alice Dupont", style: "Old School", status: "Confirmé", statusColor: "bg-green-200 text-green-700" },
  { time: "11:30", name: "Maxime Leroy", style: "Réalisme", status: "En attente", statusColor: "bg-yellow-200 text-yellow-700" },
  { time: "14:00", name: "Chloé Martin", style: "Minimaliste", status: "Confirmé", statusColor: "bg-green-200 text-green-700" },
  { time: "16:00", name: "Lucas Bernard", style: "Traditionnel", status: "Confirmé", statusColor: "bg-green-200 text-green-700" },
  { time: "18:00", name: "Emma Roche", style: "Old School", status: "En attente", statusColor: "bg-yellow-200 text-yellow-700" },
];

export default function KPICards() {
  const [showModal, setShowModal] = useState(false);
  const [currentAppt, setCurrentAppt] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const openModal = (appt) => {
    setCurrentAppt(appt);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentAppt(null);
  };

  // Fonction refresh (force re-render)
  const refreshAppointments = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg flex gap-6 items-start">
      {/* Résumé - KPI Cards */}
      <div className="bg-gray-300 rounded-lg p-6 w-2/5">
        <h2 className="font-semibold mb-4">Résumé</h2>
        <div className="grid grid-cols-2 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="bg-white rounded-md p-4 flex items-center gap-4 shadow"
            >
              <div
                className={`p-3 rounded-md ${kpi.color} flex items-center justify-center`}
              >
                {kpi.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500">{kpi.title}</p>
                <p className="font-bold text-lg">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prochains RDV */}
      <div className="p-6 bg-gray-300 rounded-lg w-3/5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Prochains RDV</h2>
          <button
            onClick={refreshAppointments}
            className="flex items-center gap-2 px-3 py-1 border border-zinc-400 rounded bg-zinc-200 bg-opacity-50 hover:bg-opacity-25  text-sm text-zinc-700"
            aria-label="Rafraîchir les rendez-vous"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        <div key={refreshKey}>
          {appointments.map((appt, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg p-4 flex items-center justify-between shadow mb-4"
            >
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
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${appt.statusColor}`}
                >
                  {appt.status}
                </span>
                {/* Bouton "Voir détails" */}
                <button
                  onClick={() => openModal(appt)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-200 bg-opacity-50 border border-zinc-400 rounded hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition"
                >
                  <Eye className="w-5 h-5 text-zinc-700" />
                  Voir détails
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold"
            >
              ×
            </button>

            <h3 className="text-xl font-bold mb-2">{currentAppt.name}</h3>
            <p className="italic text-gray-500 mb-4">{currentAppt.style}</p>

            <div className="flex gap-3 mb-4 overflow-x-auto">
              <img
                src="https://via.placeholder.com/100"
                alt="photo 1"
                className="rounded shadow"
              />
              <img
                src="https://via.placeholder.com/100"
                alt="photo 2"
                className="rounded shadow"
              />
              <img
                src="https://via.placeholder.com/100"
                alt="photo 3"
                className="rounded shadow"
              />
            </div>

            <div>
              <h4 className="font-semibold mb-1">Commentaires</h4>
              <p>Quelques notes importantes à propos de ce rendez-vous...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
