import React from 'react'
import LandingPage from './LandingPage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
const App = () => {
  return (
    <Router>
      <Routes>
         {/* PAGE D’ACCUEIL */}
        <Route path="/" element={<LandingPage />} />
        {/* SIGNUP */}
        <Route path="/signup" element={<div>Signup</div>} />
        {/* LOGIN */}
        <Route path="/login" element={<div>Login</div>} />
        {/* FORGET PASSWORD */}
        <Route path="/forget-password" element={<div>Forget Password</div>} />
        {/* RESET PASSWORD */}
        <Route path="/reset-password" element={<div>Reset Password</div>} />
        {/* PROFILE */}
        <Route path="/profile" element={<div>Profile</div>} />
        {/* SETTINGS */}
        <Route path="/settings" element={<div>Settings</div>} />
        {/* LOGOUT */}
        <Route path="/logout" element={<div>Logout</div>} />
        {/* NOT FOUND */}
        <Route path="*" element={<div>404 Not Found</div>} />

      </Routes>
    </Router>
  )
}

export default App