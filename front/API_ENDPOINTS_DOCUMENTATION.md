# 📋 Documentation Complète des Endpoints API Django - E-CMS Mairie

## 🔧 Configuration de base

```python
# settings.py
BASE_API_URL = "http://localhost:8000/api/v1"
```

---

## 🔐 1. AUTHENTIFICATION & UTILISATEURS

### 1.1 Inscription
```
POST /api/v1/auth/register/
```
**Request Body:**
```json
{
  "email": "maire@mairie-exemple.fr",
  "password": "securePassword123",
  "password_confirm": "securePassword123",
  "first_name": "Jean",
  "last_name": "Dupont",
  "role": "mayor",  // "mayor", "admin", "moderator", "citizen"
  "phone": "+33612345678",
  "municipality_code": "75001"
}
```
**Response (201):**
```json
{
  "id": 1,
  "email": "maire@mairie-exemple.fr",
  "first_name": "Jean",
  "last_name": "Dupont",
  "role": "mayor",
  "is_verified": false,
  "created_at": "2025-12-05T10:00:00Z"
}
```

### 1.2 Connexion
```
POST /api/v1/auth/login/
```
**Request Body:**
```json
{
  "email": "maire@mairie-exemple.fr",
  "password": "securePassword123"
}
```
**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "maire@mairie-exemple.fr",
    "first_name": "Jean",
    "last_name": "Dupont",
    "role": "mayor",
    "avatar_url": "/media/avatars/user_1.jpg",
    "municipality": {
      "id": 1,
      "name": "Mairie de Paris 1er",
      "code": "75001"
    }
  }
}
```

### 1.3 Rafraîchir le Token
```
POST /api/v1/auth/token/refresh/
```
**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Response (200):**
```json
{
  "access_token": "new_access_token...",
  "expires_in": 3600
}
```

### 1.4 Déconnexion
```
POST /api/v1/auth/logout/
Authorization: Bearer {access_token}
```
**Response (200):**
```json
{
  "message": "Déconnexion réussie"
}
```

### 1.5 Vérification Email - Envoi OTP
```
POST /api/v1/auth/email/verify/send/
```
**Request Body:**
```json
{
  "email": "maire@mairie-exemple.fr"
}
```
**Response (200):**
```json
{
  "message": "Code OTP envoyé par email",
  "expires_in": 600
}
```

### 1.6 Vérification Email - Valider OTP
```
POST /api/v1/auth/email/verify/confirm/
```
**Request Body:**
```json
{
  "email": "maire@mairie-exemple.fr",
  "otp_code": "123456"
}
```
**Response (200):**
```json
{
  "message": "Email vérifié avec succès",
  "is_verified": true
}
```

### 1.7 Mot de passe oublié
```
POST /api/v1/auth/password/forgot/
```
**Request Body:**
```json
{
  "email": "maire@mairie-exemple.fr"
}
```
**Response (200):**
```json
{
  "message": "Email de réinitialisation envoyé"
}
```

### 1.8 Réinitialiser le mot de passe
```
POST /api/v1/auth/password/reset/
```
**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "newSecurePassword123",
  "password_confirm": "newSecurePassword123"
}
```
**Response (200):**
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

### 1.9 Profil Utilisateur
```
GET /api/v1/auth/profile/
Authorization: Bearer {access_token}
```
**Response (200):**
```json
{
  "id": 1,
  "email": "maire@mairie-exemple.fr",
  "first_name": "Jean",
  "last_name": "Dupont",
  "role": "mayor",
  "phone": "+33612345678",
  "avatar_url": "/media/avatars/user_1.jpg",
  "is_verified": true,
  "municipality": {
    "id": 1,
    "name": "Mairie de Paris 1er",
    "code": "75001"
  },
  "created_at": "2025-12-05T10:00:00Z",
  "last_login": "2025-12-05T14:30:00Z"
}
```

### 1.10 Mettre à jour le profil
```
PUT /api/v1/auth/profile/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```
**Request Body (form-data):**
```
first_name: Jean
last_name: Dupont
phone: +33612345678
avatar: [file]
```
**Response (200):**
```json
{
  "id": 1,
  "email": "maire@mairie-exemple.fr",
  "first_name": "Jean",
  "last_name": "Dupont",
  "avatar_url": "/media/avatars/user_1_new.jpg",
  "message": "Profil mis à jour"
}
```

---

## 📊 2. DASHBOARD & STATISTIQUES

