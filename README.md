# create-routines
Create-routines is a smart action creator for redux and redux-saga. Redux-saga is an excellent library to make application side effects easier to manage. However, it can be tedious and difficult to manage code required for your actions and sagas as your application gets larger.
* create-routines is made to cut down a large portion of the boilerplate required using redux and redux-saga in your source code when making API requests.
* create-routines helps flatten your application state.
* create-routines breaks up api requests into readable actions in the routines lifecycle method.
* create-routines helps dealing with loaders and errors from api requests.

## Getting Started
You obviously need redux and redux-saga as dependencies in your project before using create-routines.

```
npm install --save create-routines
```

## Setting up

### Sagas

```javascript
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

```javascript
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
```javascript
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
```javascript
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
Each of these transformers will manipulate the response data that comes back from the successful api call in a specific way before storing them in your state. Most of them are used for very generic api response manipulations used in the redux pattern that I use frequently. You can see the source code to see what they do. Feel free to add your own!

You also have the option of inputting your own method into the transform key. Using a custom method for the transform key accepts three arguments:

1. The response from a successful or failed api call.
2. The current state of the key that the action is trying to transform.
3. The payload in which the action was invoked with.

```javascript
{
  ...
  transform: (response, stateKey, payload) => (
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

Each lifecycle action is caught by the routinesReducer and routineSaga that looks like this
```
1. ROUTINE_INIT
2. `${prefix}/TRIGGER`
3. `${prefix}/REQUEST`
4. `${prefix}/SUCCESS` / `${prefix}/FAIL`
```

## Successful API call

If the api request is successful, createRoutines will trigger the SUCCESS action type.

Your routinesReducer will take the response from the successful api call and apply the specified transformation before transforming the state.

## Failed API call

On a failed api request, createRoutines will trigger the FAIL action type. The response from a failed api request will be stored in the proper reducer key in `routines.error`

## Loader key

Another big feature of create-routines is the loader key that's stored inside the routines state.

You can check the state of your api request through the loader key. Once the routine action is called, the loader key will trigger to true. The loader key is stored as `routines.isLoading[PREFIX]`

### Example
```javascript
const mapStateToProps = ({ routines }) => ({
  loadingDashboardAnnouncements: routines.isLoading.FETCH_DASHBOARD_ANNOUNCEMENTS
})
```
This is useful for surfacing components that rely on the state of the api request.

## onSuccess and onFail

The createRoutines method can also take in an optional onSuccess / onFail key that can be used to trigger additional async callbacks after your initial api request. Useful for routing off an api call or surfacing components such as snackbars.

### Example
```
{
  prefix: string,
  api: function,
  reducerKey: [...strings],
  transform: string or function,
  onSuccess: () => push({ pathname: '/home' })
  onFail: () => push({ pathname: '/login' })
}
```

### Usage
Here's an example of createRoutines being used in a react component. The action `fetchDashboardAnnouncements` is using the createRoutines wrapper example we used in our initial example.
```javascript
import React form 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

// Actions
import { fetchDashboardAnnouncements } from 'Actions'

class Announcements extends React.Component {
  componentDidMount () {
    this.props.fetchDashboardAnnouncements()
  }

  render () {
    const { fetchingAnnouncements, announcements } = this.props

    if (fetchingAnnouncements) {
      return <LoaderScreen />
    }

    return (
      <Card>
        {
          announcements.map(announcement => (
            <AnnouncementItem announcement={announcement} key={announcement.id}
          ))
        }
      </Card>
    )
  }
}

Announcement.defaultProps = {
  announcements: [],
  fetchingAnnouncements: false
}

Announcements.propTypes = {
  fetchDashboardAnnouncements: PropTypes.func.isRequired,
  announcements: PropTypes.array,
  fetchingAnnouncements: PropTypes.bool
}

const mapStateToProps = ({ routines }) => ({
  announcements: routines.dashboard.fetchDashboardAnnouncements,
  fetchingAnnouncements: routines.isLoading.FETCH_DASHBOARD_ANNOUNCEMENTS
})

const mapDispatchToProps = {
  fetchDashboardAnnouncements
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Announcements)
```

## Clear Routines

Lastly, if you need to clear a state within routines you can use the `clearRoutine` method.
`import { clearRoutine } from create-routines`
The clearRoutine method takes in a reducerKey that is formatted the same way as the `createRoutines` method.

### Example
```javascript
this.props.clearRoutine(['dashboard', 'fetchDashboardAnnouncements'])
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
