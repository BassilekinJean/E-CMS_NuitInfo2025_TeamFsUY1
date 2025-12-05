import { useState } from 'react';
<<<<<<< HEAD
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Clock, MessageCircle, Loader2 } from 'lucide-react';
=======
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Clock, MessageCircle, Loader2, Users, Award, TrendingUp, Star, ChevronDown } from 'lucide-react';
>>>>>>> origin/front

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
<<<<<<< HEAD
=======
  const [openFaq, setOpenFaq] = useState<number | null>(null);
>>>>>>> origin/front

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
<<<<<<< HEAD
      newErrors.email = 'L\'email est requis';
=======
      newErrors.email = "L'email est requis";
>>>>>>> origin/front
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
<<<<<<< HEAD
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    setSubmitted(true);
    
    // Reset form after 5 seconds
=======
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setSubmitted(true);
    
>>>>>>> origin/front
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
<<<<<<< HEAD
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
=======
    setFormData({ ...formData, [name]: value });

    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
>>>>>>> origin/front
    }
  };

  const handleBlur = (field: string) => {
<<<<<<< HEAD
    setTouched({
      ...touched,
      [field]: true
    });
  };

=======
    setTouched({ ...touched, [field]: true });
  };

  const stats = [
    { icon: Users, value: '50+', label: 'Mairies clientes' },
    { icon: Award, value: '99.9%', label: 'Taux de satisfaction' },
    { icon: TrendingUp, value: '24/7', label: 'Support disponible' },
    { icon: Star, value: '4.9/5', label: 'Note moyenne' }
  ];

  const testimonials = [
    {
      name: 'Marie Kouadio',
      role: 'Secrétaire Générale, Mairie de Douala 3ème',
      content: 'CameroonCMS a révolutionné notre communication avec les citoyens. Interface intuitive et support réactif!',
      rating: 5
    },
    {
      name: 'Paul Ndongo',
      role: 'Maire, Commune de Bafoussam',
      content: 'Excellente solution adaptée aux réalités camerounaises. Formation complète et équipe très professionnelle.',
      rating: 5
    },
    {
      name: 'Aminatou Bello',
      role: 'Responsable Communication, Mairie de Garoua',
      content: "Système fiable et sécurisé. Nos citoyens apprécient la facilité d'accès aux informations municipales.",
      rating: 5
    }
  ];

