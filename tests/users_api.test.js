const mongoose = require('mongoose')
const supertest = require('supertest')
//const bcrypt = require('bcrypt')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')
const api = supertest(app)
//const logger = require('../utils/logger')

const rootPath = '/api/users'

describe('when there is initially one user at db', () => {
  const defUser = {
    username: 'seppo',
    name: 'Seppo Koiruus',
    password: 'piraatti'
  }
  beforeEach(async () => {
    await User.deleteMany({})

    await helper.addUserToDb(defUser.username, defUser.name, defUser.password)
    //await user.save()
  })

  afterAll(() => {
    mongoose.connection.close()
  })

  test('Get all users', async () => {
    
    const response = await api
      .get(rootPath)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = response.body
    //logger.info('Get all result', usersAtEnd)
    expect(usersAtEnd).toHaveLength(1)
  })

  test('create user succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()
    
    const newUser = {
      username: 'ilaril',
      name: 'Ilari Lyhtypilari',
      password: '12345'
    }

    await api
      .post(rootPath)
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('create user fails with a duplicate username', async () => {
    const usersAtStart = await helper.usersInDb()

    const result = await api
      .post('/api/users')
      .send(defUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('`username` to be unique')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('create user fails with too short username', async () => {
    const usersAtStart = await helper.usersInDb()

    const defUser = {
      username: 'sep',
      name: 'Seppo Koiruus',
      password: 'salasana123'
    }

    const result = await api
      .post('/api/users')
      .send(defUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('too short username')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('create user fails with too short password', async () => {
    const usersAtStart = await helper.usersInDb()

    const defUser = {
      username: 'seppo',
      name: 'Seppo Koiruus',
      password: '123'
    }

    const result = await api
      .post('/api/users')
      .send(defUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('too short password')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})