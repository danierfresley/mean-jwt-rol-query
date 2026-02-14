# Documento MID – MEAN-JWT

**Modelo de Implementación y Diseño**

| Campo | Valor |
|-------|-------|
| Proyecto | MEAN-JWT |
| Versión | 1.0.0 |
| Autor | Danier Vanegas |
| Fecha | Enero 2026 |

---

## 1. Descripción General

Aplicación MEAN (MongoDB, Express, Angular, Node.js) con autenticación basada en JWT para gestión de usuarios.

### 1.1 Objetivos

- Proveer API REST para registro y autenticación de usuarios
- Gestionar sesiones mediante tokens JWT
- Mantener una arquitectura modular y escalable

### 1.2 Alcance

- Backend: API REST con Node.js y Express
- Frontend: SPA con Angular (en desarrollo)
- Base de datos: MongoDB con Mongoose

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Runtime | Node.js | - |
| Framework | Express | ^5.2.1 |
| Base de datos | MongoDB + Mongoose | ^9.1.5 |
| Autenticación | JWT (jsonwebtoken) | ^9.0.2 |
| Validación | Joi | ^17.13.3 |
| Hashing | bcryptjs | ^2.4.3 |
| Frontend | Angular | ^21.1.0 |

---

## 3. Arquitectura

### 3.1 Diagrama de capas

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTE (Angular)                   │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    EXPRESS (app.js)                      │
│  CORS │ JSON Parser │ Rutas │ Error Middleware           │
└─────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   Módulo Users          │     │   Módulo Auth           │
│   Controller → Service  │     │   Controller → Service  │
│   → Repository → Model  │     │   → User Model          │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────┐
│                     MongoDB                             │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de petición

```
Request → Middlewares (CORS, JSON) → Router → Controller → Service → Repository → Model
                                                                    ↓
Response ← JSON ← Controller ← Service ← Repository ← MongoDB
```

---

## 4. Estructura del Proyecto

```
backend/
├── src/
│   ├── app.js                 # Configuración Express y rutas
│   ├── server.js              # Punto de entrada (DB + servidor)
│   ├── config/
│   │   ├── db.js              # Conexión MongoDB
│   │   └── env.js             # Variables de entorno
│   ├── core/
│   │   ├── errors/
│   │   │   ├── AppError.js    # Clase de error personalizada
│   │   │   └── error.middleware.js  # Manejo centralizado
│   │   └── utils/
│   │       ├── logger.js      # Logging
│   │       └── response.js    # Helpers de respuesta
│   ├── modules/
│   │   ├── users/
│   │   │   ├── user.model.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.repository.js
│   │   │   ├── user.routes.js
│   │   │   └── user.validators.js
│   │   └── auth/
│   │       ├── auth.controller.js
│   │       ├── auth.service.js
│   │       └── auth.routes.js
│   └── shared/
│       ├── middlewares/
│       │   ├── auth.middleware.js   # Verificación JWT
│       │   └── validate.middleware.js  # Validación Joi
│       └── dtos/
│           └── pagination.dto.js    # Paginación
├── .env
└── package.json
```

---

## 5. Modelos de Datos

### 5.1 User

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| name | String | Sí | Nombre del usuario |
| email | String | Sí (único) | Correo electrónico |
| password | String | Sí | Contraseña hasheada (bcrypt) |
| createdAt | Date | Auto | Fecha de creación |
| updatedAt | Date | Auto | Fecha de actualización |

**Colección MongoDB:** `users`

---

## 6. API REST

### 6.1 Base URL

```
http://localhost:3000/api
```

### 6.2 Autenticación

Las rutas protegidas requieren header:

```
Authorization: Bearer <token>
```

### 6.3 Endpoints

#### Users

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /users | JWT | Lista usuarios (paginado) |
| POST | /users | No | Registro de usuario |

**Query params (GET /users):**
- `page` (number): Página (default: 1)
- `limit` (number): Items por página (default: 10, max: 100)

#### Auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /auth/login | No | Inicio de sesión |

### 6.4 Formato de respuestas

**Éxito:**
```json
{
  "ok": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "ok": false,
  "message": "Descripción del error"
}
```

### 6.5 Ejemplos de peticiones

**Registro (POST /api/users):**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "miClave123"
}
```

**Login (POST /api/auth/login):**
```json
{
  "email": "juan@example.com",
  "password": "miClave123"
}
```

**Respuesta login:**
```json
{
  "ok": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 7. Flujo de Autenticación

```
1. Usuario envía POST /api/users (registro)
   → Se hashea password con bcrypt
   → Se guarda en MongoDB
   → Respuesta: datos del usuario (sin password)

2. Usuario envía POST /api/auth/login
   → Se busca usuario por email
   → Se compara password con bcrypt.compare
   → Se genera JWT (payload: { id })
   → Respuesta: { user, token }

3. Cliente guarda token (localStorage/sessionStorage)

4. Peticiones protegidas incluyen: Authorization: Bearer <token>
   → auth.middleware verifica JWT
   → req.user = { id } (decodificado)
   → Continúa la petición
```

---

## 8. Configuración

### 8.1 Variables de entorno (.env)

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| MONGODB_URI | Sí | - | URI de conexión MongoDB |
| PORT | No | 3000 | Puerto del servidor |
| JWT_SECRET | No | change-me-in-production | Clave para firmar JWT |
| NODE_ENV | No | development | Entorno de ejecución |

### 8.2 Scripts

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia servidor (producción) |
| `npm run dev` | Inicia con nodemon (desarrollo) |

---

## 9. Códigos de error HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validación, datos inválidos) |
| 401 | Unauthorized (token faltante/inválido) |
| 500 | Internal Server Error |

---

## 10. Seguridad

- Passwords hasheados con bcrypt (10 rounds)
- JWT con expiración configurable (7 días por defecto)
- Campo `password` excluido en respuestas (`select: false`)
- Validación de entrada con Joi
- CORS habilitado

---

## 11. Dependencias principales

```json
{
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.6",
  "dotenv": "^16.4.5",
  "express": "^5.2.1",
  "joi": "^17.13.3",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^9.1.5"
}
```

---

## 12. Referencias

- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [Joi](https://joi.dev/)
