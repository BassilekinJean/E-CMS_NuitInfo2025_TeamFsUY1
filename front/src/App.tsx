import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import { Features } from './components/Features';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} 
        children={
          <Route path="/features" element={<Features />} />
        }
        />
      </Routes>
    </Router>
  );
};

export default App;