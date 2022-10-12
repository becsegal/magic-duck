"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _env = require("@glimmer/env");

let debugToString;

if (_env.DEBUG) {
  let getFunctionName = fn => {
    let functionName = fn.name;

    if (functionName === undefined) {
      let match = Function.prototype.toString.call(fn).match(/function (\w+)\s*\(/);
      functionName = match && match[1] || '';
    }

    return functionName.replace(/^bound /, '');
  };

  let getObjectName = obj => {
    let name;
    let className;

    if (obj.constructor && typeof obj.constructor === 'function') {
      className = getFunctionName(obj.constructor);
    }

    if ('toString' in obj && obj.toString !== Object.prototype.toString && obj.toString !== Function.prototype.toString) {
      name = obj.toString();
    } // If the class has a decent looking name, and the `toString` is one of the
    // default Ember toStrings, replace the constructor portion of the toString
    // with the class name. We check the length of the class name to prevent doing
    // this when the value is minified.


    if (name && name.match(/<.*:ember\d+>/) && className && className[0] !== '_' && className.length > 2 && className !== 'Class') {
      return name.replace(/<.*:/, `<${className}:`);
    }

    return name || className;
  };

  let getPrimitiveName = value => {
    return String(value);
  };

  debugToString = value => {
    if (typeof value === 'function') {
      return getFunctionName(value) || `(unknown function)`;
    } else if (typeof value === 'object' && value !== null) {
      return getObjectName(value) || `(unknown object)`;
    } else {
      return getPrimitiveName(value);
    }
  };
}

var _default = debugToString;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2RlYnVnLXRvLXN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRUEsSUFBQSxhQUFBOztBQUVBLElBQUEsVUFBQSxFQUFXO0FBQ1QsTUFBSSxlQUFlLEdBQUksRUFBRCxJQUFpQjtBQUNyQyxRQUFJLFlBQVksR0FBRyxFQUFFLENBQXJCLElBQUE7O0FBRUEsUUFBSSxZQUFZLEtBQWhCLFNBQUEsRUFBZ0M7QUFDOUIsVUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFSLFNBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsRUFBQSxLQUFBLENBQVoscUJBQVksQ0FBWjtBQUVBLE1BQUEsWUFBWSxHQUFJLEtBQUssSUFBSSxLQUFLLENBQWYsQ0FBZSxDQUFkLElBQWhCLEVBQUE7QUFDRDs7QUFFRCxXQUFPLFlBQVksQ0FBWixPQUFBLENBQUEsU0FBQSxFQUFQLEVBQU8sQ0FBUDtBQVRGLEdBQUE7O0FBWUEsTUFBSSxhQUFhLEdBQUksR0FBRCxJQUFnQjtBQUNsQyxRQUFBLElBQUE7QUFDQSxRQUFBLFNBQUE7O0FBRUEsUUFBSSxHQUFHLENBQUgsV0FBQSxJQUFtQixPQUFPLEdBQUcsQ0FBVixXQUFBLEtBQXZCLFVBQUEsRUFBOEQ7QUFDNUQsTUFBQSxTQUFTLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBL0IsV0FBMkIsQ0FBM0I7QUFDRDs7QUFFRCxRQUNFLGNBQUEsR0FBQSxJQUNBLEdBQUcsQ0FBSCxRQUFBLEtBQWlCLE1BQU0sQ0FBTixTQUFBLENBRGpCLFFBQUEsSUFFQSxHQUFHLENBQUgsUUFBQSxLQUFpQixRQUFRLENBQVIsU0FBQSxDQUhuQixRQUFBLEVBSUU7QUFDQSxNQUFBLElBQUksR0FBRyxHQUFHLENBQVYsUUFBTyxFQUFQO0FBYmdDLEtBQUEsQ0FnQmxDO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQSxRQUNFLElBQUksSUFDSixJQUFJLENBQUosS0FBQSxDQURBLGVBQ0EsQ0FEQSxJQUFBLFNBQUEsSUFHQSxTQUFTLENBQVQsQ0FBUyxDQUFULEtBSEEsR0FBQSxJQUlBLFNBQVMsQ0FBVCxNQUFBLEdBSkEsQ0FBQSxJQUtBLFNBQVMsS0FOWCxPQUFBLEVBT0U7QUFDQSxhQUFPLElBQUksQ0FBSixPQUFBLENBQUEsTUFBQSxFQUFxQixJQUFJLFNBQWhDLEdBQU8sQ0FBUDtBQUNEOztBQUVELFdBQU8sSUFBSSxJQUFYLFNBQUE7QUEvQkYsR0FBQTs7QUFrQ0EsTUFBSSxnQkFBZ0IsR0FBSSxLQUFELElBQWU7QUFDcEMsV0FBTyxNQUFNLENBQWIsS0FBYSxDQUFiO0FBREYsR0FBQTs7QUFJQSxFQUFBLGFBQWEsR0FBSSxLQUFELElBQW1CO0FBQ2pDLFFBQUksT0FBQSxLQUFBLEtBQUosVUFBQSxFQUFpQztBQUMvQixhQUFPLGVBQWUsQ0FBZixLQUFlLENBQWYsSUFBUCxvQkFBQTtBQURGLEtBQUEsTUFFTyxJQUFJLE9BQUEsS0FBQSxLQUFBLFFBQUEsSUFBNkIsS0FBSyxLQUF0QyxJQUFBLEVBQWlEO0FBQ3RELGFBQU8sYUFBYSxDQUFiLEtBQWEsQ0FBYixJQUFQLGtCQUFBO0FBREssS0FBQSxNQUVBO0FBQ0wsYUFBTyxnQkFBZ0IsQ0FBdkIsS0FBdUIsQ0FBdkI7QUFDRDtBQVBILEdBQUE7QUFTRDs7ZUFFRCxhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgREVCVUcgfSBmcm9tICdAZ2xpbW1lci9lbnYnO1xuXG5sZXQgZGVidWdUb1N0cmluZzogdW5kZWZpbmVkIHwgKCh2YWx1ZTogdW5rbm93bikgPT4gc3RyaW5nKTtcblxuaWYgKERFQlVHKSB7XG4gIGxldCBnZXRGdW5jdGlvbk5hbWUgPSAoZm46IEZ1bmN0aW9uKSA9PiB7XG4gICAgbGV0IGZ1bmN0aW9uTmFtZSA9IGZuLm5hbWU7XG5cbiAgICBpZiAoZnVuY3Rpb25OYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGxldCBtYXRjaCA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGZuKS5tYXRjaCgvZnVuY3Rpb24gKFxcdyspXFxzKlxcKC8pO1xuXG4gICAgICBmdW5jdGlvbk5hbWUgPSAobWF0Y2ggJiYgbWF0Y2hbMV0pIHx8ICcnO1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbk5hbWUucmVwbGFjZSgvXmJvdW5kIC8sICcnKTtcbiAgfTtcblxuICBsZXQgZ2V0T2JqZWN0TmFtZSA9IChvYmo6IG9iamVjdCkgPT4ge1xuICAgIGxldCBuYW1lO1xuICAgIGxldCBjbGFzc05hbWU7XG5cbiAgICBpZiAob2JqLmNvbnN0cnVjdG9yICYmIHR5cGVvZiBvYmouY29uc3RydWN0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNsYXNzTmFtZSA9IGdldEZ1bmN0aW9uTmFtZShvYmouY29uc3RydWN0b3IpO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgICd0b1N0cmluZycgaW4gb2JqICYmXG4gICAgICBvYmoudG9TdHJpbmcgIT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcgJiZcbiAgICAgIG9iai50b1N0cmluZyAhPT0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nXG4gICAgKSB7XG4gICAgICBuYW1lID0gb2JqLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGNsYXNzIGhhcyBhIGRlY2VudCBsb29raW5nIG5hbWUsIGFuZCB0aGUgYHRvU3RyaW5nYCBpcyBvbmUgb2YgdGhlXG4gICAgLy8gZGVmYXVsdCBFbWJlciB0b1N0cmluZ3MsIHJlcGxhY2UgdGhlIGNvbnN0cnVjdG9yIHBvcnRpb24gb2YgdGhlIHRvU3RyaW5nXG4gICAgLy8gd2l0aCB0aGUgY2xhc3MgbmFtZS4gV2UgY2hlY2sgdGhlIGxlbmd0aCBvZiB0aGUgY2xhc3MgbmFtZSB0byBwcmV2ZW50IGRvaW5nXG4gICAgLy8gdGhpcyB3aGVuIHRoZSB2YWx1ZSBpcyBtaW5pZmllZC5cbiAgICBpZiAoXG4gICAgICBuYW1lICYmXG4gICAgICBuYW1lLm1hdGNoKC88Lio6ZW1iZXJcXGQrPi8pICYmXG4gICAgICBjbGFzc05hbWUgJiZcbiAgICAgIGNsYXNzTmFtZVswXSAhPT0gJ18nICYmXG4gICAgICBjbGFzc05hbWUubGVuZ3RoID4gMiAmJlxuICAgICAgY2xhc3NOYW1lICE9PSAnQ2xhc3MnXG4gICAgKSB7XG4gICAgICByZXR1cm4gbmFtZS5yZXBsYWNlKC88Lio6LywgYDwke2NsYXNzTmFtZX06YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5hbWUgfHwgY2xhc3NOYW1lO1xuICB9O1xuXG4gIGxldCBnZXRQcmltaXRpdmVOYW1lID0gKHZhbHVlOiBhbnkpID0+IHtcbiAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbiAgfTtcblxuICBkZWJ1Z1RvU3RyaW5nID0gKHZhbHVlOiB1bmtub3duKSA9PiB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGdldEZ1bmN0aW9uTmFtZSh2YWx1ZSkgfHwgYCh1bmtub3duIGZ1bmN0aW9uKWA7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZ2V0T2JqZWN0TmFtZSh2YWx1ZSkgfHwgYCh1bmtub3duIG9iamVjdClgO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZ2V0UHJpbWl0aXZlTmFtZSh2YWx1ZSk7XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWJ1Z1RvU3RyaW5nO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==