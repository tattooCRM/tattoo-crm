import React from 'react';
import { MessageCircle, Calendar, User, Mail, Phone, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const startChat = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header pour clients */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">InkStudio</h1>
            <span className="text-sm text-gray-500">Espace Client</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
            
            <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
              {user?.nom ? user.nom.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.nom || user?.prenom || 'Client'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        
        {/* Message de bienvenue */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Bienvenue {user?.prenom || user?.nom || 'sur InkStudio'} ! 🎨
          </h2>
          <p className="text-gray-600">
            Votre espace personnel pour découvrir nos artistes tatoueurs et prendre rendez-vous.
          </p>
        </div>

        {/* Fonctionnalités disponibles */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Chat avec tatoueur */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Chat en Direct</h3>
                <p className="text-sm text-gray-600">Discutez avec nos tatoueurs</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Posez vos questions, partagez vos idées et discutez de votre projet directement avec nos artistes.
            </p>
            <button 
              className="w-full bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={startChat}
            >
              Démarrer une conversation
            </button>
          </div>

          {/* Prendre rendez-vous */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Prendre RDV</h3>
                <p className="text-sm text-gray-600">Réservez votre séance</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Consultez les créneaux disponibles et réservez directement votre rendez-vous.
            </p>
            <button 
              className="w-full bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={() => alert('Système de réservation bientôt disponible ! 📅')}
            >
              Voir les disponibilités
            </button>
          </div>

          {/* Galerie des artistes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Nos Artistes</h3>
                <p className="text-sm text-gray-600">Découvrez leur travail</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Explorez les portfolios de nos tatoueurs et trouvez le style qui vous correspond.
            </p>
            <button 
              className="w-full bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={() => alert('Galerie des artistes bientôt disponible ! 🎨')}
            >
              Voir la galerie
            </button>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Contact</h3>
                <p className="text-sm text-gray-600">Infos & localisation</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>01 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>contact@inkstudio.com</span>
              </div>
              <p className="mt-3">
                📍 123 Rue de l'Art, 75001 Paris
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-gray-100 rounded-xl p-6 mt-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">🚧 En développement</h3>
          <p className="text-gray-600 text-sm">
            Ces fonctionnalités sont actuellement en développement. 
            Revenez bientôt pour profiter de toutes les nouveautés !
          </p>
        </div>
      </div>
    </div>
  );
}
