// Update with your config settings.

module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: process.env.DB_HOSTNAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: 'db/migrations'
    }
  },
};
