const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const AppError = require('../../core/errors/AppError');
const { jwtSecret } = require('../../config/env');

const JWT_EXPIRES_IN = '7d';

const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Credenciales inválidas', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Credenciales inválidas', 401);

  const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: JWT_EXPIRES_IN });
  const { password: _, ...userData } = user.toObject();
  return { user: userData, token };
};

module.exports = { login };
