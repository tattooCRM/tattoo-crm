import { 
  LayoutDashboard, CheckSquare, Calendar, Users, Plus, 
  FileText, Mail, Tag, Search, Image, BarChart2, Instagram,
  ChevronDown, ChevronRight,
  MessageCircle, Clock, HelpCircle, Settings, LogOut
} from 'lucide-react';
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';

export default function Sidebar({ onInstagramToggle, isInstagramOpen, agendaBadgeCount = 0 }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useChat();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };
  return (
    <div className="flex flex-col w-64 bg-gray-200 text-black p-4 relative z-10" style={{ height: '105vh', minHeight: '100vh', maxHeight: 'none' }}>
      
      {/* --------- PARTIE HAUT --------- */}
      <div className="flex-1">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-white shadow-md p-2 rounded-lg">
            <LayoutDashboard size={20}/>
          </div>
          <h1 className="font-bold text-lg">InkFlow</h1>
        </div>

        {/* Menu Principal */}
        <SectionTitle title="Studio"/>
        <nav className="space-y-2">
          <SidebarItem to="/dashboard" icon={<LayoutDashboard size={18}/>} label="Tableau de bord"/>
          <SidebarItem to="/agenda" icon={<CheckSquare size={18}/>} label="Agenda" badge={agendaBadgeCount > 0 ? agendaBadgeCount.toString() : undefined}/>
          <SidebarItem to="/clients" icon={<Calendar size={18}/>} label="Clients"/>
          <SidebarItem to="/projets" icon={<Plus size={18}/>} label="Projets"/>
        </nav>

        {/* Finances */}
        <SectionTitle title="Finances"/>
        <nav className="space-y-2">
          <SidebarItem to="/devis" icon={<Search size={18}/>} label="Devis"/>
          <SidebarItem to="/paiements" icon={<Tag size={18}/>} label="Paiements"/>
          <SidebarItem to="/stock" icon={<Users size={18}/>} label="Stock"/>
        </nav>

        {/* Communication */}
        <SectionTitle title="Communication" />
        <nav className="space-y-2">
          <SidebarItem 
            to="/chat" 
            icon={<MessageCircle size={18} />} 
            label="Chat Client"
            badge={unreadCount > 0 ? unreadCount.toString() : undefined}
          />
          <SidebarItem to="/messages" icon={<Mail size={18} />} label="Messages"/>
        </nav>
        <div>
          <SidebarItem
            icon={<Instagram size={18} />}
            label="Instagram"
            onClick={onInstagramToggle}
            rightIcon={isInstagramOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            isActive={isInstagramOpen}
          />
        </div>
      </div>

      {/* --------- PARTIE BAS --------- */}
      <div className="mt-auto pt-4 border-t border-gray-400">
        <SidebarItem to="/support" icon={<HelpCircle size={18}/>} label="Aide & Support"/>
        <SidebarItem to="/settings" icon={<Settings size={18}/>} label="Settings"/>
        
        {/* Bouton de déconnexion */}
        <SidebarItem 
          icon={<LogOut size={18}/>} 
          label="Déconnexion" 
          onClick={handleLogout}
        />

        {/* Profil utilisateur */}
        <div className="flex items-center gap-3 mt-4 p-2 rounded-lg bg-gray-300">
          <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
            {user?.nom ? user.nom.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-medium">
              {user?.nom || user?.prenom || 'Tatoueur'}
            </p>
            <p className="text-xs text-gray-600 truncate max-w-[120px]">
              {user?.email || 'email@example.com'}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role === 'tattoo_artist' ? 'Tatoueur' : user?.role || 'Utilisateur'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// SidebarItem amélioré pour supporter onClick, rightIcon et isActive personnalisé
function SidebarItem({ to, icon, label, badge, onClick, rightIcon, isActive: customIsActive }) {
  const location = useLocation();
  const isActive = customIsActive !== undefined ? customIsActive : (to && location.pathname === to);
  
  const content = (
    <div
      className={`flex items-center justify-between p-2 cursor-pointer hover:bg-zinc-400 ${
        isActive 
          ? "bg-zinc-500 text-white rounded-l-lg" 
          : "rounded-lg"
      }`}
      style={isActive ? { marginRight: '-1rem' } : {}}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {badge && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        {rightIcon}
      </div>
    </div>
  );

  return to ? (
    <NavLink 
      to={to}
      className={({ isActive }) => isActive ? "block" : "block"}
    >
      {content}
    </NavLink>
  ) : content;
}

function SectionTitle({ title }) {
  return <p className="mt-4 mb-2 text-xs uppercase text-black">{title}</p>;
}