### 2.1 Statistiques globales du dashboard
```
GET /api/v1/dashboard/stats/
Authorization: Bearer {access_token}
```
**Response (200):**
```json
{
  "citizens": {
    "total": 15420,
    "trend": 12.5,
    "trend_direction": "up",
    "new_this_month": 234
  },
  "publications": {
    "total": 1847,
    "trend": 8.3,
    "trend_direction": "up",
    "posts": 1200,
    "communiques": 647
  },
  "events": {
    "total": 89,
    "trend": -2.1,
    "trend_direction": "down",
    "upcoming": 23,
    "this_week": 5
  },
  "messages": {
    "total": 2341,
    "trend": 15.7,
    "trend_direction": "up",
    "unread": 47
  },
  "engagement": {
    "likes_total": 45230,
    "comments_total": 12890,
    "views_total": 234567,
    "average_engagement_rate": 4.2
  }
}
```

### 2.2 Données des graphiques
```
GET /api/v1/dashboard/charts/
Authorization: Bearer {access_token}
Query Params: ?period=week|month|year&type=all|visits|publications|engagement
```
**Response (200):**
```json
{
  "period": "week",
  "visits_chart": {
    "labels": ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    "data": [1200, 1900, 1500, 2100, 1800, 900, 600]
  },
  "publications_chart": {
    "labels": ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    "posts": [5, 8, 3, 12, 7, 2, 1],
    "communiques": [2, 1, 3, 2, 4, 0, 1]
  },
  "engagement_chart": {
    "labels": ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    "likes": [120, 180, 95, 230, 156, 45, 32],
    "comments": [34, 56, 28, 78, 45, 12, 8]
  },
  "category_distribution": {
    "labels": ["Actualités", "Événements", "Services", "Urbanisme", "Culture"],
    "data": [35, 25, 20, 12, 8],
    "colors": ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]
  },
  "audience_demographics": {
    "age_groups": {
      "18-25": 15,
      "26-35": 28,
      "36-45": 25,
      "46-55": 18,
      "56+": 14
    },
    "devices": {
      "mobile": 65,
      "desktop": 30,
      "tablet": 5
    }
  }
}
```

### 2.3 Activités récentes
```
GET /api/v1/dashboard/activities/
Authorization: Bearer {access_token}
Query Params: ?limit=10&offset=0
```
**Response (200):**
```json
{
  "count": 156,
  "next": "/api/v1/dashboard/activities/?limit=10&offset=10",
  "previous": null,
  "results": [
    {
      "id": 1,
      "type": "publication_created",
      "title": "Nouvelle publication créée",
      "description": "Inauguration du nouveau parc municipal",
      "user": {
        "id": 1,
        "name": "Jean Dupont",
        "avatar_url": "/media/avatars/user_1.jpg"
      },
      "timestamp": "2025-12-05T14:30:00Z",
      "icon": "FileText",
      "color": "blue"
    },
    {
      "id": 2,
      "type": "event_scheduled",
      "title": "Événement programmé",
      "description": "Conseil municipal - 10 décembre 2025",
      "user": {
        "id": 1,
        "name": "Jean Dupont"
      },
      "timestamp": "2025-12-05T13:15:00Z",
      "icon": "Calendar",
      "color": "green"
    },
    {
      "id": 3,
      "type": "message_received",
      "title": "Nouveau message citoyen",
      "description": "Question sur les horaires de la déchetterie",
      "user": {
        "id": 45,
        "name": "Marie Martin"
      },
      "timestamp": "2025-12-05T12:00:00Z",
      "icon": "MessageSquare",
      "color": "purple"
    }
  ]
}
```

---

## 📝 3. PUBLICATIONS (Posts & Communiqués)

### 3.1 Liste des publications
```
GET /api/v1/publications/
Authorization: Bearer {access_token}
Query Params: ?type=post|communique&status=draft|published|scheduled|archived&search=query&page=1&limit=20&ordering=-created_at
```
**Response (200):**
```json
{
  "count": 1847,
  "next": "/api/v1/publications/?page=2&limit=20",
  "previous": null,
  "results": [
    {
      "id": "pub_001",
      "type": "post",
      "title": "Inauguration du nouveau parc municipal",
      "content": "Nous avons le plaisir de vous annoncer...",
      "excerpt": "Nous avons le plaisir de vous annoncer l'ouverture...",
      "cover_image": "/media/publications/park_inauguration.jpg",
      "images": [
        "/media/publications/park_1.jpg",
        "/media/publications/park_2.jpg"
      ],
      "author": {
        "id": 1,
        "name": "Jean Dupont",
        "role": "Maire",
        "avatar_url": "/media/avatars/user_1.jpg"
      },
      "status": "published",
      "category": "actualites",
      "tags": ["parc", "inauguration", "loisirs"],
      "likes": 234,
      "comments_count": 45,
      "views": 1892,
      "is_pinned": true,
      "allow_comments": true,
      "created_at": "2025-12-05T10:00:00Z",
      "updated_at": "2025-12-05T10:00:00Z",
      "published_at": "2025-12-05T10:00:00Z",
      "scheduled_at": null
    },
    {
      "id": "pub_002",
      "type": "communique",
      "title": "Alerte météo - Vigilance orange",
      "content": "Météo France a placé notre département...",
      "priority": "high",
      "author": {
        "id": 1,
        "name": "Jean Dupont",
        "role": "Maire"
      },
      "status": "published",
      "views": 3421,
      "created_at": "2025-12-04T18:00:00Z",
      "expires_at": "2025-12-06T18:00:00Z"
    }
  ]
}
```