>>>>>>> origin/front
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
<<<<<<< HEAD
=======
    },
    {
      question: 'Les données sont-elles sécurisées?',
      answer: 'Nous utilisons un cryptage SSL 256-bit et des sauvegardes automatiques quotidiennes.'
>>>>>>> origin/front
    }
  ];

  return (
<<<<<<< HEAD
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
=======
    <div id="contact" className="py-20 bg-gradient-to-b from-white via-green-50/30 to-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-200/20 to-yellow-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-yellow-200/20 to-green-200/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-yellow-100 text-green-700 px-6 py-3 rounded-full mb-6 border border-green-200">
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">Contactez-nous</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Demandez votre Démo Gratuite
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Découvrez comment CameroonCMS peut transformer la présence en ligne de votre mairie. 
            Remplissez le formulaire et nous vous contacterons dans les <strong>24 heures</strong>.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:scale-105 group">
              <div className="bg-gradient-to-br from-green-600 to-yellow-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <stat.icon className="h-7 w-7 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl hover:border-green-300 transition-all group">
            <div className="bg-gradient-to-br from-green-100 to-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Phone className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Téléphone</h3>
            <p className="text-gray-600 mb-4">Lun - Ven: 8h00 - 17h00</p>
            <a href="tel:+237XXXXXXXXX" className="text-green-600 hover:text-green-700 flex items-center gap-2 mb-2">
              +237 XXX XXX XXX <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl hover:border-green-300 transition-all group">
            <div className="bg-gradient-to-br from-green-100 to-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Email</h3>
            <p className="text-gray-600 mb-4">Réponse sous 24h garantie</p>
            <a href="mailto:contact@camerooncms.cm" className="text-green-600 hover:text-green-700 flex items-center gap-2">
              contact@camerooncms.cm <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-yellow-500 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all group text-white">
            <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">WhatsApp</h3>
            <p className="text-green-50 mb-4">Chat en direct - Réponse immédiate</p>
            <a href="https://wa.me/237XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-50 flex items-center gap-2">
              +237 XXX XXX XXX <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <p className="text-green-100 mt-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
              Disponible 24/7
            </p>
>>>>>>> origin/front
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
<<<<<<< HEAD
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
=======
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-600 to-yellow-500 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1540058404349-2e5fabf32d75?w=1080"
                  alt="Notre équipe"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-6 text-white">
                  <h3 className="text-xl font-bold text-white mb-1">Notre Bureau</h3>
                  <p className="text-green-100">Yaoundé, Cameroun</p>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Adresse</h4>
                    <p className="text-gray-600">Quartier Bastos, Yaoundé, Cameroun</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Horaires</h4>
                    <p className="text-gray-600">Lun - Ven: <span className="text-green-600 font-medium">8h00 - 17h00</span></p>
                    <p className="text-gray-600">Sam: <span className="text-green-600 font-medium">9h00 - 13h00</span></p>
>>>>>>> origin/front
                  </div>
                </div>
              </div>
            </div>

<<<<<<< HEAD
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
=======
            <div className="bg-gradient-to-br from-green-600 to-yellow-500 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-6">Pourquoi choisir CameroonCMS?</h3>
                <ul className="space-y-4">
                  {['Solution 100% camerounaise', 'Support en français et anglais', 'Tarifs adaptés aux budgets municipaux', 'Formation complète incluse', 'Hébergement sécurisé', 'Maintenance incluse'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Ce que disent nos clients</h3>
              <div className="space-y-6">
                {testimonials.map((t, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-6 py-2 hover:bg-green-50/50 transition-colors rounded-r-lg">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-3">"{t.content}"</p>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-gray-500 text-sm">{t.role}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Questions Fréquentes</h3>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-green-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                      <ChevronDown className={`h-5 w-5 text-green-600 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-4 pt-2 bg-green-50/50 border-t border-gray-200">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
>>>>>>> origin/front
                ))}
              </div>
            </div>
          </div>

<<<<<<< HEAD
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
=======
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 sticky top-24 h-fit">
            {submitted ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-green-100 to-yellow-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Demande envoyée avec succès!</h3>
                <p className="text-gray-600 mb-4">Notre équipe vous contactera dans les <strong>24 heures</strong>.</p>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <p className="text-gray-700 flex items-center justify-center gap-2">
                    <Mail className="h-5 w-5 text-green-600" />
                    Email de confirmation envoyé
                  </p>
                </div>
>>>>>>> origin/front
              </div>
            ) : (
              <>
                <div className="mb-6">
<<<<<<< HEAD
                  <h3 className="text-gray-900 mb-2">Demande de Démo</h3>
                  <p className="text-gray-600">Tous les champs avec * sont obligatoires</p>
=======
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Demande de Démo</h3>
                  <p className="text-gray-600">Champs avec <span className="text-red-500">*</span> obligatoires</p>
>>>>>>> origin/front
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
<<<<<<< HEAD
                    <label htmlFor="mairie" className="block text-gray-700 mb-2">
                      Nom de la Mairie *
=======
                    <label htmlFor="mairie" className="block text-gray-700 font-medium mb-2">
                      Nom de la Mairie <span className="text-red-500">*</span>
>>>>>>> origin/front
                    </label>
                    <input
                      type="text"
                      id="mairie"
                      name="mairie"
                      required
                      value={formData.mairie}
                      onChange={handleChange}
                      onBlur={() => handleBlur('mairie')}
<<<<<<< HEAD
                      className={`w-full px-4 py-3 border ${
                        errors.mairie && touched.mairie ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                      placeholder="Ex: Mairie de Douala 3ème"
                    />
                    {errors.mairie && touched.mairie && (
                      <div className="flex items-center gap-1 mt-1 text-red-600">
=======
                      className={`w-full px-4 py-3 border ${errors.mairie && touched.mairie ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all`}
                      placeholder="Ex: Mairie de Douala 3ème"
                    />
                    {errors.mairie && touched.mairie && (
                      <div className="flex items-center gap-1 mt-2 text-red-600">
>>>>>>> origin/front
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{errors.mairie}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
<<<<<<< HEAD
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
=======
                      <label htmlFor="nom" className="block text-gray-700 font-medium mb-2">Nom Complet <span className="text-red-500">*</span></label>
                      <input type="text" id="nom" name="nom" required value={formData.nom} onChange={handleChange} onBlur={() => handleBlur('nom')}
                        className={`w-full px-4 py-3 border ${errors.nom && touched.nom ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all`}
                        placeholder="Jean Dupont" />
                      {errors.nom && touched.nom && <div className="flex items-center gap-1 mt-2 text-red-600"><AlertCircle className="h-4 w-4" /><span className="text-sm">{errors.nom}</span></div>}
                    </div>
                    <div>
                      <label htmlFor="poste" className="block text-gray-700 font-medium mb-2">Poste <span className="text-red-500">*</span></label>
                      <input type="text" id="poste" name="poste" required value={formData.poste} onChange={handleChange} onBlur={() => handleBlur('poste')}
                        className={`w-full px-4 py-3 border ${errors.poste && touched.poste ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all`}
                        placeholder="Ex: Secrétaire Général" />
                      {errors.poste && touched.poste && <div className="flex items-center gap-1 mt-2 text-red-600"><AlertCircle className="h-4 w-4" /><span className="text-sm">{errors.poste}</span></div>}
>>>>>>> origin/front
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
<<<<<<< HEAD
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
=======
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email <span className="text-red-500">*</span></label>
                      <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} onBlur={() => handleBlur('email')}
                        className={`w-full px-4 py-3 border ${errors.email && touched.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all`}
                        placeholder="email@mairie.cm" />
                      {errors.email && touched.email && <div className="flex items-center gap-1 mt-2 text-red-600"><AlertCircle className="h-4 w-4" /><span className="text-sm">{errors.email}</span></div>}
                    </div>
                    <div>
                      <label htmlFor="telephone" className="block text-gray-700 font-medium mb-2">Téléphone <span className="text-red-500">*</span></label>
                      <input type="tel" id="telephone" name="telephone" required value={formData.telephone} onChange={handleChange} onBlur={() => handleBlur('telephone')}
                        className={`w-full px-4 py-3 border ${errors.telephone && touched.telephone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all`}
                        placeholder="+237 6XX XXX XXX" />
                      {errors.telephone && touched.telephone && <div className="flex items-center gap-1 mt-2 text-red-600"><AlertCircle className="h-4 w-4" /><span className="text-sm">{errors.telephone}</span></div>}
>>>>>>> origin/front
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
<<<<<<< HEAD
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
=======
                      <label htmlFor="tailleMairie" className="block text-gray-700 font-medium mb-2">Taille de la Commune</label>
                      <select id="tailleMairie" name="tailleMairie" value={formData.tailleMairie} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all">
                        <option value="">Sélectionner...</option>
                        <option value="petite">Petite (&lt; 10 000 hab.)</option>
                        <option value="moyenne">Moyenne (10k - 50k)</option>
                        <option value="grande">Grande (50k - 200k)</option>
                        <option value="metropole">Métropole (&gt; 200k)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="budget" className="block text-gray-700 font-medium mb-2">Budget Estimé</label>
                      <select id="budget" name="budget" value={formData.budget} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all">
>>>>>>> origin/front
                        <option value="">Sélectionner...</option>
                        <option value="moins-1m">&lt; 1M FCFA</option>
                        <option value="1m-3m">1M - 3M FCFA</option>
                        <option value="3m-5m">3M - 5M FCFA</option>
                        <option value="plus-5m">&gt; 5M FCFA</option>
                      </select>
                    </div>
                  </div>

                  <div>
<<<<<<< HEAD
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
=======
                    <label htmlFor="besoin" className="block text-gray-700 font-medium mb-2">Besoin Principal</label>
                    <select id="besoin" name="besoin" value={formData.besoin} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all">
                      <option value="">Sélectionner...</option>
                      <option value="nouveau">Création nouveau site</option>
                      <option value="refonte">Refonte site existant</option>
>>>>>>> origin/front
                      <option value="migration">Migration vers CameroonCMS</option>
                      <option value="conseil">Besoin de conseil</option>
                    </select>
                  </div>

                  <div>
<<<<<<< HEAD
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
=======
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                    <textarea id="message" name="message" rows={4} value={formData.message} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all resize-none"
                      placeholder="Décrivez vos besoins..." />
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-5 rounded-xl border border-green-200">
                    <p className="text-gray-700 flex items-start gap-2 text-sm">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>En soumettant ce formulaire, vous acceptez d'être contacté par notre équipe. Vos données sont protégées.</span>
                    </p>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group font-medium">
                    {loading ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Envoi en cours...</>
                    ) : (
                      <>Envoyer la Demande <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>

                  <p className="text-center text-gray-500 text-sm">
                    Ou appelez-nous: <a href="tel:+237XXXXXXXXX" className="text-green-600 hover:text-green-700 font-medium">+237 XXX XXX XXX</a>
>>>>>>> origin/front
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