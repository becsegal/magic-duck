"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.span = exports.HbsSpan = exports.SourceSpan = void 0;

var _env = require("@glimmer/env");

var _util = require("@glimmer/util");

var _location = require("../location");

var _slice = require("../slice");

var _match = require("./match");

var _offset = require("./offset");

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
 * A `SourceSpan` object represents a span of characters inside of a template source.
 *
 * There are three kinds of `SourceSpan` objects:
 *
 * - `ConcreteSourceSpan`, which contains byte offsets
 * - `LazySourceSpan`, which contains `SourceLocation`s from the Handlebars AST, which can be
 *   converted to byte offsets on demand.
 * - `InvisibleSourceSpan`, which represent source strings that aren't present in the source,
 *   because:
 *     - they were created synthetically
 *     - their location is nonsensical (the span is broken)
 *     - they represent nothing in the source (this currently happens only when a bug in the
 *       upstream Handlebars parser fails to assign a location to empty blocks)
 *
 * At a high level, all `SourceSpan` objects provide:
 *
 * - byte offsets
 * - source in column and line format
 *
 * And you can do these operations on `SourceSpan`s:
 *
 * - collapse it to a `SourceSpan` representing its starting or ending position
 * - slice out some characters, optionally skipping some characters at the beginning or end
 * - create a new `SourceSpan` with a different starting or ending offset
 *
 * All SourceSpan objects implement `SourceLocation`, for compatibility. All SourceSpan
 * objects have a `toJSON` that emits `SourceLocation`, also for compatibility.
 *
 * For compatibility, subclasses of `AbstractSourceSpan` must implement `locDidUpdate`, which
 * happens when an AST plugin attempts to modify the `start` or `end` of a span directly.
 *
 * The goal is to avoid creating any problems for use-cases like AST Explorer.
 */
var SourceSpan = /*#__PURE__*/function () {
  function SourceSpan(data) {
    this.data = data;
    this.isInvisible = data.kind !== "CharPosition"
    /* CharPosition */
    && data.kind !== "HbsPosition"
    /* HbsPosition */
    ;
  }

  SourceSpan.load = function load(source, serialized) {
    if (typeof serialized === 'number') {
      return SourceSpan.forCharPositions(source, serialized, serialized);
    } else if (typeof serialized === 'string') {
      return SourceSpan.synthetic(serialized);
    } else if (Array.isArray(serialized)) {
      return SourceSpan.forCharPositions(source, serialized[0], serialized[1]);
    } else if (serialized === "NonExistent"
    /* NonExistent */
    ) {
        return SourceSpan.NON_EXISTENT;
      } else if (serialized === "Broken"
    /* Broken */
    ) {
        return SourceSpan.broken(_location.BROKEN_LOCATION);
      }

    (0, _util.assertNever)(serialized);
  };

  SourceSpan.forHbsLoc = function forHbsLoc(source, loc) {
    var start = new _offset.HbsPosition(source, loc.start);
    var end = new _offset.HbsPosition(source, loc.end);
    return new HbsSpan(source, {
      start: start,
      end: end
    }, loc).wrap();
  };

  SourceSpan.forCharPositions = function forCharPositions(source, startPos, endPos) {
    var start = new _offset.CharPosition(source, startPos);
    var end = new _offset.CharPosition(source, endPos);
    return new CharPositionSpan(source, {
      start: start,
      end: end
    }).wrap();
  };

  SourceSpan.synthetic = function synthetic(chars) {
    return new InvisibleSpan("InternalsSynthetic"
    /* InternalsSynthetic */
    , _location.NON_EXISTENT_LOCATION, chars).wrap();
  };

  SourceSpan.broken = function broken(pos) {
    if (pos === void 0) {
      pos = _location.BROKEN_LOCATION;
    }

    return new InvisibleSpan("Broken"
    /* Broken */
    , pos).wrap();
  };

  var _proto = SourceSpan.prototype;

  _proto.getStart = function getStart() {
    return this.data.getStart().wrap();
  };

  _proto.getEnd = function getEnd() {
    return this.data.getEnd().wrap();
  };
  /**
   * Support converting ASTv1 nodes into a serialized format using JSON.stringify.
   */


  _proto.toJSON = function toJSON() {
    return this.loc;
  }
  /**
   * Create a new span with the current span's end and a new beginning.
   */
  ;

  _proto.withStart = function withStart(other) {
    return span(other.data, this.data.getEnd());
  }
  /**
   * Create a new span with the current span's beginning and a new ending.
   */
  ;

  _proto.withEnd = function withEnd(other) {
    return span(this.data.getStart(), other.data);
  };

  _proto.asString = function asString() {
    return this.data.asString();
  }
  /**
   * Convert this `SourceSpan` into a `SourceSlice`. In debug mode, this method optionally checks
   * that the byte offsets represented by this `SourceSpan` actually correspond to the expected
   * string.
   */
  ;

  _proto.toSlice = function toSlice(expected) {
    var chars = this.data.asString();

    if (_env.DEBUG) {
      if (expected !== undefined && chars !== expected) {
        // eslint-disable-next-line no-console
        console.warn("unexpectedly found " + JSON.stringify(chars) + " when slicing source, but expected " + JSON.stringify(expected));
      }
    }

    return new _slice.SourceSlice({
      loc: this,
      chars: expected || chars
    });
  }
  /**
   * For compatibility with SourceLocation in AST plugins
   *
   * @deprecated use startPosition instead
   */
  ;

  _proto.collapse = function collapse(where) {
    switch (where) {
      case 'start':
        return this.getStart().collapsed();

      case 'end':
        return this.getEnd().collapsed();
    }
  };

  _proto.extend = function extend(other) {
    return span(this.data.getStart(), other.data.getEnd());
  };

  _proto.serialize = function serialize() {
    return this.data.serialize();
  };

  _proto.slice = function slice(_ref) {
    var _ref$skipStart = _ref.skipStart,
        skipStart = _ref$skipStart === void 0 ? 0 : _ref$skipStart,
        _ref$skipEnd = _ref.skipEnd,
        skipEnd = _ref$skipEnd === void 0 ? 0 : _ref$skipEnd;
    return span(this.getStart().move(skipStart).data, this.getEnd().move(-skipEnd).data);
  };

  _proto.sliceStartChars = function sliceStartChars(_ref2) {
    var _ref2$skipStart = _ref2.skipStart,
        skipStart = _ref2$skipStart === void 0 ? 0 : _ref2$skipStart,
        chars = _ref2.chars;
    return span(this.getStart().move(skipStart).data, this.getStart().move(skipStart + chars).data);
  };

  _proto.sliceEndChars = function sliceEndChars(_ref3) {
    var _ref3$skipEnd = _ref3.skipEnd,
        skipEnd = _ref3$skipEnd === void 0 ? 0 : _ref3$skipEnd,
        chars = _ref3.chars;
    return span(this.getEnd().move(skipEnd - chars).data, this.getStart().move(-skipEnd).data);
  };

  _createClass(SourceSpan, [{
    key: "loc",
    get: function get() {
      var span = this.data.toHbsSpan();
      return span === null ? _location.BROKEN_LOCATION : span.toHbsLoc();
    }
  }, {
    key: "module",
    get: function get() {
      return this.data.getModule();
    }
    /**
     * Get the starting `SourcePosition` for this `SourceSpan`, lazily computing it if needed.
     */

  }, {
    key: "startPosition",
    get: function get() {
      return this.loc.start;
    }
    /**
     * Get the ending `SourcePosition` for this `SourceSpan`, lazily computing it if needed.
     */

  }, {
    key: "endPosition",
    get: function get() {
      return this.loc.end;
    }
  }, {
    key: "start",
    get: function get() {
      return this.loc.start;
    }
    /**
     * For compatibility with SourceLocation in AST plugins
     *
     * @deprecated use withStart instead
     */
    ,
    set: function set(position) {
      this.data.locDidUpdate({
        start: position
      });
    }
    /**
     * For compatibility with SourceLocation in AST plugins
     *
     * @deprecated use endPosition instead
     */

  }, {
    key: "end",
    get: function get() {
      return this.loc.end;
    }
    /**
     * For compatibility with SourceLocation in AST plugins
     *
     * @deprecated use withEnd instead
     */
    ,
    set: function set(position) {
      this.data.locDidUpdate({
        end: position
      });
    }
    /**
     * For compatibility with SourceLocation in AST plugins
     *
     * @deprecated use module instead
     */

  }, {
    key: "source",
    get: function get() {
      return this.module;
    }
  }], [{
    key: "NON_EXISTENT",
    get: function get() {
      return new InvisibleSpan("NonExistent"
      /* NonExistent */
      , _location.NON_EXISTENT_LOCATION).wrap();
    }
  }]);

  return SourceSpan;
}();

