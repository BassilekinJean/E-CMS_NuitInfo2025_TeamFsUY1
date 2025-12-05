# E-CMS Dockerfile
# Image Python officielle
FROM python:3.12-slim

# Variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV APP_HOME=/app

# Répertoire de travail
WORKDIR $APP_HOME

# Installer les dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de dépendances
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn psycopg2-binary

# Copier le code source
COPY . .

# Créer un utilisateur non-root
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser && \
    chown -R appuser:appgroup $APP_HOME

# Créer les dossiers pour les fichiers statiques et média
RUN mkdir -p /app/staticfiles /app/media && \
    chown -R appuser:appgroup /app/staticfiles /app/media

# Passer à l'utilisateur non-root
USER appuser

# Exposer le port
EXPOSE 8000

# Collecte des fichiers statiques
RUN python manage.py collectstatic --noinput --settings=ecms_config.settings || true

# Commande par défaut
CMD ["gunicorn", "ecms_config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--threads", "2"]
