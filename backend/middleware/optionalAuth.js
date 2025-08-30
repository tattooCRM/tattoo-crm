const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware d'authentification optionnel - ne bloque pas si le token est manquant
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id);
        
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Si le token est invalide, on continue sans utilisateur authentifié
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = optionalAuthMiddleware;
