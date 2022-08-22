const sqliteConnection = require('../database/sqlite')
const AppError = require('../utils/AppError')
const {hash} = require('bcryptjs')

const regex =
  /^(?=(?:.*?[A-Z]){1})(?=(?:.*?[0-9]){1})(?=(?:.*?[!@#$%*()_+^&}{:;?.]){1})(?!.*\s)[0-9a-zA-Z!@#$%;*(){}_+^&]*$/

class UsersController {
  async create(request, response) {
    // Coletando os parâmetros através do corpo.
    const { name, email, password } = request.body

    // Realizando a conexão com o banco de dados.
    const database = await sqliteConnection()

    // Validando se nenhum campo essencial está vazio.
    if (!name || !email || !password) {
      throw new AppError('You need inform your name, email and password.')
    }

    // Buscando na tabela users se o email informado no corpo.
    const checkIfUserExists = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email]
    )

    // Validando se o email informado no corpo já foi registrado anteriormente.
    if (checkIfUserExists) {
      throw new AppError('E-mail already registered.')
    }

    if (!email.includes('@')) {
      throw new AppError('Invalid e-mail.')
    }

    if (password.length < 8) {
      throw new AppError('Your password need 8 characters or more.')
    } else if (!regex.exec(password)) {
      throw new AppError(
        'Your password need one special character and one number.'
      )
    }

    const cryptPassword = await hash(password, 12)

    await database.run(
      'INSERT INTO users (name, email, password) VALUES (?,?,?)',
      [name, email, cryptPassword]
    )

    return response.json()
  }
}

module.exports = UsersController
