"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  LOCAL_LOGGER: true,
  LOGGER: true,
  assertNever: true,
  assert: true,
  deprecate: true,
  dict: true,
  isDict: true,
  isObject: true,
  Stack: true,
  isSerializationFirstNode: true,
  SERIALIZATION_FIRST_NODE_STRING: true,
  assign: true,
  fillNulls: true,
  values: true,
  _WeakSet: true,
  castToSimple: true,
  castToBrowser: true,
  checkNode: true,
  intern: true,
  buildUntouchableThis: true,
  debugToString: true,
  beginTestSteps: true,
  endTestSteps: true,
  logStep: true,
  verifySteps: true
};
exports.assertNever = assertNever;
Object.defineProperty(exports, "assert", {
  enumerable: true,
  get: function () {
    return _assert.default;
  }
});
Object.defineProperty(exports, "deprecate", {
  enumerable: true,
  get: function () {
    return _assert.deprecate;
  }
});
Object.defineProperty(exports, "dict", {
  enumerable: true,
  get: function () {
    return _collections.dict;
  }
});
Object.defineProperty(exports, "isDict", {
  enumerable: true,
  get: function () {
    return _collections.isDict;
  }
});
Object.defineProperty(exports, "isObject", {
  enumerable: true,
  get: function () {
    return _collections.isObject;
  }
});
Object.defineProperty(exports, "Stack", {
  enumerable: true,
  get: function () {
    return _collections.StackImpl;
  }
});
Object.defineProperty(exports, "isSerializationFirstNode", {
  enumerable: true,
  get: function () {
    return _isSerializationFirstNode.isSerializationFirstNode;
  }
});
Object.defineProperty(exports, "SERIALIZATION_FIRST_NODE_STRING", {
  enumerable: true,
  get: function () {
    return _isSerializationFirstNode.SERIALIZATION_FIRST_NODE_STRING;
  }
});
Object.defineProperty(exports, "assign", {
  enumerable: true,
  get: function () {
    return _objectUtils.assign;
  }
});
Object.defineProperty(exports, "fillNulls", {
  enumerable: true,
  get: function () {
    return _objectUtils.fillNulls;
  }
});
Object.defineProperty(exports, "values", {
  enumerable: true,
  get: function () {
    return _objectUtils.values;
  }
});
Object.defineProperty(exports, "_WeakSet", {
  enumerable: true,
  get: function () {
    return _weakSet.default;
  }
});
Object.defineProperty(exports, "castToSimple", {
  enumerable: true,
  get: function () {
    return _simpleCast.castToSimple;
  }
});
Object.defineProperty(exports, "castToBrowser", {
  enumerable: true,
  get: function () {
    return _simpleCast.castToBrowser;
  }
});
Object.defineProperty(exports, "checkNode", {
  enumerable: true,
  get: function () {
    return _simpleCast.checkNode;
  }
});
Object.defineProperty(exports, "intern", {
  enumerable: true,
  get: function () {
    return _intern.default;
  }
});
Object.defineProperty(exports, "buildUntouchableThis", {
  enumerable: true,
  get: function () {
    return _untouchableThis.default;
  }
});
Object.defineProperty(exports, "debugToString", {
  enumerable: true,
  get: function () {
    return _debugToString.default;
  }
});
Object.defineProperty(exports, "beginTestSteps", {
  enumerable: true,
  get: function () {
    return _debugSteps.beginTestSteps;
  }
});
Object.defineProperty(exports, "endTestSteps", {
  enumerable: true,
  get: function () {
    return _debugSteps.endTestSteps;
  }
});
Object.defineProperty(exports, "logStep", {
  enumerable: true,
  get: function () {
    return _debugSteps.logStep;
  }
});
Object.defineProperty(exports, "verifySteps", {
  enumerable: true,
  get: function () {
    return _debugSteps.verifySteps;
  }
});
exports.LOGGER = exports.LOCAL_LOGGER = void 0;

var _arrayUtils = require("./lib/array-utils");

Object.keys(_arrayUtils).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _arrayUtils[key];
    }
  });
});

var _assert = _interopRequireWildcard(require("./lib/assert"));

var _collections = require("./lib/collections");

var _dom = require("./lib/dom");

Object.keys(_dom).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _dom[key];
    }
  });
});

