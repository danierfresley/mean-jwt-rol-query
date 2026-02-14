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
