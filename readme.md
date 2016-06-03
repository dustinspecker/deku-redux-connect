# deku-redux-connect
[![NPM version](https://badge.fury.io/js/deku-redux-connect.svg)](http://badge.fury.io/js/deku-redux-connect)
[![Build Status](https://travis-ci.org/dustinspecker/deku-redux-connect.svg?branch=master)](https://travis-ci.org/dustinspecker/deku-redux-connect)
[![Coverage Status](https://img.shields.io/coveralls/dustinspecker/deku-redux-connect.svg)](https://coveralls.io/r/dustinspecker/deku-redux-connect?branch=master)

[![Code Climate](https://codeclimate.com/github/dustinspecker/deku-redux-connect/badges/gpa.svg)](https://codeclimate.com/github/dustinspecker/deku-redux-connect)
[![Dependencies](https://david-dm.org/dustinspecker/deku-redux-connect.svg)](https://david-dm.org/dustinspecker/deku-redux-connect/#info=dependencies&view=table)
[![DevDependencies](https://david-dm.org/dustinspecker/deku-redux-connect/dev-status.svg)](https://david-dm.org/dustinspecker/deku-redux-connect/#info=devDependencies&view=table)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

> Like [react-redux](https://github.com/rackt/react-redux)'s [connect](https://github.com/rackt/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options), but for [Deku](https://github.com/dekujs/deku) `2.0.0`

# Install
```bash
npm install --save deku-redux-connect
```

# Usage

`index.jsx`
```jsx
import {combineReducers, createStore} from 'redux'
import {createApp, element} from 'deku'

import count from './reducers/count'
import Counter from './components/counter'

const store = createStore(combineReducers({count}))

const render = createApp(document.body, store.dispatch)

store.subscribe(() => render(<Counter />, store.getState()))
```

`actions.js`
```javascript
export increment = () => ({
  type: 'INCREMENT'
})
```

`reducers/count.js`
```javascript
export default (state = 0, {type} = {}) {
  switch (type) {
    case 'INCREMENT':
      return state + 1
    default:
      return state
  }
}
```

`components/counter.jsx`
```jsx
import connect from 'deku-redux-connect'
import {element} from 'deku'

import {increment} from '../actions'

const Counter = ({props}) => <div>
  {props.count}
  <button onClick={props.increment}>Increment</button>
</div>

const mapStateToProps = ({count}) => ({count})

export default connect(
  mapStateToProps,
  {increment}
)(Counter)
```

## API
### connect([mapStateToProps], [mapDispatchToProps], [mergeProps])(component)
Returns a component with state and actions mapped to the component's props

#### mapStateToProps
type: `function`

A function that is called with the App's state that should return an object.

*Note: These transformed props are merged with any original props provided to the component.*

#### mapDispatchToProps
type: `function` | `object`

If `mapDispatchToProps` is a function, then the function will be called with `dispatch`. `mapDispatchToProps` should
return an object. This object will be attached to the props passed to the connected component.

If `mapDispatchToProps` is an object, then each property needs a value being a function that returns an action. The key names provided on the `mapDispatchToProps` object
will be attached to the props object. These prop actions will dispatch the action.

*Note: These transformed action props are merged with any original props and props created by `mapStateToProps`.*

#### mergeProps
type: `function`

A function that is passed the `stateProps`, `dispatchProps`, and `ownProps`. The function should
return an object. This object will be the props injected into connected component.

#### component
type: `function` | `object`

The desired component to transform. If a `function` is provided, then the function will be called with the transformed props.
If an `object` then the object's `render` method will be called with the transformed props.

## License
MIT © [Dustin Specker](https://github.com/dustinspecker)
