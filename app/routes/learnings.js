const { celebrate } = require('celebrate')
const express = require('express')
const uuid = require('uuid/v4')

const Knex = require('../knex')
const Learning = require('../models/learning')

const LearningsRouter = express.Router()

LearningsRouter.post('/', celebrate({ body: Learning }), async (req, res, next) => {
  // user is already logged in, data is validated

  const learning = {
    id: uuid(),
    user_id: req.user.id,
    learning: req.body.learning,
    learning_date: req.body.date
  }

  try {
    createdLearning = await Knex
      .insert(learning)
      .into('learnings')
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('Duplicate learning entry already exists', err)
      return res.status(422).send({
        error: {
          status: 422,
          message: 'Duplicate entry exists'
        }
      })
    }
    console.log('Error inserting learning', err)
    return res.status(500).send('Error inserting learning')
  }

  res.status(201).send('Stored the learning')
})

module.exports = LearningsRouter
