const assert = require('chai').assert
const bcrypt = require('bcrypt')
const Promise = require('bluebird')
const request = require('supertest')

const app = require('../../app/app')
const knex = require('../../app/knex')

const tables = [
  'learnings',
  'users',
  'sessions'
]
describe('Learnings integration tests', () => {
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
