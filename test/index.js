const Promise = require('bluebird')
const chai = require('chai')
const chaiDatetime = require('chai-datetime')

const knex = require('../app/knex')

before(async () => {
  chai.use(chaiDatetime)
  await knex.migrate.rollback()

  await knex.migrate.latest()
})

beforeEach(async () => {
  const tables = [
    'learnings',
    'users',
    'sessions'
  ]

  await knex.raw('SET FOREIGN_KEY_CHECKS = 0;')
  await Promise.each(tables, table => {
    return knex.raw(`TRUNCATE TABLE ${table};`)
  })
  return knex.raw('SET FOREIGN_KEY_CHECKS = 1;')
})
