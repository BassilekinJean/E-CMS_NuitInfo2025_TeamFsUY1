# E-CMS Backend

## 🏛️ Système de Gestion de Contenu pour Mairies Camerounaises

E-CMS est un CMS centralisé et multi-tenant permettant aux collectivités locales camerounaises de gérer leur présence numérique de manière simple et efficace.

## 🚀 Technologies

- **Django 5.x** - Framework Python
- **Django REST Framework** - API REST
- **SQLite** (dev) / **PostgreSQL** (prod) - Base de données
- **JWT** - Authentification (SimpleJWT avec rotation de tokens)
- **drf-spectacular** / **drf-yasg** - Documentation API (Swagger/OpenAPI)
- **pyotp** - Authentification à deux facteurs (2FA)

## 📁 Structure du Projet

```
back/
├── ecms/                    # Configuration Django
│   ├── settings.py          # Paramètres du projet
│   ├── urls.py              # Routes principales (API v1)
│   ├── wsgi.py              # WSGI application
│   └── asgi.py              # ASGI application
├── apps/                    # Applications Django
│   ├── users/               # Gestion des utilisateurs & authentification
│   ├── mairies/             # Gestion des mairies (multi-tenant)
│   ├── demarches/           # Démarches administratives
│   ├── documents/           # Documents et actualités
│   ├── projets/             # Projets municipaux
│   ├── evenements/          # Événements
│   ├── dashboard/           # Statistiques et tableaux de bord
│   ├── publications/        # Publications avec likes/commentaires
│   ├── messages_app/        # Messagerie interne
│   ├── website/             # Configuration du site public
│   ├── notifications/       # Système de notifications
│   ├── media/               # Gestion des fichiers médias
│   └── settings_app/        # Paramètres utilisateur & 2FA
├── manage.py
├── requirements.txt
└── .env                     # Variables d'environnement
```

## 🔐 Rôles Utilisateurs

| Rôle | Description |
|------|-------------|
| **Admin National** | Gestion complète de toutes les mairies et utilisateurs |
| **Agent Communal** | Gestion de sa mairie assignée |

## 🔑 Authentification

- **JWT Access Token** : Durée de vie de 2 heures
- **JWT Refresh Token** : Durée de vie de 7 jours (avec rotation)
- **2FA** : Support TOTP via pyotp (optionnel)

## ⚙️ Installation

### 1. Prérequis
- Python 3.10+
- PostgreSQL 13+ (production) ou SQLite (développement)

### 2. Installation des dépendances

```bash
cd back
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3. Configuration

Créer un fichier `.env` :

```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=ecms_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

### 4. Base de données

```bash
# Créer la base de données PostgreSQL
createdb ecms_db

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser
```

### 5. Lancer le serveur

```bash
python manage.py runserver
```

## 🔌 API Endpoints

Tous les endpoints utilisent le préfixe `/api/v1/`.

### Authentification
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/v1/auth/register/` | POST | Inscription utilisateur |
| `/api/v1/auth/login/` | POST | Connexion (obtenir JWT) |
| `/api/v1/auth/token/refresh/` | POST | Rafraîchir le token |
| `/api/v1/auth/profile/` | GET/PUT | Profil utilisateur |

### Mairies & Contenu
| Endpoint | Description |
|----------|-------------|
| `/api/v1/mairies/` | Gestion des mairies |
| `/api/v1/demarches/` | Démarches et formulaires |
| `/api/v1/documents/` | Documents et actualités |
| `/api/v1/projets/` | Projets municipaux |
| `/api/v1/evenements/` | Événements |

### Dashboard & Analytics
| Endpoint | Description |
|----------|-------------|
| `/api/v1/dashboard/stats/` | Statistiques globales |
| `/api/v1/dashboard/charts/` | Données pour graphiques |
| `/api/v1/dashboard/activities/` | Activités récentes |

### Publications & Interactions
| Endpoint | Description |
|----------|-------------|
| `/api/v1/publications/` | CRUD publications |
| `/api/v1/publications/{id}/like/` | Liker une publication |
| `/api/v1/publications/{id}/comments/` | Commentaires |

### Messagerie
| Endpoint | Description |
|----------|-------------|
| `/api/v1/messages/conversations/` | Liste des conversations |
| `/api/v1/messages/conversations/{id}/messages/` | Messages d'une conversation |

### Notifications
| Endpoint | Description |
|----------|-------------|
| `/api/v1/notifications/` | Liste des notifications |
| `/api/v1/notifications/mark-all-read/` | Marquer toutes comme lues |

### Configuration
| Endpoint | Description |
|----------|-------------|
| `/api/v1/settings/` | Paramètres utilisateur |
| `/api/v1/settings/2fa/` | Gestion 2FA |
| `/api/v1/website/` | Configuration du site public |

### Documentation
| Endpoint | Description |
|----------|-------------|
| `/docs/` | Documentation Swagger UI |
| `/swagger/` | Documentation Swagger (alternatif) |
| `/redoc/` | Documentation ReDoc |

## 👥 Équipe

**Nuit de l'Info 2025 - Team FsUY1**

## 🧪 Tests

```bash
# Lancer les tests
python manage.py test

# Vérifier les problèmes
python manage.py check
```

## 📊 Administration

Accédez à l'interface d'administration Django :
- URL : `http://localhost:8000/admin/`
- Créez un superutilisateur : `python manage.py createsuperuser`

## 📄 Licence

Projet hackathon - Nuit de l'Info 2025
