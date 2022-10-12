"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isLiteral = isLiteral;
exports.InterpolateExpression = exports.DeprecatedCallExpression = exports.CallExpression = exports.PathExpression = exports.LiteralExpression = void 0;

var _slice = require("../../source/slice");

var _node = require("./node");

/**
 * Corresponds to a Handlebars literal.
 *
 * @see {LiteralValue}
 */
class LiteralExpression extends (0, _node.node)('Literal').fields() {
  toSlice() {
    return new _slice.SourceSlice({
      loc: this.loc,
      chars: this.value
    });
  }

}
/**
 * Returns true if an input {@see ExpressionNode} is a literal.
 */


exports.LiteralExpression = LiteralExpression;

function isLiteral(node, kind) {
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


class PathExpression extends (0, _node.node)('Path').fields() {}
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


exports.PathExpression = PathExpression;

class CallExpression extends (0, _node.node)('Call').fields() {}
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


exports.CallExpression = CallExpression;

class DeprecatedCallExpression extends (0, _node.node)('DeprecatedCall').fields() {}
/**
 * Corresponds to an interpolation in attribute value position.
 *
 * ```hbs
 * <a href="{{url}}.html"
 * ```
 */


exports.DeprecatedCallExpression = DeprecatedCallExpression;

class InterpolateExpression extends (0, _node.node)('Interpolate').fields() {}

exports.InterpolateExpression = InterpolateExpression;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9vYmplY3RzL2V4cHIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFFQTs7QUFFQTs7QUFrQkE7Ozs7O0FBS00sTUFBQSxpQkFBQSxTQUFpQyxnQkFBQSxTQUFBLEVBQWpDLE1BQWlDLEVBQWpDLENBQWtGO0FBQ3RGLEVBQUEsT0FBTyxHQUFBO0FBQ0wsV0FBTyxJQUFBLGtCQUFBLENBQWdCO0FBQUUsTUFBQSxHQUFHLEVBQUUsS0FBUCxHQUFBO0FBQWlCLE1BQUEsS0FBSyxFQUFFLEtBQUs7QUFBN0IsS0FBaEIsQ0FBUDtBQUNEOztBQUhxRjtBQVF4Rjs7Ozs7OztBQUdNLFNBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBRUk7QUFFUixNQUFJLElBQUksQ0FBSixJQUFBLEtBQUosU0FBQSxFQUE2QjtBQUMzQixRQUFJLElBQUksS0FBUixTQUFBLEVBQXdCO0FBQ3RCLGFBQUEsSUFBQTtBQURGLEtBQUEsTUFFTyxJQUFJLElBQUksS0FBUixNQUFBLEVBQXFCO0FBQzFCLGFBQU8sSUFBSSxDQUFKLEtBQUEsS0FBUCxJQUFBO0FBREssS0FBQSxNQUVBO0FBQ0wsYUFBTyxPQUFPLElBQUksQ0FBWCxLQUFBLEtBQVAsSUFBQTtBQUNEO0FBUEgsR0FBQSxNQVFPO0FBQ0wsV0FBQSxLQUFBO0FBQ0Q7QUFDRjtBQUVEOzs7Ozs7Ozs7Ozs7OztBQVlNLE1BQUEsY0FBQSxTQUE4QixnQkFBQSxNQUFBLEVBQTlCLE1BQThCLEVBQTlCLENBR0Y7QUFFSjs7Ozs7Ozs7Ozs7Ozs7QUFVTSxNQUFBLGNBQUEsU0FBOEIsZ0JBQUEsTUFBQSxFQUE5QixNQUE4QixFQUE5QixDQUErRDtBQUVyRTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFhTSxNQUFBLHdCQUFBLFNBQXdDLGdCQUFBLGdCQUFBLEVBQXhDLE1BQXdDLEVBQXhDLENBR0Y7QUFFSjs7Ozs7Ozs7Ozs7QUFPTSxNQUFBLHFCQUFBLFNBQXFDLGdCQUFBLGFBQUEsRUFBckMsTUFBcUMsRUFBckMsQ0FFRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByZXNlbnRBcnJheSB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5pbXBvcnQgeyBTb3VyY2VTbGljZSB9IGZyb20gJy4uLy4uL3NvdXJjZS9zbGljZSc7XG5pbXBvcnQgdHlwZSB7IENhbGxGaWVsZHMgfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgbm9kZSB9IGZyb20gJy4vbm9kZSc7XG5pbXBvcnQgdHlwZSB7IEZyZWVWYXJSZWZlcmVuY2UsIFZhcmlhYmxlUmVmZXJlbmNlIH0gZnJvbSAnLi9yZWZzJztcblxuLyoqXG4gKiBBIEhhbmRsZWJhcnMgbGl0ZXJhbC5cbiAqXG4gKiB7QGxpbmsgaHR0cHM6Ly9oYW5kbGViYXJzanMuY29tL2d1aWRlL2V4cHJlc3Npb25zLmh0bWwjbGl0ZXJhbC1zZWdtZW50c31cbiAqL1xuZXhwb3J0IHR5cGUgTGl0ZXJhbFZhbHVlID0gc3RyaW5nIHwgYm9vbGVhbiB8IG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGw7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGl0ZXJhbFR5cGVzIHtcbiAgc3RyaW5nOiBzdHJpbmc7XG4gIGJvb2xlYW46IGJvb2xlYW47XG4gIG51bWJlcjogbnVtYmVyO1xuICBudWxsOiBudWxsO1xuICB1bmRlZmluZWQ6IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBhIEhhbmRsZWJhcnMgbGl0ZXJhbC5cbiAqXG4gKiBAc2VlIHtMaXRlcmFsVmFsdWV9XG4gKi9cbmV4cG9ydCBjbGFzcyBMaXRlcmFsRXhwcmVzc2lvbiBleHRlbmRzIG5vZGUoJ0xpdGVyYWwnKS5maWVsZHM8eyB2YWx1ZTogTGl0ZXJhbFZhbHVlIH0+KCkge1xuICB0b1NsaWNlKHRoaXM6IFN0cmluZ0xpdGVyYWwpOiBTb3VyY2VTbGljZSB7XG4gICAgcmV0dXJuIG5ldyBTb3VyY2VTbGljZSh7IGxvYzogdGhpcy5sb2MsIGNoYXJzOiB0aGlzLnZhbHVlIH0pO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFN0cmluZ0xpdGVyYWwgPSBMaXRlcmFsRXhwcmVzc2lvbiAmIHsgdmFsdWU6IHN0cmluZyB9O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBhbiBpbnB1dCB7QHNlZSBFeHByZXNzaW9uTm9kZX0gaXMgYSBsaXRlcmFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNMaXRlcmFsPEsgZXh0ZW5kcyBrZXlvZiBMaXRlcmFsVHlwZXMgPSBrZXlvZiBMaXRlcmFsVHlwZXM+KFxuICBub2RlOiBFeHByZXNzaW9uTm9kZSxcbiAga2luZD86IEtcbik6IG5vZGUgaXMgU3RyaW5nTGl0ZXJhbCB7XG4gIGlmIChub2RlLnR5cGUgPT09ICdMaXRlcmFsJykge1xuICAgIGlmIChraW5kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gJ251bGwnKSB7XG4gICAgICByZXR1cm4gbm9kZS52YWx1ZSA9PT0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHR5cGVvZiBub2RlLnZhbHVlID09PSBraW5kO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBhIHBhdGggaW4gZXhwcmVzc2lvbiBwb3NpdGlvbi5cbiAqXG4gKiBgYGBoYnNcbiAqIHRoaXNcbiAqIHRoaXMueFxuICogQHhcbiAqIEB4LnlcbiAqIHhcbiAqIHgueVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBQYXRoRXhwcmVzc2lvbiBleHRlbmRzIG5vZGUoJ1BhdGgnKS5maWVsZHM8e1xuICByZWY6IFZhcmlhYmxlUmVmZXJlbmNlO1xuICB0YWlsOiByZWFkb25seSBTb3VyY2VTbGljZVtdO1xufT4oKSB7fVxuXG4vKipcbiAqIENvcnJlc3BvbmRzIHRvIGEgcGFyZW50aGVzaXplZCBjYWxsIGV4cHJlc3Npb24uXG4gKlxuICogYGBgaGJzXG4gKiAoeClcbiAqICh4LnkpXG4gKiAoeCB5KVxuICogKHgueSB6KVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBDYWxsRXhwcmVzc2lvbiBleHRlbmRzIG5vZGUoJ0NhbGwnKS5maWVsZHM8Q2FsbEZpZWxkcz4oKSB7fVxuXG4vKipcbiAqIENvcnJlc3BvbmRzIHRvIGEgcG9zc2libGUgZGVwcmVjYXRlZCBoZWxwZXIgY2FsbC4gTXVzdCBiZTpcbiAqXG4gKiAxLiBBIGZyZWUgdmFyaWFibGUgKG5vdCB0aGlzLmZvbywgbm90IEBmb28sIG5vdCBsb2NhbCkuXG4gKiAyLiBBcmd1bWVudC1sZXNzLlxuICogMy4gSW4gYSBjb21wb25lbnQgaW52b2NhdGlvbidzIG5hbWVkIGFyZ3VtZW50IHBvc2l0aW9uLlxuICogNC4gTm90IHBhcmVudGhlc2l6ZWQgKG5vdCBAYmFyPXt7KGhlbHBlcil9fSkuXG4gKiA1LiBOb3QgaW50ZXJwb2xhdGVkIChub3QgQGJhcj1cInt7aGVscGVyfX1cIikuXG4gKlxuICogYGBgaGJzXG4gKiA8Rm9vIEBiYXI9e3toZWxwZXJ9fSAvPlxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBEZXByZWNhdGVkQ2FsbEV4cHJlc3Npb24gZXh0ZW5kcyBub2RlKCdEZXByZWNhdGVkQ2FsbCcpLmZpZWxkczx7XG4gIGFyZzogU291cmNlU2xpY2U7XG4gIGNhbGxlZTogRnJlZVZhclJlZmVyZW5jZTtcbn0+KCkge31cblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBhbiBpbnRlcnBvbGF0aW9uIGluIGF0dHJpYnV0ZSB2YWx1ZSBwb3NpdGlvbi5cbiAqXG4gKiBgYGBoYnNcbiAqIDxhIGhyZWY9XCJ7e3VybH19Lmh0bWxcIlxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnRlcnBvbGF0ZUV4cHJlc3Npb24gZXh0ZW5kcyBub2RlKCdJbnRlcnBvbGF0ZScpLmZpZWxkczx7XG4gIHBhcnRzOiBQcmVzZW50QXJyYXk8RXhwcmVzc2lvbk5vZGU+O1xufT4oKSB7fVxuXG5leHBvcnQgdHlwZSBFeHByZXNzaW9uTm9kZSA9XG4gIHwgTGl0ZXJhbEV4cHJlc3Npb25cbiAgfCBQYXRoRXhwcmVzc2lvblxuICB8IENhbGxFeHByZXNzaW9uXG4gIHwgRGVwcmVjYXRlZENhbGxFeHByZXNzaW9uXG4gIHwgSW50ZXJwb2xhdGVFeHByZXNzaW9uO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==