const Joi = require('joi');

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const parsePagination = (query) => {
  const { value } = paginationSchema.validate(query);
  const skip = (value.page - 1) * value.limit;
  return { page: value.page, limit: value.limit, skip };
};

module.exports = { paginationSchema, parsePagination };
