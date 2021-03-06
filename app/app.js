const bodyParser = require('body-parser')
const { errors } = require('celebrate')
const cors = require('cors')
const express = require('express')
const expressSession = require('express-session')
const expressMySQLStore = require('express-mysql-session')(expressSession)
const helmet = require('helmet')
const morgan = require('morgan')
const uuid = require('uuid/v4')

const authRoutes = require('./routes/auth')
const knexfile = require('../knexfile')
const learningsRoutes = require('./routes/learnings')
const passport = require('./passport')

require('dotenv').config()

const app = express()
const port = 3000

app.use(helmet())

app.use(cors({credentials: true, origin: true}));

// Add a request ID to the log output
morgan.token('request-id', req => {
  return uuid()
})

// Setup the logger
app.use(morgan(':request-id :remote-addr :remote-user [:date[clf]] :method :url HTTP/:http-version :status :res[content-length] - :response-time ms'))

app.use(bodyParser.json({
  limit: '100kb'
}))
app.use(bodyParser.urlencoded({
  extended: true
}))

// Setup session management
const sessionStore = new expressMySQLStore({
  clearExpired: false,
  createDatabaseTable: true,
  ...knexfile[process.env.NODE_ENV]['connection']
})

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {}
}

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sessionConfig.cookie.secure = true // serve secure cookies
}

app.use(expressSession(sessionConfig))

app.use(passport.initialize())
app.use(passport.session())

// Register the auth routes
app.use(authRoutes)

// Register the learnings routes
app.use('/learnings', learningsRoutes)

// Register celebrate's error handling
app.use(errors())

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`Example app listening on port ${port}`))
}

module.exports = app
