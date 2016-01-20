import isPlainObj from 'is-plain-obj'
import objectAssign from 'object-assign'

const transformProps = (props, context, dispatch, mapStateToProps, actions) => {
  let transformedProps = props || {}

  if (mapStateToProps !== undefined && typeof mapStateToProps !== 'function') {
    throw new TypeError('Expected mapStateToProps to be a Function')
  }

  if (actions !== undefined && typeof actions !== 'object') {
    throw new TypeError('Expected actions to be an Object')
  }

  // convert state to props
  if (typeof mapStateToProps === 'function') {
    transformedProps = objectAssign(transformedProps, mapStateToProps(context))
  }

  // bind action creators to props
  if (isPlainObj(actions)) {
    const mappedActions = Object.keys(actions).reduce((acc, action) => {
      if (typeof actions[action] !== 'function') {
        throw new Error('Expected actions\' keys to be functions')
      }

      acc[action] = (...args) => dispatch(actions[action](...args))
      return acc
    }, {})
    transformedProps = objectAssign(transformedProps, mappedActions)
  }

  return transformedProps
}

module.exports = (mapStateToProps, actions) => component => {
  if (typeof component === 'function') {
    // return component function with inject args
    const convertedComponentFunction = ({children, context, dispatch, props}) => {
      const transformedProps = transformProps(props, context, dispatch, mapStateToProps, actions)
      return component({children, dispatch, props: transformedProps})
    }

    Object.keys(component).forEach(key => {
      convertedComponentFunction[key] = component[key]
    })

    return convertedComponentFunction
  }

  if (typeof component === 'object') {
    const componentWithModifiedRender = {
      // invoke component render with injected args
      render({children, context, dispatch, props}) {
        const transformedProps = transformProps(props, context, dispatch, mapStateToProps, actions)
        return component.render({children, dispatch, props: transformedProps})
      }
    }
    // copy component's properties to componentWithModifiedRender
    Object.keys(component).forEach(key => {
      if (key !== 'render') {
        componentWithModifiedRender[key] = component[key]
      }
    })
    return componentWithModifiedRender
  }

  throw new TypeError('Expected component to be an Object or Function')
}
