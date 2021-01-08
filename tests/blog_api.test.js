
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const logger = require('../utils/logger')
const api = supertest(app)
//const logger = require('../utils/logger')

const rootPath = '/api/blogs'



describe('when db emptied and some blogs saved to it', () => {
  let token = ''

  beforeEach(async () => {
    await User.deleteMany({})
   
    const newUser = { username: 'mikko', name: 'Mikko Mallikas', password: 'kuraattori' }
    const user = await helper.addUserToDb(newUser.username, newUser.name, newUser.password)

    const responseLogin = await api
      .post('/api/login')
      .send( { username: newUser.username, password: newUser.password })
    token = responseLogin.body.token
    logger.info('Login initial user, got: ' + responseLogin.status + ' token ' + token)

    await Blog.deleteMany({})

    const blogs = helper.initialBlogs
    blogs.forEach(x => x.users = [user._id])
    await Blog.insertMany(blogs)
    user.blogs = blogs.map(x => x._id)
    await user.save()
  })
  
  afterAll(() => {
    mongoose.connection.close()
  })

  test('Get all from ' + rootPath + ' test for correct length.', async () => {
    const response = await api.get(rootPath)
    const blogs = response.body
    //console.log(blogs)
    expect(blogs.length).toBe(helper.initialBlogs.length)
  })
  
  describe('id related', () => {
    test('Test for a correct id field to be defined.', async () => {
      const response = await api.get(rootPath)
      const blogs = response.body
      //console.log(blogs)
      expect(blogs[0].id).toBeDefined()
    })
    
    test('Finding a blog entry with a certain id', async () => {
      const allBlogs = await helper.blogsInDb()
      const blogToFind = allBlogs[0]
      const findPath = `${rootPath}/${blogToFind.id}`
      const response = await api.get(findPath)
      const gotBlog = response.body
      expect(gotBlog).toEqual(blogToFind)
    })
    
    test('Test deleting an existing blog', async () => {
      const response = await api.post(rootPath)
        .send(helper.singleBlog)
        .set('Authorization', `bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
      const blogToDelete = response.body
      
      const blogsAtStart = await helper.blogsInDb() 
    
      const delPath = `${rootPath}/${blogToDelete.id}`
      await api
        .delete(delPath)
        .set('Authorization', `bearer ${token}`)
        .expect(204)
    
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(blogsAtStart.length - 1)
    
      const ids = blogsAtEnd.map(x => x.id)
      expect(ids).not.toContain(blogToDelete.id)
    })
    
    test('Updating likes of a blog', async () => {
      const blogsAtStart = await helper.blogsInDb()
    
      const blogToUpdate = blogsAtStart[0]
      const newLikes = blogToUpdate.likes + 5 
    
      const updatePath = `${rootPath}/${blogToUpdate.id}`
      await api
        .put(updatePath)
        .set('Authorization', `bearer ${token}`)
        .send({ likes: newLikes })
        .expect(200)
    
      const response = await api.get(updatePath)
      const updatedBlog = response.body
      expect(updatedBlog.likes).toBe(newLikes)
    })
  })
  
  test('Post new blog entry ' + rootPath, async () => {
    const blogsInStart = await helper.blogsInDb()
    const newEntry = helper.singleBlog
   
    await api.post(rootPath)
      .send(newEntry)
      .set('Authorization', `bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const blogsInEnd = await helper.blogsInDb()
    expect(blogsInEnd.length).toBe(blogsInStart.length + 1)  
  
    const titles = blogsInEnd.map(x => x.title)
    expect(titles).toContain(newEntry.title)
  })
  
  test('Test sending omitted "likes" -field value to be zero', async () => {
    const newEntry = helper.noLikes
  
    await api.post(rootPath)
      .set('Authorization', `bearer ${token}`)
      .send(newEntry)
  
    //const response = await api.get(rootPath)
    //const blogs = response.body
    const blogs = await helper.blogsInDb()  
    const index = blogs.findIndex(x => x.title === newEntry.title)
    expect(blogs[index].likes).toBe(0)
  })  

  test('Test deleting an existing blog with wrong token', async () => {
    const response = await api.post(rootPath)
      .send(helper.singleBlog)
      .set('Authorization', `bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogToDelete = response.body
    
    const blogsAtStart = await helper.blogsInDb() 
  
    const delPath = `${rootPath}/${blogToDelete.id}`
    await api
      .delete(delPath)
      .set('Authorization', 'bearer foofaaa')
      .expect(401)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(blogsAtStart.length)
  
    const ids = blogsAtEnd.map(x => x.id)
    expect(ids).toContain(blogToDelete.id)
  })
  
})

