import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><p>prince</p></>} />
      </Routes>
    </Router>
  )
}

export default App