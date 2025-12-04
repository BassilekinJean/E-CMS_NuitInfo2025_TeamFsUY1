import { ArrowRight, Building2, Globe, Users } from 'lucide-react';

export function Header() {
  return (
    <div className="relative bg-gradient-to-br from-green-700 via-green-600 to-yellow-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span>Solution CMS pour les Mairies du Cameroun</span>
            </div>
            <h1 className="text-white">
              Modernisez votre Mairie avec un Site Web Professionnel
            </h1>
            <p className="text-green-50">
              CameroonCMS est la plateforme complète pour créer et gérer facilement le site web de votre mairie. 
              Offrez un service numérique moderne à vos citoyens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#contact" 
                className="bg-white text-green-700 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
              >
                Demander une Démo
                <ArrowRight className="h-5 w-5" />
              </a>
              <a 
                href="#features" 
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 transition-colors text-center"
              >
                En savoir plus
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="grid grid-cols-2 gap-4">
                {infoSections.map((section) => (
                  <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl" key={section.title}>
                    {section.icon}
                    <div className="text-white">{section.title}</div>
                    <p className="text-green-50 text-sm">{section.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
}

// Info Sections Data
const infoSections = [
  {
    title: "Gestion Complète",
    description: "Interface intuitive",
    icon: <Building2 className="h-8 w-8 mb-3" />
  },
  {
    title: "Multilingue",
    description: "FR & EN",
    icon: <Globe className="h-8 w-8 mb-3" />
  },
  {
    title: "Citoyen First",
    description: "Services en ligne",
    icon: <Users className="h-8 w-8 mb-3" />
  },
  {
    title: "100%",
    description: "Camerounais",
    icon: <div className="text-white">100%</div>
  },
];