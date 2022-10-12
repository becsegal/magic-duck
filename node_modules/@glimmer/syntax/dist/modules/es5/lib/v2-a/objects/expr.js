function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import { SourceSlice } from '../../source/slice';
import { node } from './node';
/**
 * Corresponds to a Handlebars literal.
 *
 * @see {LiteralValue}
 */

export var LiteralExpression = /*#__PURE__*/function (_node$fields) {
  _inheritsLoose(LiteralExpression, _node$fields);

  function LiteralExpression() {
    return _node$fields.apply(this, arguments) || this;
  }

  var _proto = LiteralExpression.prototype;

  _proto.toSlice = function toSlice() {
    return new SourceSlice({
      loc: this.loc,
      chars: this.value
    });
  };

  return LiteralExpression;
}(node('Literal').fields());
/**
 * Returns true if an input {@see ExpressionNode} is a literal.
 */

export function isLiteral(node, kind) {
  if (node.type === 'Literal') {
    if (kind === undefined) {
      return true;
    } else if (kind === 'null') {
      return node.value === null;
    } else {
      return typeof node.value === kind;
    }
  } else {
    return false;
  }
}
/**
 * Corresponds to a path in expression position.
 *
 * ```hbs
 * this
 * this.x
 * @x
 * @x.y
 * x
 * x.y
 * ```
 */

export var PathExpression = /*#__PURE__*/function (_node$fields2) {
  _inheritsLoose(PathExpression, _node$fields2);

  function PathExpression() {
    return _node$fields2.apply(this, arguments) || this;
  }

  return PathExpression;
}(node('Path').fields());
/**
 * Corresponds to a parenthesized call expression.
 *
 * ```hbs
 * (x)
 * (x.y)
 * (x y)
 * (x.y z)
 * ```
 */

export var CallExpression = /*#__PURE__*/function (_node$fields3) {
  _inheritsLoose(CallExpression, _node$fields3);

  function CallExpression() {
    return _node$fields3.apply(this, arguments) || this;
  }

  return CallExpression;
}(node('Call').fields());
/**
 * Corresponds to a possible deprecated helper call. Must be:
 *
 * 1. A free variable (not this.foo, not @foo, not local).
 * 2. Argument-less.
 * 3. In a component invocation's named argument position.
 * 4. Not parenthesized (not @bar={{(helper)}}).
 * 5. Not interpolated (not @bar="{{helper}}").
 *
 * ```hbs
 * <Foo @bar={{helper}} />
 * ```
 */

export var DeprecatedCallExpression = /*#__PURE__*/function (_node$fields4) {
  _inheritsLoose(DeprecatedCallExpression, _node$fields4);

  function DeprecatedCallExpression() {
    return _node$fields4.apply(this, arguments) || this;
  }

  return DeprecatedCallExpression;
}(node('DeprecatedCall').fields());
/**
 * Corresponds to an interpolation in attribute value position.
 *
 * ```hbs
 * <a href="{{url}}.html"
 * ```
 */

