const assert = require('chai').assert
const bcrypt = require('bcrypt')
const Promise = require('bluebird')
const request = require('supertest')
const uuid = require('uuid/v4')
const validate = require('uuid-validate')

const app = require('../../app/app')
const knex = require('../../app/knex')

const tables = [
  'learnings',
  'users',
  'sessions'
]

describe('Auth integration tests', () => {

  beforeEach(async () => {
    await knex.raw('SET FOREIGN_KEY_CHECKS = 0;') 
    await Promise.each(tables, table => {
      return knex.raw(`TRUNCATE TABLE ${table};`)
    })
    return knex.raw('SET FOREIGN_KEY_CHECKS = 1;')
  })

  describe('POST /login', () => {
    it('inserts a session in the db when a user logs in', async () => {
      const username = 'test@test.com'
      const password = 'testpassword'
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      const userToInsert = {
        id: uuid(),
        username,
        password: hashedPassword
      }

      await knex('users').insert(userToInsert)

      await request(app)
        .post('/login')
        .send({
          username,
          password
        })
        .expect(200)

      const dbSessions = await knex('users').select('*')

      assert.strictEqual(dbSessions.length, 1)
      assert.strictEqual(dbSessions[0].id, userToInsert.id)
    })

    it('returns a 401 when there\'s no matching user', async () => {
      return request(app)
        .post('/login')
        .send({
          username: 'fake@fake.com',
          password: 'fake'
        })
        .expect(401)
    })

    it('returns a 400 with a validation error when the username is not formatted as an email address', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'notanemail',
          password: 'fake'
        })
        .expect(400)

      assert.strictEqual(response.body.message, 'child \"username\" fails because [\"username\" must be a valid email]')
    })
  })

  describe('POST /signup', () => {
    it('creates a valid new user successfully and hashes the password', async () => {
      const user = {
        username: 'test@test.com',
        password: 'testpassword'
      }

      const response = await request(app)
        .post('/signup')
        .send(user)
        .expect(201)

      const usersInDb = await knex('users').select('*')
      assert.strictEqual(usersInDb.length, 1)
      assert.strictEqual(usersInDb[0].username, user.username)

      const passwordsMatch = await bcrypt.compare(user.password, usersInDb[0].password)
      assert.isTrue(passwordsMatch)

      // assert that user has a valid v4 uuid
      assert.isTrue(validate(usersInDb[0].id, 4))
    })

    it('returns a 400 if the password is missing', async () => {
      const response = await request(app)
        .post('/signup')
        .send({
          username: 'test@test.com'
        })
        .expect(400)

      assert.strictEqual(response.body.message, 'child \"password\" fails because [\"password\" is required]')
    })

    it('returns a 400 if the username is missing', async () => {
      const response = await request(app)
        .post('/signup')
        .send({
          password: 'testpassword'
        })
        .expect(400)

      assert.strictEqual(response.body.message, 'child \"username\" fails because [\"username\" is required]')
    })

    it('returns a 400 if the username is not an email address', async () => {
      const response = await request(app)
        .post('/signup')
        .send({
          username: 'test',
          password: 'testpassword'
        })
        .expect(400)

      assert.strictEqual(response.body.message, 'child \"username\" fails because [\"username\" must be a valid email]')
    })

    it('returns a 422 if the user already exists', async () => {
      const user = {
        username: 'test@test.com',
        password: 'testpassword'
      }

      // create the user first
      await request(app)
        .post('/signup')
        .send(user)
        .expect(201)

      // try to create the user again
      const response = await request(app)
        .post('/signup')
        .send(user)
        .expect(422)

      assert.strictEqual(response.body.error.message, 'Duplicate entry exists')
    })
  })

  describe('POST /learnings', () => {
    let cookies
    beforeEach(async () => {
      // log user in before each test
      const response = await request(app)
        .post('/signup')
        .send({
          username: 'test@test.com',
          password: 'passwordtest'
        })
        .expect(201)

      cookies = response.headers['set-cookie'].pop().split(';')[0];
    })

    it('creates a valid learning successfully', async () => {
      const response = await request(app)
        .post('/learnings')
        .set('Cookie', cookies)
        .send({
          learning: 'I learned something today',
          date: '2019-08-29'
        })
        .expect(201)

      const learningsInDb = await knex('learnings').select('*')
      assert.strictEqual(learningsInDb.length, 1)
      assert.strictEqual(learningsInDb[0].learning, 'I learned something today')
      assert.equalDate(learningsInDb[0].learning_date, new Date('2019-08-29'))

      const usersFromLearning = await knex('users').select('*').where({id: learningsInDb[0].user_id})
      assert.strictEqual(usersFromLearning.length, 1)
      assert.strictEqual(usersFromLearning[0].username, 'test@test.com')
    })

    it('returns a 400 if the learning is missing', async () => {
      const response = await request(app)
        .post('/learnings')
        .set('Cookie', cookies)
        .send({
          date: '2019-08-29'
        })
        .expect(400)

      assert.strictEqual(response.body.message, 'child \"learning\" fails because [\"learning\" is required]')
    })

    it('returns a 400 if the date is missing', async () => {
      const response = await request(app)
        .post('/learnings')
        .set('Cookie', cookies)
        .send({
          learning: 'I learned something today'
        })
        .expect(400)

      assert.strictEqual(response.body.message, 'child \"date\" fails because [\"date\" is required]')
    })

    it('returns a 401 if the user is not logged in', async () => {
      // No cookie set
      const response = await request(app)
        .post('/learnings')
        .send({
          learning: 'I learned something today',
          date: '2019-08-29'
        })
        .expect(401)
    })

    it('returns a 422 if a learning already exists for the date and user', async () => {
      const learningDate = '2019-08-29'
      await request(app)
        .post('/learnings')
        .set('Cookie', cookies)
        .send({
          learning: 'I learned something today',
          date: learningDate
        })
        .expect(201)

      const response = await request(app)
        .post('/learnings')
        .set('Cookie', cookies)
        .send({
          learning: 'Another thing I learned today',
          date: learningDate
        })
        .expect(422)

      assert.strictEqual(response.body.error.message, 'Duplicate entry exists')
    })
  })
})
