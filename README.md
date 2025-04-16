# 🧾 Documentation des microservices de l'application Shopping-App

## 📦 Architecture Générale

L'application est divisée en 6 microservices communiquant entre eux, avec une base MongoDB partagée sur des bases différentes par service.

### 🔗 Schéma logique (simplifié)

```
 Utilisateur (via frontend ou Postman)
        |
        v
   [ user-service ] ←→ JWT
        |
        v
   [ list-service ] ←→ [ product-service ]
        |                    |
        v                    v
   [ compare-service ]   [ scraper-service ]
        |
        v
     Résultat (meilleur magasin)

 Tous se connectent à :
   [ mongo ]
```

---

## 🧠 Description des microservices

### 1. `user-service` (port 3003)
- Gère l'authentification, les tokens et les utilisateurs

| Endpoint         | Méthode | Authentification | Description                        |
|------------------|---------|------------------|------------------------------------|
| `/users/register` | POST    | ❌               | Inscription d'un utilisateur       |
| `/users/login`    | POST    | ❌               | Connexion, retourne un JWT         |
| `/users/me`       | GET     | ✅               | Infos utilisateur connecté         |

### 2. `product-service` (port 3000)
- Gère les produits disponibles (nom, marque, prix par magasin)

| Endpoint         | Méthode | Authentification | Description                        |
|------------------|---------|------------------|------------------------------------|
| `/products`       | GET     | ❌               | Liste de tous les produits         |
| `/products/:id`   | GET     | ❌               | Détail d’un produit                |
| `/products`       | POST    | ✅ (admin à venir) | Création de produit               |

### 3. `list-service` (port 3001)
- Gère les listes de courses des utilisateurs

| Endpoint         | Méthode | Authentification | Description                                 |
|------------------|---------|------------------|---------------------------------------------|
| `/lists`          | GET     | ✅               | Liste des courses de l’utilisateur          |
| `/lists`          | POST    | ✅               | Crée une nouvelle liste                     |
| `/lists/:id`      | DELETE  | ✅               | Supprime une liste appartenant à l’utilisateur |

### 4. `compare-service` (port 3002)
- Compare les prix de chaque produit d’une liste et indique le magasin le moins cher

| Endpoint         | Méthode | Authentification | Description                               |
|------------------|---------|------------------|-------------------------------------------|
| `/compare`        | POST    | ❌               | Compare une liste de produits             |

### 5. `scraper-service` (port 3004)
- Injecte automatiquement des produits dans le `product-service` depuis une source statique ou dynamique

| Endpoint         | Méthode | Authentification | Description                               |
|------------------|---------|------------------|-------------------------------------------|
| `/scrape`         | GET     | ❌               | Lance le scraping (mock ou réel)          |

### 6. `mongo` (port 27017)
- Conteneur unique, utilisé par tous les services avec des bases différentes :
  - `products`, `lists`, `users`

---

## 🗂️ Accès public / Exposition des services

Pour tester l'application publiquement sans déploiement complet, on peut utiliser :

### 🌍 [Ngrok](https://ngrok.com/)

```bash
ngrok http 3001  # pour exposer le list-service
ngrok http 3000  # pour exposer le product-service
ngrok http 3003  # pour exposer le user-service
```

Il suffit ensuite de remplacer `http://localhost:3001` par l’URL `https://xxxx.ngrok.io` dans Postman ou le frontend.

---

## ✅ À faire ensuite (backend)

- Ajouter des rôles `admin`/`user` dans le user-service
- Restreindre `/products` POST aux admins
- Créer un service `store-service` pour gérer les magasins avec adresse/GPS
- Ajouter un historique utilisateur et favoris
- Implémenter un refresh token (JWT durable)

---

Tu peux maintenant t'appuyer sur cette doc pour :
- 🧪 faire tes tests proprement
- 🖥️ construire un frontend organisé
- 💬 montrer ton travail à des collègues, mentors, ou recruteurs

Et je peux aussi te générer une **carte visuelle (diagramme)** si tu veux une version image 📊

