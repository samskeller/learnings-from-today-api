const bcrypt = require('bcrypt')
const passport = require('passport')
const passportStrategy = require('passport-local').Strategy

const Knex = require('./knex')

// Initialize Passport for authentication
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new passportStrategy(
  async (username, password, cb) => {
    let users
    try {
      users = await Knex
        .select('*')
        .from('users')
        .where({
          username
        })
    } catch (err) {
      return cb(err)
    }

    if (users.length === 0) {
      return cb(null, null)
    }

    if (users.length > 1) {
      return cb('Too many users found')
    }

    const user = users[0]

    // Compare provided password with hashed password
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return cb(null, false)
    }

    return cb(null, user)
  }
))

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser(async (id, cb) => {
  let users
  try {
    users = await Knex
      .select('*')
      .from('users')
      .where({
        id
      })
  } catch (err) {
    return cb(err)
  }

  if (users.length === 0) {
    return cb(null, null)
  }

  if (users.length > 1) {
    return cb('Multiple users found')
  }

  return cb(null, users[0])
})

module.exports = passport
