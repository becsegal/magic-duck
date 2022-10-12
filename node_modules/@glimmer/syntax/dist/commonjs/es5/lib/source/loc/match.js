"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.match = match;
exports.IsInvisible = exports.MatchAny = void 0;

var _util = require("@glimmer/util");

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length) return {
          done: true
        };
        return {
          done: false,
          value: o[i++]
        };
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  it = o[Symbol.iterator]();
  return it.next.bind(it);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

/**
 * This file implements the DSL used by span and offset in places where they need to exhaustively
 * consider all combinations of states (Handlebars offsets, character offsets and invisible/broken
 * offsets).
 *
 * It's probably overkill, but it makes the code that uses it clear. It could be refactored or
 * removed.
 */
var MatchAny = 'MATCH_ANY';
exports.MatchAny = MatchAny;
var IsInvisible = 'IS_INVISIBLE';
exports.IsInvisible = IsInvisible;

var WhenList = /*#__PURE__*/function () {
  function WhenList(whens) {
    this._whens = whens;
  }

  var _proto = WhenList.prototype;

  _proto.first = function first(kind) {
    for (var _iterator = _createForOfIteratorHelperLoose(this._whens), _step; !(_step = _iterator()).done;) {
      var when = _step.value;
      var value = when.match(kind);

      if ((0, _util.isPresent)(value)) {
        return value[0];
      }
    }

    return null;
  };

  return WhenList;
}();

var When = /*#__PURE__*/function () {
  function When() {
    this._map = new Map();
  }

  var _proto2 = When.prototype;

  _proto2.get = function get(pattern, or) {
    var value = this._map.get(pattern);

    if (value) {
      return value;
    }

    value = or();

    this._map.set(pattern, value);

    return value;
  };

  _proto2.add = function add(pattern, out) {
    this._map.set(pattern, out);
  };

  _proto2.match = function match(kind) {
    var pattern = patternFor(kind);
    var out = [];

    var exact = this._map.get(pattern);

    var fallback = this._map.get(MatchAny);

    if (exact) {
      out.push(exact);
    }

    if (fallback) {
      out.push(fallback);
    }

    return out;
  };

  return When;
}();

function match(callback) {
  return callback(new Matcher()).check();
}

var Matcher = /*#__PURE__*/function () {
  function Matcher() {
    this._whens = new When();
  }
  /**
   * You didn't exhaustively match all possibilities.
   */


  var _proto3 = Matcher.prototype;

  _proto3.check = function check() {
    var _this = this;

    return function (left, right) {
      return _this.matchFor(left.kind, right.kind)(left, right);
    };
  };

  _proto3.matchFor = function matchFor(left, right) {
    var nesteds = this._whens.match(left);

    false && (0, _util.assert)((0, _util.isPresent)(nesteds), "no match defined for (" + left + ", " + right + ") and no AnyMatch defined either");
    var callback = new WhenList(nesteds).first(right);
    false && (0, _util.assert)(callback !== null, "no match defined for (" + left + ", " + right + ") and no AnyMatch defined either");
    return callback;
  };

  _proto3.when = function when(left, right, // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback) {
    this._whens.get(left, function () {
      return new When();
    }).add(right, callback);

    return this;
  };

  return Matcher;
}();

