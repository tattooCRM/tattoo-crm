import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import { ToastProvider } from './hooks/useToast';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, ProtectedDashboardRoute, PublicRoute } from './components/ProtectedRoute';

import Home from './assets/pages/Home';
import Login from './assets/pages/Login';
import Signup from './assets/pages/Signup';
import Dashboard from './assets/pages/Dashboard';
import ArtistPage from './assets/pages/ArtistPage';
import ClientDashboard from './assets/pages/ClientDashboard';
import ChatPage from './assets/pages/ChatPage';
import TattooArtistChat from './assets/pages/TattooArtistChat';
import ChatRouter from './assets/pages/ChatRouter';
import { TestPage } from './pages/TestPage';
import TestLogout from './pages/TestLogout';
import ChatDebug from './pages/ChatDebug';
import TestContactTattooArtist from './pages/TestContactTattooArtist';
import DashboardQuotes from './pages/DashboardQuotes';

// Module Dashboard
import Agenda from './assets/pages/dashboard/Agenda';
import Clients from './assets/pages/dashboard/Clients';
import Projects from './assets/pages/dashboard/Projects';
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
    <AuthProvider>
      <ToastProvider>
        <NotificationsProvider>
          <Router>
          <Routes>
            {/* Pages publiques */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
            </Route>

            {/* Pages d'authentification (redirection si déjà connecté) */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />

            {/* Page publique artiste (sans layout) */}
            <Route path="/artist/:slug" element={<ArtistPage />} />

            {/* Page de test backend */}
            <Route path="/test" element={<TestPage />} />

            {/* Page de test déconnexion */}
            <Route path="/test-logout" element={<TestLogout />} />

            {/* Page de debug chat */}
            <Route path="/chat-debug" element={<ChatDebug />} />

            {/* Page de test contact tatoueur */}
            <Route path="/test-contact-tattoo" element={<TestContactTattooArtist />} />

            {/* Espace client (utilisateurs connectés non-tatoueurs) */}
            <Route path="/client" element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            } />

            {/* Chat pour les clients */}
            <Route path="/chat" element={
              <ProtectedRoute>
                <ChatRouter />
              </ProtectedRoute>
            } />

            {/* Pages dashboard protégées (tatoueurs seulement) */}
            <Route element={
              <ProtectedDashboardRoute>
                <DashboardLayout />
              </ProtectedDashboardRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/devis" element={<DashboardQuotes />} />
               <Route path="/projets" element={<Projects />} />
              {/* <Route path="/devis" element={<Devis />} />
              <Route path="/paiements" element={<Paiements />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/messages" element={<Messages />} />

              {/* Instagram */}
              {/*<Route path="/instagram/messages" element={<InstaMessages />} />
              <Route path="/instagram/planifies" element={<InstaPlanifies />} />
              <Route path="/instagram/brouillons" element={<InstaBrouillons />} />
              <Route path="/instagram/publies" element={<InstaPublies />} /> */}
            </Route>

          </Routes>
        </Router>
        </NotificationsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
