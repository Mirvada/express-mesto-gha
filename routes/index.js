const router = require('express').Router();
const { login, createUser } = require('../controllers/users');
const auth = require('../middlewares/auth');
const { validateUserRegistration, validateUserLogin } = require('../middlewares/validation');
const NotFoundError = require('../utils/errors/NotFoundError');

router.post('/signin', validateUserLogin, login);
router.post('/signup', validateUserRegistration, createUser);

router.use('/users', auth, require('./users'));
router.use('/cards', auth, require('./cards'));

router.use('*', (req, res, next) => {
  next(new NotFoundError('Указанный путь не найден.'));
});

module.exports = router;
