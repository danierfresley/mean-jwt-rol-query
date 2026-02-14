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
