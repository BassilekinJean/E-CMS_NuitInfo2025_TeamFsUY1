import React, { useState, useEffect } from 'react';
import { ArrowRight, Building2, Globe, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export function Header() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Sample images - replace with actual town hall images
  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=600&fit=crop',
      title: 'Mariage Civil',
      description: 'Services d\'état civil disponibles'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=600&fit=crop',
      title: 'Conseil Municipal',
      description: 'Réunions et délibérations'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=600&fit=crop',
      title: 'Hôtel de Ville',
      description: 'Au service des citoyens'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=600&fit=crop',
      title: 'Événements Communautaires',
      description: 'Célébrations et rassemblements'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <div className="relative bg-gradient-to-br from-green-700 via-red-600 to-yellow-500 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <div className="space-y-6 order-2 md:order-1">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="text-sm md:text-base">Solution CMS pour les Mairies du Cameroun</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Modernisez votre Mairie avec un Site Web Professionnel
            </h1>
            <p className="text-green-50 text-base md:text-lg">
              CameroonCMS est la plateforme complète pour créer et gérer facilement le site web de votre mairie. 
              Offrez un service numérique moderne à vos citoyens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#contact" 
                className="bg-white text-green-700 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2 font-semibold shadow-lg"
              >
                Demander une Démo
                <ArrowRight className="h-5 w-5" />
              </a>
              <a 
                href="#features" 
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 transition-colors text-center font-semibold"
              >
                En savoir plus
              </a>
            </div>
          </div>

          {/* Right Column - Carousel */}
          <div className="relative order-1 md:order-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20 shadow-2xl">
              
              {/* Carousel Container */}
              <div className="relative overflow-hidden rounded-xl">
                
                {/* Slides */}
                <div className="relative h-64 md:h-80 lg:h-96">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        index === currentIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      
                      {/* Overlay with Cameroon flag colors gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-red-900/40 to-transparent rounded-lg">
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                          <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                            {slide.title}
                          </h2>
                          <p className="text-green-50 text-sm md:text-base">
                            {slide.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 bg-green-700/60 backdrop-blur-sm hover:bg-green-700/80 text-white p-2 rounded-full border border-white/20 transition-all duration-300"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-green-700/60 backdrop-blur-sm hover:bg-green-700/80 text-white p-2 rounded-full border border-white/20 transition-all duration-300"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Dots Navigation with Cameroon colors */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/3 flex gap-3">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? 'bg-yellow-400 w-8 md:w-12'
                          : 'bg-white/50 hover:bg-white/75 w-2'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Info Cards Below Carousel - Cameroon themed */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 md:mt-6">
                <div className="bg-gradient-to-br from-green-700/30 to-green-800/30 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-white/20 hover:border-yellow-400/50 transition-all duration-300">
                  <Building2 className="h-6 w-6 md:h-8 md:w-8 mb-2 text-yellow-300" />
                  <div className="text-white font-semibold text-xs md:text-sm">Gestion Complète</div>
                  <p className="text-green-50 text-xs mt-1">Interface intuitive</p>
                </div>
                
                <div className="bg-gradient-to-br from-red-600/30 to-red-700/30 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-white/20 hover:border-yellow-400/50 transition-all duration-300">
                  <Globe className="h-6 w-6 md:h-8 md:w-8 mb-2 text-yellow-300" />
                  <div className="text-white font-semibold text-xs md:text-sm">Multilingue</div>
                  <p className="text-green-50 text-xs mt-1">FR & EN</p>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-white/20 hover:border-yellow-400/50 transition-all duration-300">
                  <Users className="h-6 w-6 md:h-8 md:w-8 mb-2 text-white" />
                  <div className="text-white font-semibold text-xs md:text-sm">Citoyen First</div>
                  <p className="text-green-50 text-xs mt-1">Services en ligne</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-700/40 via-red-600/40 to-yellow-500/40 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-yellow-400/40 hover:border-yellow-400/70 transition-all duration-300">
                  <div className="text-yellow-300 font-bold text-lg md:text-2xl">100%</div>
                  <p className="text-white font-semibold text-xs md:text-sm mt-1">Camerounais</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Wave decoration with Cameroon accent */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
}