exports.SourceSpan = SourceSpan;

var CharPositionSpan = /*#__PURE__*/function () {
  function CharPositionSpan(source, charPositions) {
    this.source = source;
    this.charPositions = charPositions;
    this.kind = "CharPosition"
    /* CharPosition */
    ;
    this._locPosSpan = null;
  }

  var _proto2 = CharPositionSpan.prototype;

  _proto2.wrap = function wrap() {
    return new SourceSpan(this);
  };

  _proto2.asString = function asString() {
    return this.source.slice(this.charPositions.start.charPos, this.charPositions.end.charPos);
  };

  _proto2.getModule = function getModule() {
    return this.source.module;
  };

  _proto2.getStart = function getStart() {
    return this.charPositions.start;
  };

  _proto2.getEnd = function getEnd() {
    return this.charPositions.end;
  };

  _proto2.locDidUpdate = function locDidUpdate() {
    if (false
    /* LOCAL_DEBUG */
    ) {
        // eslint-disable-next-line no-console
        console.warn("updating a location that came from a CharPosition span doesn't work reliably. Don't try to update locations after the plugin phase");
      }
  };

  _proto2.toHbsSpan = function toHbsSpan() {
    var locPosSpan = this._locPosSpan;

    if (locPosSpan === null) {
      var start = this.charPositions.start.toHbsPos();
      var end = this.charPositions.end.toHbsPos();

      if (start === null || end === null) {
        locPosSpan = this._locPosSpan = _offset.BROKEN;
      } else {
        locPosSpan = this._locPosSpan = new HbsSpan(this.source, {
          start: start,
          end: end
        });
      }
    }

    return locPosSpan === _offset.BROKEN ? null : locPosSpan;
  };

  _proto2.serialize = function serialize() {
    var _this$charPositions = this.charPositions,
        start = _this$charPositions.start.charPos,
        end = _this$charPositions.end.charPos;

    if (start === end) {
      return start;
    } else {
      return [start, end];
    }
  };

  _proto2.toCharPosSpan = function toCharPosSpan() {
    return this;
  };

  return CharPositionSpan;
}();

var HbsSpan = /*#__PURE__*/function () {
  function HbsSpan(source, hbsPositions, providedHbsLoc) {
    if (providedHbsLoc === void 0) {
      providedHbsLoc = null;
    }

    this.source = source;
    this.hbsPositions = hbsPositions;
    this.kind = "HbsPosition"
    /* HbsPosition */
    ;
    this._charPosSpan = null;
    this._providedHbsLoc = providedHbsLoc;
  }

  var _proto3 = HbsSpan.prototype;

  _proto3.serialize = function serialize() {
    var charPos = this.toCharPosSpan();
    return charPos === null ? "Broken"
    /* Broken */
    : charPos.wrap().serialize();
  };

  _proto3.wrap = function wrap() {
    return new SourceSpan(this);
  };

  _proto3.updateProvided = function updateProvided(pos, edge) {
    if (this._providedHbsLoc) {
      this._providedHbsLoc[edge] = pos;
    } // invalidate computed character offsets


    this._charPosSpan = null;
    this._providedHbsLoc = {
      start: pos,
      end: pos
    };
  };

  _proto3.locDidUpdate = function locDidUpdate(_ref4) {
    var start = _ref4.start,
        end = _ref4.end;

    if (start !== undefined) {
      this.updateProvided(start, 'start');
      this.hbsPositions.start = new _offset.HbsPosition(this.source, start, null);
    }

    if (end !== undefined) {
      this.updateProvided(end, 'end');
      this.hbsPositions.end = new _offset.HbsPosition(this.source, end, null);
    }
  };

  _proto3.asString = function asString() {
    var span = this.toCharPosSpan();
    return span === null ? '' : span.asString();
  };

  _proto3.getModule = function getModule() {
    return this.source.module;
  };

  _proto3.getStart = function getStart() {
    return this.hbsPositions.start;
  };

  _proto3.getEnd = function getEnd() {
    return this.hbsPositions.end;
  };

  _proto3.toHbsLoc = function toHbsLoc() {
    return {
      start: this.hbsPositions.start.hbsPos,
      end: this.hbsPositions.end.hbsPos
    };
  };

  _proto3.toHbsSpan = function toHbsSpan() {
    return this;
  };

  _proto3.toCharPosSpan = function toCharPosSpan() {
    var charPosSpan = this._charPosSpan;

    if (charPosSpan === null) {
      var start = this.hbsPositions.start.toCharPos();
      var end = this.hbsPositions.end.toCharPos();

      if (start && end) {
        charPosSpan = this._charPosSpan = new CharPositionSpan(this.source, {
          start: start,
          end: end
        });
      } else {
        charPosSpan = this._charPosSpan = _offset.BROKEN;
        return null;
      }
    }

    return charPosSpan === _offset.BROKEN ? null : charPosSpan;
  };

  return HbsSpan;
}();

exports.HbsSpan = HbsSpan;

var InvisibleSpan = /*#__PURE__*/function () {
  function InvisibleSpan(kind, // whatever was provided, possibly broken
  loc, // if the span represents a synthetic string
  string) {
    if (string === void 0) {
      string = null;
    }

    this.kind = kind;
    this.loc = loc;
    this.string = string;
  }

  var _proto4 = InvisibleSpan.prototype;

  _proto4.serialize = function serialize() {
    switch (this.kind) {
      case "Broken"
      /* Broken */
      :
      case "NonExistent"
      /* NonExistent */
      :
        return this.kind;

      case "InternalsSynthetic"
      /* InternalsSynthetic */
      :
        return this.string || '';
    }
  };

  _proto4.wrap = function wrap() {
    return new SourceSpan(this);
  };

  _proto4.asString = function asString() {
    return this.string || '';
  };

  _proto4.locDidUpdate = function locDidUpdate(_ref5) {
    var start = _ref5.start,
        end = _ref5.end;

    if (start !== undefined) {
      this.loc.start = start;
    }

    if (end !== undefined) {
      this.loc.end = end;
    }
  };

  _proto4.getModule = function getModule() {
    // TODO: Make this reflect the actual module this span originated from
    return 'an unknown module';
  };

  _proto4.getStart = function getStart() {
    return new _offset.InvisiblePosition(this.kind, this.loc.start);
  };

  _proto4.getEnd = function getEnd() {
    return new _offset.InvisiblePosition(this.kind, this.loc.end);
  };

  _proto4.toCharPosSpan = function toCharPosSpan() {
    return this;
  };

  _proto4.toHbsSpan = function toHbsSpan() {
    return null;
  };

  _proto4.toHbsLoc = function toHbsLoc() {
    return _location.BROKEN_LOCATION;
  };

  return InvisibleSpan;
}();

