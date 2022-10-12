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
  _index.LOCAL_LOGGER.warn(`DEPRECATION: ${desc}`);
}

var _default = debugAssert;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2Fzc2VydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBRUE7O0FBRkE7QUFJQTtBQUVNLFNBQUEsV0FBQSxDQUFBLElBQUEsRUFBQSxHQUFBLEVBQTRDO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBRUEsTUFBSSxDQUFKLElBQUEsRUFBVztBQUNULFVBQU0sSUFBQSxLQUFBLENBQVUsR0FBRyxJQUFuQixtQkFBTSxDQUFOO0FBQ0Q7QUFDRjs7QUFFSyxTQUFBLFVBQUEsR0FBb0IsQ0FBSzs7QUFFekIsU0FBQSxTQUFBLENBQUEsSUFBQSxFQUFnQztBQUNwQyxzQkFBQSxJQUFBLENBQWtCLGdCQUFnQixJQUFsQyxFQUFBO0FBQ0Q7O2VBRUQsVyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGltcG9ydCBMb2dnZXIgZnJvbSAnLi9sb2dnZXInO1xuXG5pbXBvcnQgeyBMT0NBTF9MT0dHRVIgfSBmcm9tICcuLi9pbmRleCc7XG5cbi8vIGxldCBhbHJlYWR5V2FybmVkID0gZmFsc2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWJ1Z0Fzc2VydCh0ZXN0OiBhbnksIG1zZzogc3RyaW5nKTogYXNzZXJ0cyB0ZXN0IHtcbiAgLy8gaWYgKCFhbHJlYWR5V2FybmVkKSB7XG4gIC8vICAgYWxyZWFkeVdhcm5lZCA9IHRydWU7XG4gIC8vICAgTG9nZ2VyLndhcm4oXCJEb24ndCBsZWF2ZSBkZWJ1ZyBhc3NlcnRpb25zIG9uIGluIHB1YmxpYyBidWlsZHNcIik7XG4gIC8vIH1cblxuICBpZiAoIXRlc3QpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IobXNnIHx8ICdhc3NlcnRpb24gZmFpbHVyZScpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9kQXNzZXJ0KCkge31cblxuZXhwb3J0IGZ1bmN0aW9uIGRlcHJlY2F0ZShkZXNjOiBzdHJpbmcpIHtcbiAgTE9DQUxfTE9HR0VSLndhcm4oYERFUFJFQ0FUSU9OOiAke2Rlc2N9YCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlYnVnQXNzZXJ0O1xuIl0sInNvdXJjZVJvb3QiOiIifQ==