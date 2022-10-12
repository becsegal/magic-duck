"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InvisiblePosition = exports.HbsPosition = exports.CharPosition = exports.SourceOffset = exports.BROKEN = void 0;

var _location = require("../location");

var _match = require("./match");

var _span = require("./span");

// eslint-disable-next-line import/no-extraneous-dependencies

/**
 * Used to indicate that an attempt to convert a `SourcePosition` to a character offset failed. It
 * is separate from `null` so that `null` can be used to indicate that the computation wasn't yet
 * attempted (and therefore to cache the failure)
 */
const BROKEN = 'BROKEN';
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

class SourceOffset {
  constructor(data) {
    this.data = data;
  }
  /**
   * Create a `SourceOffset` from a Handlebars `SourcePosition`. It's stored as-is, and converted
   * into a character offset on demand, which avoids unnecessarily computing the offset of every
   * `SourceLocation`, but also means that broken `SourcePosition`s are not always detected.
   */


  static forHbsPos(source, pos) {
    return new HbsPosition(source, pos, null).wrap();
  }
  /**
   * Create a `SourceOffset` that corresponds to a broken `SourcePosition`. This means that the
   * calling code determined (or knows) that the `SourceLocation` doesn't correspond correctly to
   * any part of the source.
   */


  static broken(pos = _location.UNKNOWN_POSITION) {
    return new InvisiblePosition("Broken"
    /* Broken */
    , pos).wrap();
  }
  /**
   * Get the character offset for this `SourceOffset`, if possible.
   */


  get offset() {
    let charPos = this.data.toCharPos();
    return charPos === null ? null : charPos.offset;
  }
  /**
   * Compare this offset with another one.
   *
   * If both offsets are `HbsPosition`s, they're equivalent as long as their lines and columns are
   * the same. This avoids computing offsets unnecessarily.
   *
   * Otherwise, two `SourceOffset`s are equivalent if their successfully computed character offsets
   * are the same.
   */


  eql(right) {
    return eql(this.data, right.data);
  }
  /**
   * Create a span that starts from this source offset and ends with another source offset. Avoid
   * computing character offsets if both `SourceOffset`s are still lazy.
   */


