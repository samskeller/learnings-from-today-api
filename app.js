const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const uuid = require('uuid/v4')

const learningsRoutes = require('./routes/learnings')

const app = express()
const port = 3000

app.use(helmet())

// Add a request ID to the log output
morgan.token('request-id', req => {
  return uuid()
})

// Setup the logger
app.use(morgan(':request-id :remote-addr :remote-user [:date[clf]] :method :url HTTP/:http-version :status :res[content-length] - :response-time ms'))

// Register the learnings routes
app.use('/learnings', learningsRoutes)

app.listen(port, () => console.log(`Example app listening on port ${port}`))
