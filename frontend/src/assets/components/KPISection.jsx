import React from "react";
import { Calendar, Mail, ClipboardList, DollarSign } from "lucide-react";

const kpis = [
  { id: 1, title: "RDV Aujourd’hui", value: 3, icon: <Calendar className="w-6 h-6 text-yellow-500" />, color: "bg-yellow-100" },
  { id: 2, title: "Messages non lus", value: 5, icon: <Mail className="w-6 h-6 text-blue-500" />, color: "bg-blue-100" },
  { id: 3, title: "Projets en cours", value: 7, icon: <ClipboardList className="w-6 h-6 text-purple-500" />, color: "bg-purple-100" },
  { id: 4, title: "Revenus ce mois-ci", value: "1 250 €", icon: <DollarSign className="w-6 h-6 text-green-500" />, color: "bg-green-100" },
];

export default function KPISection() {
  return (
    <div className="bg-gray-300 rounded-lg p-6">
      <h2 className="font-semibold mb-4">Résumé</h2>
      <div className="grid grid-cols-2 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="bg-white rounded-md p-4 flex items-center gap-4 shadow">
            <div className={`p-3 rounded-md ${kpi.color} flex items-center justify-center`}>
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
  );
}
