function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// eslint-disable-next-line import/no-extraneous-dependencies
import { UNKNOWN_POSITION } from '../location';
import { match, MatchAny } from './match';
import { span } from './span';
/**
 * Used to indicate that an attempt to convert a `SourcePosition` to a character offset failed. It
 * is separate from `null` so that `null` can be used to indicate that the computation wasn't yet
 * attempted (and therefore to cache the failure)
 */

export var BROKEN = 'BROKEN';
/**
 * A `SourceOffset` represents a single position in the source.
 *
 * There are three kinds of backing data for `SourceOffset` objects:
 *
 * - `CharPosition`, which contains a character offset into the raw source string
 * - `HbsPosition`, which contains a `SourcePosition` from the Handlebars AST, which can be
 *   converted to a `CharPosition` on demand.
 * - `InvisiblePosition`, which represents a position not in source (@see {InvisiblePosition})
 */

export var SourceOffset = /*#__PURE__*/function () {
  function SourceOffset(data) {
    this.data = data;
  }
  /**
   * Create a `SourceOffset` from a Handlebars `SourcePosition`. It's stored as-is, and converted
   * into a character offset on demand, which avoids unnecessarily computing the offset of every
   * `SourceLocation`, but also means that broken `SourcePosition`s are not always detected.
   */


  SourceOffset.forHbsPos = function forHbsPos(source, pos) {
    return new HbsPosition(source, pos, null).wrap();
  }
  /**
   * Create a `SourceOffset` that corresponds to a broken `SourcePosition`. This means that the
   * calling code determined (or knows) that the `SourceLocation` doesn't correspond correctly to
   * any part of the source.
   */
  ;

  SourceOffset.broken = function broken(pos) {
    if (pos === void 0) {
      pos = UNKNOWN_POSITION;
    }

    return new InvisiblePosition("Broken"
    /* Broken */
    , pos).wrap();
  }
  /**
   * Get the character offset for this `SourceOffset`, if possible.
   */
  ;

  var _proto = SourceOffset.prototype;

  /**
   * Compare this offset with another one.
   *
   * If both offsets are `HbsPosition`s, they're equivalent as long as their lines and columns are
   * the same. This avoids computing offsets unnecessarily.
   *
   * Otherwise, two `SourceOffset`s are equivalent if their successfully computed character offsets
   * are the same.
   */
  _proto.eql = function eql(right) {
    return _eql(this.data, right.data);
  }
  /**
   * Create a span that starts from this source offset and ends with another source offset. Avoid
   * computing character offsets if both `SourceOffset`s are still lazy.
   */
  ;

  _proto.until = function until(other) {
    return span(this.data, other.data);
  }
  /**
   * Create a `SourceOffset` by moving the character position represented by this source offset
   * forward or backward (if `by` is negative), if possible.
   *
   * If this `SourceOffset` can't compute a valid character offset, `move` returns a broken offset.
   *
   * If the resulting character offset is less than 0 or greater than the size of the source, `move`
   * returns a broken offset.
   */
  ;

  _proto.move = function move(by) {
    var charPos = this.data.toCharPos();

    if (charPos === null) {
      return SourceOffset.broken();
    } else {
      var result = charPos.offset + by;

      if (charPos.source.check(result)) {
        return new CharPosition(charPos.source, result).wrap();
      } else {
        return SourceOffset.broken();
      }
    }
  }
  /**
   * Create a new `SourceSpan` that represents a collapsed range at this source offset. Avoid
   * computing the character offset if it has not already been computed.
   */
  ;

  _proto.collapsed = function collapsed() {
    return span(this.data, this.data);
  }
  /**
   * Convert this `SourceOffset` into a Handlebars {@see SourcePosition} for compatibility with
   * existing plugins.
   */
  ;

  _proto.toJSON = function toJSON() {
    return this.data.toJSON();
  };

  _createClass(SourceOffset, [{
    key: "offset",
    get: function get() {
      var charPos = this.data.toCharPos();
      return charPos === null ? null : charPos.offset;
    }
  }]);

  return SourceOffset;
}();
export var CharPosition = /*#__PURE__*/function () {
  function CharPosition(source, charPos) {
    this.source = source;
    this.charPos = charPos;
    this.kind = "CharPosition"
    /* CharPosition */
    ;
    /** Computed from char offset */

    this._locPos = null;
  }
  /**
   * This is already a `CharPosition`.
   *
   * {@see HbsPosition} for the alternative.
   *
   * @implements {PositionData}
   */


  var _proto2 = CharPosition.prototype;

  _proto2.toCharPos = function toCharPos() {
    return this;
  }
  /**
   * Produce a Handlebars {@see SourcePosition} for this `CharPosition`. If this `CharPosition` was
   * computed using {@see SourceOffset#move}, this will compute the `SourcePosition` for the offset.
   *
   * @implements {PositionData}
   */
  ;

  _proto2.toJSON = function toJSON() {
    var hbs = this.toHbsPos();
    return hbs === null ? UNKNOWN_POSITION : hbs.toJSON();
  };

  _proto2.wrap = function wrap() {
    return new SourceOffset(this);
  }
  /**
   * A `CharPosition` always has an offset it can produce without any additional computation.
   */
  ;

  /**
   * Convert the current character offset to an `HbsPosition`, if it was not already computed. Once
   * a `CharPosition` has computed its `HbsPosition`, it will not need to do compute it again, and
   * the same `CharPosition` is retained when used as one of the ends of a `SourceSpan`, so
   * computing the `HbsPosition` should be a one-time operation.
   */
  _proto2.toHbsPos = function toHbsPos() {
    var locPos = this._locPos;

    if (locPos === null) {
      var hbsPos = this.source.hbsPosFor(this.charPos);

      if (hbsPos === null) {
        this._locPos = locPos = BROKEN;
      } else {
        this._locPos = locPos = new HbsPosition(this.source, hbsPos, this.charPos);
      }
    }

    return locPos === BROKEN ? null : locPos;
  };

  _createClass(CharPosition, [{
    key: "offset",
    get: function get() {
      return this.charPos;
    }
  }]);

  return CharPosition;
}();
export var HbsPosition = /*#__PURE__*/function () {
  function HbsPosition(source, hbsPos, charPos) {
    if (charPos === void 0) {
      charPos = null;
    }

    this.source = source;
    this.hbsPos = hbsPos;
    this.kind = "HbsPosition"
    /* HbsPosition */
    ;
    this._charPos = charPos === null ? null : new CharPosition(source, charPos);
  }
  /**
   * Lazily compute the character offset from the {@see SourcePosition}. Once an `HbsPosition` has
   * computed its `CharPosition`, it will not need to do compute it again, and the same
   * `HbsPosition` is retained when used as one of the ends of a `SourceSpan`, so computing the
   * `CharPosition` should be a one-time operation.
   *
   * @implements {PositionData}
   */


  var _proto3 = HbsPosition.prototype;

  _proto3.toCharPos = function toCharPos() {
    var charPos = this._charPos;

    if (charPos === null) {
      var charPosNumber = this.source.charPosFor(this.hbsPos);

      if (charPosNumber === null) {
        this._charPos = charPos = BROKEN;
      } else {
        this._charPos = charPos = new CharPosition(this.source, charPosNumber);
      }
    }

    return charPos === BROKEN ? null : charPos;
  }
  /**
   * Return the {@see SourcePosition} that this `HbsPosition` was instantiated with. This operation
   * does not need to compute anything.
   *
   * @implements {PositionData}
   */
  ;

  _proto3.toJSON = function toJSON() {
    return this.hbsPos;
  };

  _proto3.wrap = function wrap() {
    return new SourceOffset(this);
  }
  /**
   * This is already an `HbsPosition`.
   *
   * {@see CharPosition} for the alternative.
   */
  ;

  _proto3.toHbsPos = function toHbsPos() {
    return this;
  };

  return HbsPosition;
}();
export var InvisiblePosition = /*#__PURE__*/function () {
  function InvisiblePosition(kind, // whatever was provided, possibly broken
  pos) {
    this.kind = kind;
    this.pos = pos;
  }
  /**
   * A broken position cannot be turned into a {@see CharacterPosition}.
   */


  var _proto4 = InvisiblePosition.prototype;

  _proto4.toCharPos = function toCharPos() {
    return null;
  }
  /**
   * The serialization of an `InvisiblePosition is whatever Handlebars {@see SourcePosition} was
   * originally identified as broken, non-existent or synthetic.
   *
   * If an `InvisiblePosition` never had an source offset at all, this method returns
   * {@see UNKNOWN_POSITION} for compatibility.
   */
  ;

  _proto4.toJSON = function toJSON() {
    return this.pos;
  };

  _proto4.wrap = function wrap() {
    return new SourceOffset(this);
  };

  _createClass(InvisiblePosition, [{
    key: "offset",
    get: function get() {
      return null;
    }
  }]);

  return InvisiblePosition;
}();
/**
 * Compare two {@see AnyPosition} and determine whether they are equal.
 *
 * @see {SourceOffset#eql}
 */

var _eql = match(function (m) {
  return m.when("HbsPosition"
  /* HbsPosition */
  , "HbsPosition"
  /* HbsPosition */
  , function (_ref, _ref2) {
    var left = _ref.hbsPos;
    var right = _ref2.hbsPos;
    return left.column === right.column && left.line === right.line;
  }).when("CharPosition"
  /* CharPosition */
  , "CharPosition"
  /* CharPosition */
  , function (_ref3, _ref4) {
    var left = _ref3.charPos;
    var right = _ref4.charPos;
    return left === right;
  }).when("CharPosition"
  /* CharPosition */
  , "HbsPosition"
  /* HbsPosition */
  , function (_ref5, right) {
    var left = _ref5.offset;

    var _a;

    return left === ((_a = right.toCharPos()) === null || _a === void 0 ? void 0 : _a.offset);
  }).when("HbsPosition"
  /* HbsPosition */
  , "CharPosition"
  /* CharPosition */
  , function (left, _ref6) {
    var right = _ref6.offset;

    var _a;

    return ((_a = left.toCharPos()) === null || _a === void 0 ? void 0 : _a.offset) === right;
  }).when(MatchAny, MatchAny, function () {
    return false;
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvc291cmNlL2xvYy9vZmZzZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0EsU0FBQSxnQkFBQSxRQUFBLGFBQUE7QUFFQSxTQUFBLEtBQUEsRUFBQSxRQUFBLFFBQUEsU0FBQTtBQUNBLFNBQUEsSUFBQSxRQUFBLFFBQUE7QUE0Q0E7Ozs7OztBQUtBLE9BQU8sSUFBTSxNQUFNLEdBQVosUUFBQTtBQUtQOzs7Ozs7Ozs7OztBQVVBLFdBQU0sWUFBTjtBQW1CRSx3QkFBQSxJQUFBLEVBQXFEO0FBQWhDLFNBQUEsSUFBQSxHQUFBLElBQUE7QUFBb0M7QUFsQnpEOzs7Ozs7O0FBREYsZUFNRSxTQU5GLEdBTUUsbUJBQUEsTUFBQSxFQUFBLEdBQUEsRUFBb0Q7QUFDbEQsV0FBTyxJQUFBLFdBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBUCxJQUFPLEVBQVA7QUFDRDtBQUVEOzs7OztBQVZGOztBQUFBLGVBZUUsTUFmRixHQWVFLGdCQUFjLEdBQWQsRUFBb0Q7QUFBQSxRQUF0QyxHQUFzQztBQUF0QyxNQUFBLEdBQXNDLEdBQXBELGdCQUFvRDtBQUFBOztBQUNsRCxXQUFPLElBQUEsaUJBQUEsQ0FBcUI7QUFBQTtBQUFyQixNQUFBLEdBQUEsRUFBUCxJQUFPLEVBQVA7QUFDRDtBQUlEOzs7QUFyQkY7O0FBQUE7O0FBNkJFOzs7Ozs7Ozs7QUE3QkYsU0FzQ0UsR0F0Q0YsR0FzQ0UsYUFBRyxLQUFILEVBQXVCO0FBQ3JCLFdBQU8sSUFBRyxDQUFDLEtBQUQsSUFBQSxFQUFZLEtBQUssQ0FBM0IsSUFBVSxDQUFWO0FBQ0Q7QUFFRDs7OztBQTFDRjs7QUFBQSxTQThDRSxLQTlDRixHQThDRSxlQUFLLEtBQUwsRUFBeUI7QUFDdkIsV0FBTyxJQUFJLENBQUMsS0FBRCxJQUFBLEVBQVksS0FBSyxDQUE1QixJQUFXLENBQVg7QUFDRDtBQUVE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QXNCLEtBQXRCLENBQUEsR0FBc0IsRUFBQSxDQUExQixNQUFJLENBQUo7QUFmakMsR0FBQSxFQUFBLElBQUEsQ0FpQk87QUFBQTtBQWpCUCxJQWlCTztBQUFBO0FBakJQLElBb0JJLFVBQUEsSUFBQSxTQUE0QjtBQUFBLFFBQVgsS0FBVyxTQUFuQixNQUFtQjs7QUFBQSxRQUFBLEVBQUE7O0FBQUMsV0FBQSxDQUFBLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBSixTQUFBLEVBQUEsTUFBQSxJQUFBLElBQWdCLEVBQUEsS0FBQSxLQUFoQixDQUFBLEdBQWdCLEtBQWhCLENBQUEsR0FBZ0IsRUFBQSxDQUFoQixNQUFBLE1BQUEsS0FBQTtBQXBCakMsR0FBQSxFQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsUUFBQSxFQXNCNEI7QUFBQSxXQXZCOUIsS0F1QjhCO0FBQUEsR0F0QjVCLENBRHlCO0FBQUEsQ0FBVixDQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXNcbmltcG9ydCB7IFNvdXJjZVBvc2l0aW9uLCBVTktOT1dOX1BPU0lUSU9OIH0gZnJvbSAnLi4vbG9jYXRpb24nO1xuaW1wb3J0IHsgU291cmNlIH0gZnJvbSAnLi4vc291cmNlJztcbmltcG9ydCB7IG1hdGNoLCBNYXRjaEFueSB9IGZyb20gJy4vbWF0Y2gnO1xuaW1wb3J0IHsgU291cmNlU3Bhbiwgc3BhbiB9IGZyb20gJy4vc3Bhbic7XG5cbmV4cG9ydCBjb25zdCBlbnVtIE9mZnNldEtpbmQge1xuICAvKipcbiAgICogV2UgaGF2ZSBhbHJlYWR5IGNvbXB1dGVkIHRoZSBjaGFyYWN0ZXIgcG9zaXRpb24gb2YgdGhpcyBvZmZzZXQgb3Igc3Bhbi5cbiAgICovXG4gIENoYXJQb3NpdGlvbiA9ICdDaGFyUG9zaXRpb24nLFxuXG4gIC8qKlxuICAgKiBUaGlzIG9mZnNldCBvciBzcGFuIHdhcyBpbnN0YW50aWF0ZWQgd2l0aCBhIEhhbmRsZWJhcnMgU291cmNlUG9zaXRpb24gb3IgU291cmNlTG9jYXRpb24uIEl0c1xuICAgKiBjaGFyYWN0ZXIgcG9zaXRpb24gd2lsbCBiZSBjb21wdXRlZCBvbiBkZW1hbmQuXG4gICAqL1xuICBIYnNQb3NpdGlvbiA9ICdIYnNQb3NpdGlvbicsXG5cbiAgLyoqXG4gICAqIGZvciAocmFyZSkgc2l0dWF0aW9ucyB3aGVyZSBhIG5vZGUgaXMgY3JlYXRlZCBidXQgdGhlcmUgd2FzIG5vIHNvdXJjZSBsb2NhdGlvbiAoZS5nLiB0aGUgbmFtZVxuICAgKiBcImRlZmF1bHRcIiBpbiBkZWZhdWx0IGJsb2NrcyB3aGVuIHRoZSB3b3JkIFwiZGVmYXVsdFwiIG5ldmVyIGFwcGVhcmVkIGluIHNvdXJjZSkuIFRoaXMgaXMgdXNlZFxuICAgKiBieSB0aGUgaW50ZXJuYWxzIHdoZW4gdGhlcmUgaXMgYSBsZWdpdGltYXRlIHJlYXNvbiBmb3IgdGhlIGludGVybmFscyB0byBzeW50aGVzaXplIGEgbm9kZVxuICAgKiB3aXRoIG5vIGxvY2F0aW9uLlxuICAgKi9cbiAgSW50ZXJuYWxzU3ludGhldGljID0gJ0ludGVybmFsc1N5bnRoZXRpYycsXG4gIC8qKlxuICAgKiBGb3Igc2l0dWF0aW9ucyB3aGVyZSBhIG5vZGUgcmVwcmVzZW50cyB6ZXJvIHBhcnRzIG9mIHRoZSBzb3VyY2UgKGZvciBleGFtcGxlLCBlbXB0eSBhcmd1bWVudHMpLlxuICAgKiBJbiBnZW5lcmFsLCB3ZSBhdHRlbXB0IHRvIGFzc2lnbiB0aGVzZSBub2RlcyAqc29tZSogcG9zaXRpb24gKGVtcHR5IGFyZ3VtZW50cyBjYW4gYmVcbiAgICogcG9zaXRpb25lZCBpbW1lZGlhdGVseSBhZnRlciB0aGUgY2FsbGVlKSwgYnV0IGl0J3Mgbm90IGFsd2F5cyBwb3NzaWJsZVxuICAgKi9cbiAgTm9uRXhpc3RlbnQgPSAnTm9uRXhpc3RlbnQnLFxuICAvKipcbiAgICogRm9yIHNpdHVhdGlvbnMgd2hlcmUgYSBzb3VyY2UgbG9jYXRpb24gd2FzIGV4cGVjdGVkLCBidXQgaXQgZGlkbid0IGNvcnJlc3BvbmQgdG8gdGhlIG5vZGUgaW5cbiAgICogdGhlIHNvdXJjZS4gVGhpcyBoYXBwZW5zIGlmIGEgcGx1Z2luIGNyZWF0ZXMgYnJva2VuIGxvY2F0aW9ucy5cbiAgICovXG4gIEJyb2tlbiA9ICdCcm9rZW4nLFxufVxuXG4vKipcbiAqIEFsbCBwb3NpdGlvbnMgaGF2ZSB0aGVzZSBkZXRhaWxzIGluIGNvbW1vbi4gTW9zdCBub3RhYmx5LCBhbGwgdGhyZWUga2luZHMgb2YgcG9zaXRpb25zIGNhblxuICogbXVzdCBiZSBhYmxlIHRvIGF0dGVtcHQgdG8gY29udmVydCB0aGVtc2VsdmVzIGludG8ge0BzZWUgQ2hhclBvc2l0aW9ufS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbkRhdGEge1xuICByZWFkb25seSBraW5kOiBPZmZzZXRLaW5kO1xuICB0b0NoYXJQb3MoKTogQ2hhclBvc2l0aW9uIHwgbnVsbDtcbiAgdG9KU09OKCk6IFNvdXJjZVBvc2l0aW9uO1xufVxuXG4vKipcbiAqIFVzZWQgdG8gaW5kaWNhdGUgdGhhdCBhbiBhdHRlbXB0IHRvIGNvbnZlcnQgYSBgU291cmNlUG9zaXRpb25gIHRvIGEgY2hhcmFjdGVyIG9mZnNldCBmYWlsZWQuIEl0XG4gKiBpcyBzZXBhcmF0ZSBmcm9tIGBudWxsYCBzbyB0aGF0IGBudWxsYCBjYW4gYmUgdXNlZCB0byBpbmRpY2F0ZSB0aGF0IHRoZSBjb21wdXRhdGlvbiB3YXNuJ3QgeWV0XG4gKiBhdHRlbXB0ZWQgKGFuZCB0aGVyZWZvcmUgdG8gY2FjaGUgdGhlIGZhaWx1cmUpXG4gKi9cbmV4cG9ydCBjb25zdCBCUk9LRU4gPSAnQlJPS0VOJztcbmV4cG9ydCB0eXBlIEJST0tFTiA9ICdCUk9LRU4nO1xuXG5leHBvcnQgdHlwZSBBbnlQb3NpdGlvbiA9IEhic1Bvc2l0aW9uIHwgQ2hhclBvc2l0aW9uIHwgSW52aXNpYmxlUG9zaXRpb247XG5cbi8qKlxuICogQSBgU291cmNlT2Zmc2V0YCByZXByZXNlbnRzIGEgc2luZ2xlIHBvc2l0aW9uIGluIHRoZSBzb3VyY2UuXG4gKlxuICogVGhlcmUgYXJlIHRocmVlIGtpbmRzIG9mIGJhY2tpbmcgZGF0YSBmb3IgYFNvdXJjZU9mZnNldGAgb2JqZWN0czpcbiAqXG4gKiAtIGBDaGFyUG9zaXRpb25gLCB3aGljaCBjb250YWlucyBhIGNoYXJhY3RlciBvZmZzZXQgaW50byB0aGUgcmF3IHNvdXJjZSBzdHJpbmdcbiAqIC0gYEhic1Bvc2l0aW9uYCwgd2hpY2ggY29udGFpbnMgYSBgU291cmNlUG9zaXRpb25gIGZyb20gdGhlIEhhbmRsZWJhcnMgQVNULCB3aGljaCBjYW4gYmVcbiAqICAgY29udmVydGVkIHRvIGEgYENoYXJQb3NpdGlvbmAgb24gZGVtYW5kLlxuICogLSBgSW52aXNpYmxlUG9zaXRpb25gLCB3aGljaCByZXByZXNlbnRzIGEgcG9zaXRpb24gbm90IGluIHNvdXJjZSAoQHNlZSB7SW52aXNpYmxlUG9zaXRpb259KVxuICovXG5leHBvcnQgY2xhc3MgU291cmNlT2Zmc2V0IHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIGBTb3VyY2VPZmZzZXRgIGZyb20gYSBIYW5kbGViYXJzIGBTb3VyY2VQb3NpdGlvbmAuIEl0J3Mgc3RvcmVkIGFzLWlzLCBhbmQgY29udmVydGVkXG4gICAqIGludG8gYSBjaGFyYWN0ZXIgb2Zmc2V0IG9uIGRlbWFuZCwgd2hpY2ggYXZvaWRzIHVubmVjZXNzYXJpbHkgY29tcHV0aW5nIHRoZSBvZmZzZXQgb2YgZXZlcnlcbiAgICogYFNvdXJjZUxvY2F0aW9uYCwgYnV0IGFsc28gbWVhbnMgdGhhdCBicm9rZW4gYFNvdXJjZVBvc2l0aW9uYHMgYXJlIG5vdCBhbHdheXMgZGV0ZWN0ZWQuXG4gICAqL1xuICBzdGF0aWMgZm9ySGJzUG9zKHNvdXJjZTogU291cmNlLCBwb3M6IFNvdXJjZVBvc2l0aW9uKTogU291cmNlT2Zmc2V0IHtcbiAgICByZXR1cm4gbmV3IEhic1Bvc2l0aW9uKHNvdXJjZSwgcG9zLCBudWxsKS53cmFwKCk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgYFNvdXJjZU9mZnNldGAgdGhhdCBjb3JyZXNwb25kcyB0byBhIGJyb2tlbiBgU291cmNlUG9zaXRpb25gLiBUaGlzIG1lYW5zIHRoYXQgdGhlXG4gICAqIGNhbGxpbmcgY29kZSBkZXRlcm1pbmVkIChvciBrbm93cykgdGhhdCB0aGUgYFNvdXJjZUxvY2F0aW9uYCBkb2Vzbid0IGNvcnJlc3BvbmQgY29ycmVjdGx5IHRvXG4gICAqIGFueSBwYXJ0IG9mIHRoZSBzb3VyY2UuXG4gICAqL1xuICBzdGF0aWMgYnJva2VuKHBvczogU291cmNlUG9zaXRpb24gPSBVTktOT1dOX1BPU0lUSU9OKTogU291cmNlT2Zmc2V0IHtcbiAgICByZXR1cm4gbmV3IEludmlzaWJsZVBvc2l0aW9uKE9mZnNldEtpbmQuQnJva2VuLCBwb3MpLndyYXAoKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGRhdGE6IFBvc2l0aW9uRGF0YSAmIEFueVBvc2l0aW9uKSB7fVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNoYXJhY3RlciBvZmZzZXQgZm9yIHRoaXMgYFNvdXJjZU9mZnNldGAsIGlmIHBvc3NpYmxlLlxuICAgKi9cbiAgZ2V0IG9mZnNldCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICBsZXQgY2hhclBvcyA9IHRoaXMuZGF0YS50b0NoYXJQb3MoKTtcbiAgICByZXR1cm4gY2hhclBvcyA9PT0gbnVsbCA/IG51bGwgOiBjaGFyUG9zLm9mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wYXJlIHRoaXMgb2Zmc2V0IHdpdGggYW5vdGhlciBvbmUuXG4gICAqXG4gICAqIElmIGJvdGggb2Zmc2V0cyBhcmUgYEhic1Bvc2l0aW9uYHMsIHRoZXkncmUgZXF1aXZhbGVudCBhcyBsb25nIGFzIHRoZWlyIGxpbmVzIGFuZCBjb2x1bW5zIGFyZVxuICAgKiB0aGUgc2FtZS4gVGhpcyBhdm9pZHMgY29tcHV0aW5nIG9mZnNldHMgdW5uZWNlc3NhcmlseS5cbiAgICpcbiAgICogT3RoZXJ3aXNlLCB0d28gYFNvdXJjZU9mZnNldGBzIGFyZSBlcXVpdmFsZW50IGlmIHRoZWlyIHN1Y2Nlc3NmdWxseSBjb21wdXRlZCBjaGFyYWN0ZXIgb2Zmc2V0c1xuICAgKiBhcmUgdGhlIHNhbWUuXG4gICAqL1xuICBlcWwocmlnaHQ6IFNvdXJjZU9mZnNldCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlcWwodGhpcy5kYXRhLCByaWdodC5kYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBzcGFuIHRoYXQgc3RhcnRzIGZyb20gdGhpcyBzb3VyY2Ugb2Zmc2V0IGFuZCBlbmRzIHdpdGggYW5vdGhlciBzb3VyY2Ugb2Zmc2V0LiBBdm9pZFxuICAgKiBjb21wdXRpbmcgY2hhcmFjdGVyIG9mZnNldHMgaWYgYm90aCBgU291cmNlT2Zmc2V0YHMgYXJlIHN0aWxsIGxhenkuXG4gICAqL1xuICB1bnRpbChvdGhlcjogU291cmNlT2Zmc2V0KTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIHNwYW4odGhpcy5kYXRhLCBvdGhlci5kYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBgU291cmNlT2Zmc2V0YCBieSBtb3ZpbmcgdGhlIGNoYXJhY3RlciBwb3NpdGlvbiByZXByZXNlbnRlZCBieSB0aGlzIHNvdXJjZSBvZmZzZXRcbiAgICogZm9yd2FyZCBvciBiYWNrd2FyZCAoaWYgYGJ5YCBpcyBuZWdhdGl2ZSksIGlmIHBvc3NpYmxlLlxuICAgKlxuICAgKiBJZiB0aGlzIGBTb3VyY2VPZmZzZXRgIGNhbid0IGNvbXB1dGUgYSB2YWxpZCBjaGFyYWN0ZXIgb2Zmc2V0LCBgbW92ZWAgcmV0dXJucyBhIGJyb2tlbiBvZmZzZXQuXG4gICAqXG4gICAqIElmIHRoZSByZXN1bHRpbmcgY2hhcmFjdGVyIG9mZnNldCBpcyBsZXNzIHRoYW4gMCBvciBncmVhdGVyIHRoYW4gdGhlIHNpemUgb2YgdGhlIHNvdXJjZSwgYG1vdmVgXG4gICAqIHJldHVybnMgYSBicm9rZW4gb2Zmc2V0LlxuICAgKi9cbiAgbW92ZShieTogbnVtYmVyKTogU291cmNlT2Zmc2V0IHtcbiAgICBsZXQgY2hhclBvcyA9IHRoaXMuZGF0YS50b0NoYXJQb3MoKTtcblxuICAgIGlmIChjaGFyUG9zID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gU291cmNlT2Zmc2V0LmJyb2tlbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmVzdWx0ID0gY2hhclBvcy5vZmZzZXQgKyBieTtcblxuICAgICAgaWYgKGNoYXJQb3Muc291cmNlLmNoZWNrKHJlc3VsdCkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDaGFyUG9zaXRpb24oY2hhclBvcy5zb3VyY2UsIHJlc3VsdCkud3JhcCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFNvdXJjZU9mZnNldC5icm9rZW4oKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBTb3VyY2VTcGFuYCB0aGF0IHJlcHJlc2VudHMgYSBjb2xsYXBzZWQgcmFuZ2UgYXQgdGhpcyBzb3VyY2Ugb2Zmc2V0LiBBdm9pZFxuICAgKiBjb21wdXRpbmcgdGhlIGNoYXJhY3RlciBvZmZzZXQgaWYgaXQgaGFzIG5vdCBhbHJlYWR5IGJlZW4gY29tcHV0ZWQuXG4gICAqL1xuICBjb2xsYXBzZWQoKTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIHNwYW4odGhpcy5kYXRhLCB0aGlzLmRhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgdGhpcyBgU291cmNlT2Zmc2V0YCBpbnRvIGEgSGFuZGxlYmFycyB7QHNlZSBTb3VyY2VQb3NpdGlvbn0gZm9yIGNvbXBhdGliaWxpdHkgd2l0aFxuICAgKiBleGlzdGluZyBwbHVnaW5zLlxuICAgKi9cbiAgdG9KU09OKCk6IFNvdXJjZVBvc2l0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLnRvSlNPTigpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDaGFyUG9zaXRpb24gaW1wbGVtZW50cyBQb3NpdGlvbkRhdGEge1xuICByZWFkb25seSBraW5kID0gT2Zmc2V0S2luZC5DaGFyUG9zaXRpb247XG5cbiAgLyoqIENvbXB1dGVkIGZyb20gY2hhciBvZmZzZXQgKi9cbiAgX2xvY1BvczogSGJzUG9zaXRpb24gfCBCUk9LRU4gfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBzb3VyY2U6IFNvdXJjZSwgcmVhZG9ubHkgY2hhclBvczogbnVtYmVyKSB7fVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGFscmVhZHkgYSBgQ2hhclBvc2l0aW9uYC5cbiAgICpcbiAgICoge0BzZWUgSGJzUG9zaXRpb259IGZvciB0aGUgYWx0ZXJuYXRpdmUuXG4gICAqXG4gICAqIEBpbXBsZW1lbnRzIHtQb3NpdGlvbkRhdGF9XG4gICAqL1xuICB0b0NoYXJQb3MoKTogQ2hhclBvc2l0aW9uIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9kdWNlIGEgSGFuZGxlYmFycyB7QHNlZSBTb3VyY2VQb3NpdGlvbn0gZm9yIHRoaXMgYENoYXJQb3NpdGlvbmAuIElmIHRoaXMgYENoYXJQb3NpdGlvbmAgd2FzXG4gICAqIGNvbXB1dGVkIHVzaW5nIHtAc2VlIFNvdXJjZU9mZnNldCNtb3ZlfSwgdGhpcyB3aWxsIGNvbXB1dGUgdGhlIGBTb3VyY2VQb3NpdGlvbmAgZm9yIHRoZSBvZmZzZXQuXG4gICAqXG4gICAqIEBpbXBsZW1lbnRzIHtQb3NpdGlvbkRhdGF9XG4gICAqL1xuICB0b0pTT04oKTogU291cmNlUG9zaXRpb24ge1xuICAgIGxldCBoYnMgPSB0aGlzLnRvSGJzUG9zKCk7XG4gICAgcmV0dXJuIGhicyA9PT0gbnVsbCA/IFVOS05PV05fUE9TSVRJT04gOiBoYnMudG9KU09OKCk7XG4gIH1cblxuICB3cmFwKCk6IFNvdXJjZU9mZnNldCB7XG4gICAgcmV0dXJuIG5ldyBTb3VyY2VPZmZzZXQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQSBgQ2hhclBvc2l0aW9uYCBhbHdheXMgaGFzIGFuIG9mZnNldCBpdCBjYW4gcHJvZHVjZSB3aXRob3V0IGFueSBhZGRpdGlvbmFsIGNvbXB1dGF0aW9uLlxuICAgKi9cbiAgZ2V0IG9mZnNldCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmNoYXJQb3M7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCB0aGUgY3VycmVudCBjaGFyYWN0ZXIgb2Zmc2V0IHRvIGFuIGBIYnNQb3NpdGlvbmAsIGlmIGl0IHdhcyBub3QgYWxyZWFkeSBjb21wdXRlZC4gT25jZVxuICAgKiBhIGBDaGFyUG9zaXRpb25gIGhhcyBjb21wdXRlZCBpdHMgYEhic1Bvc2l0aW9uYCwgaXQgd2lsbCBub3QgbmVlZCB0byBkbyBjb21wdXRlIGl0IGFnYWluLCBhbmRcbiAgICogdGhlIHNhbWUgYENoYXJQb3NpdGlvbmAgaXMgcmV0YWluZWQgd2hlbiB1c2VkIGFzIG9uZSBvZiB0aGUgZW5kcyBvZiBhIGBTb3VyY2VTcGFuYCwgc29cbiAgICogY29tcHV0aW5nIHRoZSBgSGJzUG9zaXRpb25gIHNob3VsZCBiZSBhIG9uZS10aW1lIG9wZXJhdGlvbi5cbiAgICovXG4gIHRvSGJzUG9zKCk6IEhic1Bvc2l0aW9uIHwgbnVsbCB7XG4gICAgbGV0IGxvY1BvcyA9IHRoaXMuX2xvY1BvcztcblxuICAgIGlmIChsb2NQb3MgPT09IG51bGwpIHtcbiAgICAgIGxldCBoYnNQb3MgPSB0aGlzLnNvdXJjZS5oYnNQb3NGb3IodGhpcy5jaGFyUG9zKTtcblxuICAgICAgaWYgKGhic1BvcyA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9sb2NQb3MgPSBsb2NQb3MgPSBCUk9LRU47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9sb2NQb3MgPSBsb2NQb3MgPSBuZXcgSGJzUG9zaXRpb24odGhpcy5zb3VyY2UsIGhic1BvcywgdGhpcy5jaGFyUG9zKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbG9jUG9zID09PSBCUk9LRU4gPyBudWxsIDogbG9jUG9zO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIYnNQb3NpdGlvbiBpbXBsZW1lbnRzIFBvc2l0aW9uRGF0YSB7XG4gIHJlYWRvbmx5IGtpbmQgPSBPZmZzZXRLaW5kLkhic1Bvc2l0aW9uO1xuXG4gIF9jaGFyUG9zOiBDaGFyUG9zaXRpb24gfCBCUk9LRU4gfCBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IHNvdXJjZTogU291cmNlLFxuICAgIHJlYWRvbmx5IGhic1BvczogU291cmNlUG9zaXRpb24sXG4gICAgY2hhclBvczogbnVtYmVyIHwgbnVsbCA9IG51bGxcbiAgKSB7XG4gICAgdGhpcy5fY2hhclBvcyA9IGNoYXJQb3MgPT09IG51bGwgPyBudWxsIDogbmV3IENoYXJQb3NpdGlvbihzb3VyY2UsIGNoYXJQb3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIExhemlseSBjb21wdXRlIHRoZSBjaGFyYWN0ZXIgb2Zmc2V0IGZyb20gdGhlIHtAc2VlIFNvdXJjZVBvc2l0aW9ufS4gT25jZSBhbiBgSGJzUG9zaXRpb25gIGhhc1xuICAgKiBjb21wdXRlZCBpdHMgYENoYXJQb3NpdGlvbmAsIGl0IHdpbGwgbm90IG5lZWQgdG8gZG8gY29tcHV0ZSBpdCBhZ2FpbiwgYW5kIHRoZSBzYW1lXG4gICAqIGBIYnNQb3NpdGlvbmAgaXMgcmV0YWluZWQgd2hlbiB1c2VkIGFzIG9uZSBvZiB0aGUgZW5kcyBvZiBhIGBTb3VyY2VTcGFuYCwgc28gY29tcHV0aW5nIHRoZVxuICAgKiBgQ2hhclBvc2l0aW9uYCBzaG91bGQgYmUgYSBvbmUtdGltZSBvcGVyYXRpb24uXG4gICAqXG4gICAqIEBpbXBsZW1lbnRzIHtQb3NpdGlvbkRhdGF9XG4gICAqL1xuICB0b0NoYXJQb3MoKTogQ2hhclBvc2l0aW9uIHwgbnVsbCB7XG4gICAgbGV0IGNoYXJQb3MgPSB0aGlzLl9jaGFyUG9zO1xuXG4gICAgaWYgKGNoYXJQb3MgPT09IG51bGwpIHtcbiAgICAgIGxldCBjaGFyUG9zTnVtYmVyID0gdGhpcy5zb3VyY2UuY2hhclBvc0Zvcih0aGlzLmhic1Bvcyk7XG5cbiAgICAgIGlmIChjaGFyUG9zTnVtYmVyID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2NoYXJQb3MgPSBjaGFyUG9zID0gQlJPS0VOO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY2hhclBvcyA9IGNoYXJQb3MgPSBuZXcgQ2hhclBvc2l0aW9uKHRoaXMuc291cmNlLCBjaGFyUG9zTnVtYmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2hhclBvcyA9PT0gQlJPS0VOID8gbnVsbCA6IGNoYXJQb3M7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSB7QHNlZSBTb3VyY2VQb3NpdGlvbn0gdGhhdCB0aGlzIGBIYnNQb3NpdGlvbmAgd2FzIGluc3RhbnRpYXRlZCB3aXRoLiBUaGlzIG9wZXJhdGlvblxuICAgKiBkb2VzIG5vdCBuZWVkIHRvIGNvbXB1dGUgYW55dGhpbmcuXG4gICAqXG4gICAqIEBpbXBsZW1lbnRzIHtQb3NpdGlvbkRhdGF9XG4gICAqL1xuICB0b0pTT04oKTogU291cmNlUG9zaXRpb24ge1xuICAgIHJldHVybiB0aGlzLmhic1BvcztcbiAgfVxuXG4gIHdyYXAoKTogU291cmNlT2Zmc2V0IHtcbiAgICByZXR1cm4gbmV3IFNvdXJjZU9mZnNldCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGFscmVhZHkgYW4gYEhic1Bvc2l0aW9uYC5cbiAgICpcbiAgICoge0BzZWUgQ2hhclBvc2l0aW9ufSBmb3IgdGhlIGFsdGVybmF0aXZlLlxuICAgKi9cbiAgdG9IYnNQb3MoKTogSGJzUG9zaXRpb24ge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbnZpc2libGVQb3NpdGlvbiBpbXBsZW1lbnRzIFBvc2l0aW9uRGF0YSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IGtpbmQ6IE9mZnNldEtpbmQuQnJva2VuIHwgT2Zmc2V0S2luZC5JbnRlcm5hbHNTeW50aGV0aWMgfCBPZmZzZXRLaW5kLk5vbkV4aXN0ZW50LFxuICAgIC8vIHdoYXRldmVyIHdhcyBwcm92aWRlZCwgcG9zc2libHkgYnJva2VuXG4gICAgcmVhZG9ubHkgcG9zOiBTb3VyY2VQb3NpdGlvblxuICApIHt9XG5cbiAgLyoqXG4gICAqIEEgYnJva2VuIHBvc2l0aW9uIGNhbm5vdCBiZSB0dXJuZWQgaW50byBhIHtAc2VlIENoYXJhY3RlclBvc2l0aW9ufS5cbiAgICovXG4gIHRvQ2hhclBvcygpOiBudWxsIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc2VyaWFsaXphdGlvbiBvZiBhbiBgSW52aXNpYmxlUG9zaXRpb24gaXMgd2hhdGV2ZXIgSGFuZGxlYmFycyB7QHNlZSBTb3VyY2VQb3NpdGlvbn0gd2FzXG4gICAqIG9yaWdpbmFsbHkgaWRlbnRpZmllZCBhcyBicm9rZW4sIG5vbi1leGlzdGVudCBvciBzeW50aGV0aWMuXG4gICAqXG4gICAqIElmIGFuIGBJbnZpc2libGVQb3NpdGlvbmAgbmV2ZXIgaGFkIGFuIHNvdXJjZSBvZmZzZXQgYXQgYWxsLCB0aGlzIG1ldGhvZCByZXR1cm5zXG4gICAqIHtAc2VlIFVOS05PV05fUE9TSVRJT059IGZvciBjb21wYXRpYmlsaXR5LlxuICAgKi9cbiAgdG9KU09OKCk6IFNvdXJjZVBvc2l0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5wb3M7XG4gIH1cblxuICB3cmFwKCk6IFNvdXJjZU9mZnNldCB7XG4gICAgcmV0dXJuIG5ldyBTb3VyY2VPZmZzZXQodGhpcyk7XG4gIH1cblxuICBnZXQgb2Zmc2V0KCk6IG51bGwge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogQ29tcGFyZSB0d28ge0BzZWUgQW55UG9zaXRpb259IGFuZCBkZXRlcm1pbmUgd2hldGhlciB0aGV5IGFyZSBlcXVhbC5cbiAqXG4gKiBAc2VlIHtTb3VyY2VPZmZzZXQjZXFsfVxuICovXG5jb25zdCBlcWwgPSBtYXRjaDxib29sZWFuPigobSkgPT5cbiAgbVxuICAgIC53aGVuKFxuICAgICAgT2Zmc2V0S2luZC5IYnNQb3NpdGlvbixcbiAgICAgIE9mZnNldEtpbmQuSGJzUG9zaXRpb24sXG4gICAgICAoeyBoYnNQb3M6IGxlZnQgfSwgeyBoYnNQb3M6IHJpZ2h0IH0pID0+XG4gICAgICAgIGxlZnQuY29sdW1uID09PSByaWdodC5jb2x1bW4gJiYgbGVmdC5saW5lID09PSByaWdodC5saW5lXG4gICAgKVxuICAgIC53aGVuKFxuICAgICAgT2Zmc2V0S2luZC5DaGFyUG9zaXRpb24sXG4gICAgICBPZmZzZXRLaW5kLkNoYXJQb3NpdGlvbixcbiAgICAgICh7IGNoYXJQb3M6IGxlZnQgfSwgeyBjaGFyUG9zOiByaWdodCB9KSA9PiBsZWZ0ID09PSByaWdodFxuICAgIClcbiAgICAud2hlbihcbiAgICAgIE9mZnNldEtpbmQuQ2hhclBvc2l0aW9uLFxuICAgICAgT2Zmc2V0S2luZC5IYnNQb3NpdGlvbixcbiAgICAgICh7IG9mZnNldDogbGVmdCB9LCByaWdodCkgPT4gbGVmdCA9PT0gcmlnaHQudG9DaGFyUG9zKCk/Lm9mZnNldFxuICAgIClcbiAgICAud2hlbihcbiAgICAgIE9mZnNldEtpbmQuSGJzUG9zaXRpb24sXG4gICAgICBPZmZzZXRLaW5kLkNoYXJQb3NpdGlvbixcbiAgICAgIChsZWZ0LCB7IG9mZnNldDogcmlnaHQgfSkgPT4gbGVmdC50b0NoYXJQb3MoKT8ub2Zmc2V0ID09PSByaWdodFxuICAgIClcbiAgICAud2hlbihNYXRjaEFueSwgTWF0Y2hBbnksICgpID0+IGZhbHNlKVxuKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=