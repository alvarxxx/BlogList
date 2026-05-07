require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
const PORT = process.env.PORT || 3003

// Esquema y modelo (todo en el mismo archivo por simplicidad inicial)
const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Blog = mongoose.model('Blog', blogSchema)

// Conexión a MongoDB
const mongoUrl = process.env.MONGODB_URI
if (!mongoUrl) {
  console.error('Falta la variable MONGODB_URI en el archivo .env')
  process.exit(1)
}

mongoose.connect(mongoUrl)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => {
    console.error('Error conectando a MongoDB:', err.message)
    process.exit(1)
  })

// Middlewares
app.use(cors())
app.use(express.json())

// Rutas
app.get('/api/blogs', (req, res, next) => {
  Blog.find({})
    .then(blogs => res.json(blogs))
    .catch(error => next(error))
})

app.post('/api/blogs', (req, res, next) => {
  const blog = new Blog(req.body)
  blog.save()
    .then(result => res.status(201).json(result))
    .catch(error => next(error))
})

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error(error.message)
  res.status(500).json({ error: 'Algo salió mal en el servidor' })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})