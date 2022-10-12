"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debugAssert = debugAssert;
exports.prodAssert = prodAssert;
exports.deprecate = deprecate;
exports.default = void 0;

var _index = require("../index");

// import Logger from './logger';
// let alreadyWarned = false;
function debugAssert(test, msg) {
  // if (!alreadyWarned) {
  //   alreadyWarned = true;
  //   Logger.warn("Don't leave debug assertions on in public builds");
  // }
  if (!test) {
    throw new Error(msg || 'assertion failure');
  }
}

function prodAssert() {}

function deprecate(desc) {
  _index.LOCAL_LOGGER.warn("DEPRECATION: " + desc);
}

var _default = debugAssert;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2Fzc2VydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBRUE7O0FBRkE7QUFJQTtBQUVNLFNBQUEsV0FBQSxDQUFBLElBQUEsRUFBQSxHQUFBLEVBQTRDO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBRUEsTUFBSSxDQUFKLElBQUEsRUFBVztBQUNULFVBQU0sSUFBQSxLQUFBLENBQVUsR0FBRyxJQUFuQixtQkFBTSxDQUFOO0FBQ0Q7QUFDRjs7QUFFSyxTQUFBLFVBQUEsR0FBb0IsQ0FBSzs7QUFFekIsU0FBQSxTQUFBLENBQUEsSUFBQSxFQUFnQztBQUNwQyxzQkFBQSxJQUFBLENBQUEsa0JBQUEsSUFBQTtBQUNEOztlQUVELFciLCJzb3VyY2VzQ29udGVudCI6WyIvLyBpbXBvcnQgTG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcblxuaW1wb3J0IHsgTE9DQUxfTE9HR0VSIH0gZnJvbSAnLi4vaW5kZXgnO1xuXG4vLyBsZXQgYWxyZWFkeVdhcm5lZCA9IGZhbHNlO1xuXG5leHBvcnQgZnVuY3Rpb24gZGVidWdBc3NlcnQodGVzdDogYW55LCBtc2c6IHN0cmluZyk6IGFzc2VydHMgdGVzdCB7XG4gIC8vIGlmICghYWxyZWFkeVdhcm5lZCkge1xuICAvLyAgIGFscmVhZHlXYXJuZWQgPSB0cnVlO1xuICAvLyAgIExvZ2dlci53YXJuKFwiRG9uJ3QgbGVhdmUgZGVidWcgYXNzZXJ0aW9ucyBvbiBpbiBwdWJsaWMgYnVpbGRzXCIpO1xuICAvLyB9XG5cbiAgaWYgKCF0ZXN0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1zZyB8fCAnYXNzZXJ0aW9uIGZhaWx1cmUnKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvZEFzc2VydCgpIHt9XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXByZWNhdGUoZGVzYzogc3RyaW5nKSB7XG4gIExPQ0FMX0xPR0dFUi53YXJuKGBERVBSRUNBVElPTjogJHtkZXNjfWApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWJ1Z0Fzc2VydDtcbiJdLCJzb3VyY2VSb290IjoiIn0=