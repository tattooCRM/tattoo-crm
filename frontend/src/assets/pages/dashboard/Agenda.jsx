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
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    useDraggable,
    useDroppable
} from '@dnd-kit/core';

export default function Agenda() {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const days = [...Array(7)].map((_, i) => addDays(start, i));
    const hours = ["08:00", "10:00", "12:00", "15:00", "17:00"];

    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [renderKey, setRenderKey] = useState(0); // Pour forcer le re-rendu
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        day: format(today, "yyyy-MM-dd"),
        time: "08:00",
    });
    
    const [editFormData, setEditFormData] = useState({
        title: "",
        description: "",
        day: format(today, "yyyy-MM-dd"),
        time: "08:00",
    });

    // Configuration des sensors pour le drag & drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    // Récupérer l'userId depuis le localStorage
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                setUserId(userData.id || userData._id);
                setLoading(false);
            } catch (error) {
                console.error('Erreur lors du parsing des données utilisateur:', error);
                setLoading(false);
                window.location.href = '/login';
            }
        } else {
            // Rediriger vers login si pas d'utilisateur
            setLoading(false);
            window.location.href = '/login';
        }
    }, []);

    // Charger les événements depuis le backend
    useEffect(() => {
        if (!userId) return;

        fetch(`http://localhost:5000/api/events/${userId}`)
            .then((res) => res.json())
            .then((data) => {
                setEvents(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erreur chargement événements :", err);
                setLoading(false);
            });
    }, [userId]);

    // Ajouter un événement : envoie POST au backend
    const handleAddEvent = (e) => {
        e.preventDefault();
        
        if (!userId) {
            alert("Erreur: utilisateur non connecté");
            return;
        }
        
        const newEvent = {
            userId: userId,
            title: formData.title,
            description: formData.description,
            date: formData.day,
            time: formData.time,
        };

        console.log("Données envoyées au backend :", newEvent);
        console.log("UserId utilisé :", userId);

        fetch("http://localhost:5000/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newEvent),
        })
            .then(res => {
                console.log('Statut de la réponse:', res.status);
                if (!res.ok) {
                    return res.json().then(data => {
                        throw new Error(data.message || `Erreur ${res.status}: ${res.statusText}`);
                    });
                }
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
            console.error('Détails de l\'erreur:', err);
            alert(`Erreur lors de la création de l'événement: ${err.message}`);
        });
    };

    // Fonction pour ouvrir le modal d'édition
    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setEditFormData({
            title: event.title,
            description: event.description || "",
            day: event.date,
            time: event.time,
        });
        setShowEditModal(true);
    };

    // Fonction pour sauvegarder les modifications
    const handleUpdateEvent = (e) => {
        e.preventDefault();
        
        if (!editingEvent) return;
        
        const updatedEvent = {
            ...editingEvent,
            title: editFormData.title,
            description: editFormData.description,
            date: editFormData.day,
            time: editFormData.time
        };

        fetch(`http://localhost:5000/api/events/${editingEvent._id}`, {
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
                setShowEditModal(false);
                setEditingEvent(null);
                setEditFormData({
                    title: "",
                    description: "",
                    day: format(today, "yyyy-MM-dd"),
                    time: "08:00",
                });
            })
            .catch(err => {
                console.error(err);
                alert("Erreur lors de la mise à jour de l'événement");
            });
    };

    // Fonction pour supprimer un événement
    const handleDeleteEvent = () => {
        setShowDeleteConfirm(true);
    };

    // Confirmer la suppression
    const confirmDelete = () => {
        if (!editingEvent) return;
        
        fetch(`http://localhost:5000/api/events/${editingEvent._id}`, {
            method: 'DELETE',
        })
            .then(res => {
                if (!res.ok) throw new Error("Erreur suppression événement");
                return res.json();
            })
            .then(() => {
                setEvents((prev) => prev.filter(ev => ev._id !== editingEvent._id));
                setShowEditModal(false);
                setShowDeleteConfirm(false);
                setEditingEvent(null);
            })
            .catch(err => {
                console.error(err);
                alert("Erreur lors de la suppression de l'événement");
            });
    };

    // Annuler la suppression
    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    // Fonction pour mettre à jour un événement (drag & drop ou autre)
    const updateEvent = (updatedEvent, showSuccessMessage = false) => {
        fetch(`http://localhost:5000/api/events/${updatedEvent._id}`, {
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
                if (showSuccessMessage) {
                    // Optionnel: ajouter une notification toast ici
                    console.log('✅ Événement déplacé avec succès');
                }
            })
            .catch(err => {
                console.error(err);
                alert("Erreur lors de la mise à jour de l'événement");
                // Annuler le changement local en cas d'erreur
                setEvents(prevEvents =>
                    prevEvents.map(ev =>
                        ev._id === updatedEvent._id ? 
                            events.find(originalEv => originalEv._id === updatedEvent._id) || ev 
                            : ev
                    )
                );
            });
    };

    // Gestion du drag & drop
    const handleDragEnd = (event) => {
        const { active, over } = event;
        
        if (!over) return;
        
        // Récupérer l'événement déplacé
        const draggedEvent = events.find(ev => ev._id === active.id);
        if (!draggedEvent) return;
        
        // Parser les informations de destination depuis l'id du droppable
        const dropId = over.id;
        const parts = dropId.split('-');
        
        if (parts.length < 5 || parts[0] !== 'drop') {
            return;
        }
        
        // Reconstituer la date et l'heure
        const newDate = `${parts[1]}-${parts[2]}-${parts[3]}`;
        const newTime = parts[4];
        
        // Vérifier si c'est vraiment un changement
        if (draggedEvent.date === newDate && draggedEvent.time === newTime) {
            return;
        }
        
        // Créer l'événement mis à jour avec un nouvel objet
        const updatedEvent = {
            ...draggedEvent,
            date: newDate,
            time: newTime,
            // Ajouter un timestamp pour forcer la détection du changement
            _updatedAt: Date.now()
        };
        
        // Mettre à jour l'état local immédiatement
        setEvents(prevEvents => {
            const newEvents = prevEvents.map(ev => {
                if (ev._id === draggedEvent._id) {
                    return updatedEvent;
                }
                return ev;
            });
            
            // Forcer le re-rendu
            setRenderKey(prev => prev + 1);
            
            return newEvents;
        });
        
        // Ensuite envoyer au backend en arrière-plan
        const eventToSave = { ...updatedEvent };
        delete eventToSave._updatedAt; // Supprimer le timestamp temporaire
        
        fetch(`http://localhost:5000/api/events/${updatedEvent._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventToSave),
        })
        .then((savedEvent) => {
            // Re-synchroniser avec les données du serveur
            setEvents(prevEvents => 
                prevEvents.map(ev => 
                    ev._id === savedEvent._id ? savedEvent : ev
                )
            );
        })
        .catch(err => {
            console.error('Erreur sauvegarde:', err);
            alert("Erreur lors du déplacement.");
            // En cas d'erreur, revenir à l'état original
            setEvents(prevEvents => 
                prevEvents.map(ev => 
                    ev._id === updatedEvent._id ? draggedEvent : ev
                )
            );
        });
    };

    // Composant pour les événements draggables
    const DraggableEvent = ({ event }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            isDragging,
        } = useDraggable({
            id: event._id,
        });

        const style = {
            transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
            opacity: isDragging ? 0.8 : 1,
            zIndex: isDragging ? 1000 : 1,
            boxShadow: isDragging ? '0 10px 25px rgba(0,0,0,0.3)' : 'none',
            transition: isDragging ? 'none' : 'all 0.2s ease',
        };

        return (
            <div
                ref={setNodeRef}
                style={style}
                {...listeners}
                {...attributes}
                onDoubleClick={() => handleEditEvent(event)}
                className={`absolute top-1 left-1 right-1 bg-blue-500 text-white text-xs p-1 rounded shadow overflow-hidden cursor-grab active:cursor-grabbing select-none ${
                    isDragging ? 'rotate-2 scale-105' : ''
                }`}
                title={`${event.title} - Double-cliquez pour modifier`}
            >
                <div className="font-semibold">{event.title}</div>
                {event.description && (
                    <div className="text-[10px] opacity-80 truncate">
                        {event.description}
                    </div>
                )}
            </div>
        );
    };

    // Composant pour les zones de drop
    const DroppableTimeSlot = ({ date, time, children }) => {
        const { isOver, setNodeRef } = useDroppable({
            id: `drop-${date}-${time}`,
        });

        return (
            <div
                ref={setNodeRef}
                className={`flex-1 border-b last:border-b-0 border-gray-200 relative transition-all duration-200 ${
                    isOver ? 'bg-blue-50 border-blue-300 border-2 border-dashed' : 'hover:bg-gray-50'
                }`}
            >
                {isOver && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-75">
                            Déposer ici
                        </div>
                    </div>
                )}
                {children}
            </div>
        );
    };

    return (
        <>
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <p>Chargement...</p>
                </div>
            ) : (
                <DndContext
                    key={renderKey}
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
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

            <div className="grid grid-cols-8 border rounded-lg overflow-hidden h-[calc(100vh-10rem)]">
                {/* Colonne des heures */}
                <div className="bg-gray-50 border-r flex flex-col">
                    <div className="h-12"></div>
                    {hours.map((hour, idx) => (
                        <div
                            key={idx}
                            className="flex-1 flex items-start justify-end pr-2 text-sm text-gray-500 border-b last:border-b-0 border-gray-200"
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
                                <DroppableTimeSlot
                                    key={i}
                                    date={format(day, "yyyy-MM-dd")}
                                    time={hour}
                                >
                                    {(() => {
                                        const dayStr = format(day, "yyyy-MM-dd");
                                        const filteredEvents = events.filter(
                                            (ev) => ev.date === dayStr && ev.time === hour
                                        );
                                        return filteredEvents.map((ev) => (
                                            <DraggableEvent key={ev._id} event={ev} />
                                        ));
                                    })()}
                                </DroppableTimeSlot>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Modal pour ajouter un événement */}
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

            {/* Modal pour éditer un événement */}
            {showEditModal && editingEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        className="bg-white rounded-lg p-6 shadow-lg transform transition-all scale-95 opacity-0 animate-fade-in"
                        style={{ minWidth: "320px" }}
                    >
                        <h3 className="text-lg font-semibold mb-4">Modifier l'événement</h3>
                        <form onSubmit={handleUpdateEvent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Titre</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border px-3 py-2 rounded"
                                    value={editFormData.title}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, title: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Description</label>
                                <textarea
                                    rows="3"
                                    className="w-full border px-3 py-2 rounded"
                                    value={editFormData.description}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, description: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Jour</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full border px-3 py-2 rounded"
                                    value={editFormData.day}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, day: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Heure</label>
                                <select
                                    className="w-full border px-3 py-2 rounded"
                                    value={editFormData.time}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, time: e.target.value })
                                    }
                                >
                                    {hours.map((h) => (
                                        <option key={h} value={h}>
                                            {h}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-center items-center gap-6">
                                {!showDeleteConfirm ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleDeleteEvent}
                                            className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                                        >
                                            Supprimer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowEditModal(false)}
                                            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                                        >
                                            Enregistrer
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <p className="text-sm text-gray-700">Êtes-vous sûr de vouloir supprimer cet événement ?</p>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={cancelDelete}
                                                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                                            >
                                                Non, annuler
                                            </button>
                                            <button
                                                type="button"
                                                onClick={confirmDelete}
                                                className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                                            >
                                                Oui, supprimer
                                            </button>
                                        </div>
                                    </div>
                                )}
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
            
            /* Styles pour le drag & drop */
            .cursor-grab {
              cursor: grab;
            }
            .cursor-grabbing {
              cursor: grabbing !important;
            }
            
            /* Animation pour le survol des zones de drop */
            .drop-zone-hover {
              background-color: rgba(59, 130, 246, 0.1);
              border-color: rgba(59, 130, 246, 0.3);
              transition: all 0.2s ease-in-out;
            }
          `}</style>
                    </div>
                </DndContext>
            )}
        </>
    );
}
