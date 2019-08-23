const express = require('express')
const passport = require('passport')

const AuthRouter = express.Router()

// Register a login route
AuthRouter.get('/login', (req, res, next) => {
  res.send('Please log in')
})

AuthRouter.post('/login', passport.authenticate('local'), (req, res, next) => {
  res.send('Logged in!')
})

AuthRouter.get('/logout', (req, res, next) => {
  req.logout()
  res.redirect('/login')
})

module.exports = AuthRouter
