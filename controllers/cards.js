const mongoose = require('mongoose');

const { ValidationError, CastError } = mongoose.Error;
const Card = require('../models/card');
const BadRequest = require('../utils/errors/BadRequestError');
const NotFound = require('../utils/errors/NotFoundError');
const Forbidden = require('../utils/errors/ForbiddenError');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => next(err));
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequest('Переданы некорректные данные при создании карточки.'));
      } else {
        next(err);
      }
    });
};

const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(new NotFound('Карточка с указанным _id не найдена.'))
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {
        return next(new Forbidden('hooi'));
      }
      return Card.deleteOne(card)
        .then(() => res.status(200).send({ data: card }));
    })
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest('Переданы некорректные данные для удаления карточки.'));
      } else {
        next(err);
      }
    });
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new NotFound('Карточка с указанным _id не найдена.'))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest('Переданы некорректные данные для постановки лайка.'));
      } else {
        next(err);
      }
    });
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new NotFound('Карточка с указанным _id не найдена.'))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest('Переданы некорректные данные для снятии лайка.'));
      } else {
        next(err);
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
