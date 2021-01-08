//const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const logger = require('../utils/logger')

/*const getToken = request => {
  const authorization = request.get('authorization')
  if(authorization && authorization.toLowerCase().startsWith('bearer')) {
    return authorization.substring(7)
  }
  return null
}*/

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.get('/userblogs/', async (request, response) => {
  const decodedToken = request.decodedToken

  //logger.info('Decoded token: ', decodedToken)
  if(!decodedToken) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  //const user = await User.findById(decodedToken.id).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
  const user = await User.findById(decodedToken.id)

  //logger.info('USER FOUND:', user)

  if(!user) {
    return response.status(404).json({ error: 'No corresponding user found' })
  }

  return response.status(200).json(user.blogs.map(x => x.toJSON()))
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  //logger.error(blog)

  if(blog)
    response.json(blog.toJSON())
  else
    response.status(404).end()
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const decodedToken = request.decodedToken

  //logger.info('Decoded token: ', decodedToken)
  if(!decodedToken) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  //logger.info('USER FOUND:', user)

  if(!user) {
    return response.status(404).json({ error: 'No corresponding user found' })
  }

  const newBlog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })
  
  const savedBlog = await newBlog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog.toJSON())
  //response.status(201).json(result)
})

async function findUser(request, response)  {
  const decodedToken = request.decodedToken
  if(!decodedToken) {
    return { 
      error: response
        .status(401)
        .json({ error: 'token missing or invalid' }) 
    }
  }

  const user = await User.findById(decodedToken.id)
  if(!user) {
    return { error: response.status(404).json({ error: 'no such user found' }) }
  }
  
  return { user: user.toJSON() }
}

const hasUserABlog = (user, request, response) => {
  //logger.error('USER ', user)
  const blogId = request.params.id
  const userBlogIds = user.blogs.map(x => x.toString())
  if(!userBlogIds.includes(blogId)) {
    logger.error(`user has blogs: ${user.blogs} but no blogid: ${blogId}`)
    logger.error(typeof(blogId), typeof(user.blogs[0].id))
    return { 
      error: response
        .status(404)
        .json({ error: 'no such blog for user found' }) }
  } 

  return { blogId: blogId }
}


blogsRouter.delete('/:id', async (request, response) => {
 
  const userFound = await findUser(request, response)
  if(!userFound.user) {
    return userFound.error
  }
  const user = userFound.user

  const blogFound = hasUserABlog(user, request, response)
  if(!blogFound.blogId) {
    return blogFound.error
  }
  const idToDelete = blogFound.blogId
  user.blogs = user.blogs.filter(x => x._id.toString() !== idToDelete)
  logger.info('Id to del', idToDelete)
  const result = await Blog.findByIdAndRemove(idToDelete)
  response.status(204).json(result.toJSON())
})


blogsRouter.put('/:id', async (request, response) => {
  
  /*const userFound = await findUser(request, response)
  if(!userFound.user) {
    return userFound.error
  }
  const user = userFound.user

  const blogFound = hasUserABlog(user, request, response)
  if(!blogFound.blogId) {
    return blogFound.error
  }*/
  //logger.error('Newlikes ' + body.likes)
  const body = request.body
  const entry = {
    likes: body.likes
  }

  //  const blogId = blogFound.blogId
  const blogId = request.params.id
  const result = await Blog.findByIdAndUpdate(blogId, entry, { new: true })
  response.status(200).json(result.toJSON())
})

module.exports = blogsRouter