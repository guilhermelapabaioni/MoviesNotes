const path = require('path')

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.resolve(__dirname, 'src', 'database', 'database.db')
    },

    pool: {
      // Por padrão a função CASCADE no SQLite3 é desabilitada, informamos para o KNEX que está função ativa.
      afterCreate: (connection, callback) =>
        connection.run('PRAGMA foreign_keys = ON', callback)
    },

    migrations: {
      directory: path.resolve(
        __dirname,
        'src',
        'database',
        'knex',
        'migrations'
      )
    },

    useNullAsDefault: true
  }
}
