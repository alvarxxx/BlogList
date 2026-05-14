const jwt = require('jsonwebtoken')
const User = require('../models/user')
const logger = require('./logger')

const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: 'unknown endpoint' })
}

const errorHandler = (err, req, res, next) => {
  logger.error(err.message)

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  } else if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'invalid token' })
  } else if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'token expired' })
  } else if (err.name === 'MongoServerError' && err.code === 11000) {
    // Opcional: manejo de error de duplicado de MongoDB (usuario existente)
    return res.status(400).json({ error: 'expected `username` to be unique' })
  }

  res.status(500).json({ error: 'something went wrong' })
}

// Middleware para extraer el token del header Authorization
const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    req.token = authorization.replace('Bearer ', '')
  }
  next()
}

// Middleware para extraer el usuario a partir del token (si es válido)
const userExtractor = async (req, res, next) => {
  if (req.token) {
    try {
      const decodedToken = jwt.verify(req.token, process.env.SECRET)
      if (decodedToken.id) {
        req.user = await User.findById(decodedToken.id)
      }
    } catch (error) {
      // Si el token es inválido, simplemente no hay usuario
    }
  }
  next()
}

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}