# 🚀 Guide de Démarrage - E-CMS Backend

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Python 3.10+** : `python --version`
- **PostgreSQL 13+** : `psql --version`
- **pip** : `pip --version`

---

## 📋 Étapes d'installation

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/BassilekinJean/E-CMS_NuitInfo2025_TeamFsUY1.git
cd E-CMS_NuitInfo2025_TeamFsUY1
git checkout back
cd back
```

---

### 2️⃣ Créer l'environnement virtuel

```bash
# Créer le venv
python -m venv venv

# Activer le venv
# Sur Linux/Mac :
source venv/bin/activate

# Sur Windows :
venv\Scripts\activate
```

> ⚠️ **Important** : Le `(venv)` doit apparaître au début de votre ligne de commande.

---

### 3️⃣ Installer les dépendances

```bash
pip install -r requirements.txt
```

---

### 4️⃣ Configurer PostgreSQL

#### Option A : Création automatique (recommandé)

Exécutez ces commandes en tant qu'administrateur PostgreSQL :

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Dans le shell PostgreSQL, exécuter :
CREATE DATABASE ecms_db;
CREATE USER ecms_user WITH PASSWORD 'root';
GRANT ALL PRIVILEGES ON DATABASE ecms_db TO ecms_user;
ALTER USER ecms_user CREATEDB;
\q
```

#### Option B : Via pgAdmin

1. Ouvrir pgAdmin
2. Créer une base de données : `ecms_db`
3. Créer un utilisateur : `ecms_user` avec mot de passe `root`
4. Accorder tous les privilèges sur `ecms_db` à `ecms_user`

---

### 5️⃣ Configurer les variables d'environnement

Le fichier `.env` est déjà configuré. Vérifiez qu'il contient :

```env
# Configuration Django
SECRET_KEY=django-insecure-dev-key-change-in-production-e-cms-2025
DEBUG=True

# Configuration PostgreSQL
DB_NAME=ecms_db
DB_USER=ecms_user
DB_PASSWORD=root
DB_HOST=localhost
DB_PORT=5432
```

> Si le fichier `.env` n'existe pas, copiez `.env.example` :
> ```bash
> cp .env.example .env
> ```

---

### 6️⃣ Appliquer les migrations

```bash
python manage.py migrate
```

Vous devriez voir une série de "Applying ... OK"

---

### 7️⃣ Créer un superutilisateur (optionnel)

```bash
python manage.py createsuperuser
```

Ou utilisez le compte existant :
- **Email** : `admin@ecms.cm`
- **Mot de passe** : `admin123`

---

### 8️⃣ Lancer le serveur 🎉

```bash
python manage.py runserver
```

Le serveur démarre sur : **http://127.0.0.1:8000/**

---

## 🔗 URLs importantes

| URL | Description |
|-----|-------------|
| http://127.0.0.1:8000/admin/ | Panel d'administration Django |
| http://127.0.0.1:8000/api/auth/ | API Authentification |
| http://127.0.0.1:8000/api/mairies/ | API Mairies |
| http://127.0.0.1:8000/api/demarches/ | API Démarches |
| http://127.0.0.1:8000/api/documents/ | API Documents |
| http://127.0.0.1:8000/api/projets/ | API Projets |
| http://127.0.0.1:8000/api/evenements/ | API Événements |

---

## 🔐 Identifiants de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin National | admin@ecms.cm | admin123 |

---

## ❓ Résolution des problèmes courants

### Erreur : "FATAL: password authentication failed"

Vérifiez que l'utilisateur PostgreSQL existe :
```bash
sudo -u postgres psql -c "\du"
```

Recréez l'utilisateur si nécessaire :
```bash
sudo -u postgres psql -c "DROP USER IF EXISTS ecms_user;"
sudo -u postgres psql -c "CREATE USER ecms_user WITH PASSWORD 'root';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ecms_db TO ecms_user;"
```

### Erreur : "No module named 'xxx'"

Réinstallez les dépendances :
```bash
pip install -r requirements.txt
```

### Erreur : "CORS error" depuis le frontend

Ajoutez l'URL du frontend dans `.env` :
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

---

## 📁 Structure du projet

```
back/
├── ecms/                    # Configuration Django
│   ├── settings.py          # Paramètres
│   ├── urls.py              # Routes principales
│   └── wsgi.py              # WSGI
├── apps/                    # Applications
│   ├── users/               # Utilisateurs
│   ├── mairies/             # Mairies
│   ├── demarches/           # Démarches
│   ├── documents/           # Documents
│   ├── projets/             # Projets
│   └── evenements/          # Événements
├── manage.py
├── requirements.txt
├── .env                     # Variables d'environnement
└── GUIDE_DEMARRAGE.md       # Ce fichier
```

---

## 👥 Équipe - Nuit de l'Info 2025

**Team FsUY1** 🚀

Bon courage ! 💪
