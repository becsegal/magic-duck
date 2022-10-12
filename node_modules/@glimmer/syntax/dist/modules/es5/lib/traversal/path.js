function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WalkerPath = /*#__PURE__*/function () {
  function WalkerPath(node, parent, parentKey) {
    if (parent === void 0) {
      parent = null;
    }

    if (parentKey === void 0) {
      parentKey = null;
    }

    this.node = node;
    this.parent = parent;
    this.parentKey = parentKey;
  }

  var _proto = WalkerPath.prototype;

  _proto.parents = function parents() {
    var _this = this,
        _ref;

    return _ref = {}, _ref[Symbol.iterator] = function () {
      return new PathParentsIterator(_this);
    }, _ref;
  };

  _createClass(WalkerPath, [{
    key: "parentNode",
    get: function get() {
      return this.parent ? this.parent.node : null;
    }
  }]);

  return WalkerPath;
}();

export { WalkerPath as default };

var PathParentsIterator = /*#__PURE__*/function () {
  function PathParentsIterator(path) {
    this.path = path;
  }

  var _proto2 = PathParentsIterator.prototype;

  _proto2.next = function next() {
    if (this.path.parent) {
      this.path = this.path.parent;
      return {
        done: false,
        value: this.path
      };
    } else {
      return {
        done: true,
        value: null
      };
    }
  };

  return PathParentsIterator;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdHJhdmVyc2FsL3BhdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUVjLFU7QUFLWixzQkFBQSxJQUFBLEVBRUUsTUFGRixFQUdFLFNBSEYsRUFHaUM7QUFBQSxRQUQvQixNQUMrQjtBQUQvQixNQUFBLE1BQytCLEdBSGpDLElBR2lDO0FBQUE7O0FBQUEsUUFBL0IsU0FBK0I7QUFBL0IsTUFBQSxTQUErQixHQUhqQyxJQUdpQztBQUFBOztBQUUvQixTQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsU0FBQSxNQUFBLEdBQUEsTUFBQTtBQUNBLFNBQUEsU0FBQSxHQUFBLFNBQUE7QUFDRDs7OztTQU1ELE8sR0FBQSxtQkFBTztBQUFBO0FBQUE7O0FBQ0wsMkJBQ0csTUFBTSxDQUFQLFFBREYsSUFDcUIsWUFBSztBQUN0QixhQUFPLElBQUEsbUJBQUEsQ0FBUCxLQUFPLENBQVA7QUFDRCxLQUhIO0FBS0QsRzs7Ozt3QkFWYTtBQUNaLGFBQU8sS0FBQSxNQUFBLEdBQWMsS0FBQSxNQUFBLENBQWQsSUFBQSxHQUFQLElBQUE7QUFDRDs7Ozs7O1NBakJXLFU7O0lBNEJkLG1CO0FBR0UsK0JBQUEsSUFBQSxFQUF3QztBQUN0QyxTQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0Q7Ozs7VUFFRCxJLEdBQUEsZ0JBQUk7QUFDRixRQUFJLEtBQUEsSUFBQSxDQUFKLE1BQUEsRUFBc0I7QUFDcEIsV0FBQSxJQUFBLEdBQVksS0FBQSxJQUFBLENBQVosTUFBQTtBQUNBLGFBQU87QUFBRSxRQUFBLElBQUksRUFBTixLQUFBO0FBQWUsUUFBQSxLQUFLLEVBQUUsS0FBSztBQUEzQixPQUFQO0FBRkYsS0FBQSxNQUdPO0FBQ0wsYUFBTztBQUFFLFFBQUEsSUFBSSxFQUFOLElBQUE7QUFBYyxRQUFBLEtBQUssRUFBRTtBQUFyQixPQUFQO0FBQ0Q7QUFDRixHIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVNUdjEgZnJvbSAnLi4vdjEvYXBpJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2Fsa2VyUGF0aDxOIGV4dGVuZHMgQVNUdjEuTm9kZT4ge1xuICBub2RlOiBOO1xuICBwYXJlbnQ6IFdhbGtlclBhdGg8QVNUdjEuTm9kZT4gfCBudWxsO1xuICBwYXJlbnRLZXk6IHN0cmluZyB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbm9kZTogTixcbiAgICBwYXJlbnQ6IFdhbGtlclBhdGg8QVNUdjEuTm9kZT4gfCBudWxsID0gbnVsbCxcbiAgICBwYXJlbnRLZXk6IHN0cmluZyB8IG51bGwgPSBudWxsXG4gICkge1xuICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5wYXJlbnRLZXkgPSBwYXJlbnRLZXk7XG4gIH1cblxuICBnZXQgcGFyZW50Tm9kZSgpOiBBU1R2MS5Ob2RlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQubm9kZSA6IG51bGw7XG4gIH1cblxuICBwYXJlbnRzKCk6IEl0ZXJhYmxlPFdhbGtlclBhdGg8QVNUdjEuTm9kZT4gfCBudWxsPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIFtTeW1ib2wuaXRlcmF0b3JdOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUGF0aFBhcmVudHNJdGVyYXRvcih0aGlzKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxufVxuXG5jbGFzcyBQYXRoUGFyZW50c0l0ZXJhdG9yIGltcGxlbWVudHMgSXRlcmF0b3I8V2Fsa2VyUGF0aDxBU1R2MS5Ob2RlPiB8IG51bGw+IHtcbiAgcGF0aDogV2Fsa2VyUGF0aDxBU1R2MS5Ob2RlPjtcblxuICBjb25zdHJ1Y3RvcihwYXRoOiBXYWxrZXJQYXRoPEFTVHYxLk5vZGU+KSB7XG4gICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgfVxuXG4gIG5leHQoKSB7XG4gICAgaWYgKHRoaXMucGF0aC5wYXJlbnQpIHtcbiAgICAgIHRoaXMucGF0aCA9IHRoaXMucGF0aC5wYXJlbnQ7XG4gICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IHRoaXMucGF0aCB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogbnVsbCB9O1xuICAgIH1cbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==