import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import { Features } from './components/Features';
import MayorDashboard from './ComponentsCms/MayorDashboard';
import { DashboardContent } from './ComponentsCms/DashboardContent';
import EventReservationCalendar from './ComponentsCms/Evenement';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<Features />} />

        {/* Routes CMS avec layout MayorDashboard */}
        <Route path="/cms/mayor-dashboard" element={<MayorDashboard />}>
          <Route index element={<DashboardContent setIsSidebarOpen={() => {}} />} />
          <Route path="evenements" element={<EventReservationCalendar />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;