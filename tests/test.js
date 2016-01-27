import test from 'ava'

import connect from '../lib/'

test('should throw TypeError if provided mapStateToProps is not a function', t => {
  const throws = () => connect('hello')(() => 'hi')({})

  t.throws(throws, TypeError)
  t.throws(throws, /Expected mapStateToProps to be a Function/)
})

test('should throw TypeError if provided mapDispatchToProps is not an object', t => {
  const throws = () => connect(undefined, 'hi')(() => 'hi')({})

  t.throws(throws, TypeError)
  t.throws(throws, /Expected mapDispatchToProps to be an Object/)
})

test('should throw Error if mapDispatchToProps\' keys are not all functions', t => {
  const throws = () => connect(undefined, {hi: 'bye'})(() => 'hello')({})

  t.throws(throws, Error)
  t.throws(throws, /Expected mapDispatchToProps' keys to be functions/)
})

test('should throw TypeError if component is not an object or function', t => {
  const throws = () => connect()('hello')

  t.throws(throws, TypeError)
  t.throws(throws, /Expected component to be an Object or Function/)
})

test('should pass children, dispatch, and props by default', t => {
  t.plan(3)

  const component = ({children, dispatch, props}) => {
    t.same(children, [1, 2])
    t.is(dispatch(), 3)
    t.is(props.color, 'red')
  }
  const model = {
    children: [1, 2],
    dispatch: () => 3,
    props: {
      color: 'red'
    }
  }

  const connectedComponent = connect()(component)

  connectedComponent(model)
})

test('should transform context and pass as props when mapFn is provided', t => {
  t.plan(3)

  const component = ({children, dispatch, props}) => {
    t.same(children, [1, 2])
    t.is(dispatch(), 3)
    t.is(props.color, 'red')
  }
  const model = {
    children: [1, 2],
    dispatch: () => 3,
    context: {
      color: 'red'
    }
  }

  const mapStateToProps = ({color}) => ({color})

  const connectedComponent = connect(mapStateToProps)(component)

  connectedComponent(model)
})

test('should merge mappedProps with original props', t => {
  t.plan(4)

  const component = ({children, dispatch, props}) => {
    t.same(children, [1, 2])
    t.is(dispatch(), 3)
    t.is(props.age, 20)
    t.is(props.color, 'red')
  }
  const model = {
    children: [1, 2],
    dispatch: () => 3,
    context: {
      color: 'red'
    },
    props: {
      age: 20
    }
  }

  const mapStateToProps = ({color}) => ({color})

  const connectedComponent = connect(mapStateToProps)(component)

  connectedComponent(model)
})

test('should transform context and actions and pass as props when mapFn and actions object provided', t => {
  t.plan(5)

  const component = ({children, dispatch, props}) => {
    t.same(children, [1, 2])
    t.is(dispatch(3), 9)
    t.is(props.age, 20)
    t.is(props.color, 'red')
    t.is(props.increment(), 21)
  }
  const model = {
    children: [1, 2],
    dispatch: x => x * 3,
    context: {
      color: 'red'
    },
    props: {
      age: 20
    }
  }

  const mapStateToProps = ({color}) => ({color})

  const increment = () => 7

  const connectedComponent = connect(mapStateToProps, {increment})(component)

  connectedComponent(model)
})

test('should use actions function if provided', t => {
  t.plan(2)

  const component = ({props}) => {
    t.is(props.color, 'red')
    props.updateName('dustin')
  }

  const model = {
    children: [],
    dispatch(name) {
      t.is(name, 'dustin')
    },
    context: {
      color: 'red'
    },
    props: {}
  }

  const mapStateToProps = ({color}) => ({color})

  const mapDispatchToProps = dispatch => ({
    updateName: name => dispatch(name)
  })

  const connectedComponent = connect(mapStateToProps, mapDispatchToProps)(component)

  connectedComponent(model)
})

test('should throw error if mapDispatchToProps fn does not return an object', t => {
  const component = () => 3

  const mapDispatchToProps = () => 4

  const connectedComponent = connect(undefined, mapDispatchToProps)(component)

  t.throws(() => connectedComponent({}), Error)
  t.throws(() => connectedComponent({}), /Expected mapDispatchToProps to return an object, but got 4/)
})

test('should use mergeProps if provided', t => {
  t.plan(5)

  const component = ({props}) => {
    t.is(Object.keys(props).length, 1)
    t.is(props.color, 'red')
  }

  const model = {
    children: [],
    dispatch: x => 3 * x,
    context: {
      name: 'dustin'
    },
    props: {
      age: 25
    }
  }

  const mapStateToProps = ({name}) => ({name})
  const increment = x => x + 1
  const mergeProps = (stateProps, dispatchProps, ownProps) => {
    t.is(stateProps.name, 'dustin')
    t.is(dispatchProps.increment(1), 6)
    t.is(ownProps.age, 25)

    return {color: 'red'}
  }

  const connectedComponent = connect(mapStateToProps, {increment}, mergeProps)(component)

  connectedComponent(model)
})

test('should inject props in component\'s render method', t => {
  t.plan(6)

  const component = {
    other: () => 5,
    render({children, dispatch, props}) {
      t.same(children, [1, 2])
      t.is(dispatch(3), 9)
      t.is(props.age, 20)
      t.is(props.color, 'red')
      t.is(props.increment(), 21)
    }
  }
  const model = {
    children: [1, 2],
    dispatch: x => x * 3,
    context: {
      color: 'red'
    },
    props: {
      age: 20
    }
  }

  const mapStateToProps = ({color}) => ({color})

  const increment = () => 7

  const connectedComponent = connect(mapStateToProps, {increment})(component)
  connectedComponent.render(model)
  t.is(connectedComponent.other(), 5)
})

test('should attach properties from original function', t => {
  const component = () => 3
  component.other = () => 'hi'

  const connectedComponent = connect()(component)

  t.is(connectedComponent({}), 3)
  t.is(connectedComponent.other(), 'hi')
})
