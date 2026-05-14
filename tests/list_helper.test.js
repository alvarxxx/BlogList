const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

// Prueba de dummy (4.3)
test('dummy returns one', () => {
  assert.strictEqual(listHelper.dummy([]), 1)
})

// Pruebas de totalLikes (4.4)
describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }
  ]

  const listWithMultipleBlogs = [
    { likes: 10 },
    { likes: 20 },
    { likes: 30 }
  ]

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('when list is empty, returns 0', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result, 0)
  })

  test('when list has many blogs, returns sum of all likes', () => {
    const result = listHelper.totalLikes(listWithMultipleBlogs)
    assert.strictEqual(result, 60)
  })
})

describe('favorite blog', () => {
  const listWithOneBlog = [
    {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      likes: 5
    }
  ]

  const listWithMultipleBlogs = [
    { title: 'Blog A', author: 'Author A', likes: 10 },
    { title: 'Blog B', author: 'Author B', likes: 20 },
    { title: 'Blog C', author: 'Author C', likes: 15 }
  ]

  test('when list has only one blog, returns that blog', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    assert.deepStrictEqual(result, {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      likes: 5
    })
  })

  test('when list has many blogs, returns the one with most likes', () => {
    const result = listHelper.favoriteBlog(listWithMultipleBlogs)
    assert.deepStrictEqual(result, {
      title: 'Blog B',
      author: 'Author B',
      likes: 20
    })
  })

  test('when list is empty, returns null', () => {
    const result = listHelper.favoriteBlog([])
    assert.strictEqual(result, null)
  })
})

describe('most blogs', () => {
  const listWithMultipleBlogs = [
    { author: 'Author A', title: 'Blog 1' },
    { author: 'Author B', title: 'Blog 2' },
    { author: 'Author A', title: 'Blog 3' },
    { author: 'Author A', title: 'Blog 4' },
    { author: 'Author C', title: 'Blog 5' }
  ]

  const listWithOneBlog = [
    { author: 'Author X', title: 'Only blog' }
  ]

  test('when list has many blogs, returns author with most blogs', () => {
    const result = listHelper.mostBlogs(listWithMultipleBlogs)
    assert.deepStrictEqual(result, { author: 'Author A', blogs: 3 })
  })

  test('when list has only one blog, returns that author with count 1', () => {
    const result = listHelper.mostBlogs(listWithOneBlog)
    assert.deepStrictEqual(result, { author: 'Author X', blogs: 1 })
  })

  test('when list is empty, returns null', () => {
    const result = listHelper.mostBlogs([])
    assert.strictEqual(result, null)
  })
})

describe('most likes', () => {
  const listWithMultipleBlogs = [
    { author: 'Author A', likes: 10 },
    { author: 'Author B', likes: 5 },
    { author: 'Author A', likes: 8 },
    { author: 'Author C', likes: 12 },
    { author: 'Author C', likes: 4 }
  ]

  const listWithOneBlog = [
    { author: 'Author X', likes: 15 }
  ]

  test('when list has many blogs, returns author with highest total likes', () => {
    const result = listHelper.mostLikes(listWithMultipleBlogs)
    assert.deepStrictEqual(result, { author: 'Author A', likes: 18 })
  })

  test('when list has only one blog, returns that author with its likes', () => {
    const result = listHelper.mostLikes(listWithOneBlog)
    assert.deepStrictEqual(result, { author: 'Author X', likes: 15 })
  })

  test('when list is empty, returns null', () => {
    const result = listHelper.mostLikes([])
    assert.strictEqual(result, null)
  })
})