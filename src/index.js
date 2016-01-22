import isPlainObj from 'is-plain-obj'
import objectAssign from 'object-assign'

const transformProps = (props, context, dispatch, mapStateToProps, mapDispatchToProps, mergeProps) => {
  /* eslint complexity: [2, 8] */
  const ownProps = props || {}
  let dispatchProps, stateProps

  if (mapStateToProps !== undefined && typeof mapStateToProps !== 'function') {
    throw new TypeError('Expected mapStateToProps to be a Function')
  }

  if (mapDispatchToProps !== undefined &&
      typeof mapDispatchToProps !== 'object' &&
      typeof mapDispatchToProps !== 'function') {
    throw new TypeError('Expected mapDispatchToProps to be an Object or Function')
  }

  // convert state to props
  if (typeof mapStateToProps === 'function') {
    stateProps = mapStateToProps(context)
  }

  // bind action creators to props
  if (isPlainObj(mapDispatchToProps)) {
    dispatchProps = Object.keys(mapDispatchToProps).reduce((acc, action) => {
      if (typeof mapDispatchToProps[action] !== 'function') {
        throw new Error('Expected mapDispatchToProps\' keys to be functions')
      }

      acc[action] = (...args) => dispatch(mapDispatchToProps[action](...args))
      return acc
    }, {})
  }

  if (typeof mapDispatchToProps === 'function') {
    dispatchProps = mapDispatchToProps(dispatch)
  }

  if (typeof mergeProps === 'function') {
    return mergeProps(stateProps, dispatchProps, ownProps)
  }

  return objectAssign({}, ownProps, stateProps, dispatchProps)
}

module.exports = (mapStateToProps, mapDispatchToProps, mergeProps) => component => {
  if (typeof component === 'function') {
    // return component function with inject args
    const convertedComponentFunction = ({children, context, dispatch, props}) => {
      const transformedProps = transformProps(props, context, dispatch, mapStateToProps, mapDispatchToProps, mergeProps)
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
        const transformedProps = transformProps(props, context, dispatch, mapStateToProps,
          mapDispatchToProps, mergeProps)
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
