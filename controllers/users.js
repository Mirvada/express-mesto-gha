const mongoose = require('mongoose');

const { ValidationError, CastError } = mongoose.Error;
const User = require('../models/user');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch(() => res.status(500).send({ message: 'Ошибка по умолчанию.' }));
};

const getUser = (req, res) => {
  User.findById(req.params.userId)
    .orFail(new Error('invalidId'))
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err instanceof CastError || err.message === 'invalidId') {
        res.status(404).send({ message: 'Пользователь по указанному _id не найден.' });
      } else {
        res.status(500).send({ message: 'Ошибка по умолчанию.' });
      }
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      } else {
        res.status(500).send({ message: 'Ошибка по умолчанию.' });
      }
    });
};

const updateUser = (req, res) => {
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
      if (err instanceof CastError || err.message === 'invalidId') {
        res.status(404).send({ message: 'Пользователь по указанному _id не найден.' });
      } else if (err instanceof ValidationError) {
        res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      } else {
        res.status(500).send({ message: 'Ошибка по умолчанию.' });
      }
    });
};

const updateUserAvatar = (req, res) => {
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
      if (err instanceof CastError || err.message === 'invalidId') {
        res.status(404).send({ message: 'Пользователь по указанному _id не найден.' });
      } else if (err instanceof ValidationError) {
        res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
      } else {
        res.status(500).send({ message: 'Ошибка по умолчанию.' });
      }
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserAvatar,
};
