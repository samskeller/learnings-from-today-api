const bodyParser = require('body-parser')
const express = require('express')
const expressSession = require('express-session')
const expressMySQLStore = require('express-mysql-session')(expressSession)
const helmet = require('helmet')
const morgan = require('morgan')
const uuid = require('uuid/v4')

const authRoutes = require('./routes/auth')
const learningsRoutes = require('./routes/learnings')
const passport = require('./passport')

const app = express()
const port = 3000

app.use(helmet())

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
  host: process.env.DB_HOSTNAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: false,
  createDatabaseTable: true
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

const ensureLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

// Register the auth routes
app.use(authRoutes)

// Register the learnings routes
app.use('/learnings', ensureLoggedIn, learningsRoutes)

app.listen(port, () => console.log(`Example app listening on port ${port}`))
