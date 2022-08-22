const sqliteConnection = require('../../sqlite')
const createUsers = require('./createUsers')

async function migrationsDatabase() {
  // Inicializando a tabela createUsers
  const schemas = [createUsers].join('')

  // Realizando a conexão com o banco de dados através de um callback
  sqliteConnection()
    // Executando e armazenando a tabela createUsers através de variável constante schemas
    .then(database => database.exec(schemas))
    .catch(error => console.log(error))
}

module.exports = migrationsDatabase
