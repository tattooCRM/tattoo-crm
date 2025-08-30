const Event = require('../models/Agenda');
const mongoose = require('mongoose');

// Récupérer tous les événements d'un utilisateur avec filtrage par date
exports.getEventsByUser = async (req, res) => {
  try {
    const userId = req.user.id; // Récupérer l'ID depuis le token
    const { date } = req.query; // Paramètre de date optionnel
    
    let query = { userId };
    
    // Si une date est spécifiée, filtrer par cette date
    if (date) {
      query.date = date;
    }
    
    const events = await Event.find(query);
    
    res.json({ 
      events,
      count: events.length,
      date: date || 'all'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Ajouter un événement
exports.createEvent = async (req, res) => {
  try {
    const userId = req.user.id; // Prendre l'ID depuis le token
    const { title, description, date, time } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ 
        message: "Champs manquants", 
        received: { title, date, time } 
      });
    }

    const newEvent = new Event({ userId, title, description, date, time });
    const savedEvent = await newEvent.save();
    
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Modifier un événement
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;


    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    console.log('Event updated:', {
      title: updatedEvent.title,
      date: updatedEvent.date,
      time: updatedEvent.time
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'événement:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer un événement
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) return res.status(404).json({ message: "Événement non trouvé" });

    res.json({ message: "Événement supprimé" });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
