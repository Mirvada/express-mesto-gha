const router = require('express').Router();
const {
  getUsers,
  getUserById,
  getUser,
  updateUser,
  updateUserAvatar,
} = require('../controllers/users');
const { validateUpdateUser, validateUpdateUserAvatar, validateUserId } = require('../middlewares/validation');

router.get('/', getUsers);
router.get('/me', getUser);
router.get('/:userId', validateUserId, getUserById);
router.patch('/me', validateUpdateUser, updateUser);
router.patch('/me/avatar', validateUpdateUserAvatar, updateUserAvatar);

module.exports = router;
