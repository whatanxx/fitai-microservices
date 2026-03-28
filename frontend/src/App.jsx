import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import AICoachPage from './pages/AICoachPage';
import HistoryPage from './pages/HistoryPage';
import PlanDetailsPage from './pages/PlanDetailsPage';
import SocialWallPage from './pages/SocialWallPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingModal from './components/OnboardingModal';
import './styles/App.css';
import './styles/UI.css';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
        <div className="App">
          <Navbar />
          <OnboardingModal />
          <main className="container">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/social" element={<SocialWallPage />} />
              <Route path="/ai-coach" element={<AICoachPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/history/:planId" element={<PlanDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
