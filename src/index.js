import isPlainObj from 'is-plain-obj'
import objectAssign from 'object-assign'

const buildDispatchProps = (dispatch, mapDispatchToProps) => {
  if (isPlainObj(mapDispatchToProps)) {
    return Object.keys(mapDispatchToProps).reduce((acc, action) => {
      if (typeof mapDispatchToProps[action] !== 'function') {
        throw new Error('Expected mapDispatchToProps\' keys to be functions')
      }

      acc[action] = (...args) => dispatch(mapDispatchToProps[action](...args))

      return acc
    }, {})
  }

  if (typeof mapDispatchToProps === 'function') {
    const dispatchProps = mapDispatchToProps(dispatch)

    if (!isPlainObj(dispatchProps)) {
      throw new Error(`Expected mapDispatchToProps to return an object, but got ${dispatchProps}`)
    }

    return dispatchProps
  }

  if (mapDispatchToProps !== undefined) {
    throw new TypeError('Expected mapDispatchToProps to be an Object or Function')
  }
}

const buildStateProps = (context, mapStateToProps) => {
  if (typeof mapStateToProps === 'function') {
    return mapStateToProps(context)
  }

  if (mapStateToProps !== undefined) {
    throw new TypeError('Expected mapStateToProps to be a Function')
  }
}

const transformProps = (props, context, dispatch, mapStateToProps, mapDispatchToProps, mergeProps) => {
  const dispatchProps = buildDispatchProps(dispatch, mapDispatchToProps)
    , stateProps = buildStateProps(context, mapStateToProps)
    , ownProps = props || {}

  if (typeof mergeProps === 'function') {
    return mergeProps(stateProps, dispatchProps, ownProps)
  }

  return objectAssign({}, ownProps, stateProps, dispatchProps)
}

module.exports = (mapStateToProps, mapDispatchToProps, mergeProps) => component => {
  if (typeof component === 'function') {
    // return component function with inject args
    const convertedComponentFunction = ({children, context, dispatch, path, props}) => {
      const transformedProps = transformProps(props, context, dispatch, mapStateToProps, mapDispatchToProps, mergeProps)

      return component({children, dispatch, path, props: transformedProps})
    }

    Object.keys(component).forEach(key => {
      convertedComponentFunction[key] = component[key]
    })

    return convertedComponentFunction
  }

  if (typeof component === 'object') {
    const componentWithModifiedRender = {
      // invoke component render with injected args
      render({children, context, dispatch, path, props}) {
        const transformedProps = transformProps(props, context, dispatch, mapStateToProps,
          mapDispatchToProps, mergeProps)

        return component.render({children, dispatch, path, props: transformedProps})
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
