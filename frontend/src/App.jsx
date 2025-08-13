import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Home from './assets/pages/Home';
import Login from './assets/pages/Login';
import Signup from './assets/pages/Signup';
import Dashboard from './assets/pages/Dashboard';

// Module Dashboard
// import Agenda from './assets/pages/dashboard/Agenda';
// import Clients from './assets/pages/dashboard/Clients';
// import Projets from './assets/pages/dashboard/Projets';
// import Devis from './assets/pages/dashboard/Devis';
// import Paiements from './assets/pages/dashboard/Paiements';
// import Stock from './assets/pages/dashboard/Stock';
// import Messages from './assets/pages/dashboard/Messages';
// import InstaMessages from './assets/pages/dashboard/instagram/Messages';
// import InstaPlanifies from './assets/pages/dashboard/instagram/Planifies';
// import InstaBrouillons from './assets/pages/dashboard/instagram/Brouillons';
// import InstaPublies from './assets/pages/dashboard/instagram/Publies';

function App() {
  return (
    <Router>
      <Routes>
        {/* Pages normales avec Navbar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Pages dashboard avec Sidebar */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/dashboard/agenda" element={<Agenda />} />
          <Route path="/dashboard/clients" element={<Clients />} />
          <Route path="/dashboard/projets" element={<Projets />} />
          <Route path="/dashboard/devis" element={<Devis />} />
          <Route path="/dashboard/paiements" element={<Paiements />} />
          <Route path="/dashboard/stock" element={<Stock />} />
          <Route path="/messages" element={<Messages />} /> */}

          {/* Instagram */}
          {/* <Route path="/instagram/messages" element={<InstaMessages />} />
          <Route path="/instagram/planifies" element={<InstaPlanifies />} />
          <Route path="/instagram/brouillons" element={<InstaBrouillons />} />
          <Route path="/instagram/publies" element={<InstaPublies />} /> */}

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