### 3.2 Créer une publication
```
POST /api/v1/publications/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```
**Request Body (form-data):**
```
type: post
title: Inauguration du nouveau parc municipal
content: Nous avons le plaisir de vous annoncer l'ouverture officielle...
category: actualites
tags: ["parc", "inauguration", "loisirs"]
status: published
cover_image: [file]
images: [file1, file2, file3]
allow_comments: true
is_pinned: false
scheduled_at: null
```
**Response (201):**
```json
{
  "id": "pub_003",
  "type": "post",
  "title": "Inauguration du nouveau parc municipal",
  "content": "Nous avons le plaisir de vous annoncer l'ouverture officielle...",
  "cover_image": "/media/publications/cover_pub_003.jpg",
  "status": "published",
  "author": {
    "id": 1,
    "name": "Jean Dupont"
  },
  "created_at": "2025-12-05T15:00:00Z",
  "message": "Publication créée avec succès"
}
```

### 3.3 Détail d'une publication
```
GET /api/v1/publications/{publication_id}/
Authorization: Bearer {access_token}
```
**Response (200):**
```json
{
  "id": "pub_001",
  "type": "post",
  "title": "Inauguration du nouveau parc municipal",
  "content": "Contenu complet de la publication...",
  "cover_image": "/media/publications/park_inauguration.jpg",
  "images": [...],
  "author": {...},
  "status": "published",
  "category": "actualites",
  "tags": ["parc", "inauguration"],
  "likes": 234,
  "liked_by_me": false,
  "comments": [
    {
      "id": "com_001",
      "content": "Excellent projet !",
      "author": {
        "id": 25,
        "name": "Pierre Durand",
        "avatar_url": "/media/avatars/user_25.jpg"
      },
      "created_at": "2025-12-05T11:30:00Z",
      "replies": [...]
    }
  ],
  "comments_count": 45,
  "views": 1892,
  "created_at": "2025-12-05T10:00:00Z"
}
```

### 3.4 Mettre à jour une publication
```
PUT /api/v1/publications/{publication_id}/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```
**Request Body (form-data):**
```
title: Titre modifié
content: Contenu modifié
status: published
remove_images: ["image_id_1", "image_id_2"]
new_images: [file1, file2]
```
**Response (200):**
```json
{
  "id": "pub_001",
  "title": "Titre modifié",
  "updated_at": "2025-12-05T16:00:00Z",
  "message": "Publication mise à jour"
}
```

### 3.5 Supprimer une publication
```
DELETE /api/v1/publications/{publication_id}/
Authorization: Bearer {access_token}
```
**Response (204):** No Content

### 3.6 Liker une publication
```
POST /api/v1/publications/{publication_id}/like/
Authorization: Bearer {access_token}
```
**Response (200):**
```json
{
  "liked": true,
  "likes_count": 235
}
```

### 3.7 Ajouter un commentaire
```
POST /api/v1/publications/{publication_id}/comments/
Authorization: Bearer {access_token}
```
**Request Body:**
```json
{
  "content": "Excellent projet !",
  "parent_id": null  // ou ID du commentaire parent pour une réponse
}
```
**Response (201):**
```json
{
  "id": "com_046",
  "content": "Excellent projet !",
  "author": {
    "id": 1,
    "name": "Jean Dupont"
  },
  "created_at": "2025-12-05T16:30:00Z"
}
```

### 3.8 Supprimer un commentaire
```
DELETE /api/v1/publications/{publication_id}/comments/{comment_id}/
Authorization: Bearer {access_token}
```
**Response (204):** No Content

---

## 📅 4. ÉVÉNEMENTS (Emploi du temps du Maire)

