function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import b from './public-builders';
export var PathExpressionImplV1 = /*#__PURE__*/function () {
  function PathExpressionImplV1(original, head, tail, loc) {
    this.original = original;
    this.loc = loc;
    this.type = 'PathExpression';
    this["this"] = false;
    this.data = false; // Cache for the head value.

    this._head = undefined;
    var parts = tail.slice();

    if (head.type === 'ThisHead') {
      this["this"] = true;
    } else if (head.type === 'AtHead') {
      this.data = true;
      parts.unshift(head.name.slice(1));
    } else {
      parts.unshift(head.name);
    }

    this.parts = parts;
  }

  _createClass(PathExpressionImplV1, [{
    key: "head",
    get: function get() {
      if (this._head) {
        return this._head;
      }

      var firstPart;

      if (this["this"]) {
        firstPart = 'this';
      } else if (this.data) {
        firstPart = "@" + this.parts[0];
      } else {
        firstPart = this.parts[0];
      }

      var firstPartLoc = this.loc.collapse('start').sliceStartChars({
        chars: firstPart.length
      }).loc;
      return this._head = b.head(firstPart, firstPartLoc);
    }
  }, {
    key: "tail",
    get: function get() {
      return this["this"] ? this.parts : this.parts.slice(1);
    }
  }]);

  return PathExpressionImplV1;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjEvbGVnYWN5LWludGVyb3AudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUVBLE9BQUEsQ0FBQSxNQUFBLG1CQUFBO0FBRUEsV0FBTSxvQkFBTjtBQU1FLGdDQUFBLFFBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBMkY7QUFBeEUsU0FBQSxRQUFBLEdBQUEsUUFBQTtBQUF5RCxTQUFBLEdBQUEsR0FBQSxHQUFBO0FBTDVFLFNBQUEsSUFBQSxHQUFBLGdCQUFBO0FBRU8sbUJBQUEsS0FBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLEtBQUEsQ0FFb0YsQ0FlM0Y7O0FBQ0EsU0FBQSxLQUFBLEdBQUEsU0FBQTtBQWZFLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBaEIsS0FBWSxFQUFaOztBQUVBLFFBQUksSUFBSSxDQUFKLElBQUEsS0FBSixVQUFBLEVBQThCO0FBQzVCLHFCQUFBLElBQUE7QUFERixLQUFBLE1BRU8sSUFBSSxJQUFJLENBQUosSUFBQSxLQUFKLFFBQUEsRUFBNEI7QUFDakMsV0FBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLE1BQUEsS0FBSyxDQUFMLE9BQUEsQ0FBYyxJQUFJLENBQUosSUFBQSxDQUFBLEtBQUEsQ0FBZCxDQUFjLENBQWQ7QUFGSyxLQUFBLE1BR0E7QUFDTCxNQUFBLEtBQUssQ0FBTCxPQUFBLENBQWMsSUFBSSxDQUFsQixJQUFBO0FBQ0Q7O0FBRUQsU0FBQSxLQUFBLEdBQUEsS0FBQTtBQUNEOztBQW5CSDtBQUFBO0FBQUEsd0JBd0JVO0FBQ04sVUFBSSxLQUFKLEtBQUEsRUFBZ0I7QUFDZCxlQUFPLEtBQVAsS0FBQTtBQUNEOztBQUVELFVBQUEsU0FBQTs7QUFFQSxVQUFBLFlBQUEsRUFBZTtBQUNiLFFBQUEsU0FBUyxHQUFULE1BQUE7QUFERixPQUFBLE1BRU8sSUFBSSxLQUFKLElBQUEsRUFBZTtBQUNwQixRQUFBLFNBQVMsU0FBTyxLQUFBLEtBQUEsQ0FBaEIsQ0FBZ0IsQ0FBaEI7QUFESyxPQUFBLE1BRUE7QUFDTCxRQUFBLFNBQVMsR0FBRyxLQUFBLEtBQUEsQ0FBWixDQUFZLENBQVo7QUFDRDs7QUFFRCxVQUFJLFlBQVksR0FBRyxLQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsT0FBQSxFQUFBLGVBQUEsQ0FBMkM7QUFDNUQsUUFBQSxLQUFLLEVBQUUsU0FBUyxDQUFDO0FBRDJDLE9BQTNDLEVBQW5CLEdBQUE7QUFJQSxhQUFRLEtBQUEsS0FBQSxHQUFhLENBQUMsQ0FBRCxJQUFBLENBQUEsU0FBQSxFQUFyQixZQUFxQixDQUFyQjtBQUNEO0FBNUNIO0FBQUE7QUFBQSx3QkE4Q1U7QUFDTixhQUFPLGVBQVksS0FBWixLQUFBLEdBQXlCLEtBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBaEMsQ0FBZ0MsQ0FBaEM7QUFDRDtBQWhESDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU291cmNlU3BhbiB9IGZyb20gJy4uL3NvdXJjZS9zcGFuJztcbmltcG9ydCB7IFBhdGhFeHByZXNzaW9uLCBQYXRoSGVhZCB9IGZyb20gJy4vbm9kZXMtdjEnO1xuaW1wb3J0IGIgZnJvbSAnLi9wdWJsaWMtYnVpbGRlcnMnO1xuXG5leHBvcnQgY2xhc3MgUGF0aEV4cHJlc3Npb25JbXBsVjEgaW1wbGVtZW50cyBQYXRoRXhwcmVzc2lvbiB7XG4gIHR5cGU6ICdQYXRoRXhwcmVzc2lvbicgPSAnUGF0aEV4cHJlc3Npb24nO1xuICBwdWJsaWMgcGFydHM6IHN0cmluZ1tdO1xuICBwdWJsaWMgdGhpcyA9IGZhbHNlO1xuICBwdWJsaWMgZGF0YSA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBvcmlnaW5hbDogc3RyaW5nLCBoZWFkOiBQYXRoSGVhZCwgdGFpbDogc3RyaW5nW10sIHB1YmxpYyBsb2M6IFNvdXJjZVNwYW4pIHtcbiAgICBsZXQgcGFydHMgPSB0YWlsLnNsaWNlKCk7XG5cbiAgICBpZiAoaGVhZC50eXBlID09PSAnVGhpc0hlYWQnKSB7XG4gICAgICB0aGlzLnRoaXMgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoaGVhZC50eXBlID09PSAnQXRIZWFkJykge1xuICAgICAgdGhpcy5kYXRhID0gdHJ1ZTtcbiAgICAgIHBhcnRzLnVuc2hpZnQoaGVhZC5uYW1lLnNsaWNlKDEpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydHMudW5zaGlmdChoZWFkLm5hbWUpO1xuICAgIH1cblxuICAgIHRoaXMucGFydHMgPSBwYXJ0cztcbiAgfVxuXG4gIC8vIENhY2hlIGZvciB0aGUgaGVhZCB2YWx1ZS5cbiAgX2hlYWQ/OiBQYXRoSGVhZCA9IHVuZGVmaW5lZDtcblxuICBnZXQgaGVhZCgpOiBQYXRoSGVhZCB7XG4gICAgaWYgKHRoaXMuX2hlYWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9oZWFkO1xuICAgIH1cblxuICAgIGxldCBmaXJzdFBhcnQ6IHN0cmluZztcblxuICAgIGlmICh0aGlzLnRoaXMpIHtcbiAgICAgIGZpcnN0UGFydCA9ICd0aGlzJztcbiAgICB9IGVsc2UgaWYgKHRoaXMuZGF0YSkge1xuICAgICAgZmlyc3RQYXJ0ID0gYEAke3RoaXMucGFydHNbMF19YDtcbiAgICB9IGVsc2Uge1xuICAgICAgZmlyc3RQYXJ0ID0gdGhpcy5wYXJ0c1swXTtcbiAgICB9XG5cbiAgICBsZXQgZmlyc3RQYXJ0TG9jID0gdGhpcy5sb2MuY29sbGFwc2UoJ3N0YXJ0Jykuc2xpY2VTdGFydENoYXJzKHtcbiAgICAgIGNoYXJzOiBmaXJzdFBhcnQubGVuZ3RoLFxuICAgIH0pLmxvYztcblxuICAgIHJldHVybiAodGhpcy5faGVhZCA9IGIuaGVhZChmaXJzdFBhcnQsIGZpcnN0UGFydExvYykpO1xuICB9XG5cbiAgZ2V0IHRhaWwoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLnRoaXMgPyB0aGlzLnBhcnRzIDogdGhpcy5wYXJ0cy5zbGljZSgxKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==