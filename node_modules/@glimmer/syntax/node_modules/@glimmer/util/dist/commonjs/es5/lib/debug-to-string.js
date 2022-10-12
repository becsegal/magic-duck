"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _env = require("@glimmer/env");

var debugToString;

if (_env.DEBUG) {
  var getFunctionName = function getFunctionName(fn) {
    var functionName = fn.name;

    if (functionName === undefined) {
      var match = Function.prototype.toString.call(fn).match(/function (\w+)\s*\(/);
      functionName = match && match[1] || '';
    }

    return functionName.replace(/^bound /, '');
  };

  var getObjectName = function getObjectName(obj) {
    var name;
    var className;

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
      return name.replace(/<.*:/, "<" + className + ":");
    }

    return name || className;
  };

  var getPrimitiveName = function getPrimitiveName(value) {
    return String(value);
  };

  debugToString = function debugToString(value) {
    if (typeof value === 'function') {
      return getFunctionName(value) || "(unknown function)";
    } else if (typeof value === 'object' && value !== null) {
      return getObjectName(value) || "(unknown object)";
    } else {
      return getPrimitiveName(value);
    }
  };
}

var _default = debugToString;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2RlYnVnLXRvLXN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRUEsSUFBQSxhQUFBOztBQUVBLElBQUEsVUFBQSxFQUFXO0FBQ1QsTUFBSSxlQUFlLEdBQUksU0FBbkIsZUFBbUIsQ0FBRCxFQUFDLEVBQWdCO0FBQ3JDLFFBQUksWUFBWSxHQUFHLEVBQUUsQ0FBckIsSUFBQTs7QUFFQSxRQUFJLFlBQVksS0FBaEIsU0FBQSxFQUFnQztBQUM5QixVQUFJLEtBQUssR0FBRyxRQUFRLENBQVIsU0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxFQUFBLEtBQUEsQ0FBWixxQkFBWSxDQUFaO0FBRUEsTUFBQSxZQUFZLEdBQUksS0FBSyxJQUFJLEtBQUssQ0FBZixDQUFlLENBQWQsSUFBaEIsRUFBQTtBQUNEOztBQUVELFdBQU8sWUFBWSxDQUFaLE9BQUEsQ0FBQSxTQUFBLEVBQVAsRUFBTyxDQUFQO0FBVEYsR0FBQTs7QUFZQSxNQUFJLGFBQWEsR0FBSSxTQUFqQixhQUFpQixDQUFELEdBQUMsRUFBZTtBQUNsQyxRQUFBLElBQUE7QUFDQSxRQUFBLFNBQUE7O0FBRUEsUUFBSSxHQUFHLENBQUgsV0FBQSxJQUFtQixPQUFPLEdBQUcsQ0FBVixXQUFBLEtBQXZCLFVBQUEsRUFBOEQ7QUFDNUQsTUFBQSxTQUFTLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBL0IsV0FBMkIsQ0FBM0I7QUFDRDs7QUFFRCxRQUNFLGNBQUEsR0FBQSxJQUNBLEdBQUcsQ0FBSCxRQUFBLEtBQWlCLE1BQU0sQ0FBTixTQUFBLENBRGpCLFFBQUEsSUFFQSxHQUFHLENBQUgsUUFBQSxLQUFpQixRQUFRLENBQVIsU0FBQSxDQUhuQixRQUFBLEVBSUU7QUFDQSxNQUFBLElBQUksR0FBRyxHQUFHLENBQVYsUUFBTyxFQUFQO0FBYmdDLEtBQUEsQ0FnQmxDO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQSxRQUNFLElBQUksSUFDSixJQUFJLENBQUosS0FBQSxDQURBLGVBQ0EsQ0FEQSxJQUFBLFNBQUEsSUFHQSxTQUFTLENBQVQsQ0FBUyxDQUFULEtBSEEsR0FBQSxJQUlBLFNBQVMsQ0FBVCxNQUFBLEdBSkEsQ0FBQSxJQUtBLFNBQVMsS0FOWCxPQUFBLEVBT0U7QUFDQSxhQUFPLElBQUksQ0FBSixPQUFBLENBQUEsTUFBQSxFQUFBLE1BQVAsU0FBTyxHQUFQLEdBQU8sQ0FBUDtBQUNEOztBQUVELFdBQU8sSUFBSSxJQUFYLFNBQUE7QUEvQkYsR0FBQTs7QUFrQ0EsTUFBSSxnQkFBZ0IsR0FBSSxTQUFwQixnQkFBb0IsQ0FBRCxLQUFDLEVBQWM7QUFDcEMsV0FBTyxNQUFNLENBQWIsS0FBYSxDQUFiO0FBREYsR0FBQTs7QUFJQSxFQUFBLGFBQWEsR0FBSSxTQUFBLGFBQUEsQ0FBRCxLQUFDLEVBQWtCO0FBQ2pDLFFBQUksT0FBQSxLQUFBLEtBQUosVUFBQSxFQUFpQztBQUMvQixhQUFPLGVBQWUsQ0FBdEIsS0FBc0IsQ0FBZixJQUFQLG9CQUFBO0FBREYsS0FBQSxNQUVPLElBQUksT0FBQSxLQUFBLEtBQUEsUUFBQSxJQUE2QixLQUFLLEtBQXRDLElBQUEsRUFBaUQ7QUFDdEQsYUFBTyxhQUFhLENBQXBCLEtBQW9CLENBQWIsSUFBUCxrQkFBQTtBQURLLEtBQUEsTUFFQTtBQUNMLGFBQU8sZ0JBQWdCLENBQXZCLEtBQXVCLENBQXZCO0FBQ0Q7QUFQSCxHQUFBO0FBU0Q7O2VBRUQsYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERFQlVHIH0gZnJvbSAnQGdsaW1tZXIvZW52JztcblxubGV0IGRlYnVnVG9TdHJpbmc6IHVuZGVmaW5lZCB8ICgodmFsdWU6IHVua25vd24pID0+IHN0cmluZyk7XG5cbmlmIChERUJVRykge1xuICBsZXQgZ2V0RnVuY3Rpb25OYW1lID0gKGZuOiBGdW5jdGlvbikgPT4ge1xuICAgIGxldCBmdW5jdGlvbk5hbWUgPSBmbi5uYW1lO1xuXG4gICAgaWYgKGZ1bmN0aW9uTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBsZXQgbWF0Y2ggPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChmbikubWF0Y2goL2Z1bmN0aW9uIChcXHcrKVxccypcXCgvKTtcblxuICAgICAgZnVuY3Rpb25OYW1lID0gKG1hdGNoICYmIG1hdGNoWzFdKSB8fCAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb25OYW1lLnJlcGxhY2UoL15ib3VuZCAvLCAnJyk7XG4gIH07XG5cbiAgbGV0IGdldE9iamVjdE5hbWUgPSAob2JqOiBvYmplY3QpID0+IHtcbiAgICBsZXQgbmFtZTtcbiAgICBsZXQgY2xhc3NOYW1lO1xuXG4gICAgaWYgKG9iai5jb25zdHJ1Y3RvciAmJiB0eXBlb2Ygb2JqLmNvbnN0cnVjdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjbGFzc05hbWUgPSBnZXRGdW5jdGlvbk5hbWUob2JqLmNvbnN0cnVjdG9yKTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICAndG9TdHJpbmcnIGluIG9iaiAmJlxuICAgICAgb2JqLnRvU3RyaW5nICE9PSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nICYmXG4gICAgICBvYmoudG9TdHJpbmcgIT09IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZ1xuICAgICkge1xuICAgICAgbmFtZSA9IG9iai50b1N0cmluZygpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBjbGFzcyBoYXMgYSBkZWNlbnQgbG9va2luZyBuYW1lLCBhbmQgdGhlIGB0b1N0cmluZ2AgaXMgb25lIG9mIHRoZVxuICAgIC8vIGRlZmF1bHQgRW1iZXIgdG9TdHJpbmdzLCByZXBsYWNlIHRoZSBjb25zdHJ1Y3RvciBwb3J0aW9uIG9mIHRoZSB0b1N0cmluZ1xuICAgIC8vIHdpdGggdGhlIGNsYXNzIG5hbWUuIFdlIGNoZWNrIHRoZSBsZW5ndGggb2YgdGhlIGNsYXNzIG5hbWUgdG8gcHJldmVudCBkb2luZ1xuICAgIC8vIHRoaXMgd2hlbiB0aGUgdmFsdWUgaXMgbWluaWZpZWQuXG4gICAgaWYgKFxuICAgICAgbmFtZSAmJlxuICAgICAgbmFtZS5tYXRjaCgvPC4qOmVtYmVyXFxkKz4vKSAmJlxuICAgICAgY2xhc3NOYW1lICYmXG4gICAgICBjbGFzc05hbWVbMF0gIT09ICdfJyAmJlxuICAgICAgY2xhc3NOYW1lLmxlbmd0aCA+IDIgJiZcbiAgICAgIGNsYXNzTmFtZSAhPT0gJ0NsYXNzJ1xuICAgICkge1xuICAgICAgcmV0dXJuIG5hbWUucmVwbGFjZSgvPC4qOi8sIGA8JHtjbGFzc05hbWV9OmApO1xuICAgIH1cblxuICAgIHJldHVybiBuYW1lIHx8IGNsYXNzTmFtZTtcbiAgfTtcblxuICBsZXQgZ2V0UHJpbWl0aXZlTmFtZSA9ICh2YWx1ZTogYW55KSA9PiB7XG4gICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG4gIH07XG5cbiAgZGVidWdUb1N0cmluZyA9ICh2YWx1ZTogdW5rbm93bikgPT4ge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBnZXRGdW5jdGlvbk5hbWUodmFsdWUpIHx8IGAodW5rbm93biBmdW5jdGlvbilgO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGdldE9iamVjdE5hbWUodmFsdWUpIHx8IGAodW5rbm93biBvYmplY3QpYDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGdldFByaW1pdGl2ZU5hbWUodmFsdWUpO1xuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVidWdUb1N0cmluZztcbiJdLCJzb3VyY2VSb290IjoiIn0=