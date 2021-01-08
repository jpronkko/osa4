const jwt = require('jsonwebtoken')
const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method: ', request.method)
  logger.info('Path: ', request.path)
  logger.info('Body: ', request.body)
  logger.info('---')
  next()
}

const requestToken = (request, response, next) => {
 
  const authorization = request.get('authorization')
  if(authorization && authorization.toLowerCase().startsWith('bearer')) {
    const nonDecodToken = authorization.substring(7)
    request.decodedToken = jwt.verify(nonDecodToken, process.env.SECRET)
  }
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unkown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error('Error Handler: ', error.name, ' ', request.body, error.message)
  if(error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' })
  } else if (error.name === 'ValidationError') {
    //logger.error('Came here Error Handler: ', error.name, ' ', request.body)
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  }

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  requestToken
}