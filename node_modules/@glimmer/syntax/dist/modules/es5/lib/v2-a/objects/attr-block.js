function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import { NamedArgument } from './args';
import { node } from './node';
/**
 * `HtmlAttr` nodes are valid HTML attributes, with or without a value.
 *
 * Exceptions:
 *
 * - `...attributes` is `SplatAttr`
 * - `@x=<value>` is `ComponentArg`
 */

export var HtmlAttr = /*#__PURE__*/function (_node$fields) {
  _inheritsLoose(HtmlAttr, _node$fields);

  function HtmlAttr() {
    return _node$fields.apply(this, arguments) || this;
  }

  return HtmlAttr;
}(node('HtmlAttr').fields());
export var SplatAttr = /*#__PURE__*/function (_node$fields2) {
  _inheritsLoose(SplatAttr, _node$fields2);

  function SplatAttr() {
    return _node$fields2.apply(this, arguments) || this;
  }

  return SplatAttr;
}(node('SplatAttr').fields());
/**
 * Corresponds to an argument passed by a component (`@x=<value>`)
 */

export var ComponentArg = /*#__PURE__*/function (_node$fields3) {
  _inheritsLoose(ComponentArg, _node$fields3);

  function ComponentArg() {
    return _node$fields3.apply(this, arguments) || this;
  }

  var _proto = ComponentArg.prototype;

  /**
   * Convert the component argument into a named argument node
   */
  _proto.toNamedArgument = function toNamedArgument() {
    return new NamedArgument({
      name: this.name,
      value: this.value
    });
  };

  return ComponentArg;
}(node().fields());
/**
 * An `ElementModifier` is just a normal call node in modifier position.
 */

