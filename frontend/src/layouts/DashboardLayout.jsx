import { Outlet } from "react-router-dom";
import Sidebar from "../assets/components/Sidebar";
import PageHeader from "../assets/components/PageHeader";

export default function DashboardLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <PageHeader
          breadcrumbs={["Tasks", "Task report"]}
          onSearch={(value) => console.log("Recherche :", value)}
        />
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
