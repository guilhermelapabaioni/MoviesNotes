require('express-async-errors')
const AppError = require('./utils/AppError')

const migrationsDatabase = require('./database/sqlite/migrations')
const express = require('express')
const routes = require('./routes')

migrationsDatabase()

const app = express()
app.use(express.json())
app.use(routes)

app.use((error, request, response, next) => {
  // Se o erro em questão estiver instânciado pelo AppError:
  if (error instanceof AppError) {
    // Retornará um status com o statusCode informado na classe + a mensagem instânciada.
    return response.status(error.statusCode).json({
      status: 'Error',
      message: error.message
    })
  }
})

const PORT = 3333
app.listen(PORT, () => {
  console.log(`APP running in port ${PORT}`)
})