export var InterpolateExpression = /*#__PURE__*/function (_node$fields5) {
  _inheritsLoose(InterpolateExpression, _node$fields5);

  function InterpolateExpression() {
    return _node$fields5.apply(this, arguments) || this;
  }

  return InterpolateExpression;
}(node('Interpolate').fields());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9vYmplY3RzL2V4cHIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxTQUFBLFdBQUEsUUFBQSxvQkFBQTtBQUVBLFNBQUEsSUFBQSxRQUFBLFFBQUE7QUFrQkE7Ozs7OztBQUtBLFdBQU0saUJBQU47QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUEsU0FDRSxPQURGLEdBQ0UsbUJBQU87QUFDTCxXQUFPLElBQUEsV0FBQSxDQUFnQjtBQUFFLE1BQUEsR0FBRyxFQUFFLEtBQVAsR0FBQTtBQUFpQixNQUFBLEtBQUssRUFBRSxLQUFLO0FBQTdCLEtBQWhCLENBQVA7QUFDRCxHQUhIOztBQUFBO0FBQUEsRUFBdUMsSUFBSSxDQUFKLFNBQUksQ0FBSixDQUFqQyxNQUFpQyxFQUF2QztBQVFBOzs7O0FBR0EsT0FBTSxTQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxFQUVJO0FBRVIsTUFBSSxJQUFJLENBQUosSUFBQSxLQUFKLFNBQUEsRUFBNkI7QUFDM0IsUUFBSSxJQUFJLEtBQVIsU0FBQSxFQUF3QjtBQUN0QixhQUFBLElBQUE7QUFERixLQUFBLE1BRU8sSUFBSSxJQUFJLEtBQVIsTUFBQSxFQUFxQjtBQUMxQixhQUFPLElBQUksQ0FBSixLQUFBLEtBQVAsSUFBQTtBQURLLEtBQUEsTUFFQTtBQUNMLGFBQU8sT0FBTyxJQUFJLENBQVgsS0FBQSxLQUFQLElBQUE7QUFDRDtBQVBILEdBQUEsTUFRTztBQUNMLFdBQUEsS0FBQTtBQUNEO0FBQ0Y7QUFFRDs7Ozs7Ozs7Ozs7OztBQVlBLFdBQU0sY0FBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLEVBQW9DLElBQUksQ0FBSixNQUFJLENBQUosQ0FBOUIsTUFBOEIsRUFBcEM7QUFLQTs7Ozs7Ozs7Ozs7QUFVQSxXQUFNLGNBQU47QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxFQUFvQyxJQUFJLENBQUosTUFBSSxDQUFKLENBQTlCLE1BQThCLEVBQXBDO0FBRUE7Ozs7Ozs7Ozs7Ozs7O0FBYUEsV0FBTSx3QkFBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLEVBQThDLElBQUksQ0FBSixnQkFBSSxDQUFKLENBQXhDLE1BQXdDLEVBQTlDO0FBS0E7Ozs7Ozs7O0FBT0EsV0FBTSxxQkFBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLEVBQTJDLElBQUksQ0FBSixhQUFJLENBQUosQ0FBckMsTUFBcUMsRUFBM0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcmVzZW50QXJyYXkgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcblxuaW1wb3J0IHsgU291cmNlU2xpY2UgfSBmcm9tICcuLi8uLi9zb3VyY2Uvc2xpY2UnO1xuaW1wb3J0IHR5cGUgeyBDYWxsRmllbGRzIH0gZnJvbSAnLi9iYXNlJztcbmltcG9ydCB7IG5vZGUgfSBmcm9tICcuL25vZGUnO1xuaW1wb3J0IHR5cGUgeyBGcmVlVmFyUmVmZXJlbmNlLCBWYXJpYWJsZVJlZmVyZW5jZSB9IGZyb20gJy4vcmVmcyc7XG5cbi8qKlxuICogQSBIYW5kbGViYXJzIGxpdGVyYWwuXG4gKlxuICoge0BsaW5rIGh0dHBzOi8vaGFuZGxlYmFyc2pzLmNvbS9ndWlkZS9leHByZXNzaW9ucy5odG1sI2xpdGVyYWwtc2VnbWVudHN9XG4gKi9cbmV4cG9ydCB0eXBlIExpdGVyYWxWYWx1ZSA9IHN0cmluZyB8IGJvb2xlYW4gfCBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsO1xuXG5leHBvcnQgaW50ZXJmYWNlIExpdGVyYWxUeXBlcyB7XG4gIHN0cmluZzogc3RyaW5nO1xuICBib29sZWFuOiBib29sZWFuO1xuICBudW1iZXI6IG51bWJlcjtcbiAgbnVsbDogbnVsbDtcbiAgdW5kZWZpbmVkOiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQ29ycmVzcG9uZHMgdG8gYSBIYW5kbGViYXJzIGxpdGVyYWwuXG4gKlxuICogQHNlZSB7TGl0ZXJhbFZhbHVlfVxuICovXG5leHBvcnQgY2xhc3MgTGl0ZXJhbEV4cHJlc3Npb24gZXh0ZW5kcyBub2RlKCdMaXRlcmFsJykuZmllbGRzPHsgdmFsdWU6IExpdGVyYWxWYWx1ZSB9PigpIHtcbiAgdG9TbGljZSh0aGlzOiBTdHJpbmdMaXRlcmFsKTogU291cmNlU2xpY2Uge1xuICAgIHJldHVybiBuZXcgU291cmNlU2xpY2UoeyBsb2M6IHRoaXMubG9jLCBjaGFyczogdGhpcy52YWx1ZSB9KTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBTdHJpbmdMaXRlcmFsID0gTGl0ZXJhbEV4cHJlc3Npb24gJiB7IHZhbHVlOiBzdHJpbmcgfTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgYW4gaW5wdXQge0BzZWUgRXhwcmVzc2lvbk5vZGV9IGlzIGEgbGl0ZXJhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTGl0ZXJhbDxLIGV4dGVuZHMga2V5b2YgTGl0ZXJhbFR5cGVzID0ga2V5b2YgTGl0ZXJhbFR5cGVzPihcbiAgbm9kZTogRXhwcmVzc2lvbk5vZGUsXG4gIGtpbmQ/OiBLXG4pOiBub2RlIGlzIFN0cmluZ0xpdGVyYWwge1xuICBpZiAobm9kZS50eXBlID09PSAnTGl0ZXJhbCcpIHtcbiAgICBpZiAoa2luZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGtpbmQgPT09ICdudWxsJykge1xuICAgICAgcmV0dXJuIG5vZGUudmFsdWUgPT09IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygbm9kZS52YWx1ZSA9PT0ga2luZDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogQ29ycmVzcG9uZHMgdG8gYSBwYXRoIGluIGV4cHJlc3Npb24gcG9zaXRpb24uXG4gKlxuICogYGBgaGJzXG4gKiB0aGlzXG4gKiB0aGlzLnhcbiAqIEB4XG4gKiBAeC55XG4gKiB4XG4gKiB4LnlcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgUGF0aEV4cHJlc3Npb24gZXh0ZW5kcyBub2RlKCdQYXRoJykuZmllbGRzPHtcbiAgcmVmOiBWYXJpYWJsZVJlZmVyZW5jZTtcbiAgdGFpbDogcmVhZG9ubHkgU291cmNlU2xpY2VbXTtcbn0+KCkge31cblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBhIHBhcmVudGhlc2l6ZWQgY2FsbCBleHByZXNzaW9uLlxuICpcbiAqIGBgYGhic1xuICogKHgpXG4gKiAoeC55KVxuICogKHggeSlcbiAqICh4LnkgeilcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgQ2FsbEV4cHJlc3Npb24gZXh0ZW5kcyBub2RlKCdDYWxsJykuZmllbGRzPENhbGxGaWVsZHM+KCkge31cblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBhIHBvc3NpYmxlIGRlcHJlY2F0ZWQgaGVscGVyIGNhbGwuIE11c3QgYmU6XG4gKlxuICogMS4gQSBmcmVlIHZhcmlhYmxlIChub3QgdGhpcy5mb28sIG5vdCBAZm9vLCBub3QgbG9jYWwpLlxuICogMi4gQXJndW1lbnQtbGVzcy5cbiAqIDMuIEluIGEgY29tcG9uZW50IGludm9jYXRpb24ncyBuYW1lZCBhcmd1bWVudCBwb3NpdGlvbi5cbiAqIDQuIE5vdCBwYXJlbnRoZXNpemVkIChub3QgQGJhcj17eyhoZWxwZXIpfX0pLlxuICogNS4gTm90IGludGVycG9sYXRlZCAobm90IEBiYXI9XCJ7e2hlbHBlcn19XCIpLlxuICpcbiAqIGBgYGhic1xuICogPEZvbyBAYmFyPXt7aGVscGVyfX0gLz5cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgRGVwcmVjYXRlZENhbGxFeHByZXNzaW9uIGV4dGVuZHMgbm9kZSgnRGVwcmVjYXRlZENhbGwnKS5maWVsZHM8e1xuICBhcmc6IFNvdXJjZVNsaWNlO1xuICBjYWxsZWU6IEZyZWVWYXJSZWZlcmVuY2U7XG59PigpIHt9XG5cbi8qKlxuICogQ29ycmVzcG9uZHMgdG8gYW4gaW50ZXJwb2xhdGlvbiBpbiBhdHRyaWJ1dGUgdmFsdWUgcG9zaXRpb24uXG4gKlxuICogYGBgaGJzXG4gKiA8YSBocmVmPVwie3t1cmx9fS5odG1sXCJcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgSW50ZXJwb2xhdGVFeHByZXNzaW9uIGV4dGVuZHMgbm9kZSgnSW50ZXJwb2xhdGUnKS5maWVsZHM8e1xuICBwYXJ0czogUHJlc2VudEFycmF5PEV4cHJlc3Npb25Ob2RlPjtcbn0+KCkge31cblxuZXhwb3J0IHR5cGUgRXhwcmVzc2lvbk5vZGUgPVxuICB8IExpdGVyYWxFeHByZXNzaW9uXG4gIHwgUGF0aEV4cHJlc3Npb25cbiAgfCBDYWxsRXhwcmVzc2lvblxuICB8IERlcHJlY2F0ZWRDYWxsRXhwcmVzc2lvblxuICB8IEludGVycG9sYXRlRXhwcmVzc2lvbjtcbiJdLCJzb3VyY2VSb290IjoiIn0=