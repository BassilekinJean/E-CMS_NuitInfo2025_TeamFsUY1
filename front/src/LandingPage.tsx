import React from 'react'
import { Header } from './components/Header'
import { Navbar } from './components/Navbar'
import { Features } from './components/Features'
import { ContactDemo } from './components/ContactDemo';
import { Footer } from './components/Fouter';
const LandingPage = () => {
    return (
      <div className="min-h-screen flex flex-col">
      <Navbar />
      <Header />
      <Features />
      <ContactDemo/>
      <Footer/>
    </div>
  );
};
export default LandingPage