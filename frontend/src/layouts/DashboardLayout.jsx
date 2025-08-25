import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../assets/components/Sidebar";
import HeaderDash from "../assets/components/HeaderDash";
import InstagramPanel from "../assets/components/InstagramPanel";
import { NotificationProvider, useNotifications } from "../contexts/NotificationContext";

function DashboardContent() {
  const [isInstagramOpen, setIsInstagramOpen] = useState(false);
  const { agendaBadgeCount } = useNotifications();

  return (
    <div className="flex h-screen relative">
      <Sidebar 
        onInstagramToggle={() => setIsInstagramOpen(!isInstagramOpen)}
        isInstagramOpen={isInstagramOpen}
        agendaBadgeCount={agendaBadgeCount}
      />
      
      {/* Panneau Instagram */}
      <InstagramPanel 
        isOpen={isInstagramOpen} 
        onClose={() => setIsInstagramOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col">
        {/* Navbar en haut */}
        <HeaderDash />

        {/* Contenu de la page */}
        <main className="flex-1 p-4 bg-gray-50">
          <Outlet />
        </main>
      </div>
      
      {/* Overlay pour fermer le panneau */}
      {isInstagramOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsInstagramOpen(false)}
        />
      )}
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <NotificationProvider>
      <DashboardContent />
    </NotificationProvider>
  );
}
