# E-CMS - Portail des Communes du Cameroun 🇨🇲

**CMS multisite pour la gestion des sites communaux camerounais**

[![Django](https://img.shields.io/badge/Django-6.0-green.svg)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.15-red.svg)](https://www.django-rest-framework.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Description

E-CMS est un système de gestion de contenu multisite permettant à chaque commune camerounaise d'avoir son propre espace web administrable. La plateforme offre une architecture moderne et évolutive basée sur Django et Django REST Framework.

## ✨ Fonctionnalités

### 🏛️ Gestion des Communes
- Multi-tenancy : chaque commune a son espace dédié
- Équipe municipale et services
- Informations géographiques (latitude/longitude)
- Personnalisation du thème

### 📰 Actualités & CMS
- Articles avec catégories (communiqués, avis publics, vie municipale)
- Pages CMS personnalisables
- FAQ par commune
- Gestion de newsletter

### 📅 Événements & Agenda
- Calendrier des événements
- Inscriptions en ligne
- Système de rendez-vous

### 📊 Transparence
- Projets communaux avec suivi d'avancement
- Délibérations du conseil
- Documents budgétaires
- Documents officiels

### 📝 Services en Ligne
- Démarches administratives avec suivi
- Formulaires dynamiques (JSON)
- Signalements citoyens
- Contact en ligne

## 🚀 Installation

### Prérequis

- Python 3.10+
- pip
- virtualenv (recommandé)

### Installation locale

```bash
# Cloner le projet
git clone <repo-url>
cd backCMS

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
.\venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Initialiser les données du Cameroun
python manage.py init_cameroun --demo

# Lancer le serveur
python manage.py runserver
```

## 📁 Structure du Projet

```
backCMS/
├── ecms_config/          # Configuration Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── api/                  # API REST
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── core/                 # Module central
│   ├── models.py         # Utilisateur, Configuration
│   └── admin.py
├── communes/             # Gestion des communes
│   ├── models.py         # Region, Departement, Commune
│   └── admin.py
├── actualites/           # Actualités et CMS
│   ├── models.py         # Actualite, PageCMS, FAQ
│   └── admin.py
├── evenements/           # Événements
│   ├── models.py         # Evenement, RendezVous
│   └── admin.py
├── services/             # Services en ligne
│   ├── models.py         # Demarche, Signalement
│   └── admin.py
├── transparence/         # Transparence
│   ├── models.py         # Projet, Deliberation
│   └── admin.py
├── media/                # Fichiers uploadés
├── static/               # Fichiers statiques
└── requirements.txt
```

## 🔌 API REST

L'API est documentée automatiquement via OpenAPI/Swagger.

### Documentation
- **Swagger UI**: http://localhost:8000/api/v1/docs/
- **ReDoc**: http://localhost:8000/api/v1/redoc/
- **Schéma JSON**: http://localhost:8000/api/v1/schema/

### Points d'entrée principaux

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/v1/auth/login/` | POST | Connexion JWT |
| `/api/v1/auth/register/` | POST | Inscription |
| `/api/v1/auth/refresh/` | POST | Rafraîchir le token |
| `/api/v1/regions/` | GET | Liste des régions |
| `/api/v1/departements/` | GET | Liste des départements |
| `/api/v1/communes/` | GET, POST | Communes |
| `/api/v1/actualites/` | GET, POST | Actualités |
| `/api/v1/evenements/` | GET, POST | Événements |
| `/api/v1/projets/` | GET, POST | Projets |
| `/api/v1/demarches/` | GET, POST | Démarches |
| `/api/v1/signalements/` | GET, POST | Signalements |

### Authentification

L'API utilise JWT (JSON Web Tokens).

```bash
# Obtenir un token
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ecms.cm", "password": "admin123"}'

# Utiliser le token
curl -X GET http://localhost:8000/api/v1/dashboard/ \
  -H "Authorization: Bearer <access_token>"
```

## 👤 Rôles Utilisateurs

| Rôle | Permissions |
|------|-------------|
| `SUPER_ADMIN` | Accès total, gestion de toutes les communes |
| `ADMIN_COMMUNE` | Gestion complète de sa commune |
| `EDITEUR` | Création/modification de contenu |
| `MODERATEUR` | Modération des commentaires/signalements |

## 🔧 Configuration

### Variables d'environnement

```env
DEBUG=True
SECRET_KEY=votre-clé-secrète
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de données (production)
DATABASE_URL=postgres://user:password@host:port/db

# Email
EMAIL_HOST=smtp.example.com
EMAIL_HOST_USER=noreply@example.com
EMAIL_HOST_PASSWORD=password
```

### Base de données

Par défaut, SQLite est utilisé pour le développement. Pour la production, configurez PostgreSQL :

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ecms_db',
        'USER': 'ecms_user',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## 🧪 Tests

### Exécution des tests

```bash
# Lancer tous les tests
python manage.py test

# Tests d'un module spécifique
python manage.py test core
python manage.py test communes
python manage.py test actualites
python manage.py test services
python manage.py test transparence

# Avec verbosité
python manage.py test --verbosity=2
```

### Couverture de code

```bash
# Installer coverage
pip install coverage

# Exécuter avec couverture
coverage run manage.py test

# Rapport console
coverage report -m

# Rapport HTML
coverage html
# Ouvrir htmlcov/index.html
```

### Résumé des tests

| Module | Tests | Description |
|--------|-------|-------------|
| core | 14 | Utilisateur, ConfigurationPortail, Auth API, JWT |
| communes | 18 | Régions, Départements, Communes, Demandes, SiteCreationService |
| actualites | 13 | Actualités, Pages CMS, FAQ, Newsletter |
| services | 12 | Signalements, Démarches, Contacts |
| transparence | 10 | Projets, Délibérations, Documents budgétaires |
| **Total** | **67** | ✅ Tous passent |

## 📊 Données de Démonstration

Le projet inclut une commande pour initialiser les données du Cameroun :

```bash
# Régions et départements seulement
python manage.py init_cameroun

# Avec données de démo (communes, actualités, etc.)
python manage.py init_cameroun --demo

# Recréer toutes les données
python manage.py init_cameroun --demo --force
```

### Données incluses
- 10 régions du Cameroun
- 58 départements
- 3 communes de démonstration (Yaoundé 1er, Douala 3ème, Bafoussam 1er)
- Actualités, événements, projets de test

## 🔒 Sécurité

- Authentification JWT avec tokens de rafraîchissement
- Protection CORS configurée
- Permissions basées sur les rôles
- Validation des données côté serveur

## 🐳 Docker

### Fichiers Docker

Le projet inclut une configuration Docker complète pour le déploiement :

- `Dockerfile` : Image de l'application
- `docker-compose.yml` : Orchestration multi-conteneurs
- `.dockerignore` : Fichiers exclus

### Démarrage rapide

```bash
# Construire et démarrer
docker-compose up -d --build

# Voir les logs
docker-compose logs -f web

# Arrêter
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

### Commandes utiles

```bash
# Exécuter les migrations
docker-compose exec web python manage.py migrate

# Créer un superuser
docker-compose exec web python manage.py createsuperuser

# Initialiser les données Cameroun
docker-compose exec web python manage.py init_cameroun --demo

# Shell Django
docker-compose exec web python manage.py shell

# Exécuter les tests
docker-compose exec web python manage.py test
```

### Variables d'environnement Docker

Créez un fichier `.env` à la racine :

```env
# Django
DEBUG=0
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1,ecms.cm

# PostgreSQL
POSTGRES_DB=ecms_db
POSTGRES_USER=ecms_user
POSTGRES_PASSWORD=secure_password
DATABASE_URL=postgres://ecms_user:secure_password@db:5432/ecms_db

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## 🚀 Déploiement Production

### Checklist

- [ ] `DEBUG=False` dans les settings
- [ ] `SECRET_KEY` sécurisé (généré aléatoirement)
- [ ] `ALLOWED_HOSTS` configuré
- [ ] Base de données PostgreSQL
- [ ] Serveur WSGI (Gunicorn)
- [ ] Reverse proxy (Nginx)
- [ ] Certificat SSL (Let's Encrypt)
- [ ] Collecte des fichiers statiques
- [ ] Configuration des emails
- [ ] Backups automatisés

### Déploiement avec Docker

```bash
# Sur le serveur de production
docker-compose -f docker-compose.prod.yml up -d

# Collecter les fichiers statiques
docker-compose exec web python manage.py collectstatic --noinput

# Appliquer les migrations
docker-compose exec web python manage.py migrate
```

### Configuration Nginx (sans Docker)

```nginx
server {
    listen 80;
    server_name ecms.cm www.ecms.cm;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ecms.cm www.ecms.cm;

    ssl_certificate /etc/letsencrypt/live/ecms.cm/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ecms.cm/privkey.pem;

    location /static/ {
        alias /var/www/ecms/static/;
        expires 30d;
    }

    location /media/ {
        alias /var/www/ecms/media/;
        expires 30d;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Commandes de production (sans Docker)

```bash
# Collecte des fichiers statiques
python manage.py collectstatic --noinput

# Lancer avec Gunicorn
gunicorn ecms_config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --threads 2 \
    --timeout 120 \
    --access-logfile /var/log/ecms/access.log \
    --error-logfile /var/log/ecms/error.log
```

## 📝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

**Team FsUY1** - Nuit de l'Info 2025

## 📞 Contact

- Email: contact@ecms.cm
- Site: https://ecms.cm

---

*Fait avec ❤️ pour les communes camerounaises*
