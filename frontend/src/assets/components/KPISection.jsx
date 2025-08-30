import React from "react";
import { Calendar, Mail, ClipboardList, DollarSign, RotateCw } from "lucide-react";
import { useKPIs } from "../../hooks/useKPIs";

export default function KPISection() {
  const {
    todayAppointments,
    unreadMessages,
    activeProjects,
    monthlyRevenue,
    loading,
    error,
    refreshKPIs
  } = useKPIs();

  const kpis = [
    {
      id: 1,
      title: "RDV Aujourd'hui",
      value: loading ? "..." : todayAppointments,
      icon: <Calendar className="w-6 h-6 text-yellow-500" />,
      color: "bg-yellow-100",
      trend: todayAppointments > 0 ? "up" : "neutral"
    },
    {
      id: 2,
      title: "Messages non lus",
      value: loading ? "..." : unreadMessages,
      icon: <Mail className="w-6 h-6 text-blue-500" />,
      color: "bg-blue-100",
      trend: unreadMessages > 0 ? "alert" : "neutral"
    },
    {
      id: 3,
      title: "Projets en cours",
      value: loading ? "..." : activeProjects,
      icon: <ClipboardList className="w-6 h-6 text-gray-600" />,
      color: "bg-gray-100",
      trend: activeProjects > 0 ? "up" : "neutral"
    },
    {
      id: 4,
      title: "Revenus ce mois-ci",
      value: loading ? "..." : `${monthlyRevenue.toFixed(0)} €`,
      icon: <DollarSign className="w-6 h-6 text-green-500" />,
      color: "bg-green-100",
      trend: monthlyRevenue > 0 ? "up" : "neutral"
    },
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Résumé</h2>
        <button
          onClick={refreshKPIs}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
          title="Actualiser"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Erreur lors du chargement : {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className={`bg-white rounded-lg p-4 flex items-center gap-3 shadow-sm border border-gray-200 transition-all hover:shadow-md ${
              loading ? 'animate-pulse' : ''
            }`}
          >
            <div className={`p-3 rounded-lg ${kpi.color} flex items-center justify-center flex-shrink-0`}>
              {kpi.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium truncate">{kpi.title}</p>
              <div className="flex items-center gap-2">
                <p className="font-bold text-lg text-gray-900">{kpi.value}</p>
                {!loading && kpi.trend === "alert" && kpi.value > 0 && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
                {!loading && kpi.trend === "up" && kpi.value > 0 && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
