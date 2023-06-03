const mongoose = require('mongoose');

const { ValidationError, CastError } = mongoose.Error;
const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch(() => res.status(500).send({ message: 'Ошибка по умолчанию.' }));
};

const createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        res.status(400).send({ message: 'Переданы некорректные данные при создании карточки.' });
      } else {
        res.status(500).send({ message: 'Ошибка по умолчанию.' });
      }
    });
};

const deleteCard = (req, res) => {
  Card.findOneAndDelete(req.param.cardId)
    .orFail(new Error('invalidId'))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err instanceof CastError || err.message === 'invalidId') {
        res.status(404).send({ message: 'Карточка с указанным _id не найдена.' });
      }
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err instanceof CastError || err.message === 'invalidId') {
        res.status(404).send({ message: 'Карточка с указанным _id не найдена.' });
      } else if (err instanceof ValidationError) {
        res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка.' });
      } else {
        res.status(500).send({ message: 'Ошибка по умолчанию.' });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err instanceof CastError || err.message === 'invalidId') {
        res.status(404).send({ message: 'Карточка с указанным _id не найдена.' });
      } else if (err instanceof ValidationError) {
        res.status(400).send({ message: 'Переданы некорректные данные для снятии лайка.' });
      } else {
        res.status(500).send({ message: 'Ошибка по умолчанию.' });
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
