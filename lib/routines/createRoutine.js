const { ROUTINE_INIT } = require('../constants')

const typeErrorMessage = (input, inputType, expectedType, prefix) => {
  return `Invalid type of ${typeof input} supplied to ${input}, expected ${expectedType} in ${prefix}. Got ${inputType}`
}

// Non-practical error catcher..
const routineErrors = (prefix, api, reducerKey, transform, onSuccess, onFail) => {
  if (typeof prefix !== 'string') throw new TypeError(typeErrorMessage('prefix', prefix, 'string', prefix))
  if (typeof api !== 'function') throw new TypeError(typeErrorMessage('api', api, 'function', prefix))
  if (typeof reducerKey !== 'object') throw new TypeError(typeErrorMessage('reducerKey', reducerKey, 'object', prefix))
  if (!['string', 'function'].includes(typeof transform)) {
    throw new TypeError(typeErrorMessage('transform', transform, 'string or function', prefix))
  }
  if (onSuccess && typeof onSucess !== 'object') throw new TypeError(typeErrorMessage('onSuccess', onSuccess, 'object', prefix))
  if (onFail && typeof onFail !== 'object') throw new TypeError(typeErrorMessage('onFail', onFail, 'object', prefix))
}

const createRoutine = ({
  prefix,
  api,
  reducerKey,
  transform,
  onSuccess,
  onFail
}) => {
  routineErrors(prefix, api, reducerKey, transform)
  // DISPATCH INITIALIZE KEY

  const actionTypes = {
    TRIGGER: prefix,
    REQUEST: `${prefix}/REQUEST`,
    SUCCESS: `${prefix}/SUCCESS`,
    FAIL: `${prefix}/FAIL`
  }

  return (...payload) => {
    return ({
      type: ROUTINE_INIT,
      actionTypes,
      api,
      reducerKey,
      transform,
      onSuccess,
      onFail,
      payload,
    })
  }
}

module.exports = createRoutine


/*
**Dev-notes**
ie. const fetchTodos = createRoutine('FETCH_TODOS', axios.get('/api/fetch_todos'), {
  reducerKey: 'todos',
  transform: 'replace' ~ ['replace', 'concat', ..etc.]
})

routineOpts keys: {
  reducerKey: String.isRequired ~ state to store in reducer,
  transform: String | Func.isRequired ~ action to perform on a successful response,
}
*/
