# 🧾 Shopping-App Microservices Documentation

## 📦 General Architecture

The application is built with 6 microservices communicating through HTTP and using a shared MongoDB instance (each service has its own database).

### 🔗 Logical Architecture (Simplified)


---

## 🧠 Microservice Overview

### 1. `user-service` (port 3003)
Manages user accounts, authentication (JWT), refresh tokens, roles, favorites, and history.

| Endpoint              | Method | Auth Required | Description                                      |
|-----------------------|--------|---------------|--------------------------------------------------|
| `/users/register`     | POST   | ❌            | Register a new user                              |
| `/users/login`        | POST   | ❌            | Login, returns access & refresh tokens           |
| `/users/refresh`      | POST   | ❌            | Refresh access token using refresh token         |
| `/users/logout`       | POST   | ❌            | Logout, invalidates refresh token                |
| `/users/me`           | GET    | ✅            | Get current logged-in user info                  |
| `/users/favorites`    | POST   | ✅            | Add a product to favorites                       |
| `/users/favorites`    | GET    | ✅            | Get all favorite products                        |
| `/users/favorites/:id`| DELETE | ✅            | Remove a product from favorites                  |

---

### 2. `product-service` (port 3000)
Handles product catalog with name, brand, category, and prices per store.

| Endpoint          | Method | Auth Required | Description                             |
|-------------------|--------|---------------|-----------------------------------------|
| `/products`       | GET    | ❌            | Get all available products              |
| `/products/:id`   | GET    | ❌            | Get a single product by ID              |
| `/products`       | POST   | ✅ (admin)    | Add a new product (admin only)          |

---

### 3. `list-service` (port 3001)
Manages shopping lists for users, including creation, deletion, history, and duplication.

| Endpoint                 | Method | Auth Required | Description                                     |
|--------------------------|--------|---------------|-------------------------------------------------|
| `/lists`                 | GET    | ✅            | Get all user lists                              |
| `/lists`                 | POST   | ✅            | Create a new list                               |
| `/lists/:id`             | DELETE | ✅            | Delete a user’s list                            |
| `/lists/history`         | GET    | ✅            | Get full list history for the user              |
| `/lists/:id/archive`     | PATCH  | ✅            | Archive a list                                  |
| `/lists/:id/duplicate`   | POST   | ✅            | Duplicate an existing list                      |

---

### 4. `compare-service` (port 3002)
Compares the prices of products in a list and suggests the cheapest store.

| Endpoint                  | Method | Auth Required | Description                                          |
|---------------------------|--------|---------------|------------------------------------------------------|
| `/compare`                | POST   | ❌            | Compare total prices for a list of products          |
| `/compare/intelligent` *(coming soon)* | POST | ❌ | Suggest best store per product & highlight savings   |

---

### 5. `scraper-service` (port 3004)
Automatically inserts products into `product-service` using static or dynamic sources.

| Endpoint     | Method | Auth Required | Description                                    |
|--------------|--------|---------------|------------------------------------------------|
| `/scrape`    | GET    | ❌            | Starts scraping (uses internal admin login)    |

---

### 6. `mongo` (port 27017)
Single MongoDB container used by all services. Each microservice uses its own database:
- `users`, `products`, `lists`

---

Let me know if you’d like a `docker-compose.prod.yml` section, a `setup` guide, or how to host it on services like Railway, Fly.io, or Render for free deployment 🚀
