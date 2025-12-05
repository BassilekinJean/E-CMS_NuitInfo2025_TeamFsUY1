#!/bin/bash
# E-CMS - Script de développement
# Lance le backend Django et le frontend Vite

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 E-CMS - Environnement de développement${NC}\n"

# Vérifier les dépendances
command -v python3 >/dev/null 2>&1 || { echo -e "${RED}❌ Python3 requis${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm requis${NC}"; exit 1; }

# Répertoire racine
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backCMS"
FRONTEND_DIR="$ROOT_DIR/front"

# Fonction pour nettoyer à la sortie
cleanup() {
    echo -e "\n${YELLOW}🛑 Arrêt des serveurs...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# === BACKEND ===
echo -e "${GREEN}📦 Configuration du backend Django...${NC}"
cd "$BACKEND_DIR"

# Créer/activer le virtualenv si nécessaire
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Création de l'environnement virtuel...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate

# Installer les dépendances
echo -e "${YELLOW}Installation des dépendances Python...${NC}"
pip install -q -r requirements.txt

# Migrations
echo -e "${YELLOW}Application des migrations...${NC}"
python manage.py migrate --run-syncdb

# Données initiales (si la commande existe)
if python manage.py help init_cameroun >/dev/null 2>&1; then
    echo -e "${YELLOW}Initialisation des données Cameroun...${NC}"
    python manage.py init_cameroun --skip-existing 2>/dev/null || true
fi

# Lancer le backend en arrière-plan
echo -e "${GREEN}✅ Backend Django sur http://localhost:8000${NC}"
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# === FRONTEND ===
echo -e "\n${GREEN}📦 Configuration du frontend React...${NC}"
cd "$FRONTEND_DIR"

# Installer les dépendances npm
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installation des dépendances npm...${NC}"
    npm install
fi

# Lancer le frontend en arrière-plan
echo -e "${GREEN}✅ Frontend Vite sur http://localhost:5173${NC}"
npm run dev &
FRONTEND_PID=$!

# === INFO ===
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 E-CMS est prêt !${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e ""
echo -e "  ${YELLOW}Portail national:${NC}     http://localhost:5173"
echo -e "  ${YELLOW}API Backend:${NC}          http://localhost:8000/api/v1/"
echo -e "  ${YELLOW}API Docs (Swagger):${NC}   http://localhost:8000/api/v1/docs/"
echo -e "  ${YELLOW}Admin Django:${NC}         http://localhost:8000/admin/"
echo -e ""
echo -e "  ${YELLOW}Tester un tenant:${NC}"
echo -e "    1. Ajouter dans /etc/hosts:  127.0.0.1 yaounde.localhost"
echo -e "    2. Visiter: http://yaounde.localhost:5173"
echo -e ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "  Appuyez sur ${RED}Ctrl+C${NC} pour arrêter les serveurs"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Attendre les processus
wait
