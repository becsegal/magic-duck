function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } it = o[Symbol.iterator](); return it.next.bind(it); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

import { assert, isPresent } from '@glimmer/util';
/**
 * This file implements the DSL used by span and offset in places where they need to exhaustively
 * consider all combinations of states (Handlebars offsets, character offsets and invisible/broken
 * offsets).
 *
 * It's probably overkill, but it makes the code that uses it clear. It could be refactored or
 * removed.
 */

export var MatchAny = 'MATCH_ANY';
export var IsInvisible = 'IS_INVISIBLE';

var WhenList = /*#__PURE__*/function () {
  function WhenList(whens) {
    this._whens = whens;
  }

  var _proto = WhenList.prototype;

  _proto.first = function first(kind) {
    for (var _iterator = _createForOfIteratorHelperLoose(this._whens), _step; !(_step = _iterator()).done;) {
      var when = _step.value;
      var value = when.match(kind);

      if (isPresent(value)) {
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

export function match(callback) {
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

    false && assert(isPresent(nesteds), "no match defined for (" + left + ", " + right + ") and no AnyMatch defined either");
    var callback = new WhenList(nesteds).first(right);
    false && assert(callback !== null, "no match defined for (" + left + ", " + right + ") and no AnyMatch defined either");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvc291cmNlL2xvYy9tYXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxTQUFBLE1BQUEsRUFBQSxTQUFBLFFBQUEsZUFBQTtBQUlBOzs7Ozs7Ozs7QUFTQSxPQUFPLElBQU0sUUFBUSxHQUFkLFdBQUE7QUFXUCxPQUFPLElBQU0sV0FBVyxHQUFqQixjQUFBOztJQUtQLFE7QUFHRSxvQkFBQSxLQUFBLEVBQThCO0FBQzVCLFNBQUEsTUFBQSxHQUFBLEtBQUE7QUFDRDs7OztTQUVELEssR0FBQSxlQUFLLElBQUwsRUFBc0I7QUFDcEIseURBQWlCLEtBQWpCLE1BQUEsd0NBQThCO0FBQUEsVUFBOUIsSUFBOEI7QUFDNUIsVUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFKLEtBQUEsQ0FBWixJQUFZLENBQVo7O0FBQ0EsVUFBSSxTQUFTLENBQWIsS0FBYSxDQUFiLEVBQXNCO0FBQ3BCLGVBQU8sS0FBSyxDQUFaLENBQVksQ0FBWjtBQUNEO0FBQ0Y7O0FBRUQsV0FBQSxJQUFBO0FBQ0QsRzs7Ozs7SUFHSCxJO0FBQUEsa0JBQUE7QUFDRSxTQUFBLElBQUEsR0FBMEIsSUFBMUIsR0FBMEIsRUFBMUI7QUFzQ0Q7Ozs7VUFwQ0MsRyxHQUFBLGFBQUcsT0FBSCxFQUFHLEVBQUgsRUFBbUM7QUFDakMsUUFBSSxLQUFLLEdBQUcsS0FBQSxJQUFBLENBQUEsR0FBQSxDQUFaLE9BQVksQ0FBWjs7QUFFQSxRQUFBLEtBQUEsRUFBVztBQUNULGFBQUEsS0FBQTtBQUNEOztBQUVELElBQUEsS0FBSyxHQUFHLEVBQVIsRUFBQTs7QUFFQSxTQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBLEtBQUE7O0FBRUEsV0FBQSxLQUFBO0FBQ0QsRzs7VUFFRCxHLEdBQUEsYUFBRyxPQUFILEVBQUcsR0FBSCxFQUE4QjtBQUM1QixTQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBLEdBQUE7QUFDRCxHOztVQUVELEssR0FBQSxlQUFLLElBQUwsRUFBc0I7QUFDcEIsUUFBSSxPQUFPLEdBQUcsVUFBVSxDQUF4QixJQUF3QixDQUF4QjtBQUVBLFFBQUksR0FBRyxHQUFQLEVBQUE7O0FBRUEsUUFBSSxLQUFLLEdBQUcsS0FBQSxJQUFBLENBQUEsR0FBQSxDQUFaLE9BQVksQ0FBWjs7QUFDQSxRQUFJLFFBQVEsR0FBRyxLQUFBLElBQUEsQ0FBQSxHQUFBLENBQWYsUUFBZSxDQUFmOztBQUVBLFFBQUEsS0FBQSxFQUFXO0FBQ1QsTUFBQSxHQUFHLENBQUgsSUFBQSxDQUFBLEtBQUE7QUFDRDs7QUFFRCxRQUFBLFFBQUEsRUFBYztBQUNaLE1BQUEsR0FBRyxDQUFILElBQUEsQ0FBQSxRQUFBO0FBQ0Q7O0FBRUQsV0FBQSxHQUFBO0FBQ0QsRzs7Ozs7QUFnQkgsT0FBTSxTQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQTBFO0FBQzlFLFNBQU8sUUFBUSxDQUFDLElBQVQsT0FBUyxFQUFELENBQVIsQ0FBUCxLQUFPLEVBQVA7QUFDRDs7SUFFRCxPO0FBQUEscUJBQUE7QUFDRSxTQUFBLE1BQUEsR0FBdUUsSUFBdkUsSUFBdUUsRUFBdkU7QUE4RUQ7QUE1RUM7Ozs7Ozs7VUFHVSxLLEdBQUEsaUJBQUs7QUFBQTs7QUFDYixXQUFPLFVBQUEsSUFBQSxFQUFBLEtBQUE7QUFBQSxhQUFpQixLQUFBLENBQUEsUUFBQSxDQUFjLElBQUksQ0FBbEIsSUFBQSxFQUF5QixLQUFLLENBQTlCLElBQUEsRUFBQSxJQUFBLEVBQXhCLEtBQXdCLENBQWpCO0FBQUEsS0FBUDtBQUNELEc7O1VBRU8sUSxHQUFBLGtCQUFRLElBQVIsRUFBUSxLQUFSLEVBRVc7QUFFakIsUUFBSSxPQUFPLEdBQUcsS0FBQSxNQUFBLENBQUEsS0FBQSxDQUFkLElBQWMsQ0FBZDs7QUFGaUIsYUFJakIsTUFBTSxDQUNKLFNBQVMsQ0FETCxPQUNLLENBREwsNkJBRXFCLElBRnJCLFVBSlcsS0FJWCxzQ0FKVztBQVNqQixRQUFJLFFBQVEsR0FBRyxJQUFBLFFBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFmLEtBQWUsQ0FBZjtBQVRpQixhQVdqQixNQUFNLENBQ0osUUFBUSxLQURKLElBQUEsNkJBRXFCLElBRnJCLFVBWFcsS0FXWCxzQ0FYVztBQWdCakIsV0FBQSxRQUFBO0FBQ0QsRzs7VUF3Q0QsSSxHQUFBLGNBQUksSUFBSixFQUFJLEtBQUosRUFHRTtBQUhFLEVBQUEsUUFBSixFQUkwQztBQUV4QyxTQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFzQjtBQUFBLGFBQU0sSUFBNUIsSUFBNEIsRUFBTjtBQUFBLEtBQXRCLEVBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxRQUFBOztBQUVBLFdBQUEsSUFBQTtBQUNELEc7Ozs7O0FBR0gsU0FBQSxVQUFBLENBQUEsSUFBQSxFQUFvQztBQUNsQyxVQUFBLElBQUE7QUFDRSxTQUFBO0FBQUE7QUFBQTtBQUNBLFNBQUE7QUFBQTtBQUFBO0FBQ0EsU0FBQTtBQUFBO0FBQUE7QUFDRSxhQUFBLFdBQUE7O0FBQ0Y7QUFDRSxhQUFBLElBQUE7QUFOSjtBQVFEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXNzZXJ0LCBpc1ByZXNlbnQgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcblxuaW1wb3J0IHsgQ2hhclBvc2l0aW9uLCBIYnNQb3NpdGlvbiwgSW52aXNpYmxlUG9zaXRpb24sIE9mZnNldEtpbmQsIFBvc2l0aW9uRGF0YSB9IGZyb20gJy4vb2Zmc2V0JztcblxuLyoqXG4gKiBUaGlzIGZpbGUgaW1wbGVtZW50cyB0aGUgRFNMIHVzZWQgYnkgc3BhbiBhbmQgb2Zmc2V0IGluIHBsYWNlcyB3aGVyZSB0aGV5IG5lZWQgdG8gZXhoYXVzdGl2ZWx5XG4gKiBjb25zaWRlciBhbGwgY29tYmluYXRpb25zIG9mIHN0YXRlcyAoSGFuZGxlYmFycyBvZmZzZXRzLCBjaGFyYWN0ZXIgb2Zmc2V0cyBhbmQgaW52aXNpYmxlL2Jyb2tlblxuICogb2Zmc2V0cykuXG4gKlxuICogSXQncyBwcm9iYWJseSBvdmVya2lsbCwgYnV0IGl0IG1ha2VzIHRoZSBjb2RlIHRoYXQgdXNlcyBpdCBjbGVhci4gSXQgY291bGQgYmUgcmVmYWN0b3JlZCBvclxuICogcmVtb3ZlZC5cbiAqL1xuXG5leHBvcnQgY29uc3QgTWF0Y2hBbnkgPSAnTUFUQ0hfQU5ZJztcbmV4cG9ydCB0eXBlIE1hdGNoQW55ID0gJ01BVENIX0FOWSc7XG5cbnR5cGUgTWF0Y2hlcyA9XG4gIHwgJ0NoYXIsSGJzJ1xuICB8ICdIYnMsQ2hhcidcbiAgfCAnSGJzLEhicydcbiAgfCAnQ2hhcixDaGFyJ1xuICB8ICdJbnZpc2libGUsQW55J1xuICB8ICdBbnksSW52aXNpYmxlJztcblxuZXhwb3J0IGNvbnN0IElzSW52aXNpYmxlID0gJ0lTX0lOVklTSUJMRSc7XG5leHBvcnQgdHlwZSBJc0ludmlzaWJsZSA9ICdJU19JTlZJU0lCTEUnO1xuXG50eXBlIFBhdHRlcm4gPSBPZmZzZXRLaW5kIHwgSXNJbnZpc2libGUgfCBNYXRjaEFueTtcblxuY2xhc3MgV2hlbkxpc3Q8T3V0PiB7XG4gIF93aGVuczogV2hlbjxPdXQ+W107XG5cbiAgY29uc3RydWN0b3Iod2hlbnM6IFdoZW48T3V0PltdKSB7XG4gICAgdGhpcy5fd2hlbnMgPSB3aGVucztcbiAgfVxuXG4gIGZpcnN0KGtpbmQ6IE9mZnNldEtpbmQpOiBPdXQgfCBudWxsIHtcbiAgICBmb3IgKGxldCB3aGVuIG9mIHRoaXMuX3doZW5zKSB7XG4gICAgICBsZXQgdmFsdWUgPSB3aGVuLm1hdGNoKGtpbmQpO1xuICAgICAgaWYgKGlzUHJlc2VudCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlWzBdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmNsYXNzIFdoZW48T3V0PiB7XG4gIF9tYXA6IE1hcDxQYXR0ZXJuLCBPdXQ+ID0gbmV3IE1hcCgpO1xuXG4gIGdldChwYXR0ZXJuOiBQYXR0ZXJuLCBvcjogKCkgPT4gT3V0KTogT3V0IHtcbiAgICBsZXQgdmFsdWUgPSB0aGlzLl9tYXAuZ2V0KHBhdHRlcm4pO1xuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgdmFsdWUgPSBvcigpO1xuXG4gICAgdGhpcy5fbWFwLnNldChwYXR0ZXJuLCB2YWx1ZSk7XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBhZGQocGF0dGVybjogUGF0dGVybiwgb3V0OiBPdXQpOiB2b2lkIHtcbiAgICB0aGlzLl9tYXAuc2V0KHBhdHRlcm4sIG91dCk7XG4gIH1cblxuICBtYXRjaChraW5kOiBPZmZzZXRLaW5kKTogT3V0W10ge1xuICAgIGxldCBwYXR0ZXJuID0gcGF0dGVybkZvcihraW5kKTtcblxuICAgIGxldCBvdXQ6IE91dFtdID0gW107XG5cbiAgICBsZXQgZXhhY3QgPSB0aGlzLl9tYXAuZ2V0KHBhdHRlcm4pO1xuICAgIGxldCBmYWxsYmFjayA9IHRoaXMuX21hcC5nZXQoTWF0Y2hBbnkpO1xuXG4gICAgaWYgKGV4YWN0KSB7XG4gICAgICBvdXQucHVzaChleGFjdCk7XG4gICAgfVxuXG4gICAgaWYgKGZhbGxiYWNrKSB7XG4gICAgICBvdXQucHVzaChmYWxsYmFjayk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufVxuXG50eXBlIEV4aGF1c3RpdmVDaGVjazxPdXQsIEluIGV4dGVuZHMgTWF0Y2hlcywgUmVtb3ZlZCBleHRlbmRzIE1hdGNoZXM+ID0gRXhjbHVkZTxcbiAgSW4sXG4gIFJlbW92ZWRcbj4gZXh0ZW5kcyBuZXZlclxuICA/IEV4aGF1c3RpdmVNYXRjaGVyPE91dD5cbiAgOiBNYXRjaGVyPE91dCwgRXhjbHVkZTxJbiwgUmVtb3ZlZD4+O1xuXG5leHBvcnQgdHlwZSBNYXRjaEZuPE91dD4gPSAobGVmdDogUG9zaXRpb25EYXRhLCByaWdodDogUG9zaXRpb25EYXRhKSA9PiBPdXQ7XG5cbmludGVyZmFjZSBFeGhhdXN0aXZlTWF0Y2hlcjxPdXQ+IHtcbiAgY2hlY2soKTogTWF0Y2hGbjxPdXQ+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWF0Y2g8T3V0PihjYWxsYmFjazogKG06IE1hdGNoZXI8T3V0PikgPT4gRXhoYXVzdGl2ZU1hdGNoZXI8T3V0Pik6IE1hdGNoRm48T3V0PiB7XG4gIHJldHVybiBjYWxsYmFjayhuZXcgTWF0Y2hlcigpKS5jaGVjaygpO1xufVxuXG5jbGFzcyBNYXRjaGVyPE91dCwgTSBleHRlbmRzIE1hdGNoZXMgPSBNYXRjaGVzPiB7XG4gIF93aGVuczogV2hlbjxXaGVuPChsZWZ0OiBQb3NpdGlvbkRhdGEsIHJpZ2h0OiBQb3NpdGlvbkRhdGEpID0+IE91dD4+ID0gbmV3IFdoZW4oKTtcblxuICAvKipcbiAgICogWW91IGRpZG4ndCBleGhhdXN0aXZlbHkgbWF0Y2ggYWxsIHBvc3NpYmlsaXRpZXMuXG4gICAqL1xuICBwcm90ZWN0ZWQgY2hlY2soKTogTWF0Y2hGbjxPdXQ+IHtcbiAgICByZXR1cm4gKGxlZnQsIHJpZ2h0KSA9PiB0aGlzLm1hdGNoRm9yKGxlZnQua2luZCwgcmlnaHQua2luZCkobGVmdCwgcmlnaHQpO1xuICB9XG5cbiAgcHJpdmF0ZSBtYXRjaEZvcihcbiAgICBsZWZ0OiBPZmZzZXRLaW5kLFxuICAgIHJpZ2h0OiBPZmZzZXRLaW5kXG4gICk6IChsZWZ0OiBQb3NpdGlvbkRhdGEsIHJpZ2h0OiBQb3NpdGlvbkRhdGEpID0+IE91dCB7XG4gICAgbGV0IG5lc3RlZHMgPSB0aGlzLl93aGVucy5tYXRjaChsZWZ0KTtcblxuICAgIGFzc2VydChcbiAgICAgIGlzUHJlc2VudChuZXN0ZWRzKSxcbiAgICAgIGBubyBtYXRjaCBkZWZpbmVkIGZvciAoJHtsZWZ0fSwgJHtyaWdodH0pIGFuZCBubyBBbnlNYXRjaCBkZWZpbmVkIGVpdGhlcmBcbiAgICApO1xuXG4gICAgbGV0IGNhbGxiYWNrID0gbmV3IFdoZW5MaXN0KG5lc3RlZHMpLmZpcnN0KHJpZ2h0KTtcblxuICAgIGFzc2VydChcbiAgICAgIGNhbGxiYWNrICE9PSBudWxsLFxuICAgICAgYG5vIG1hdGNoIGRlZmluZWQgZm9yICgke2xlZnR9LCAke3JpZ2h0fSkgYW5kIG5vIEFueU1hdGNoIGRlZmluZWQgZWl0aGVyYFxuICAgICk7XG5cbiAgICByZXR1cm4gY2FsbGJhY2s7XG4gIH1cblxuICAvLyBUaGlzIGJpZyBibG9jayBpcyB0aGUgYnVsayBvZiB0aGUgaGVhdnkgbGlmdGluZyBpbiB0aGlzIGZpbGUuIEl0IGZhY2lsaXRhdGVzIGV4aGF1c3RpdmVuZXNzXG4gIC8vIGNoZWNraW5nIHNvIHRoYXQgbWF0Y2hlcnMgY2FuIGVuc3VyZSB0aGV5J3ZlIGFjdHVhbGx5IGNvdmVyZWQgYWxsIHRoZSBjYXNlcyAoYW5kIFR5cGVTY3JpcHRcbiAgLy8gd2lsbCB0cmVhdCBpdCBhcyBhbiBleGhhdXN0aXZlIG1hdGNoKS5cbiAgd2hlbihcbiAgICBsZWZ0OiBPZmZzZXRLaW5kLkNoYXJQb3NpdGlvbixcbiAgICByaWdodDogT2Zmc2V0S2luZC5IYnNQb3NpdGlvbixcbiAgICBjYWxsYmFjazogKGxlZnQ6IENoYXJQb3NpdGlvbiwgcmlnaHQ6IEhic1Bvc2l0aW9uKSA9PiBPdXRcbiAgKTogRXhoYXVzdGl2ZUNoZWNrPE91dCwgTSwgJ0NoYXIsSGJzJz47XG4gIHdoZW4oXG4gICAgbGVmdDogT2Zmc2V0S2luZC5IYnNQb3NpdGlvbixcbiAgICByaWdodDogT2Zmc2V0S2luZC5DaGFyUG9zaXRpb24sXG4gICAgY2FsbGJhY2s6IChsZWZ0OiBIYnNQb3NpdGlvbiwgcmlnaHQ6IENoYXJQb3NpdGlvbikgPT4gT3V0XG4gICk6IEV4aGF1c3RpdmVDaGVjazxPdXQsIE0sICdIYnMsQ2hhcic+O1xuICB3aGVuKFxuICAgIGxlZnQ6IE9mZnNldEtpbmQuSGJzUG9zaXRpb24sXG4gICAgcmlnaHQ6IE9mZnNldEtpbmQuSGJzUG9zaXRpb24sXG4gICAgY2FsbGJhY2s6IChsZWZ0OiBIYnNQb3NpdGlvbiwgcmlnaHQ6IEhic1Bvc2l0aW9uKSA9PiBPdXRcbiAgKTogRXhoYXVzdGl2ZUNoZWNrPE91dCwgTSwgJ0hicyxIYnMnPjtcbiAgd2hlbihcbiAgICBsZWZ0OiBPZmZzZXRLaW5kLkNoYXJQb3NpdGlvbixcbiAgICByaWdodDogT2Zmc2V0S2luZC5DaGFyUG9zaXRpb24sXG4gICAgY2FsbGJhY2s6IChsZWZ0OiBDaGFyUG9zaXRpb24sIHJpZ2h0OiBDaGFyUG9zaXRpb24pID0+IE91dFxuICApOiBFeGhhdXN0aXZlQ2hlY2s8T3V0LCBNLCAnQ2hhcixDaGFyJz47XG4gIHdoZW4oXG4gICAgbGVmdDogSXNJbnZpc2libGUsXG4gICAgcmlnaHQ6IE1hdGNoQW55LFxuICAgIGNhbGxiYWNrOiAobGVmdDogSW52aXNpYmxlUG9zaXRpb24sIHJpZ2h0OiBQb3NpdGlvbkRhdGEpID0+IE91dFxuICApOiBNYXRjaGVyPE91dCwgRXhjbHVkZTxNLCAnSW52aXNpYmxlLEFueSc+PjtcbiAgd2hlbihcbiAgICBsZWZ0OiBNYXRjaEFueSxcbiAgICByaWdodDogSXNJbnZpc2libGUsXG4gICAgY2FsbGJhY2s6IChsZWZ0OiBQb3NpdGlvbkRhdGEsIHJpZ2h0OiBJbnZpc2libGVQb3NpdGlvbikgPT4gT3V0XG4gICk6IEV4aGF1c3RpdmVDaGVjazxPdXQsIE0sICdBbnksSW52aXNpYmxlJz47XG4gIHdoZW4oXG4gICAgbGVmdDogTWF0Y2hBbnksXG4gICAgcmlnaHQ6IE1hdGNoQW55LFxuICAgIGNhbGxiYWNrOiAobGVmdDogUG9zaXRpb25EYXRhLCByaWdodDogUG9zaXRpb25EYXRhKSA9PiBPdXRcbiAgKTogRXhoYXVzdGl2ZU1hdGNoZXI8T3V0PjtcbiAgd2hlbihcbiAgICBsZWZ0OiBQYXR0ZXJuLFxuICAgIHJpZ2h0OiBQYXR0ZXJuLFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgY2FsbGJhY2s6IChsZWZ0OiBhbnksIHJpZ2h0OiBhbnkpID0+IE91dFxuICApOiBNYXRjaGVyPE91dCwgTWF0Y2hlcz4gfCBFeGhhdXN0aXZlTWF0Y2hlcjxPdXQ+IHtcbiAgICB0aGlzLl93aGVucy5nZXQobGVmdCwgKCkgPT4gbmV3IFdoZW4oKSkuYWRkKHJpZ2h0LCBjYWxsYmFjayk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG5mdW5jdGlvbiBwYXR0ZXJuRm9yKGtpbmQ6IE9mZnNldEtpbmQpOiBQYXR0ZXJuIHtcbiAgc3dpdGNoIChraW5kKSB7XG4gICAgY2FzZSBPZmZzZXRLaW5kLkJyb2tlbjpcbiAgICBjYXNlIE9mZnNldEtpbmQuSW50ZXJuYWxzU3ludGhldGljOlxuICAgIGNhc2UgT2Zmc2V0S2luZC5Ob25FeGlzdGVudDpcbiAgICAgIHJldHVybiBJc0ludmlzaWJsZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGtpbmQ7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=