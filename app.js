const config = require('./utils/config')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')

const app = express()

// Conexión a MongoDB
mongoose.set('strictQuery', false)
logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => logger.info('connected to MongoDB'))
  .catch(err => logger.error('error connecting to MongoDB:', err.message))

// Middlewares
app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/blogs', blogsRouter)

// Middlewares finales (después de las rutas)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app