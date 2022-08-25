const knex = require('../database/knex')
const AppError = require('../utils/AppError')

class NotesController {
  async create(request, response) {
    // Requisão dos parâmetros
    const { user_id } = request.params
    const { title, description, rating, tags } = request.body

    // Validando se o título e a descrição foram preenchidos.
    if (!title || !description) {
      throw new AppError(
        'You need inform a title and description for the note.'
      )
    }
    // Validando se o valor da avaliação está entre 1 e 5.
    if (rating < 0 || rating < 5) {
      throw new AppError('Rating must be between 1 and 5.')
    }

    // Realizando a conexão com o banco de dados notes e inserindo os valores.
    const note_id = await knex('notes').insert({
      title,
      description,
      rating,
      user_id
    })

    // Utilizando a função map para retornar um novo array para cada tag informada.
    const tagsInsert = tags.map(name => {
      return {
        name,
        user_id,
        note_id
      }
    })
    // Realizando a conexão com o banco de dados tags e inserindo os valores retornado pelo map.
    await knex('tags').insert(tagsInsert)

    return response.json()
  }

  async show(request, response) {
    const { id } = request.params

    const note = await knex('notes').where({ id })
    const tag = await knex('tags').where({ note_id: id })

    return response.json({
      ...note,
      tag
    })
  }

  async index(request, response) {
    const { user_id, title, tags } = request.query

    let notes

    if (tags) {
      const filterTags = tags.split(',').map(tag => tag.trim())

      notes = await knex('tags')
        .select([
          'tags.id',
          'tags.name',
          'notes.title',
          'notes.description',
          'notes.rating'
        ])
        .where('notes.user_id', user_id)
        .whereLike('notes.title', `%${title}%`)
        .whereIn('name', filterTags)
        .innerJoin('notes', 'notes.id', 'tags.note_id')
        .orderBy('notes.title')
    } else {
      notes = await knex('notes')
        .where({ user_id })
        .whereLike('title', `%${title}%`)
        .orderBy('notes.title')
    }

    const userTags = await knex('tags').where({ user_id })
    const notesWithTags = notes.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id)

      return {
        ...note,
        tags: noteTags
      }
    })

    return response.json({ notesWithTags })
  }

  async delete(request, response) {
    const { id } = request.params

    const note = await knex('notes').where({ id }).delete()

    return response.json({ note })
  }

  async update(request, response) {
    const { id } = request.params
    const { title, description, rating } = request.body

    const note = await knex('notes').where({ id }).update({
      title,
      description,
      rating,
      updated_at: knex.fn.now()
    })

    return response.json(note)
  }
}

module.exports = NotesController
