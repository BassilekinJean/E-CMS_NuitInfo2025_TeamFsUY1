import { Link, useLocation } from 'react-router-dom';
import { Building2, Menu, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      // Un petit délai pour s'assurer que la page a le temps de se charger
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  const scrollToTop = () => {
    if (location.pathname !== '/') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-20 h-20">
            <img src={logo} alt="logo" />
            </div>
            <span className="text-green-800">CameroonCMS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={scrollToTop}
              className="text-gray-700 hover:text-green-600 transition-colors bg-transparent border-none cursor-pointer"
            >
              Accueil
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="text-gray-700 hover:text-green-600 transition-colors bg-transparent border-none cursor-pointer"
            >
              Fonctionnalités
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-green-600 transition-colors bg-transparent border-none cursor-pointer"
            >
              Contact
            </button>
            <Link to="/login" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Connexion
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-4">
            <button 
              onClick={() => {
                scrollToTop();
                setIsMenuOpen(false);
              }}
              className="w-full text-left text-gray-700 hover:text-green-600 transition-colors bg-transparent border-none cursor-pointer"
            >
              Accueil
            </button>
            <button 
              onClick={() => {
                scrollToSection('features');
                setIsMenuOpen(false);
              }}
              className="w-full text-left text-gray-700 hover:text-green-600 transition-colors bg-transparent border-none cursor-pointer"
            >
              Fonctionnalités
            </button>
            <button 
              onClick={() => {
                scrollToSection('contact');
                setIsMenuOpen(false);
              }}
              className="w-full text-left text-gray-700 hover:text-green-600 transition-colors bg-transparent border-none cursor-pointer"
            >
              Contact
            </button>
            <Link 
              to="/login" 
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Connexion
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
