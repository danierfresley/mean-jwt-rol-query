# Tutorial: Construcción del proyecto MEAN-JWT

**Objetivo:** Guiar a cualquier persona en la construcción completa de una aplicación MEAN (MongoDB, Express, Angular, Node.js) con autenticación JWT para gestión de usuarios.

**Autor:** Danier Vanegas  
**Fecha:** Febrero 2026

---

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Visión general del proyecto](#2-visión-general-del-proyecto)
3. [Parte I: Ejecutar el proyecto existente](#3-parte-i-ejecutar-el-proyecto-existente)
4. [Parte II: Construir el backend desde cero](#4-parte-ii-construir-el-backend-desde-cero)
5. [Parte III: Construir el frontend desde cero](#5-parte-iii-construir-el-frontend-desde-cero)
6. [Flujo de autenticación completo](#6-flujo-de-autenticación-completo)
7. [Solución de problemas](#7-solución-de-problemas)

---

## 1. Requisitos previos

Antes de comenzar, instala:

| Herramienta | Versión mínima | Cómo verificar |
|-------------|----------------|----------------|
| **Node.js** | 18+ | `node -v` |
| **npm** | 9+ | `npm -v` |
| **MongoDB** | 6+ (local o Atlas) | `mongosh --version` o usar MongoDB Atlas |
| **Angular CLI** | 21+ (solo para construir frontend) | `ng version` |

### Instalación de Angular CLI (opcional)

```bash
npm install -g @angular/cli@21
```

### MongoDB

- **Opción A – Local:** Instala [MongoDB Community](https://www.mongodb.com/docs/manual/installation/) y arranca el servicio.
- **Opción B – MongoDB Atlas:** Crea una cuenta gratuita en [mongodb.com/atlas](https://www.mongodb.com/atlas), crea un cluster y obtén la URI de conexión.

---

## 2. Visión general del proyecto

### ¿Qué construiremos?

Una aplicación full-stack con:

- **Backend:** API REST con Node.js y Express para registro e inicio de sesión de usuarios.
- **Frontend:** SPA en Angular con formularios de login, registro y listado de usuarios.
- **Autenticación:** JWT (JSON Web Tokens) para proteger rutas.

### Arquitectura

```
┌─────────────────┐     HTTP/REST      ┌─────────────────┐     Mongoose      ┌─────────────────┐
│   Angular SPA   │ ◄────────────────► │  Express API    │ ◄────────────────► │    MongoDB      │
│   (Puerto 4200) │   + JWT en header  │  (Puerto 3000)  │                    │                 │
└─────────────────┘                    └─────────────────┘                    └─────────────────┘
```

### Estructura de carpetas

```
MEAN-JWT/
├── backend/          # API Node.js + Express
│   ├── src/
│   │   ├── server.js
│   │   ├── app.js
│   │   ├── config/
│   │   ├── core/
│   │   ├── modules/
│   │   └── shared/
│   ├── .env
│   └── package.json
├── frontend/         # Angular SPA
│   ├── src/app/
│   │   ├── core/
│   │   ├── features/
│   │   └── ...
│   └── package.json
└── docs/
```

---

## 3. Parte I: Ejecutar el proyecto existente

Si ya tienes el código, sigue estos pasos para ejecutarlo.

### 3.1 Clonar o descargar el proyecto

```bash
# Si usas git
git clone <url-del-repositorio> MEAN-JWT
cd MEAN-JWT
```

### 3.2 Configurar el backend

1. Entra a la carpeta del backend:

   ```bash
   cd backend
   ```

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Crea el archivo `.env` en `backend/` con:

   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/mean-jwt
   JWT_SECRET=mi-clave-secreta-muy-segura
   NODE_ENV=development
   ```

   > **Nota:** Si usas MongoDB Atlas, reemplaza `MONGODB_URI` por la URI que te proporciona el panel.

4. Inicia el backend en modo desarrollo:

   ```bash
   npm run dev
   ```

   Deberías ver: `API corriendo en puerto 3000` y `MongoDB conectado`.

### 3.3 Configurar el frontend

1. En otra terminal, entra a la carpeta del frontend:

   ```bash
   cd frontend
   ```

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:

   ```bash
   npm start
   ```

4. Abre el navegador en `http://localhost:4200`.

### 3.4 Probar la aplicación

1. Ve a **Registro** y crea un usuario (nombre, email, contraseña).
2. Inicia sesión en **Login** con ese usuario.
3. Accede a **Usuarios** (ruta protegida con JWT).
4. Cierra sesión con el botón **Cerrar sesión**.

---

## 4. Parte II: Construir el backend desde cero

A continuación se explica cómo crear el backend paso a paso.

### 4.1 Crear el proyecto

```bash
mkdir MEAN-JWT
cd MEAN-JWT
mkdir backend
cd backend
npm init -y
```

### 4.2 Instalar dependencias

```bash
npm install express mongoose jsonwebtoken bcryptjs joi cors dotenv
npm install -D nodemon
```

### 4.3 Configurar `package.json`

Añade o modifica en `package.json`:

```json
{
  "type": "commonjs",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### 4.4 Crear la estructura de carpetas

```bash
mkdir -p src/config src/core/errors src/core/utils src/modules/users src/modules/auth src/shared/middlewares src/shared/dtos
```

### 4.5 Archivo `src/config/env.js`

Carga y valida variables de entorno:

```javascript
require('dotenv').config();

const required = ['MONGODB_URI'];
const optional = {
  PORT: 3000,
  JWT_SECRET: 'change-me-in-production',
  NODE_ENV: 'development',
};

for (const key of required) {
  if (!process.env[key]) throw new Error(`Falta variable de entorno: ${key}`);
}

for (const [key, fallback] of Object.entries(optional)) {
  if (!process.env[key]) process.env[key] = String(fallback);
}

module.exports = {
  port: parseInt(process.env.PORT, 10),
  nodeEnv: process.env.NODE_ENV,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
};
```

### 4.6 Archivo `src/config/db.js`

Conexión a MongoDB:

```javascript
const mongoose = require('mongoose');
const { mongoUri } = require('./env');
const logger = require('../core/utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    logger.info('MongoDB conectado');
  } catch (err) {
    logger.error('Error conectando a MongoDB', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 4.7 Archivo `src/core/utils/logger.js`

Logger simple:

```javascript
const log = (level, ...args) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}]`, ...args);
};

module.exports = {
  info: (...args) => log('INFO', ...args),
  error: (...args) => log('ERROR', ...args),
};
```

### 4.8 Archivo `src/core/utils/response.js`

Helpers para respuestas HTTP:

```javascript
const success = (res, data, status = 200) => {
  res.status(status).json({ ok: true, data });
};

const error = (res, message, status = 400) => {
  res.status(status).json({ ok: false, message });
};

module.exports = { success, error };
```

### 4.9 Archivo `src/core/errors/AppError.js`

Error personalizado:

```javascript
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
```

### 4.10 Archivo `src/core/errors/error.middleware.js`

Middleware de manejo de errores:

```javascript
const AppError = require('./AppError');
const logger = require('../core/utils/logger');

const errorMiddleware = (err, req, res, next) => {
  const status = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Error interno del servidor';
  logger.error(message);
  res.status(status).json({ ok: false, message });
};

module.exports = { errorMiddleware };
```

### 4.11 Archivo `src/modules/users/user.model.js`

Modelo de usuario con Mongoose:

```javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
```

### 4.12 Archivo `src/modules/users/user.validators.js`

Validación con Joi:

```javascript
const Joi = require('joi');

const createUserSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

module.exports = { createUserSchema };
```

### 4.13 Archivo `src/shared/dtos/pagination.dto.js`

Paginación:

```javascript
const parsePagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = { parsePagination };
```

### 4.14 Archivo `src/shared/middlewares/validate.middleware.js`

Middleware de validación Joi:

```javascript
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const message = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ ok: false, message });
  }

  req.body = value;
  next();
};

module.exports = validate;
```

### 4.15 Archivo `src/shared/middlewares/auth.middleware.js`

Middleware JWT:

```javascript
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/env');
const AppError = require('../../core/errors/AppError');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Token no proporcionado', 401);
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError('Token inválido o expirado', 401));
  }
};

module.exports = { authMiddleware };
```

### 4.16 Archivo `src/modules/users/user.repository.js`

Capa de acceso a datos:

```javascript
const User = require('./user.model');

const findAll = ({ skip, limit }) =>
  User.find().skip(skip).limit(limit).sort({ createdAt: -1 }).lean();

const count = () => User.countDocuments();

const findByEmail = (email) => User.findOne({ email });

const create = (data) => User.create(data);

module.exports = { findAll, count, findByEmail, create };
```

### 4.17 Archivo `src/modules/users/user.service.js`

Lógica de negocio:

```javascript
const bcrypt = require('bcryptjs');
const repo = require('./user.repository');
const AppError = require('../../core/errors/AppError');
const { parsePagination } = require('../../shared/dtos/pagination.dto');

const getUsers = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const [users, total] = await Promise.all([
    repo.findAll({ skip, limit }),
    repo.count(),
  ]);
  return {
    data: users,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const createUser = async (data) => {
  const exists = await repo.findByEmail(data.email);
  if (exists) throw new AppError('Email ya registrado', 400);

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await repo.create({ ...data, password: hashedPassword });
  return user;
};

module.exports = { getUsers, createUser };
```

### 4.18 Archivo `src/modules/users/user.controller.js`

Controlador de usuarios:

```javascript
const service = require('./user.service');
const { success } = require('../../core/utils/response');

const getUsers = async (req, res, next) => {
  try {
    const result = await service.getUsers(req.query);
    success(res, result);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await service.createUser(req.body);
    success(res, user, 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, createUser };
```

### 4.19 Archivo `src/modules/users/user.routes.js`

Rutas de usuarios:

```javascript
const router = require('express').Router();
const ctrl = require('./user.controller');
const validate = require('../../shared/middlewares/validate.middleware');
const { authMiddleware } = require('../../shared/middlewares/auth.middleware');
const { createUserSchema } = require('./user.validators');

router.get('/', authMiddleware, ctrl.getUsers);
router.post('/', validate(createUserSchema), ctrl.createUser);

module.exports = router;
```

### 4.20 Archivo `src/modules/auth/auth.service.js`

Servicio de autenticación:

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const AppError = require('../../core/errors/AppError');
const { jwtSecret } = require('../../config/env');

const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Credenciales inválidas', 401);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError('Credenciales inválidas', 401);

  const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '7d' });
  user.password = undefined;
  return { user, token };
};

module.exports = { login };
```

### 4.21 Archivo `src/modules/auth/auth.controller.js`

```javascript
const service = require('./auth.service');
const { success } = require('../../core/utils/response');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await service.login(email, password);
    success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { login };
```

### 4.22 Archivo `src/modules/auth/auth.routes.js`

```javascript
const router = require('express').Router();
const ctrl = require('./auth.controller');
const validate = require('../../shared/middlewares/validate.middleware');
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/login', validate(loginSchema), ctrl.login);

module.exports = router;
```

### 4.23 Archivo `src/app.js`

Configuración de Express:

```javascript
require('./config/env');

const express = require('express');
const cors = require('cors');
const { errorMiddleware } = require('./core/errors/error.middleware');
const userRoutes = require('./modules/users/user.routes');
const authRoutes = require('./modules/auth/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.use(errorMiddleware);

module.exports = app;
```

### 4.24 Archivo `src/server.js`

Punto de entrada:

```javascript
const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');
const logger = require('./core/utils/logger');

connectDB().then(() => {
  app.listen(port, () => logger.info(`API corriendo en puerto ${port}`));
});
```

### 4.25 Archivo `.env`

Crea `backend/.env` (no lo subas a git):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mean-jwt
JWT_SECRET=tu-clave-secreta-muy-segura
NODE_ENV=development
```

---

## 5. Parte III: Construir el frontend desde cero

### 5.1 Crear el proyecto Angular

```bash
cd MEAN-JWT
ng new frontend --routing --style=css --ssr=false --skip-tests
cd frontend
```

### 5.2 Estructura de carpetas

Crea estas carpetas dentro de `src/app/`:

```
src/app/
├── core/
│   ├── config/
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   └── services/
└── features/
    ├── auth/
    │   ├── login/
    │   └── register/
    └── users/
        └── users-list/
```

### 5.3 Archivo `src/app/core/config/api.config.ts`

```typescript
export const API_BASE_URL = 'http://localhost:3000/api';
```

### 5.4 Archivo `src/app/core/models/api.types.ts`

```typescript
export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  message?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface UsersPageData {
  data: User[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
```

### 5.5 Servicio `AuthService`

Crea `src/app/core/services/auth.service.ts` con `login()`, `logout()`, `getToken()`, `isLoggedIn()` y guardado del token en `localStorage`, como en el proyecto actual.

### 5.6 Servicio `UserService`

Crea `src/app/core/services/user.service.ts` con `register()` y `getUsers(page, limit)` usando `HttpClient`.

### 5.7 Interceptor JWT

Crea `src/app/core/interceptors/jwt.interceptor.ts` que añada el header `Authorization: Bearer <token>` cuando exista token.

### 5.8 Guard de autenticación

Crea `src/app/core/guards/auth.guard.ts` que redirija a `/login` si el usuario no está autenticado.

### 5.9 Configurar `app.config.ts`

- Añade `provideHttpClient(withInterceptors([jwtInterceptor]))`.

### 5.10 Rutas

En `app.routes.ts`:

- `''` → redirect a `users`
- `login` → LoginComponent
- `register` → RegisterComponent  
- `users` → UsersListComponent con `canActivate: [authGuard]`

### 5.11 Componentes

- **LoginComponent:** Formulario reactivo (email, password), llamada a `AuthService.login()`, redirección a `/users` en éxito.
- **RegisterComponent:** Formulario (name, email, password), llamada a `UserService.register()`, redirección a `/login` en éxito.
- **UsersListComponent:** Tabla de usuarios, paginación, botón cerrar sesión, protegido por `authGuard`.

> Para el código completo de los componentes y plantillas HTML/CSS, consulta los archivos en `frontend/src/app/features/` del proyecto.

---

## 6. Flujo de autenticación completo

```
1. REGISTRO
   Usuario → POST /api/users { name, email, password }
   Backend → Valida con Joi → Hashea password (bcrypt) → Guarda en MongoDB
   Respuesta → { ok: true, data: user }

2. LOGIN
   Usuario → POST /api/auth/login { email, password }
   Backend → Busca usuario → Compara password (bcrypt) → Genera JWT
   Respuesta → { ok: true, data: { user, token } }

3. FRONTEND GUARDA TOKEN
   AuthService guarda token en localStorage

4. PETICIONES PROTEGIDAS
   Cliente → GET /api/users + Header: Authorization: Bearer <token>
   Interceptor añade el header automáticamente
   auth.middleware verifica JWT → Si es válido, continúa
   Respuesta → { ok: true, data: { data: [...users], meta: {...} } }
```

---

## 7. Solución de problemas

### Error: "Falta variable de entorno: MONGODB_URI"

- Verifica que exista el archivo `.env` en `backend/`.
- Comprueba que la variable `MONGODB_URI` esté definida correctamente.

### Error: "Error conectando a MongoDB"

- Asegúrate de que MongoDB esté en ejecución (local o Atlas accesible).
- Revisa la URI (usuario, contraseña, host, puerto).

### CORS o errores de red desde el frontend

- El backend debe tener CORS habilitado (`app.use(cors())`).
- La URL en `api.config.ts` debe apuntar al backend (`http://localhost:3000/api`).

### 401 Unauthorized en GET /api/users

- Verifica que hayas iniciado sesión y que el token se guarde en `localStorage`.
- El interceptor debe enviar `Authorization: Bearer <token>`.
- Comprueba que `JWT_SECRET` sea el mismo en el backend.

### Validación: "name" debe tener al menos 3 caracteres

- El backend exige `name` con mínimo 3 caracteres y `password` con mínimo 6.
- Ajusta las validaciones del frontend para que coincidan.

---

## Referencias

- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [Joi](https://joi.dev/)
- [Angular](https://angular.dev/)
- [Documento MID](./MID.md) – Diseño detallado del proyecto
