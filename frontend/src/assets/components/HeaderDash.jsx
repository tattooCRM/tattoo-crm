import { ChevronRight, Search, Bell, Plus, Settings, User, LogOut, UserCircle, X, Trash2 } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useNotificationsSystem } from "../../contexts/NotificationsContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DashboardTopBar({ breadcrumbs = [], onSearch }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all');
  const profileMenuRef = useRef(null);
  const notificationsMenuRef = useRef(null);
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Utiliser le système de notifications
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    deleteNotification, 
    markAllAsRead, 
    clearAll 
  } = useNotificationsSystem();

  // Fermer les menus quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target)) {
        setShowNotificationsMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setShowProfileModal(true);
    setShowProfileMenu(false);
  };

  const handleSettingsClick = () => {
    setShowSettingsModal(true);
    setShowProfileMenu(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowProfileMenu(false);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
    setShowLogoutModal(false);
  };

  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleDeleteNotification = (notificationId, event) => {
    event.stopPropagation();
    deleteNotification(notificationId);
  };

  // Filtrer les notifications selon le type sélectionné
  const filteredNotifications = useMemo(() => {
    if (notificationFilter === 'all') return notifications;
    return notifications.filter(notification => {
      if (notificationFilter === 'events') {
        return notification.type?.startsWith('event_');
      }
      if (notificationFilter === 'clients') {
        return notification.type?.startsWith('client_');
      }
      if (notificationFilter === 'system') {
        return notification.type?.startsWith('system_');
      }
      return true;
    });
  }, [notifications, notificationFilter]);

  const filterOptions = [
    { value: 'all', label: 'Toutes', icon: '📋' },
    { value: 'events', label: 'Événements', icon: '📅' },
    { value: 'clients', label: 'Clients', icon: '👤' },
    { value: 'system', label: 'Système', icon: '⚙️' },
  ];

  return (
    <header className="flex items-center justify-between bg-white border-b px-4 py-2">
      
      {/* Left : Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight size={14} className="mx-1 text-gray-400" />
            )}
            {index < breadcrumbs.length - 1 ? (
              <span className="hover:underline cursor-pointer">{crumb}</span>
            ) : (
              <span className="font-medium text-gray-800">{crumb}</span>
            )}
          </div>
        ))}
      </div>

      {/* Middle : Search (hidden on small screens) */}
      <div className="hidden md:block w-1/3 relative">
        <Search
          className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Rechercher..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full pl-8 pr-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Right : Actions */}
      <div className="flex items-center gap-3">

        {/* Notifications */}
        <div className="relative" ref={notificationsMenuRef}>
          <button 
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotificationsMenu && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Tout marquer lu
                      </button>
                    )}
                    <button
                      onClick={clearAll}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Tout effacer
                    </button>
                  </div>
                </div>
                
                {/* Filtres */}
                <div className="flex gap-1">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setNotificationFilter(option.value)}
                      className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 transition-colors ${
                        notificationFilter === option.value
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell size={24} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">
                      {notificationFilter === 'all' ? 'Aucune notification' : `Aucune notification de type "${filterOptions.find(f => f.value === notificationFilter)?.label}"`}
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`group relative px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-all ${
                          notification.isRead 
                            ? 'border-l-transparent' 
                            : 'border-l-blue-500 bg-blue-50/50'
                        }`}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-lg">{notification.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                  notification.isRead ? 'text-gray-700' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                </p>
                                <p className={`text-xs mt-1 ${
                                  notification.isRead ? 'text-gray-500' : 'text-gray-600'
                                }`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Il y a {notification.time}
                                </p>
                              </div>
                              <button
                                onClick={(e) => handleDeleteNotification(notification.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-full transition-all ml-2"
                              >
                                <X size={12} className="text-red-500" />
                              </button>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-4 right-4"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-100">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Voir toutes les notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile avatar */}
        <div className="relative" ref={profileMenuRef}>
          <div 
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <User size={18} className="text-gray-600" />
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">John Marpaung</p>
                    <p className="text-xs text-gray-500">john@gmail.com</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button 
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UserCircle size={16} />
                  Mon Profil
                </button>
                <button 
                  onClick={handleSettingsClick}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={16} />
                  Paramètres
                </button>
                <hr className="my-2 border-gray-100" />
                <button 
                  onClick={handleLogoutClick}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Mon Profil</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={24} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    defaultValue="John Marpaung"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom complet"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue="john@gmail.com"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    placeholder="Parlez-nous de vous..."
                    rows="3"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Paramètres</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Notifications par email</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Notifications push</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rappels de RDV</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Préférences</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Langue</label>
                      <select className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Français</option>
                        <option>English</option>
                        <option>Español</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Fuseau horaire</label>
                      <select className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Europe/Paris</option>
                        <option>Europe/London</option>
                        <option>America/New_York</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <LogOut size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Se déconnecter</h3>
                  <p className="text-sm text-gray-600">Êtes-vous sûr de vouloir vous déconnecter ?</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Vous devrez vous reconnecter pour accéder à votre compte.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
