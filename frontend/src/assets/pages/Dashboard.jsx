import PageHeader from "../components/PageHeader";

function Dashboard() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[]}
        onSearch={(value) => console.log("Recherche :", value)}
      />
      <h1>Bienvenue dans le dashboard InkFlow ✍️</h1>
    </div>
  );
}

export default Dashboard;
