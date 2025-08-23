import { 
  LayoutDashboard, CheckSquare, Calendar, Users, Plus, 
  FileText, Mail, Tag, Search, Image, BarChart2, Instagram,
  ChevronDown, ChevronRight,
  MessageCircle, Clock, HelpCircle, Settings
} from 'lucide-react';
import { NavLink, useLocation } from "react-router-dom";

export default function Sidebar({ onInstagramToggle, isInstagramOpen }) {
  return (
    <div className="flex flex-col w-64 h-screen bg-gray-200 text-black p-4 relative z-10">
      
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
          <SidebarItem to="/agenda" icon={<CheckSquare size={18}/>} label="Agenda" badge="1"/>
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
          <SidebarItem to="/messages" icon={<MessageCircle size={18} />} label="Messages"/>
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
      <div className="mt-auto pt-4 border-t border-[#1B263B]">
        <SidebarItem to="/support" icon={<HelpCircle size={18}/>} label="Aide & Support"/>
        <SidebarItem to="/settings" icon={<Settings size={18}/>} label="Settings"/>

        <div className="flex items-center gap-3 mt-2 p-2 rounded-lg cursor-pointer">
          <img src="https://u.pravatar.cc/40" alt="user" className="w-10 h-10 rounded-full" />
          <div>
            <p className="text-sm font-medium">John Marpaung</p>
            <p className="text-xs text-gray-400">John@gmail.com</p>
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
