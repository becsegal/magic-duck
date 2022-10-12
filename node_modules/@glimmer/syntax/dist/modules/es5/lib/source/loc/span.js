function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// eslint-disable-next-line import/no-extraneous-dependencies
import { DEBUG } from '@glimmer/env';
import { assertNever } from '@glimmer/util';
import { BROKEN_LOCATION, NON_EXISTENT_LOCATION } from '../location';
import { SourceSlice } from '../slice';
import { IsInvisible, match, MatchAny } from './match';
import { BROKEN, CharPosition, HbsPosition, InvisiblePosition } from './offset';
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

export var SourceSpan = /*#__PURE__*/function () {
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
        return SourceSpan.broken(BROKEN_LOCATION);
      }

    assertNever(serialized);
  };

  SourceSpan.forHbsLoc = function forHbsLoc(source, loc) {
    var start = new HbsPosition(source, loc.start);
    var end = new HbsPosition(source, loc.end);
    return new HbsSpan(source, {
      start: start,
      end: end
    }, loc).wrap();
  };

  SourceSpan.forCharPositions = function forCharPositions(source, startPos, endPos) {
    var start = new CharPosition(source, startPos);
    var end = new CharPosition(source, endPos);
    return new CharPositionSpan(source, {
      start: start,
      end: end
    }).wrap();
  };

  SourceSpan.synthetic = function synthetic(chars) {
    return new InvisibleSpan("InternalsSynthetic"
    /* InternalsSynthetic */
    , NON_EXISTENT_LOCATION, chars).wrap();
  };

  SourceSpan.broken = function broken(pos) {
    if (pos === void 0) {
      pos = BROKEN_LOCATION;
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

    if (DEBUG) {
      if (expected !== undefined && chars !== expected) {
        // eslint-disable-next-line no-console
        console.warn("unexpectedly found " + JSON.stringify(chars) + " when slicing source, but expected " + JSON.stringify(expected));
      }
    }

    return new SourceSlice({
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
      return span === null ? BROKEN_LOCATION : span.toHbsLoc();
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
      , NON_EXISTENT_LOCATION).wrap();
    }
  }]);

  return SourceSpan;
}();

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
        locPosSpan = this._locPosSpan = BROKEN;
      } else {
        locPosSpan = this._locPosSpan = new HbsSpan(this.source, {
          start: start,
          end: end
        });
      }
    }

    return locPosSpan === BROKEN ? null : locPosSpan;
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

export var HbsSpan = /*#__PURE__*/function () {
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
      this.hbsPositions.start = new HbsPosition(this.source, start, null);
    }

    if (end !== undefined) {
      this.updateProvided(end, 'end');
      this.hbsPositions.end = new HbsPosition(this.source, end, null);
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
        charPosSpan = this._charPosSpan = BROKEN;
        return null;
      }
    }

    return charPosSpan === BROKEN ? null : charPosSpan;
  };

  return HbsSpan;
}();

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
    return new InvisiblePosition(this.kind, this.loc.start);
  };

  _proto4.getEnd = function getEnd() {
    return new InvisiblePosition(this.kind, this.loc.end);
  };

  _proto4.toCharPosSpan = function toCharPosSpan() {
    return this;
  };

  _proto4.toHbsSpan = function toHbsSpan() {
    return null;
  };

  _proto4.toHbsLoc = function toHbsLoc() {
    return BROKEN_LOCATION;
  };

  return InvisibleSpan;
}();

