"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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

exports.default = WalkerPath;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdHJhdmVyc2FsL3BhdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFYyxVO0FBS1osV0FBQSxVQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBR2lDO0FBQUEsUUFEL0IsTUFDK0IsS0FBQSxLQUFBLENBQUEsRUFBQTtBQUQvQixNQUFBLE1BQytCLEdBSGpDLElBRUU7QUFDK0I7O0FBQUEsUUFBL0IsU0FBK0IsS0FBQSxLQUFBLENBQUEsRUFBQTtBQUEvQixNQUFBLFNBQStCLEdBSGpDLElBR0U7QUFBK0I7O0FBRS9CLFNBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxNQUFBO0FBQ0EsU0FBQSxTQUFBLEdBQUEsU0FBQTtBQUNEOzs7O1NBTUQsTyxHQUFBLFNBQUEsT0FBQSxHQUFPO0FBQUEsUUFBQSxLQUFBLEdBQUEsSUFBQTtBQUFBLFFBQUEsSUFBQTs7QUFDTCxXQUFBLElBQUEsR0FBQSxFQUFBLEVBQUEsSUFBQSxDQUNHLE1BQU0sQ0FEVCxRQUFBLENBQUEsR0FDcUIsWUFBSztBQUN0QixhQUFPLElBQUEsbUJBQUEsQ0FBUCxLQUFPLENBQVA7QUFGSixLQUFBLEVBQUEsSUFBQTs7Ozs7d0JBTFk7QUFDWixhQUFPLEtBQUEsTUFBQSxHQUFjLEtBQUEsTUFBQSxDQUFkLElBQUEsR0FBUCxJQUFBO0FBQ0Q7Ozs7Ozs7O0lBV0gsbUI7QUFHRSxXQUFBLG1CQUFBLENBQUEsSUFBQSxFQUF3QztBQUN0QyxTQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0Q7Ozs7VUFFRCxJLEdBQUEsU0FBQSxJQUFBLEdBQUk7QUFDRixRQUFJLEtBQUEsSUFBQSxDQUFKLE1BQUEsRUFBc0I7QUFDcEIsV0FBQSxJQUFBLEdBQVksS0FBQSxJQUFBLENBQVosTUFBQTtBQUNBLGFBQU87QUFBRSxRQUFBLElBQUksRUFBTixLQUFBO0FBQWUsUUFBQSxLQUFLLEVBQUUsS0FBSztBQUEzQixPQUFQO0FBRkYsS0FBQSxNQUdPO0FBQ0wsYUFBTztBQUFFLFFBQUEsSUFBSSxFQUFOLElBQUE7QUFBYyxRQUFBLEtBQUssRUFBRTtBQUFyQixPQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBBU1R2MSBmcm9tICcuLi92MS9hcGknO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXYWxrZXJQYXRoPE4gZXh0ZW5kcyBBU1R2MS5Ob2RlPiB7XG4gIG5vZGU6IE47XG4gIHBhcmVudDogV2Fsa2VyUGF0aDxBU1R2MS5Ob2RlPiB8IG51bGw7XG4gIHBhcmVudEtleTogc3RyaW5nIHwgbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBub2RlOiBOLFxuICAgIHBhcmVudDogV2Fsa2VyUGF0aDxBU1R2MS5Ob2RlPiB8IG51bGwgPSBudWxsLFxuICAgIHBhcmVudEtleTogc3RyaW5nIHwgbnVsbCA9IG51bGxcbiAgKSB7XG4gICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLnBhcmVudEtleSA9IHBhcmVudEtleTtcbiAgfVxuXG4gIGdldCBwYXJlbnROb2RlKCk6IEFTVHYxLk5vZGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5ub2RlIDogbnVsbDtcbiAgfVxuXG4gIHBhcmVudHMoKTogSXRlcmFibGU8V2Fsa2VyUGF0aDxBU1R2MS5Ob2RlPiB8IG51bGw+IHtcbiAgICByZXR1cm4ge1xuICAgICAgW1N5bWJvbC5pdGVyYXRvcl06ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQYXRoUGFyZW50c0l0ZXJhdG9yKHRoaXMpO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG59XG5cbmNsYXNzIFBhdGhQYXJlbnRzSXRlcmF0b3IgaW1wbGVtZW50cyBJdGVyYXRvcjxXYWxrZXJQYXRoPEFTVHYxLk5vZGU+IHwgbnVsbD4ge1xuICBwYXRoOiBXYWxrZXJQYXRoPEFTVHYxLk5vZGU+O1xuXG4gIGNvbnN0cnVjdG9yKHBhdGg6IFdhbGtlclBhdGg8QVNUdjEuTm9kZT4pIHtcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICB9XG5cbiAgbmV4dCgpIHtcbiAgICBpZiAodGhpcy5wYXRoLnBhcmVudCkge1xuICAgICAgdGhpcy5wYXRoID0gdGhpcy5wYXRoLnBhcmVudDtcbiAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZTogdGhpcy5wYXRoIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiBudWxsIH07XG4gICAgfVxuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9