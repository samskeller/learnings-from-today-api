
exports.up = function(knex) {
  return knex.schema.alterTable('learnings', t => {
    t.unique(['user_id', 'learning_date'])
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('learnings', t => {
    // Need to re-add the user_id index before dropping the uniqueness constraint because the index is needed for the foreign key constraint
    t.index('user_id')
    t.dropUnique(['user_id', 'learning_date'])
  })
};
