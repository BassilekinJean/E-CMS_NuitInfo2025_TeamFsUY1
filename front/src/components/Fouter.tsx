import { Building2, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-green-600 to-yellow-500 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-white">CameroonCMS</span>
            </div>
            <p className="text-gray-400">
              La solution CMS dédiée aux mairies du Cameroun pour une présence digitale moderne et efficace.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-green-400 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-gray-400 hover:text-green-400 transition-colors">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-green-400 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-green-400 transition-colors">
                  Connexion
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white mb-4">Nos Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Création de site web</li>
              <li className="text-gray-400">Hébergement sécurisé</li>
              <li className="text-gray-400">Formation & Support</li>
              <li className="text-gray-400">Maintenance technique</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Yaoundé, Cameroun</li>
              <li>+237 XXX XXX XXX</li>
              <li>contact@camerooncms.cm</li>
              <li>Lun - Ven: 8h00 - 17h00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} CameroonCMS. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
