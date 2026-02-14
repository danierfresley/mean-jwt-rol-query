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
