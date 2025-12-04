import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Clock, MessageCircle, Loader2 } from 'lucide-react';

interface FormErrors {
  mairie?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  poste?: string;
}

export function ContactDemo() {
  const [formData, setFormData] = useState({
    mairie: '',
    nom: '',
    email: '',
    telephone: '',
    poste: '',
    tailleMairie: '',
    budget: '',
    besoin: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^[\d\s\+\-\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 9;
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.mairie.trim()) {
      newErrors.mairie = 'Le nom de la mairie est requis';
    }

    if (!formData.nom.trim()) {
      newErrors.nom = 'Votre nom est requis';
    } else if (formData.nom.trim().length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!validatePhone(formData.telephone)) {
      newErrors.telephone = 'Numéro de téléphone invalide';
    }

    if (!formData.poste.trim()) {
      newErrors.poste = 'Votre poste est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    setSubmitted(true);
    
    // Reset form after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        mairie: '',
        nom: '',
        email: '',
        telephone: '',
        poste: '',
        tailleMairie: '',
        budget: '',
        besoin: '',
        message: ''
      });
      setTouched({});
      setErrors({});
    }, 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched({
      ...touched,
      [field]: true
    });
  };

  const faqs = [
    {
      question: 'Combien de temps faut-il pour créer un site?',
      answer: 'En moyenne, votre site est opérationnel en 2-3 semaines après validation du contenu et des visuels.'
    },
    {
      question: 'Proposez-vous une formation?',
      answer: 'Oui, nous offrons une formation complète de 2 jours pour vos équipes administratives avec support continu.'
    },
    {
      question: 'Le site sera-t-il en français et anglais?',
      answer: 'Absolument! Notre CMS supporte le bilinguisme français/anglais natif du Cameroun.'
    },
    {
      question: 'Quel est le coût mensuel?',
      answer: 'Nos tarifs varient selon la taille de votre commune. Contactez-nous pour un devis personnalisé.'
    }
  ];

  return (
    <div id="contact" className="py-20 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
            Contactez-nous
          </div>
          <h2 className="text-gray-900 mb-4">
            Demandez votre Démo Gratuite
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Découvrez comment CameroonCMS peut transformer la présence en ligne de votre mairie. 
            Remplissez le formulaire et nous vous contacterons dans les 24 heures.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Methods */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-gray-900 mb-2">Téléphone</h3>
            <p className="text-gray-600 mb-3">Lun - Ven: 8h00 - 17h00</p>
            <a href="tel:+237XXXXXXXXX" className="text-green-600 hover:text-green-700">
              +237 XXX XXX XXX
            </a>
            <div className="mt-3">
              <a href="tel:+237YYYYYYYYY" className="text-green-600 hover:text-green-700">
                +237 YYY YYY YYY
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600 mb-3">Réponse sous 24h</p>
            <a href="mailto:contact@camerooncms.cm" className="text-green-600 hover:text-green-700 block">
              contact@camerooncms.cm
            </a>
            <div className="mt-3">
              <a href="mailto:demo@camerooncms.cm" className="text-green-600 hover:text-green-700 block">
                demo@camerooncms.cm
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-gray-900 mb-2">WhatsApp</h3>
            <p className="text-gray-600 mb-3">Chat en direct</p>
            <a href="https://wa.me/237XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 block">
              +237 XXX XXX XXX
            </a>
            <p className="text-gray-500 mt-3">Disponible 24/7</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-green-100 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-2">Notre Bureau</h3>
                  <p className="text-gray-600">Quartier Bastos</p>
                  <p className="text-gray-600">Yaoundé, Cameroun</p>
                  <p className="text-gray-600 mt-2">BP: 12345 Yaoundé</p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-2">Horaires d'ouverture</h3>
                  <div className="space-y-1 text-gray-600">
                    <p>Lundi - Vendredi: 8h00 - 17h00</p>
                    <p>Samedi: 9h00 - 13h00</p>
                    <p>Dimanche: Fermé</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-yellow-500 p-8 rounded-2xl text-white">
              <h3 className="text-white mb-4">Pourquoi choisir CameroonCMS?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>Solution 100% camerounaise, adaptée aux réalités locales</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>Support technique en français et en anglais</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>Tarifs adaptés aux budgets municipaux</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>Formation complète de vos équipes incluse</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>Hébergement sécurisé et sauvegardes automatiques</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>Mise à jour et maintenance incluses</span>
                </li>
              </ul>
            </div>

            {/* FAQ Section */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100">
              <h3 className="text-gray-900 mb-6">Questions Fréquentes</h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details key={index} className="group">
                    <summary className="cursor-pointer list-none flex items-center justify-between text-gray-900 hover:text-green-600 transition-colors">
                      <span>{faq.question}</span>
                      <span className="ml-2 text-green-600 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-3 text-gray-600 pl-4 border-l-2 border-green-200">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-green-100">
            {submitted ? (
              <div className="text-center py-12">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-gray-900 mb-3">Demande envoyée avec succès!</h3>
                <p className="text-gray-600 mb-4">
                  Merci pour votre intérêt! Notre équipe vous contactera dans les 24 heures.
                </p>
                <p className="text-gray-500">
                  Vous recevrez un email de confirmation à l'adresse fournie.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-gray-900 mb-2">Demande de Démo</h3>
                  <p className="text-gray-600">Tous les champs avec * sont obligatoires</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="mairie" className="block text-gray-700 mb-2">
                      Nom de la Mairie *
                    </label>
                    <input
                      type="text"
                      id="mairie"
                      name="mairie"
                      required
                      value={formData.mairie}
                      onChange={handleChange}
                      onBlur={() => handleBlur('mairie')}
                      className={`w-full px-4 py-3 border ${
                        errors.mairie && touched.mairie ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                      placeholder="Ex: Mairie de Douala 3ème"
                    />
                    {errors.mairie && touched.mairie && (
                      <div className="flex items-center gap-1 mt-1 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{errors.mairie}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nom" className="block text-gray-700 mb-2">
                        Nom Complet *
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        required
                        value={formData.nom}
                        onChange={handleChange}
                        onBlur={() => handleBlur('nom')}
                        className={`w-full px-4 py-3 border ${
                          errors.nom && touched.nom ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                        placeholder="Jean Dupont"
                      />
                      {errors.nom && touched.nom && (
                        <div className="flex items-center gap-1 mt-1 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{errors.nom}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="poste" className="block text-gray-700 mb-2">
                        Poste / Fonction *
                      </label>
                      <input
                        type="text"
                        id="poste"
                        name="poste"
                        required
                        value={formData.poste}
                        onChange={handleChange}
                        onBlur={() => handleBlur('poste')}
                        className={`w-full px-4 py-3 border ${
                          errors.poste && touched.poste ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                        placeholder="Ex: Secrétaire Général"
                      />
                      {errors.poste && touched.poste && (
                        <div className="flex items-center gap-1 mt-1 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{errors.poste}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-gray-700 mb-2">
                        Email Professionnel *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur('email')}
                        className={`w-full px-4 py-3 border ${
                          errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                        placeholder="email@mairie.cm"
                      />
                      {errors.email && touched.email && (
                        <div className="flex items-center gap-1 mt-1 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{errors.email}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="telephone" className="block text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        required
                        value={formData.telephone}
                        onChange={handleChange}
                        onBlur={() => handleBlur('telephone')}
                        className={`w-full px-4 py-3 border ${
                          errors.telephone && touched.telephone ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                        placeholder="+237 6XX XXX XXX"
                      />
                      {errors.telephone && touched.telephone && (
                        <div className="flex items-center gap-1 mt-1 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{errors.telephone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tailleMairie" className="block text-gray-700 mb-2">
                        Taille de la Commune
                      </label>
                      <select
                        id="tailleMairie"
                        name="tailleMairie"
                        value={formData.tailleMairie}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="petite">Petite (&lt; 10 000 habitants)</option>
                        <option value="moyenne">Moyenne (10 000 - 50 000)</option>
                        <option value="grande">Grande (50 000 - 200 000)</option>
                        <option value="metropole">Métropole (&gt; 200 000)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="budget" className="block text-gray-700 mb-2">
                        Budget Estimé
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="moins-1m">&lt; 1M FCFA</option>
                        <option value="1m-3m">1M - 3M FCFA</option>
                        <option value="3m-5m">3M - 5M FCFA</option>
                        <option value="plus-5m">&gt; 5M FCFA</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="besoin" className="block text-gray-700 mb-2">
                      Besoin Principal
                    </label>
                    <select
                      id="besoin"
                      name="besoin"
                      value={formData.besoin}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="nouveau">Création d'un nouveau site</option>
                      <option value="refonte">Refonte d'un site existant</option>
                      <option value="migration">Migration vers CameroonCMS</option>
                      <option value="conseil">Besoin de conseil</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-gray-700 mb-2">
                      Message / Détails du Projet
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Décrivez vos besoins spécifiques, vos attentes, vos délais souhaités..."
                    />
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-gray-700 flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>
                        En soumettant ce formulaire, vous acceptez d'être contacté par notre équipe 
                        commerciale concernant votre demande de démo.
                      </span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white py-4 px-6 rounded-lg hover:from-green-700 hover:to-yellow-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        Envoyer la Demande
                        <Send className="h-5 w-5" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-gray-500">
                    Ou appelez-nous directement au{' '}
                    <a href="tel:+237XXXXXXXXX" className="text-green-600 hover:text-green-700">
                      +237 XXX XXX XXX
                    </a>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}