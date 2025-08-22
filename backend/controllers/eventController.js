const Event = require('../models/Agenda');

// Récupérer tous les événements d'un utilisateur
exports.getEventsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const events = await Event.find({ userId });
    res.json(events);
    mongoose.set('debug', true);

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Ajouter un événement
exports.createEvent = async (req, res) => {
  try {
    const { userId, title, description, date, time } = req.body;

    if (!userId || !title || !date || !time) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    const newEvent = new Event({ userId, title, description, date, time });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Modifier un événement
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedEvent) return res.status(404).json({ message: "Événement non trouvé" });

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
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
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