var span = (0, _match.match)(function (m) {
  return m.when("HbsPosition"
  /* HbsPosition */
  , "HbsPosition"
  /* HbsPosition */
  , function (left, right) {
    return new HbsSpan(left.source, {
      start: left,
      end: right
    }).wrap();
  }).when("CharPosition"
  /* CharPosition */
  , "CharPosition"
  /* CharPosition */
  , function (left, right) {
    return new CharPositionSpan(left.source, {
      start: left,
      end: right
    }).wrap();
  }).when("CharPosition"
  /* CharPosition */
  , "HbsPosition"
  /* HbsPosition */
  , function (left, right) {
    var rightCharPos = right.toCharPos();

    if (rightCharPos === null) {
      return new InvisibleSpan("Broken"
      /* Broken */
      , _location.BROKEN_LOCATION).wrap();
    } else {
      return span(left, rightCharPos);
    }
  }).when("HbsPosition"
  /* HbsPosition */
  , "CharPosition"
  /* CharPosition */
  , function (left, right) {
    var leftCharPos = left.toCharPos();

    if (leftCharPos === null) {
      return new InvisibleSpan("Broken"
      /* Broken */
      , _location.BROKEN_LOCATION).wrap();
    } else {
      return span(leftCharPos, right);
    }
  }).when(_match.IsInvisible, _match.MatchAny, function (left) {
    return new InvisibleSpan(left.kind, _location.BROKEN_LOCATION).wrap();
  }).when(_match.MatchAny, _match.IsInvisible, function (_, right) {
    return new InvisibleSpan(right.kind, _location.BROKEN_LOCATION).wrap();
  });
});
exports.span = span;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvc291cmNlL2xvYy9zcGFuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFFQTs7QUFFQTs7QUFNQTs7QUFFQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztFQWRBOzs7QUF1RUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQ0EsSUFBTSxVQUFOLEdBQUEsYUFBQSxZQUFBO0FBNENFLFdBQUEsVUFBQSxDQUFBLElBQUEsRUFBNEM7QUFBeEIsU0FBQSxJQUFBLEdBQUEsSUFBQTtBQUNsQixTQUFBLFdBQUEsR0FDRSxJQUFJLENBQUosSUFBQSxLQUFTO0FBQUE7QUFBVCxPQUF5QyxJQUFJLENBQUosSUFBQSxLQUFTO0FBQUE7QUFEcEQ7QUFFRDs7QUEvQ0gsRUFBQSxVQUFBLENBQUEsSUFBQSxHQUtFLFNBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxVQUFBLEVBQTREO0FBQzFELFFBQUksT0FBQSxVQUFBLEtBQUosUUFBQSxFQUFvQztBQUNsQyxhQUFPLFVBQVUsQ0FBVixnQkFBQSxDQUFBLE1BQUEsRUFBQSxVQUFBLEVBQVAsVUFBTyxDQUFQO0FBREYsS0FBQSxNQUVPLElBQUksT0FBQSxVQUFBLEtBQUosUUFBQSxFQUFvQztBQUN6QyxhQUFPLFVBQVUsQ0FBVixTQUFBLENBQVAsVUFBTyxDQUFQO0FBREssS0FBQSxNQUVBLElBQUksS0FBSyxDQUFMLE9BQUEsQ0FBSixVQUFJLENBQUosRUFBK0I7QUFDcEMsYUFBTyxVQUFVLENBQVYsZ0JBQUEsQ0FBQSxNQUFBLEVBQW9DLFVBQVUsQ0FBOUMsQ0FBOEMsQ0FBOUMsRUFBbUQsVUFBVSxDQUFwRSxDQUFvRSxDQUE3RCxDQUFQO0FBREssS0FBQSxNQUVBLElBQUksVUFBVSxLQUFBO0FBQUE7QUFBZCxNQUEyQztBQUNoRCxlQUFPLFVBQVUsQ0FBakIsWUFBQTtBQURLLE9BQUEsTUFFQSxJ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b250ZW50IjpbIi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXNcbmltcG9ydCB7IERFQlVHIH0gZnJvbSAnQGdsaW1tZXIvZW52JztcbmltcG9ydCB7IExPQ0FMX0RFQlVHIH0gZnJvbSAnQGdsaW1tZXIvbG9jYWwtZGVidWctZmxhZ3MnO1xuaW1wb3J0IHsgYXNzZXJ0TmV2ZXIgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcblxuaW1wb3J0IHtcbiAgQlJPS0VOX0xPQ0FUSU9OLFxuICBOT05fRVhJU1RFTlRfTE9DQVRJT04sXG4gIFNvdXJjZUxvY2F0aW9uLFxuICBTb3VyY2VQb3NpdGlvbixcbn0gZnJvbSAnLi4vbG9jYXRpb24nO1xuaW1wb3J0IHsgU291cmNlU2xpY2UgfSBmcm9tICcuLi9zbGljZSc7XG5pbXBvcnQgeyBTb3VyY2UgfSBmcm9tICcuLi9zb3VyY2UnO1xuaW1wb3J0IHsgSXNJbnZpc2libGUsIG1hdGNoLCBNYXRjaEFueSwgTWF0Y2hGbiB9IGZyb20gJy4vbWF0Y2gnO1xuaW1wb3J0IHtcbiAgQW55UG9zaXRpb24sXG4gIEJST0tFTixcbiAgQ2hhclBvc2l0aW9uLFxuICBIYnNQb3NpdGlvbixcbiAgSW52aXNpYmxlUG9zaXRpb24sXG4gIE9mZnNldEtpbmQsXG4gIFNvdXJjZU9mZnNldCxcbn0gZnJvbSAnLi9vZmZzZXQnO1xuXG4vKipcbiAqIEFsbCBzcGFucyBoYXZlIHRoZXNlIGRldGFpbHMgaW4gY29tbW9uLlxuICovXG5pbnRlcmZhY2UgU3BhbkRhdGEge1xuICByZWFkb25seSBraW5kOiBPZmZzZXRLaW5kO1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHRoaXMgc3BhbiBpbnRvIGEgc3RyaW5nLiBJZiB0aGUgc3BhbiBpcyBicm9rZW4sIHJldHVybiBgJydgLlxuICAgKi9cbiAgYXNTdHJpbmcoKTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtb2R1bGUgdGhlIHNwYW4gd2FzIGxvY2F0ZWQgaW4uXG4gICAqL1xuICBnZXRNb2R1bGUoKTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHN0YXJ0aW5nIHBvc2l0aW9uIGZvciB0aGlzIHNwYW4uIFRyeSB0byBhdm9pZCBjcmVhdGluZyBuZXcgcG9zaXRpb24gb2JqZWN0cywgYXMgdGhleVxuICAgKiBjYWNoZSBjb21wdXRhdGlvbnMuXG4gICAqL1xuICBnZXRTdGFydCgpOiBBbnlQb3NpdGlvbjtcblxuICAvKipcbiAgICogR2V0IHRoZSBlbmRpbmcgcG9zaXRpb24gZm9yIHRoaXMgc3Bhbi4gVHJ5IHRvIGF2b2lkIGNyZWF0aW5nIG5ldyBwb3NpdGlvbiBvYmplY3RzLCBhcyB0aGV5XG4gICAqIGNhY2hlIGNvbXB1dGF0aW9ucy5cbiAgICovXG4gIGdldEVuZCgpOiBBbnlQb3NpdGlvbjtcblxuICAvKipcbiAgICogQ29tcHV0ZSB0aGUgYFNvdXJjZUxvY2F0aW9uYCBmb3IgdGhpcyBzcGFuLCByZXR1cm5lZCBhcyBhbiBpbnN0YW5jZSBvZiBgSGJzU3BhbmAuXG4gICAqL1xuICB0b0hic1NwYW4oKTogSGJzU3BhbiB8IG51bGw7XG5cbiAgLyoqXG4gICAqIEZvciBjb21wYXRpYmlsaXR5LCB3aGVuZXZlciB0aGUgYHN0YXJ0YCBvciBgZW5kYCBvZiBhIHtAc2VlIFNvdXJjZU9mZnNldH0gY2hhbmdlcywgc3BhbnMgYXJlXG4gICAqIG5vdGlmaWVkIG9mIHRoZSBjaGFuZ2Ugc28gdGhleSBjYW4gdXBkYXRlIHRoZW1zZWx2ZXMuIFRoaXMgc2hvdWxkbid0IGhhcHBlbiBvdXRzaWRlIG9mIEFTVFxuICAgKiBwbHVnaW5zLlxuICAgKi9cbiAgbG9jRGlkVXBkYXRlKGNoYW5nZXM6IHsgc3RhcnQ/OiBTb3VyY2VQb3NpdGlvbjsgZW5kPzogU291cmNlUG9zaXRpb24gfSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZSBpbnRvIGEge0BzZWUgU2VyaWFsaXplZFNvdXJjZVNwYW59LCB3aGljaCBpcyBjb21wYWN0IGFuZCBkZXNpZ25lZCBmb3IgcmVhZGFiaWxpdHkgaW5cbiAgICogY29udGV4dCBsaWtlIEFTVCBFeHBsb3Jlci4gSWYgeW91IG5lZWQgYSB7QHNlZSBTb3VyY2VMb2NhdGlvbn0sIHVzZSB7QHNlZSB0b0pTT059LlxuICAgKi9cbiAgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRTb3VyY2VTcGFuO1xufVxuXG4vKipcbiAqIEEgYFNvdXJjZVNwYW5gIG9iamVjdCByZXByZXNlbnRzIGEgc3BhbiBvZiBjaGFyYWN0ZXJzIGluc2lkZSBvZiBhIHRlbXBsYXRlIHNvdXJjZS5cbiAqXG4gKiBUaGVyZSBhcmUgdGhyZWUga2luZHMgb2YgYFNvdXJjZVNwYW5gIG9iamVjdHM6XG4gKlxuICogLSBgQ29uY3JldGVTb3VyY2VTcGFuYCwgd2hpY2ggY29udGFpbnMgYnl0ZSBvZmZzZXRzXG4gKiAtIGBMYXp5U291cmNlU3BhbmAsIHdoaWNoIGNvbnRhaW5zIGBTb3VyY2VMb2NhdGlvbmBzIGZyb20gdGhlIEhhbmRsZWJhcnMgQVNULCB3aGljaCBjYW4gYmVcbiAqICAgY29udmVydGVkIHRvIGJ5dGUgb2Zmc2V0cyBvbiBkZW1hbmQuXG4gKiAtIGBJbnZpc2libGVTb3VyY2VTcGFuYCwgd2hpY2ggcmVwcmVzZW50IHNvdXJjZSBzdHJpbmdzIHRoYXQgYXJlbid0IHByZXNlbnQgaW4gdGhlIHNvdXJjZSxcbiAqICAgYmVjYXVzZTpcbiAqICAgICAtIHRoZXkgd2VyZSBjcmVhdGVkIHN5bnRoZXRpY2FsbHlcbiAqICAgICAtIHRoZWlyIGxvY2F0aW9uIGlzIG5vbnNlbnNpY2FsICh0aGUgc3BhbiBpcyBicm9rZW4pXG4gKiAgICAgLSB0aGV5IHJlcHJlc2VudCBub3RoaW5nIGluIHRoZSBzb3VyY2UgKHRoaXMgY3VycmVudGx5IGhhcHBlbnMgb25seSB3aGVuIGEgYnVnIGluIHRoZVxuICogICAgICAgdXBzdHJlYW0gSGFuZGxlYmFycyBwYXJzZXIgZmFpbHMgdG8gYXNzaWduIGEgbG9jYXRpb24gdG8gZW1wdHkgYmxvY2tzKVxuICpcbiAqIEF0IGEgaGlnaCBsZXZlbCwgYWxsIGBTb3VyY2VTcGFuYCBvYmplY3RzIHByb3ZpZGU6XG4gKlxuICogLSBieXRlIG9mZnNldHNcbiAqIC0gc291cmNlIGluIGNvbHVtbiBhbmQgbGluZSBmb3JtYXRcbiAqXG4gKiBBbmQgeW91IGNhbiBkbyB0aGVzZSBvcGVyYXRpb25zIG9uIGBTb3VyY2VTcGFuYHM6XG4gKlxuICogLSBjb2xsYXBzZSBpdCB0byBhIGBTb3VyY2VTcGFuYCByZXByZXNlbnRpbmcgaXRzIHN0YXJ0aW5nIG9yIGVuZGluZyBwb3NpdGlvblxuICogLSBzbGljZSBvdXQgc29tZSBjaGFyYWN0ZXJzLCBvcHRpb25hbGx5IHNraXBwaW5nIHNvbWUgY2hhcmFjdGVycyBhdCB0aGUgYmVnaW5uaW5nIG9yIGVuZFxuICogLSBjcmVhdGUgYSBuZXcgYFNvdXJjZVNwYW5gIHdpdGggYSBkaWZmZXJlbnQgc3RhcnRpbmcgb3IgZW5kaW5nIG9mZnNldFxuICpcbiAqIEFsbCBTb3VyY2VTcGFuIG9iamVjdHMgaW1wbGVtZW50IGBTb3VyY2VMb2NhdGlvbmAsIGZvciBjb21wYXRpYmlsaXR5LiBBbGwgU291cmNlU3BhblxuICogb2JqZWN0cyBoYXZlIGEgYHRvSlNPTmAgdGhhdCBlbWl0cyBgU291cmNlTG9jYXRpb25gLCBhbHNvIGZvciBjb21wYXRpYmlsaXR5LlxuICpcbiAqIEZvciBjb21wYXRpYmlsaXR5LCBzdWJjbGFzc2VzIG9mIGBBYnN0cmFjdFNvdXJjZVNwYW5gIG11c3QgaW1wbGVtZW50IGBsb2NEaWRVcGRhdGVgLCB3aGljaFxuICogaGFwcGVucyB3aGVuIGFuIEFTVCBwbHVnaW4gYXR0ZW1wdHMgdG8gbW9kaWZ5IHRoZSBgc3RhcnRgIG9yIGBlbmRgIG9mIGEgc3BhbiBkaXJlY3RseS5cbiAqXG4gKiBUaGUgZ29hbCBpcyB0byBhdm9pZCBjcmVhdGluZyBhbnkgcHJvYmxlbXMgZm9yIHVzZS1jYXNlcyBsaWtlIEFTVCBFeHBsb3Jlci5cbiAqL1xuZXhwb3J0IGNsYXNzIFNvdXJjZVNwYW4gaW1wbGVtZW50cyBTb3VyY2VMb2NhdGlvbiB7XG4gIHN0YXRpYyBnZXQgTk9OX0VYSVNURU5UKCk6IFNvdXJjZVNwYW4ge1xuICAgIHJldHVybiBuZXcgSW52aXNpYmxlU3BhbihPZmZzZXRLaW5kLk5vbkV4aXN0ZW50LCBOT05fRVhJU1RFTlRfTE9DQVRJT04pLndyYXAoKTtcbiAgfVxuXG4gIHN0YXRpYyBsb2FkKHNvdXJjZTogU291cmNlLCBzZXJpYWxpemVkOiBTZXJpYWxpemVkU291cmNlU3Bhbik6IFNvdXJjZVNwYW4ge1xuICAgIGlmICh0eXBlb2Ygc2VyaWFsaXplZCA9PT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiBTb3VyY2VTcGFuLmZvckNoYXJQb3NpdGlvbnMoc291cmNlLCBzZXJpYWxpemVkLCBzZXJpYWxpemVkKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXJpYWxpemVkID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIFNvdXJjZVNwYW4uc3ludGhldGljKHNlcmlhbGl6ZWQpO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShzZXJpYWxpemVkKSkge1xuICAgICAgcmV0dXJuIFNvdXJjZVNwYW4uZm9yQ2hhclBvc2l0aW9ucyhzb3VyY2UsIHNlcmlhbGl6ZWRbMF0sIHNlcmlhbGl6ZWRbMV0pO1xuICAgIH0gZWxzZSBpZiAoc2VyaWFsaXplZCA9PT0gT2Zmc2V0S2luZC5Ob25FeGlzdGVudCkge1xuICAgICAgcmV0dXJuIFNvdXJjZVNwYW4uTk9OX0VYSVNURU5UO1xuICAgIH0gZWxzZSBpZiAoc2VyaWFsaXplZCA9PT0gT2Zmc2V0S2luZC5Ccm9rZW4pIHtcbiAgICAgIHJldHVybiBTb3VyY2VTcGFuLmJyb2tlbihCUk9LRU5fTE9DQVRJT04pO1xuICAgIH1cblxuICAgIGFzc2VydE5ldmVyKHNlcmlhbGl6ZWQpO1xuICB9XG5cbiAgc3RhdGljIGZvckhic0xvYyhzb3VyY2U6IFNvdXJjZSwgbG9jOiBTb3VyY2VMb2NhdGlvbik6IFNvdXJjZVNwYW4ge1xuICAgIGxldCBzdGFydCA9IG5ldyBIYnNQb3NpdGlvbihzb3VyY2UsIGxvYy5zdGFydCk7XG4gICAgbGV0IGVuZCA9IG5ldyBIYnNQb3NpdGlvbihzb3VyY2UsIGxvYy5lbmQpO1xuICAgIHJldHVybiBuZXcgSGJzU3Bhbihzb3VyY2UsIHsgc3RhcnQsIGVuZCB9LCBsb2MpLndyYXAoKTtcbiAgfVxuXG4gIHN0YXRpYyBmb3JDaGFyUG9zaXRpb25zKHNvdXJjZTogU291cmNlLCBzdGFydFBvczogbnVtYmVyLCBlbmRQb3M6IG51bWJlcik6IFNvdXJjZVNwYW4ge1xuICAgIGxldCBzdGFydCA9IG5ldyBDaGFyUG9zaXRpb24oc291cmNlLCBzdGFydFBvcyk7XG4gICAgbGV0IGVuZCA9IG5ldyBDaGFyUG9zaXRpb24oc291cmNlLCBlbmRQb3MpO1xuXG4gICAgcmV0dXJuIG5ldyBDaGFyUG9zaXRpb25TcGFuKHNvdXJjZSwgeyBzdGFydCwgZW5kIH0pLndyYXAoKTtcbiAgfVxuXG4gIHN0YXRpYyBzeW50aGV0aWMoY2hhcnM6IHN0cmluZyk6IFNvdXJjZVNwYW4ge1xuICAgIHJldHVybiBuZXcgSW52aXNpYmxlU3BhbihPZmZzZXRLaW5kLkludGVybmFsc1N5bnRoZXRpYywgTk9OX0VYSVNURU5UX0xPQ0FUSU9OLCBjaGFycykud3JhcCgpO1xuICB9XG5cbiAgc3RhdGljIGJyb2tlbihwb3M6IFNvdXJjZUxvY2F0aW9uID0gQlJPS0VOX0xPQ0FUSU9OKTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIG5ldyBJbnZpc2libGVTcGFuKE9mZnNldEtpbmQuQnJva2VuLCBwb3MpLndyYXAoKTtcbiAgfVxuXG4gIHJlYWRvbmx5IGlzSW52aXNpYmxlOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZGF0YTogU3BhbkRhdGEgJiBBbnlTcGFuKSB7XG4gICAgdGhpcy5pc0ludmlzaWJsZSA9XG4gICAgICBkYXRhLmtpbmQgIT09IE9mZnNldEtpbmQuQ2hhclBvc2l0aW9uICYmIGRhdGEua2luZCAhPT0gT2Zmc2V0S2luZC5IYnNQb3NpdGlvbjtcbiAgfVxuXG4gIGdldFN0YXJ0KCk6IFNvdXJjZU9mZnNldCB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5nZXRTdGFydCgpLndyYXAoKTtcbiAgfVxuXG4gIGdldEVuZCgpOiBTb3VyY2VPZmZzZXQge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZ2V0RW5kKCkud3JhcCgpO1xuICB9XG5cbiAgZ2V0IGxvYygpOiBTb3VyY2VMb2NhdGlvbiB7XG4gICAgbGV0IHNwYW4gPSB0aGlzLmRhdGEudG9IYnNTcGFuKCk7XG4gICAgcmV0dXJuIHNwYW4gPT09IG51bGwgPyBCUk9LRU5fTE9DQVRJT04gOiBzcGFuLnRvSGJzTG9jKCk7XG4gIH1cblxuICBnZXQgbW9kdWxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5nZXRNb2R1bGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHN0YXJ0aW5nIGBTb3VyY2VQb3NpdGlvbmAgZm9yIHRoaXMgYFNvdXJjZVNwYW5gLCBsYXppbHkgY29tcHV0aW5nIGl0IGlmIG5lZWRlZC5cbiAgICovXG4gIGdldCBzdGFydFBvc2l0aW9uKCk6IFNvdXJjZVBvc2l0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5sb2Muc3RhcnQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBlbmRpbmcgYFNvdXJjZVBvc2l0aW9uYCBmb3IgdGhpcyBgU291cmNlU3BhbmAsIGxhemlseSBjb21wdXRpbmcgaXQgaWYgbmVlZGVkLlxuICAgKi9cbiAgZ2V0IGVuZFBvc2l0aW9uKCk6IFNvdXJjZVBvc2l0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5sb2MuZW5kO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1cHBvcnQgY29udmVydGluZyBBU1R2MSBub2RlcyBpbnRvIGEgc2VyaWFsaXplZCBmb3JtYXQgdXNpbmcgSlNPTi5zdHJpbmdpZnkuXG4gICAqL1xuICB0b0pTT04oKTogU291cmNlTG9jYXRpb24ge1xuICAgIHJldHVybiB0aGlzLmxvYztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgc3BhbiB3aXRoIHRoZSBjdXJyZW50IHNwYW4ncyBlbmQgYW5kIGEgbmV3IGJlZ2lubmluZy5cbiAgICovXG4gIHdpdGhTdGFydChvdGhlcjogU291cmNlT2Zmc2V0KTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIHNwYW4ob3RoZXIuZGF0YSwgdGhpcy5kYXRhLmdldEVuZCgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgc3BhbiB3aXRoIHRoZSBjdXJyZW50IHNwYW4ncyBiZWdpbm5pbmcgYW5kIGEgbmV3IGVuZGluZy5cbiAgICovXG4gIHdpdGhFbmQodGhpczogU291cmNlU3Bhbiwgb3RoZXI6IFNvdXJjZU9mZnNldCk6IFNvdXJjZVNwYW4ge1xuICAgIHJldHVybiBzcGFuKHRoaXMuZGF0YS5nZXRTdGFydCgpLCBvdGhlci5kYXRhKTtcbiAgfVxuXG4gIGFzU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5hc1N0cmluZygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgdGhpcyBgU291cmNlU3BhbmAgaW50byBhIGBTb3VyY2VTbGljZWAuIEluIGRlYnVnIG1vZGUsIHRoaXMgbWV0aG9kIG9wdGlvbmFsbHkgY2hlY2tzXG4gICAqIHRoYXQgdGhlIGJ5dGUgb2Zmc2V0cyByZXByZXNlbnRlZCBieSB0aGlzIGBTb3VyY2VTcGFuYCBhY3R1YWxseSBjb3JyZXNwb25kIHRvIHRoZSBleHBlY3RlZFxuICAgKiBzdHJpbmcuXG4gICAqL1xuICB0b1NsaWNlKGV4cGVjdGVkPzogc3RyaW5nKTogU291cmNlU2xpY2Uge1xuICAgIGxldCBjaGFycyA9IHRoaXMuZGF0YS5hc1N0cmluZygpO1xuXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBpZiAoZXhwZWN0ZWQgIT09IHVuZGVmaW5lZCAmJiBjaGFycyAhPT0gZXhwZWN0ZWQpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGB1bmV4cGVjdGVkbHkgZm91bmQgJHtKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgIGNoYXJzXG4gICAgICAgICAgKX0gd2hlbiBzbGljaW5nIHNvdXJjZSwgYnV0IGV4cGVjdGVkICR7SlNPTi5zdHJpbmdpZnkoZXhwZWN0ZWQpfWBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFNvdXJjZVNsaWNlKHtcbiAgICAgIGxvYzogdGhpcyxcbiAgICAgIGNoYXJzOiBleHBlY3RlZCB8fCBjaGFycyxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgY29tcGF0aWJpbGl0eSB3aXRoIFNvdXJjZUxvY2F0aW9uIGluIEFTVCBwbHVnaW5zXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIHVzZSBzdGFydFBvc2l0aW9uIGluc3RlYWRcbiAgICovXG4gIGdldCBzdGFydCgpOiBTb3VyY2VQb3NpdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMubG9jLnN0YXJ0O1xuICB9XG5cbiAgLyoqXG4gICAqIEZvciBjb21wYXRpYmlsaXR5IHdpdGggU291cmNlTG9jYXRpb24gaW4gQVNUIHBsdWdpbnNcbiAgICpcbiAgICogQGRlcHJlY2F0ZWQgdXNlIHdpdGhTdGFydCBpbnN0ZWFkXG4gICAqL1xuICBzZXQgc3RhcnQocG9zaXRpb246IFNvdXJjZVBvc2l0aW9uKSB7XG4gICAgdGhpcy5kYXRhLmxvY0RpZFVwZGF0ZSh7IHN0YXJ0OiBwb3NpdGlvbiB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgY29tcGF0aWJpbGl0eSB3aXRoIFNvdXJjZUxvY2F0aW9uIGluIEFTVCBwbHVnaW5zXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIHVzZSBlbmRQb3NpdGlvbiBpbnN0ZWFkXG4gICAqL1xuICBnZXQgZW5kKCk6IFNvdXJjZVBvc2l0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5sb2MuZW5kO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvciBjb21wYXRpYmlsaXR5IHdpdGggU291cmNlTG9jYXRpb24gaW4gQVNUIHBsdWdpbnNcbiAgICpcbiAgICogQGRlcHJlY2F0ZWQgdXNlIHdpdGhFbmQgaW5zdGVhZFxuICAgKi9cbiAgc2V0IGVuZChwb3NpdGlvbjogU291cmNlUG9zaXRpb24pIHtcbiAgICB0aGlzLmRhdGEubG9jRGlkVXBkYXRlKHsgZW5kOiBwb3NpdGlvbiB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgY29tcGF0aWJpbGl0eSB3aXRoIFNvdXJjZUxvY2F0aW9uIGluIEFTVCBwbHVnaW5zXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIHVzZSBtb2R1bGUgaW5zdGVhZFxuICAgKi9cbiAgZ2V0IHNvdXJjZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLm1vZHVsZTtcbiAgfVxuXG4gIGNvbGxhcHNlKHdoZXJlOiAnc3RhcnQnIHwgJ2VuZCcpOiBTb3VyY2VTcGFuIHtcbiAgICBzd2l0Y2ggKHdoZXJlKSB7XG4gICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0YXJ0KCkuY29sbGFwc2VkKCk7XG4gICAgICBjYXNlICdlbmQnOlxuICAgICAgICByZXR1cm4gdGhpcy5nZXRFbmQoKS5jb2xsYXBzZWQoKTtcbiAgICB9XG4gIH1cblxuICBleHRlbmQob3RoZXI6IFNvdXJjZVNwYW4pOiBTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gc3Bhbih0aGlzLmRhdGEuZ2V0U3RhcnQoKSwgb3RoZXIuZGF0YS5nZXRFbmQoKSk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogU2VyaWFsaXplZFNvdXJjZVNwYW4ge1xuICAgIHJldHVybiB0aGlzLmRhdGEuc2VyaWFsaXplKCk7XG4gIH1cblxuICBzbGljZSh7IHNraXBTdGFydCA9IDAsIHNraXBFbmQgPSAwIH06IHsgc2tpcFN0YXJ0PzogbnVtYmVyOyBza2lwRW5kPzogbnVtYmVyIH0pOiBTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gc3Bhbih0aGlzLmdldFN0YXJ0KCkubW92ZShza2lwU3RhcnQpLmRhdGEsIHRoaXMuZ2V0RW5kKCkubW92ZSgtc2tpcEVuZCkuZGF0YSk7XG4gIH1cblxuICBzbGljZVN0YXJ0Q2hhcnMoeyBza2lwU3RhcnQgPSAwLCBjaGFycyB9OiB7IHNraXBTdGFydD86IG51bWJlcjsgY2hhcnM6IG51bWJlciB9KTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIHNwYW4odGhpcy5nZXRTdGFydCgpLm1vdmUoc2tpcFN0YXJ0KS5kYXRhLCB0aGlzLmdldFN0YXJ0KCkubW92ZShza2lwU3RhcnQgKyBjaGFycykuZGF0YSk7XG4gIH1cblxuICBzbGljZUVuZENoYXJzKHsgc2tpcEVuZCA9IDAsIGNoYXJzIH06IHsgc2tpcEVuZD86IG51bWJlcjsgY2hhcnM6IG51bWJlciB9KTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIHNwYW4odGhpcy5nZXRFbmQoKS5tb3ZlKHNraXBFbmQgLSBjaGFycykuZGF0YSwgdGhpcy5nZXRTdGFydCgpLm1vdmUoLXNraXBFbmQpLmRhdGEpO1xuICB9XG59XG5cbnR5cGUgQW55U3BhbiA9IEhic1NwYW4gfCBDaGFyUG9zaXRpb25TcGFuIHwgSW52aXNpYmxlU3BhbjtcblxuY2xhc3MgQ2hhclBvc2l0aW9uU3BhbiBpbXBsZW1lbnRzIFNwYW5EYXRhIHtcbiAgcmVhZG9ubHkga2luZCA9IE9mZnNldEtpbmQuQ2hhclBvc2l0aW9uO1xuXG4gIF9sb2NQb3NTcGFuOiBIYnNTcGFuIHwgQlJPS0VOIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgc291cmNlOiBTb3VyY2UsXG4gICAgcmVhZG9ubHkgY2hhclBvc2l0aW9uczogeyBzdGFydDogQ2hhclBvc2l0aW9uOyBlbmQ6IENoYXJQb3NpdGlvbiB9XG4gICkge31cblxuICB3cmFwKCk6IFNvdXJjZVNwYW4ge1xuICAgIHJldHVybiBuZXcgU291cmNlU3Bhbih0aGlzKTtcbiAgfVxuXG4gIGFzU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlLnNsaWNlKHRoaXMuY2hhclBvc2l0aW9ucy5zdGFydC5jaGFyUG9zLCB0aGlzLmNoYXJQb3NpdGlvbnMuZW5kLmNoYXJQb3MpO1xuICB9XG5cbiAgZ2V0TW9kdWxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlLm1vZHVsZTtcbiAgfVxuXG4gIGdldFN0YXJ0KCk6IEFueVBvc2l0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5jaGFyUG9zaXRpb25zLnN0YXJ0O1xuICB9XG5cbiAgZ2V0RW5kKCk6IEFueVBvc2l0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5jaGFyUG9zaXRpb25zLmVuZDtcbiAgfVxuXG4gIGxvY0RpZFVwZGF0ZSgpIHtcbiAgICBpZiAoTE9DQUxfREVCVUcpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGB1cGRhdGluZyBhIGxvY2F0aW9uIHRoYXQgY2FtZSBmcm9tIGEgQ2hhclBvc2l0aW9uIHNwYW4gZG9lc24ndCB3b3JrIHJlbGlhYmx5LiBEb24ndCB0cnkgdG8gdXBkYXRlIGxvY2F0aW9ucyBhZnRlciB0aGUgcGx1Z2luIHBoYXNlYFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICB0b0hic1NwYW4oKTogSGJzU3BhbiB8IG51bGwge1xuICAgIGxldCBsb2NQb3NTcGFuID0gdGhpcy5fbG9jUG9zU3BhbjtcblxuICAgIGlmIChsb2NQb3NTcGFuID09PSBudWxsKSB7XG4gICAgICBsZXQgc3RhcnQgPSB0aGlzLmNoYXJQb3NpdGlvbnMuc3RhcnQudG9IYnNQb3MoKTtcbiAgICAgIGxldCBlbmQgPSB0aGlzLmNoYXJQb3NpdGlvbnMuZW5kLnRvSGJzUG9zKCk7XG5cbiAgICAgIGlmIChzdGFydCA9PT0gbnVsbCB8fCBlbmQgPT09IG51bGwpIHtcbiAgICAgICAgbG9jUG9zU3BhbiA9IHRoaXMuX2xvY1Bvc1NwYW4gPSBCUk9LRU47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2NQb3NTcGFuID0gdGhpcy5fbG9jUG9zU3BhbiA9IG5ldyBIYnNTcGFuKHRoaXMuc291cmNlLCB7XG4gICAgICAgICAgc3RhcnQsXG4gICAgICAgICAgZW5kLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbG9jUG9zU3BhbiA9PT0gQlJPS0VOID8gbnVsbCA6IGxvY1Bvc1NwYW47XG4gIH1cblxuICBzZXJpYWxpemUoKTogU2VyaWFsaXplZFNvdXJjZVNwYW4ge1xuICAgIGxldCB7XG4gICAgICBzdGFydDogeyBjaGFyUG9zOiBzdGFydCB9LFxuICAgICAgZW5kOiB7IGNoYXJQb3M6IGVuZCB9LFxuICAgIH0gPSB0aGlzLmNoYXJQb3NpdGlvbnM7XG5cbiAgICBpZiAoc3RhcnQgPT09IGVuZCkge1xuICAgICAgcmV0dXJuIHN0YXJ0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW3N0YXJ0LCBlbmRdO1xuICAgIH1cbiAgfVxuXG4gIHRvQ2hhclBvc1NwYW4oKTogQ2hhclBvc2l0aW9uU3BhbiB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEhic1NwYW4gaW1wbGVtZW50cyBTcGFuRGF0YSB7XG4gIHJlYWRvbmx5IGtpbmQgPSBPZmZzZXRLaW5kLkhic1Bvc2l0aW9uO1xuXG4gIF9jaGFyUG9zU3BhbjogQ2hhclBvc2l0aW9uU3BhbiB8IEJST0tFTiB8IG51bGwgPSBudWxsO1xuXG4gIC8vIHRoZSBzb3VyY2UgbG9jYXRpb24gZnJvbSBIYW5kbGViYXJzICsgQVNUIFBsdWdpbnMgLS0gY291bGQgYmUgd3JvbmdcbiAgX3Byb3ZpZGVkSGJzTG9jOiBTb3VyY2VMb2NhdGlvbiB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgc291cmNlOiBTb3VyY2UsXG4gICAgcmVhZG9ubHkgaGJzUG9zaXRpb25zOiB7IHN0YXJ0OiBIYnNQb3NpdGlvbjsgZW5kOiBIYnNQb3NpdGlvbiB9LFxuICAgIHByb3ZpZGVkSGJzTG9jOiBTb3VyY2VMb2NhdGlvbiB8IG51bGwgPSBudWxsXG4gICkge1xuICAgIHRoaXMuX3Byb3ZpZGVkSGJzTG9jID0gcHJvdmlkZWRIYnNMb2M7XG4gIH1cblxuICBzZXJpYWxpemUoKTogU2VyaWFsaXplZENvbmNyZXRlU291cmNlU3BhbiB7XG4gICAgbGV0IGNoYXJQb3MgPSB0aGlzLnRvQ2hhclBvc1NwYW4oKTtcbiAgICByZXR1cm4gY2hhclBvcyA9PT0gbnVsbCA/IE9mZnNldEtpbmQuQnJva2VuIDogY2hhclBvcy53cmFwKCkuc2VyaWFsaXplKCk7XG4gIH1cblxuICB3cmFwKCk6IFNvdXJjZVNwYW4ge1xuICAgIHJldHVybiBuZXcgU291cmNlU3Bhbih0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlUHJvdmlkZWQocG9zOiBTb3VyY2VQb3NpdGlvbiwgZWRnZTogJ3N0YXJ0JyB8ICdlbmQnKSB7XG4gICAgaWYgKHRoaXMuX3Byb3ZpZGVkSGJzTG9jKSB7XG4gICAgICB0aGlzLl9wcm92aWRlZEhic0xvY1tlZGdlXSA9IHBvcztcbiAgICB9XG5cbiAgICAvLyBpbnZhbGlkYXRlIGNvbXB1dGVkIGNoYXJhY3RlciBvZmZzZXRzXG4gICAgdGhpcy5fY2hhclBvc1NwYW4gPSBudWxsO1xuICAgIHRoaXMuX3Byb3ZpZGVkSGJzTG9jID0ge1xuICAgICAgc3RhcnQ6IHBvcyxcbiAgICAgIGVuZDogcG9zLFxuICAgIH07XG4gIH1cblxuICBsb2NEaWRVcGRhdGUoeyBzdGFydCwgZW5kIH06IHsgc3RhcnQ/OiBTb3VyY2VQb3NpdGlvbjsgZW5kPzogU291cmNlUG9zaXRpb24gfSk6IHZvaWQge1xuICAgIGlmIChzdGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnVwZGF0ZVByb3ZpZGVkKHN0YXJ0LCAnc3RhcnQnKTtcbiAgICAgIHRoaXMuaGJzUG9zaXRpb25zLnN0YXJ0ID0gbmV3IEhic1Bvc2l0aW9uKHRoaXMuc291cmNlLCBzdGFydCwgbnVsbCk7XG4gICAgfVxuXG4gICAgaWYgKGVuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnVwZGF0ZVByb3ZpZGVkKGVuZCwgJ2VuZCcpO1xuICAgICAgdGhpcy5oYnNQb3NpdGlvbnMuZW5kID0gbmV3IEhic1Bvc2l0aW9uKHRoaXMuc291cmNlLCBlbmQsIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIGFzU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgbGV0IHNwYW4gPSB0aGlzLnRvQ2hhclBvc1NwYW4oKTtcbiAgICByZXR1cm4gc3BhbiA9PT0gbnVsbCA/ICcnIDogc3Bhbi5hc1N0cmluZygpO1xuICB9XG5cbiAgZ2V0TW9kdWxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlLm1vZHVsZTtcbiAgfVxuXG4gIGdldFN0YXJ0KCk6IEFueVBvc2l0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5oYnNQb3NpdGlvbnMuc3RhcnQ7XG4gIH1cblxuICBnZXRFbmQoKTogQW55UG9zaXRpb24ge1xuICAgIHJldHVybiB0aGlzLmhic1Bvc2l0aW9ucy5lbmQ7XG4gIH1cblxuICB0b0hic0xvYygpOiBTb3VyY2VMb2NhdGlvbiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0OiB0aGlzLmhic1Bvc2l0aW9ucy5zdGFydC5oYnNQb3MsXG4gICAgICBlbmQ6IHRoaXMuaGJzUG9zaXRpb25zLmVuZC5oYnNQb3MsXG4gICAgfTtcbiAgfVxuXG4gIHRvSGJzU3BhbigpOiBIYnNTcGFuIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRvQ2hhclBvc1NwYW4oKTogQ2hhclBvc2l0aW9uU3BhbiB8IG51bGwge1xuICAgIGxldCBjaGFyUG9zU3BhbiA9IHRoaXMuX2NoYXJQb3NTcGFuO1xuXG4gICAgaWYgKGNoYXJQb3NTcGFuID09PSBudWxsKSB7XG4gICAgICBsZXQgc3RhcnQgPSB0aGlzLmhic1Bvc2l0aW9ucy5zdGFydC50b0NoYXJQb3MoKTtcbiAgICAgIGxldCBlbmQgPSB0aGlzLmhic1Bvc2l0aW9ucy5lbmQudG9DaGFyUG9zKCk7XG5cbiAgICAgIGlmIChzdGFydCAmJiBlbmQpIHtcbiAgICAgICAgY2hhclBvc1NwYW4gPSB0aGlzLl9jaGFyUG9zU3BhbiA9IG5ldyBDaGFyUG9zaXRpb25TcGFuKHRoaXMuc291cmNlLCB7XG4gICAgICAgICAgc3RhcnQsXG4gICAgICAgICAgZW5kLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoYXJQb3NTcGFuID0gdGhpcy5fY2hhclBvc1NwYW4gPSBCUk9LRU47XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjaGFyUG9zU3BhbiA9PT0gQlJPS0VOID8gbnVsbCA6IGNoYXJQb3NTcGFuO1xuICB9XG59XG5cbmNsYXNzIEludmlzaWJsZVNwYW4gaW1wbGVtZW50cyBTcGFuRGF0YSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IGtpbmQ6IE9mZnNldEtpbmQuQnJva2VuIHwgT2Zmc2V0S2luZC5JbnRlcm5hbHNTeW50aGV0aWMgfCBPZmZzZXRLaW5kLk5vbkV4aXN0ZW50LFxuICAgIC8vIHdoYXRldmVyIHdhcyBwcm92aWRlZCwgcG9zc2libHkgYnJva2VuXG4gICAgcmVhZG9ubHkgbG9jOiBTb3VyY2VMb2NhdGlvbixcbiAgICAvLyBpZiB0aGUgc3BhbiByZXByZXNlbnRzIGEgc3ludGhldGljIHN0cmluZ1xuICAgIHJlYWRvbmx5IHN0cmluZzogc3RyaW5nIHwgbnVsbCA9IG51bGxcbiAgKSB7fVxuXG4gIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkQ29uY3JldGVTb3VyY2VTcGFuIHtcbiAgICBzd2l0Y2ggKHRoaXMua2luZCkge1xuICAgICAgY2FzZSBPZmZzZXRLaW5kLkJyb2tlbjpcbiAgICAgIGNhc2UgT2Zmc2V0S2luZC5Ob25FeGlzdGVudDpcbiAgICAgICAgcmV0dXJuIHRoaXMua2luZDtcbiAgICAgIGNhc2UgT2Zmc2V0S2luZC5JbnRlcm5hbHNTeW50aGV0aWM6XG4gICAgICAgIHJldHVybiB0aGlzLnN0cmluZyB8fCAnJztcbiAgICB9XG4gIH1cblxuICB3cmFwKCk6IFNvdXJjZVNwYW4ge1xuICAgIHJldHVybiBuZXcgU291cmNlU3Bhbih0aGlzKTtcbiAgfVxuXG4gIGFzU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc3RyaW5nIHx8ICcnO1xuICB9XG5cbiAgbG9jRGlkVXBkYXRlKHsgc3RhcnQsIGVuZCB9OiB7IHN0YXJ0PzogU291cmNlUG9zaXRpb247IGVuZD86IFNvdXJjZVBvc2l0aW9uIH0pIHtcbiAgICBpZiAoc3RhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5sb2Muc3RhcnQgPSBzdGFydDtcbiAgICB9XG5cbiAgICBpZiAoZW5kICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMubG9jLmVuZCA9IGVuZDtcbiAgICB9XG4gIH1cblxuICBnZXRNb2R1bGUoKTogc3RyaW5nIHtcbiAgICAvLyBUT0RPOiBNYWtlIHRoaXMgcmVmbGVjdCB0aGUgYWN0dWFsIG1vZHVsZSB0aGlzIHNwYW4gb3JpZ2luYXRlZCBmcm9tXG4gICAgcmV0dXJuICdhbiB1bmtub3duIG1vZHVsZSc7XG4gIH1cblxuICBnZXRTdGFydCgpOiBBbnlQb3NpdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBJbnZpc2libGVQb3NpdGlvbih0aGlzLmtpbmQsIHRoaXMubG9jLnN0YXJ0KTtcbiAgfVxuXG4gIGdldEVuZCgpOiBBbnlQb3NpdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBJbnZpc2libGVQb3NpdGlvbih0aGlzLmtpbmQsIHRoaXMubG9jLmVuZCk7XG4gIH1cblxuICB0b0NoYXJQb3NTcGFuKCk6IEludmlzaWJsZVNwYW4ge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdG9IYnNTcGFuKCk6IG51bGwge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdG9IYnNMb2MoKTogU291cmNlTG9jYXRpb24ge1xuICAgIHJldHVybiBCUk9LRU5fTE9DQVRJT047XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHNwYW46IE1hdGNoRm48U291cmNlU3Bhbj4gPSBtYXRjaCgobSkgPT5cbiAgbVxuICAgIC53aGVuKE9mZnNldEtpbmQuSGJzUG9zaXRpb24sIE9mZnNldEtpbmQuSGJzUG9zaXRpb24sIChsZWZ0LCByaWdodCkgPT5cbiAgICAgIG5ldyBIYnNTcGFuKGxlZnQuc291cmNlLCB7XG4gICAgICAgIHN0YXJ0OiBsZWZ0LFxuICAgICAgICBlbmQ6IHJpZ2h0LFxuICAgICAgfSkud3JhcCgpXG4gICAgKVxuICAgIC53aGVuKE9mZnNldEtpbmQuQ2hhclBvc2l0aW9uLCBPZmZzZXRLaW5kLkNoYXJQb3NpdGlvbiwgKGxlZnQsIHJpZ2h0KSA9PlxuICAgICAgbmV3IENoYXJQb3NpdGlvblNwYW4obGVmdC5zb3VyY2UsIHtcbiAgICAgICAgc3RhcnQ6IGxlZnQsXG4gICAgICAgIGVuZDogcmlnaHQsXG4gICAgICB9KS53cmFwKClcbiAgICApXG4gICAgLndoZW4oT2Zmc2V0S2luZC5DaGFyUG9zaXRpb24sIE9mZnNldEtpbmQuSGJzUG9zaXRpb24sIChsZWZ0LCByaWdodCkgPT4ge1xuICAgICAgbGV0IHJpZ2h0Q2hhclBvcyA9IHJpZ2h0LnRvQ2hhclBvcygpO1xuXG4gICAgICBpZiAocmlnaHRDaGFyUG9zID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBuZXcgSW52aXNpYmxlU3BhbihPZmZzZXRLaW5kLkJyb2tlbiwgQlJPS0VOX0xPQ0FUSU9OKS53cmFwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc3BhbihsZWZ0LCByaWdodENoYXJQb3MpO1xuICAgICAgfVxuICAgIH0pXG4gICAgLndoZW4oT2Zmc2V0S2luZC5IYnNQb3NpdGlvbiwgT2Zmc2V0S2luZC5DaGFyUG9zaXRpb24sIChsZWZ0LCByaWdodCkgPT4ge1xuICAgICAgbGV0IGxlZnRDaGFyUG9zID0gbGVmdC50b0NoYXJQb3MoKTtcblxuICAgICAgaWYgKGxlZnRDaGFyUG9zID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBuZXcgSW52aXNpYmxlU3BhbihPZmZzZXRLaW5kLkJyb2tlbiwgQlJPS0VOX0xPQ0FUSU9OKS53cmFwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc3BhbihsZWZ0Q2hhclBvcywgcmlnaHQpO1xuICAgICAgfVxuICAgIH0pXG4gICAgLndoZW4oSXNJbnZpc2libGUsIE1hdGNoQW55LCAobGVmdCkgPT4gbmV3IEludmlzaWJsZVNwYW4obGVmdC5raW5kLCBCUk9LRU5fTE9DQVRJT04pLndyYXAoKSlcbiAgICAud2hlbihNYXRjaEFueSwgSXNJbnZpc2libGUsIChfLCByaWdodCkgPT5cbiAgICAgIG5ldyBJbnZpc2libGVTcGFuKHJpZ2h0LmtpbmQsIEJST0tFTl9MT0NBVElPTikud3JhcCgpXG4gICAgKVxuKTtcblxuZXhwb3J0IHR5cGUgU2VyaWFsaXplZENvbmNyZXRlU291cmNlU3BhbiA9XG4gIHwgLyoqIGNvbGxhcHNlZCAqLyBudW1iZXJcbiAgfCAvKiogbm9ybWFsICovIFtzdGFydDogbnVtYmVyLCBzaXplOiBudW1iZXJdXG4gIHwgLyoqIHN5bnRoZXRpYyAqLyBzdHJpbmc7XG5cbmV4cG9ydCB0eXBlIFNlcmlhbGl6ZWRTb3VyY2VTcGFuID1cbiAgfCBTZXJpYWxpemVkQ29uY3JldGVTb3VyY2VTcGFuXG4gIHwgT2Zmc2V0S2luZC5Ob25FeGlzdGVudFxuICB8IE9mZnNldEtpbmQuQnJva2VuO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==