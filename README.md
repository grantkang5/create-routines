# create-routines
Create-routines is a smart action creator for redux and redux-saga. Redux-saga is an excellent library to make application side effects easier to manage. However, it can be tedious and difficult to manage code required for your actions and sagas as your application gets larger. Create-routines is made to cut down a large portion of the boilerplate required using redux and redux-saga in your source code when making API requests.

## Getting Started
You obviously need redux and redux-saga as dependencies in your project before using create-routines.

```
npm install --save create-routines
```

## Setting up

### Sagas

```
import { all } from 'redux-saga/effects'

import { routineSaga } from 'create-routines'

export default function* rootSaga() {
  yield all([
      //..Sagas
      routineSaga()
    ])
}
```

### Reducers

```
import { combineReducers } from 'redux'
import { routinesReducer } from 'create-routines'

const rootReducer = combineReducers({
  routines: routinesReducer()
})
```

You can initialize routines' state through routinesReducer method

```
...
routines: routinesReducer({
  admin: {},
  dashboard: {}
})
```

## Creating routine actions
The `createRoutine` method requires 4 values in the routines opts to set the action.
```
{
  prefix: string,
  api: function,
  reducerKey: [...strings],
  transform: string or function
}
```
### Example

```
import { createRoutine } from 'create-routines'
// Constants
import { FETCH_DASHBOARD_ANNOUNCEMENTS } from 'Constants'
// Apis
import { apiFetchPublishedAnnouncements } from 'Apis'

export const fetchDashboardAnnouncements = createRoutine({
  prefix: FETCH_DASHBOARD_ANNOUNCEMENTS,
  api: apiFetchPublishedAnnouncements,
  reducerKey: ['dashboard', fetchDashboardAnnouncements],
  transform: 'replace'
})
```

## Routine opts
* The prefix key requires a string value of the action type.
* The api key is the function that will make the request to the API call. I am using axios in my example below.
```
export const apiFetchPublishedAnnouncements = () => {
  axios.get('/api/v1/announcements', { params: { published: true } })
}
```
* The reducerKey takes in an array of the keys that will be stored in your routines state in redux. In the example above we set our reducerKey to `['dashboard', 'fetchDashboardAnnouncements']`
What this will do is initialize a key in the routine state that looks like this `routines.dashboard.fetchDashboardAnnouncements`.
* The transform key can take in one of the following values:
```
'replace', 'clear', 'concat', 'remove', 'removeById', 'updateByIdAndReplace', 'updateByIdAndChange'
```
Each of these transformers will manipulate the response data that comes back from the successful api call in a specific way before storing them in your state. Most of them are used for very generic api response manipulations used in the redux pattern that I use frequently. You can see the source code or the transform section to see what they do. Feel free to add your own!

You also have the option of inputting your own method into the transform key.
```
{
  ...
  transform: (response) => (
    response.map(data => ({
      ...data, moment.utc(data.date)
    }))
  )
}
```

## Routines Lifecycle
One of the great features of create-routines is that you no longer need to create a bunch of action type constants and creators manually. Once the routines are initialized and triggered, it will run through the routines lifecycle action types.

The action types trigger in succession after its called on top of the prefix that's specified in the routine opts.

```
ROUTINE_INIT -> TRIGGER -> REQUEST -> SUCCESS / FAIL
```


## Successful API call
If the api request is successful, createRoutines will trigger the SUCCESS action type.

Your routinesReducer will take the response from the successful api call and apply the specified transformation before transforming the state.

## Failed API call
On a failed api request, createRoutines will trigger the FAIL action type. The response from a failed api request will be stored in the proper reducer key in `routines.error`
