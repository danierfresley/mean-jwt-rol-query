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