export var ElementModifier = /*#__PURE__*/function (_node$fields4) {
  _inheritsLoose(ElementModifier, _node$fields4);

  function ElementModifier() {
    return _node$fields4.apply(this, arguments) || this;
  }

  return ElementModifier;
}(node('ElementModifier').fields());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9vYmplY3RzL2F0dHItYmxvY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxTQUFBLGFBQUEsUUFBQSxRQUFBO0FBR0EsU0FBQSxJQUFBLFFBQUEsUUFBQTtBQXdCQTs7Ozs7Ozs7O0FBUUEsV0FBTSxRQUFOO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsRUFBOEIsSUFBSSxDQUFKLFVBQUksQ0FBSixDQUF4QixNQUF3QixFQUE5QjtBQUVBLFdBQU0sU0FBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLEVBQStCLElBQUksQ0FBSixXQUFJLENBQUosQ0FBekIsTUFBeUIsRUFBL0I7QUFFQTs7OztBQUdBLFdBQU0sWUFBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFDRTs7O0FBREYsU0FJRSxlQUpGLEdBSUUsMkJBQWU7QUFDYixXQUFPLElBQUEsYUFBQSxDQUFrQjtBQUN2QixNQUFBLElBQUksRUFBRSxLQURpQixJQUFBO0FBRXZCLE1BQUEsS0FBSyxFQUFFLEtBQUs7QUFGVyxLQUFsQixDQUFQO0FBSUQsR0FUSDs7QUFBQTtBQUFBLEVBQWtDLElBQUksR0FBaEMsTUFBNEIsRUFBbEM7QUFZQTs7OztBQUdBLFdBQU0sZUFBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLEVBQXFDLElBQUksQ0FBSixpQkFBSSxDQUFKLENBQS9CLE1BQStCLEVBQXJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU291cmNlU2xpY2UgfSBmcm9tICcuLi8uLi9zb3VyY2Uvc2xpY2UnO1xuaW1wb3J0IHsgTmFtZWRBcmd1bWVudCB9IGZyb20gJy4vYXJncyc7XG5pbXBvcnQgdHlwZSB7IENhbGxGaWVsZHMgfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHR5cGUgeyBFeHByZXNzaW9uTm9kZSB9IGZyb20gJy4vZXhwcic7XG5pbXBvcnQgeyBub2RlIH0gZnJvbSAnLi9ub2RlJztcblxuLyoqXG4gKiBBdHRyIG5vZGVzIGxvb2sgbGlrZSBIVE1MIGF0dHJpYnV0ZXMsIGJ1dCBhcmUgY2xhc3NpZmllZCBhczpcbiAqXG4gKiAxLiBgSHRtbEF0dHJgLCB3aGljaCBtZWFucyBhIHJlZ3VsYXIgSFRNTCBhdHRyaWJ1dGUgaW4gR2xpbW1lclxuICogMi4gYFNwbGF0QXR0cmAsIHdoaWNoIG1lYW5zIGAuLi5hdHRyaWJ1dGVzYFxuICogMy4gYENvbXBvbmVudEFyZ2AsIHdoaWNoIG1lYW5zIGFuIGF0dHJpYnV0ZSB3aG9zZSBuYW1lIGJlZ2lucyB3aXRoIGBAYCwgYW5kIGl0IGlzIHRoZXJlZm9yZSBhXG4gKiAgICBjb21wb25lbnQgYXJndW1lbnQuXG4gKi9cbmV4cG9ydCB0eXBlIEF0dHJOb2RlID0gSHRtbEF0dHIgfCBTcGxhdEF0dHIgfCBDb21wb25lbnRBcmc7XG5cbi8qKlxuICogYEh0bWxBdHRyYCBhbmQgYFNwbGF0QXR0cmAgYXJlIGdyb3VwZWQgdG9nZXRoZXIgYmVjYXVzZSB0aGUgb3JkZXIgb2YgdGhlIGBTcGxhdEF0dHJgIG5vZGUsXG4gKiByZWxhdGl2ZSB0byBvdGhlciBhdHRyaWJ1dGVzLCBtYXR0ZXJzLlxuICovXG5leHBvcnQgdHlwZSBIdG1sT3JTcGxhdEF0dHIgPSBIdG1sQXR0ciB8IFNwbGF0QXR0cjtcblxuLyoqXG4gKiBcIkF0dHIgQmxvY2tcIiBub2RlcyBhcmUgYWxsb3dlZCBpbnNpZGUgYW4gb3BlbiBlbGVtZW50IHRhZyBpbiB0ZW1wbGF0ZXMuIFRoZXkgaW50ZXJhY3Qgd2l0aCB0aGVcbiAqIGVsZW1lbnQgKG9yIGNvbXBvbmVudCkuXG4gKi9cbmV4cG9ydCB0eXBlIEF0dHJCbG9ja05vZGUgPSBBdHRyTm9kZSB8IEVsZW1lbnRNb2RpZmllcjtcblxuLyoqXG4gKiBgSHRtbEF0dHJgIG5vZGVzIGFyZSB2YWxpZCBIVE1MIGF0dHJpYnV0ZXMsIHdpdGggb3Igd2l0aG91dCBhIHZhbHVlLlxuICpcbiAqIEV4Y2VwdGlvbnM6XG4gKlxuICogLSBgLi4uYXR0cmlidXRlc2AgaXMgYFNwbGF0QXR0cmBcbiAqIC0gYEB4PTx2YWx1ZT5gIGlzIGBDb21wb25lbnRBcmdgXG4gKi9cbmV4cG9ydCBjbGFzcyBIdG1sQXR0ciBleHRlbmRzIG5vZGUoJ0h0bWxBdHRyJykuZmllbGRzPEF0dHJOb2RlT3B0aW9ucz4oKSB7fVxuXG5leHBvcnQgY2xhc3MgU3BsYXRBdHRyIGV4dGVuZHMgbm9kZSgnU3BsYXRBdHRyJykuZmllbGRzPHsgc3ltYm9sOiBudW1iZXIgfT4oKSB7fVxuXG4vKipcbiAqIENvcnJlc3BvbmRzIHRvIGFuIGFyZ3VtZW50IHBhc3NlZCBieSBhIGNvbXBvbmVudCAoYEB4PTx2YWx1ZT5gKVxuICovXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50QXJnIGV4dGVuZHMgbm9kZSgpLmZpZWxkczxBdHRyTm9kZU9wdGlvbnM+KCkge1xuICAvKipcbiAgICogQ29udmVydCB0aGUgY29tcG9uZW50IGFyZ3VtZW50IGludG8gYSBuYW1lZCBhcmd1bWVudCBub2RlXG4gICAqL1xuICB0b05hbWVkQXJndW1lbnQoKTogTmFtZWRBcmd1bWVudCB7XG4gICAgcmV0dXJuIG5ldyBOYW1lZEFyZ3VtZW50KHtcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIHZhbHVlOiB0aGlzLnZhbHVlLFxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogQW4gYEVsZW1lbnRNb2RpZmllcmAgaXMganVzdCBhIG5vcm1hbCBjYWxsIG5vZGUgaW4gbW9kaWZpZXIgcG9zaXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBFbGVtZW50TW9kaWZpZXIgZXh0ZW5kcyBub2RlKCdFbGVtZW50TW9kaWZpZXInKS5maWVsZHM8Q2FsbEZpZWxkcz4oKSB7fVxuXG5leHBvcnQgaW50ZXJmYWNlIEF0dHJOb2RlT3B0aW9ucyB7XG4gIG5hbWU6IFNvdXJjZVNsaWNlO1xuICB2YWx1ZTogRXhwcmVzc2lvbk5vZGU7XG4gIHRydXN0aW5nOiBib29sZWFuO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==