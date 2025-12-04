import { Link } from 'react-router-dom';
import { Building2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/logo.png';
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">
              Accueil
            </Link>
            <Link to="/features" className="text-gray-700 hover:text-green-600 transition-colors">
              Fonctionnalités
            </Link>
            <a href="#contact" className="text-gray-700 hover:text-green-600 transition-colors">
              Contact
            </a>
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
            <Link 
              to="/" 
              className="text-gray-700 hover:text-green-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link 
              to="/features" 
              className="text-gray-700 hover:text-green-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Fonctionnalités
            </Link>
            <a 
              href="#contact" 
              className="text-gray-700 hover:text-green-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
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
