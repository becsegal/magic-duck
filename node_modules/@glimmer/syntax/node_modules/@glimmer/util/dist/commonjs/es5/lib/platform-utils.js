"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keys = keys;
exports.unwrap = unwrap;
exports.expect = expect;
exports.unreachable = unreachable;
exports.exhausted = exhausted;
exports.enumerableSymbol = enumerableSymbol;
exports.symbol = exports.tuple = exports.HAS_NATIVE_SYMBOL = exports.HAS_NATIVE_PROXY = void 0;

var _intern = _interopRequireDefault(require("./intern"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HAS_NATIVE_PROXY = typeof Proxy === 'function';
exports.HAS_NATIVE_PROXY = HAS_NATIVE_PROXY;

var HAS_NATIVE_SYMBOL = function () {
  if (typeof Symbol !== 'function') {
    return false;
  } // eslint-disable-next-line symbol-description


  return typeof Symbol() === 'symbol';
}();

exports.HAS_NATIVE_SYMBOL = HAS_NATIVE_SYMBOL;

function keys(obj) {
  return Object.keys(obj);
}

function unwrap(val) {
  if (val === null || val === undefined) throw new Error("Expected value to be present");
  return val;
}

function expect(val, message) {
  if (val === null || val === undefined) throw new Error(message);
  return val;
}

function unreachable(message) {
  if (message === void 0) {
    message = 'unreachable';
  }

  return new Error(message);
}

function exhausted(value) {
  throw new Error("Exhausted " + value);
}

var tuple = function tuple() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return args;
};

exports.tuple = tuple;

function enumerableSymbol(key) {
  return (0, _intern.default)("__" + key + Math.floor(Math.random() * Date.now()) + "__");
}

var symbol = HAS_NATIVE_SYMBOL ? Symbol : enumerableSymbol;
exports.symbol = symbol;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL3BsYXRmb3JtLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFDQTs7OztBQUlPLElBQU0sZ0JBQWdCLEdBQUcsT0FBQSxLQUFBLEtBQXpCLFVBQUE7OztBQUVBLElBQU0saUJBQWlCLEdBQUksWUFBQTtBQUNoQyxNQUFJLE9BQUEsTUFBQSxLQUFKLFVBQUEsRUFBa0M7QUFDaEMsV0FBQSxLQUFBO0FBRjhCLEdBQUEsQ0FLaEM7OztBQUNBLFNBQU8sT0FBTyxNQUFQLEVBQUEsS0FBUCxRQUFBO0FBTkssQ0FBMkIsRUFBM0I7Ozs7QUFTRCxTQUFBLElBQUEsQ0FBQSxHQUFBLEVBQXdCO0FBQzVCLFNBQU8sTUFBTSxDQUFOLElBQUEsQ0FBUCxHQUFPLENBQVA7QUFDRDs7QUFFSyxTQUFBLE1BQUEsQ0FBQSxHQUFBLEVBQWlDO0FBQ3JDLE1BQUksR0FBRyxLQUFILElBQUEsSUFBZ0IsR0FBRyxLQUF2QixTQUFBLEVBQXVDLE1BQU0sSUFBTixLQUFNLENBQU4sOEJBQU0sQ0FBTjtBQUN2QyxTQUFBLEdBQUE7QUFDRDs7QUFFSyxTQUFBLE1BQUEsQ0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFrRDtBQUN0RCxNQUFJLEdBQUcsS0FBSCxJQUFBLElBQWdCLEdBQUcsS0FBdkIsU0FBQSxFQUF1QyxNQUFNLElBQUEsS0FBQSxDQUFOLE9BQU0sQ0FBTjtBQUN2QyxTQUFBLEdBQUE7QUFDRDs7QUFFSyxTQUFBLFdBQUEsQ0FBQSxPQUFBLEVBQTZDO0FBQUEsTUFBdkIsT0FBdUIsS0FBQSxLQUFBLENBQUEsRUFBQTtBQUF2QixJQUFBLE9BQXVCLEdBQTdDLGFBQXNCO0FBQXVCOztBQUNqRCxTQUFPLElBQUEsS0FBQSxDQUFQLE9BQU8sQ0FBUDtBQUNEOztBQUVLLFNBQUEsU0FBQSxDQUFBLEtBQUEsRUFBZ0M7QUFDcEMsUUFBTSxJQUFBLEtBQUEsQ0FBQSxlQUFOLEtBQU0sQ0FBTjtBQUNEOztBQUlNLElBQU0sS0FBSyxHQUFHLFNBQVIsS0FBUSxHQUFBO0FBQUEsT0FBQSxJQUFBLElBQUEsR0FBQSxTQUFBLENBQUEsTUFBQSxFQUFBLElBQUEsR0FBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxJQUFBLEdBQUEsQ0FBQSxFQUFBLElBQUEsR0FBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEVBQUE7QUFBQSxJQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBO0FBQUE7O0FBQUEsU0FBZCxJQUFjO0FBQWQsQ0FBQTs7OztBQUVELFNBQUEsZ0JBQUEsQ0FBQSxHQUFBLEVBQXNDO0FBQzFDLFNBQU8scUJBQU0sT0FBQSxHQUFBLEdBQVksSUFBSSxDQUFKLEtBQUEsQ0FBVyxJQUFJLENBQUosTUFBQSxLQUFnQixJQUFJLENBQXhELEdBQW9ELEVBQTNCLENBQVosR0FBYixJQUFPLENBQVA7QUFDRDs7QUFFTSxJQUFNLE1BQU0sR0FBRyxpQkFBaUIsR0FBQSxNQUFBLEdBQWhDLGdCQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWF5YmUgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCBpbnRlcm4gZnJvbSAnLi9pbnRlcm4nO1xuXG5leHBvcnQgdHlwZSBGYWN0b3J5PFQ+ID0gbmV3ICguLi5hcmdzOiB1bmtub3duW10pID0+IFQ7XG5cbmV4cG9ydCBjb25zdCBIQVNfTkFUSVZFX1BST1hZID0gdHlwZW9mIFByb3h5ID09PSAnZnVuY3Rpb24nO1xuXG5leHBvcnQgY29uc3QgSEFTX05BVElWRV9TWU1CT0wgPSAoZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBzeW1ib2wtZGVzY3JpcHRpb25cbiAgcmV0dXJuIHR5cGVvZiBTeW1ib2woKSA9PT0gJ3N5bWJvbCc7XG59KSgpO1xuXG5leHBvcnQgZnVuY3Rpb24ga2V5czxUPihvYmo6IFQpOiBBcnJheTxrZXlvZiBUPiB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopIGFzIEFycmF5PGtleW9mIFQ+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW53cmFwPFQ+KHZhbDogTWF5YmU8VD4pOiBUIHtcbiAgaWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCB2YWx1ZSB0byBiZSBwcmVzZW50YCk7XG4gIHJldHVybiB2YWwgYXMgVDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4cGVjdDxUPih2YWw6IE1heWJlPFQ+LCBtZXNzYWdlOiBzdHJpbmcpOiBUIHtcbiAgaWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gdmFsIGFzIFQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnJlYWNoYWJsZShtZXNzYWdlID0gJ3VucmVhY2hhYmxlJyk6IEVycm9yIHtcbiAgcmV0dXJuIG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4aGF1c3RlZCh2YWx1ZTogbmV2ZXIpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihgRXhoYXVzdGVkICR7dmFsdWV9YCk7XG59XG5cbmV4cG9ydCB0eXBlIExpdCA9IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCB1bmRlZmluZWQgfCBudWxsIHwgdm9pZCB8IHt9O1xuXG5leHBvcnQgY29uc3QgdHVwbGUgPSA8VCBleHRlbmRzIExpdFtdPiguLi5hcmdzOiBUKSA9PiBhcmdzO1xuXG5leHBvcnQgZnVuY3Rpb24gZW51bWVyYWJsZVN5bWJvbChrZXk6IHN0cmluZyk6IGFueSB7XG4gIHJldHVybiBpbnRlcm4oYF9fJHtrZXl9JHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBEYXRlLm5vdygpKX1fX2ApO1xufVxuXG5leHBvcnQgY29uc3Qgc3ltYm9sID0gSEFTX05BVElWRV9TWU1CT0wgPyBTeW1ib2wgOiBlbnVtZXJhYmxlU3ltYm9sO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==