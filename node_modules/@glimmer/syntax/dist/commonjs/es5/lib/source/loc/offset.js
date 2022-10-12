"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InvisiblePosition = exports.HbsPosition = exports.CharPosition = exports.SourceOffset = exports.BROKEN = void 0;

var _location = require("../location");

var _match = require("./match");

var _span = require("./span");

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
} // eslint-disable-next-line import/no-extraneous-dependencies


/**
 * Used to indicate that an attempt to convert a `SourcePosition` to a character offset failed. It
 * is separate from `null` so that `null` can be used to indicate that the computation wasn't yet
 * attempted (and therefore to cache the failure)
 */
var BROKEN = 'BROKEN';
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

exports.BROKEN = BROKEN;

var SourceOffset = /*#__PURE__*/function () {
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
      pos = _location.UNKNOWN_POSITION;
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
    return (0, _span.span)(this.data, other.data);
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
    return (0, _span.span)(this.data, this.data);
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

exports.SourceOffset = SourceOffset;

var CharPosition = /*#__PURE__*/function () {
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
    return hbs === null ? _location.UNKNOWN_POSITION : hbs.toJSON();
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

exports.CharPosition = CharPosition;

var HbsPosition = /*#__PURE__*/function () {
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

exports.HbsPosition = HbsPosition;

var InvisiblePosition = /*#__PURE__*/function () {
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


exports.InvisiblePosition = InvisiblePosition;

var _eql = (0, _match.match)(function (m) {
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
  }).when(_match.MatchAny, _match.MatchAny, function () {
    return false;
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvc291cmNlL2xvYy9vZmZzZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUVBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0VBSkE7OztBQWdEQTs7Ozs7QUFLTyxJQUFNLE1BQU0sR0FBWixRQUFBO0FBS1A7Ozs7Ozs7Ozs7Ozs7QUFVQSxJQUFNLFlBQU4sR0FBQSxhQUFBLFlBQUE7QUFtQkUsV0FBQSxZQUFBLENBQUEsSUFBQSxFQUFxRDtBQUFoQyxTQUFBLElBQUEsR0FBQSxJQUFBO0FBQW9DO0FBbEJ6RDs7Ozs7OztBQURGLEVBQUEsWUFBQSxDQUFBLFNBQUEsR0FNRSxTQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFvRDtBQUNsRCxXQUFPLElBQUEsV0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFQLElBQU8sRUFBUDtBQUNEO0FBRUQ7Ozs7O0FBVkY7O0FBQUEsRUFBQSxZQUFBLENBQUEsTUFBQSxHQWVFLFNBQUEsTUFBQSxDQUFBLEdBQUEsRUFBb0Q7QUFBQSxRQUF0QyxHQUFzQyxLQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQXRDLE1BQUEsR0FBc0MsR0FBcEQsMEJBQWM7QUFBc0M7O0FBQ2xELFdBQU8sSUFBQSxpQkFBQSxDQUFxQjtBQUFBO0FBQXJCLE1BQUEsR0FBQSxFQUFQLElBQU8sRUFBUDtBQUNEO0FBSUQ7OztBQXJCRjs7QUFBQSxNQUFBLE1BQUEsR0FBQSxZQUFBLENBQUEsU0FBQTtBQTZCRTs7Ozs7Ozs7OztBQTdCRixFQUFBLE1BQUEsQ0FBQSxHQUFBLEdBc0NFLFNBQUEsR0FBQSxDQUFBLEtBQUEsRUFBdUI7QUFDckIsV0FBTyxJQUFHLENBQUMsS0FBRCxJQUFBLEVBQVksS0FBSyxDQUEzQixJQUFVLENBQVY7QUFDRDtBQUVEOzs7O0FBMUNGOztBQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsR0E4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LElBQUksTUFBQSxDQUFBLEVBQUEsR0FBSyxLQUFLLENBQVYsU0FBSyxFQUFMLE1BQUEsSUFBQSxJQUFzQixFQUFBLEtBQUEsS0FBdEIsQ0FBQSxHQUFzQixLQUF0QixDQUFBLEdBQXNCLEVBQUEsQ0FBMUIsTUFBSSxDQUFKO0FBZmpDLEdBQUEsRUFBQSxJQUFBLENBaUJPO0FBQUE7QUFqQlAsSUFpQk87QUFBQTtBQWpCUCxJQW9CSSxVQUFBLElBQUEsRUFBQSxLQUFBLEVBQTRCO0FBQUEsUUFBWCxLQUFXLEdBQUEsS0FBQSxDQUFuQixNQUFtQjs7QUFBQSxRQUFBLEVBQUE7O0FBQUMsV0FBQSxDQUFBLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBSixTQUFBLEVBQUEsTUFBQSxJQUFBLElBQWdCLEVBQUEsS0FBQSxLQUFoQixDQUFBLEdBQWdCLEtBQWhCLENBQUEsR0FBZ0IsRUFBQSxDQUFoQixNQUFBLE1BQUEsS0FBQTtBQXBCakMsR0FBQSxFQUFBLElBQUEsQ0FBQSxlQUFBLEVBQUEsZUFBQSxFQXNCNEIsWUFBQTtBQUFBLFdBdkI5QixLQXVCOEI7QUF2QkgsR0FDekIsQ0FEeUI7QUFBM0IsQ0FBWSxDQUFaIiwic291cmNlc0NvbnRlbnQiOlsiLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llc1xuaW1wb3J0IHsgU291cmNlUG9zaXRpb24sIFVOS05PV05fUE9TSVRJT04gfSBmcm9tICcuLi9sb2NhdGlvbic7XG5pbXBvcnQgeyBTb3VyY2UgfSBmcm9tICcuLi9zb3VyY2UnO1xuaW1wb3J0IHsgbWF0Y2gsIE1hdGNoQW55IH0gZnJvbSAnLi9tYXRjaCc7XG5pbXBvcnQgeyBTb3VyY2VTcGFuLCBzcGFuIH0gZnJvbSAnLi9zcGFuJztcblxuZXhwb3J0IGNvbnN0IGVudW0gT2Zmc2V0S2luZCB7XG4gIC8qKlxuICAgKiBXZSBoYXZlIGFscmVhZHkgY29tcHV0ZWQgdGhlIGNoYXJhY3RlciBwb3NpdGlvbiBvZiB0aGlzIG9mZnNldCBvciBzcGFuLlxuICAgKi9cbiAgQ2hhclBvc2l0aW9uID0gJ0NoYXJQb3NpdGlvbicsXG5cbiAgLyoqXG4gICAqIFRoaXMgb2Zmc2V0IG9yIHNwYW4gd2FzIGluc3RhbnRpYXRlZCB3aXRoIGEgSGFuZGxlYmFycyBTb3VyY2VQb3NpdGlvbiBvciBTb3VyY2VMb2NhdGlvbi4gSXRzXG4gICAqIGNoYXJhY3RlciBwb3NpdGlvbiB3aWxsIGJlIGNvbXB1dGVkIG9uIGRlbWFuZC5cbiAgICovXG4gIEhic1Bvc2l0aW9uID0gJ0hic1Bvc2l0aW9uJyxcblxuICAvKipcbiAgICogZm9yIChyYXJlKSBzaXR1YXRpb25zIHdoZXJlIGEgbm9kZSBpcyBjcmVhdGVkIGJ1dCB0aGVyZSB3YXMgbm8gc291cmNlIGxvY2F0aW9uIChlLmcuIHRoZSBuYW1lXG4gICAqIFwiZGVmYXVsdFwiIGluIGRlZmF1bHQgYmxvY2tzIHdoZW4gdGhlIHdvcmQgXCJkZWZhdWx0XCIgbmV2ZXIgYXBwZWFyZWQgaW4gc291cmNlKS4gVGhpcyBpcyB1c2VkXG4gICAqIGJ5IHRoZSBpbnRlcm5hbHMgd2hlbiB0aGVyZSBpcyBhIGxlZ2l0aW1hdGUgcmVhc29uIGZvciB0aGUgaW50ZXJuYWxzIHRvIHN5bnRoZXNpemUgYSBub2RlXG4gICAqIHdpdGggbm8gbG9jYXRpb24uXG4gICAqL1xuICBJbnRlcm5hbHNTeW50aGV0aWMgPSAnSW50ZXJuYWxzU3ludGhldGljJyxcbiAgLyoqXG4gICAqIEZvciBzaXR1YXRpb25zIHdoZXJlIGEgbm9kZSByZXByZXNlbnRzIHplcm8gcGFydHMgb2YgdGhlIHNvdXJjZSAoZm9yIGV4YW1wbGUsIGVtcHR5IGFyZ3VtZW50cykuXG4gICAqIEluIGdlbmVyYWwsIHdlIGF0dGVtcHQgdG8gYXNzaWduIHRoZXNlIG5vZGVzICpzb21lKiBwb3NpdGlvbiAoZW1wdHkgYXJndW1lbnRzIGNhbiBiZVxuICAgKiBwb3NpdGlvbmVkIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBjYWxsZWUpLCBidXQgaXQncyBub3QgYWx3YXlzIHBvc3NpYmxlXG4gICAqL1xuICBOb25FeGlzdGVudCA9ICdOb25FeGlzdGVudCcsXG4gIC8qKlxuICAgKiBGb3Igc2l0dWF0aW9ucyB3aGVyZSBhIHNvdXJjZSBsb2NhdGlvbiB3YXMgZXhwZWN0ZWQsIGJ1dCBpdCBkaWRuJ3QgY29ycmVzcG9uZCB0byB0aGUgbm9kZSBpblxuICAgKiB0aGUgc291cmNlLiBUaGlzIGhhcHBlbnMgaWYgYSBwbHVnaW4gY3JlYXRlcyBicm9rZW4gbG9jYXRpb25zLlxuICAgKi9cbiAgQnJva2VuID0gJ0Jyb2tlbicsXG59XG5cbi8qKlxuICogQWxsIHBvc2l0aW9ucyBoYXZlIHRoZXNlIGRldGFpbHMgaW4gY29tbW9uLiBNb3N0IG5vdGFibHksIGFsbCB0aHJlZSBraW5kcyBvZiBwb3NpdGlvbnMgY2FuXG4gKiBtdXN0IGJlIGFibGUgdG8gYXR0ZW1wdCB0byBjb252ZXJ0IHRoZW1zZWx2ZXMgaW50byB7QHNlZSBDaGFyUG9zaXRpb259LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBvc2l0aW9uRGF0YSB7XG4gIHJlYWRvbmx5IGtpbmQ6IE9mZnNldEtpbmQ7XG4gIHRvQ2hhclBvcygpOiBDaGFyUG9zaXRpb24gfCBudWxsO1xuICB0b0pTT04oKTogU291cmNlUG9zaXRpb247XG59XG5cbi8qKlxuICogVXNlZCB0byBpbmRpY2F0ZSB0aGF0IGFuIGF0dGVtcHQgdG8gY29udmVydCBhIGBTb3VyY2VQb3NpdGlvbmAgdG8gYSBjaGFyYWN0ZXIgb2Zmc2V0IGZhaWxlZC4gSXRcbiAqIGlzIHNlcGFyYXRlIGZyb20gYG51bGxgIHNvIHRoYXQgYG51bGxgIGNhbiBiZSB1c2VkIHRvIGluZGljYXRlIHRoYXQgdGhlIGNvbXB1dGF0aW9uIHdhc24ndCB5ZXRcbiAqIGF0dGVtcHRlZCAoYW5kIHRoZXJlZm9yZSB0byBjYWNoZSB0aGUgZmFpbHVyZSlcbiAqL1xuZXhwb3J0IGNvbnN0IEJST0tFTiA9ICdCUk9LRU4nO1xuZXhwb3J0IHR5cGUgQlJPS0VOID0gJ0JST0tFTic7XG5cbmV4cG9ydCB0eXBlIEFueVBvc2l0aW9uID0gSGJzUG9zaXRpb24gfCBDaGFyUG9zaXRpb24gfCBJbnZpc2libGVQb3NpdGlvbjtcblxuLyoqXG4gKiBBIGBTb3VyY2VPZmZzZXRgIHJlcHJlc2VudHMgYSBzaW5nbGUgcG9zaXRpb24gaW4gdGhlIHNvdXJjZS5cbiAqXG4gKiBUaGVyZSBhcmUgdGhyZWUga2luZHMgb2YgYmFja2luZyBkYXRhIGZvciBgU291cmNlT2Zmc2V0YCBvYmplY3RzOlxuICpcbiAqIC0gYENoYXJQb3NpdGlvbmAsIHdoaWNoIGNvbnRhaW5zIGEgY2hhcmFjdGVyIG9mZnNldCBpbnRvIHRoZSByYXcgc291cmNlIHN0cmluZ1xuICogLSBgSGJzUG9zaXRpb25gLCB3aGljaCBjb250YWlucyBhIGBTb3VyY2VQb3NpdGlvbmAgZnJvbSB0aGUgSGFuZGxlYmFycyBBU1QsIHdoaWNoIGNhbiBiZVxuICogICBjb252ZXJ0ZWQgdG8gYSBgQ2hhclBvc2l0aW9uYCBvbiBkZW1hbmQuXG4gKiAtIGBJbnZpc2libGVQb3NpdGlvbmAsIHdoaWNoIHJlcHJlc2VudHMgYSBwb3NpdGlvbiBub3QgaW4gc291cmNlIChAc2VlIHtJbnZpc2libGVQb3NpdGlvbn0pXG4gKi9cbmV4cG9ydCBjbGFzcyBTb3VyY2VPZmZzZXQge1xuICAvKipcbiAgICogQ3JlYXRlIGEgYFNvdXJjZU9mZnNldGAgZnJvbSBhIEhhbmRsZWJhcnMgYFNvdXJjZVBvc2l0aW9uYC4gSXQncyBzdG9yZWQgYXMtaXMsIGFuZCBjb252ZXJ0ZWRcbiAgICogaW50byBhIGNoYXJhY3RlciBvZmZzZXQgb24gZGVtYW5kLCB3aGljaCBhdm9pZHMgdW5uZWNlc3NhcmlseSBjb21wdXRpbmcgdGhlIG9mZnNldCBvZiBldmVyeVxuICAgKiBgU291cmNlTG9jYXRpb25gLCBidXQgYWxzbyBtZWFucyB0aGF0IGJyb2tlbiBgU291cmNlUG9zaXRpb25gcyBhcmUgbm90IGFsd2F5cyBkZXRlY3RlZC5cbiAgICovXG4gIHN0YXRpYyBmb3JIYnNQb3Moc291cmNlOiBTb3VyY2UsIHBvczogU291cmNlUG9zaXRpb24pOiBTb3VyY2VPZmZzZXQge1xuICAgIHJldHVybiBuZXcgSGJzUG9zaXRpb24oc291cmNlLCBwb3MsIG51bGwpLndyYXAoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBgU291cmNlT2Zmc2V0YCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEgYnJva2VuIGBTb3VyY2VQb3NpdGlvbmAuIFRoaXMgbWVhbnMgdGhhdCB0aGVcbiAgICogY2FsbGluZyBjb2RlIGRldGVybWluZWQgKG9yIGtub3dzKSB0aGF0IHRoZSBgU291cmNlTG9jYXRpb25gIGRvZXNuJ3QgY29ycmVzcG9uZCBjb3JyZWN0bHkgdG9cbiAgICogYW55IHBhcnQgb2YgdGhlIHNvdXJjZS5cbiAgICovXG4gIHN0YXRpYyBicm9rZW4ocG9zOiBTb3VyY2VQb3NpdGlvbiA9IFVOS05PV05fUE9TSVRJT04pOiBTb3VyY2VPZmZzZXQge1xuICAgIHJldHVybiBuZXcgSW52aXNpYmxlUG9zaXRpb24oT2Zmc2V0S2luZC5Ccm9rZW4sIHBvcykud3JhcCgpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgZGF0YTogUG9zaXRpb25EYXRhICYgQW55UG9zaXRpb24pIHt9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY2hhcmFjdGVyIG9mZnNldCBmb3IgdGhpcyBgU291cmNlT2Zmc2V0YCwgaWYgcG9zc2libGUuXG4gICAqL1xuICBnZXQgb2Zmc2V0KCk6IG51bWJlciB8IG51bGwge1xuICAgIGxldCBjaGFyUG9zID0gdGhpcy5kYXRhLnRvQ2hhclBvcygpO1xuICAgIHJldHVybiBjaGFyUG9zID09PSBudWxsID8gbnVsbCA6IGNoYXJQb3Mub2Zmc2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBhcmUgdGhpcyBvZmZzZXQgd2l0aCBhbm90aGVyIG9uZS5cbiAgICpcbiAgICogSWYgYm90aCBvZmZzZXRzIGFyZSBgSGJzUG9zaXRpb25gcywgdGhleSdyZSBlcXVpdmFsZW50IGFzIGxvbmcgYXMgdGhlaXIgbGluZXMgYW5kIGNvbHVtbnMgYXJlXG4gICAqIHRoZSBzYW1lLiBUaGlzIGF2b2lkcyBjb21wdXRpbmcgb2Zmc2V0cyB1bm5lY2Vzc2FyaWx5LlxuICAgKlxuICAgKiBPdGhlcndpc2UsIHR3byBgU291cmNlT2Zmc2V0YHMgYXJlIGVxdWl2YWxlbnQgaWYgdGhlaXIgc3VjY2Vzc2Z1bGx5IGNvbXB1dGVkIGNoYXJhY3RlciBvZmZzZXRzXG4gICAqIGFyZSB0aGUgc2FtZS5cbiAgICovXG4gIGVxbChyaWdodDogU291cmNlT2Zmc2V0KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVxbCh0aGlzLmRhdGEsIHJpZ2h0LmRhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIHNwYW4gdGhhdCBzdGFydHMgZnJvbSB0aGlzIHNvdXJjZSBvZmZzZXQgYW5kIGVuZHMgd2l0aCBhbm90aGVyIHNvdXJjZSBvZmZzZXQuIEF2b2lkXG4gICAqIGNvbXB1dGluZyBjaGFyYWN0ZXIgb2Zmc2V0cyBpZiBib3RoIGBTb3VyY2VPZmZzZXRgcyBhcmUgc3RpbGwgbGF6eS5cbiAgICovXG4gIHVudGlsKG90aGVyOiBTb3VyY2VPZmZzZXQpOiBTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gc3Bhbih0aGlzLmRhdGEsIG90aGVyLmRhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGBTb3VyY2VPZmZzZXRgIGJ5IG1vdmluZyB0aGUgY2hhcmFjdGVyIHBvc2l0aW9uIHJlcHJlc2VudGVkIGJ5IHRoaXMgc291cmNlIG9mZnNldFxuICAgKiBmb3J3YXJkIG9yIGJhY2t3YXJkIChpZiBgYnlgIGlzIG5lZ2F0aXZlKSwgaWYgcG9zc2libGUuXG4gICAqXG4gICAqIElmIHRoaXMgYFNvdXJjZU9mZnNldGAgY2FuJ3QgY29tcHV0ZSBhIHZhbGlkIGNoYXJhY3RlciBvZmZzZXQsIGBtb3ZlYCByZXR1cm5zIGEgYnJva2VuIG9mZnNldC5cbiAgICpcbiAgICogSWYgdGhlIHJlc3VsdGluZyBjaGFyYWN0ZXIgb2Zmc2V0IGlzIGxlc3MgdGhhbiAwIG9yIGdyZWF0ZXIgdGhhbiB0aGUgc2l6ZSBvZiB0aGUgc291cmNlLCBgbW92ZWBcbiAgICogcmV0dXJucyBhIGJyb2tlbiBvZmZzZXQuXG4gICAqL1xuICBtb3ZlKGJ5OiBudW1iZXIpOiBTb3VyY2VPZmZzZXQge1xuICAgIGxldCBjaGFyUG9zID0gdGhpcy5kYXRhLnRvQ2hhclBvcygpO1xuXG4gICAgaWYgKGNoYXJQb3MgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBTb3VyY2VPZmZzZXQuYnJva2VuKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCByZXN1bHQgPSBjaGFyUG9zLm9mZnNldCArIGJ5O1xuXG4gICAgICBpZiAoY2hhclBvcy5zb3VyY2UuY2hlY2socmVzdWx0KSkge1xuICAgICAgICByZXR1cm4gbmV3IENoYXJQb3NpdGlvbihjaGFyUG9zLnNvdXJjZSwgcmVzdWx0KS53cmFwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gU291cmNlT2Zmc2V0LmJyb2tlbigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYFNvdXJjZVNwYW5gIHRoYXQgcmVwcmVzZW50cyBhIGNvbGxhcHNlZCByYW5nZSBhdCB0aGlzIHNvdXJjZSBvZmZzZXQuIEF2b2lkXG4gICAqIGNvbXB1dGluZyB0aGUgY2hhcmFjdGVyIG9mZnNldCBpZiBpdCBoYXMgbm90IGFscmVhZHkgYmVlbiBjb21wdXRlZC5cbiAgICovXG4gIGNvbGxhcHNlZCgpOiBTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gc3Bhbih0aGlzLmRhdGEsIHRoaXMuZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCB0aGlzIGBTb3VyY2VPZmZzZXRgIGludG8gYSBIYW5kbGViYXJzIHtAc2VlIFNvdXJjZVBvc2l0aW9ufSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoXG4gICAqIGV4aXN0aW5nIHBsdWdpbnMuXG4gICAqL1xuICB0b0pTT04oKTogU291cmNlUG9zaXRpb24ge1xuICAgIHJldHVybiB0aGlzLmRhdGEudG9KU09OKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENoYXJQb3NpdGlvbiBpbXBsZW1lbnRzIFBvc2l0aW9uRGF0YSB7XG4gIHJlYWRvbmx5IGtpbmQgPSBPZmZzZXRLaW5kLkNoYXJQb3NpdGlvbjtcblxuICAvKiogQ29tcHV0ZWQgZnJvbSBjaGFyIG9mZnNldCAqL1xuICBfbG9jUG9zOiBIYnNQb3NpdGlvbiB8IEJST0tFTiB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHNvdXJjZTogU291cmNlLCByZWFkb25seSBjaGFyUG9zOiBudW1iZXIpIHt9XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgYWxyZWFkeSBhIGBDaGFyUG9zaXRpb25gLlxuICAgKlxuICAgKiB7QHNlZSBIYnNQb3NpdGlvbn0gZm9yIHRoZSBhbHRlcm5hdGl2ZS5cbiAgICpcbiAgICogQGltcGxlbWVudHMge1Bvc2l0aW9uRGF0YX1cbiAgICovXG4gIHRvQ2hhclBvcygpOiBDaGFyUG9zaXRpb24ge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2R1Y2UgYSBIYW5kbGViYXJzIHtAc2VlIFNvdXJjZVBvc2l0aW9ufSBmb3IgdGhpcyBgQ2hhclBvc2l0aW9uYC4gSWYgdGhpcyBgQ2hhclBvc2l0aW9uYCB3YXNcbiAgICogY29tcHV0ZWQgdXNpbmcge0BzZWUgU291cmNlT2Zmc2V0I21vdmV9LCB0aGlzIHdpbGwgY29tcHV0ZSB0aGUgYFNvdXJjZVBvc2l0aW9uYCBmb3IgdGhlIG9mZnNldC5cbiAgICpcbiAgICogQGltcGxlbWVudHMge1Bvc2l0aW9uRGF0YX1cbiAgICovXG4gIHRvSlNPTigpOiBTb3VyY2VQb3NpdGlvbiB7XG4gICAgbGV0IGhicyA9IHRoaXMudG9IYnNQb3MoKTtcbiAgICByZXR1cm4gaGJzID09PSBudWxsID8gVU5LTk9XTl9QT1NJVElPTiA6IGhicy50b0pTT04oKTtcbiAgfVxuXG4gIHdyYXAoKTogU291cmNlT2Zmc2V0IHtcbiAgICByZXR1cm4gbmV3IFNvdXJjZU9mZnNldCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGBDaGFyUG9zaXRpb25gIGFsd2F5cyBoYXMgYW4gb2Zmc2V0IGl0IGNhbiBwcm9kdWNlIHdpdGhvdXQgYW55IGFkZGl0aW9uYWwgY29tcHV0YXRpb24uXG4gICAqL1xuICBnZXQgb2Zmc2V0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuY2hhclBvcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHRoZSBjdXJyZW50IGNoYXJhY3RlciBvZmZzZXQgdG8gYW4gYEhic1Bvc2l0aW9uYCwgaWYgaXQgd2FzIG5vdCBhbHJlYWR5IGNvbXB1dGVkLiBPbmNlXG4gICAqIGEgYENoYXJQb3NpdGlvbmAgaGFzIGNvbXB1dGVkIGl0cyBgSGJzUG9zaXRpb25gLCBpdCB3aWxsIG5vdCBuZWVkIHRvIGRvIGNvbXB1dGUgaXQgYWdhaW4sIGFuZFxuICAgKiB0aGUgc2FtZSBgQ2hhclBvc2l0aW9uYCBpcyByZXRhaW5lZCB3aGVuIHVzZWQgYXMgb25lIG9mIHRoZSBlbmRzIG9mIGEgYFNvdXJjZVNwYW5gLCBzb1xuICAgKiBjb21wdXRpbmcgdGhlIGBIYnNQb3NpdGlvbmAgc2hvdWxkIGJlIGEgb25lLXRpbWUgb3BlcmF0aW9uLlxuICAgKi9cbiAgdG9IYnNQb3MoKTogSGJzUG9zaXRpb24gfCBudWxsIHtcbiAgICBsZXQgbG9jUG9zID0gdGhpcy5fbG9jUG9zO1xuXG4gICAgaWYgKGxvY1BvcyA9PT0gbnVsbCkge1xuICAgICAgbGV0IGhic1BvcyA9IHRoaXMuc291cmNlLmhic1Bvc0Zvcih0aGlzLmNoYXJQb3MpO1xuXG4gICAgICBpZiAoaGJzUG9zID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2xvY1BvcyA9IGxvY1BvcyA9IEJST0tFTjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2xvY1BvcyA9IGxvY1BvcyA9IG5ldyBIYnNQb3NpdGlvbih0aGlzLnNvdXJjZSwgaGJzUG9zLCB0aGlzLmNoYXJQb3MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsb2NQb3MgPT09IEJST0tFTiA/IG51bGwgOiBsb2NQb3M7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEhic1Bvc2l0aW9uIGltcGxlbWVudHMgUG9zaXRpb25EYXRhIHtcbiAgcmVhZG9ubHkga2luZCA9IE9mZnNldEtpbmQuSGJzUG9zaXRpb247XG5cbiAgX2NoYXJQb3M6IENoYXJQb3NpdGlvbiB8IEJST0tFTiB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgc291cmNlOiBTb3VyY2UsXG4gICAgcmVhZG9ubHkgaGJzUG9zOiBTb3VyY2VQb3NpdGlvbixcbiAgICBjaGFyUG9zOiBudW1iZXIgfCBudWxsID0gbnVsbFxuICApIHtcbiAgICB0aGlzLl9jaGFyUG9zID0gY2hhclBvcyA9PT0gbnVsbCA/IG51bGwgOiBuZXcgQ2hhclBvc2l0aW9uKHNvdXJjZSwgY2hhclBvcyk7XG4gIH1cblxuICAvKipcbiAgICogTGF6aWx5IGNvbXB1dGUgdGhlIGNoYXJhY3RlciBvZmZzZXQgZnJvbSB0aGUge0BzZWUgU291cmNlUG9zaXRpb259LiBPbmNlIGFuIGBIYnNQb3NpdGlvbmAgaGFzXG4gICAqIGNvbXB1dGVkIGl0cyBgQ2hhclBvc2l0aW9uYCwgaXQgd2lsbCBub3QgbmVlZCB0byBkbyBjb21wdXRlIGl0IGFnYWluLCBhbmQgdGhlIHNhbWVcbiAgICogYEhic1Bvc2l0aW9uYCBpcyByZXRhaW5lZCB3aGVuIHVzZWQgYXMgb25lIG9mIHRoZSBlbmRzIG9mIGEgYFNvdXJjZVNwYW5gLCBzbyBjb21wdXRpbmcgdGhlXG4gICAqIGBDaGFyUG9zaXRpb25gIHNob3VsZCBiZSBhIG9uZS10aW1lIG9wZXJhdGlvbi5cbiAgICpcbiAgICogQGltcGxlbWVudHMge1Bvc2l0aW9uRGF0YX1cbiAgICovXG4gIHRvQ2hhclBvcygpOiBDaGFyUG9zaXRpb24gfCBudWxsIHtcbiAgICBsZXQgY2hhclBvcyA9IHRoaXMuX2NoYXJQb3M7XG5cbiAgICBpZiAoY2hhclBvcyA9PT0gbnVsbCkge1xuICAgICAgbGV0IGNoYXJQb3NOdW1iZXIgPSB0aGlzLnNvdXJjZS5jaGFyUG9zRm9yKHRoaXMuaGJzUG9zKTtcblxuICAgICAgaWYgKGNoYXJQb3NOdW1iZXIgPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fY2hhclBvcyA9IGNoYXJQb3MgPSBCUk9LRU47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9jaGFyUG9zID0gY2hhclBvcyA9IG5ldyBDaGFyUG9zaXRpb24odGhpcy5zb3VyY2UsIGNoYXJQb3NOdW1iZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjaGFyUG9zID09PSBCUk9LRU4gPyBudWxsIDogY2hhclBvcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHtAc2VlIFNvdXJjZVBvc2l0aW9ufSB0aGF0IHRoaXMgYEhic1Bvc2l0aW9uYCB3YXMgaW5zdGFudGlhdGVkIHdpdGguIFRoaXMgb3BlcmF0aW9uXG4gICAqIGRvZXMgbm90IG5lZWQgdG8gY29tcHV0ZSBhbnl0aGluZy5cbiAgICpcbiAgICogQGltcGxlbWVudHMge1Bvc2l0aW9uRGF0YX1cbiAgICovXG4gIHRvSlNPTigpOiBTb3VyY2VQb3NpdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuaGJzUG9zO1xuICB9XG5cbiAgd3JhcCgpOiBTb3VyY2VPZmZzZXQge1xuICAgIHJldHVybiBuZXcgU291cmNlT2Zmc2V0KHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgYWxyZWFkeSBhbiBgSGJzUG9zaXRpb25gLlxuICAgKlxuICAgKiB7QHNlZSBDaGFyUG9zaXRpb259IGZvciB0aGUgYWx0ZXJuYXRpdmUuXG4gICAqL1xuICB0b0hic1BvcygpOiBIYnNQb3NpdGlvbiB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEludmlzaWJsZVBvc2l0aW9uIGltcGxlbWVudHMgUG9zaXRpb25EYXRhIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkga2luZDogT2Zmc2V0S2luZC5Ccm9rZW4gfCBPZmZzZXRLaW5kLkludGVybmFsc1N5bnRoZXRpYyB8IE9mZnNldEtpbmQuTm9uRXhpc3RlbnQsXG4gICAgLy8gd2hhdGV2ZXIgd2FzIHByb3ZpZGVkLCBwb3NzaWJseSBicm9rZW5cbiAgICByZWFkb25seSBwb3M6IFNvdXJjZVBvc2l0aW9uXG4gICkge31cblxuICAvKipcbiAgICogQSBicm9rZW4gcG9zaXRpb24gY2Fubm90IGJlIHR1cm5lZCBpbnRvIGEge0BzZWUgQ2hhcmFjdGVyUG9zaXRpb259LlxuICAgKi9cbiAgdG9DaGFyUG9zKCk6IG51bGwge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzZXJpYWxpemF0aW9uIG9mIGFuIGBJbnZpc2libGVQb3NpdGlvbiBpcyB3aGF0ZXZlciBIYW5kbGViYXJzIHtAc2VlIFNvdXJjZVBvc2l0aW9ufSB3YXNcbiAgICogb3JpZ2luYWxseSBpZGVudGlmaWVkIGFzIGJyb2tlbiwgbm9uLWV4aXN0ZW50IG9yIHN5bnRoZXRpYy5cbiAgICpcbiAgICogSWYgYW4gYEludmlzaWJsZVBvc2l0aW9uYCBuZXZlciBoYWQgYW4gc291cmNlIG9mZnNldCBhdCBhbGwsIHRoaXMgbWV0aG9kIHJldHVybnNcbiAgICoge0BzZWUgVU5LTk9XTl9QT1NJVElPTn0gZm9yIGNvbXBhdGliaWxpdHkuXG4gICAqL1xuICB0b0pTT04oKTogU291cmNlUG9zaXRpb24ge1xuICAgIHJldHVybiB0aGlzLnBvcztcbiAgfVxuXG4gIHdyYXAoKTogU291cmNlT2Zmc2V0IHtcbiAgICByZXR1cm4gbmV3IFNvdXJjZU9mZnNldCh0aGlzKTtcbiAgfVxuXG4gIGdldCBvZmZzZXQoKTogbnVsbCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21wYXJlIHR3byB7QHNlZSBBbnlQb3NpdGlvbn0gYW5kIGRldGVybWluZSB3aGV0aGVyIHRoZXkgYXJlIGVxdWFsLlxuICpcbiAqIEBzZWUge1NvdXJjZU9mZnNldCNlcWx9XG4gKi9cbmNvbnN0IGVxbCA9IG1hdGNoPGJvb2xlYW4+KChtKSA9PlxuICBtXG4gICAgLndoZW4oXG4gICAgICBPZmZzZXRLaW5kLkhic1Bvc2l0aW9uLFxuICAgICAgT2Zmc2V0S2luZC5IYnNQb3NpdGlvbixcbiAgICAgICh7IGhic1BvczogbGVmdCB9LCB7IGhic1BvczogcmlnaHQgfSkgPT5cbiAgICAgICAgbGVmdC5jb2x1bW4gPT09IHJpZ2h0LmNvbHVtbiAmJiBsZWZ0LmxpbmUgPT09IHJpZ2h0LmxpbmVcbiAgICApXG4gICAgLndoZW4oXG4gICAgICBPZmZzZXRLaW5kLkNoYXJQb3NpdGlvbixcbiAgICAgIE9mZnNldEtpbmQuQ2hhclBvc2l0aW9uLFxuICAgICAgKHsgY2hhclBvczogbGVmdCB9LCB7IGNoYXJQb3M6IHJpZ2h0IH0pID0+IGxlZnQgPT09IHJpZ2h0XG4gICAgKVxuICAgIC53aGVuKFxuICAgICAgT2Zmc2V0S2luZC5DaGFyUG9zaXRpb24sXG4gICAgICBPZmZzZXRLaW5kLkhic1Bvc2l0aW9uLFxuICAgICAgKHsgb2Zmc2V0OiBsZWZ0IH0sIHJpZ2h0KSA9PiBsZWZ0ID09PSByaWdodC50b0NoYXJQb3MoKT8ub2Zmc2V0XG4gICAgKVxuICAgIC53aGVuKFxuICAgICAgT2Zmc2V0S2luZC5IYnNQb3NpdGlvbixcbiAgICAgIE9mZnNldEtpbmQuQ2hhclBvc2l0aW9uLFxuICAgICAgKGxlZnQsIHsgb2Zmc2V0OiByaWdodCB9KSA9PiBsZWZ0LnRvQ2hhclBvcygpPy5vZmZzZXQgPT09IHJpZ2h0XG4gICAgKVxuICAgIC53aGVuKE1hdGNoQW55LCBNYXRjaEFueSwgKCkgPT4gZmFsc2UpXG4pO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==