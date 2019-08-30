const bcrypt = require('bcrypt')
const { celebrate } = require('celebrate')
const express = require('express')
const passport = require('passport')
const uuid = require('uuid/v4')

const Knex = require('../knex')
const User = require('../models/user')

const AuthRouter = express.Router()

AuthRouter.get('/login', (req, res, next) => {
  res.send('Please log in')
})

// passport.authenticate() verifies that the login attempt works
AuthRouter.post('/login', celebrate({ body: User }), passport.authenticate('local'), (req, res, next) => {
  res.send('Logged in!')
})

AuthRouter.get('/logout', (req, res, next) => {
  req.logout()
  res.send('Successfully logged out')
})

AuthRouter.post('/signup', celebrate({ body: User }), async (req, res, next) => {
  let users
  const id = uuid()

  const saltRounds = 12
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)

  const user = {
    id,
    username: req.body.username,
    password: hashedPassword
  }

  // Try inserting the user, looking for an error if the username already exists
  try {
    createdUser = await Knex
      .insert(user)
      .into('users')
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('Duplicate user entry already exists', err)
      return res.status(422).send({
        error: {
          status: 422,
          message: 'Duplicate entry exists'
        }
      })
    }

    console.log('Error inserting user', err)
    return res.status(500).send('Error inserting user')
  }

  // Log the new user in, creating a new session. (sigh, passport uses callbacks)
  return new Promise((resolve, reject) => {
    req.login(user, (err) => {
      if (err) {
        console.log('Couldn\'t log user in: ', err)
        reject(err)
      }
      res.status(201).send('New user created')
      resolve()
    })
  })
})

module.exports = AuthRouter
