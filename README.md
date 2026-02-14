# MEAN-JWT

Aplicación MEAN (MongoDB, Express, Angular, Node.js) con autenticación JWT para gestión de usuarios.

## Inicio rápido

1. **Backend:** `cd backend && npm install` → crea `.env` con `MONGODB_URI`, `PORT`, `JWT_SECRET` (ver [Tutorial](./docs/TUTORIAL.md)) → `npm run dev`
2. **Frontend:** `cd frontend && npm install && npm start`
3. Abre `http://localhost:4200` y regístrate / inicia sesión.

## Documentación

- **[Tutorial completo](./docs/TUTORIAL.md)** – Guía paso a paso para construir el proyecto desde cero o ejecutarlo
- **[Documento MID](./docs/MID.md)** – Modelo de Implementación y Diseño (arquitectura, API, seguridad)

## Estructura

```
MEAN-JWT/
├── backend/     # API REST (Express + MongoDB + JWT)
├── frontend/    # SPA Angular
└── docs/        # Tutorial y documentación
```