function patternFor(kind) {
  switch (kind) {
    case "Broken"
    /* Broken */
    :
    case "InternalsSynthetic"
    /* InternalsSynthetic */
    :
    case "NonExistent"
    /* NonExistent */
    :
      return IsInvisible;

    default:
      return kind;
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvc291cmNlL2xvYy9tYXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUE7Ozs7Ozs7O0FBU08sSUFBTSxRQUFRLEdBQWQsV0FBQTs7QUFXQSxJQUFNLFdBQVcsR0FBakIsY0FBQTs7O0lBS1AsUTtBQUdFLFdBQUEsUUFBQSxDQUFBLEtBQUEsRUFBOEI7QUFDNUIsU0FBQSxNQUFBLEdBQUEsS0FBQTtBQUNEOzs7O1NBRUQsSyxHQUFBLFNBQUEsS0FBQSxDQUFBLElBQUEsRUFBc0I7QUFDcEIsU0FBQSxJQUFBLFNBQUEsR0FBQSwrQkFBQSxDQUFpQixLQUFqQixNQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxTQUFBLEVBQUEsRUFBQSxJQUFBLEdBQThCO0FBQUEsVUFBOUIsSUFBOEIsR0FBQSxLQUFBLENBQUEsS0FBQTtBQUM1QixVQUFJLEtBQUssR0FBRyxJQUFJLENBQUosS0FBQSxDQUFaLElBQVksQ0FBWjs7QUFDQSxVQUFJLHFCQUFKLEtBQUksQ0FBSixFQUFzQjtBQUNwQixlQUFPLEtBQUssQ0FBWixDQUFZLENBQVo7QUFDRDtBQUNGOztBQUVELFdBQUEsSUFBQTs7Ozs7O0lBSUosSTtBQUFBLFdBQUEsSUFBQSxHQUFBO0FBQ0UsU0FBQSxJQUFBLEdBQTBCLElBQTFCLEdBQTBCLEVBQTFCO0FBc0NEOzs7O1VBcENDLEcsR0FBQSxTQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUEsRUFBQSxFQUFtQztBQUNqQyxRQUFJLEtBQUssR0FBRyxLQUFBLElBQUEsQ0FBQSxHQUFBLENBQVosT0FBWSxDQUFaOztBQUVBLFFBQUEsS0FBQSxFQUFXO0FBQ1QsYUFBQSxLQUFBO0FBQ0Q7O0FBRUQsSUFBQSxLQUFLLEdBQUcsRUFBUixFQUFBOztBQUVBLFNBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQTs7QUFFQSxXQUFBLEtBQUE7OztVQUdGLEcsR0FBQSxTQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxFQUE4QjtBQUM1QixTQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBLEdBQUE7OztVQUdGLEssR0FBQSxTQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQXNCO0FBQ3BCLFFBQUksT0FBTyxHQUFHLFVBQVUsQ0FBeEIsSUFBd0IsQ0FBeEI7QUFFQSxRQUFJLEdBQUcsR0FBUCxFQUFBOztBQUVBLFFBQUksS0FBSyxHQUFHLEtBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBWixPQUFZLENBQVo7O0FBQ0EsUUFBSSxRQUFRLEdBQUcsS0FBQSxJQUFBLENBQUEsR0FBQSxDQUFmLFFBQWUsQ0FBZjs7QUFFQSxRQUFBLEtBQUEsRUFBVztBQUNULE1BQUEsR0FBRyxDQUFILElBQUEsQ0FBQSxLQUFBO0FBQ0Q7O0FBRUQsUUFBQSxRQUFBLEVBQWM7QUFDWixNQUFBLEdBQUcsQ0FBSCxJQUFBLENBQUEsUUFBQTtBQUNEOztBQUVELFdBQUEsR0FBQTs7Ozs7O0FBaUJFLFNBQUEsS0FBQSxDQUFBLFFBQUEsRUFBMEU7QUFDOUUsU0FBTyxRQUFRLENBQUMsSUFBVCxPQUFTLEVBQUQsQ0FBUixDQUFQLEtBQU8sRUFBUDtBQUNEOztJQUVELE87QUFBQSxXQUFBLE9BQUEsR0FBQTtBQUNFLFNBQUEsTUFBQSxHQUF1RSxJQUF2RSxJQUF1RSxFQUF2RTtBQThFRDtBQTVFQzs7Ozs7OztVQUdVLEssR0FBQSxTQUFBLEtBQUEsR0FBSztBQUFBLFFBQUEsS0FBQSxHQUFBLElBQUE7O0FBQ2IsV0FBTyxVQUFBLElBQUEsRUFBQSxLQUFBLEVBQUE7QUFBQSxhQUFpQixLQUFBLENBQUEsUUFBQSxDQUFjLElBQUksQ0FBbEIsSUFBQSxFQUF5QixLQUFLLENBQTlCLElBQUEsRUFBQSxJQUFBLEVBQXhCLEtBQXdCLENBQWpCO0FBQVAsS0FBQTs7O1VBR00sUSxHQUFBLFNBQUEsUUFBQSxDQUFBLElBQUEsRUFBQSxLQUFBLEVBRVc7QUFFakIsUUFBSSxPQUFPLEdBQUcsS0FBQSxNQUFBLENBQUEsS0FBQSxDQUFkLElBQWMsQ0FBZDs7QUFGaUIsYUFJakIsa0JBQ0UscUJBREksT0FDSixDQURGLEVBQU0sMkJBQUEsSUFBQSxHQUFBLElBQUEsR0FKVyxLQUlYLEdBSlcsa0NBSWpCLENBSmlCO0FBU2pCLFFBQUksUUFBUSxHQUFHLElBQUEsUUFBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQWYsS0FBZSxDQUFmO0FBVGlCLGFBV2pCLGtCQUNFLFFBQVEsS0FESixJQUFOLEVBQU0sMkJBQUEsSUFBQSxHQUFBLElBQUEsR0FYVyxLQVdYLEdBWFcsa0NBV2pCLENBWGlCO0FBZ0JqQixXQUFBLFFBQUE7OztVQXlDRixJLEdBQUEsU0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsRUFHRTtBQUhGLEVBQUEsUUFBQSxFQUkwQztBQUV4QyxTQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFzQixZQUFBO0FBQUEsYUFBTSxJQUE1QixJQUE0QixFQUFOO0FBQXRCLEtBQUEsRUFBQSxHQUFBLENBQUEsS0FBQSxFQUFBLFFBQUE7O0FBRUEsV0FBQSxJQUFBOzs7Ozs7QUFJSixTQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQW9DO0FBQ2xDLFVBQUEsSUFBQTtBQUNFLFNBQUE7QUFBQTtBQUFBO0FBQ0EsU0FBQTtBQUFBO0FBQUE7QUFDQSxTQUFBO0FBQUE7QUFBQTtBQUNFLGFBQUEsV0FBQTs7QUFDRjtBQUNFLGFBQUEsSUFBQTtBQU5KO0FBUUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhc3NlcnQsIGlzUHJlc2VudCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuXG5pbXBvcnQgeyBDaGFyUG9zaXRpb24sIEhic1Bvc2l0aW9uLCBJbnZpc2libGVQb3NpdGlvbiwgT2Zmc2V0S2luZCwgUG9zaXRpb25EYXRhIH0gZnJvbSAnLi9vZmZzZXQnO1xuXG4vKipcbiAqIFRoaXMgZmlsZSBpbXBsZW1lbnRzIHRoZSBEU0wgdXNlZCBieSBzcGFuIGFuZCBvZmZzZXQgaW4gcGxhY2VzIHdoZXJlIHRoZXkgbmVlZCB0byBleGhhdXN0aXZlbHlcbiAqIGNvbnNpZGVyIGFsbCBjb21iaW5hdGlvbnMgb2Ygc3RhdGVzIChIYW5kbGViYXJzIG9mZnNldHMsIGNoYXJhY3RlciBvZmZzZXRzIGFuZCBpbnZpc2libGUvYnJva2VuXG4gKiBvZmZzZXRzKS5cbiAqXG4gKiBJdCdzIHByb2JhYmx5IG92ZXJraWxsLCBidXQgaXQgbWFrZXMgdGhlIGNvZGUgdGhhdCB1c2VzIGl0IGNsZWFyLiBJdCBjb3VsZCBiZSByZWZhY3RvcmVkIG9yXG4gKiByZW1vdmVkLlxuICovXG5cbmV4cG9ydCBjb25zdCBNYXRjaEFueSA9ICdNQVRDSF9BTlknO1xuZXhwb3J0IHR5cGUgTWF0Y2hBbnkgPSAnTUFUQ0hfQU5ZJztcblxudHlwZSBNYXRjaGVzID1cbiAgfCAnQ2hhcixIYnMnXG4gIHwgJ0hicyxDaGFyJ1xuICB8ICdIYnMsSGJzJ1xuICB8ICdDaGFyLENoYXInXG4gIHwgJ0ludmlzaWJsZSxBbnknXG4gIHwgJ0FueSxJbnZpc2libGUnO1xuXG5leHBvcnQgY29uc3QgSXNJbnZpc2libGUgPSAnSVNfSU5WSVNJQkxFJztcbmV4cG9ydCB0eXBlIElzSW52aXNpYmxlID0gJ0lTX0lOVklTSUJMRSc7XG5cbnR5cGUgUGF0dGVybiA9IE9mZnNldEtpbmQgfCBJc0ludmlzaWJsZSB8IE1hdGNoQW55O1xuXG5jbGFzcyBXaGVuTGlzdDxPdXQ+IHtcbiAgX3doZW5zOiBXaGVuPE91dD5bXTtcblxuICBjb25zdHJ1Y3Rvcih3aGVuczogV2hlbjxPdXQ+W10pIHtcbiAgICB0aGlzLl93aGVucyA9IHdoZW5zO1xuICB9XG5cbiAgZmlyc3Qoa2luZDogT2Zmc2V0S2luZCk6IE91dCB8IG51bGwge1xuICAgIGZvciAobGV0IHdoZW4gb2YgdGhpcy5fd2hlbnMpIHtcbiAgICAgIGxldCB2YWx1ZSA9IHdoZW4ubWF0Y2goa2luZCk7XG4gICAgICBpZiAoaXNQcmVzZW50KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdmFsdWVbMF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuY2xhc3MgV2hlbjxPdXQ+IHtcbiAgX21hcDogTWFwPFBhdHRlcm4sIE91dD4gPSBuZXcgTWFwKCk7XG5cbiAgZ2V0KHBhdHRlcm46IFBhdHRlcm4sIG9yOiAoKSA9PiBPdXQpOiBPdXQge1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuX21hcC5nZXQocGF0dGVybik7XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICB2YWx1ZSA9IG9yKCk7XG5cbiAgICB0aGlzLl9tYXAuc2V0KHBhdHRlcm4sIHZhbHVlKTtcblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGFkZChwYXR0ZXJuOiBQYXR0ZXJuLCBvdXQ6IE91dCk6IHZvaWQge1xuICAgIHRoaXMuX21hcC5zZXQocGF0dGVybiwgb3V0KTtcbiAgfVxuXG4gIG1hdGNoKGtpbmQ6IE9mZnNldEtpbmQpOiBPdXRbXSB7XG4gICAgbGV0IHBhdHRlcm4gPSBwYXR0ZXJuRm9yKGtpbmQpO1xuXG4gICAgbGV0IG91dDogT3V0W10gPSBbXTtcblxuICAgIGxldCBleGFjdCA9IHRoaXMuX21hcC5nZXQocGF0dGVybik7XG4gICAgbGV0IGZhbGxiYWNrID0gdGhpcy5fbWFwLmdldChNYXRjaEFueSk7XG5cbiAgICBpZiAoZXhhY3QpIHtcbiAgICAgIG91dC5wdXNoKGV4YWN0KTtcbiAgICB9XG5cbiAgICBpZiAoZmFsbGJhY2spIHtcbiAgICAgIG91dC5wdXNoKGZhbGxiYWNrKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59XG5cbnR5cGUgRXhoYXVzdGl2ZUNoZWNrPE91dCwgSW4gZXh0ZW5kcyBNYXRjaGVzLCBSZW1vdmVkIGV4dGVuZHMgTWF0Y2hlcz4gPSBFeGNsdWRlPFxuICBJbixcbiAgUmVtb3ZlZFxuPiBleHRlbmRzIG5ldmVyXG4gID8gRXhoYXVzdGl2ZU1hdGNoZXI8T3V0PlxuICA6IE1hdGNoZXI8T3V0LCBFeGNsdWRlPEluLCBSZW1vdmVkPj47XG5cbmV4cG9ydCB0eXBlIE1hdGNoRm48T3V0PiA9IChsZWZ0OiBQb3NpdGlvbkRhdGEsIHJpZ2h0OiBQb3NpdGlvbkRhdGEpID0+IE91dDtcblxuaW50ZXJmYWNlIEV4aGF1c3RpdmVNYXRjaGVyPE91dD4ge1xuICBjaGVjaygpOiBNYXRjaEZuPE91dD47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXRjaDxPdXQ+KGNhbGxiYWNrOiAobTogTWF0Y2hlcjxPdXQ+KSA9PiBFeGhhdXN0aXZlTWF0Y2hlcjxPdXQ+KTogTWF0Y2hGbjxPdXQ+IHtcbiAgcmV0dXJuIGNhbGxiYWNrKG5ldyBNYXRjaGVyKCkpLmNoZWNrKCk7XG59XG5cbmNsYXNzIE1hdGNoZXI8T3V0LCBNIGV4dGVuZHMgTWF0Y2hlcyA9IE1hdGNoZXM+IHtcbiAgX3doZW5zOiBXaGVuPFdoZW48KGxlZnQ6IFBvc2l0aW9uRGF0YSwgcmlnaHQ6IFBvc2l0aW9uRGF0YSkgPT4gT3V0Pj4gPSBuZXcgV2hlbigpO1xuXG4gIC8qKlxuICAgKiBZb3UgZGlkbid0IGV4aGF1c3RpdmVseSBtYXRjaCBhbGwgcG9zc2liaWxpdGllcy5cbiAgICovXG4gIHByb3RlY3RlZCBjaGVjaygpOiBNYXRjaEZuPE91dD4ge1xuICAgIHJldHVybiAobGVmdCwgcmlnaHQpID0+IHRoaXMubWF0Y2hGb3IobGVmdC5raW5kLCByaWdodC5raW5kKShsZWZ0LCByaWdodCk7XG4gIH1cblxuICBwcml2YXRlIG1hdGNoRm9yKFxuICAgIGxlZnQ6IE9mZnNldEtpbmQsXG4gICAgcmlnaHQ6IE9mZnNldEtpbmRcbiAgKTogKGxlZnQ6IFBvc2l0aW9uRGF0YSwgcmlnaHQ6IFBvc2l0aW9uRGF0YSkgPT4gT3V0IHtcbiAgICBsZXQgbmVzdGVkcyA9IHRoaXMuX3doZW5zLm1hdGNoKGxlZnQpO1xuXG4gICAgYXNzZXJ0KFxuICAgICAgaXNQcmVzZW50KG5lc3RlZHMpLFxuICAgICAgYG5vIG1hdGNoIGRlZmluZWQgZm9yICgke2xlZnR9LCAke3JpZ2h0fSkgYW5kIG5vIEFueU1hdGNoIGRlZmluZWQgZWl0aGVyYFxuICAgICk7XG5cbiAgICBsZXQgY2FsbGJhY2sgPSBuZXcgV2hlbkxpc3QobmVzdGVkcykuZmlyc3QocmlnaHQpO1xuXG4gICAgYXNzZXJ0KFxuICAgICAgY2FsbGJhY2sgIT09IG51bGwsXG4gICAgICBgbm8gbWF0Y2ggZGVmaW5lZCBmb3IgKCR7bGVmdH0sICR7cmlnaHR9KSBhbmQgbm8gQW55TWF0Y2ggZGVmaW5lZCBlaXRoZXJgXG4gICAgKTtcblxuICAgIHJldHVybiBjYWxsYmFjaztcbiAgfVxuXG4gIC8vIFRoaXMgYmlnIGJsb2NrIGlzIHRoZSBidWxrIG9mIHRoZSBoZWF2eSBsaWZ0aW5nIGluIHRoaXMgZmlsZS4gSXQgZmFjaWxpdGF0ZXMgZXhoYXVzdGl2ZW5lc3NcbiAgLy8gY2hlY2tpbmcgc28gdGhhdCBtYXRjaGVycyBjYW4gZW5zdXJlIHRoZXkndmUgYWN0dWFsbHkgY292ZXJlZCBhbGwgdGhlIGNhc2VzIChhbmQgVHlwZVNjcmlwdFxuICAvLyB3aWxsIHRyZWF0IGl0IGFzIGFuIGV4aGF1c3RpdmUgbWF0Y2gpLlxuICB3aGVuKFxuICAgIGxlZnQ6IE9mZnNldEtpbmQuQ2hhclBvc2l0aW9uLFxuICAgIHJpZ2h0OiBPZmZzZXRLaW5kLkhic1Bvc2l0aW9uLFxuICAgIGNhbGxiYWNrOiAobGVmdDogQ2hhclBvc2l0aW9uLCByaWdodDogSGJzUG9zaXRpb24pID0+IE91dFxuICApOiBFeGhhdXN0aXZlQ2hlY2s8T3V0LCBNLCAnQ2hhcixIYnMnPjtcbiAgd2hlbihcbiAgICBsZWZ0OiBPZmZzZXRLaW5kLkhic1Bvc2l0aW9uLFxuICAgIHJpZ2h0OiBPZmZzZXRLaW5kLkNoYXJQb3NpdGlvbixcbiAgICBjYWxsYmFjazogKGxlZnQ6IEhic1Bvc2l0aW9uLCByaWdodDogQ2hhclBvc2l0aW9uKSA9PiBPdXRcbiAgKTogRXhoYXVzdGl2ZUNoZWNrPE91dCwgTSwgJ0hicyxDaGFyJz47XG4gIHdoZW4oXG4gICAgbGVmdDogT2Zmc2V0S2luZC5IYnNQb3NpdGlvbixcbiAgICByaWdodDogT2Zmc2V0S2luZC5IYnNQb3NpdGlvbixcbiAgICBjYWxsYmFjazogKGxlZnQ6IEhic1Bvc2l0aW9uLCByaWdodDogSGJzUG9zaXRpb24pID0+IE91dFxuICApOiBFeGhhdXN0aXZlQ2hlY2s8T3V0LCBNLCAnSGJzLEhicyc+O1xuICB3aGVuKFxuICAgIGxlZnQ6IE9mZnNldEtpbmQuQ2hhclBvc2l0aW9uLFxuICAgIHJpZ2h0OiBPZmZzZXRLaW5kLkNoYXJQb3NpdGlvbixcbiAgICBjYWxsYmFjazogKGxlZnQ6IENoYXJQb3NpdGlvbiwgcmlnaHQ6IENoYXJQb3NpdGlvbikgPT4gT3V0XG4gICk6IEV4aGF1c3RpdmVDaGVjazxPdXQsIE0sICdDaGFyLENoYXInPjtcbiAgd2hlbihcbiAgICBsZWZ0OiBJc0ludmlzaWJsZSxcbiAgICByaWdodDogTWF0Y2hBbnksXG4gICAgY2FsbGJhY2s6IChsZWZ0OiBJbnZpc2libGVQb3NpdGlvbiwgcmlnaHQ6IFBvc2l0aW9uRGF0YSkgPT4gT3V0XG4gICk6IE1hdGNoZXI8T3V0LCBFeGNsdWRlPE0sICdJbnZpc2libGUsQW55Jz4+O1xuICB3aGVuKFxuICAgIGxlZnQ6IE1hdGNoQW55LFxuICAgIHJpZ2h0OiBJc0ludmlzaWJsZSxcbiAgICBjYWxsYmFjazogKGxlZnQ6IFBvc2l0aW9uRGF0YSwgcmlnaHQ6IEludmlzaWJsZVBvc2l0aW9uKSA9PiBPdXRcbiAgKTogRXhoYXVzdGl2ZUNoZWNrPE91dCwgTSwgJ0FueSxJbnZpc2libGUnPjtcbiAgd2hlbihcbiAgICBsZWZ0OiBNYXRjaEFueSxcbiAgICByaWdodDogTWF0Y2hBbnksXG4gICAgY2FsbGJhY2s6IChsZWZ0OiBQb3NpdGlvbkRhdGEsIHJpZ2h0OiBQb3NpdGlvbkRhdGEpID0+IE91dFxuICApOiBFeGhhdXN0aXZlTWF0Y2hlcjxPdXQ+O1xuICB3aGVuKFxuICAgIGxlZnQ6IFBhdHRlcm4sXG4gICAgcmlnaHQ6IFBhdHRlcm4sXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICBjYWxsYmFjazogKGxlZnQ6IGFueSwgcmlnaHQ6IGFueSkgPT4gT3V0XG4gICk6IE1hdGNoZXI8T3V0LCBNYXRjaGVzPiB8IEV4aGF1c3RpdmVNYXRjaGVyPE91dD4ge1xuICAgIHRoaXMuX3doZW5zLmdldChsZWZ0LCAoKSA9PiBuZXcgV2hlbigpKS5hZGQocmlnaHQsIGNhbGxiYWNrKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbmZ1bmN0aW9uIHBhdHRlcm5Gb3Ioa2luZDogT2Zmc2V0S2luZCk6IFBhdHRlcm4ge1xuICBzd2l0Y2ggKGtpbmQpIHtcbiAgICBjYXNlIE9mZnNldEtpbmQuQnJva2VuOlxuICAgIGNhc2UgT2Zmc2V0S2luZC5JbnRlcm5hbHNTeW50aGV0aWM6XG4gICAgY2FzZSBPZmZzZXRLaW5kLk5vbkV4aXN0ZW50OlxuICAgICAgcmV0dXJuIElzSW52aXNpYmxlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ga2luZDtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==