### 4.1 Liste des événements
```
GET /api/v1/events/
Authorization: Bearer {access_token}
Query Params: ?start_date=2025-12-01&end_date=2025-12-31&category=reunion|ceremonie|conseil&priority=low|medium|high|urgent&search=query
```
**Response (200):**
```json
{
  "count": 89,
  "results": [
    {
      "id": "evt_001",
      "title": "Conseil Municipal",
      "description": "Réunion mensuelle du conseil municipal",
      "category": "conseil",
      "priority": "high",
      "color": "blue",
      "start_datetime": "2025-12-10T18:00:00Z",
      "end_datetime": "2025-12-10T21:00:00Z",
      "all_day": false,
      "location": {
        "name": "Salle du Conseil",
        "address": "1 Place de la Mairie, 75001 Paris"
      },
      "attendees": [
        {
          "id": 1,
          "name": "Jean Dupont",
          "role": "Maire",
          "status": "confirmed"
        },
        {
          "id": 2,
          "name": "Marie Martin",
          "role": "Adjoint",
          "status": "pending"
        }
      ],
      "is_recurring": true,
      "recurring_pattern": "monthly",
      "reminders": [30, 60, 1440],  // minutes avant
      "notes": "Ordre du jour disponible en mairie",
      "is_public": true,
      "created_by": {
        "id": 1,
        "name": "Jean Dupont"
      },
      "created_at": "2025-11-20T10:00:00Z",
      "updated_at": "2025-12-01T14:00:00Z"
    }
  ]
}
```

### 4.2 Créer un événement
```
POST /api/v1/events/
Authorization: Bearer {access_token}
```
**Request Body:**
```json
{
  "title": "Réunion avec les associations",
  "description": "Rencontre annuelle avec les responsables associatifs",
  "category": "reunion",
  "priority": "medium",
  "color": "green",
  "start_datetime": "2025-12-15T14:00:00Z",
  "end_datetime": "2025-12-15T16:00:00Z",
  "all_day": false,
  "location": {
    "name": "Salle des fêtes",
    "address": "10 Rue des Associations, 75001 Paris"
  },
  "attendees_ids": [2, 5, 8, 12],
  "is_recurring": false,
  "reminders": [30, 1440],
  "notes": "Préparer le bilan annuel",
  "is_public": true
}
```
**Response (201):**
```json
{
  "id": "evt_090",
  "title": "Réunion avec les associations",
  "start_datetime": "2025-12-15T14:00:00Z",
  "created_at": "2025-12-05T17:00:00Z",
  "message": "Événement créé avec succès"
}
```

