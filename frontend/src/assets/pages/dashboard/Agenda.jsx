import React, { useState, useEffect } from "react";
import {
    startOfWeek,
    addDays,
    format,
    isBefore,
    isToday,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Plus } from "lucide-react";

export default function Agenda({ userId }) {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const days = [...Array(7)].map((_, i) => addDays(start, i));
    const hours = ["08:00", "10:00", "12:00", "15:00", "17:00"];

    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        day: format(today, "yyyy-MM-dd"),
        time: "08:00",
    });

    // Charger les événements depuis le backend
    useEffect(() => {
        if (!userId) return; // Assure-toi d'avoir userId

        fetch(`/api/events/${userId}`)
            .then((res) => res.json())
            .then((data) => {
                // Adapter format si besoin
                setEvents(data);
            })
            .catch((err) => {
                console.error("Erreur chargement événements :", err);
            });
    }, [userId]);

    // Ajouter un événement : envoie POST au backend
    const handleAddEvent = (e) => {
        e.preventDefault();
        const newEvent = {
            userId: "id_utilisateur_ici", // il faut que tu récupères l'id de l'utilisateur connecté
            title: formData.title,
            description: formData.description,
            date: formData.day,
            time: formData.time,
        };

        console.log("Données envoyées au backend :", newEvent);

        fetch("http://localhost:5173/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newEvent),
        })
            .then(res => {
            if (!res.ok) throw new Error("Erreur création événement");
            return res.json();
        })
        .then((savedEvent) => {
            setEvents((prev) => [...prev, savedEvent]);
            setShowModal(false);
            setFormData({
                title: "",
                description: "",
                day: format(today, "yyyy-MM-dd"),
                time: "08:00",
            });
        })
        .catch(err => {
            console.error(err);
            alert("Erreur lors de la création de l'événement");
        });
};


// Fonction pour mettre à jour un événement (drag & drop ou autre)
const updateEvent = (updatedEvent) => {
    fetch(`/api/events/${updatedEvent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
    })
        .then(res => {
            if (!res.ok) throw new Error("Erreur mise à jour événement");
            return res.json();
        })
        .then((savedEvent) => {
            setEvents((prev) =>
                prev.map(ev => (ev._id === savedEvent._id ? savedEvent : ev))
            );
        })
        .catch(err => {
            console.error(err);
            alert("Erreur lors de la mise à jour de l'événement");
        });
};

return (
    <div className="p-4 bg-white rounded-2xl shadow-md w-full max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
                📅 Semaine en cours
            </h2>
            <button
                onClick={() => setShowModal(true)}
                className="bg-black text-white px-4 py-2 rounded shadow hover:bg-gray-700 transition"
            >
                <Plus size={16} label="Ajouter un événement" />
            </button>
        </div>

        <div className="grid grid-cols-8 border rounded-lg overflow-hidden min-h-[700px]">
            {/* Colonne des heures */}
            <div className="bg-gray-50 border-r flex flex-col">
                <div className="h-12"></div>
                {hours.map((hour, idx) => (
                    <div
                        key={idx}
                        className="h-28 flex items-start justify-end pr-2 text-sm text-gray-500"
                    >
                        {hour}
                    </div>
                ))}
            </div>

            {/* Colonnes des jours */}
            {days.map((day, idx) => {
                const isPast = isBefore(day, new Date().setHours(0, 0, 0, 0));
                const todayCheck = isToday(day);

                return (
                    <div
                        key={idx}
                        className={`flex flex-col border-r last:border-r-0 ${isPast ? "bg-gray-50 text-gray-400" : "bg-white"
                            }`}
                    >
                        {/* En-tête jour */}
                        <div
                            className={`h-12 flex flex-col items-center justify-center border-b ${todayCheck ? "border-blue-500 font-bold" : "border-gray-200"
                                }`}
                        >
                            <span className="text-sm capitalize">
                                {format(day, "EEEE", { locale: fr })}
                            </span>
                            <span className="text-lg">{format(day, "d")}</span>
                        </div>

                        {/* Cases horaires */}
                        {hours.map((hour, i) => (
                            <div
                                key={i}
                                className="h-28 border-b last:border-b-0 border-gray-200 relative"
                            // TODO: Ajouter ici logique drag & drop par case
                            >
                                {events
                                    .filter(
                                        (ev) =>
                                            ev.date === format(day, "yyyy-MM-dd") &&
                                            ev.time === hour
                                    )
                                    .map((ev) => (
                                        <div
                                            key={ev._id}
                                            title={ev.description}
                                            className="absolute top-1 left-1 right-1 bg-blue-500 text-white text-xs p-1 rounded shadow overflow-hidden cursor-pointer"
                                        // TODO: Ajouter drag handlers ici
                                        >
                                            <div className="font-semibold">{ev.title}</div>
                                            {ev.description && (
                                                <div className="text-[10px] opacity-80 truncate">
                                                    {ev.description}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>

        {/* Modal */}
        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div
                    className="bg-white rounded-lg p-6 shadow-lg transform transition-all scale-95 opacity-0 animate-fade-in"
                    style={{ minWidth: "320px" }}
                >
                    <h3 className="text-lg font-semibold mb-4">Ajouter un événement</h3>
                    <form onSubmit={handleAddEvent} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Titre</label>
                            <input
                                required
                                type="text"
                                className="w-full border px-3 py-2 rounded"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Description</label>
                            <textarea
                                rows="3"
                                className="w-full border px-3 py-2 rounded"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Jour</label>
                            <input
                                required
                                type="date"
                                className="w-full border px-3 py-2 rounded"
                                value={formData.day}
                                onChange={(e) =>
                                    setFormData({ ...formData, day: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Heure</label>
                            <select
                                className="w-full border px-3 py-2 rounded"
                                value={formData.time}
                                onChange={(e) =>
                                    setFormData({ ...formData, time: e.target.value })
                                }
                            >
                                {hours.map((h) => (
                                    <option key={h} value={h}>
                                        {h}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                            >
                                Ajouter
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Animation CSS */}
        <style>{`
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
);
}