var _isSerializationFirstNode = require("./lib/is-serialization-first-node");

var _objectUtils = require("./lib/object-utils");

var _platformUtils = require("./lib/platform-utils");

Object.keys(_platformUtils).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _platformUtils[key];
    }
  });
});

var _string = require("./lib/string");

Object.keys(_string).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _string[key];
    }
  });
});

var _immediate = require("./lib/immediate");

Object.keys(_immediate).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _immediate[key];
    }
  });
});

var _template = require("./lib/template");

Object.keys(_template).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _template[key];
    }
  });
});

var _weakSet = _interopRequireDefault(require("./lib/weak-set"));

var _simpleCast = require("./lib/simple-cast");

var _present = require("./lib/present");

Object.keys(_present).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _present[key];
    }
  });
});

var _intern = _interopRequireDefault(require("./lib/intern"));

var _untouchableThis = _interopRequireDefault(require("./lib/untouchable-this"));

var _debugToString = _interopRequireDefault(require("./lib/debug-to-string"));

var _debugSteps = require("./lib/debug-steps");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * This constant exists to make it easier to differentiate normal logs from
 * errant console.logs. LOCAL_LOGGER should only be used inside a
 * LOCAL_SHOULD_LOG check.
 *
 * It does not alleviate the need to check LOCAL_SHOULD_LOG, which is used
 * for stripping.
 */
const LOCAL_LOGGER = console;
/**
 * This constant exists to make it easier to differentiate normal logs from
 * errant console.logs. LOGGER can be used outside of LOCAL_SHOULD_LOG checks,
 * and is meant to be used in the rare situation where a console.* call is
 * actually appropriate.
 */

exports.LOCAL_LOGGER = LOCAL_LOGGER;
const LOGGER = console;
exports.LOGGER = LOGGER;

