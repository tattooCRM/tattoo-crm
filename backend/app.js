const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());


// CORS pour autoriser ton frontend sur Vite (5173)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connecté');
    app.listen(5000, () => console.log('🚀 Serveur démarré sur le port 5000'));
  })
  .catch(err => console.error('Erreur de connexion à MongoDB :', err));
