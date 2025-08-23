const Event = require('../models/Agenda');

// Récupérer les événements d'un utilisateur
exports.getEventsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📅 Récupération des événements pour l'utilisateur: ${userId}`);
    
    const events = await Event.find({ userId });
    console.log(`✅ ${events.length} événements trouvés pour l'utilisateur ${userId}`);
    
    res.json(events);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des événements:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};require('../models/Agenda');
const mongoose = require('mongoose');

// Récupérer tous les événements d'un utilisateur
exports.getEventsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const events = await Event.find({ userId });
    res.json(events);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Ajouter un événement
exports.createEvent = async (req, res) => {
  try {
    const { userId, title, description, date, time } = req.body;

    console.log('Données reçues:', req.body);

    if (!userId || !title || !date || !time) {
      return res.status(400).json({ 
        message: "Champs manquants", 
        received: { userId, title, date, time } 
      });
    }

    const newEvent = new Event({ userId, title, description, date, time });
    const savedEvent = await newEvent.save();
    
    console.log('Événement créé avec succès:', savedEvent);
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

    console.log(`📝 Requête de mise à jour pour l'événement ${id}:`, updateData);

    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedEvent) {
      console.log(`❌ Événement ${id} non trouvé`);
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    console.log(`✅ Événement ${id} mis à jour avec succès:`, {
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
