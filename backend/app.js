const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const publicPageRoutes = require('./routes/publicPageRoutes');
const chatRoutes = require('./routes/chatRoutes');
const quoteRoutes = require('./routes/quoteRoutes');

// Import User model for debug
const User = require('./models/User');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// CORS pour autoriser ton frontend sur Vite (5173 et 5174)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/public-pages', publicPageRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));

// Route de debug temporaire (à supprimer en production)
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role slug createdAt');
    res.json({ users, total: users.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/debug/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json({ user: user || null, found: !!user });
  } catch (error) {
    res.status(500).json({ error: error.message, valid: false });
  }
});

// Connexion MongoDB avec options de configuration
const mongoOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout après 5 secondes
  socketTimeoutMS: 45000,
};

mongoose.connect(process.env.MONGO_URI, mongoOptions)
  .then(() => {
    console.log('✅ Connexion MongoDB réussie');
    app.listen(5000, () => {
      console.log('🚀 Serveur démarré sur le port 5000');
    });
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB :', err);
    // Démarre quand même le serveur pour les fonctionnalités qui ne nécessitent pas MongoDB
    app.listen(5000, () => {
      console.log('⚠️  Serveur démarré sur le port 5000 (sans MongoDB)');
    });
  });
