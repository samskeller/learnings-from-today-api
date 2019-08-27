const { celebrate } = require('celebrate')
const express = require('express')

const Knex = require('../knex')
const Learning = require('../models/learning')

const LearningsRouter = express.Router()

LearningsRouter.post('/', celebrate({ body: Learning }), (req, res, next) => {
  // store a learning
  res.send('Stored the learning')
})

module.exports = LearningsRouter
