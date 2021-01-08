const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
//const logger = require('../utils/logger')
const MIN_USERNAME_LEN = 3
const MIN_PASSWORD_LEN = 3

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { title: 1, url: 1, likes: 1 })
  
  //response.json(users)
  response.json(users.map(x => x.toJSON()))
})

usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id)
  response.json(user.toJSON())
})

usersRouter.post('/', async (request, response) => {
  const body = request.body

  if(body.username.length <= MIN_USERNAME_LEN) {
    return response.status(400).json({ error: 'too short username' })
  }

  if(body.password.length <= MIN_PASSWORD_LEN) {
    return response.status(400).json({ error: 'too short password' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash: passwordHash,
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser.toJSON())
})

module.exports = usersRouter
