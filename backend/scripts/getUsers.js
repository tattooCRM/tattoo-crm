const mongoose = require('mongoose');
const User = require('../models/User');

async function getUsers() {
  try {
    await mongoose.connect('mongodb+srv://t3mq:root@bennys.rkieo.mongodb.net/');
    
    const users = await User.find({ role: 'tattoo_artist' }).select('name prenom nom email role');
    console.log('👨‍🎨 Tatoueurs disponibles:');
    users.forEach(user => {
      console.log(`- ${user.name || `${user.prenom} ${user.nom}`} (${user.email}) - ID: ${user._id}`);
    });
    
    const clients = await User.find({ role: 'client' }).select('name prenom nom email role').limit(5);
    console.log('\n👤 Clients disponibles:');
    clients.forEach(user => {
      console.log(`- ${user.name || `${user.prenom} ${user.nom}`} (${user.email}) - ID: ${user._id}`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

getUsers();
