const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { tokenExtractor, userExtractor } = require('../utils/middleware')

// GET all blogs (populate user)
blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  res.json(blogs)
})

// GET a single blog by id
blogsRouter.get('/:id', async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (blog) {
      res.json(blog)
    } else {
      res.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

// POST a new blog (requires authentication)
blogsRouter.post('/', tokenExtractor, userExtractor, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'token invalid or missing' })
    }
    const blog = new Blog({ ...req.body, user: req.user.id })
    const savedBlog = await blog.save()
    req.user.blogs = req.user.blogs.concat(savedBlog.id)
    await req.user.save()
    res.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

// DELETE a blog (only if owner)
blogsRouter.delete('/:id', tokenExtractor, userExtractor, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) {
      return res.status(404).json({ error: 'blog not found' })
    }
    if (!req.user || blog.user.toString() !== req.user.id.toString()) {
      return res.status(401).json({ error: 'unauthorized' })
    }
    await Blog.findByIdAndDelete(req.params.id)
    // Remove reference from user's blogs list
    req.user.blogs = req.user.blogs.filter(b => b.toString() !== blog.id)
    await req.user.save()
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

// PUT update blog (no authentication required by default, but you can add if needed)
blogsRouter.put('/:id', async (req, res, next) => {
  try {
    const { likes } = req.body
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { likes },
      { returnDocument: 'after', runValidators: true, context: 'query' }
    )
    if (updatedBlog) {
      res.json(updatedBlog)
    } else {
      res.status(404).json({ error: 'blog not found' })
    }
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter