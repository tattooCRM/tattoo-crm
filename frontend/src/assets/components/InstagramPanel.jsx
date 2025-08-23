import { X, Plus, Image, Send, Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';

export default function InstagramPanel({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed left-64 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Instagram</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="h-full pb-16 overflow-y-auto">
        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Actions rapides</h3>
          <div className="space-y-2">
            <button className="flex items-center gap-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <Plus size={18} className="text-blue-600" />
              <span className="text-sm text-gray-700">Nouveau post</span>
            </button>
            <button className="flex items-center gap-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <Image size={18} className="text-purple-600" />
              <span className="text-sm text-gray-700">Story</span>
            </button>
            <button className="flex items-center gap-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <Send size={18} className="text-pink-600" />
              <span className="text-sm text-gray-700">Messages</span>
            </button>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Posts récents</h3>
          <div className="space-y-3">
            {/* Post 1 */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">@inkflow_studio</p>
                  <p className="text-xs text-gray-500">Il y a 2h</p>
                </div>
              </div>
              <div className="bg-gray-200 rounded-lg h-32 mb-2 flex items-center justify-center">
                <Image size={24} className="text-gray-400" />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <Heart size={16} className="text-red-500" />
                  <MessageCircle size={16} className="text-gray-600" />
                  <Send size={16} className="text-gray-600" />
                </div>
                <Bookmark size={16} className="text-gray-600" />
              </div>
              <p className="text-xs text-gray-600 mt-2">247 j'aime</p>
            </div>

            {/* Post 2 */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">@inkflow_studio</p>
                  <p className="text-xs text-gray-500">Hier</p>
                </div>
              </div>
              <div className="bg-gray-200 rounded-lg h-32 mb-2 flex items-center justify-center">
                <Image size={24} className="text-gray-400" />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <Heart size={16} className="text-red-500" />
                  <MessageCircle size={16} className="text-gray-600" />
                  <Send size={16} className="text-gray-600" />
                </div>
                <Bookmark size={16} className="text-gray-600" />
              </div>
              <p className="text-xs text-gray-600 mt-2">189 j'aime</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Statistiques</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Followers</p>
              <p className="text-lg font-bold text-blue-800">2,847</p>
              <p className="text-xs text-blue-600">+12 cette semaine</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg">
              <p className="text-xs text-purple-600 font-medium">Engagement</p>
              <p className="text-lg font-bold text-purple-800">8.4%</p>
              <p className="text-xs text-purple-600">+0.8% vs mois dernier</p>
            </div>
            <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-3 rounded-lg">
              <p className="text-xs text-pink-600 font-medium">Reach</p>
              <p className="text-lg font-bold text-pink-800">12.5K</p>
              <p className="text-xs text-pink-600">Cette semaine</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
              <p className="text-xs text-green-600 font-medium">Stories vues</p>
              <p className="text-lg font-bold text-green-800">892</p>
              <p className="text-xs text-green-600">Aujourd'hui</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
