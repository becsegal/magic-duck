"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PathExpressionImplV1 = void 0;

var _publicBuilders = _interopRequireDefault(require("./public-builders"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var PathExpressionImplV1 = /*#__PURE__*/function () {
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
      return this._head = _publicBuilders.default.head(firstPart, firstPartLoc);
    }
  }, {
    key: "tail",
    get: function get() {
      return this["this"] ? this.parts : this.parts.slice(1);
    }
  }]);

  return PathExpressionImplV1;
}();

exports.PathExpressionImplV1 = PathExpressionImplV1;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjEvbGVnYWN5LWludGVyb3AudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU0sb0JBQU4sR0FBQSxhQUFBLFlBQUE7QUFNRSxXQUFBLG9CQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUEyRjtBQUF4RSxTQUFBLFFBQUEsR0FBQSxRQUFBO0FBQXlELFNBQUEsR0FBQSxHQUFBLEdBQUE7QUFMNUUsU0FBQSxJQUFBLEdBQUEsZ0JBQUE7QUFFTyxTQUFBLE1BQUEsSUFBQSxLQUFBO0FBQ0EsU0FBQSxJQUFBLEdBQUEsS0FBQSxDQUVvRixDQWUzRjs7QUFDQSxTQUFBLEtBQUEsR0FBQSxTQUFBO0FBZkUsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFoQixLQUFZLEVBQVo7O0FBRUEsUUFBSSxJQUFJLENBQUosSUFBQSxLQUFKLFVBQUEsRUFBOEI7QUFDNUIsV0FBQSxNQUFBLElBQUEsSUFBQTtBQURGLEtBQUEsTUFFTyxJQUFJLElBQUksQ0FBSixJQUFBLEtBQUosUUFBQSxFQUE0QjtBQUNqQyxXQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsTUFBQSxLQUFLLENBQUwsT0FBQSxDQUFjLElBQUksQ0FBSixJQUFBLENBQUEsS0FBQSxDQUFkLENBQWMsQ0FBZDtBQUZLLEtBQUEsTUFHQTtBQUNMLE1BQUEsS0FBSyxDQUFMLE9BQUEsQ0FBYyxJQUFJLENBQWxCLElBQUE7QUFDRDs7QUFFRCxTQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0Q7O0FBbkJILEVBQUEsWUFBQSxDQUFBLG9CQUFBLEVBQUEsQ0FBQTtBQUFBLElBQUEsR0FBQSxFQUFBLE1BQUE7QUFBQSxJQUFBLEdBQUEsRUFBQSxTQUFBLEdBQUEsR0F3QlU7QUFDTixVQUFJLEtBQUosS0FBQSxFQUFnQjtBQUNkLGVBQU8sS0FBUCxLQUFBO0FBQ0Q7O0FBRUQsVUFBQSxTQUFBOztBQUVBLFVBQUEsS0FBQSxNQUFBLENBQUEsRUFBZTtBQUNiLFFBQUEsU0FBUyxHQUFULE1BQUE7QUFERixPQUFBLE1BRU8sSUFBSSxLQUFKLElBQUEsRUFBZTtBQUNwQixRQUFBLFNBQVMsR0FBQSxNQUFPLEtBQUEsS0FBQSxDQUFoQixDQUFnQixDQUFoQjtBQURLLE9BQUEsTUFFQTtBQUNMLFFBQUEsU0FBUyxHQUFHLEtBQUEsS0FBQSxDQUFaLENBQVksQ0FBWjtBQUNEOztBQUVELFVBQUksWUFBWSxHQUFHLEtBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxPQUFBLEVBQUEsZUFBQSxDQUEyQztBQUM1RCxRQUFBLEtBQUssRUFBRSxTQUFTLENBQUM7QUFEMkMsT0FBM0MsRUFBbkIsR0FBQTtBQUlBLGFBQVEsS0FBQSxLQUFBLEdBQWEsd0JBQUEsSUFBQSxDQUFBLFNBQUEsRUFBckIsWUFBcUIsQ0FBckI7QUFDRDtBQTVDSCxHQUFBLEVBQUE7QUFBQSxJQUFBLEdBQUEsRUFBQSxNQUFBO0FBQUEsSUFBQSxHQUFBLEVBQUEsU0FBQSxHQUFBLEdBOENVO0FBQ04sYUFBTyxLQUFBLE1BQUEsSUFBWSxLQUFaLEtBQUEsR0FBeUIsS0FBQSxLQUFBLENBQUEsS0FBQSxDQUFoQyxDQUFnQyxDQUFoQztBQUNEO0FBaERILEdBQUEsQ0FBQSxDQUFBOztBQUFBLFNBQUEsb0JBQUE7QUFBQSxDQUFBLEVBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTb3VyY2VTcGFuIH0gZnJvbSAnLi4vc291cmNlL3NwYW4nO1xuaW1wb3J0IHsgUGF0aEV4cHJlc3Npb24sIFBhdGhIZWFkIH0gZnJvbSAnLi9ub2Rlcy12MSc7XG5pbXBvcnQgYiBmcm9tICcuL3B1YmxpYy1idWlsZGVycyc7XG5cbmV4cG9ydCBjbGFzcyBQYXRoRXhwcmVzc2lvbkltcGxWMSBpbXBsZW1lbnRzIFBhdGhFeHByZXNzaW9uIHtcbiAgdHlwZTogJ1BhdGhFeHByZXNzaW9uJyA9ICdQYXRoRXhwcmVzc2lvbic7XG4gIHB1YmxpYyBwYXJ0czogc3RyaW5nW107XG4gIHB1YmxpYyB0aGlzID0gZmFsc2U7XG4gIHB1YmxpYyBkYXRhID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHVibGljIG9yaWdpbmFsOiBzdHJpbmcsIGhlYWQ6IFBhdGhIZWFkLCB0YWlsOiBzdHJpbmdbXSwgcHVibGljIGxvYzogU291cmNlU3Bhbikge1xuICAgIGxldCBwYXJ0cyA9IHRhaWwuc2xpY2UoKTtcblxuICAgIGlmIChoZWFkLnR5cGUgPT09ICdUaGlzSGVhZCcpIHtcbiAgICAgIHRoaXMudGhpcyA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChoZWFkLnR5cGUgPT09ICdBdEhlYWQnKSB7XG4gICAgICB0aGlzLmRhdGEgPSB0cnVlO1xuICAgICAgcGFydHMudW5zaGlmdChoZWFkLm5hbWUuc2xpY2UoMSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0cy51bnNoaWZ0KGhlYWQubmFtZSk7XG4gICAgfVxuXG4gICAgdGhpcy5wYXJ0cyA9IHBhcnRzO1xuICB9XG5cbiAgLy8gQ2FjaGUgZm9yIHRoZSBoZWFkIHZhbHVlLlxuICBfaGVhZD86IFBhdGhIZWFkID0gdW5kZWZpbmVkO1xuXG4gIGdldCBoZWFkKCk6IFBhdGhIZWFkIHtcbiAgICBpZiAodGhpcy5faGVhZCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2hlYWQ7XG4gICAgfVxuXG4gICAgbGV0IGZpcnN0UGFydDogc3RyaW5nO1xuXG4gICAgaWYgKHRoaXMudGhpcykge1xuICAgICAgZmlyc3RQYXJ0ID0gJ3RoaXMnO1xuICAgIH0gZWxzZSBpZiAodGhpcy5kYXRhKSB7XG4gICAgICBmaXJzdFBhcnQgPSBgQCR7dGhpcy5wYXJ0c1swXX1gO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaXJzdFBhcnQgPSB0aGlzLnBhcnRzWzBdO1xuICAgIH1cblxuICAgIGxldCBmaXJzdFBhcnRMb2MgPSB0aGlzLmxvYy5jb2xsYXBzZSgnc3RhcnQnKS5zbGljZVN0YXJ0Q2hhcnMoe1xuICAgICAgY2hhcnM6IGZpcnN0UGFydC5sZW5ndGgsXG4gICAgfSkubG9jO1xuXG4gICAgcmV0dXJuICh0aGlzLl9oZWFkID0gYi5oZWFkKGZpcnN0UGFydCwgZmlyc3RQYXJ0TG9jKSk7XG4gIH1cblxuICBnZXQgdGFpbCgpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMudGhpcyA/IHRoaXMucGFydHMgOiB0aGlzLnBhcnRzLnNsaWNlKDEpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9