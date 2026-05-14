const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

// Variables para almacenar el token y datos del usuario de prueba
let authToken = null
let testUserId = null

beforeEach(async () => {
  // Limpiar colecciones
  await Blog.deleteMany({})
  await User.deleteMany({})

  // Crear un usuario de prueba
  const newUser = {
    username: 'testuser',
    name: 'Test User',
    password: 'secret123'
  }
  await api.post('/api/users').send(newUser).expect(201)

  // Iniciar sesión para obtener token
  const loginResponse = await api.post('/api/login').send({
    username: newUser.username,
    password: newUser.password
  }).expect(200)

  authToken = loginResponse.body.token
  testUserId = loginResponse.body.id

  // Insertar blogs iniciales (sin asignar usuario, solo para pruebas GET)
  await Blog.insertMany(helper.initialBlogs)
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('a specific blog title is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(blog => blog.title)
    assert(titles.includes('React patterns'))
  })

  test('blogs have id property instead of _id', async () => {
    const response = await api.get('/api/blogs')
    const firstBlog = response.body[0]
    assert.ok(firstBlog.id, 'El blog debería tener una propiedad id')
    assert.strictEqual(firstBlog._id, undefined, 'No debería tener _id')
  })

  describe('viewing a specific blog', () => {
    test('succeeds with a valid id', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToView = blogsAtStart[0]

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.deepStrictEqual(resultBlog.body, blogToView)
    })

    test('fails with status 404 if blog does not exist', async () => {
      const nonExistingId = await helper.nonExistingId()
      await api.get(`/api/blogs/${nonExistingId}`).expect(404)
    })

    test('fails with status 400 if id is invalid (malformatted)', async () => {
      const invalidId = '12345abcde'
      await api.get(`/api/blogs/${invalidId}`).expect(400)
    })
  })

  describe('addition of a new blog', () => {
    test('succeeds with valid data and returns 201', async () => {
      const newBlog = {
        title: 'async/await simplifies making async calls',
        author: 'John Doe',
        url: 'https://example.com',
        likes: 3,
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes('async/await simplifies making async calls'))
    })

    test('if likes is missing, defaults to 0', async () => {
      const newBlog = {
        title: 'No likes blog',
        author: 'Nobody',
        url: 'https://example.com'
      }

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newBlog)
        .expect(201)

      assert.strictEqual(response.body.likes, 0)
    })

    test('fails with status 400 if title is missing', async () => {
      const newBlog = {
        author: 'No title',
        url: 'https://example.com',
        likes: 1,
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('fails with status 400 if url is missing', async () => {
      const newBlog = {
        title: 'No url blog',
        author: 'Someone',
        likes: 5
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('fails with status 401 if token is not provided', async () => {
      const newBlog = {
        title: 'No token',
        author: 'Nobody',
        url: 'https://example.com'
      }
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status 204 if id is valid and user owns the blog', async () => {
      // Crear un blog que pertenezca al usuario autenticado
      const newBlog = {
        title: 'Blog para eliminar',
        author: 'Test User',
        url: 'https://delete.com',
        likes: 5
      }
      const createdResponse = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newBlog)
        .expect(201)

      const blogToDelete = createdResponse.body

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      const titles = blogsAtEnd.map(b => b.title)
      assert(!titles.includes(blogToDelete.title))
      // El total de blogs debe ser initialBlogs.length + 1 (el creado) - 1 (eliminado) = initialBlogs.length
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('fails with status 404 if blog does not exist', async () => {
      const nonExistingId = await helper.nonExistingId()
      await api
        .delete(`/api/blogs/${nonExistingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    test('fails with status 400 if id is invalid', async () => {
      const invalidId = '12345abcde'
      await api
        .delete(`/api/blogs/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)
    })

    test('fails with status 401 if token is not provided', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(401)
    })
  })
})

describe('updating a blog', () => {
  test('succeeds with valid id and likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const newLikes = blogToUpdate.likes + 10

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: newLikes })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, newLikes)
  })

  test('fails with status 404 if blog does not exist', async () => {
    const nonExistingId = await helper.nonExistingId()
    await api
      .put(`/api/blogs/${nonExistingId}`)
      .send({ likes: 10 })
      .expect(404)
  })

  test('fails with status 400 if id is invalid', async () => {
    const invalidId = '12345abcde'
    await api
      .put(`/api/blogs/${invalidId}`)
      .send({ likes: 10 })
      .expect(400)
  })
})

after(async () => {
  await mongoose.connection.close()
})