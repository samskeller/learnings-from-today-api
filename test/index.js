const knex = require('../app/knex')

before(async () => {
  await knex.migrate.rollback()

  return await knex.migrate.latest()
})
