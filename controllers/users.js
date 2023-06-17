const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { ValidationError, CastError } = mongoose.Error;
const User = require('../models/user');
const BadRequest = require('../utils/errors/BadRequestError');
const NotFound = require('../utils/errors/NotFoundError');
const Unauthorized = require('../utils/errors/UnauthorizedError');
const Conflict = require('../utils/errors/ConflictError');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => next(err));
};

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new Error('invalidId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};
const getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new Error('invalidId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest('Переданы некорректные данные'));
      } else if (err.message === 'invalidId') {
        next(new NotFound('Пользователь по указанному _id не найден.'));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  return bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then(() => res.status(201).send({
      name, about, avatar, email,
    }))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest('Переданы некорректные данные'));
      } else if (err.code === 11000) {
        next(new Conflict('Пользователь с таким email уже зарегистрирован.'));
      } else {
        next(err);
      }
    });
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(new Error('invalidId'))
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequest('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

const updateUserAvatar = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.body.avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(new Error('invalidId'))
    .then((user) => {
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequest('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'id',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(() => {
      next(new Unauthorized('Неверный email или пароль'));
    });
};

module.exports = {
  getUsers,
  getUserById,
  getUser,
  createUser,
  updateUser,
  updateUserAvatar,
  login,
};
