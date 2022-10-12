"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildUntouchableThis;

var _env = require("@glimmer/env");

var _platformUtils = require("./platform-utils");

function buildUntouchableThis(source) {
  var context = null;

  if (_env.DEBUG && _platformUtils.HAS_NATIVE_PROXY) {
    var assertOnProperty = function assertOnProperty(property) {
      throw new Error("You accessed `this." + String(property) + "` from a function passed to the " + source + ", but the function itself was not bound to a valid `this` context. Consider updating to use a bound function (for instance, use an arrow function, `() => {}`).");
    };

    context = new Proxy({}, {
      get: function get(_target, property) {
        assertOnProperty(property);
      },
      set: function set(_target, property) {
        assertOnProperty(property);
        return false;
      },
      has: function has(_target, property) {
        assertOnProperty(property);
        return false;
      }
    });
  }

  return context;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL3VudG91Y2hhYmxlLXRoaXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUVjLFNBQUEsb0JBQUEsQ0FBQSxNQUFBLEVBQTZDO0FBQ3pELE1BQUksT0FBTyxHQUFYLElBQUE7O0FBQ0EsTUFBSSxjQUFKLCtCQUFBLEVBQStCO0FBQzdCLFFBQUksZ0JBQWdCLEdBQUksU0FBcEIsZ0JBQW9CLENBQUQsUUFBQyxFQUFzQztBQUM1RCxZQUFNLElBQUEsS0FBQSxDQUFBLHdCQUNtQixNQUFNLENBRHpCLFFBQ3lCLENBRHpCLEdBQUEsa0NBQUEsR0FBTixNQUFNLEdBQU4saUtBQU0sQ0FBTjtBQURGLEtBQUE7O0FBUUEsSUFBQSxPQUFPLEdBQUcsSUFBQSxLQUFBLENBQUEsRUFBQSxFQUVSO0FBQ0UsTUFBQSxHQURGLEVBQUEsU0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBLFFBQUEsRUFDNEM7QUFDeEMsUUFBQSxnQkFBZ0IsQ0FBaEIsUUFBZ0IsQ0FBaEI7QUFGSixPQUFBO0FBS0UsTUFBQSxHQUxGLEVBQUEsU0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBLFFBQUEsRUFLNEM7QUFDeEMsUUFBQSxnQkFBZ0IsQ0FBaEIsUUFBZ0IsQ0FBaEI7QUFFQSxlQUFBLEtBQUE7QUFSSixPQUFBO0FBV0UsTUFBQSxHQVhGLEVBQUEsU0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBLFFBQUEsRUFXNEM7QUFDeEMsUUFBQSxnQkFBZ0IsQ0FBaEIsUUFBZ0IsQ0FBaEI7QUFFQSxlQUFBLEtBQUE7QUFDRDtBQWZILEtBRlEsQ0FBVjtBQW9CRDs7QUFFRCxTQUFBLE9BQUE7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERFQlVHIH0gZnJvbSAnQGdsaW1tZXIvZW52JztcbmltcG9ydCB7IEhBU19OQVRJVkVfUFJPWFkgfSBmcm9tICcuL3BsYXRmb3JtLXV0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYnVpbGRVbnRvdWNoYWJsZVRoaXMoc291cmNlOiBzdHJpbmcpOiBudWxsIHwgb2JqZWN0IHtcbiAgbGV0IGNvbnRleHQ6IG51bGwgfCBvYmplY3QgPSBudWxsO1xuICBpZiAoREVCVUcgJiYgSEFTX05BVElWRV9QUk9YWSkge1xuICAgIGxldCBhc3NlcnRPblByb3BlcnR5ID0gKHByb3BlcnR5OiBzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2wpID0+IHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFlvdSBhY2Nlc3NlZCBcXGB0aGlzLiR7U3RyaW5nKFxuICAgICAgICAgIHByb3BlcnR5XG4gICAgICAgICl9XFxgIGZyb20gYSBmdW5jdGlvbiBwYXNzZWQgdG8gdGhlICR7c291cmNlfSwgYnV0IHRoZSBmdW5jdGlvbiBpdHNlbGYgd2FzIG5vdCBib3VuZCB0byBhIHZhbGlkIFxcYHRoaXNcXGAgY29udGV4dC4gQ29uc2lkZXIgdXBkYXRpbmcgdG8gdXNlIGEgYm91bmQgZnVuY3Rpb24gKGZvciBpbnN0YW5jZSwgdXNlIGFuIGFycm93IGZ1bmN0aW9uLCBcXGAoKSA9PiB7fVxcYCkuYFxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgY29udGV4dCA9IG5ldyBQcm94eShcbiAgICAgIHt9LFxuICAgICAge1xuICAgICAgICBnZXQoX3RhcmdldDoge30sIHByb3BlcnR5OiBzdHJpbmcgfCBzeW1ib2wpIHtcbiAgICAgICAgICBhc3NlcnRPblByb3BlcnR5KHByb3BlcnR5KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXQoX3RhcmdldDoge30sIHByb3BlcnR5OiBzdHJpbmcgfCBzeW1ib2wpIHtcbiAgICAgICAgICBhc3NlcnRPblByb3BlcnR5KHByb3BlcnR5KTtcblxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBoYXMoX3RhcmdldDoge30sIHByb3BlcnR5OiBzdHJpbmcgfCBzeW1ib2wpIHtcbiAgICAgICAgICBhc3NlcnRPblByb3BlcnR5KHByb3BlcnR5KTtcblxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIGNvbnRleHQ7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9