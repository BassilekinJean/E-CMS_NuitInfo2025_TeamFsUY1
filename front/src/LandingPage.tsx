import React from 'react'
import { Header } from './components/Header'
import { Navbar } from './components/Navbar'

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Header />
    </div>
  );
};
export default LandingPage