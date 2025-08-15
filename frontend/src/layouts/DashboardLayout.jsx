import { Outlet } from "react-router-dom";
import Sidebar from "../assets/components/Sidebar";
import HeaderDash from "../assets/components/HeaderDash"; // ta petite nav bar

export default function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Navbar en haut */}
        <HeaderDash />

        {/* Contenu de la page */}
        <main className="flex-1 p-4 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
