"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PathExpressionImplV1 = void 0;

var _publicBuilders = _interopRequireDefault(require("./public-builders"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PathExpressionImplV1 {
  constructor(original, head, tail, loc) {
    this.original = original;
    this.loc = loc;
    this.type = 'PathExpression';
    this.this = false;
    this.data = false; // Cache for the head value.

    this._head = undefined;
    let parts = tail.slice();

    if (head.type === 'ThisHead') {
      this.this = true;
    } else if (head.type === 'AtHead') {
      this.data = true;
      parts.unshift(head.name.slice(1));
    } else {
      parts.unshift(head.name);
    }

    this.parts = parts;
  }

  get head() {
    if (this._head) {
      return this._head;
    }

    let firstPart;

    if (this.this) {
      firstPart = 'this';
    } else if (this.data) {
      firstPart = `@${this.parts[0]}`;
    } else {
      firstPart = this.parts[0];
    }

    let firstPartLoc = this.loc.collapse('start').sliceStartChars({
      chars: firstPart.length
    }).loc;
    return this._head = _publicBuilders.default.head(firstPart, firstPartLoc);
  }

  get tail() {
    return this.this ? this.parts : this.parts.slice(1);
  }

}

exports.PathExpressionImplV1 = PathExpressionImplV1;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjEvbGVnYWN5LWludGVyb3AudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOzs7O0FBRU0sTUFBQSxvQkFBQSxDQUEyQjtBQU0vQixFQUFBLFdBQUEsQ0FBQSxRQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQTJGO0FBQXhFLFNBQUEsUUFBQSxHQUFBLFFBQUE7QUFBeUQsU0FBQSxHQUFBLEdBQUEsR0FBQTtBQUw1RSxTQUFBLElBQUEsR0FBQSxnQkFBQTtBQUVPLFNBQUEsSUFBQSxHQUFBLEtBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxLQUFBLENBRW9GLENBZTNGOztBQUNBLFNBQUEsS0FBQSxHQUFBLFNBQUE7QUFmRSxRQUFJLEtBQUssR0FBRyxJQUFJLENBQWhCLEtBQVksRUFBWjs7QUFFQSxRQUFJLElBQUksQ0FBSixJQUFBLEtBQUosVUFBQSxFQUE4QjtBQUM1QixXQUFBLElBQUEsR0FBQSxJQUFBO0FBREYsS0FBQSxNQUVPLElBQUksSUFBSSxDQUFKLElBQUEsS0FBSixRQUFBLEVBQTRCO0FBQ2pDLFdBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxNQUFBLEtBQUssQ0FBTCxPQUFBLENBQWMsSUFBSSxDQUFKLElBQUEsQ0FBQSxLQUFBLENBQWQsQ0FBYyxDQUFkO0FBRkssS0FBQSxNQUdBO0FBQ0wsTUFBQSxLQUFLLENBQUwsT0FBQSxDQUFjLElBQUksQ0FBbEIsSUFBQTtBQUNEOztBQUVELFNBQUEsS0FBQSxHQUFBLEtBQUE7QUFDRDs7QUFLRCxNQUFBLElBQUEsR0FBUTtBQUNOLFFBQUksS0FBSixLQUFBLEVBQWdCO0FBQ2QsYUFBTyxLQUFQLEtBQUE7QUFDRDs7QUFFRCxRQUFBLFNBQUE7O0FBRUEsUUFBSSxLQUFKLElBQUEsRUFBZTtBQUNiLE1BQUEsU0FBUyxHQUFULE1BQUE7QUFERixLQUFBLE1BRU8sSUFBSSxLQUFKLElBQUEsRUFBZTtBQUNwQixNQUFBLFNBQVMsR0FBRyxJQUFJLEtBQUEsS0FBQSxDQUFBLENBQUEsQ0FBaEIsRUFBQTtBQURLLEtBQUEsTUFFQTtBQUNMLE1BQUEsU0FBUyxHQUFHLEtBQUEsS0FBQSxDQUFaLENBQVksQ0FBWjtBQUNEOztBQUVELFFBQUksWUFBWSxHQUFHLEtBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxPQUFBLEVBQUEsZUFBQSxDQUEyQztBQUM1RCxNQUFBLEtBQUssRUFBRSxTQUFTLENBQUM7QUFEMkMsS0FBM0MsRUFBbkIsR0FBQTtBQUlBLFdBQVEsS0FBQSxLQUFBLEdBQWEsd0JBQUEsSUFBQSxDQUFBLFNBQUEsRUFBckIsWUFBcUIsQ0FBckI7QUFDRDs7QUFFRCxNQUFBLElBQUEsR0FBUTtBQUNOLFdBQU8sS0FBQSxJQUFBLEdBQVksS0FBWixLQUFBLEdBQXlCLEtBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBaEMsQ0FBZ0MsQ0FBaEM7QUFDRDs7QUFoRDhCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU291cmNlU3BhbiB9IGZyb20gJy4uL3NvdXJjZS9zcGFuJztcbmltcG9ydCB7IFBhdGhFeHByZXNzaW9uLCBQYXRoSGVhZCB9IGZyb20gJy4vbm9kZXMtdjEnO1xuaW1wb3J0IGIgZnJvbSAnLi9wdWJsaWMtYnVpbGRlcnMnO1xuXG5leHBvcnQgY2xhc3MgUGF0aEV4cHJlc3Npb25JbXBsVjEgaW1wbGVtZW50cyBQYXRoRXhwcmVzc2lvbiB7XG4gIHR5cGU6ICdQYXRoRXhwcmVzc2lvbicgPSAnUGF0aEV4cHJlc3Npb24nO1xuICBwdWJsaWMgcGFydHM6IHN0cmluZ1tdO1xuICBwdWJsaWMgdGhpcyA9IGZhbHNlO1xuICBwdWJsaWMgZGF0YSA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBvcmlnaW5hbDogc3RyaW5nLCBoZWFkOiBQYXRoSGVhZCwgdGFpbDogc3RyaW5nW10sIHB1YmxpYyBsb2M6IFNvdXJjZVNwYW4pIHtcbiAgICBsZXQgcGFydHMgPSB0YWlsLnNsaWNlKCk7XG5cbiAgICBpZiAoaGVhZC50eXBlID09PSAnVGhpc0hlYWQnKSB7XG4gICAgICB0aGlzLnRoaXMgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoaGVhZC50eXBlID09PSAnQXRIZWFkJykge1xuICAgICAgdGhpcy5kYXRhID0gdHJ1ZTtcbiAgICAgIHBhcnRzLnVuc2hpZnQoaGVhZC5uYW1lLnNsaWNlKDEpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydHMudW5zaGlmdChoZWFkLm5hbWUpO1xuICAgIH1cblxuICAgIHRoaXMucGFydHMgPSBwYXJ0cztcbiAgfVxuXG4gIC8vIENhY2hlIGZvciB0aGUgaGVhZCB2YWx1ZS5cbiAgX2hlYWQ/OiBQYXRoSGVhZCA9IHVuZGVmaW5lZDtcblxuICBnZXQgaGVhZCgpOiBQYXRoSGVhZCB7XG4gICAgaWYgKHRoaXMuX2hlYWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9oZWFkO1xuICAgIH1cblxuICAgIGxldCBmaXJzdFBhcnQ6IHN0cmluZztcblxuICAgIGlmICh0aGlzLnRoaXMpIHtcbiAgICAgIGZpcnN0UGFydCA9ICd0aGlzJztcbiAgICB9IGVsc2UgaWYgKHRoaXMuZGF0YSkge1xuICAgICAgZmlyc3RQYXJ0ID0gYEAke3RoaXMucGFydHNbMF19YDtcbiAgICB9IGVsc2Uge1xuICAgICAgZmlyc3RQYXJ0ID0gdGhpcy5wYXJ0c1swXTtcbiAgICB9XG5cbiAgICBsZXQgZmlyc3RQYXJ0TG9jID0gdGhpcy5sb2MuY29sbGFwc2UoJ3N0YXJ0Jykuc2xpY2VTdGFydENoYXJzKHtcbiAgICAgIGNoYXJzOiBmaXJzdFBhcnQubGVuZ3RoLFxuICAgIH0pLmxvYztcblxuICAgIHJldHVybiAodGhpcy5faGVhZCA9IGIuaGVhZChmaXJzdFBhcnQsIGZpcnN0UGFydExvYykpO1xuICB9XG5cbiAgZ2V0IHRhaWwoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLnRoaXMgPyB0aGlzLnBhcnRzIDogdGhpcy5wYXJ0cy5zbGljZSgxKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==