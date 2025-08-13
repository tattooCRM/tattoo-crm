import { Outlet } from "react-router-dom";
import Navbar from "../assets/components/Navbar";

export default function MainLayout() {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
