const transform = require('./transform')

const routinesReducer = (initialState) => {
  return (state = initialState, action) => {
    if (action.type === CLEAR_ROUTINE) {
      return transform(state, action.key, 'clear')
    }

    const type = action.type.slice(action.type.lastIndexOf('/') + 1)

    switch (type) {
      case 'REQUEST': {
        const requestState = {
          ...state,
          isLoading: {
            ...state.isLoading,
            [action.loaderKey]: true
          }
        }

        return transform(
          requestState, ['error', ...action.key], 'replace', action.loaderKey, false
        )
      }

      case 'SUCCESS':
        return transform(
          state,
          action.key,
          action.transform,
          action.loaderKey,
          action.response,
          action.payload
        )

      case 'FAIL': {
        const failState = {
          ...state,
          isLoading: {
            ...state.isLoading,
            [action.loaderKey]: false
          }
        }

        return transform(
          failState, ['error', ...action.key], 'replace', action.loaderKey, action.error
        )
      }

      default:
        return state
    }
  }
}

module.exports = routinesReducer