### 4.3 Détail d'un événement
```
GET /api/v1/events/{event_id}/
Authorization: Bearer {access_token}
```
**Response (200):** (Structure complète de l'événement)

### 4.4 Mettre à jour un événement
```
PUT /api/v1/events/{event_id}/
Authorization: Bearer {access_token}
```
**Request Body:** (Champs à modifier)
**Response (200):**
```json
{
  "id": "evt_001",
  "updated_at": "2025-12-05T17:30:00Z",
  "message": "Événement mis à jour"
}
```

### 4.5 Supprimer un événement
```
DELETE /api/v1/events/{event_id}/
Authorization: Bearer {access_token}
Query Params: ?delete_series=true  // pour supprimer toute la série récurrente
```
**Response (204):** No Content

### 4.6 Répondre à une invitation
```
POST /api/v1/events/{event_id}/respond/
Authorization: Bearer {access_token}
```
**Request Body:**
```json
{
  "status": "confirmed"  // "confirmed", "declined", "tentative"
}
```
**Response (200):**
```json
{
  "message": "Réponse enregistrée",
  "status": "confirmed"
}
```

### 4.7 Calendrier vue semaine/mois
```
GET /api/v1/events/calendar/
Authorization: Bearer {access_token}
Query Params: ?view=week|month&date=2025-12-05
```
**Response (200):**
```json
{
  "view": "week",
  "start_date": "2025-12-01",
  "end_date": "2025-12-07",
  "days": [
    {
      "date": "2025-12-01",
      "day_name": "Lundi",
      "events": [
        {
          "id": "evt_001",
          "title": "Réunion cabinet",
          "start_time": "09:00",
          "end_time": "10:30",
          "category": "reunion",
          "color": "blue"
        }
      ]
    },
    // ... autres jours
  ]
}
```

---

## 💬 5. MESSAGES (Communication Citoyens)

### 5.1 Liste des conversations
```
GET /api/v1/messages/conversations/
Authorization: Bearer {access_token}
Query Params: ?status=unread|read|archived&search=query&page=1
```
**Response (200):**
```json
{
  "count": 156,
  "unread_count": 47,
  "results": [
    {
      "id": "conv_001",
      "citizen": {
        "id": 45,
        "name": "Marie Martin",
        "email": "marie.martin@email.fr",
        "avatar_url": "/media/avatars/user_45.jpg"
      },
      "subject": "Question sur les horaires de la déchetterie",
      "last_message": {
        "id": "msg_234",
        "content": "Bonjour, pourriez-vous me confirmer les nouveaux horaires ?",
        "sender_type": "citizen",
        "created_at": "2025-12-05T11:30:00Z"
      },
      "unread_count": 2,
      "status": "unread",
      "priority": "normal",
      "category": "services",
      "created_at": "2025-12-05T10:00:00Z",
      "updated_at": "2025-12-05T11:30:00Z"
    }
  ]
}
```

### 5.2 Détail d'une conversation
```
GET /api/v1/messages/conversations/{conversation_id}/
Authorization: Bearer {access_token}
```
**Response (200):**
```json
{
  "id": "conv_001",
  "citizen": {...},
  "subject": "Question sur les horaires de la déchetterie",
  "category": "services",
  "messages": [
    {
      "id": "msg_230",
      "content": "Bonjour Monsieur le Maire, je souhaiterais...",
      "sender_type": "citizen",
      "sender": {
        "id": 45,
        "name": "Marie Martin"
      },
      "attachments": [],
      "read_at": "2025-12-05T10:30:00Z",
      "created_at": "2025-12-05T10:00:00Z"
    },
    {
      "id": "msg_234",
      "content": "Bonjour Madame Martin, voici les nouveaux horaires...",
      "sender_type": "mayor",
      "sender": {
        "id": 1,
        "name": "Jean Dupont"
      },
      "attachments": [
        {
          "id": "att_001",
          "name": "horaires_dechetterie.pdf",
          "url": "/media/attachments/horaires_dechetterie.pdf",
          "size": 245678
        }
      ],
      "created_at": "2025-12-05T11:00:00Z"
    }
  ],
  "created_at": "2025-12-05T10:00:00Z"
}
```

### 5.3 Répondre à une conversation
```
POST /api/v1/messages/conversations/{conversation_id}/reply/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```
**Request Body:**
```
content: Voici ma réponse...
attachments: [file1, file2]
```
**Response (201):**
```json
{
  "id": "msg_235",
  "content": "Voici ma réponse...",
  "attachments": [...],
  "created_at": "2025-12-05T17:00:00Z"
}
```

### 5.4 Marquer comme lu/archiver
```
PUT /api/v1/messages/conversations/{conversation_id}/
Authorization: Bearer {access_token}
```
**Request Body:**
```json
{
  "status": "read"  // "read", "archived"
}
```
**Response (200):**
```json
{
  "message": "Conversation mise à jour"
}
```

### 5.5 Supprimer une conversation
```
DELETE /api/v1/messages/conversations/{conversation_id}/
Authorization: Bearer {access_token}
```
**Response (204):** No Content

---

## 🌐 6. SITE WEB DE LA MAIRIE

### 6.1 Configuration du site
```
GET /api/v1/website/config/
Authorization: Bearer {access_token}
```
**Response (200):**
```json
{
  "id": 1,
  "municipality": {
    "id": 1,
    "name": "Mairie de Paris 1er",
    "code": "75001"
  },
  "domain": "mairie-paris1.fr",
  "is_published": true,
  "theme": {
    "primary_color": "#1E40AF",
    "secondary_color": "#3B82F6",
    "accent_color": "#10B981",
    "background_color": "#F8FAFC",
    "text_color": "#1E293B",
    "font_family": "Inter"
  },
  "logo_url": "/media/website/logo.png",
  "favicon_url": "/media/website/favicon.ico",
  "meta": {
    "title": "Mairie de Paris 1er - Site Officiel",
    "description": "Bienvenue sur le site officiel de la Mairie de Paris 1er arrondissement",
    "keywords": ["mairie", "paris", "1er arrondissement", "services municipaux"]
  },
  "social_links": {
    "facebook": "https://facebook.com/mairieparis1",
    "twitter": "https://twitter.com/mairieparis1",
    "instagram": "https://instagram.com/mairieparis1",
    "linkedin": null,
    "youtube": null
  },
  "contact": {
    "address": "1 Place du Louvre, 75001 Paris",
    "phone": "+33 1 23 45 67 89",
    "email": "contact@mairie-paris1.fr",
    "opening_hours": {
      "monday": {"open": "08:30", "close": "17:00"},
      "tuesday": {"open": "08:30", "close": "17:00"},
      "wednesday": {"open": "08:30", "close": "17:00"},
      "thursday": {"open": "08:30", "close": "17:00"},
      "friday": {"open": "08:30", "close": "16:00"},
      "saturday": {"open": null, "close": null},
      "sunday": {"open": null, "close": null}
    }
  },
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-12-05T10:00:00Z"
}
```

### 6.2 Mettre à jour la configuration
```
PUT /api/v1/website/config/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```
**Request Body (form-data):**
```
theme: {"primary_color": "#1E40AF", ...}
meta: {"title": "Nouveau titre", ...}
social_links: {...}
contact: {...}
logo: [file]
favicon: [file]
```
**Response (200):**
```json
{
  "message": "Configuration mise à jour",
  "updated_at": "2025-12-05T18:00:00Z"
}
```

### 6.3 Sections du site
```
GET /api/v1/website/sections/
Authorization: Bearer {access_token}
```
**Response (200):**
```json
{
  "sections": [
    {
      "id": "section_hero",
      "type": "hero",
      "order": 1,
      "is_visible": true,
      "content": {
        "title": "Bienvenue à la Mairie de Paris 1er",
        "subtitle": "Au service des citoyens depuis 1860",
        "background_image": "/media/website/hero_bg.jpg",
        "cta_text": "Découvrir nos services",
        "cta_link": "/services"
      }
    },
    {
      "id": "section_services",
      "type": "services",
      "order": 2,
      "is_visible": true,
      "content": {
        "title": "Nos Services",
        "subtitle": "Des services de qualité pour tous",
        "services": [
          {
            "id": "srv_001",
            "icon": "FileText",
            "title": "État Civil",
            "description": "Actes de naissance, mariage, décès...",
            "link": "/services/etat-civil"
          },
          {
            "id": "srv_002",
            "icon": "Home",
            "title": "Urbanisme",
            "description": "Permis de construire, déclarations...",
            "link": "/services/urbanisme"
          }
        ]
      }
    },
    {
      "id": "section_events",
      "type": "events",
      "order": 3,
      "is_visible": true,
      "content": {
        "title": "Événements à venir",
        "display_count": 6,
        "show_calendar_link": true
      }
    },
    {
      "id": "section_news",
      "type": "news",
      "order": 4,
      "is_visible": true,
      "content": {
        "title": "Actualités",
        "display_count": 4,
        "categories": ["actualites", "culture"]
      }
    },
    {
      "id": "section_contact",
      "type": "contact",
      "order": 5,
      "is_visible": true,
      "content": {
        "title": "Nous contacter",
        "show_map": true,
        "show_form": true,
        "map_coordinates": {
          "lat": 48.8606,
          "lng": 2.3376
        }
      }
    }
  ]
}
```

### 6.4 Mettre à jour une section
```
PUT /api/v1/website/sections/{section_id}/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```
**Request Body:**
```json
{
  "is_visible": true,
  "order": 2,
  "content": {
    "title": "Nouveau titre",
    "subtitle": "Nouveau sous-titre"
    // ... autres champs selon le type de section
  }
}
```
**Response (200):**
```json
{
  "id": "section_hero",
  "message": "Section mise à jour"
}
```

### 6.5 Réordonner les sections
```
PUT /api/v1/website/sections/reorder/
Authorization: Bearer {access_token}
```
**Request Body:**
```json
{
  "order": ["section_hero", "section_news", "section_services", "section_events", "section_contact"]
}
```
**Response (200):**
```json
{
  "message": "Ordre des sections mis à jour"
}
```

### 6.6 Pages personnalisées
```
GET /api/v1/website/pages/
Authorization: Bearer {access_token}
```
**Response (200):**
```json
{
  "pages": [
    {
      "id": "page_001",
      "title": "Mentions légales",
      "slug": "mentions-legales",
      "content": "<h1>Mentions légales</h1><p>...</p>",
      "is_published": true,
      "in_menu": true,
      "menu_order": 1,
      "meta_title": "Mentions légales - Mairie",
      "meta_description": "Consultez les mentions légales...",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-06-15T10:00:00Z"
    }
  ]
}
```

### 6.7 Créer une page
```
POST /api/v1/website/pages/
Authorization: Bearer {access_token}
```
**Request Body:**
```json
{
  "title": "Politique de confidentialité",
  "slug": "politique-confidentialite",
  "content": "<h1>Politique de confidentialité</h1>...",
  "is_published": true,
  "in_menu": true,
  "meta_title": "Politique de confidentialité",
  "meta_description": "Notre politique de confidentialité..."
}
```
**Response (201):**
```json
{
  "id": "page_002",
  "title": "Politique de confidentialité",
  "slug": "politique-confidentialite",
  "created_at": "2025-12-05T18:00:00Z"
}
```

### 6.8 Publier/Dépublier le site
```
POST /api/v1/website/publish/
Authorization: Bearer {access_token}
```
**Request Body:**
```json
{
  "action": "publish"  // "publish" ou "unpublish"
}
```
**Response (200):**
```json
{
  "is_published": true,
  "published_at": "2025-12-05T18:00:00Z",
  "message": "Site publié avec succès"
}
```

### 6.9 Prévisualisation du site
```
GET /api/v1/website/preview/
Authorization: Bearer {access_token}
```
**Response (200):**
```json
{
  "preview_url": "https://preview.mairie-paris1.fr?token=temp_preview_token",
  "expires_at": "2025-12-05T19:00:00Z"
}
```

---

## ⚙️ 7. PARAMÈTRES

### 7.1 Paramètres généraux
```
GET /api/v1/settings/
Authorization: Bearer {access_token}
```
**Response (200):**
```json
{
  "municipality": {
    "id": 1,
    "name": "Mairie de Paris 1er",
    "code": "75001",
    "address": "1 Place du Louvre, 75001 Paris",
    "phone": "+33 1 23 45 67 89",
    "email": "contact@mairie-paris1.fr",
    "logo_url": "/media/settings/logo.png"
  },
  "notifications": {
    "email_new_message": true,
    "email_new_comment": true,
    "email_event_reminder": true,
    "push_enabled": false,
    "digest_frequency": "daily"  // "realtime", "daily", "weekly", "never"
  },
  "security": {
    "two_factor_enabled": false,
    "session_timeout": 3600,
    "allowed_ips": []
  },
  "display": {
    "language": "fr",
    "timezone": "Europe/Paris",
    "date_format": "DD/MM/YYYY",
    "time_format": "24h"
  },
  "integrations": {
    "google_analytics_id": "UA-XXXXXXXX-X",
    "facebook_pixel_id": null,
    "mailchimp_api_key": null
  }
}
```

### 7.2 Mettre à jour les paramètres
```
PUT /api/v1/settings/
Authorization: Bearer {access_token}
```
**Request Body:**
```json
{
  "notifications": {
    "email_new_message": true,
    "digest_frequency": "weekly"
  },
  "display": {
    "timezone": "Europe/Paris"
  }
}
```
**Response (200):**
```json
{
  "message": "Paramètres mis à jour",
  "updated_at": "2025-12-05T18:00:00Z"
}
```

### 7.3 Changer le mot de passe
```
PUT /api/v1/settings/password/
Authorization: Bearer {access_token}
```
**Request Body:**
```json
{
  "current_password": "oldPassword123",
  "new_password": "newSecurePassword456",
  "new_password_confirm": "newSecurePassword456"
}
```
**Response (200):**
```json
{
  "message": "Mot de passe modifié avec succès"
}
```

### 7.4 Activer 2FA
```
POST /api/v1/settings/2fa/enable/
Authorization: Bearer {access_token}
```
**Response (200):**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_code_url": "data:image/png;base64,...",
  "backup_codes": ["12345678", "87654321", "..."]
}
```

### 7.5 Confirmer 2FA
```
POST /api/v1/settings/2fa/confirm/
Authorization: Bearer {access_token}
```
**Request Body:**
```json
{
  "code": "123456"
}
```
**Response (200):**
```json
{
  "two_factor_enabled": true,
  "message": "Authentification à deux facteurs activée"
}
```

---

## 📤 8. UPLOAD DE FICHIERS (Médias)

### 8.1 Upload d'image
```
POST /api/v1/media/upload/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```
**Request Body:**
```
file: [image file]
type: image
folder: publications  // "publications", "events", "website", "avatars"
```
**Response (201):**
```json
{
  "id": "media_001",
  "url": "/media/publications/image_001.jpg",
  "thumbnail_url": "/media/publications/thumb_image_001.jpg",
  "filename": "image_001.jpg",
  "original_filename": "photo_parc.jpg",
  "mime_type": "image/jpeg",
  "size": 245678,
  "width": 1920,
  "height": 1080,
  "created_at": "2025-12-05T18:00:00Z"
}
```

### 8.2 Liste des médias
```
GET /api/v1/media/
Authorization: Bearer {access_token}
Query Params: ?type=image|document|video&folder=publications&search=query&page=1
```
**Response (200):**
```json
{
  "count": 234,
  "results": [
    {
      "id": "media_001",
      "url": "/media/publications/image_001.jpg",
      "thumbnail_url": "/media/publications/thumb_image_001.jpg",
      "filename": "image_001.jpg",
      "type": "image",
      "folder": "publications",
      "size": 245678,
      "created_at": "2025-12-05T18:00:00Z"
    }
  ]
}
```

### 8.3 Supprimer un média
```
DELETE /api/v1/media/{media_id}/
Authorization: Bearer {access_token}
```
**Response (204):** No Content

---

## 🔔 9. NOTIFICATIONS

### 9.1 Liste des notifications
```
GET /api/v1/notifications/
Authorization: Bearer {access_token}
Query Params: ?is_read=true|false&page=1
```
**Response (200):**
```json
{
  "count": 45,
  "unread_count": 12,
  "results": [
    {
      "id": "notif_001",
      "type": "new_message",
      "title": "Nouveau message",
      "message": "Marie Martin vous a envoyé un message",
      "data": {
        "conversation_id": "conv_001"
      },
      "is_read": false,
      "created_at": "2025-12-05T17:30:00Z"
    },
    {
      "id": "notif_002",
      "type": "event_reminder",
      "title": "Rappel événement",
      "message": "Conseil Municipal dans 1 heure",
      "data": {
        "event_id": "evt_001"
      },
      "is_read": true,
      "created_at": "2025-12-05T17:00:00Z"
    }
  ]
}
```

### 9.2 Marquer comme lu
```
PUT /api/v1/notifications/{notification_id}/read/
Authorization: Bearer {access_token}
```
**Response (200):**
```json
{
  "is_read": true
}
```

### 9.3 Marquer tout comme lu
```
PUT /api/v1/notifications/read-all/
Authorization: Bearer {access_token}
```
**Response (200):**
```json
{
  "message": "Toutes les notifications marquées comme lues",
  "updated_count": 12
}
```

---

## 🔍 10. RECHERCHE GLOBALE

### 10.1 Recherche
```
GET /api/v1/search/
Authorization: Bearer {access_token}
Query Params: ?q=recherche&type=all|publications|events|messages&page=1
```
**Response (200):**
```json
{
  "query": "parc municipal",
  "total_count": 15,
  "results": {
    "publications": [
      {
        "id": "pub_001",
        "type": "post",
        "title": "Inauguration du nouveau parc municipal",
        "excerpt": "...le nouveau parc municipal sera inauguré...",
        "highlight": "...le nouveau <mark>parc municipal</mark> sera inauguré...",
        "created_at": "2025-12-05T10:00:00Z"
      }
    ],
    "events": [
      {
        "id": "evt_010",
        "title": "Inauguration parc municipal",
        "start_datetime": "2025-12-20T10:00:00Z"
      }
    ],
    "messages": []
  }
}
```

---

## 📊 11. EXPORT DE DONNÉES

### 11.1 Exporter les publications
```
GET /api/v1/export/publications/
Authorization: Bearer {access_token}
Query Params: ?format=csv|xlsx|pdf&start_date=2025-01-01&end_date=2025-12-31
```
**Response (200):**
```json
{
  "download_url": "/api/v1/export/download/export_publications_20251205.xlsx",
  "expires_at": "2025-12-05T19:00:00Z"
}
```

### 11.2 Exporter les statistiques
```
GET /api/v1/export/stats/
Authorization: Bearer {access_token}
Query Params: ?format=pdf&period=month
```
**Response (200):**
```json
{
  "download_url": "/api/v1/export/download/stats_december_2025.pdf",
  "expires_at": "2025-12-05T19:00:00Z"
}
```

---

## 🛡️ CODES D'ERREUR STANDARDS

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 204 | Supprimé (pas de contenu) |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès refusé |
| 404 | Ressource non trouvée |
| 409 | Conflit (doublon) |
| 422 | Erreur de validation |
| 429 | Trop de requêtes |
| 500 | Erreur serveur |

### Format d'erreur standard :
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies sont invalides",
    "details": {
      "email": ["Ce champ est requis"],
      "password": ["Le mot de passe doit contenir au moins 8 caractères"]
    }
  }
}
```

---

## 🔑 AUTHENTIFICATION

Toutes les requêtes (sauf login/register) doivent inclure le header :
```
Authorization: Bearer {access_token}
```

Le token expire après 1 heure. Utilisez le refresh_token pour en obtenir un nouveau.

---

## 📋 RÉSUMÉ DES ENDPOINTS

| Module | Endpoints | Méthodes |
|--------|-----------|----------|
| Auth | 10 | POST, GET, PUT |
| Dashboard | 3 | GET |
| Publications | 8 | GET, POST, PUT, DELETE |
| Events | 7 | GET, POST, PUT, DELETE |
| Messages | 5 | GET, POST, PUT, DELETE |
| Website | 9 | GET, POST, PUT |
| Settings | 5 | GET, PUT, POST |
| Media | 3 | GET, POST, DELETE |
| Notifications | 3 | GET, PUT |
| Search | 1 | GET |
| Export | 2 | GET |

**Total : ~56 endpoints**
