import { useState, useEffect } from 'react';

// Hook personnalisé pour gérer les événements
export function useEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Récupérer l'userId depuis localStorage
    const getUserId = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        return user?.id;
    };

    // Charger tous les événements
    const fetchEvents = async () => {
        const userId = getUserId();
        if (!userId) {
            setError("Utilisateur non connecté");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/events/${userId}`);
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des événements');
            }
            const data = await response.json();
            setEvents(data);
            setError(null);
        } catch (err) {
            console.error('Erreur chargement événements:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Charger les événements au montage du composant
    useEffect(() => {
        fetchEvents();
    }, []);

    // Fonction pour obtenir les prochains RDV (événements futurs triés par date/heure)
    const getUpcomingAppointments = (limit = 5) => {
        const now = new Date();
        
        return events
            .filter(event => {
                const eventDateTime = new Date(`${event.date}T${event.time}`);
                return eventDateTime > now;
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateA - dateB;
            })
            .slice(0, limit)
            .map(event => ({
                time: event.time,
                name: event.title,
                style: event.description || "Style non spécifié",
                status: "Confirmé",
                statusColor: "bg-green-200 text-green-700",
                date: event.date,
                id: event._id
            }));
    };

    // Fonction pour obtenir les événements d'aujourd'hui
    const getTodayAppointments = () => {
        const today = new Date().toISOString().split('T')[0];
        
        return events
            .filter(event => event.date === today)
            .sort((a, b) => a.time.localeCompare(b.time))
            .map(event => ({
                time: event.time,
                name: event.title,
                style: event.description || "Style non spécifié",
                status: "Confirmé",
                statusColor: "bg-green-200 text-green-700",
                date: event.date,
                id: event._id
            }));
    };

    // Fonction pour rafraîchir les événements
    const refreshEvents = () => {
        fetchEvents();
    };

    return {
        events,
        loading,
        error,
        getUpcomingAppointments,
        getTodayAppointments,
        refreshEvents
    };
}
