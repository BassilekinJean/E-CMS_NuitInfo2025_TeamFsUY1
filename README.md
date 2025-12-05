# E-CMS - CMS Multisite pour Communes Camerounaises

![E-CMS](https://img.shields.io/badge/E--CMS-Nuit%20Info%202025-blue)
![Django](https://img.shields.io/badge/Django-4.2-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

E-CMS est un CMS multisite (multi-tenancy) permettant à chaque commune camerounaise d'avoir son propre espace web administrable, tout en bénéficiant d'une structure et de fonctionnalités standardisées.

## 🌟 Fonctionnalités Clés

### Gestion des Contenus (CMS)
- Interface intuitive pour la publication de pages d'information
- Pages: Présentation, Historique, Services, etc.
- Éditeur WYSIWYG

### Diffusion d'Infos & Actualités
- Publication de communiqués de presse et avis publics
- Système de newsletter avec abonnement/désabonnement
- Catégorisation des actualités

### Agenda & Événements
- Calendrier public des réunions et événements culturels
- Module d'inscription aux événements
- Prise de rendez-vous en ligne

### Transparence & Gouvernance
- Section projets avec suivi d'avancement et budget
- Publication des délibérations
- Documents budgétaires publics

### Services aux Citoyens
- Formulaires en ligne pour démarches administratives
- Signalement de problèmes
- FAQ et base de connaissances
- Suivi des demandes par numéro

## 🏗️ Architecture Multi-Tenant

Le multi-tenancy fonctionne par **sous-domaine** :
- `ecms.cm` → Portail national
- `yaounde.ecms.cm` → Site de la commune de Yaoundé
- `douala.ecms.cm` → Site de la commune de Douala

Chaque commune dispose de :
- Son propre espace de contenu (actualités, pages, événements)
- Sa personnalisation visuelle (logo, couleurs, bannière)
- Ses administrateurs et éditeurs

## 🚀 Démarrage Rapide

### Prérequis
- Python 3.10+
- Node.js 18+
- npm ou yarn

### Installation

```bash
# Cloner le projet
git clone https://github.com/votre-repo/E-CMS_NuitInfo2025_TeamFsUY1.git
cd E-CMS_NuitInfo2025_TeamFsUY1

# Lancer l'environnement de développement complet
./dev.sh
```

Ou manuellement :

```bash
# Backend Django
cd backCMS
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend React (dans un autre terminal)
cd front
npm install
npm run dev
```

### URLs en développement

| Service | URL |
|---------|-----|
| Portail national | http://localhost:5173 |
| API Backend | http://localhost:8000/api/v1/ |
| Documentation API (Swagger) | http://localhost:8000/api/v1/docs/ |
| Admin Django | http://localhost:8000/admin/ |

### Tester le multi-tenancy localement

1. Ajouter dans `/etc/hosts` (Linux/Mac) ou `C:\Windows\System32\drivers\etc\hosts` (Windows) :
   ```
   127.0.0.1 yaounde.localhost
   127.0.0.1 douala.localhost
   ```

2. Créer une commune avec le slug `yaounde` via l'admin Django ou l'API

3. Visiter http://yaounde.localhost:5173

## 📁 Structure du Projet

```
E-CMS_NuitInfo2025_TeamFsUY1/
├── backCMS/                 # Backend Django
│   ├── api/                 # API REST (DRF)
│   ├── core/                # Utilisateurs, Config, Middleware tenant
│   ├── communes/            # Modèles communes (tenant)
│   ├── actualites/          # Actualités, Pages CMS, Newsletter
│   ├── evenements/          # Événements, Inscriptions, RDV
│   ├── services/            # Formulaires, Démarches, Signalements
│   ├── transparence/        # Projets, Délibérations, Budgets
│   └── ecms_config/         # Settings Django
│
├── front/                   # Frontend React + TypeScript
│   ├── src/
│   │   ├── api/             # Client API, services
│   │   ├── contexts/        # TenantContext, AuthContext
│   │   ├── hooks/           # useApi hooks
│   │   ├── pages/           # Pages tenant (Actualités, Événements...)
│   │   └── components/      # Composants UI
│   └── ...
│
├── dev.sh                   # Script de développement
└── README.md
```

## 🔌 API REST

L'API est documentée via Swagger/OpenAPI : `/api/v1/docs/`

### Endpoints principaux

| Endpoint | Description |
|----------|-------------|
| `/api/v1/auth/` | Authentification JWT |
| `/api/v1/communes/` | Liste et détail des communes |
| `/api/v1/actualites/` | Actualités |
| `/api/v1/evenements/` | Événements |
| `/api/v1/pages/` | Pages CMS |
| `/api/v1/projets/` | Projets (transparence) |
| `/api/v1/signalements/` | Signalements citoyens |
| `/api/v1/newsletter/abonnes/` | Abonnement newsletter |
| `/api/v1/recherche/` | Recherche globale |
| `/api/v1/stats/` | Statistiques publiques |

## 🛠️ Technologies

### Backend
- **Django 4.2** - Framework web Python
- **Django REST Framework** - API REST
- **SimpleJWT** - Authentification JWT
- **drf-spectacular** - Documentation OpenAPI

### Frontend
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **Tailwind CSS** - Styles
- **React Router** - Routage
- **Lucide React** - Icônes

## 👥 Équipe

Projet réalisé lors de la **Nuit de l'Info 2025** par l'équipe **FsUY1**.

## 📄 Licence

MIT License
