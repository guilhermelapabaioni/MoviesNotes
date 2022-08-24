const { Router } = require('express')
const UsersController = require('../controllers/UsersController')

const usersRoutes = Router()
const usersController = new UsersController()

usersRoutes.post('/', usersController.create)
usersRoutes.put('/:id', usersController.update)
usersRoutes.get('/:id', usersController.show)
usersRoutes.get('/', usersController.index)
usersRoutes.delete('/:id', usersController.delete)

module.exports = usersRoutes
