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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar fixe */}
      <div className="flex-shrink-0">
        <Sidebar 
          onInstagramToggle={() => setIsInstagramOpen(!isInstagramOpen)}
          isInstagramOpen={isInstagramOpen}
          agendaBadgeCount={agendaBadgeCount}
        />
      </div>
      
      {/* Panneau Instagram */}
      <InstagramPanel 
        isOpen={isInstagramOpen} 
        onClose={() => setIsInstagramOpen(false)} 
      />
      
      {/* Contenu principal avec scroll */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header fixe */}
        <div className="flex-shrink-0">
          <HeaderDash />
        </div>

        {/* Contenu scrollable */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
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
