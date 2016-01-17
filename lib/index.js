'use strict';

var _isPlainObj = require('is-plain-obj');

var _isPlainObj2 = _interopRequireDefault(_isPlainObj);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (mapStateToProps, actions) {
  return function (component) {
    return function (_ref) {
      var children = _ref.children;
      var context = _ref.context;
      var dispatch = _ref.dispatch;
      var _ref$props = _ref.props;
      var props = _ref$props === undefined ? {} : _ref$props;

      var transformedProps = props;

      // convert state to props
      if (typeof mapStateToProps === 'function') {
        transformedProps = (0, _objectAssign2.default)(transformedProps, mapStateToProps(context));
      }

      // bind action creators to props
      if ((0, _isPlainObj2.default)(actions)) {
        var mappedActions = Object.keys(actions).reduce(function (acc, action) {
          acc[action] = function () {
            return dispatch(actions[action].apply(actions, arguments));
          };
          return acc;
        }, {});
        transformedProps = (0, _objectAssign2.default)(transformedProps, mappedActions);
      }

      if (typeof component === 'function') {
        // return component function with inject args
        return component({ children: children, dispatch: dispatch, props: transformedProps });
      }

      var componentWithModifiedRender = {
        // invoke component render with injected args
        render: function render() {
          return component.render({ children: children, dispatch: dispatch, props: transformedProps });
        }
      };
      // copy component's properties to componentWithModifiedRender
      Object.keys(component).forEach(function (key) {
        if (key !== 'render') {
          componentWithModifiedRender[key] = component[key];
        }
      });
      return componentWithModifiedRender;
    };
  };
};