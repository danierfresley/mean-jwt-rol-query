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
