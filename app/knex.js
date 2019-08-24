const knexfile = require('../knexfile')

const Knex = require('knex')(knexfile[process.env.NODE_ENV])

module.exports = Knex
