import test from 'ava'

import connect from '../lib/'

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

test('should transform context and actions and pass as props when mapFn and actions provided', t => {
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
