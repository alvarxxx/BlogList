const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  const maxLikes = Math.max(...blogs.map(blog => blog.likes))
  const favorite = blogs.find(blog => blog.likes === maxLikes)

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const authorCount = {}
  for (const blog of blogs) {
    authorCount[blog.author] = (authorCount[blog.author] || 0) + 1
  }

  let maxAuthor = null
  let maxCount = 0
  for (const [author, count] of Object.entries(authorCount)) {
    if (count > maxCount) {
      maxCount = count
      maxAuthor = author
    }
  }

  return { author: maxAuthor, blogs: maxCount }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const likesByAuthor = {}
  for (const blog of blogs) {
    const author = blog.author
    const likes = blog.likes || 0
    likesByAuthor[author] = (likesByAuthor[author] || 0) + likes
  }

  let maxAuthor = null
  let maxLikes = 0
  for (const [author, totalLikes] of Object.entries(likesByAuthor)) {
    if (totalLikes > maxLikes) {
      maxLikes = totalLikes
      maxAuthor = author
    }
  }

  return { author: maxAuthor, likes: maxLikes }
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }



