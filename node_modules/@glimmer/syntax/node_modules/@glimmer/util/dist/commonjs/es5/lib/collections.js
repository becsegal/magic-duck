"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dict = dict;
exports.isDict = isDict;
exports.isObject = isObject;
exports.StackImpl = void 0;

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function dict() {
  return Object.create(null);
}

function isDict(u) {
  return u !== null && u !== undefined;
}

function isObject(u) {
  return typeof u === 'function' || typeof u === 'object' && u !== null;
}

var StackImpl = /*#__PURE__*/function () {
  function StackImpl(values) {
    if (values === void 0) {
      values = [];
    }

    this.current = null;
    this.stack = values;
  }

  var _proto = StackImpl.prototype;

  _proto.push = function push(item) {
    this.current = item;
    this.stack.push(item);
  };

  _proto.pop = function pop() {
    var item = this.stack.pop();
    var len = this.stack.length;
    this.current = len === 0 ? null : this.stack[len - 1];
    return item === undefined ? null : item;
  };

  _proto.nth = function nth(from) {
    var len = this.stack.length;
    return len < from ? null : this.stack[len - from];
  };

  _proto.isEmpty = function isEmpty() {
    return this.stack.length === 0;
  };

  _proto.toArray = function toArray() {
    return this.stack;
  };

  _createClass(StackImpl, [{
    key: "size",
    get: function get() {
      return this.stack.length;
    }
  }]);

  return StackImpl;
}();

