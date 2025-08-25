import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    startOfWeek,
    addDays,
    format,
    isBefore,
    isToday,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Plus } from "lucide-react";
import { useNotifications } from "../../../contexts/NotificationContext";
import { useNotificationsSystem } from "../../../contexts/NotificationsContext";
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
    const { updateAgendaBadge } = useNotifications();
    const { 
        addEventCreatedNotification, 
        addEventUpdatedNotification, 
        addEventDeletedNotification, 
        addEventMovedNotification,
        addSystemNotification
    } = useNotificationsSystem();
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    
    // Mémoriser les jours de la semaine pour éviter les recalculs
    const days = useMemo(() => [...Array(7)].map((_, i) => addDays(start, i)), [start]);
    
    // Heures affichées dans l'agenda (créneaux de 2h en 2h)
    const displayHours = [
        "08:00", "10:00", "12:00", 
        "14:00", "16:00", "18:00"
    ];
    
    // Toutes les heures disponibles dans le formulaire (avec demi-heures)
    const allHours = [
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
        "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", 
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
        "17:00", "17:30", "18:00"
    ];
    
    // Couleurs pour les événements
    const eventColors = [
        "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", 
        "bg-indigo-500", "bg-red-500", "bg-yellow-500", "bg-teal-500",
        "bg-orange-500", "bg-cyan-500"
    ];
    
    // Fonction pour obtenir une couleur basée sur le titre
    const getEventColor = (title) => {
        let hash = 0;
        for (let i = 0; i < title.length; i++) {
            hash = title.charCodeAt(i) + ((hash << 5) - hash);
        }
        return eventColors[Math.abs(hash) % eventColors.length];
    };

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
        time: "09:00",
        color: "bg-blue-500", // Couleur par défaut
    });
    
    const [editFormData, setEditFormData] = useState({
        title: "",
        description: "",
        day: format(today, "yyyy-MM-dd"),
        time: "09:00",
        color: "bg-blue-500",
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
            color: formData.color,
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
            // Ajouter une notification de création
            addEventCreatedNotification(savedEvent.title, savedEvent.date, savedEvent.time);
            setShowModal(false);
            setFormData({
                title: "",
                description: "",
                day: format(today, "yyyy-MM-dd"),
                time: "09:00",
                color: "bg-blue-500",
            });
        })
        .catch(err => {
            console.error('Détails de l\'erreur:', err);
            addSystemNotification('Erreur de création', `Impossible de créer l'événement: ${err.message}`, 'error');
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
            color: event.color || getEventColor(event.title),
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
            time: editFormData.time,
            color: editFormData.color,
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
                // Ajouter une notification de modification
                addEventUpdatedNotification(savedEvent.title, savedEvent.date, savedEvent.time);
                setShowEditModal(false);
                setEditingEvent(null);
                setEditFormData({
                    title: "",
                    description: "",
                    day: format(today, "yyyy-MM-dd"),
                    time: "09:00",
                    color: "bg-blue-500",
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
                // Ajouter une notification de suppression
                addEventDeletedNotification(editingEvent.title);
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
        .then(res => res.json())
        .then((savedEvent) => {
            // Re-synchroniser avec les données du serveur
            setEvents(prevEvents => 
                prevEvents.map(ev => 
                    ev._id === savedEvent._id ? savedEvent : ev
                )
            );
            // Ajouter une notification de déplacement avec les données correctes
            addEventMovedNotification(updatedEvent.title, updatedEvent.date, updatedEvent.time);
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
    const DraggableEvent = ({ event, isHalfHour = false }) => {
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
            boxShadow: isDragging ? '0 10px 25px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
            transition: isDragging ? 'none' : 'all 0.2s ease',
        };

        const eventColor = event.color || getEventColor(event.title);

        return (
            <div
                ref={setNodeRef}
                style={style}
                {...listeners}
                {...attributes}
                onDoubleClick={() => handleEditEvent(event)}
                className={`absolute left-1 right-1 ${eventColor} text-white text-xs p-2 rounded-lg shadow-lg overflow-hidden cursor-grab active:cursor-grabbing select-none transform hover:scale-105 ${
                    isDragging ? 'rotate-2 scale-105' : ''
                } ${isHalfHour ? 'top-8' : 'top-1'}`}
                title={`${event.title} - ${event.time} - Double-cliquez pour modifier`}
            >
                <div className="font-semibold truncate">{event.title}</div>
                <div className="text-[9px] opacity-75 mt-0.5">{event.time}</div>
                {event.description && (
                    <div className="text-[10px] opacity-90 truncate mt-1">
                        {event.description}
                    </div>
                )}
                <div className="absolute top-1 right-1 w-2 h-2 bg-white bg-opacity-30 rounded-full"></div>
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
                className={`flex-1 border-b border-gray-100 last:border-b-0 relative transition-all duration-300 ${
                    isOver 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 border-2 border-dashed shadow-inner' 
                        : 'hover:bg-gray-50/50'
                }`}
            >
                {isOver && (
                    <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                        <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full opacity-90 font-medium shadow-lg">
                            📍 Déposer ici
                        </div>
                    </div>
                )}
                {children}
            </div>
        );
    };

    // Calculer le nombre d'événements pour la semaine en cours
    const getWeekEventsCount = useCallback(() => {
        const weekDates = days.map(day => format(day, "yyyy-MM-dd"));
        const weekEvents = events.filter(event => weekDates.includes(event.date));
        return weekEvents.length;
    }, [days, events]);

    // Mettre à jour le badge de notification quand les événements changent
    useEffect(() => {
        // Ne pas mettre à jour le badge pendant le chargement
        if (loading) return;
        
        const weekEventsCount = getWeekEventsCount();
        updateAgendaBadge(weekEventsCount);
    }, [loading, getWeekEventsCount, updateAgendaBadge]);

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
                    <div className="p-6 bg-white rounded-2xl shadow-lg w-full max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        📅 Agenda de la semaine
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Du {format(days[0], "d MMMM", { locale: fr })} au {format(days[6], "d MMMM yyyy", { locale: fr })}
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-black text-white px-6 py-3 rounded-xl shadow-lg hover:bg-gray-800 transition-all transform hover:scale-105 flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span className="font-medium">Nouveau RDV</span>
                </button>
            </div>

            <div className="grid grid-cols-8 border border-gray-200 rounded-xl overflow-hidden shadow-sm" style={{ height: 'calc(100vh - 10rem)' }}>
                {/* Colonne des heures */}
                <div className="bg-gray-50 border-r border-gray-200 flex flex-col">
                    <div className="h-16 border-b border-gray-200 flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Heures</span>
                    </div>
                    {displayHours.map((hour, idx) => {
                        // Calculer l'heure de fin pour le créneau de 2h
                        const startHour = parseInt(hour.split(':')[0]);
                        const endHour = startHour + 2;
                        const timeRange = `${hour}-${endHour.toString().padStart(2, '0')}:00`;
                        
                        return (
                            <div
                                key={idx}
                                className="flex-1 flex items-start justify-end pr-3 pt-1 text-xs font-medium text-gray-600 border-b border-gray-100 last:border-b-0"
                            >
                                {timeRange}
                            </div>
                        );
                    })}
                </div>
                {/* Colonnes des jours */}
                {days.map((day, idx) => {
                    const isPast = isBefore(day, new Date().setHours(0, 0, 0, 0));
                    const todayCheck = isToday(day);

                    return (
                        <div
                            key={idx}
                            className={`flex flex-col border-r border-gray-200 last:border-r-0 ${
                                isPast ? "bg-gray-50/50" : "bg-white"
                            } ${todayCheck ? "bg-blue-50/30" : ""}`}
                        >
                            {/* En-tête jour */}
                            <div
                                className={`h-16 flex flex-col items-center justify-center border-b border-gray-200 ${
                                    todayCheck ? "bg-blue-500 text-white" : "bg-white"
                                } transition-all`}
                            >
                                <span className={`text-xs font-semibold uppercase tracking-wide ${
                                    todayCheck ? "text-blue-100" : "text-gray-500"
                                }`}>
                                    {format(day, "EEE", { locale: fr })}
                                </span>
                                <span className={`text-xl font-bold ${
                                    todayCheck ? "text-white" : "text-gray-800"
                                }`}>
                                    {format(day, "d")}
                                </span>
                            </div>

                            {/* Cases horaires */}
                            {displayHours.map((hour, i) => (
                                <DroppableTimeSlot
                                    key={i}
                                    date={format(day, "yyyy-MM-dd")}
                                    time={hour}
                                >
                                    {(() => {
                                        const dayStr = format(day, "yyyy-MM-dd");
                                        // Afficher tous les événements qui tombent dans ce créneau de 2h
                                        const filteredEvents = events.filter((ev) => {
                                            if (ev.date !== dayStr) return false;
                                            
                                            const eventHour = parseInt(ev.time.split(':')[0]);
                                            const slotHour = parseInt(hour.split(':')[0]);
                                            
                                            // L'événement est dans ce créneau de 2h
                                            return eventHour >= slotHour && eventHour < (slotHour + 2);
                                        });
                                        return filteredEvents.map((ev) => (
                                            <DraggableEvent 
                                                key={ev._id} 
                                                event={ev} 
                                                isHalfHour={ev.time.endsWith(':30')}
                                            />
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl transform transition-all scale-95 opacity-0 animate-fade-in w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Nouvel événement</h3>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddEvent} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Titre</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Nom du client ou titre"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        rows="3"
                                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Détails du rendez-vous..."
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            value={formData.day}
                                            onChange={(e) =>
                                                setFormData({ ...formData, day: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Heure</label>
                                        <select
                                            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            value={formData.time}
                                            onChange={(e) =>
                                                setFormData({ ...formData, time: e.target.value })
                                            }
                                        >
                                            {allHours.map((h) => (
                                                <option key={h} value={h}>
                                                    {h}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Couleur</label>
                                    <div className="flex flex-wrap gap-2">
                                        {eventColors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color })}
                                                className={`w-8 h-8 rounded-full ${color} ring-2 transition-all ${
                                                    formData.color === color 
                                                        ? 'ring-gray-800 scale-110' 
                                                        : 'ring-gray-300 hover:ring-gray-400'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-all shadow-lg"
                                    >
                                        Créer l'événement
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal pour éditer un événement */}
            {showEditModal && editingEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl transform transition-all scale-95 opacity-0 animate-fade-in w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Modifier l'événement</h3>
                                <button 
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <form onSubmit={handleUpdateEvent} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Titre</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Nom du client ou titre"
                                        value={editFormData.title}
                                        onChange={(e) =>
                                            setEditFormData({ ...editFormData, title: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        rows="3"
                                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Détails du rendez-vous..."
                                        value={editFormData.description}
                                        onChange={(e) =>
                                            setEditFormData({ ...editFormData, description: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            value={editFormData.day}
                                            onChange={(e) =>
                                                setEditFormData({ ...editFormData, day: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Heure</label>
                                        <select
                                            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            value={editFormData.time}
                                            onChange={(e) =>
                                                setEditFormData({ ...editFormData, time: e.target.value })
                                            }
                                        >
                                            {allHours.map((h) => (
                                                <option key={h} value={h}>
                                                    {h}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Couleur</label>
                                    <div className="flex flex-wrap gap-2">
                                        {eventColors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setEditFormData({ ...editFormData, color })}
                                                className={`w-8 h-8 rounded-full ${color} ring-2 transition-all ${
                                                    editFormData.color === color 
                                                        ? 'ring-gray-800 scale-110' 
                                                        : 'ring-gray-300 hover:ring-gray-400'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-center items-center gap-3 pt-4">
                                    {!showDeleteConfirm ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleDeleteEvent}
                                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all"
                                            >
                                                Supprimer
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowEditModal(false)}
                                                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-all shadow-lg"
                                            >
                                                Enregistrer
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 p-4 bg-red-50 rounded-xl">
                                            <p className="text-sm font-medium text-red-800 text-center">
                                                ⚠️ Êtes-vous sûr de vouloir supprimer cet événement ?
                                            </p>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={cancelDelete}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                                                >
                                                    Non, annuler
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={confirmDelete}
                                                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all"
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
                </div>
            )}

            {/* Animation CSS */}
            <style>{`
            @keyframes fade-in {
              0% {
                opacity: 0;
                transform: scale(0.95) translateY(-10px);
              }
              100% {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
            .animate-fade-in {
              animation: fade-in 0.3s ease-out forwards;
            }
            
            /* Styles pour le drag & drop */
            .cursor-grab {
              cursor: grab;
            }
            .cursor-grabbing {
              cursor: grabbing !important;
            }
            
            /* Animation pour les événements */
            .event-hover {
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .event-hover:hover {
              transform: translateY(-2px) scale(1.02);
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }
            
            /* Animation pour les zones de drop */
            .drop-zone-hover {
              background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
              border-color: rgba(59, 130, 246, 0.3);
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            /* Scrollbar personnalisée */
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 3px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 3px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `}</style>
                    </div>
                </DndContext>
            )}
        </>
    );
}
