const router = require('express').Router();
const ctrl = require('./auth.controller');
const validate = require('../../shared/middlewares/validate.middleware');
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/login', validate(loginSchema), ctrl.login);

module.exports = router;
