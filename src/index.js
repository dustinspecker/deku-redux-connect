import isPlainObj from 'is-plain-obj'
import objectAssign from 'object-assign'

module.exports = (mapStateToProps, actions) => component => ({children, context, dispatch, props = {}}) => {
  let transformedProps = props

  // convert state to props
  if (typeof mapStateToProps === 'function') {
    transformedProps = objectAssign(transformedProps, mapStateToProps(context))
  }

  // bind action creators to props
  if (isPlainObj(actions)) {
    const mappedActions = Object.keys(actions).reduce((acc, action) => {
      acc[action] = (...args) => dispatch(actions[action](...args))
      return acc
    }, {})
    transformedProps = objectAssign(transformedProps, mappedActions)
  }

  if (typeof component === 'function') {
    // return component function with inject args
    return component({children, dispatch, props: transformedProps})
  }

  const componentWithModifiedRender = {
    // invoke component render with injected args
    render: () => component.render({children, dispatch, props: transformedProps})
  }
  // copy component's properties to componentWithModifiedRender
  Object.keys(component).forEach(key => {
    if (key !== 'render') {
      componentWithModifiedRender[key] = component[key]
    }
  })
  return componentWithModifiedRender
}
