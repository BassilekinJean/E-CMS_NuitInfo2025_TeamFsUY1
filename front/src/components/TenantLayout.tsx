import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { Building2, Newspaper, Calendar, FileText, Users, MapPin, Menu, X, HelpCircle, AlertTriangle, FileCheck } from 'lucide-react';

interface TenantLayoutProps {
  children: React.ReactNode;
}

export function TenantLayout({ children }: TenantLayoutProps) {
  const { tenant, isLoading, error } = useTenant();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Site introuvable</h1>
          <p className="text-gray-600 mb-6">{error || 'Cette commune n\'existe pas ou n\'est pas active.'}</p>
          <a href="https://ecms.cm" className="text-blue-600 hover:underline">
            Retour au portail national
          </a>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: '/', label: 'Accueil', icon: Building2 },
    { to: '/actualites', label: 'Actualités', icon: Newspaper },
    { to: '/evenements', label: 'Agenda', icon: Calendar },
    { to: '/projets', label: 'Projets', icon: FileText },
    { to: '/transparence', label: 'Transparence', icon: FileCheck },
    { to: '/services', label: 'Services', icon: Users },
    { to: '/signalement', label: 'Signalement', icon: AlertTriangle },
    { to: '/contact', label: 'Contact', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Nom */}
            <Link to="/" className="flex items-center gap-3 group">
              {tenant.logo ? (
                <img 
                  src={tenant.logo} 
                  alt={`Logo ${tenant.nom}`} 
                  className="w-10 h-10 rounded-full object-cover border border-gray-100"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: tenant.couleur_primaire }}
                >
                  {tenant.nom.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 group-hover:text-blue-600 transition leading-tight">
                  {tenant.nom}
                </span>
                <span className="text-xs text-gray-500">
                  {tenant.departement_nom}
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <ul className="hidden lg:flex gap-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm font-medium ${
                        isActive
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      style={isActive ? { color: tenant.couleur_primaire, backgroundColor: tenant.couleur_primaire + '10' } : {}}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? '' : 'text-gray-400'}`} style={isActive ? { color: tenant.couleur_primaire } : {}} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-white absolute w-full shadow-lg">
            <ul className="flex flex-col p-2 space-y-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      style={isActive ? { color: tenant.couleur_primaire, backgroundColor: tenant.couleur_primaire + '10' } : {}}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Info Commune */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                {tenant.logo && (
                  <img 
                    src={tenant.logo} 
                    alt="Logo" 
                    className="w-12 h-12 rounded-full bg-white p-1"
                  />
                )}
                <div>
                  <h3 className="font-bold text-xl">{tenant.nom}</h3>
                  <p className="text-gray-400 text-sm">{tenant.region_nom}, {tenant.departement_nom}</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Site officiel de la commune de {tenant.nom}. Retrouvez toutes les informations, actualités et services en ligne.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-lg mb-4 border-b border-gray-700 pb-2 inline-block">Contact</h3>
              <ul className="space-y-3 text-gray-300">
                {tenant.adresse && (
                  <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                    <span>{tenant.adresse}</span>
                  </li>
                )}
                {tenant.telephone && (
                  <li className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-500 shrink-0" />
                    <a href={`tel:${tenant.telephone}`} className="hover:text-white transition">{tenant.telephone}</a>
                  </li>
                )}
                {tenant.email && (
                  <li className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-500 shrink-0" />
                    <a href={`mailto:${tenant.email}`} className="hover:text-white transition">{tenant.email}</a>
                  </li>
                )}
              </ul>
            </div>

            {/* Liens Rapides */}
            <div>
              <h3 className="font-bold text-lg mb-4 border-b border-gray-700 pb-2 inline-block">Accès rapide</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/faq" className="hover:text-white transition flex items-center gap-2"><HelpCircle className="w-4 h-4" /> FAQ</Link></li>
                <li><Link to="/services" className="hover:text-white transition">Services en ligne</Link></li>
                <li><Link to="/suivi-demarche" className="hover:text-white transition">Suivre ma démarche</Link></li>
                <li><Link to="/mentions-legales" className="hover:text-white transition">Mentions légales</Link></li>
                <li><a href="https://ecms.cm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Portail National</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Commune de {tenant.nom}. Tous droits réservés.</p>
            <p>Propulsé par <a href="https://ecms.cm" className="hover:text-white transition">E-CMS Cameroun</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
