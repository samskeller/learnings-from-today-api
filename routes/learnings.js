const express = require('express')

const LearningsRouter = express.Router()

LearningsRouter.post('/', (req, res, next) => {
  // store the learning
  res.send('Stored the learning')
})

module.exports = LearningsRouter