function assertNever(value, desc = 'unexpected unreachable branch') {
  LOGGER.log('unreachable', value);
  LOGGER.log(`${desc} :: ${JSON.stringify(value)} (${value})`);
  throw new Error(`code reached unreachable`);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFDQTs7QUFJQTs7QUFDQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFDQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFDQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFDQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFJQTs7Ozs7Ozs7QUFRTyxNQUFNLFlBQVksR0FBbEIsT0FBQTtBQUVQOzs7Ozs7OztBQU1PLE1BQU0sTUFBTSxHQUFaLE9BQUE7OztBQUVELFNBQUEsV0FBQSxDQUFBLEtBQUEsRUFBb0MsSUFBSSxHQUF4QywrQkFBQSxFQUEwRTtBQUM5RSxFQUFBLE1BQU0sQ0FBTixHQUFBLENBQUEsYUFBQSxFQUFBLEtBQUE7QUFDQSxFQUFBLE1BQU0sQ0FBTixHQUFBLENBQVcsR0FBRyxJQUFJLE9BQU8sSUFBSSxDQUFKLFNBQUEsQ0FBQSxLQUFBLENBQXFCLEtBQUssS0FBbkQsR0FBQTtBQUVBLFFBQU0sSUFBQSxLQUFBLENBQU4sMEJBQU0sQ0FBTjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0ICogZnJvbSAnLi9saWIvYXJyYXktdXRpbHMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBhc3NlcnQsIGRlcHJlY2F0ZSB9IGZyb20gJy4vbGliL2Fzc2VydCc7XG5leHBvcnQgeyBkaWN0LCBpc0RpY3QsIGlzT2JqZWN0LCBTdGFja0ltcGwgYXMgU3RhY2sgfSBmcm9tICcuL2xpYi9jb2xsZWN0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9kb20nO1xuZXhwb3J0IHtcbiAgaXNTZXJpYWxpemF0aW9uRmlyc3ROb2RlLFxuICBTRVJJQUxJWkFUSU9OX0ZJUlNUX05PREVfU1RSSU5HLFxufSBmcm9tICcuL2xpYi9pcy1zZXJpYWxpemF0aW9uLWZpcnN0LW5vZGUnO1xuZXhwb3J0IHsgYXNzaWduLCBmaWxsTnVsbHMsIHZhbHVlcyB9IGZyb20gJy4vbGliL29iamVjdC11dGlscyc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9wbGF0Zm9ybS11dGlscyc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9zdHJpbmcnO1xuZXhwb3J0ICogZnJvbSAnLi9saWIvaW1tZWRpYXRlJztcbmV4cG9ydCAqIGZyb20gJy4vbGliL3RlbXBsYXRlJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgX1dlYWtTZXQgfSBmcm9tICcuL2xpYi93ZWFrLXNldCc7XG5leHBvcnQgeyBjYXN0VG9TaW1wbGUsIGNhc3RUb0Jyb3dzZXIsIGNoZWNrTm9kZSB9IGZyb20gJy4vbGliL3NpbXBsZS1jYXN0JztcbmV4cG9ydCAqIGZyb20gJy4vbGliL3ByZXNlbnQnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBpbnRlcm4gfSBmcm9tICcuL2xpYi9pbnRlcm4nO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIGJ1aWxkVW50b3VjaGFibGVUaGlzIH0gZnJvbSAnLi9saWIvdW50b3VjaGFibGUtdGhpcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGRlYnVnVG9TdHJpbmcgfSBmcm9tICcuL2xpYi9kZWJ1Zy10by1zdHJpbmcnO1xuZXhwb3J0IHsgYmVnaW5UZXN0U3RlcHMsIGVuZFRlc3RTdGVwcywgbG9nU3RlcCwgdmVyaWZ5U3RlcHMgfSBmcm9tICcuL2xpYi9kZWJ1Zy1zdGVwcyc7XG5cbmV4cG9ydCB0eXBlIEZJWE1FPFQsIFMgZXh0ZW5kcyBzdHJpbmc+ID0gKFQgJiBTKSB8IFQ7XG5cbi8qKlxuICogVGhpcyBjb25zdGFudCBleGlzdHMgdG8gbWFrZSBpdCBlYXNpZXIgdG8gZGlmZmVyZW50aWF0ZSBub3JtYWwgbG9ncyBmcm9tXG4gKiBlcnJhbnQgY29uc29sZS5sb2dzLiBMT0NBTF9MT0dHRVIgc2hvdWxkIG9ubHkgYmUgdXNlZCBpbnNpZGUgYVxuICogTE9DQUxfU0hPVUxEX0xPRyBjaGVjay5cbiAqXG4gKiBJdCBkb2VzIG5vdCBhbGxldmlhdGUgdGhlIG5lZWQgdG8gY2hlY2sgTE9DQUxfU0hPVUxEX0xPRywgd2hpY2ggaXMgdXNlZFxuICogZm9yIHN0cmlwcGluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IExPQ0FMX0xPR0dFUiA9IGNvbnNvbGU7XG5cbi8qKlxuICogVGhpcyBjb25zdGFudCBleGlzdHMgdG8gbWFrZSBpdCBlYXNpZXIgdG8gZGlmZmVyZW50aWF0ZSBub3JtYWwgbG9ncyBmcm9tXG4gKiBlcnJhbnQgY29uc29sZS5sb2dzLiBMT0dHRVIgY2FuIGJlIHVzZWQgb3V0c2lkZSBvZiBMT0NBTF9TSE9VTERfTE9HIGNoZWNrcyxcbiAqIGFuZCBpcyBtZWFudCB0byBiZSB1c2VkIGluIHRoZSByYXJlIHNpdHVhdGlvbiB3aGVyZSBhIGNvbnNvbGUuKiBjYWxsIGlzXG4gKiBhY3R1YWxseSBhcHByb3ByaWF0ZS5cbiAqL1xuZXhwb3J0IGNvbnN0IExPR0dFUiA9IGNvbnNvbGU7XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROZXZlcih2YWx1ZTogbmV2ZXIsIGRlc2MgPSAndW5leHBlY3RlZCB1bnJlYWNoYWJsZSBicmFuY2gnKTogbmV2ZXIge1xuICBMT0dHRVIubG9nKCd1bnJlYWNoYWJsZScsIHZhbHVlKTtcbiAgTE9HR0VSLmxvZyhgJHtkZXNjfSA6OiAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX0gKCR7dmFsdWV9KWApO1xuXG4gIHRocm93IG5ldyBFcnJvcihgY29kZSByZWFjaGVkIHVucmVhY2hhYmxlYCk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9