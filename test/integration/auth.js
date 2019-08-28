const assert = require('chai').assert
const bcrypt = require('bcrypt')
const Promise = require('bluebird')
const request = require('supertest')
const uuid = require('uuid/v4')

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

  describe('/login', () => {
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
  })
})
