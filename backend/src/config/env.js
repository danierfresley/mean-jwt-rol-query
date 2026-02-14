require('dotenv').config();

const required = ['MONGODB_URI'];
const optional = { PORT: 3000, JWT_SECRET: 'change-me-in-production', NODE_ENV: 'development' };

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