  until(other) {
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


  move(by) {
    let charPos = this.data.toCharPos();

    if (charPos === null) {
      return SourceOffset.broken();
    } else {
      let result = charPos.offset + by;

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


  collapsed() {
    return (0, _span.span)(this.data, this.data);
  }
  /**
   * Convert this `SourceOffset` into a Handlebars {@see SourcePosition} for compatibility with
   * existing plugins.
   */


  toJSON() {
    return this.data.toJSON();
  }

}

exports.SourceOffset = SourceOffset;

class CharPosition {
  constructor(source, charPos) {
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


  toCharPos() {
    return this;
  }
  /**
   * Produce a Handlebars {@see SourcePosition} for this `CharPosition`. If this `CharPosition` was
   * computed using {@see SourceOffset#move}, this will compute the `SourcePosition` for the offset.
   *
   * @implements {PositionData}
   */


  toJSON() {
    let hbs = this.toHbsPos();
    return hbs === null ? _location.UNKNOWN_POSITION : hbs.toJSON();
  }

  wrap() {
    return new SourceOffset(this);
  }
  /**
   * A `CharPosition` always has an offset it can produce without any additional computation.
   */


  get offset() {
    return this.charPos;
  }
  /**
   * Convert the current character offset to an `HbsPosition`, if it was not already computed. Once
   * a `CharPosition` has computed its `HbsPosition`, it will not need to do compute it again, and
   * the same `CharPosition` is retained when used as one of the ends of a `SourceSpan`, so
   * computing the `HbsPosition` should be a one-time operation.
   */


  toHbsPos() {
    let locPos = this._locPos;

    if (locPos === null) {
      let hbsPos = this.source.hbsPosFor(this.charPos);

      if (hbsPos === null) {
        this._locPos = locPos = BROKEN;
      } else {
        this._locPos = locPos = new HbsPosition(this.source, hbsPos, this.charPos);
      }
    }

    return locPos === BROKEN ? null : locPos;
  }

}

exports.CharPosition = CharPosition;

class HbsPosition {
  constructor(source, hbsPos, charPos = null) {
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


  toCharPos() {
    let charPos = this._charPos;

    if (charPos === null) {
      let charPosNumber = this.source.charPosFor(this.hbsPos);

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


  toJSON() {
    return this.hbsPos;
  }

  wrap() {
    return new SourceOffset(this);
  }
  /**
   * This is already an `HbsPosition`.
   *
   * {@see CharPosition} for the alternative.
   */


  toHbsPos() {
    return this;
  }

}

exports.HbsPosition = HbsPosition;

class InvisiblePosition {
  constructor(kind, // whatever was provided, possibly broken
  pos) {
    this.kind = kind;
    this.pos = pos;
  }
  /**
   * A broken position cannot be turned into a {@see CharacterPosition}.
   */


  toCharPos() {
    return null;
  }
  /**
   * The serialization of an `InvisiblePosition is whatever Handlebars {@see SourcePosition} was
   * originally identified as broken, non-existent or synthetic.
   *
   * If an `InvisiblePosition` never had an source offset at all, this method returns
   * {@see UNKNOWN_POSITION} for compatibility.
   */


  toJSON() {
    return this.pos;
  }

  wrap() {
    return new SourceOffset(this);
  }

  get offset() {
    return null;
  }

}
/**
 * Compare two {@see AnyPosition} and determine whether they are equal.
 *
 * @see {SourceOffset#eql}
 */


exports.InvisiblePosition = InvisiblePosition;
const eql = (0, _match.match)(m => m.when("HbsPosition"
/* HbsPosition */
, "HbsPosition"
/* HbsPosition */
, ({
  hbsPos: left
}, {
  hbsPos: right
}) => left.column === right.column && left.line === right.line).when("CharPosition"
/* CharPosition */
, "CharPosition"
/* CharPosition */
, ({
  charPos: left
}, {
  charPos: right
}) => left === right).when("CharPosition"
/* CharPosition */
, "HbsPosition"
/* HbsPosition */
, ({
  offset: left
}, right) => {
  var _a;

  return left === ((_a = right.toCharPos()) === null || _a === void 0 ? void 0 : _a.offset);
}).when("HbsPosition"
/* HbsPosition */
, "CharPosition"
/* CharPosition */
, (left, {
  offset: right
}) => {
  var _a;

  return ((_a = left.toCharPos()) === null || _a === void 0 ? void 0 : _a.offset) === right;
}).when(_match.MatchAny, _match.MatchAny, () => false));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvc291cmNlL2xvYy9vZmZzZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUVBOztBQUNBOztBQUpBOztBQWdEQTs7Ozs7QUFLTyxNQUFNLE1BQU0sR0FBWixRQUFBO0FBS1A7Ozs7Ozs7Ozs7Ozs7QUFVTSxNQUFBLFlBQUEsQ0FBbUI7QUFtQnZCLEVBQUEsV0FBQSxDQUFBLElBQUEsRUFBcUQ7QUFBaEMsU0FBQSxJQUFBLEdBQUEsSUFBQTtBQUFvQztBQWxCekQ7Ozs7Ozs7QUFLQSxTQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFvRDtBQUNsRCxXQUFPLElBQUEsV0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFQLElBQU8sRUFBUDtBQUNEO0FBRUQ7Ozs7Ozs7QUFLQSxTQUFBLE1BQUEsQ0FBYyxHQUFBLEdBQWQsMEJBQUEsRUFBb0Q7QUFDbEQsV0FBTyxJQUFBLGlCQUFBLENBQXFCO0FBQUE7QUFBckIsTUFBQSxHQUFBLEVBQVAsSUFBTyxFQUFQO0FBQ0Q7QUFJRDs7Ozs7QUFHQSxNQUFBLE1BQUEsR0FBVTtBQUNSLFFBQUksT0FBTyxHQUFHLEtBQUEsSUFBQSxDQUFkLFNBQWMsRUFBZDtBQUNBLFdBQU8sT0FBTyxLQUFQLElBQUEsR0FBQSxJQUFBLEdBQTBCLE9BQU8sQ0FBeEMsTUFBQTtBQUNEO0FBRUQ7Ozs7Ozs7Ozs7O0FBU0EsRUFBQSxHQUFHLENBQUEsS0FBQSxFQUFvQjtBQUNyQixXQUFPLEdBQUcsQ0FBQyxLQUFELElBQUEsRUFBWSxLQUFLLENBQTNCLElBQVUsQ0FBVjtBQUNEO0FBRUQ7Ozs7OztBQUlBLEVBQUEsS0FBSyxDQUFBLEtBQUEsRUFBb0I7QUFDdkIsV0FBTyxnQkFBSyxLQUFELElBQUosRUFBZ0IsS0FBSyxDQUE1QixJQUFPLENBQVA7QUFDRDtBQUVEOzs7Ozs7Ozs7OztBQVNBLEVBQUEsSUFBSSxDQUFBLEVBQUEsRUFBVztBQUNiLFFBQUksT0FBTyxHQUFHLEtBQUEsSUFBQSxDQUFkLFNBQWMsRUFBZDs7QUFFQSxRQUFJLE9BQU8sS0FBWCxJQUFBLEVBQXNCO0FBQ3BCLGFBQU8sWUFBWSxDQUFuQixNQUFPLEVBQVA7QUFERixLQUFBLE1BRU87QUFDTCxVQUFJLE1BQU0sR0FBRyxPQUFPLENBQVAsTUFBQSxHQUFiLEVBQUE7O0FBRUEsVUFBSSxPQUFPLENBQVAsTUFBQSxDQUFBLEtBQUEsQ0FBSixNQUFJLENBQUosRUFBa0M7QUFDaEMsZUFBTyxJQUFBLFlBQUEsQ0FBaUIsT0FBTyxDQUF4QixNQUFBLEVBQUEsTUFBQSxFQUFQLElBQU8sRUFBUDtBQURGLE9BQUEsTUFFTztBQUNMLGVBQU8sWUFBWSxDQUFuQixNQUFPLEVBQVA7QUFDRDtBQUNGO0FBQ0Y7QUFFRDs7Ozs7O0FBSUEsRUFBQSxTQUFTLEdBQUE7QUFDUCxXQUFPLGdCQUFLLEtBQUQsSUFBSixFQUFnQixLQUF2QixJQUFPLENBQVA7QUFDRDtBQUVEOzs7Ozs7QUFJQSxFQUFBLE1BQU0sR0FBQTtBQUNKLFdBQU8sS0FBQSxJQUFBLENBQVAsTUFBTyxFQUFQO0FBQ0Q7O0FBekZzQjs7OztBQTRGbkIsTUFBQSxZQUFBLENBQW1CO0FBTXZCLEVBQUEsV0FBQSxDQUFBLE1BQUEsRUFBQSxPQUFBLEVBQTZEO0FBQXhDLFNBQUEsTUFBQSxHQUFBLE1BQUE7QUFBeUIsU0FBQSxPQUFBLEdBQUEsT0FBQTtBQUxyQyxTQUFBLElBQUEsR0FBSTtBQUFBO0FBQUo7QUFFVDs7QUFDQSxTQUFBLE9BQUEsR0FBQSxJQUFBO0FBRWlFO0FBRWpFOzs7Ozs7Ozs7QUFPQSxFQUFBLFNBQVMsR0FBQTtBQUNQLFdBQUEsSUFBQTtBQUNEO0FBRUQ7Ozs7Ozs7O0FBTUEsRUFBQSxNQUFNLEdBQUE7QUFDSixRQUFJLEdBQUcsR0FBRyxLQUFWLFFBQVUsRUFBVjtBQUNBLFdBQU8sR0FBRyxLQUFILElBQUEsR0FBQSwwQkFBQSxHQUFrQyxHQUFHLENBQTVDLE1BQXlDLEVBQXpDO0FBQ0Q7O0FBRUQsRUFBQSxJQUFJLEdBQUE7QUFDRixXQUFPLElBQUEsWUFBQSxDQUFQLElBQU8sQ0FBUDtBQUNEO0FBRUQ7Ozs7O0FBR0EsTUFBQSxNQUFBLEdBQVU7QUFDUixXQUFPLEtBQVAsT0FBQTtBQUNEO0FBRUQ7Ozs7Ozs7O0FBTUEsRUFBQSxRQUFRLEdBQUE7QUFDTixRQUFJLE1BQU0sR0FBRyxLQUFiLE9BQUE7O0FBRUEsUUFBSSxNQUFNLEtBQVYsSUFBQSxFQUFxQjtBQUNuQixVQUFJLE1BQU0sR0FBRyxLQUFBLE1BQUEsQ0FBQSxTQUFBLENBQXNCLEtBQW5DLE9BQWEsQ0FBYjs7QUFFQSxVQUFJLE1BQU0sS0FBVixJQUFBLEVBQXFCO0FBQ25CLGFBQUEsT0FBQSxHQUFlLE1BQU0sR0FBckIsTUFBQTtBQURGLE9BQUEsTUFFTztBQUNMLGFBQUEsT0FBQSxHQUFlLE1BQU0sR0FBRyxJQUFBLFdBQUEsQ0FBZ0IsS0FBaEIsTUFBQSxFQUFBLE1BQUEsRUFBcUMsS0FBN0QsT0FBd0IsQ0FBeEI7QUFDRDtBQUNGOztBQUVELFdBQU8sTUFBTSxLQUFOLE1BQUEsR0FBQSxJQUFBLEdBQVAsTUFBQTtBQUNEOztBQTdEc0I7Ozs7QUFnRW5CLE1BQUEsV0FBQSxDQUFrQjtBQUt0QixFQUFBLFdBQUEsQ0FBQSxNQUFBLEVBQUEsTUFBQSxFQUdFLE9BQUEsR0FIRixJQUFBLEVBRytCO0FBRnBCLFNBQUEsTUFBQSxHQUFBLE1BQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxNQUFBO0FBTkYsU0FBQSxJQUFBLEdBQUk7QUFBQTtBQUFKO0FBU1AsU0FBQSxRQUFBLEdBQWdCLE9BQU8sS0FBUCxJQUFBLEdBQUEsSUFBQSxHQUEwQixJQUFBLFlBQUEsQ0FBQSxNQUFBLEVBQTFDLE9BQTBDLENBQTFDO0FBQ0Q7QUFFRDs7Ozs7Ozs7OztBQVFBLEVBQUEsU0FBUyxHQUFBO0FBQ1AsUUFBSSxPQUFPLEdBQUcsS0FBZCxRQUFBOztBQUVBLFFBQUksT0FBTyxLQUFYLElBQUEsRUFBc0I7QUFDcEIsVUFBSSxhQUFhLEdBQUcsS0FBQSxNQUFBLENBQUEsVUFBQSxDQUF1QixLQUEzQyxNQUFvQixDQUFwQjs7QUFFQSxVQUFJLGFBQWEsS0FBakIsSUFBQSxFQUE0QjtBQUMxQixhQUFBLFFBQUEsR0FBZ0IsT0FBTyxHQUF2QixNQUFBO0FBREYsT0FBQSxNQUVPO0FBQ0wsYUFBQSxRQUFBLEdBQWdCLE9BQU8sR0FBRyxJQUFBLFlBQUEsQ0FBaUIsS0FBakIsTUFBQSxFQUExQixhQUEwQixDQUExQjtBQUNEO0FBQ0Y7O0FBRUQsV0FBTyxPQUFPLEtBQVAsTUFBQSxHQUFBLElBQUEsR0FBUCxPQUFBO0FBQ0Q7QUFFRDs7Ozs7Ozs7QUFNQSxFQUFBLE1BQU0sR0FBQTtBQUNKLFdBQU8sS0FBUCxNQUFBO0FBQ0Q7O0FBRUQsRUFBQSxJQUFJLEdBQUE7QUFDRixXQUFPLElBQUEsWUFBQSxDQUFQLElBQU8sQ0FBUDtBQUNEO0FBRUQ7Ozs7Ozs7QUFLQSxFQUFBLFFBQVEsR0FBQTtBQUNOLFdBQUEsSUFBQTtBQUNEOztBQTFEcUI7Ozs7QUE2RGxCLE1BQUEsaUJBQUEsQ0FBd0I7QUFDNUIsRUFBQSxXQUFBLENBQUEsSUFBQSxFQUVFO0FBRkYsRUFBQSxHQUFBLEVBRzhCO0FBRm5CLFNBQUEsSUFBQSxHQUFBLElBQUE7QUFFQSxTQUFBLEdBQUEsR0FBQSxHQUFBO0FBQ1A7QUFFSjs7Ozs7QUFHQSxFQUFBLFNBQVMsR0FBQTtBQUNQLFdBQUEsSUFBQTtBQUNEO0FBRUQ7Ozs7Ozs7OztBQU9BLEVBQUEsTUFBTSxHQUFBO0FBQ0osV0FBTyxLQUFQLEdBQUE7QUFDRDs7QUFFRCxFQUFBLElBQUksR0FBQTtBQUNGLFdBQU8sSUFBQSxZQUFBLENBQVAsSUFBTyxDQUFQO0FBQ0Q7O0FBRUQsTUFBQSxNQUFBLEdBQVU7QUFDUixXQUFBLElBQUE7QUFDRDs7QUEvQjJCO0FBa0M5Qjs7Ozs7Ozs7QUFLQSxNQUFNLEdBQUcsR0FBRyxrQkFBZ0IsQ0FBRCxJQUN6QixDQUFDLENBQUQsSUFBQSxDQUNPO0FBQUE7QUFEUCxFQUNPO0FBQUE7QUFEUCxFQUlJLENBQUM7QUFBRSxFQUFBLE1BQU0sRUFBRTtBQUFWLENBQUQsRUFBbUI7QUFBRSxFQUFBLE1BQU0sRUFBRTtBQUFWLENBQW5CLEtBQ0UsSUFBSSxDQUFKLE1BQUEsS0FBZ0IsS0FBSyxDQUFyQixNQUFBLElBQWdDLElBQUksQ0FBSixJQUFBLEtBQWMsS0FBSyxDQUx6RCxJQUFBLEVBQUEsSUFBQSxDQU9PO0FBQUE7QUFQUCxFQU9PO0FBQUE7QUFQUCxFQVVJLENBQUM7QUFBRSxFQUFBLE9BQU8sRUFBRTtBQUFYLENBQUQsRUFBb0I7QUFBRSxFQUFBLE9BQU8sRUFBRTtBQUFYLENBQXBCLEtBQTJDLElBQUksS0FWbkQsS0FBQSxFQUFBLElBQUEsQ0FZTztBQUFBO0FBWlAsRUFZTztBQUFBO0FBWlAsRUFlSSxDQUFDO0FBQUUsRUFBQSxNQUFNLEVBQUU7QUFBVixDQUFELEVBQUEsS0FBQSxLQUE0QjtBQUFBLE1BQUEsRUFBQTs7QUFBQyxTQUFBLElBQUksTUFBQSxDQUFBLEVBQUEsR0FBSyxLQUFLLENBQVYsU0FBSyxFQUFMLE1BQUEsSUFBQSxJQUFzQixFQUFBLEtBQUEsS0FBdEIsQ0FBQSxHQUFzQixLQUF0QixDQUFBLEdBQXNCLEVBQUEsQ0FBMUIsTUFBSSxDQUFKO0FBZmpDLENBQUEsRUFBQSxJQUFBLENBaUJPO0FBQUE7QUFqQlAsRUFpQk87QUFBQTtBQWpCUCxFQW9CSSxDQUFBLElBQUEsRUFBTztBQUFFLEVBQUEsTUFBTSxFQUFFO0FBQVYsQ0FBUCxLQUE0QjtBQUFBLE1BQUEsRUFBQTs7QUFBQyxTQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFKLFNBQUEsRUFBQSxNQUFBLElBQUEsSUFBZ0IsRUFBQSxLQUFBLEtBQWhCLENBQUEsR0FBZ0IsS0FBaEIsQ0FBQSxHQUFnQixFQUFBLENBQWhCLE1BQUEsTUFBQSxLQUFBO0FBcEJqQyxDQUFBLEVBQUEsSUFBQSxDQUFBLGVBQUEsRUFBQSxlQUFBLEVBc0I0QixNQXZCOUIsS0FDRSxDQURVLENBQVoiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzXG5pbXBvcnQgeyBTb3VyY2VQb3NpdGlvbiwgVU5LTk9XTl9QT1NJVElPTiB9IGZyb20gJy4uL2xvY2F0aW9uJztcbmltcG9ydCB7IFNvdXJjZSB9IGZyb20gJy4uL3NvdXJjZSc7XG5pbXBvcnQgeyBtYXRjaCwgTWF0Y2hBbnkgfSBmcm9tICcuL21hdGNoJztcbmltcG9ydCB7IFNvdXJjZVNwYW4sIHNwYW4gfSBmcm9tICcuL3NwYW4nO1xuXG5leHBvcnQgY29uc3QgZW51bSBPZmZzZXRLaW5kIHtcbiAgLyoqXG4gICAqIFdlIGhhdmUgYWxyZWFkeSBjb21wdXRlZCB0aGUgY2hhcmFjdGVyIHBvc2l0aW9uIG9mIHRoaXMgb2Zmc2V0IG9yIHNwYW4uXG4gICAqL1xuICBDaGFyUG9zaXRpb24gPSAnQ2hhclBvc2l0aW9uJyxcblxuICAvKipcbiAgICogVGhpcyBvZmZzZXQgb3Igc3BhbiB3YXMgaW5zdGFudGlhdGVkIHdpdGggYSBIYW5kbGViYXJzIFNvdXJjZVBvc2l0aW9uIG9yIFNvdXJjZUxvY2F0aW9uLiBJdHNcbiAgICogY2hhcmFjdGVyIHBvc2l0aW9uIHdpbGwgYmUgY29tcHV0ZWQgb24gZGVtYW5kLlxuICAgKi9cbiAgSGJzUG9zaXRpb24gPSAnSGJzUG9zaXRpb24nLFxuXG4gIC8qKlxuICAgKiBmb3IgKHJhcmUpIHNpdHVhdGlvbnMgd2hlcmUgYSBub2RlIGlzIGNyZWF0ZWQgYnV0IHRoZXJlIHdhcyBubyBzb3VyY2UgbG9jYXRpb24gKGUuZy4gdGhlIG5hbWVcbiAgICogXCJkZWZhdWx0XCIgaW4gZGVmYXVsdCBibG9ja3Mgd2hlbiB0aGUgd29yZCBcImRlZmF1bHRcIiBuZXZlciBhcHBlYXJlZCBpbiBzb3VyY2UpLiBUaGlzIGlzIHVzZWRcbiAgICogYnkgdGhlIGludGVybmFscyB3aGVuIHRoZXJlIGlzIGEgbGVnaXRpbWF0ZSByZWFzb24gZm9yIHRoZSBpbnRlcm5hbHMgdG8gc3ludGhlc2l6ZSBhIG5vZGVcbiAgICogd2l0aCBubyBsb2NhdGlvbi5cbiAgICovXG4gIEludGVybmFsc1N5bnRoZXRpYyA9ICdJbnRlcm5hbHNTeW50aGV0aWMnLFxuICAvKipcbiAgICogRm9yIHNpdHVhdGlvbnMgd2hlcmUgYSBub2RlIHJlcHJlc2VudHMgemVybyBwYXJ0cyBvZiB0aGUgc291cmNlIChmb3IgZXhhbXBsZSwgZW1wdHkgYXJndW1lbnRzKS5cbiAgICogSW4gZ2VuZXJhbCwgd2UgYXR0ZW1wdCB0byBhc3NpZ24gdGhlc2Ugbm9kZXMgKnNvbWUqIHBvc2l0aW9uIChlbXB0eSBhcmd1bWVudHMgY2FuIGJlXG4gICAqIHBvc2l0aW9uZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGNhbGxlZSksIGJ1dCBpdCdzIG5vdCBhbHdheXMgcG9zc2libGVcbiAgICovXG4gIE5vbkV4aXN0ZW50ID0gJ05vbkV4aXN0ZW50JyxcbiAgLyoqXG4gICAqIEZvciBzaXR1YXRpb25zIHdoZXJlIGEgc291cmNlIGxvY2F0aW9uIHdhcyBleHBlY3RlZCwgYnV0IGl0IGRpZG4ndCBjb3JyZXNwb25kIHRvIHRoZSBub2RlIGluXG4gICAqIHRoZSBzb3VyY2UuIFRoaXMgaGFwcGVucyBpZiBhIHBsdWdpbiBjcmVhdGVzIGJyb2tlbiBsb2NhdGlvbnMuXG4gICAqL1xuICBCcm9rZW4gPSAnQnJva2VuJyxcbn1cblxuLyoqXG4gKiBBbGwgcG9zaXRpb25zIGhhdmUgdGhlc2UgZGV0YWlscyBpbiBjb21tb24uIE1vc3Qgbm90YWJseSwgYWxsIHRocmVlIGtpbmRzIG9mIHBvc2l0aW9ucyBjYW5cbiAqIG11c3QgYmUgYWJsZSB0byBhdHRlbXB0IHRvIGNvbnZlcnQgdGhlbXNlbHZlcyBpbnRvIHtAc2VlIENoYXJQb3NpdGlvbn0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUG9zaXRpb25EYXRhIHtcbiAgcmVhZG9ubHkga2luZDogT2Zmc2V0S2luZDtcbiAgdG9DaGFyUG9zKCk6IENoYXJQb3NpdGlvbiB8IG51bGw7XG4gIHRvSlNPTigpOiBTb3VyY2VQb3NpdGlvbjtcbn1cblxuLyoqXG4gKiBVc2VkIHRvIGluZGljYXRlIHRoYXQgYW4gYXR0ZW1wdCB0byBjb252ZXJ0IGEgYFNvdXJjZVBvc2l0aW9uYCB0byBhIGNoYXJhY3RlciBvZmZzZXQgZmFpbGVkLiBJdFxuICogaXMgc2VwYXJhdGUgZnJvbSBgbnVsbGAgc28gdGhhdCBgbnVsbGAgY2FuIGJlIHVzZWQgdG8gaW5kaWNhdGUgdGhhdCB0aGUgY29tcHV0YXRpb24gd2Fzbid0IHlldFxuICogYXR0ZW1wdGVkIChhbmQgdGhlcmVmb3JlIHRvIGNhY2hlIHRoZSBmYWlsdXJlKVxuICovXG5leHBvcnQgY29uc3QgQlJPS0VOID0gJ0JST0tFTic7XG5leHBvcnQgdHlwZSBCUk9LRU4gPSAnQlJPS0VOJztcblxuZXhwb3J0IHR5cGUgQW55UG9zaXRpb24gPSBIYnNQb3NpdGlvbiB8IENoYXJQb3NpdGlvbiB8IEludmlzaWJsZVBvc2l0aW9uO1xuXG4vKipcbiAqIEEgYFNvdXJjZU9mZnNldGAgcmVwcmVzZW50cyBhIHNpbmdsZSBwb3NpdGlvbiBpbiB0aGUgc291cmNlLlxuICpcbiAqIFRoZXJlIGFyZSB0aHJlZSBraW5kcyBvZiBiYWNraW5nIGRhdGEgZm9yIGBTb3VyY2VPZmZzZXRgIG9iamVjdHM6XG4gKlxuICogLSBgQ2hhclBvc2l0aW9uYCwgd2hpY2ggY29udGFpbnMgYSBjaGFyYWN0ZXIgb2Zmc2V0IGludG8gdGhlIHJhdyBzb3VyY2Ugc3RyaW5nXG4gKiAtIGBIYnNQb3NpdGlvbmAsIHdoaWNoIGNvbnRhaW5zIGEgYFNvdXJjZVBvc2l0aW9uYCBmcm9tIHRoZSBIYW5kbGViYXJzIEFTVCwgd2hpY2ggY2FuIGJlXG4gKiAgIGNvbnZlcnRlZCB0byBhIGBDaGFyUG9zaXRpb25gIG9uIGRlbWFuZC5cbiAqIC0gYEludmlzaWJsZVBvc2l0aW9uYCwgd2hpY2ggcmVwcmVzZW50cyBhIHBvc2l0aW9uIG5vdCBpbiBzb3VyY2UgKEBzZWUge0ludmlzaWJsZVBvc2l0aW9ufSlcbiAqL1xuZXhwb3J0IGNsYXNzIFNvdXJjZU9mZnNldCB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBgU291cmNlT2Zmc2V0YCBmcm9tIGEgSGFuZGxlYmFycyBgU291cmNlUG9zaXRpb25gLiBJdCdzIHN0b3JlZCBhcy1pcywgYW5kIGNvbnZlcnRlZFxuICAgKiBpbnRvIGEgY2hhcmFjdGVyIG9mZnNldCBvbiBkZW1hbmQsIHdoaWNoIGF2b2lkcyB1bm5lY2Vzc2FyaWx5IGNvbXB1dGluZyB0aGUgb2Zmc2V0IG9mIGV2ZXJ5XG4gICAqIGBTb3VyY2VMb2NhdGlvbmAsIGJ1dCBhbHNvIG1lYW5zIHRoYXQgYnJva2VuIGBTb3VyY2VQb3NpdGlvbmBzIGFyZSBub3QgYWx3YXlzIGRldGVjdGVkLlxuICAgKi9cbiAgc3RhdGljIGZvckhic1Bvcyhzb3VyY2U6IFNvdXJjZSwgcG9zOiBTb3VyY2VQb3NpdGlvbik6IFNvdXJjZU9mZnNldCB7XG4gICAgcmV0dXJuIG5ldyBIYnNQb3NpdGlvbihzb3VyY2UsIHBvcywgbnVsbCkud3JhcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGBTb3VyY2VPZmZzZXRgIHRoYXQgY29ycmVzcG9uZHMgdG8gYSBicm9rZW4gYFNvdXJjZVBvc2l0aW9uYC4gVGhpcyBtZWFucyB0aGF0IHRoZVxuICAgKiBjYWxsaW5nIGNvZGUgZGV0ZXJtaW5lZCAob3Iga25vd3MpIHRoYXQgdGhlIGBTb3VyY2VMb2NhdGlvbmAgZG9lc24ndCBjb3JyZXNwb25kIGNvcnJlY3RseSB0b1xuICAgKiBhbnkgcGFydCBvZiB0aGUgc291cmNlLlxuICAgKi9cbiAgc3RhdGljIGJyb2tlbihwb3M6IFNvdXJjZVBvc2l0aW9uID0gVU5LTk9XTl9QT1NJVElPTik6IFNvdXJjZU9mZnNldCB7XG4gICAgcmV0dXJuIG5ldyBJbnZpc2libGVQb3NpdGlvbihPZmZzZXRLaW5kLkJyb2tlbiwgcG9zKS53cmFwKCk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBkYXRhOiBQb3NpdGlvbkRhdGEgJiBBbnlQb3NpdGlvbikge31cblxuICAvKipcbiAgICogR2V0IHRoZSBjaGFyYWN0ZXIgb2Zmc2V0IGZvciB0aGlzIGBTb3VyY2VPZmZzZXRgLCBpZiBwb3NzaWJsZS5cbiAgICovXG4gIGdldCBvZmZzZXQoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgbGV0IGNoYXJQb3MgPSB0aGlzLmRhdGEudG9DaGFyUG9zKCk7XG4gICAgcmV0dXJuIGNoYXJQb3MgPT09IG51bGwgPyBudWxsIDogY2hhclBvcy5vZmZzZXQ7XG4gIH1cblxuICAvKipcbiAgICogQ29tcGFyZSB0aGlzIG9mZnNldCB3aXRoIGFub3RoZXIgb25lLlxuICAgKlxuICAgKiBJZiBib3RoIG9mZnNldHMgYXJlIGBIYnNQb3NpdGlvbmBzLCB0aGV5J3JlIGVxdWl2YWxlbnQgYXMgbG9uZyBhcyB0aGVpciBsaW5lcyBhbmQgY29sdW1ucyBhcmVcbiAgICogdGhlIHNhbWUuIFRoaXMgYXZvaWRzIGNvbXB1dGluZyBvZmZzZXRzIHVubmVjZXNzYXJpbHkuXG4gICAqXG4gICAqIE90aGVyd2lzZSwgdHdvIGBTb3VyY2VPZmZzZXRgcyBhcmUgZXF1aXZhbGVudCBpZiB0aGVpciBzdWNjZXNzZnVsbHkgY29tcHV0ZWQgY2hhcmFjdGVyIG9mZnNldHNcbiAgICogYXJlIHRoZSBzYW1lLlxuICAgKi9cbiAgZXFsKHJpZ2h0OiBTb3VyY2VPZmZzZXQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZXFsKHRoaXMuZGF0YSwgcmlnaHQuZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgc3BhbiB0aGF0IHN0YXJ0cyBmcm9tIHRoaXMgc291cmNlIG9mZnNldCBhbmQgZW5kcyB3aXRoIGFub3RoZXIgc291cmNlIG9mZnNldC4gQXZvaWRcbiAgICogY29tcHV0aW5nIGNoYXJhY3RlciBvZmZzZXRzIGlmIGJvdGggYFNvdXJjZU9mZnNldGBzIGFyZSBzdGlsbCBsYXp5LlxuICAgKi9cbiAgdW50aWwob3RoZXI6IFNvdXJjZU9mZnNldCk6IFNvdXJjZVNwYW4ge1xuICAgIHJldHVybiBzcGFuKHRoaXMuZGF0YSwgb3RoZXIuZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgYFNvdXJjZU9mZnNldGAgYnkgbW92aW5nIHRoZSBjaGFyYWN0ZXIgcG9zaXRpb24gcmVwcmVzZW50ZWQgYnkgdGhpcyBzb3VyY2Ugb2Zmc2V0XG4gICAqIGZvcndhcmQgb3IgYmFja3dhcmQgKGlmIGBieWAgaXMgbmVnYXRpdmUpLCBpZiBwb3NzaWJsZS5cbiAgICpcbiAgICogSWYgdGhpcyBgU291cmNlT2Zmc2V0YCBjYW4ndCBjb21wdXRlIGEgdmFsaWQgY2hhcmFjdGVyIG9mZnNldCwgYG1vdmVgIHJldHVybnMgYSBicm9rZW4gb2Zmc2V0LlxuICAgKlxuICAgKiBJZiB0aGUgcmVzdWx0aW5nIGNoYXJhY3RlciBvZmZzZXQgaXMgbGVzcyB0aGFuIDAgb3IgZ3JlYXRlciB0aGFuIHRoZSBzaXplIG9mIHRoZSBzb3VyY2UsIGBtb3ZlYFxuICAgKiByZXR1cm5zIGEgYnJva2VuIG9mZnNldC5cbiAgICovXG4gIG1vdmUoYnk6IG51bWJlcik6IFNvdXJjZU9mZnNldCB7XG4gICAgbGV0IGNoYXJQb3MgPSB0aGlzLmRhdGEudG9DaGFyUG9zKCk7XG5cbiAgICBpZiAoY2hhclBvcyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFNvdXJjZU9mZnNldC5icm9rZW4oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJlc3VsdCA9IGNoYXJQb3Mub2Zmc2V0ICsgYnk7XG5cbiAgICAgIGlmIChjaGFyUG9zLnNvdXJjZS5jaGVjayhyZXN1bHQpKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2hhclBvc2l0aW9uKGNoYXJQb3Muc291cmNlLCByZXN1bHQpLndyYXAoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBTb3VyY2VPZmZzZXQuYnJva2VuKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgU291cmNlU3BhbmAgdGhhdCByZXByZXNlbnRzIGEgY29sbGFwc2VkIHJhbmdlIGF0IHRoaXMgc291cmNlIG9mZnNldC4gQXZvaWRcbiAgICogY29tcHV0aW5nIHRoZSBjaGFyYWN0ZXIgb2Zmc2V0IGlmIGl0IGhhcyBub3QgYWxyZWFkeSBiZWVuIGNvbXB1dGVkLlxuICAgKi9cbiAgY29sbGFwc2VkKCk6IFNvdXJjZVNwYW4ge1xuICAgIHJldHVybiBzcGFuKHRoaXMuZGF0YSwgdGhpcy5kYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHRoaXMgYFNvdXJjZU9mZnNldGAgaW50byBhIEhhbmRsZWJhcnMge0BzZWUgU291cmNlUG9zaXRpb259IGZvciBjb21wYXRpYmlsaXR5IHdpdGhcbiAgICogZXhpc3RpbmcgcGx1Z2lucy5cbiAgICovXG4gIHRvSlNPTigpOiBTb3VyY2VQb3NpdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS50b0pTT04oKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ2hhclBvc2l0aW9uIGltcGxlbWVudHMgUG9zaXRpb25EYXRhIHtcbiAgcmVhZG9ubHkga2luZCA9IE9mZnNldEtpbmQuQ2hhclBvc2l0aW9uO1xuXG4gIC8qKiBDb21wdXRlZCBmcm9tIGNoYXIgb2Zmc2V0ICovXG4gIF9sb2NQb3M6IEhic1Bvc2l0aW9uIHwgQlJPS0VOIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgc291cmNlOiBTb3VyY2UsIHJlYWRvbmx5IGNoYXJQb3M6IG51bWJlcikge31cblxuICAvKipcbiAgICogVGhpcyBpcyBhbHJlYWR5IGEgYENoYXJQb3NpdGlvbmAuXG4gICAqXG4gICAqIHtAc2VlIEhic1Bvc2l0aW9ufSBmb3IgdGhlIGFsdGVybmF0aXZlLlxuICAgKlxuICAgKiBAaW1wbGVtZW50cyB7UG9zaXRpb25EYXRhfVxuICAgKi9cbiAgdG9DaGFyUG9zKCk6IENoYXJQb3NpdGlvbiB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUHJvZHVjZSBhIEhhbmRsZWJhcnMge0BzZWUgU291cmNlUG9zaXRpb259IGZvciB0aGlzIGBDaGFyUG9zaXRpb25gLiBJZiB0aGlzIGBDaGFyUG9zaXRpb25gIHdhc1xuICAgKiBjb21wdXRlZCB1c2luZyB7QHNlZSBTb3VyY2VPZmZzZXQjbW92ZX0sIHRoaXMgd2lsbCBjb21wdXRlIHRoZSBgU291cmNlUG9zaXRpb25gIGZvciB0aGUgb2Zmc2V0LlxuICAgKlxuICAgKiBAaW1wbGVtZW50cyB7UG9zaXRpb25EYXRhfVxuICAgKi9cbiAgdG9KU09OKCk6IFNvdXJjZVBvc2l0aW9uIHtcbiAgICBsZXQgaGJzID0gdGhpcy50b0hic1BvcygpO1xuICAgIHJldHVybiBoYnMgPT09IG51bGwgPyBVTktOT1dOX1BPU0lUSU9OIDogaGJzLnRvSlNPTigpO1xuICB9XG5cbiAgd3JhcCgpOiBTb3VyY2VPZmZzZXQge1xuICAgIHJldHVybiBuZXcgU291cmNlT2Zmc2V0KHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgYENoYXJQb3NpdGlvbmAgYWx3YXlzIGhhcyBhbiBvZmZzZXQgaXQgY2FuIHByb2R1Y2Ugd2l0aG91dCBhbnkgYWRkaXRpb25hbCBjb21wdXRhdGlvbi5cbiAgICovXG4gIGdldCBvZmZzZXQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5jaGFyUG9zO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgdGhlIGN1cnJlbnQgY2hhcmFjdGVyIG9mZnNldCB0byBhbiBgSGJzUG9zaXRpb25gLCBpZiBpdCB3YXMgbm90IGFscmVhZHkgY29tcHV0ZWQuIE9uY2VcbiAgICogYSBgQ2hhclBvc2l0aW9uYCBoYXMgY29tcHV0ZWQgaXRzIGBIYnNQb3NpdGlvbmAsIGl0IHdpbGwgbm90IG5lZWQgdG8gZG8gY29tcHV0ZSBpdCBhZ2FpbiwgYW5kXG4gICAqIHRoZSBzYW1lIGBDaGFyUG9zaXRpb25gIGlzIHJldGFpbmVkIHdoZW4gdXNlZCBhcyBvbmUgb2YgdGhlIGVuZHMgb2YgYSBgU291cmNlU3BhbmAsIHNvXG4gICAqIGNvbXB1dGluZyB0aGUgYEhic1Bvc2l0aW9uYCBzaG91bGQgYmUgYSBvbmUtdGltZSBvcGVyYXRpb24uXG4gICAqL1xuICB0b0hic1BvcygpOiBIYnNQb3NpdGlvbiB8IG51bGwge1xuICAgIGxldCBsb2NQb3MgPSB0aGlzLl9sb2NQb3M7XG5cbiAgICBpZiAobG9jUG9zID09PSBudWxsKSB7XG4gICAgICBsZXQgaGJzUG9zID0gdGhpcy5zb3VyY2UuaGJzUG9zRm9yKHRoaXMuY2hhclBvcyk7XG5cbiAgICAgIGlmIChoYnNQb3MgPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fbG9jUG9zID0gbG9jUG9zID0gQlJPS0VOO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbG9jUG9zID0gbG9jUG9zID0gbmV3IEhic1Bvc2l0aW9uKHRoaXMuc291cmNlLCBoYnNQb3MsIHRoaXMuY2hhclBvcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxvY1BvcyA9PT0gQlJPS0VOID8gbnVsbCA6IGxvY1BvcztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSGJzUG9zaXRpb24gaW1wbGVtZW50cyBQb3NpdGlvbkRhdGEge1xuICByZWFkb25seSBraW5kID0gT2Zmc2V0S2luZC5IYnNQb3NpdGlvbjtcblxuICBfY2hhclBvczogQ2hhclBvc2l0aW9uIHwgQlJPS0VOIHwgbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBzb3VyY2U6IFNvdXJjZSxcbiAgICByZWFkb25seSBoYnNQb3M6IFNvdXJjZVBvc2l0aW9uLFxuICAgIGNoYXJQb3M6IG51bWJlciB8IG51bGwgPSBudWxsXG4gICkge1xuICAgIHRoaXMuX2NoYXJQb3MgPSBjaGFyUG9zID09PSBudWxsID8gbnVsbCA6IG5ldyBDaGFyUG9zaXRpb24oc291cmNlLCBjaGFyUG9zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMYXppbHkgY29tcHV0ZSB0aGUgY2hhcmFjdGVyIG9mZnNldCBmcm9tIHRoZSB7QHNlZSBTb3VyY2VQb3NpdGlvbn0uIE9uY2UgYW4gYEhic1Bvc2l0aW9uYCBoYXNcbiAgICogY29tcHV0ZWQgaXRzIGBDaGFyUG9zaXRpb25gLCBpdCB3aWxsIG5vdCBuZWVkIHRvIGRvIGNvbXB1dGUgaXQgYWdhaW4sIGFuZCB0aGUgc2FtZVxuICAgKiBgSGJzUG9zaXRpb25gIGlzIHJldGFpbmVkIHdoZW4gdXNlZCBhcyBvbmUgb2YgdGhlIGVuZHMgb2YgYSBgU291cmNlU3BhbmAsIHNvIGNvbXB1dGluZyB0aGVcbiAgICogYENoYXJQb3NpdGlvbmAgc2hvdWxkIGJlIGEgb25lLXRpbWUgb3BlcmF0aW9uLlxuICAgKlxuICAgKiBAaW1wbGVtZW50cyB7UG9zaXRpb25EYXRhfVxuICAgKi9cbiAgdG9DaGFyUG9zKCk6IENoYXJQb3NpdGlvbiB8IG51bGwge1xuICAgIGxldCBjaGFyUG9zID0gdGhpcy5fY2hhclBvcztcblxuICAgIGlmIChjaGFyUG9zID09PSBudWxsKSB7XG4gICAgICBsZXQgY2hhclBvc051bWJlciA9IHRoaXMuc291cmNlLmNoYXJQb3NGb3IodGhpcy5oYnNQb3MpO1xuXG4gICAgICBpZiAoY2hhclBvc051bWJlciA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9jaGFyUG9zID0gY2hhclBvcyA9IEJST0tFTjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2NoYXJQb3MgPSBjaGFyUG9zID0gbmV3IENoYXJQb3NpdGlvbih0aGlzLnNvdXJjZSwgY2hhclBvc051bWJlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYXJQb3MgPT09IEJST0tFTiA/IG51bGwgOiBjaGFyUG9zO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUge0BzZWUgU291cmNlUG9zaXRpb259IHRoYXQgdGhpcyBgSGJzUG9zaXRpb25gIHdhcyBpbnN0YW50aWF0ZWQgd2l0aC4gVGhpcyBvcGVyYXRpb25cbiAgICogZG9lcyBub3QgbmVlZCB0byBjb21wdXRlIGFueXRoaW5nLlxuICAgKlxuICAgKiBAaW1wbGVtZW50cyB7UG9zaXRpb25EYXRhfVxuICAgKi9cbiAgdG9KU09OKCk6IFNvdXJjZVBvc2l0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5oYnNQb3M7XG4gIH1cblxuICB3cmFwKCk6IFNvdXJjZU9mZnNldCB7XG4gICAgcmV0dXJuIG5ldyBTb3VyY2VPZmZzZXQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBpcyBhbHJlYWR5IGFuIGBIYnNQb3NpdGlvbmAuXG4gICAqXG4gICAqIHtAc2VlIENoYXJQb3NpdGlvbn0gZm9yIHRoZSBhbHRlcm5hdGl2ZS5cbiAgICovXG4gIHRvSGJzUG9zKCk6IEhic1Bvc2l0aW9uIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW52aXNpYmxlUG9zaXRpb24gaW1wbGVtZW50cyBQb3NpdGlvbkRhdGEge1xuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBraW5kOiBPZmZzZXRLaW5kLkJyb2tlbiB8IE9mZnNldEtpbmQuSW50ZXJuYWxzU3ludGhldGljIHwgT2Zmc2V0S2luZC5Ob25FeGlzdGVudCxcbiAgICAvLyB3aGF0ZXZlciB3YXMgcHJvdmlkZWQsIHBvc3NpYmx5IGJyb2tlblxuICAgIHJlYWRvbmx5IHBvczogU291cmNlUG9zaXRpb25cbiAgKSB7fVxuXG4gIC8qKlxuICAgKiBBIGJyb2tlbiBwb3NpdGlvbiBjYW5ub3QgYmUgdHVybmVkIGludG8gYSB7QHNlZSBDaGFyYWN0ZXJQb3NpdGlvbn0uXG4gICAqL1xuICB0b0NoYXJQb3MoKTogbnVsbCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNlcmlhbGl6YXRpb24gb2YgYW4gYEludmlzaWJsZVBvc2l0aW9uIGlzIHdoYXRldmVyIEhhbmRsZWJhcnMge0BzZWUgU291cmNlUG9zaXRpb259IHdhc1xuICAgKiBvcmlnaW5hbGx5IGlkZW50aWZpZWQgYXMgYnJva2VuLCBub24tZXhpc3RlbnQgb3Igc3ludGhldGljLlxuICAgKlxuICAgKiBJZiBhbiBgSW52aXNpYmxlUG9zaXRpb25gIG5ldmVyIGhhZCBhbiBzb3VyY2Ugb2Zmc2V0IGF0IGFsbCwgdGhpcyBtZXRob2QgcmV0dXJuc1xuICAgKiB7QHNlZSBVTktOT1dOX1BPU0lUSU9OfSBmb3IgY29tcGF0aWJpbGl0eS5cbiAgICovXG4gIHRvSlNPTigpOiBTb3VyY2VQb3NpdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMucG9zO1xuICB9XG5cbiAgd3JhcCgpOiBTb3VyY2VPZmZzZXQge1xuICAgIHJldHVybiBuZXcgU291cmNlT2Zmc2V0KHRoaXMpO1xuICB9XG5cbiAgZ2V0IG9mZnNldCgpOiBudWxsIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIENvbXBhcmUgdHdvIHtAc2VlIEFueVBvc2l0aW9ufSBhbmQgZGV0ZXJtaW5lIHdoZXRoZXIgdGhleSBhcmUgZXF1YWwuXG4gKlxuICogQHNlZSB7U291cmNlT2Zmc2V0I2VxbH1cbiAqL1xuY29uc3QgZXFsID0gbWF0Y2g8Ym9vbGVhbj4oKG0pID0+XG4gIG1cbiAgICAud2hlbihcbiAgICAgIE9mZnNldEtpbmQuSGJzUG9zaXRpb24sXG4gICAgICBPZmZzZXRLaW5kLkhic1Bvc2l0aW9uLFxuICAgICAgKHsgaGJzUG9zOiBsZWZ0IH0sIHsgaGJzUG9zOiByaWdodCB9KSA9PlxuICAgICAgICBsZWZ0LmNvbHVtbiA9PT0gcmlnaHQuY29sdW1uICYmIGxlZnQubGluZSA9PT0gcmlnaHQubGluZVxuICAgIClcbiAgICAud2hlbihcbiAgICAgIE9mZnNldEtpbmQuQ2hhclBvc2l0aW9uLFxuICAgICAgT2Zmc2V0S2luZC5DaGFyUG9zaXRpb24sXG4gICAgICAoeyBjaGFyUG9zOiBsZWZ0IH0sIHsgY2hhclBvczogcmlnaHQgfSkgPT4gbGVmdCA9PT0gcmlnaHRcbiAgICApXG4gICAgLndoZW4oXG4gICAgICBPZmZzZXRLaW5kLkNoYXJQb3NpdGlvbixcbiAgICAgIE9mZnNldEtpbmQuSGJzUG9zaXRpb24sXG4gICAgICAoeyBvZmZzZXQ6IGxlZnQgfSwgcmlnaHQpID0+IGxlZnQgPT09IHJpZ2h0LnRvQ2hhclBvcygpPy5vZmZzZXRcbiAgICApXG4gICAgLndoZW4oXG4gICAgICBPZmZzZXRLaW5kLkhic1Bvc2l0aW9uLFxuICAgICAgT2Zmc2V0S2luZC5DaGFyUG9zaXRpb24sXG4gICAgICAobGVmdCwgeyBvZmZzZXQ6IHJpZ2h0IH0pID0+IGxlZnQudG9DaGFyUG9zKCk/Lm9mZnNldCA9PT0gcmlnaHRcbiAgICApXG4gICAgLndoZW4oTWF0Y2hBbnksIE1hdGNoQW55LCAoKSA9PiBmYWxzZSlcbik7XG4iXSwic291cmNlUm9vdCI6IiJ9