exports.StackImpl = StackImpl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2NvbGxlY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRU0sU0FBQSxJQUFBLEdBQWM7QUFDbEIsU0FBTyxNQUFNLENBQU4sTUFBQSxDQUFQLElBQU8sQ0FBUDtBQUNEOztBQUVLLFNBQUEsTUFBQSxDQUFBLENBQUEsRUFBd0I7QUFDNUIsU0FBTyxDQUFDLEtBQUQsSUFBQSxJQUFjLENBQUMsS0FBdEIsU0FBQTtBQUNEOztBQUVLLFNBQUEsUUFBQSxDQUFBLENBQUEsRUFBMEI7QUFDOUIsU0FBTyxPQUFBLENBQUEsS0FBQSxVQUFBLElBQTRCLE9BQUEsQ0FBQSxLQUFBLFFBQUEsSUFBeUIsQ0FBQyxLQUE3RCxJQUFBO0FBQ0Q7O0FBRUQsSUFBTSxTQUFOLEdBQUEsYUFBQSxZQUFBO0FBSUUsV0FBQSxTQUFBLENBQUEsTUFBQSxFQUE0QjtBQUFBLFFBQWhCLE1BQWdCLEtBQUEsS0FBQSxDQUFBLEVBQUE7QUFBaEIsTUFBQSxNQUFnQixHQUE1QixFQUFZO0FBQWdCOztBQUZyQixTQUFBLE9BQUEsR0FBQSxJQUFBO0FBR0wsU0FBQSxLQUFBLEdBQUEsTUFBQTtBQUNEOztBQU5ILE1BQUEsTUFBQSxHQUFBLFNBQUEsQ0FBQSxTQUFBOztBQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsR0FZRSxTQUFBLElBQUEsQ0FBQSxJQUFBLEVBQVk7QUFDVixTQUFBLE9BQUEsR0FBQSxJQUFBO0FBQ0EsU0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLElBQUE7QUFkSixHQUFBOztBQUFBLEVBQUEsTUFBQSxDQUFBLEdBQUEsR0FpQkUsU0FBQSxHQUFBLEdBQUc7QUFDRCxRQUFJLElBQUksR0FBRyxLQUFBLEtBQUEsQ0FBWCxHQUFXLEVBQVg7QUFDQSxRQUFJLEdBQUcsR0FBRyxLQUFBLEtBQUEsQ0FBVixNQUFBO0FBQ0EsU0FBQSxPQUFBLEdBQWUsR0FBRyxLQUFILENBQUEsR0FBQSxJQUFBLEdBQW1CLEtBQUEsS0FBQSxDQUFXLEdBQUcsR0FBaEQsQ0FBa0MsQ0FBbEM7QUFFQSxXQUFPLElBQUksS0FBSixTQUFBLEdBQUEsSUFBQSxHQUFQLElBQUE7QUF0QkosR0FBQTs7QUFBQSxFQUFBLE1BQUEsQ0FBQSxHQUFBLEdBeUJFLFNBQUEsR0FBQSxDQUFBLElBQUEsRUFBZ0I7QUFDZCxRQUFJLEdBQUcsR0FBRyxLQUFBLEtBQUEsQ0FBVixNQUFBO0FBQ0EsV0FBTyxHQUFHLEdBQUgsSUFBQSxHQUFBLElBQUEsR0FBb0IsS0FBQSxLQUFBLENBQVcsR0FBRyxHQUF6QyxJQUEyQixDQUEzQjtBQTNCSixHQUFBOztBQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsR0E4QkUsU0FBQSxPQUFBLEdBQU87QUFDTCxXQUFPLEtBQUEsS0FBQSxDQUFBLE1BQUEsS0FBUCxDQUFBO0FBL0JKLEdBQUE7O0FBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxHQWtDRSxTQUFBLE9BQUEsR0FBTztBQUNMLFdBQU8sS0FBUCxLQUFBO0FBbkNKLEdBQUE7O0FBQUEsRUFBQSxZQUFBLENBQUEsU0FBQSxFQUFBLENBQUE7QUFBQSxJQUFBLEdBQUEsRUFBQSxNQUFBO0FBQUEsSUFBQSxHQUFBLEVBQUEsU0FBQSxHQUFBLEdBUWlCO0FBQ2IsYUFBTyxLQUFBLEtBQUEsQ0FBUCxNQUFBO0FBQ0Q7QUFWSCxHQUFBLENBQUEsQ0FBQTs7QUFBQSxTQUFBLFNBQUE7QUFBQSxDQUFBLEVBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaWN0LCBPcHRpb24sIFN0YWNrIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWN0PFQgPSB1bmtub3duPigpOiBEaWN0PFQ+IHtcbiAgcmV0dXJuIE9iamVjdC5jcmVhdGUobnVsbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RpY3Q8VD4odTogVCk6IHUgaXMgRGljdCAmIFQge1xuICByZXR1cm4gdSAhPT0gbnVsbCAmJiB1ICE9PSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdDxUPih1OiBUKTogdSBpcyBvYmplY3QgJiBUIHtcbiAgcmV0dXJuIHR5cGVvZiB1ID09PSAnZnVuY3Rpb24nIHx8ICh0eXBlb2YgdSA9PT0gJ29iamVjdCcgJiYgdSAhPT0gbnVsbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBTdGFja0ltcGw8VD4gaW1wbGVtZW50cyBTdGFjazxUPiB7XG4gIHByaXZhdGUgc3RhY2s6IFRbXTtcbiAgcHVibGljIGN1cnJlbnQ6IE9wdGlvbjxUPiA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IodmFsdWVzOiBUW10gPSBbXSkge1xuICAgIHRoaXMuc3RhY2sgPSB2YWx1ZXM7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhY2subGVuZ3RoO1xuICB9XG5cbiAgcHVzaChpdGVtOiBUKSB7XG4gICAgdGhpcy5jdXJyZW50ID0gaXRlbTtcbiAgICB0aGlzLnN0YWNrLnB1c2goaXRlbSk7XG4gIH1cblxuICBwb3AoKTogT3B0aW9uPFQ+IHtcbiAgICBsZXQgaXRlbSA9IHRoaXMuc3RhY2sucG9wKCk7XG4gICAgbGV0IGxlbiA9IHRoaXMuc3RhY2subGVuZ3RoO1xuICAgIHRoaXMuY3VycmVudCA9IGxlbiA9PT0gMCA/IG51bGwgOiB0aGlzLnN0YWNrW2xlbiAtIDFdO1xuXG4gICAgcmV0dXJuIGl0ZW0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBpdGVtO1xuICB9XG5cbiAgbnRoKGZyb206IG51bWJlcik6IE9wdGlvbjxUPiB7XG4gICAgbGV0IGxlbiA9IHRoaXMuc3RhY2subGVuZ3RoO1xuICAgIHJldHVybiBsZW4gPCBmcm9tID8gbnVsbCA6IHRoaXMuc3RhY2tbbGVuIC0gZnJvbV07XG4gIH1cblxuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnN0YWNrLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIHRvQXJyYXkoKTogVFtdIHtcbiAgICByZXR1cm4gdGhpcy5zdGFjaztcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==