const logger = require('./logger')

const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: 'unknown endpoint' })
}

const errorHandler = (err, req, res, next) => {
  logger.error(err.message)
  res.status(500).json({ error: 'something went wrong' })
}

module.exports = { unknownEndpoint, errorHandler }