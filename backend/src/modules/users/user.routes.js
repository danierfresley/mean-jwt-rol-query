const router = require('express').Router();
const ctrl = require('./user.controller');
const validate = require('../../shared/middlewares/validate.middleware');
const { authMiddleware } = require('../../shared/middlewares/auth.middleware');
const { createUserSchema } = require('./user.validators');

router.get('/', authMiddleware, ctrl.getUsers);
router.post('/', validate(createUserSchema), ctrl.createUser);

module.exports = router;
