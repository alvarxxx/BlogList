const reverse = (string) => {
  return string.split('').reverse().join('')
}

const average = (array) => {
  if (array.length === 0) return 0
  const sum = array.reduce((acc, n) => acc + n, 0)
  return sum / array.length
}

module.exports = { reverse, average }