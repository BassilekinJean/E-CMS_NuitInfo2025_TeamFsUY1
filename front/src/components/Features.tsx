import { 
  FileText, 
  Calendar, 
  Newspaper, 
  MessageSquare, 
  Shield, 
  Smartphone,
  Image,
  Settings,
  BarChart3,
  MapPin,
  X,
  CheckCircle,
  ArrowRight,
  Users,
<<<<<<< HEAD
  Clock,
=======
>>>>>>> origin/front
  Zap
} from 'lucide-react';
import { useState } from 'react';

interface FeaturesProps {
  showFullDetails?: boolean;
}

interface Feature {
  icon: any;
  title: string;
  description: string;
  details: string;
  fullDescription: string;
  benefits: string[];
  useCases: string[];
  technicalFeatures: string[];
}

export function Features({ showFullDetails = false }: FeaturesProps) {
  // Ajout d'un ID à la section principale pour le défilement
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const features: Feature[] = [
    {
      icon: FileText,
      title: 'Gestion de Contenu',
      description: 'Créez et publiez facilement des articles, annonces et documents officiels.',
      details: 'Interface WYSIWYG intuitive, gestion des médias, planification de publications, versioning et workflow de validation.',
      fullDescription: 'Notre système de gestion de contenu vous permet de créer, modifier et publier du contenu de manière intuitive sans aucune connaissance technique. L\'éditeur WYSIWYG (What You See Is What You Get) vous offre une expérience similaire à Word, avec une prévisualisation en temps réel.',
      benefits: [
        'Éditeur visuel intuitif sans code',
        'Gestion des versions et historique complet',
        'Workflow d\'approbation multi-niveaux',
        'Programmation de publications futures',
        'Gestion des brouillons et révisions',
        'Support multimédia intégré'
      ],
      useCases: [
        'Publication d\'arrêtés municipaux',
        'Annonces de marchés publics',
        'Communiqués de presse',
        'Documents administratifs',
        'Pages d\'information citoyenne'
      ],
      technicalFeatures: [
        'Éditeur WYSIWYG avec formatage avancé',
        'Optimisation SEO automatique',
        'Compression d\'images automatique',
        'Support PDF et documents Office',
        'Système de tags et catégories',
        'Recherche full-text intégrée'
      ]
    },
    {
      icon: Calendar,
      title: 'Calendrier des Événements',
      description: 'Partagez les événements municipaux et les dates importantes.',
      details: 'Calendrier interactif, notifications automatiques, gestion des inscriptions, export iCal et synchronisation.',
      fullDescription: 'Gérez tous les événements de votre commune avec un système complet de calendrier. Les citoyens peuvent s\'inscrire aux événements, recevoir des rappels et synchroniser avec leurs calendriers personnels.',
      benefits: [
        'Calendrier visuel interactif',
        'Système d\'inscription en ligne',
        'Notifications automatiques par email/SMS',
        'Export vers Google Calendar et Outlook',
        'Gestion des capacités et listes d\'attente',
        'Intégration avec Google Maps'
      ],
      useCases: [
        'Réunions publiques du conseil municipal',
        'Événements culturels et festivités',
        'Journées citoyennes et portes ouvertes',
        'Collectes de déchets spéciales',
        'Marchés et foires locales'
      ],
      technicalFeatures: [
        'Vue mensuelle, hebdomadaire et quotidienne',
        'Système de réservation intégré',
        'Rappels automatiques programmables',
        'Export iCal/ICS standard',
        'Récurrence d\'événements',
        'Multi-langues FR/EN'
      ]
    },
    {
      icon: Newspaper,
      title: 'Actualités & Annonces',
      description: 'Tenez vos citoyens informés en temps réel.',
      details: 'Système de catégorisation, archives automatiques, fil RSS, newsletters et push notifications.',
      fullDescription: 'Diffusez l\'information municipale efficacement avec notre système d\'actualités. Organisez vos contenus par catégories, générez des newsletters automatiques et gardez vos citoyens toujours informés.',
      benefits: [
        'Publication instantanée d\'actualités',
        'Catégorisation et tags intelligents',
        'Newsletter automatique aux abonnés',
        'Archives organisées et recherchables',
        'Fil RSS pour agrégateurs',
        'Mise en avant des actualités urgentes'
      ],
      useCases: [
        'Alertes d\'urgence (coupures d\'eau, routes fermées)',
        'Nouvelles des projets municipaux',
        'Résultats d\'élections locales',
        'Informations sur les services publics',
        'Célébrations et hommages'
      ],
      technicalFeatures: [
        'Système de priorités (urgent/normal/info)',
        'Planification de publications',
        'Templates de newsletters personnalisables',
        'Analytics de lecture et engagement',
        'Partage social automatique',
        'Archivage automatique par date'
      ]
    },
    {
      icon: MessageSquare,
      title: 'Services Citoyens',
      description: 'Formulaires de demande, réclamations et suggestions en ligne.',
      details: 'Formulaires personnalisables, suivi des demandes, notifications par email, tableau de bord administrateur.',
      fullDescription: 'Facilitez l\'interaction entre les citoyens et l\'administration avec des formulaires intelligents. Chaque demande est suivie, assignée et traitée avec un système de ticket complet.',
      benefits: [
        'Formulaires intelligents personnalisables',
        'Système de suivi en temps réel',
        'Attribution automatique aux services',
        'Notifications multi-canaux',
        'Base de données citoyens intégrée',
        'Statistiques de satisfaction'
      ],
      useCases: [
        'Demandes d\'actes de naissance',
        'Signalement de problèmes (nids-de-poule, éclairage)',
        'Réclamations et plaintes',
        'Suggestions d\'amélioration',
        'Demandes de permis et autorisations'
      ],
      technicalFeatures: [
        'Constructeur de formulaires drag & drop',
        'Validation et vérification des données',
        'Upload de pièces jointes',
        'Système de tickets avec SLA',
        'Historique complet des échanges',
        'Export vers Excel/PDF'
      ]
    },
    {
      icon: Image,
      title: 'Galerie Multimédia',
      description: 'Partagez photos et vidéos des activités municipales.',
      details: 'Upload multiple, optimisation automatique, albums organisés, intégration vidéo YouTube/Vimeo.',
      fullDescription: 'Créez des galeries photo et vidéo professionnelles pour documenter la vie de votre commune. Le système optimise automatiquement les médias pour un chargement rapide.',
      benefits: [
        'Upload en masse de photos',
        'Optimisation automatique des images',
        'Albums organisés et personnalisables',
        'Diaporamas automatiques',
        'Intégration vidéo externe',
        'Watermark automatique optionnel'
      ],
      useCases: [
        'Inauguration de nouveaux équipements',
        'Événements culturels et sportifs',
        'Avant/après de projets d\'aménagement',
        'Visites officielles et cérémonies',
        'Reportages sur les services municipaux'
      ],
      technicalFeatures: [
        'Support JPEG, PNG, WebP, GIF',
        'Redimensionnement automatique',
        'Intégration YouTube, Vimeo, Dailymotion',
        'Lightbox responsive',
        'Métadonnées et géolocalisation',
        'CDN pour chargement rapide'
      ]
    },
    {
      icon: MapPin,
      title: 'Carte Interactive',
      description: 'Localisez les services et infrastructures municipales.',
      details: 'Intégration Google Maps, points d\'intérêt, itinéraires, géolocalisation des services publics.',
      fullDescription: 'Offrez une carte interactive complète de votre commune avec tous les services publics, infrastructures et points d\'intérêt. Les citoyens peuvent facilement trouver ce qu\'ils cherchent.',
      benefits: [
        'Localisation de tous les services',
        'Calcul d\'itinéraires automatique',
        'Filtres par catégories',
        'Horaires d\'ouverture intégrés',
        'Photos et descriptions des lieux',
        'Mode street view disponible'
      ],
      useCases: [
        'Localiser les écoles et crèches',
        'Trouver le centre de santé le plus proche',
        'Carte des marchés municipaux',
        'Emplacements des points de collecte',
        'Zones de stationnement'
      ],
      technicalFeatures: [
        'API Google Maps intégrée',
        'Markers personnalisés par catégorie',
        'Clustering pour performance',
        'Recherche géolocalisée',
        'Export de données GPS',
        'Mode hors-ligne partiel'
      ]
    },
    {
      icon: Shield,
      title: 'Sécurité Renforcée',
      description: 'Conformité HTTPS, sauvegardes automatiques et protection des données.',
      details: 'SSL gratuit, authentification à deux facteurs, sauvegardes quotidiennes, conformité RGPD.',
      fullDescription: 'La sécurité de vos données et celles de vos citoyens est notre priorité absolue. Infrastructure sécurisée avec cryptage, sauvegardes redondantes et conformité aux normes internationales.',
      benefits: [
        'Certificat SSL gratuit inclus',
        'Sauvegardes automatiques quotidiennes',
        'Protection anti-DDoS',
        'Authentification à deux facteurs',
        'Logs d\'audit complets',
        'Conformité RGPD garantie'
      ],
      useCases: [
        'Protection des données citoyens',
        'Sécurisation des paiements en ligne',
        'Sauvegarde des documents officiels',
        'Traçabilité des actions admin',
        'Récupération en cas de sinistre'
      ],
      technicalFeatures: [
        'Cryptage SSL/TLS 256-bit',
        'Firewall applicatif WAF',
        'Sauvegardes sur 3 sites distants',
        'Tests de pénétration réguliers',
        'Mise à jour de sécurité auto',
        'Monitoring 24/7'
      ]
    },
    {
      icon: Smartphone,
      title: 'Responsive Design',
      description: 'Site optimisé pour mobile, tablette et ordinateur.',
      details: 'Design adaptatif, performance optimisée, PWA ready, compatibilité tous navigateurs.',
      fullDescription: 'Votre site s\'adapte automatiquement à tous les écrans. Plus de 70% des citoyens consultent sur mobile, nous garantissons une expérience optimale sur tous les appareils.',
      benefits: [
        'Adaptation automatique à tous écrans',
        'Chargement ultra-rapide',
        'Mode hors-ligne PWA',
        'Navigation tactile optimisée',
        'Compatible tous navigateurs',
        'Score Google PageSpeed A+'
      ],
      useCases: [
        'Consultation mobile en déplacement',
        'Utilisation sur tablette en réunion',
        'Affichage sur écrans publics',
        'Consultation dans zones à faible débit',
        'Accessibilité pour seniors'
      ],
      technicalFeatures: [
        'Framework responsive moderne',
        'Lazy loading des images',
        'PWA avec service worker',
        'Cache intelligent',
        'Compression Gzip/Brotli',
        'Support IE11 à Chrome/Safari dernier'
      ]
    },
    {
      icon: BarChart3,
      title: 'Statistiques & Analytics',
      description: 'Suivez les visiteurs et l\'engagement des citoyens.',
      details: 'Tableau de bord analytique, rapports personnalisés, métriques d\'engagement, export de données.',
      fullDescription: 'Comprenez comment vos citoyens utilisent votre site avec des analytics détaillés. Identifiez les contenus populaires, les heures de pointe et optimisez votre communication.',
      benefits: [
        'Tableau de bord visuel en temps réel',
        'Rapports automatiques mensuels',
        'Statistiques par page et section',
        'Démographie des visiteurs',
        'Taux d\'engagement mesurable',
        'Export Excel/PDF'
      ],
      useCases: [
        'Mesurer l\'impact des actualités',
        'Identifier les services les plus consultés',
        'Optimiser les horaires de publication',
        'Rapports pour le conseil municipal',
        'Justifier les investissements digitaux'
      ],
      technicalFeatures: [
        'Google Analytics 4 intégré',
        'Tableaux de bord personnalisables',
        'Heatmaps de clics',
        'Tunnels de conversion',
        'Conformité RGPD Analytics',
        'API pour exports automatiques'
      ]
    },
    {
      icon: Settings,
      title: 'Personnalisation Totale',
      description: 'Adaptez le site aux couleurs et à l\'identité de votre mairie.',
      details: 'Thèmes personnalisables, logo et couleurs aux normes, templates multiples, drag & drop builder.',
      fullDescription: 'Créez un site unique qui reflète l\'identité de votre commune. Personnalisez couleurs, polices, mise en page sans toucher au code grâce à notre éditeur visuel.',
      benefits: [
        'Éditeur visuel drag & drop',
        'Bibliothèque de templates',
        'Personnalisation des couleurs',
        'Upload de logo et médias',
        'Typographie personnalisable',
        'Prévisualisation en temps réel'
      ],
      useCases: [
        'Adapter aux couleurs de la commune',
        'Intégrer blasons et armoiries',
        'Créer une identité visuelle forte',
        'Refléter l\'histoire locale',
        'Harmoniser avec supports print'
      ],
      technicalFeatures: [
        'Builder no-code intégré',
        '50+ templates pré-conçus',
        'Système de thèmes parent/enfant',
        'CSS personnalisé optionnel',
        'Widgets réutilisables',
        'Modes light/dark disponibles'
      ]
    }
  ];

  return (
    <section id="features" className="py-16 bg-white">
    <>
      <div id="features" className="py-20 bg-gradient-to-b from-white via-green-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-yellow-100 text-green-700 px-6 py-3 rounded-full mb-6 border border-green-200">
              <Zap className="h-4 w-4" />
              <span>Fonctionnalités</span>
            </div>
            <h2 className="text-gray-900 mb-4">
              Tout ce dont votre Mairie a besoin
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Une solution complète et facile à utiliser, conçue spécifiquement pour les besoins 
              des municipalités camerounaises. Découvrez toutes nos fonctionnalités en détail.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200 relative overflow-hidden"
              >
                {/* Background Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="bg-gradient-to-br from-green-600 to-yellow-500 w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Quick Benefits */}
                  {!showFullDetails && (
                    <div className="space-y-2 mb-5">
                      {feature.benefits.slice(0, 2).map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Learn More Button */}
                  <button
                    onClick={() => setSelectedFeature(feature)}
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors group/btn"
                  >
                    <span>En savoir plus</span>
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          {!showFullDetails && (
            <div className="text-center mt-16 bg-gradient-to-r from-green-600 to-yellow-500 p-12 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 translate-y-1/2"></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-white mb-4">
                  Prêt à moderniser votre Mairie?
                </h3>
                <p className="text-green-50 mb-8 max-w-2xl mx-auto">
                  Rejoignez les 50+ mairies qui ont déjà fait confiance à CameroonCMS pour leur transformation digitale.
                </p>
                <a 
                  href="#contact" 
                  className="inline-flex items-center gap-2 bg-white text-green-700 px-8 py-4 rounded-xl hover:bg-green-50 transition-all shadow-xl hover:shadow-2xl"
                >
                  Demander une démo gratuite
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Feature Details */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-yellow-500 p-8 text-white">
              <button
                onClick={() => setSelectedFeature(null)}
                className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex items-start gap-6">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                  <selectedFeature.icon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-white mb-2">{selectedFeature.title}</h2>
                  <p className="text-green-50">{selectedFeature.description}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Full Description */}
              <div>
                <h3 className="text-gray-900 mb-4">Description Complète</h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedFeature.fullDescription}
                </p>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Avantages Principaux
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedFeature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-green-50 p-4 rounded-xl border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Use Cases */}
              <div>
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6 text-green-600" />
                  Cas d'Utilisation
                </h3>
                <div className="space-y-3">
                  {selectedFeature.useCases.map((useCase, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl border border-yellow-100">
                      <div className="bg-gradient-to-br from-green-600 to-yellow-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                        {idx + 1}
                      </div>
                      <span className="text-gray-700">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Features */}
              <div>
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="h-6 w-6 text-green-600" />
                  Fonctionnalités Techniques
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedFeature.technicalFeatures.map((tech, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-br from-green-600 to-yellow-500 p-8 rounded-2xl text-white text-center">
                <h3 className="text-white mb-3">Intéressé par cette fonctionnalité?</h3>
                <p className="text-green-50 mb-6">
                  Contactez-nous pour une démonstration personnalisée et découvrez comment cette fonctionnalité 
                  peut bénéficier à votre mairie.
                </p>
                <a
                  href="#contact"
                  onClick={() => setSelectedFeature(null)}
                  className="inline-flex items-center gap-2 bg-white text-green-700 px-8 py-3 rounded-xl hover:bg-green-50 transition-all"
                >
                  Demander une Démo
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
    </section>
  );
}