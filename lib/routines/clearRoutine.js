const { CLEAR_ROUTINE } = require('../constants')

const clearRoutine = (reducerKey) => ({
  type: CLEAR_ROUTINE,
  key: reducerKey
})

module.exports = clearRoutine
