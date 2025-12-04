# E-CMS Backend

## 🏛️ Système de Gestion de Contenu pour Mairies Camerounaises

E-CMS est un CMS centralisé et multi-tenant permettant aux collectivités locales camerounaises de gérer leur présence numérique de manière simple et efficace.

## 🚀 Technologies

- **Django 4.2** - Framework Python
- **Django REST Framework** - API REST
- **PostgreSQL** - Base de données
- **JWT** - Authentification (SimpleJWT)

## 📁 Structure du Projet

```
back/
├── ecms/                    # Configuration Django
│   ├── settings.py          # Paramètres du projet
│   ├── urls.py              # Routes principales
│   ├── wsgi.py              # WSGI application
│   └── asgi.py              # ASGI application
├── apps/                    # Applications Django
│   ├── users/               # Gestion des utilisateurs
│   ├── mairies/             # Gestion des mairies
│   ├── demarches/           # Démarches administratives
│   ├── documents/           # Documents et actualités
│   ├── projets/             # Projets municipaux
│   └── evenements/          # Événements
├── manage.py
├── requirements.txt
└── .env                     # Variables d'environnement
```

## 🔐 Rôles Utilisateurs

| Rôle | Description |
|------|-------------|
| **Admin National** | Gestion complète de toutes les mairies |
| **Agent Communal** | Gestion de sa mairie |
| **Citoyen** | Accès aux services de sa mairie |

## ⚙️ Installation

### 1. Prérequis
- Python 3.10+
- PostgreSQL 13+

### 2. Installation des dépendances

```bash
cd back
python -m venv venv
source venv/bin/activate  # Linux/Mac
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

| Endpoint | Description |
|----------|-------------|
| `/admin/` | Administration Django |
| `/api/auth/` | Authentification (inscription, connexion, JWT) |
| `/api/mairies/` | Gestion des mairies |
| `/api/demarches/` | Démarches et formulaires |
| `/api/documents/` | Documents et actualités |
| `/api/projets/` | Projets municipaux |
| `/api/evenements/` | Événements |

## 👥 Équipe

**Nuit de l'Info 2025 - Team FsUY1**

## 📄 Licence

Projet hackathon - Nuit de l'Info 2025
