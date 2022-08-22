const sqlite3 = require('sqlite3')
const sqlite = require('sqlite')
const path = require('path')

// Função responsável por inicializar o banco de dados, conforme o caminho e driver informados.
async function sqliteConnection(){
  const database = await sqlite.open({
    // Informando caminho cujo o arquivo do banco de dados será alocado.
    filename: path.resolve(__dirname, '..', 'database.db'),
    // Informando cujo driver iremos utilizar como base para o nosso banco de dados.
    driver: sqlite3.Database
  })
  return database
}

module.exports = sqliteConnection