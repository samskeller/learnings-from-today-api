const { celebrate } = require('celebrate')
const express = require('express')
const uuid = require('uuid/v4')

const Knex = require('../knex')
const Learning = require('../models/learning')

const LearningsRouter = express.Router()

const ensureLoggedIn = (req, res, next) => {
  console.log(req.headers)
  if (req.isAuthenticated()) {
    return next()
  }
  res.status(401).send()
}

LearningsRouter.options('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
  res.send(200)
})

LearningsRouter.post('/', ensureLoggedIn, celebrate({ body: Learning }), async (req, res, next) => {
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

LearningsRouter.get('/', ensureLoggedIn, async (req, res, next) => {

  let page = 1
  if (req.query.page) {
    page = parseInt(req.query.page)
  }

  const learnings = await Knex
    .select('*')
    .from('learnings')
    .where({user_id: req.user.id})
    .orderBy('learning_date', 'desc')
    .offset((page - 1) * 10)
    .limit(10)

  res.status(200)
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(learnings, null, 2))
})

module.exports = LearningsRouter
