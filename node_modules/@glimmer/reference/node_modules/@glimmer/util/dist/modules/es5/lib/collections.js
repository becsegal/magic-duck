function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

export function dict() {
  return Object.create(null);
}
export function isDict(u) {
  return u !== null && u !== undefined;
}
export function isObject(u) {
  return typeof u === 'function' || typeof u === 'object' && u !== null;
}
export var StackImpl = /*#__PURE__*/function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2NvbGxlY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFFQSxPQUFNLFNBQUEsSUFBQSxHQUFjO0FBQ2xCLFNBQU8sTUFBTSxDQUFOLE1BQUEsQ0FBUCxJQUFPLENBQVA7QUFDRDtBQUVELE9BQU0sU0FBQSxNQUFBLENBQUEsQ0FBQSxFQUF3QjtBQUM1QixTQUFPLENBQUMsS0FBRCxJQUFBLElBQWMsQ0FBQyxLQUF0QixTQUFBO0FBQ0Q7QUFFRCxPQUFNLFNBQUEsUUFBQSxDQUFBLENBQUEsRUFBMEI7QUFDOUIsU0FBTyxPQUFBLENBQUEsS0FBQSxVQUFBLElBQTRCLE9BQUEsQ0FBQSxLQUFBLFFBQUEsSUFBeUIsQ0FBQyxLQUE3RCxJQUFBO0FBQ0Q7QUFFRCxXQUFNLFNBQU47QUFJRSxxQkFBWSxNQUFaLEVBQTRCO0FBQUEsUUFBaEIsTUFBZ0I7QUFBaEIsTUFBQSxNQUFnQixHQUE1QixFQUE0QjtBQUFBOztBQUZyQixTQUFBLE9BQUEsR0FBQSxJQUFBO0FBR0wsU0FBQSxLQUFBLEdBQUEsTUFBQTtBQUNEOztBQU5IOztBQUFBLFNBWUUsSUFaRixHQVlFLGNBQUksSUFBSixFQUFZO0FBQ1YsU0FBQSxPQUFBLEdBQUEsSUFBQTtBQUNBLFNBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0QsR0FmSDs7QUFBQSxTQWlCRSxHQWpCRixHQWlCRSxlQUFHO0FBQ0QsUUFBSSxJQUFJLEdBQUcsS0FBQSxLQUFBLENBQVgsR0FBVyxFQUFYO0FBQ0EsUUFBSSxHQUFHLEdBQUcsS0FBQSxLQUFBLENBQVYsTUFBQTtBQUNBLFNBQUEsT0FBQSxHQUFlLEdBQUcsS0FBSCxDQUFBLEdBQUEsSUFBQSxHQUFtQixLQUFBLEtBQUEsQ0FBVyxHQUFHLEdBQWhELENBQWtDLENBQWxDO0FBRUEsV0FBTyxJQUFJLEtBQUosU0FBQSxHQUFBLElBQUEsR0FBUCxJQUFBO0FBQ0QsR0F2Qkg7O0FBQUEsU0F5QkUsR0F6QkYsR0F5QkUsYUFBRyxJQUFILEVBQWdCO0FBQ2QsUUFBSSxHQUFHLEdBQUcsS0FBQSxLQUFBLENBQVYsTUFBQTtBQUNBLFdBQU8sR0FBRyxHQUFILElBQUEsR0FBQSxJQUFBLEdBQW9CLEtBQUEsS0FBQSxDQUFXLEdBQUcsR0FBekMsSUFBMkIsQ0FBM0I7QUFDRCxHQTVCSDs7QUFBQSxTQThCRSxPQTlCRixHQThCRSxtQkFBTztBQUNMLFdBQU8sS0FBQSxLQUFBLENBQUEsTUFBQSxLQUFQLENBQUE7QUFDRCxHQWhDSDs7QUFBQSxTQWtDRSxPQWxDRixHQWtDRSxtQkFBTztBQUNMLFdBQU8sS0FBUCxLQUFBO0FBQ0QsR0FwQ0g7O0FBQUE7QUFBQTtBQUFBLHdCQVFpQjtBQUNiLGFBQU8sS0FBQSxLQUFBLENBQVAsTUFBQTtBQUNEO0FBVkg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpY3QsIE9wdGlvbiwgU3RhY2sgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGRpY3Q8VCA9IHVua25vd24+KCk6IERpY3Q8VD4ge1xuICByZXR1cm4gT2JqZWN0LmNyZWF0ZShudWxsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGljdDxUPih1OiBUKTogdSBpcyBEaWN0ICYgVCB7XG4gIHJldHVybiB1ICE9PSBudWxsICYmIHUgIT09IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0PFQ+KHU6IFQpOiB1IGlzIG9iamVjdCAmIFQge1xuICByZXR1cm4gdHlwZW9mIHUgPT09ICdmdW5jdGlvbicgfHwgKHR5cGVvZiB1ID09PSAnb2JqZWN0JyAmJiB1ICE9PSBudWxsKTtcbn1cblxuZXhwb3J0IGNsYXNzIFN0YWNrSW1wbDxUPiBpbXBsZW1lbnRzIFN0YWNrPFQ+IHtcbiAgcHJpdmF0ZSBzdGFjazogVFtdO1xuICBwdWJsaWMgY3VycmVudDogT3B0aW9uPFQ+ID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcih2YWx1ZXM6IFRbXSA9IFtdKSB7XG4gICAgdGhpcy5zdGFjayA9IHZhbHVlcztcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFjay5sZW5ndGg7XG4gIH1cblxuICBwdXNoKGl0ZW06IFQpIHtcbiAgICB0aGlzLmN1cnJlbnQgPSBpdGVtO1xuICAgIHRoaXMuc3RhY2sucHVzaChpdGVtKTtcbiAgfVxuXG4gIHBvcCgpOiBPcHRpb248VD4ge1xuICAgIGxldCBpdGVtID0gdGhpcy5zdGFjay5wb3AoKTtcbiAgICBsZXQgbGVuID0gdGhpcy5zdGFjay5sZW5ndGg7XG4gICAgdGhpcy5jdXJyZW50ID0gbGVuID09PSAwID8gbnVsbCA6IHRoaXMuc3RhY2tbbGVuIC0gMV07XG5cbiAgICByZXR1cm4gaXRlbSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGl0ZW07XG4gIH1cblxuICBudGgoZnJvbTogbnVtYmVyKTogT3B0aW9uPFQ+IHtcbiAgICBsZXQgbGVuID0gdGhpcy5zdGFjay5sZW5ndGg7XG4gICAgcmV0dXJuIGxlbiA8IGZyb20gPyBudWxsIDogdGhpcy5zdGFja1tsZW4gLSBmcm9tXTtcbiAgfVxuXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc3RhY2subGVuZ3RoID09PSAwO1xuICB9XG5cbiAgdG9BcnJheSgpOiBUW10ge1xuICAgIHJldHVybiB0aGlzLnN0YWNrO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9