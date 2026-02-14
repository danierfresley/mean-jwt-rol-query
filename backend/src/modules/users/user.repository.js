const User = require('./user.model');

const findAll = (options = {}) => {
  const { skip = 0, limit = 10 } = options;
  return User.find().skip(skip).limit(limit).select('-password').lean();
};

const findById = (id) => User.findById(id).select('-password').lean();

const findByEmail = (email, withPassword = false) => {
  return withPassword ? User.findOne({ email }).select('+password') : User.findOne({ email }).lean();
};

const create = async (data) => {
  const user = await User.create(data);
  return User.findById(user._id).select('-password').lean();
};

const count = () => User.countDocuments();

module.exports = { findAll, findById, findByEmail, create, count };
