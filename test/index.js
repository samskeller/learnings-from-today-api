const chai = require('chai')
const chaiDatetime = require('chai-datetime')

const knex = require('../app/knex')

before(async () => {
  chai.use(chaiDatetime)
  await knex.migrate.rollback()

  return await knex.migrate.latest()
})
