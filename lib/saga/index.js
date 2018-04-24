const { put, call, takeEvery, all } = require('redux-saga/effects')

// Constants
const { ROUTINE_INIT } = require('../constants')

function* initializeRoutine ({
  actionTypes,
  api,
  reducerKey,
  transform,
  onSuccess,
  onFail,
  payload
}) {
  const loaderKey = actionTypes.TRIGGER.slice(
    actionTypes.TRIGGER.lastIndexOf('/') + 1
  )

  try {
    yield put({
      type: actionTypes.TRIGGER,
      key: reducerKey,
      payload
    })

    yield put({
      type: actionTypes.REQUEST,
      key: reducerKey,
      loaderKey,
      payload
    })

    const response = yield call(api, ...payload)

    yield put({
      type: actionTypes.SUCCESS,
      key: reducerKey,
      loaderKey,
      transform,
      response: response.data,
      payload
    })

    if (onSuccess) {
      yield put(onSuccess(...payload))
    }
  } catch ({ response }) {
    yield put({
      type: actionTypes.FAIL,
      key: reducerKey,
      loaderKey,
      error: typeof response.data === 'string' && response.data.includes('!DOCTYPE html') ? false : response.data
    })

    if (onFail) {
      yield put(onFail())
    }
  }
}

function* watchRoutineInit () {
  yield takeEvery(ROUTINE_INIT, initializeRoutine)
}

module.exports = function* routineSaga () {
  yield all([
    watchRoutineInit()
  ])
}
