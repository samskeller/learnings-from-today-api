
exports.up = function(knex) {
  return knex.schema
    .createTable('users', t => {
      t.uuid('id').primary()
      t.string('username').notNullable()
      t.string('password').notNullable()
      t.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    })
    .createTable('learnings', t => {
      t.uuid('id').primary()
      t.uuid('user_id').notNullable()
      t.string('learning', 280).notNullable()
      t.date('learning_date').notNullable()
      t.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
      t.foreign('user_id').references('users.id')
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('learnings')
    .dropTable('users')
};
