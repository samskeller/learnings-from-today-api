const { Joi } = require('celebrate')

const User = Joi.object().keys({
  username: Joi.string().email().required(),
  password: Joi.string().max(255).required()
})

module.exports = User
