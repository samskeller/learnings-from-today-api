const { Joi } = require('celebrate')

const Learning = Joi.object().keys({
  learning: Joi.string().max(280).required(),
  date: Joi.date().required()
})

module.exports = Learning
