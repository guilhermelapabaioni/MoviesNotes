const sqliteConnection = require('../database/sqlite')
const AppError = require('../utils/AppError')
const { hash, compare } = require('bcryptjs')

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
      ;('')
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

  async update(request, response) {
    const { id } = request.params
    const { name, email, oldPassword, newPassword } = request.body

    const database = await sqliteConnection()

    // Buscando as informações do usuário cujo o ID informado.
    const user = await database.get('SELECT * FROM users WHERE id = (?)', [id])

    // Validando se o usuário está cadastrado no banco de dados.
    if (!user) {
      throw new AppError('User not registred.')
    }

    // Buscando as informações do usuário cujo o Email informado.
    const userCheckUpdateEmail = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email]
    )

    // Validando se o e-mail informado está cadastrado no banco de dados.
    if (userCheckUpdateEmail) {
      // Validando se o e-mail informado está sendo utilizado por outro usuário.
      if (userCheckUpdateEmail.id !== user.id) {
        throw new AppError('This e-mail already used for other user.')
      }
      throw new AppError('This e-mail already used for you.')
    }

    // Validando se a senha antiga foi inserida.
    if (!oldPassword && newPassword) {
      throw new AppError('You need inform your old password.')
      // Validando se a nova senha foi inserida.
    } else if (oldPassword && !newPassword) {
      throw new AppError('You need inform your new password.')
    }

    // Validando se a senha antiga informada corresponde a senha cadastrada no banco de dados.
    if (oldPassword && newPassword) {
      const checkPassword = await compare(oldPassword, user.password)
      if (!checkPassword) {
        throw new AppError('Your old password is incorrect.')
      }
      if (newPassword.length < 8) {
        throw new AppError(
          'Your password needs 8 or more characters, one number and one special character.'
        )
        // Validando se a senha informada para cadastro possui os parâmetros necessários informados pelo regex.
      } else if (!regex.exec(newPassword)) {
        throw new AppError(
          'Your password needs 8 or more characters, one number and one special character.'
        )
      }
      user.password = await hash(newPassword, 12)
    }

    user.name = name ?? user.name
    user.email = email ?? user.email

    await database.run(
      `UPDATE users SET name = ?, email = ?, password = ?, updated_at = DATETIME('now') WHERE id = ?`,
      [user.name, user.email, user.password, id]
    )

    return response.json()
  }

  async show(request, response) {
    const { id } = request.params

    const database = await sqliteConnection()

    const user = await database.get(
      'SELECT id, name, email FROM users WHERE id = (?)',
      [id]
    )

    return response.json(user)
  }

  async index(request, response) {
    const { name, email } = request.query

    const database = await sqliteConnection()

    const user = await database.get(
      'SELECT id, name, email FROM users WHERE name = (?) OR email = (?)',
      [name, email]
    )

    return response.json(user)
  }

  async delete(request, response) {
    const {id} = request.params

    const database = await sqliteConnection()

    const user = await database.run('DELETE FROM users WHERE id = (?)', [id])

    return response.json(user)
  }
}

module.exports = UsersController