export var span = match(function (m) {
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
      , BROKEN_LOCATION).wrap();
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
      , BROKEN_LOCATION).wrap();
    } else {
      return span(leftCharPos, right);
    }
  }).when(IsInvisible, MatchAny, function (left) {
    return new InvisibleSpan(left.kind, BROKEN_LOCATION).wrap();
  }).when(MatchAny, IsInvisible, function (_, right) {
    return new InvisibleSpan(right.kind, BROKEN_LOCATION).wrap();
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvc291cmNlL2xvYy9zcGFuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBLFNBQUEsS0FBQSxRQUFBLGNBQUE7QUFFQSxTQUFBLFdBQUEsUUFBQSxlQUFBO0FBRUEsU0FBQSxlQUFBLEVBQUEscUJBQUEsUUFBQSxhQUFBO0FBTUEsU0FBQSxXQUFBLFFBQUEsVUFBQTtBQUVBLFNBQUEsV0FBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLFFBQUEsU0FBQTtBQUNBLFNBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUEsaUJBQUEsUUFBQSxVQUFBO0FBeURBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtDQSxXQUFNLFVBQU47QUE0Q0Usc0JBQUEsSUFBQSxFQUE0QztBQUF4QixTQUFBLElBQUEsR0FBQSxJQUFBO0FBQ2xCLFNBQUEsV0FBQSxHQUNFLElBQUksQ0FBSixJQUFBLEtBQVM7QUFBQTtBQUFULE9BQXlDLElBQUksQ0FBSixJQUFBLEtBQVM7QUFBQTtBQURwRDtBQUVEOztBQS9DSCxhQUtFLElBTEYsR0FLRSxjQUFBLE1BQUEsRUFBQSxVQUFBLEVBQTREO0FBQzFELFFBQUksT0FBQSxVQUFBLEtBQUosUUFBQSxFQUFvQztBQUNsQyxhQUFPLFVBQVUsQ0FBVixnQkFBQSxDQUFBLE1BQUEsRUFBQSxVQUFBLEVBQVAsVUFBTyxDQUFQO0FBREYsS0FBQSxNQUVPLElBQUksT0FBQSxVQUFBLEtBQUosUUFBQSxFQUFvQztBQUN6QyxhQUFPLFVBQVUsQ0FBVixTQUFBLENBQVAsVUFBTyxDQUFQO0FBREssS0FBQSxNQUVBLElBQUksS0FBSyxDQUFMLE9BQUEsQ0FBSixVQUFJLENBQUosRUFBK0I7QUFDcEMsYUFBTyxVQUFVLENBQVYsZ0JBQUEsQ0FBQSxNQUFBLEVBQW9DLFVBQVUsQ0FBOUMsQ0FBOEMsQ0FBOUMsRUFBbUQsVUFB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QUFBLFdBQVUsSUFBQSxhQUFBLENBQWtCLElBQUksQ0FBdEIsSUFBQSxFQUFBLGVBQUEsRUEvQnpDLElBK0J5QyxFQUFWO0FBQUEsR0EvQi9CLEVBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxXQUFBLEVBZ0MrQixVQUFBLENBQUEsRUFBQSxLQUFBO0FBQUEsV0FDM0IsSUFBQSxhQUFBLENBQWtCLEtBQUssQ0FBdkIsSUFBQSxFQUFBLGVBQUEsRUFsQ0MsSUFrQ0QsRUFEMkI7QUFBQSxHQWhDL0IsQ0FENkM7QUFBQSxDQUFELENBQXZDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llc1xuaW1wb3J0IHsgREVCVUcgfSBmcm9tICdAZ2xpbW1lci9lbnYnO1xuaW1wb3J0IHsgTE9DQUxfREVCVUcgfSBmcm9tICdAZ2xpbW1lci9sb2NhbC1kZWJ1Zy1mbGFncyc7XG5pbXBvcnQgeyBhc3NlcnROZXZlciB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuXG5pbXBvcnQge1xuICBCUk9LRU5fTE9DQVRJT04sXG4gIE5PTl9FWElTVEVOVF9MT0NBVElPTixcbiAgU291cmNlTG9jYXRpb24sXG4gIFNvdXJjZVBvc2l0aW9uLFxufSBmcm9tICcuLi9sb2NhdGlvbic7XG5pbXBvcnQgeyBTb3VyY2VTbGljZSB9IGZyb20gJy4uL3NsaWNlJztcbmltcG9ydCB7IFNvdXJjZSB9IGZyb20gJy4uL3NvdXJjZSc7XG5pbXBvcnQgeyBJc0ludmlzaWJsZSwgbWF0Y2gsIE1hdGNoQW55LCBNYXRjaEZuIH0gZnJvbSAnLi9tYXRjaCc7XG5pbXBvcnQge1xuICBBbnlQb3NpdGlvbixcbiAgQlJPS0VOLFxuICBDaGFyUG9zaXRpb24sXG4gIEhic1Bvc2l0aW9uLFxuICBJbnZpc2libGVQb3NpdGlvbixcbiAgT2Zmc2V0S2luZCxcbiAgU291cmNlT2Zmc2V0LFxufSBmcm9tICcuL29mZnNldCc7XG5cbi8qKlxuICogQWxsIHNwYW5zIGhhdmUgdGhlc2UgZGV0YWlscyBpbiBjb21tb24uXG4gKi9cbmludGVyZmFjZSBTcGFuRGF0YSB7XG4gIHJlYWRvbmx5IGtpbmQ6IE9mZnNldEtpbmQ7XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgdGhpcyBzcGFuIGludG8gYSBzdHJpbmcuIElmIHRoZSBzcGFuIGlzIGJyb2tlbiwgcmV0dXJuIGAnJ2AuXG4gICAqL1xuICBhc1N0cmluZygpOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1vZHVsZSB0aGUgc3BhbiB3YXMgbG9jYXRlZCBpbi5cbiAgICovXG4gIGdldE1vZHVsZSgpOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc3RhcnRpbmcgcG9zaXRpb24gZm9yIHRoaXMgc3Bhbi4gVHJ5IHRvIGF2b2lkIGNyZWF0aW5nIG5ldyBwb3NpdGlvbiBvYmplY3RzLCBhcyB0aGV5XG4gICAqIGNhY2hlIGNvbXB1dGF0aW9ucy5cbiAgICovXG4gIGdldFN0YXJ0KCk6IEFueVBvc2l0aW9uO1xuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGVuZGluZyBwb3NpdGlvbiBmb3IgdGhpcyBzcGFuLiBUcnkgdG8gYXZvaWQgY3JlYXRpbmcgbmV3IHBvc2l0aW9uIG9iamVjdHMsIGFzIHRoZXlcbiAgICogY2FjaGUgY29tcHV0YXRpb25zLlxuICAgKi9cbiAgZ2V0RW5kKCk6IEFueVBvc2l0aW9uO1xuXG4gIC8qKlxuICAgKiBDb21wdXRlIHRoZSBgU291cmNlTG9jYXRpb25gIGZvciB0aGlzIHNwYW4sIHJldHVybmVkIGFzIGFuIGluc3RhbmNlIG9mIGBIYnNTcGFuYC5cbiAgICovXG4gIHRvSGJzU3BhbigpOiBIYnNTcGFuIHwgbnVsbDtcblxuICAvKipcbiAgICogRm9yIGNvbXBhdGliaWxpdHksIHdoZW5ldmVyIHRoZSBgc3RhcnRgIG9yIGBlbmRgIG9mIGEge0BzZWUgU291cmNlT2Zmc2V0fSBjaGFuZ2VzLCBzcGFucyBhcmVcbiAgICogbm90aWZpZWQgb2YgdGhlIGNoYW5nZSBzbyB0aGV5IGNhbiB1cGRhdGUgdGhlbXNlbHZlcy4gVGhpcyBzaG91bGRuJ3QgaGFwcGVuIG91dHNpZGUgb2YgQVNUXG4gICAqIHBsdWdpbnMuXG4gICAqL1xuICBsb2NEaWRVcGRhdGUoY2hhbmdlczogeyBzdGFydD86IFNvdXJjZVBvc2l0aW9uOyBlbmQ/OiBTb3VyY2VQb3NpdGlvbiB9KTogdm9pZDtcblxuICAvKipcbiAgICogU2VyaWFsaXplIGludG8gYSB7QHNlZSBTZXJpYWxpemVkU291cmNlU3Bhbn0sIHdoaWNoIGlzIGNvbXBhY3QgYW5kIGRlc2lnbmVkIGZvciByZWFkYWJpbGl0eSBpblxuICAgKiBjb250ZXh0IGxpa2UgQVNUIEV4cGxvcmVyLiBJZiB5b3UgbmVlZCBhIHtAc2VlIFNvdXJjZUxvY2F0aW9ufSwgdXNlIHtAc2VlIHRvSlNPTn0uXG4gICAqL1xuICBzZXJpYWxpemUoKTogU2VyaWFsaXplZFNvdXJjZVNwYW47XG59XG5cbi8qKlxuICogQSBgU291cmNlU3BhbmAgb2JqZWN0IHJlcHJlc2VudHMgYSBzcGFuIG9mIGNoYXJhY3RlcnMgaW5zaWRlIG9mIGEgdGVtcGxhdGUgc291cmNlLlxuICpcbiAqIFRoZXJlIGFyZSB0aHJlZSBraW5kcyBvZiBgU291cmNlU3BhbmAgb2JqZWN0czpcbiAqXG4gKiAtIGBDb25jcmV0ZVNvdXJjZVNwYW5gLCB3aGljaCBjb250YWlucyBieXRlIG9mZnNldHNcbiAqIC0gYExhenlTb3VyY2VTcGFuYCwgd2hpY2ggY29udGFpbnMgYFNvdXJjZUxvY2F0aW9uYHMgZnJvbSB0aGUgSGFuZGxlYmFycyBBU1QsIHdoaWNoIGNhbiBiZVxuICogICBjb252ZXJ0ZWQgdG8gYnl0ZSBvZmZzZXRzIG9uIGRlbWFuZC5cbiAqIC0gYEludmlzaWJsZVNvdXJjZVNwYW5gLCB3aGljaCByZXByZXNlbnQgc291cmNlIHN0cmluZ3MgdGhhdCBhcmVuJ3QgcHJlc2VudCBpbiB0aGUgc291cmNlLFxuICogICBiZWNhdXNlOlxuICogICAgIC0gdGhleSB3ZXJlIGNyZWF0ZWQgc3ludGhldGljYWxseVxuICogICAgIC0gdGhlaXIgbG9jYXRpb24gaXMgbm9uc2Vuc2ljYWwgKHRoZSBzcGFuIGlzIGJyb2tlbilcbiAqICAgICAtIHRoZXkgcmVwcmVzZW50IG5vdGhpbmcgaW4gdGhlIHNvdXJjZSAodGhpcyBjdXJyZW50bHkgaGFwcGVucyBvbmx5IHdoZW4gYSBidWcgaW4gdGhlXG4gKiAgICAgICB1cHN0cmVhbSBIYW5kbGViYXJzIHBhcnNlciBmYWlscyB0byBhc3NpZ24gYSBsb2NhdGlvbiB0byBlbXB0eSBibG9ja3MpXG4gKlxuICogQXQgYSBoaWdoIGxldmVsLCBhbGwgYFNvdXJjZVNwYW5gIG9iamVjdHMgcHJvdmlkZTpcbiAqXG4gKiAtIGJ5dGUgb2Zmc2V0c1xuICogLSBzb3VyY2UgaW4gY29sdW1uIGFuZCBsaW5lIGZvcm1hdFxuICpcbiAqIEFuZCB5b3UgY2FuIGRvIHRoZXNlIG9wZXJhdGlvbnMgb24gYFNvdXJjZVNwYW5gczpcbiAqXG4gKiAtIGNvbGxhcHNlIGl0IHRvIGEgYFNvdXJjZVNwYW5gIHJlcHJlc2VudGluZyBpdHMgc3RhcnRpbmcgb3IgZW5kaW5nIHBvc2l0aW9uXG4gKiAtIHNsaWNlIG91dCBzb21lIGNoYXJhY3RlcnMsIG9wdGlvbmFsbHkgc2tpcHBpbmcgc29tZSBjaGFyYWN0ZXJzIGF0IHRoZSBiZWdpbm5pbmcgb3IgZW5kXG4gKiAtIGNyZWF0ZSBhIG5ldyBgU291cmNlU3BhbmAgd2l0aCBhIGRpZmZlcmVudCBzdGFydGluZyBvciBlbmRpbmcgb2Zmc2V0XG4gKlxuICogQWxsIFNvdXJjZVNwYW4gb2JqZWN0cyBpbXBsZW1lbnQgYFNvdXJjZUxvY2F0aW9uYCwgZm9yIGNvbXBhdGliaWxpdHkuIEFsbCBTb3VyY2VTcGFuXG4gKiBvYmplY3RzIGhhdmUgYSBgdG9KU09OYCB0aGF0IGVtaXRzIGBTb3VyY2VMb2NhdGlvbmAsIGFsc28gZm9yIGNvbXBhdGliaWxpdHkuXG4gKlxuICogRm9yIGNvbXBhdGliaWxpdHksIHN1YmNsYXNzZXMgb2YgYEFic3RyYWN0U291cmNlU3BhbmAgbXVzdCBpbXBsZW1lbnQgYGxvY0RpZFVwZGF0ZWAsIHdoaWNoXG4gKiBoYXBwZW5zIHdoZW4gYW4gQVNUIHBsdWdpbiBhdHRlbXB0cyB0byBtb2RpZnkgdGhlIGBzdGFydGAgb3IgYGVuZGAgb2YgYSBzcGFuIGRpcmVjdGx5LlxuICpcbiAqIFRoZSBnb2FsIGlzIHRvIGF2b2lkIGNyZWF0aW5nIGFueSBwcm9ibGVtcyBmb3IgdXNlLWNhc2VzIGxpa2UgQVNUIEV4cGxvcmVyLlxuICovXG5leHBvcnQgY2xhc3MgU291cmNlU3BhbiBpbXBsZW1lbnRzIFNvdXJjZUxvY2F0aW9uIHtcbiAgc3RhdGljIGdldCBOT05fRVhJU1RFTlQoKTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIG5ldyBJbnZpc2libGVTcGFuKE9mZnNldEtpbmQuTm9uRXhpc3RlbnQsIE5PTl9FWElTVEVOVF9MT0NBVElPTikud3JhcCgpO1xuICB9XG5cbiAgc3RhdGljIGxvYWQoc291cmNlOiBTb3VyY2UsIHNlcmlhbGl6ZWQ6IFNlcmlhbGl6ZWRTb3VyY2VTcGFuKTogU291cmNlU3BhbiB7XG4gICAgaWYgKHR5cGVvZiBzZXJpYWxpemVkID09PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIFNvdXJjZVNwYW4uZm9yQ2hhclBvc2l0aW9ucyhzb3VyY2UsIHNlcmlhbGl6ZWQsIHNlcmlhbGl6ZWQpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlcmlhbGl6ZWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gU291cmNlU3Bhbi5zeW50aGV0aWMoc2VyaWFsaXplZCk7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNlcmlhbGl6ZWQpKSB7XG4gICAgICByZXR1cm4gU291cmNlU3Bhbi5mb3JDaGFyUG9zaXRpb25zKHNvdXJjZSwgc2VyaWFsaXplZFswXSwgc2VyaWFsaXplZFsxXSk7XG4gICAgfSBlbHNlIGlmIChzZXJpYWxpemVkID09PSBPZmZzZXRLaW5kLk5vbkV4aXN0ZW50KSB7XG4gICAgICByZXR1cm4gU291cmNlU3Bhbi5OT05fRVhJU1RFTlQ7XG4gICAgfSBlbHNlIGlmIChzZXJpYWxpemVkID09PSBPZmZzZXRLaW5kLkJyb2tlbikge1xuICAgICAgcmV0dXJuIFNvdXJjZVNwYW4uYnJva2VuKEJST0tFTl9MT0NBVElPTik7XG4gICAgfVxuXG4gICAgYXNzZXJ0TmV2ZXIoc2VyaWFsaXplZCk7XG4gIH1cblxuICBzdGF0aWMgZm9ySGJzTG9jKHNvdXJjZTogU291cmNlLCBsb2M6IFNvdXJjZUxvY2F0aW9uKTogU291cmNlU3BhbiB7XG4gICAgbGV0IHN0YXJ0ID0gbmV3IEhic1Bvc2l0aW9uKHNvdXJjZSwgbG9jLnN0YXJ0KTtcbiAgICBsZXQgZW5kID0gbmV3IEhic1Bvc2l0aW9uKHNvdXJjZSwgbG9jLmVuZCk7XG4gICAgcmV0dXJuIG5ldyBIYnNTcGFuKHNvdXJjZSwgeyBzdGFydCwgZW5kIH0sIGxvYykud3JhcCgpO1xuICB9XG5cbiAgc3RhdGljIGZvckNoYXJQb3NpdGlvbnMoc291cmNlOiBTb3VyY2UsIHN0YXJ0UG9zOiBudW1iZXIsIGVuZFBvczogbnVtYmVyKTogU291cmNlU3BhbiB7XG4gICAgbGV0IHN0YXJ0ID0gbmV3IENoYXJQb3NpdGlvbihzb3VyY2UsIHN0YXJ0UG9zKTtcbiAgICBsZXQgZW5kID0gbmV3IENoYXJQb3NpdGlvbihzb3VyY2UsIGVuZFBvcyk7XG5cbiAgICByZXR1cm4gbmV3IENoYXJQb3NpdGlvblNwYW4oc291cmNlLCB7IHN0YXJ0LCBlbmQgfSkud3JhcCgpO1xuICB9XG5cbiAgc3RhdGljIHN5bnRoZXRpYyhjaGFyczogc3RyaW5nKTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIG5ldyBJbnZpc2libGVTcGFuKE9mZnNldEtpbmQuSW50ZXJuYWxzU3ludGhldGljLCBOT05fRVhJU1RFTlRfTE9DQVRJT04sIGNoYXJzKS53cmFwKCk7XG4gIH1cblxuICBzdGF0aWMgYnJva2VuKHBvczogU291cmNlTG9jYXRpb24gPSBCUk9LRU5fTE9DQVRJT04pOiBTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gbmV3IEludmlzaWJsZVNwYW4oT2Zmc2V0S2luZC5Ccm9rZW4sIHBvcykud3JhcCgpO1xuICB9XG5cbiAgcmVhZG9ubHkgaXNJbnZpc2libGU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkYXRhOiBTcGFuRGF0YSAmIEFueVNwYW4pIHtcbiAgICB0aGlzLmlzSW52aXNpYmxlID1cbiAgICAgIGRhdGEua2luZCAhPT0gT2Zmc2V0S2luZC5DaGFyUG9zaXRpb24gJiYgZGF0YS5raW5kICE9PSBPZmZzZXRLaW5kLkhic1Bvc2l0aW9uO1xuICB9XG5cbiAgZ2V0U3RhcnQoKTogU291cmNlT2Zmc2V0IHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmdldFN0YXJ0KCkud3JhcCgpO1xuICB9XG5cbiAgZ2V0RW5kKCk6IFNvdXJjZU9mZnNldCB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5nZXRFbmQoKS53cmFwKCk7XG4gIH1cblxuICBnZXQgbG9jKCk6IFNvdXJjZUxvY2F0aW9uIHtcbiAgICBsZXQgc3BhbiA9IHRoaXMuZGF0YS50b0hic1NwYW4oKTtcbiAgICByZXR1cm4gc3BhbiA9PT0gbnVsbCA/IEJST0tFTl9MT0NBVElPTiA6IHNwYW4udG9IYnNMb2MoKTtcbiAgfVxuXG4gIGdldCBtb2R1bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmdldE1vZHVsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc3RhcnRpbmcgYFNvdXJjZVBvc2l0aW9uYCBmb3IgdGhpcyBgU291cmNlU3BhbmAsIGxhemlseSBjb21wdXRpbmcgaXQgaWYgbmVlZGVkLlxuICAgKi9cbiAgZ2V0IHN0YXJ0UG9zaXRpb24oKTogU291cmNlUG9zaXRpb24ge1xuICAgIHJldHVybiB0aGlzLmxvYy5zdGFydDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGVuZGluZyBgU291cmNlUG9zaXRpb25gIGZvciB0aGlzIGBTb3VyY2VTcGFuYCwgbGF6aWx5IGNvbXB1dGluZyBpdCBpZiBuZWVkZWQuXG4gICAqL1xuICBnZXQgZW5kUG9zaXRpb24oKTogU291cmNlUG9zaXRpb24ge1xuICAgIHJldHVybiB0aGlzLmxvYy5lbmQ7XG4gIH1cblxuICAvKipcbiAgICogU3VwcG9ydCBjb252ZXJ0aW5nIEFTVHYxIG5vZGVzIGludG8gYSBzZXJpYWxpemVkIGZvcm1hdCB1c2luZyBKU09OLnN0cmluZ2lmeS5cbiAgICovXG4gIHRvSlNPTigpOiBTb3VyY2VMb2NhdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMubG9jO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBzcGFuIHdpdGggdGhlIGN1cnJlbnQgc3BhbidzIGVuZCBhbmQgYSBuZXcgYmVnaW5uaW5nLlxuICAgKi9cbiAgd2l0aFN0YXJ0KG90aGVyOiBTb3VyY2VPZmZzZXQpOiBTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gc3BhbihvdGhlci5kYXRhLCB0aGlzLmRhdGEuZ2V0RW5kKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBzcGFuIHdpdGggdGhlIGN1cnJlbnQgc3BhbidzIGJlZ2lubmluZyBhbmQgYSBuZXcgZW5kaW5nLlxuICAgKi9cbiAgd2l0aEVuZCh0aGlzOiBTb3VyY2VTcGFuLCBvdGhlcjogU291cmNlT2Zmc2V0KTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIHNwYW4odGhpcy5kYXRhLmdldFN0YXJ0KCksIG90aGVyLmRhdGEpO1xuICB9XG5cbiAgYXNTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmFzU3RyaW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCB0aGlzIGBTb3VyY2VTcGFuYCBpbnRvIGEgYFNvdXJjZVNsaWNlYC4gSW4gZGVidWcgbW9kZSwgdGhpcyBtZXRob2Qgb3B0aW9uYWxseSBjaGVja3NcbiAgICogdGhhdCB0aGUgYnl0ZSBvZmZzZXRzIHJlcHJlc2VudGVkIGJ5IHRoaXMgYFNvdXJjZVNwYW5gIGFjdHVhbGx5IGNvcnJlc3BvbmQgdG8gdGhlIGV4cGVjdGVkXG4gICAqIHN0cmluZy5cbiAgICovXG4gIHRvU2xpY2UoZXhwZWN0ZWQ/OiBzdHJpbmcpOiBTb3VyY2VTbGljZSB7XG4gICAgbGV0IGNoYXJzID0gdGhpcy5kYXRhLmFzU3RyaW5nKCk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGlmIChleHBlY3RlZCAhPT0gdW5kZWZpbmVkICYmIGNoYXJzICE9PSBleHBlY3RlZCkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgYHVuZXhwZWN0ZWRseSBmb3VuZCAke0pTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgY2hhcnNcbiAgICAgICAgICApfSB3aGVuIHNsaWNpbmcgc291cmNlLCBidXQgZXhwZWN0ZWQgJHtKU09OLnN0cmluZ2lmeShleHBlY3RlZCl9YFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgU291cmNlU2xpY2Uoe1xuICAgICAgbG9jOiB0aGlzLFxuICAgICAgY2hhcnM6IGV4cGVjdGVkIHx8IGNoYXJzLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvciBjb21wYXRpYmlsaXR5IHdpdGggU291cmNlTG9jYXRpb24gaW4gQVNUIHBsdWdpbnNcbiAgICpcbiAgICogQGRlcHJlY2F0ZWQgdXNlIHN0YXJ0UG9zaXRpb24gaW5zdGVhZFxuICAgKi9cbiAgZ2V0IHN0YXJ0KCk6IFNvdXJjZVBvc2l0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5sb2Muc3RhcnQ7XG4gIH1cblxuICAvKipcbiAgICogRm9yIGNvbXBhdGliaWxpdHkgd2l0aCBTb3VyY2VMb2NhdGlvbiBpbiBBU1QgcGx1Z2luc1xuICAgKlxuICAgKiBAZGVwcmVjYXRlZCB1c2Ugd2l0aFN0YXJ0IGluc3RlYWRcbiAgICovXG4gIHNldCBzdGFydChwb3NpdGlvbjogU291cmNlUG9zaXRpb24pIHtcbiAgICB0aGlzLmRhdGEubG9jRGlkVXBkYXRlKHsgc3RhcnQ6IHBvc2l0aW9uIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvciBjb21wYXRpYmlsaXR5IHdpdGggU291cmNlTG9jYXRpb24gaW4gQVNUIHBsdWdpbnNcbiAgICpcbiAgICogQGRlcHJlY2F0ZWQgdXNlIGVuZFBvc2l0aW9uIGluc3RlYWRcbiAgICovXG4gIGdldCBlbmQoKTogU291cmNlUG9zaXRpb24ge1xuICAgIHJldHVybiB0aGlzLmxvYy5lbmQ7XG4gIH1cblxuICAvKipcbiAgICogRm9yIGNvbXBhdGliaWxpdHkgd2l0aCBTb3VyY2VMb2NhdGlvbiBpbiBBU1QgcGx1Z2luc1xuICAgKlxuICAgKiBAZGVwcmVjYXRlZCB1c2Ugd2l0aEVuZCBpbnN0ZWFkXG4gICAqL1xuICBzZXQgZW5kKHBvc2l0aW9uOiBTb3VyY2VQb3NpdGlvbikge1xuICAgIHRoaXMuZGF0YS5sb2NEaWRVcGRhdGUoeyBlbmQ6IHBvc2l0aW9uIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvciBjb21wYXRpYmlsaXR5IHdpdGggU291cmNlTG9jYXRpb24gaW4gQVNUIHBsdWdpbnNcbiAgICpcbiAgICogQGRlcHJlY2F0ZWQgdXNlIG1vZHVsZSBpbnN0ZWFkXG4gICAqL1xuICBnZXQgc291cmNlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubW9kdWxlO1xuICB9XG5cbiAgY29sbGFwc2Uod2hlcmU6ICdzdGFydCcgfCAnZW5kJyk6IFNvdXJjZVNwYW4ge1xuICAgIHN3aXRjaCAod2hlcmUpIHtcbiAgICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhcnQoKS5jb2xsYXBzZWQoKTtcbiAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgIHJldHVybiB0aGlzLmdldEVuZCgpLmNvbGxhcHNlZCgpO1xuICAgIH1cbiAgfVxuXG4gIGV4dGVuZChvdGhlcjogU291cmNlU3Bhbik6IFNvdXJjZVNwYW4ge1xuICAgIHJldHVybiBzcGFuKHRoaXMuZGF0YS5nZXRTdGFydCgpLCBvdGhlci5kYXRhLmdldEVuZCgpKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5zZXJpYWxpemUoKTtcbiAgfVxuXG4gIHNsaWNlKHsgc2tpcFN0YXJ0ID0gMCwgc2tpcEVuZCA9IDAgfTogeyBza2lwU3RhcnQ/OiBudW1iZXI7IHNraXBFbmQ/OiBudW1iZXIgfSk6IFNvdXJjZVNwYW4ge1xuICAgIHJldHVybiBzcGFuKHRoaXMuZ2V0U3RhcnQoKS5tb3ZlKHNraXBTdGFydCkuZGF0YSwgdGhpcy5nZXRFbmQoKS5tb3ZlKC1za2lwRW5kKS5kYXRhKTtcbiAgfVxuXG4gIHNsaWNlU3RhcnRDaGFycyh7IHNraXBTdGFydCA9IDAsIGNoYXJzIH06IHsgc2tpcFN0YXJ0PzogbnVtYmVyOyBjaGFyczogbnVtYmVyIH0pOiBTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gc3Bhbih0aGlzLmdldFN0YXJ0KCkubW92ZShza2lwU3RhcnQpLmRhdGEsIHRoaXMuZ2V0U3RhcnQoKS5tb3ZlKHNraXBTdGFydCArIGNoYXJzKS5kYXRhKTtcbiAgfVxuXG4gIHNsaWNlRW5kQ2hhcnMoeyBza2lwRW5kID0gMCwgY2hhcnMgfTogeyBza2lwRW5kPzogbnVtYmVyOyBjaGFyczogbnVtYmVyIH0pOiBTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gc3Bhbih0aGlzLmdldEVuZCgpLm1vdmUoc2tpcEVuZCAtIGNoYXJzKS5kYXRhLCB0aGlzLmdldFN0YXJ0KCkubW92ZSgtc2tpcEVuZCkuZGF0YSk7XG4gIH1cbn1cblxudHlwZSBBbnlTcGFuID0gSGJzU3BhbiB8IENoYXJQb3NpdGlvblNwYW4gfCBJbnZpc2libGVTcGFuO1xuXG5jbGFzcyBDaGFyUG9zaXRpb25TcGFuIGltcGxlbWVudHMgU3BhbkRhdGEge1xuICByZWFkb25seSBraW5kID0gT2Zmc2V0S2luZC5DaGFyUG9zaXRpb247XG5cbiAgX2xvY1Bvc1NwYW46IEhic1NwYW4gfCBCUk9LRU4gfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBzb3VyY2U6IFNvdXJjZSxcbiAgICByZWFkb25seSBjaGFyUG9zaXRpb25zOiB7IHN0YXJ0OiBDaGFyUG9zaXRpb247IGVuZDogQ2hhclBvc2l0aW9uIH1cbiAgKSB7fVxuXG4gIHdyYXAoKTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIG5ldyBTb3VyY2VTcGFuKHRoaXMpO1xuICB9XG5cbiAgYXNTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2Uuc2xpY2UodGhpcy5jaGFyUG9zaXRpb25zLnN0YXJ0LmNoYXJQb3MsIHRoaXMuY2hhclBvc2l0aW9ucy5lbmQuY2hhclBvcyk7XG4gIH1cblxuICBnZXRNb2R1bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2UubW9kdWxlO1xuICB9XG5cbiAgZ2V0U3RhcnQoKTogQW55UG9zaXRpb24ge1xuICAgIHJldHVybiB0aGlzLmNoYXJQb3NpdGlvbnMuc3RhcnQ7XG4gIH1cblxuICBnZXRFbmQoKTogQW55UG9zaXRpb24ge1xuICAgIHJldHVybiB0aGlzLmNoYXJQb3NpdGlvbnMuZW5kO1xuICB9XG5cbiAgbG9jRGlkVXBkYXRlKCkge1xuICAgIGlmIChMT0NBTF9ERUJVRykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgYHVwZGF0aW5nIGEgbG9jYXRpb24gdGhhdCBjYW1lIGZyb20gYSBDaGFyUG9zaXRpb24gc3BhbiBkb2Vzbid0IHdvcmsgcmVsaWFibHkuIERvbid0IHRyeSB0byB1cGRhdGUgbG9jYXRpb25zIGFmdGVyIHRoZSBwbHVnaW4gcGhhc2VgXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHRvSGJzU3BhbigpOiBIYnNTcGFuIHwgbnVsbCB7XG4gICAgbGV0IGxvY1Bvc1NwYW4gPSB0aGlzLl9sb2NQb3NTcGFuO1xuXG4gICAgaWYgKGxvY1Bvc1NwYW4gPT09IG51bGwpIHtcbiAgICAgIGxldCBzdGFydCA9IHRoaXMuY2hhclBvc2l0aW9ucy5zdGFydC50b0hic1BvcygpO1xuICAgICAgbGV0IGVuZCA9IHRoaXMuY2hhclBvc2l0aW9ucy5lbmQudG9IYnNQb3MoKTtcblxuICAgICAgaWYgKHN0YXJ0ID09PSBudWxsIHx8IGVuZCA9PT0gbnVsbCkge1xuICAgICAgICBsb2NQb3NTcGFuID0gdGhpcy5fbG9jUG9zU3BhbiA9IEJST0tFTjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvY1Bvc1NwYW4gPSB0aGlzLl9sb2NQb3NTcGFuID0gbmV3IEhic1NwYW4odGhpcy5zb3VyY2UsIHtcbiAgICAgICAgICBzdGFydCxcbiAgICAgICAgICBlbmQsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsb2NQb3NTcGFuID09PSBCUk9LRU4gPyBudWxsIDogbG9jUG9zU3BhbjtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkU291cmNlU3BhbiB7XG4gICAgbGV0IHtcbiAgICAgIHN0YXJ0OiB7IGNoYXJQb3M6IHN0YXJ0IH0sXG4gICAgICBlbmQ6IHsgY2hhclBvczogZW5kIH0sXG4gICAgfSA9IHRoaXMuY2hhclBvc2l0aW9ucztcblxuICAgIGlmIChzdGFydCA9PT0gZW5kKSB7XG4gICAgICByZXR1cm4gc3RhcnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbc3RhcnQsIGVuZF07XG4gICAgfVxuICB9XG5cbiAgdG9DaGFyUG9zU3BhbigpOiBDaGFyUG9zaXRpb25TcGFuIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSGJzU3BhbiBpbXBsZW1lbnRzIFNwYW5EYXRhIHtcbiAgcmVhZG9ubHkga2luZCA9IE9mZnNldEtpbmQuSGJzUG9zaXRpb247XG5cbiAgX2NoYXJQb3NTcGFuOiBDaGFyUG9zaXRpb25TcGFuIHwgQlJPS0VOIHwgbnVsbCA9IG51bGw7XG5cbiAgLy8gdGhlIHNvdXJjZSBsb2NhdGlvbiBmcm9tIEhhbmRsZWJhcnMgKyBBU1QgUGx1Z2lucyAtLSBjb3VsZCBiZSB3cm9uZ1xuICBfcHJvdmlkZWRIYnNMb2M6IFNvdXJjZUxvY2F0aW9uIHwgbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBzb3VyY2U6IFNvdXJjZSxcbiAgICByZWFkb25seSBoYnNQb3NpdGlvbnM6IHsgc3RhcnQ6IEhic1Bvc2l0aW9uOyBlbmQ6IEhic1Bvc2l0aW9uIH0sXG4gICAgcHJvdmlkZWRIYnNMb2M6IFNvdXJjZUxvY2F0aW9uIHwgbnVsbCA9IG51bGxcbiAgKSB7XG4gICAgdGhpcy5fcHJvdmlkZWRIYnNMb2MgPSBwcm92aWRlZEhic0xvYztcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkQ29uY3JldGVTb3VyY2VTcGFuIHtcbiAgICBsZXQgY2hhclBvcyA9IHRoaXMudG9DaGFyUG9zU3BhbigpO1xuICAgIHJldHVybiBjaGFyUG9zID09PSBudWxsID8gT2Zmc2V0S2luZC5Ccm9rZW4gOiBjaGFyUG9zLndyYXAoKS5zZXJpYWxpemUoKTtcbiAgfVxuXG4gIHdyYXAoKTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIG5ldyBTb3VyY2VTcGFuKHRoaXMpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVQcm92aWRlZChwb3M6IFNvdXJjZVBvc2l0aW9uLCBlZGdlOiAnc3RhcnQnIHwgJ2VuZCcpIHtcbiAgICBpZiAodGhpcy5fcHJvdmlkZWRIYnNMb2MpIHtcbiAgICAgIHRoaXMuX3Byb3ZpZGVkSGJzTG9jW2VkZ2VdID0gcG9zO1xuICAgIH1cblxuICAgIC8vIGludmFsaWRhdGUgY29tcHV0ZWQgY2hhcmFjdGVyIG9mZnNldHNcbiAgICB0aGlzLl9jaGFyUG9zU3BhbiA9IG51bGw7XG4gICAgdGhpcy5fcHJvdmlkZWRIYnNMb2MgPSB7XG4gICAgICBzdGFydDogcG9zLFxuICAgICAgZW5kOiBwb3MsXG4gICAgfTtcbiAgfVxuXG4gIGxvY0RpZFVwZGF0ZSh7IHN0YXJ0LCBlbmQgfTogeyBzdGFydD86IFNvdXJjZVBvc2l0aW9uOyBlbmQ/OiBTb3VyY2VQb3NpdGlvbiB9KTogdm9pZCB7XG4gICAgaWYgKHN0YXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMudXBkYXRlUHJvdmlkZWQoc3RhcnQsICdzdGFydCcpO1xuICAgICAgdGhpcy5oYnNQb3NpdGlvbnMuc3RhcnQgPSBuZXcgSGJzUG9zaXRpb24odGhpcy5zb3VyY2UsIHN0YXJ0LCBudWxsKTtcbiAgICB9XG5cbiAgICBpZiAoZW5kICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMudXBkYXRlUHJvdmlkZWQoZW5kLCAnZW5kJyk7XG4gICAgICB0aGlzLmhic1Bvc2l0aW9ucy5lbmQgPSBuZXcgSGJzUG9zaXRpb24odGhpcy5zb3VyY2UsIGVuZCwgbnVsbCk7XG4gICAgfVxuICB9XG5cbiAgYXNTdHJpbmcoKTogc3RyaW5nIHtcbiAgICBsZXQgc3BhbiA9IHRoaXMudG9DaGFyUG9zU3BhbigpO1xuICAgIHJldHVybiBzcGFuID09PSBudWxsID8gJycgOiBzcGFuLmFzU3RyaW5nKCk7XG4gIH1cblxuICBnZXRNb2R1bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2UubW9kdWxlO1xuICB9XG5cbiAgZ2V0U3RhcnQoKTogQW55UG9zaXRpb24ge1xuICAgIHJldHVybiB0aGlzLmhic1Bvc2l0aW9ucy5zdGFydDtcbiAgfVxuXG4gIGdldEVuZCgpOiBBbnlQb3NpdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuaGJzUG9zaXRpb25zLmVuZDtcbiAgfVxuXG4gIHRvSGJzTG9jKCk6IFNvdXJjZUxvY2F0aW9uIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhcnQ6IHRoaXMuaGJzUG9zaXRpb25zLnN0YXJ0Lmhic1BvcyxcbiAgICAgIGVuZDogdGhpcy5oYnNQb3NpdGlvbnMuZW5kLmhic1BvcyxcbiAgICB9O1xuICB9XG5cbiAgdG9IYnNTcGFuKCk6IEhic1NwYW4ge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdG9DaGFyUG9zU3BhbigpOiBDaGFyUG9zaXRpb25TcGFuIHwgbnVsbCB7XG4gICAgbGV0IGNoYXJQb3NTcGFuID0gdGhpcy5fY2hhclBvc1NwYW47XG5cbiAgICBpZiAoY2hhclBvc1NwYW4gPT09IG51bGwpIHtcbiAgICAgIGxldCBzdGFydCA9IHRoaXMuaGJzUG9zaXRpb25zLnN0YXJ0LnRvQ2hhclBvcygpO1xuICAgICAgbGV0IGVuZCA9IHRoaXMuaGJzUG9zaXRpb25zLmVuZC50b0NoYXJQb3MoKTtcblxuICAgICAgaWYgKHN0YXJ0ICYmIGVuZCkge1xuICAgICAgICBjaGFyUG9zU3BhbiA9IHRoaXMuX2NoYXJQb3NTcGFuID0gbmV3IENoYXJQb3NpdGlvblNwYW4odGhpcy5zb3VyY2UsIHtcbiAgICAgICAgICBzdGFydCxcbiAgICAgICAgICBlbmQsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hhclBvc1NwYW4gPSB0aGlzLl9jaGFyUG9zU3BhbiA9IEJST0tFTjtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYXJQb3NTcGFuID09PSBCUk9LRU4gPyBudWxsIDogY2hhclBvc1NwYW47XG4gIH1cbn1cblxuY2xhc3MgSW52aXNpYmxlU3BhbiBpbXBsZW1lbnRzIFNwYW5EYXRhIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkga2luZDogT2Zmc2V0S2luZC5Ccm9rZW4gfCBPZmZzZXRLaW5kLkludGVybmFsc1N5bnRoZXRpYyB8IE9mZnNldEtpbmQuTm9uRXhpc3RlbnQsXG4gICAgLy8gd2hhdGV2ZXIgd2FzIHByb3ZpZGVkLCBwb3NzaWJseSBicm9rZW5cbiAgICByZWFkb25seSBsb2M6IFNvdXJjZUxvY2F0aW9uLFxuICAgIC8vIGlmIHRoZSBzcGFuIHJlcHJlc2VudHMgYSBzeW50aGV0aWMgc3RyaW5nXG4gICAgcmVhZG9ubHkgc3RyaW5nOiBzdHJpbmcgfCBudWxsID0gbnVsbFxuICApIHt9XG5cbiAgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRDb25jcmV0ZVNvdXJjZVNwYW4ge1xuICAgIHN3aXRjaCAodGhpcy5raW5kKSB7XG4gICAgICBjYXNlIE9mZnNldEtpbmQuQnJva2VuOlxuICAgICAgY2FzZSBPZmZzZXRLaW5kLk5vbkV4aXN0ZW50OlxuICAgICAgICByZXR1cm4gdGhpcy5raW5kO1xuICAgICAgY2FzZSBPZmZzZXRLaW5kLkludGVybmFsc1N5bnRoZXRpYzpcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RyaW5nIHx8ICcnO1xuICAgIH1cbiAgfVxuXG4gIHdyYXAoKTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIG5ldyBTb3VyY2VTcGFuKHRoaXMpO1xuICB9XG5cbiAgYXNTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5zdHJpbmcgfHwgJyc7XG4gIH1cblxuICBsb2NEaWRVcGRhdGUoeyBzdGFydCwgZW5kIH06IHsgc3RhcnQ/OiBTb3VyY2VQb3NpdGlvbjsgZW5kPzogU291cmNlUG9zaXRpb24gfSkge1xuICAgIGlmIChzdGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmxvYy5zdGFydCA9IHN0YXJ0O1xuICAgIH1cblxuICAgIGlmIChlbmQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5sb2MuZW5kID0gZW5kO1xuICAgIH1cbiAgfVxuXG4gIGdldE1vZHVsZSgpOiBzdHJpbmcge1xuICAgIC8vIFRPRE86IE1ha2UgdGhpcyByZWZsZWN0IHRoZSBhY3R1YWwgbW9kdWxlIHRoaXMgc3BhbiBvcmlnaW5hdGVkIGZyb21cbiAgICByZXR1cm4gJ2FuIHVua25vd24gbW9kdWxlJztcbiAgfVxuXG4gIGdldFN0YXJ0KCk6IEFueVBvc2l0aW9uIHtcbiAgICByZXR1cm4gbmV3IEludmlzaWJsZVBvc2l0aW9uKHRoaXMua2luZCwgdGhpcy5sb2Muc3RhcnQpO1xuICB9XG5cbiAgZ2V0RW5kKCk6IEFueVBvc2l0aW9uIHtcbiAgICByZXR1cm4gbmV3IEludmlzaWJsZVBvc2l0aW9uKHRoaXMua2luZCwgdGhpcy5sb2MuZW5kKTtcbiAgfVxuXG4gIHRvQ2hhclBvc1NwYW4oKTogSW52aXNpYmxlU3BhbiB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0b0hic1NwYW4oKTogbnVsbCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB0b0hic0xvYygpOiBTb3VyY2VMb2NhdGlvbiB7XG4gICAgcmV0dXJuIEJST0tFTl9MT0NBVElPTjtcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgc3BhbjogTWF0Y2hGbjxTb3VyY2VTcGFuPiA9IG1hdGNoKChtKSA9PlxuICBtXG4gICAgLndoZW4oT2Zmc2V0S2luZC5IYnNQb3NpdGlvbiwgT2Zmc2V0S2luZC5IYnNQb3NpdGlvbiwgKGxlZnQsIHJpZ2h0KSA9PlxuICAgICAgbmV3IEhic1NwYW4obGVmdC5zb3VyY2UsIHtcbiAgICAgICAgc3RhcnQ6IGxlZnQsXG4gICAgICAgIGVuZDogcmlnaHQsXG4gICAgICB9KS53cmFwKClcbiAgICApXG4gICAgLndoZW4oT2Zmc2V0S2luZC5DaGFyUG9zaXRpb24sIE9mZnNldEtpbmQuQ2hhclBvc2l0aW9uLCAobGVmdCwgcmlnaHQpID0+XG4gICAgICBuZXcgQ2hhclBvc2l0aW9uU3BhbihsZWZ0LnNvdXJjZSwge1xuICAgICAgICBzdGFydDogbGVmdCxcbiAgICAgICAgZW5kOiByaWdodCxcbiAgICAgIH0pLndyYXAoKVxuICAgIClcbiAgICAud2hlbihPZmZzZXRLaW5kLkNoYXJQb3NpdGlvbiwgT2Zmc2V0S2luZC5IYnNQb3NpdGlvbiwgKGxlZnQsIHJpZ2h0KSA9PiB7XG4gICAgICBsZXQgcmlnaHRDaGFyUG9zID0gcmlnaHQudG9DaGFyUG9zKCk7XG5cbiAgICAgIGlmIChyaWdodENoYXJQb3MgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBJbnZpc2libGVTcGFuKE9mZnNldEtpbmQuQnJva2VuLCBCUk9LRU5fTE9DQVRJT04pLndyYXAoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzcGFuKGxlZnQsIHJpZ2h0Q2hhclBvcyk7XG4gICAgICB9XG4gICAgfSlcbiAgICAud2hlbihPZmZzZXRLaW5kLkhic1Bvc2l0aW9uLCBPZmZzZXRLaW5kLkNoYXJQb3NpdGlvbiwgKGxlZnQsIHJpZ2h0KSA9PiB7XG4gICAgICBsZXQgbGVmdENoYXJQb3MgPSBsZWZ0LnRvQ2hhclBvcygpO1xuXG4gICAgICBpZiAobGVmdENoYXJQb3MgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBJbnZpc2libGVTcGFuKE9mZnNldEtpbmQuQnJva2VuLCBCUk9LRU5fTE9DQVRJT04pLndyYXAoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzcGFuKGxlZnRDaGFyUG9zLCByaWdodCk7XG4gICAgICB9XG4gICAgfSlcbiAgICAud2hlbihJc0ludmlzaWJsZSwgTWF0Y2hBbnksIChsZWZ0KSA9PiBuZXcgSW52aXNpYmxlU3BhbihsZWZ0LmtpbmQsIEJST0tFTl9MT0NBVElPTikud3JhcCgpKVxuICAgIC53aGVuKE1hdGNoQW55LCBJc0ludmlzaWJsZSwgKF8sIHJpZ2h0KSA9PlxuICAgICAgbmV3IEludmlzaWJsZVNwYW4ocmlnaHQua2luZCwgQlJPS0VOX0xPQ0FUSU9OKS53cmFwKClcbiAgICApXG4pO1xuXG5leHBvcnQgdHlwZSBTZXJpYWxpemVkQ29uY3JldGVTb3VyY2VTcGFuID1cbiAgfCAvKiogY29sbGFwc2VkICovIG51bWJlclxuICB8IC8qKiBub3JtYWwgKi8gW3N0YXJ0OiBudW1iZXIsIHNpemU6IG51bWJlcl1cbiAgfCAvKiogc3ludGhldGljICovIHN0cmluZztcblxuZXhwb3J0IHR5cGUgU2VyaWFsaXplZFNvdXJjZVNwYW4gPVxuICB8IFNlcmlhbGl6ZWRDb25jcmV0ZVNvdXJjZVNwYW5cbiAgfCBPZmZzZXRLaW5kLk5vbkV4aXN0ZW50XG4gIHwgT2Zmc2V0S2luZC5Ccm9rZW47XG4iXSwic291cmNlUm9vdCI6IiJ9