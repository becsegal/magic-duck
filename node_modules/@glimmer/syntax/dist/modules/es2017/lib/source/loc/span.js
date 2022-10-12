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

export class SourceSpan {
  constructor(data) {
    this.data = data;
    this.isInvisible = data.kind !== "CharPosition"
    /* CharPosition */
    && data.kind !== "HbsPosition"
    /* HbsPosition */
    ;
  }

  static get NON_EXISTENT() {
    return new InvisibleSpan("NonExistent"
    /* NonExistent */
    , NON_EXISTENT_LOCATION).wrap();
  }

  static load(source, serialized) {
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
  }

  static forHbsLoc(source, loc) {
    let start = new HbsPosition(source, loc.start);
    let end = new HbsPosition(source, loc.end);
    return new HbsSpan(source, {
      start,
      end
    }, loc).wrap();
  }

  static forCharPositions(source, startPos, endPos) {
    let start = new CharPosition(source, startPos);
    let end = new CharPosition(source, endPos);
    return new CharPositionSpan(source, {
      start,
      end
    }).wrap();
  }

  static synthetic(chars) {
    return new InvisibleSpan("InternalsSynthetic"
    /* InternalsSynthetic */
    , NON_EXISTENT_LOCATION, chars).wrap();
  }

  static broken(pos = BROKEN_LOCATION) {
    return new InvisibleSpan("Broken"
    /* Broken */
    , pos).wrap();
  }

  getStart() {
    return this.data.getStart().wrap();
  }

  getEnd() {
    return this.data.getEnd().wrap();
  }

  get loc() {
    let span = this.data.toHbsSpan();
    return span === null ? BROKEN_LOCATION : span.toHbsLoc();
  }

  get module() {
    return this.data.getModule();
  }
  /**
   * Get the starting `SourcePosition` for this `SourceSpan`, lazily computing it if needed.
   */


  get startPosition() {
    return this.loc.start;
  }
  /**
   * Get the ending `SourcePosition` for this `SourceSpan`, lazily computing it if needed.
   */


  get endPosition() {
    return this.loc.end;
  }
  /**
   * Support converting ASTv1 nodes into a serialized format using JSON.stringify.
   */


  toJSON() {
    return this.loc;
  }
  /**
   * Create a new span with the current span's end and a new beginning.
   */


  withStart(other) {
    return span(other.data, this.data.getEnd());
  }
  /**
   * Create a new span with the current span's beginning and a new ending.
   */


  withEnd(other) {
    return span(this.data.getStart(), other.data);
  }

  asString() {
    return this.data.asString();
  }
  /**
   * Convert this `SourceSpan` into a `SourceSlice`. In debug mode, this method optionally checks
   * that the byte offsets represented by this `SourceSpan` actually correspond to the expected
   * string.
   */


  toSlice(expected) {
    let chars = this.data.asString();

    if (DEBUG) {
      if (expected !== undefined && chars !== expected) {
        // eslint-disable-next-line no-console
        console.warn(`unexpectedly found ${JSON.stringify(chars)} when slicing source, but expected ${JSON.stringify(expected)}`);
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


  get start() {
    return this.loc.start;
  }
  /**
   * For compatibility with SourceLocation in AST plugins
   *
   * @deprecated use withStart instead
   */


  set start(position) {
    this.data.locDidUpdate({
      start: position
    });
  }
  /**
   * For compatibility with SourceLocation in AST plugins
   *
   * @deprecated use endPosition instead
   */


  get end() {
    return this.loc.end;
  }
  /**
   * For compatibility with SourceLocation in AST plugins
   *
   * @deprecated use withEnd instead
   */


  set end(position) {
    this.data.locDidUpdate({
      end: position
    });
  }
  /**
   * For compatibility with SourceLocation in AST plugins
   *
   * @deprecated use module instead
   */


  get source() {
    return this.module;
  }

  collapse(where) {
    switch (where) {
      case 'start':
        return this.getStart().collapsed();

      case 'end':
        return this.getEnd().collapsed();
    }
  }

  extend(other) {
    return span(this.data.getStart(), other.data.getEnd());
  }

  serialize() {
    return this.data.serialize();
  }

  slice({
    skipStart = 0,
    skipEnd = 0
  }) {
    return span(this.getStart().move(skipStart).data, this.getEnd().move(-skipEnd).data);
  }

  sliceStartChars({
    skipStart = 0,
    chars
  }) {
    return span(this.getStart().move(skipStart).data, this.getStart().move(skipStart + chars).data);
  }

  sliceEndChars({
    skipEnd = 0,
    chars
  }) {
    return span(this.getEnd().move(skipEnd - chars).data, this.getStart().move(-skipEnd).data);
  }

}

class CharPositionSpan {
  constructor(source, charPositions) {
    this.source = source;
    this.charPositions = charPositions;
    this.kind = "CharPosition"
    /* CharPosition */
    ;
    this._locPosSpan = null;
  }

  wrap() {
    return new SourceSpan(this);
  }

  asString() {
    return this.source.slice(this.charPositions.start.charPos, this.charPositions.end.charPos);
  }

  getModule() {
    return this.source.module;
  }

  getStart() {
    return this.charPositions.start;
  }

  getEnd() {
    return this.charPositions.end;
  }

  locDidUpdate() {
    if (false
    /* LOCAL_DEBUG */
    ) {
      // eslint-disable-next-line no-console
      console.warn(`updating a location that came from a CharPosition span doesn't work reliably. Don't try to update locations after the plugin phase`);
    }
  }

  toHbsSpan() {
    let locPosSpan = this._locPosSpan;

    if (locPosSpan === null) {
      let start = this.charPositions.start.toHbsPos();
      let end = this.charPositions.end.toHbsPos();

      if (start === null || end === null) {
        locPosSpan = this._locPosSpan = BROKEN;
      } else {
        locPosSpan = this._locPosSpan = new HbsSpan(this.source, {
          start,
          end
        });
      }
    }

    return locPosSpan === BROKEN ? null : locPosSpan;
  }

  serialize() {
    let {
      start: {
        charPos: start
      },
      end: {
        charPos: end
      }
    } = this.charPositions;

    if (start === end) {
      return start;
    } else {
      return [start, end];
    }
  }

  toCharPosSpan() {
    return this;
  }

}

export class HbsSpan {
  constructor(source, hbsPositions, providedHbsLoc = null) {
    this.source = source;
    this.hbsPositions = hbsPositions;
    this.kind = "HbsPosition"
    /* HbsPosition */
    ;
    this._charPosSpan = null;
    this._providedHbsLoc = providedHbsLoc;
  }

  serialize() {
    let charPos = this.toCharPosSpan();
    return charPos === null ? "Broken"
    /* Broken */
    : charPos.wrap().serialize();
  }

  wrap() {
    return new SourceSpan(this);
  }

  updateProvided(pos, edge) {
    if (this._providedHbsLoc) {
      this._providedHbsLoc[edge] = pos;
    } // invalidate computed character offsets


    this._charPosSpan = null;
    this._providedHbsLoc = {
      start: pos,
      end: pos
    };
  }

  locDidUpdate({
    start,
    end
  }) {
    if (start !== undefined) {
      this.updateProvided(start, 'start');
      this.hbsPositions.start = new HbsPosition(this.source, start, null);
    }

    if (end !== undefined) {
      this.updateProvided(end, 'end');
      this.hbsPositions.end = new HbsPosition(this.source, end, null);
    }
  }

  asString() {
    let span = this.toCharPosSpan();
    return span === null ? '' : span.asString();
  }

  getModule() {
    return this.source.module;
  }

  getStart() {
    return this.hbsPositions.start;
  }

  getEnd() {
    return this.hbsPositions.end;
  }

  toHbsLoc() {
    return {
      start: this.hbsPositions.start.hbsPos,
      end: this.hbsPositions.end.hbsPos
    };
  }

  toHbsSpan() {
    return this;
  }

  toCharPosSpan() {
    let charPosSpan = this._charPosSpan;

    if (charPosSpan === null) {
      let start = this.hbsPositions.start.toCharPos();
      let end = this.hbsPositions.end.toCharPos();

      if (start && end) {
        charPosSpan = this._charPosSpan = new CharPositionSpan(this.source, {
          start,
          end
        });
      } else {
        charPosSpan = this._charPosSpan = BROKEN;
        return null;
      }
    }

    return charPosSpan === BROKEN ? null : charPosSpan;
  }

}

class InvisibleSpan {
  constructor(kind, // whatever was provided, possibly broken
  loc, // if the span represents a synthetic string
  string = null) {
    this.kind = kind;
    this.loc = loc;
    this.string = string;
  }

  serialize() {
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
  }

  wrap() {
    return new SourceSpan(this);
  }

  asString() {
    return this.string || '';
  }

  locDidUpdate({
    start,
    end
  }) {
    if (start !== undefined) {
      this.loc.start = start;
    }

    if (end !== undefined) {
      this.loc.end = end;
    }
  }

  getModule() {
    // TODO: Make this reflect the actual module this span originated from
    return 'an unknown module';
  }

  getStart() {
    return new InvisiblePosition(this.kind, this.loc.start);
  }

  getEnd() {
    return new InvisiblePosition(this.kind, this.loc.end);
  }

  toCharPosSpan() {
    return this;
  }

  toHbsSpan() {
    return null;
  }

  toHbsLoc() {
    return BROKEN_LOCATION;
  }

}

export const span = match(m => m.when("HbsPosition"
/* HbsPosition */
, "HbsPosition"
/* HbsPosition */
, (left, right) => new HbsSpan(left.source, {
  start: left,
  end: right
}).wrap()).when("CharPosition"
/* CharPosition */
, "CharPosition"
/* CharPosition */
, (left, right) => new CharPositionSpan(left.source, {
  start: left,
  end: right
}).wrap()).when("CharPosition"
/* CharPosition */
, "HbsPosition"
/* HbsPosition */
, (left, right) => {
  let rightCharPos = right.toCharPos();

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
, (left, right) => {
  let leftCharPos = left.toCharPos();

  if (leftCharPos === null) {
    return new InvisibleSpan("Broken"
    /* Broken */
    , BROKEN_LOCATION).wrap();
  } else {
    return span(leftCharPos, right);
  }
}).when(IsInvisible, MatchAny, left => new InvisibleSpan(left.kind, BROKEN_LOCATION).wrap()).when(MatchAny, IsInvisible, (_, right) => new InvisibleSpan(right.kind, BROKEN_LOCATION).wrap()));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvc291cmNlL2xvYy9zcGFuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0EsU0FBUyxLQUFULFFBQXNCLGNBQXRCO0FBRUEsU0FBUyxXQUFULFFBQTRCLGVBQTVCO0FBRUEsU0FDRSxlQURGLEVBRUUscUJBRkYsUUFLTyxhQUxQO0FBTUEsU0FBUyxXQUFULFFBQTRCLFVBQTVCO0FBRUEsU0FBUyxXQUFULEVBQXNCLEtBQXRCLEVBQTZCLFFBQTdCLFFBQXNELFNBQXREO0FBQ0EsU0FFRSxNQUZGLEVBR0UsWUFIRixFQUlFLFdBSkYsRUFLRSxpQkFMRixRQVFPLFVBUlA7QUF5REE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0NBLE9BQU0sTUFBTyxVQUFQLENBQWlCO0FBNENyQixFQUFBLFdBQUEsQ0FBb0IsSUFBcEIsRUFBNEM7QUFBeEIsU0FBQSxJQUFBLEdBQUEsSUFBQTtBQUNsQixTQUFLLFdBQUwsR0FDRSxJQUFJLENBQUMsSUFBTCxLQUFTO0FBQUE7QUFBVCxPQUF5QyxJQUFJLENBQUMsSUFBTCxLQUFTO0FBQUE7QUFEcEQ7QUFFRDs7QUE5Q0QsYUFBVyxZQUFYLEdBQXVCO0FBQ3JCLFdBQU8sSUFBSSxhQUFKLENBQWlCO0FBQUE7QUFBakIsTUFBMEMscUJBQTFDLEVBQWlFLElBQWpFLEVBQVA7QUFDRDs7QUFFRCxTQUFPLElBQVAsQ0FBWSxNQUFaLEVBQTRCLFVBQTVCLEVBQTREO0FBQzFELFFBQUksT0FBTyxVQUFQLEtBQXNCLFFBQTFCLEVBQW9DO0FBQ2xDLGFBQU8sVUFBVSxDQUFDLGdCQUFYLENBQTRCLE1BQTVCLEVBQW9DLFVBQXBDLEVBQWdELFVBQWhELENBQVA7QUFDRCxLQUZELE1BRU8sSUFBSSxPQUFPLFVBQVAsS0FBc0IsUUFBMUIsRUFBb0M7QUFDekMsYUFBTyxVQUFVLENBQUMsU0FBWCxDQUFxQixVQUFyQixD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R0FGRCxNQUVPO0FBQ0wsV0FBTyxJQUFJLENBQUMsSUFBRCxFQUFPLFlBQVAsQ0FBWDtBQUNEO0FBQ0YsQ0FyQkgsRUFzQkcsSUF0QkgsQ0FzQk87QUFBQTtBQXRCUCxFQXNCTztBQUFBO0FBdEJQLEVBc0J5RCxDQUFDLElBQUQsRUFBTyxLQUFQLEtBQWdCO0FBQ3JFLE1BQUksV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFMLEVBQWxCOztBQUVBLE1BQUksV0FBVyxLQUFLLElBQXBCLEVBQTBCO0FBQ3hCLFdBQU8sSUFBSSxhQUFKLENBQWlCO0FBQUE7QUFBakIsTUFBcUMsZUFBckMsRUFBc0QsSUFBdEQsRUFBUDtBQUNELEdBRkQsTUFFTztBQUNMLFdBQU8sSUFBSSxDQUFDLFdBQUQsRUFBYyxLQUFkLENBQVg7QUFDRDtBQUNGLENBOUJILEVBK0JHLElBL0JILENBK0JRLFdBL0JSLEVBK0JxQixRQS9CckIsRUErQmdDLElBQUQsSUFBVSxJQUFJLGFBQUosQ0FBa0IsSUFBSSxDQUFDLElBQXZCLEVBQTZCLGVBQTdCLEVBQThDLElBQTlDLEVBL0J6QyxFQWdDRyxJQWhDSCxDQWdDUSxRQWhDUixFQWdDa0IsV0FoQ2xCLEVBZ0MrQixDQUFDLENBQUQsRUFBSSxLQUFKLEtBQzNCLElBQUksYUFBSixDQUFrQixLQUFLLENBQUMsSUFBeEIsRUFBOEIsZUFBOUIsRUFBK0MsSUFBL0MsRUFqQ0osQ0FENEMsQ0FBdkMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzXG5pbXBvcnQgeyBERUJVRyB9IGZyb20gJ0BnbGltbWVyL2Vudic7XG5pbXBvcnQgeyBMT0NBTF9ERUJVRyB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcbmltcG9ydCB7IGFzc2VydE5ldmVyIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5cbmltcG9ydCB7XG4gIEJST0tFTl9MT0NBVElPTixcbiAgTk9OX0VYSVNURU5UX0xPQ0FUSU9OLFxuICBTb3VyY2VMb2NhdGlvbixcbiAgU291cmNlUG9zaXRpb24sXG59IGZyb20gJy4uL2xvY2F0aW9uJztcbmltcG9ydCB7IFNvdXJjZVNsaWNlIH0gZnJvbSAnLi4vc2xpY2UnO1xuaW1wb3J0IHsgU291cmNlIH0gZnJvbSAnLi4vc291cmNlJztcbmltcG9ydCB7IElzSW52aXNpYmxlLCBtYXRjaCwgTWF0Y2hBbnksIE1hdGNoRm4gfSBmcm9tICcuL21hdGNoJztcbmltcG9ydCB7XG4gIEFueVBvc2l0aW9uLFxuICBCUk9LRU4sXG4gIENoYXJQb3NpdGlvbixcbiAgSGJzUG9zaXRpb24sXG4gIEludmlzaWJsZVBvc2l0aW9uLFxuICBPZmZzZXRLaW5kLFxuICBTb3VyY2VPZmZzZXQsXG59IGZyb20gJy4vb2Zmc2V0JztcblxuLyoqXG4gKiBBbGwgc3BhbnMgaGF2ZSB0aGVzZSBkZXRhaWxzIGluIGNvbW1vbi5cbiAqL1xuaW50ZXJmYWNlIFNwYW5EYXRhIHtcbiAgcmVhZG9ubHkga2luZDogT2Zmc2V0S2luZDtcblxuICAvKipcbiAgICogQ29udmVydCB0aGlzIHNwYW4gaW50byBhIHN0cmluZy4gSWYgdGhlIHNwYW4gaXMgYnJva2VuLCByZXR1cm4gYCcnYC5cbiAgICovXG4gIGFzU3RyaW5nKCk6IHN0cmluZztcblxuICAvKipcbiAgICogR2V0cyB0aGUgbW9kdWxlIHRoZSBzcGFuIHdhcyBsb2NhdGVkIGluLlxuICAgKi9cbiAgZ2V0TW9kdWxlKCk6IHN0cmluZztcblxuICAvKipcbiAgICogR2V0IHRoZSBzdGFydGluZyBwb3NpdGlvbiBmb3IgdGhpcyBzcGFuLiBUcnkgdG8gYXZvaWQgY3JlYXRpbmcgbmV3IHBvc2l0aW9uIG9iamVjdHMsIGFzIHRoZXlcbiAgICogY2FjaGUgY29tcHV0YXRpb25zLlxuICAgKi9cbiAgZ2V0U3RhcnQoKTogQW55UG9zaXRpb247XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZW5kaW5nIHBvc2l0aW9uIGZvciB0aGlzIHNwYW4uIFRyeSB0byBhdm9pZCBjcmVhdGluZyBuZXcgcG9zaXRpb24gb2JqZWN0cywgYXMgdGhleVxuICAgKiBjYWNoZSBjb21wdXRhdGlvbnMuXG4gICAqL1xuICBnZXRFbmQoKTogQW55UG9zaXRpb247XG5cbiAgLyoqXG4gICAqIENvbXB1dGUgdGhlIGBTb3VyY2VMb2NhdGlvbmAgZm9yIHRoaXMgc3BhbiwgcmV0dXJuZWQgYXMgYW4gaW5zdGFuY2Ugb2YgYEhic1NwYW5gLlxuICAgKi9cbiAgdG9IYnNTcGFuKCk6IEhic1NwYW4gfCBudWxsO1xuXG4gIC8qKlxuICAgKiBGb3IgY29tcGF0aWJpbGl0eSwgd2hlbmV2ZXIgdGhlIGBzdGFydGAgb3IgYGVuZGAgb2YgYSB7QHNlZSBTb3VyY2VPZmZzZXR9IGNoYW5nZXMsIHNwYW5zIGFyZVxuICAgKiBub3RpZmllZCBvZiB0aGUgY2hhbmdlIHNvIHRoZXkgY2FuIHVwZGF0ZSB0aGVtc2VsdmVzLiBUaGlzIHNob3VsZG4ndCBoYXBwZW4gb3V0c2lkZSBvZiBBU1RcbiAgICogcGx1Z2lucy5cbiAgICovXG4gIGxvY0RpZFVwZGF0ZShjaGFuZ2VzOiB7IHN0YXJ0PzogU291cmNlUG9zaXRpb247IGVuZD86IFNvdXJjZVBvc2l0aW9uIH0pOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBTZXJpYWxpemUgaW50byBhIHtAc2VlIFNlcmlhbGl6ZWRTb3VyY2VTcGFufSwgd2hpY2ggaXMgY29tcGFjdCBhbmQgZGVzaWduZWQgZm9yIHJlYWRhYmlsaXR5IGluXG4gICAqIGNvbnRleHQgbGlrZSBBU1QgRXhwbG9yZXIuIElmIHlvdSBuZWVkIGEge0BzZWUgU291cmNlTG9jYXRpb259LCB1c2Uge0BzZWUgdG9KU09OfS5cbiAgICovXG4gIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkU291cmNlU3Bhbjtcbn1cblxuLyoqXG4gKiBBIGBTb3VyY2VTcGFuYCBvYmplY3QgcmVwcmVzZW50cyBhIHNwYW4gb2YgY2hhcmFjdGVycyBpbnNpZGUgb2YgYSB0ZW1wbGF0ZSBzb3VyY2UuXG4gKlxuICogVGhlcmUgYXJlIHRocmVlIGtpbmRzIG9mIGBTb3VyY2VTcGFuYCBvYmplY3RzOlxuICpcbiAqIC0gYENvbmNyZXRlU291cmNlU3BhbmAsIHdoaWNoIGNvbnRhaW5zIGJ5dGUgb2Zmc2V0c1xuICogLSBgTGF6eVNvdXJjZVNwYW5gLCB3aGljaCBjb250YWlucyBgU291cmNlTG9jYXRpb25gcyBmcm9tIHRoZSBIYW5kbGViYXJzIEFTVCwgd2hpY2ggY2FuIGJlXG4gKiAgIGNvbnZlcnRlZCB0byBieXRlIG9mZnNldHMgb24gZGVtYW5kLlxuICogLSBgSW52aXNpYmxlU291cmNlU3BhbmAsIHdoaWNoIHJlcHJlc2VudCBzb3VyY2Ugc3RyaW5ncyB0aGF0IGFyZW4ndCBwcmVzZW50IGluIHRoZSBzb3VyY2UsXG4gKiAgIGJlY2F1c2U6XG4gKiAgICAgLSB0aGV5IHdlcmUgY3JlYXRlZCBzeW50aGV0aWNhbGx5XG4gKiAgICAgLSB0aGVpciBsb2NhdGlvbiBpcyBub25zZW5zaWNhbCAodGhlIHNwYW4gaXMgYnJva2VuKVxuICogICAgIC0gdGhleSByZXByZXNlbnQgbm90aGluZyBpbiB0aGUgc291cmNlICh0aGlzIGN1cnJlbnRseSBoYXBwZW5zIG9ubHkgd2hlbiBhIGJ1ZyBpbiB0aGVcbiAqICAgICAgIHVwc3RyZWFtIEhhbmRsZWJhcnMgcGFyc2VyIGZhaWxzIHRvIGFzc2lnbiBhIGxvY2F0aW9uIHRvIGVtcHR5IGJsb2NrcylcbiAqXG4gKiBBdCBhIGhpZ2ggbGV2ZWwsIGFsbCBgU291cmNlU3BhbmAgb2JqZWN0cyBwcm92aWRlOlxuICpcbiAqIC0gYnl0ZSBvZmZzZXRzXG4gKiAtIHNvdXJjZSBpbiBjb2x1bW4gYW5kIGxpbmUgZm9ybWF0XG4gKlxuICogQW5kIHlvdSBjYW4gZG8gdGhlc2Ugb3BlcmF0aW9ucyBvbiBgU291cmNlU3BhbmBzOlxuICpcbiAqIC0gY29sbGFwc2UgaXQgdG8gYSBgU291cmNlU3BhbmAgcmVwcmVzZW50aW5nIGl0cyBzdGFydGluZyBvciBlbmRpbmcgcG9zaXRpb25cbiAqIC0gc2xpY2Ugb3V0IHNvbWUgY2hhcmFjdGVycywgb3B0aW9uYWxseSBza2lwcGluZyBzb21lIGNoYXJhY3RlcnMgYXQgdGhlIGJlZ2lubmluZyBvciBlbmRcbiAqIC0gY3JlYXRlIGEgbmV3IGBTb3VyY2VTcGFuYCB3aXRoIGEgZGlmZmVyZW50IHN0YXJ0aW5nIG9yIGVuZGluZyBvZmZzZXRcbiAqXG4gKiBBbGwgU291cmNlU3BhbiBvYmplY3RzIGltcGxlbWVudCBgU291cmNlTG9jYXRpb25gLCBmb3IgY29tcGF0aWJpbGl0eS4gQWxsIFNvdXJjZVNwYW5cbiAqIG9iamVjdHMgaGF2ZSBhIGB0b0pTT05gIHRoYXQgZW1pdHMgYFNvdXJjZUxvY2F0aW9uYCwgYWxzbyBmb3IgY29tcGF0aWJpbGl0eS5cbiAqXG4gKiBGb3IgY29tcGF0aWJpbGl0eSwgc3ViY2xhc3NlcyBvZiBgQWJzdHJhY3RTb3VyY2VTcGFuYCBtdXN0IGltcGxlbWVudCBgbG9jRGlkVXBkYXRlYCwgd2hpY2hcbiAqIGhhcHBlbnMgd2hlbiBhbiBBU1QgcGx1Z2luIGF0dGVtcHRzIHRvIG1vZGlmeSB0aGUgYHN0YXJ0YCBvciBgZW5kYCBvZiBhIHNwYW4gZGlyZWN0bHkuXG4gKlxuICogVGhlIGdvYWwgaXMgdG8gYXZvaWQgY3JlYXRpbmcgYW55IHByb2JsZW1zIGZvciB1c2UtY2FzZXMgbGlrZSBBU1QgRXhwbG9yZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBTb3VyY2VTcGFuIGltcGxlbWVudHMgU291cmNlTG9jYXRpb24ge1xuICBzdGF0aWMgZ2V0IE5PTl9FWElTVEVOVCgpOiBTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gbmV3IEludmlzaWJsZVNwYW4oT2Zmc2V0S2luZC5Ob25FeGlzdGVudCwgTk9OX0VYSVNURU5UX0xPQ0FUSU9OKS53cmFwKCk7XG4gIH1cblxuICBzdGF0aWMgbG9hZChzb3VyY2U6IFNvdXJjZSwgc2VyaWFsaXplZDogU2VyaWFsaXplZFNvdXJjZVNwYW4pOiBTb3VyY2VTcGFuIHtcbiAgICBpZiAodHlwZW9mIHNlcmlhbGl6ZWQgPT09ICdudW1iZXInKSB7XG4gICAgICByZXR1cm4gU291cmNlU3Bhbi5mb3JDaGFyUG9zaXRpb25zKHNvdXJjZSwgc2VyaWFsaXplZCwgc2VyaWFsaXplZCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VyaWFsaXplZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBTb3VyY2VTcGFuLnN5bnRoZXRpYyhzZXJpYWxpemVkKTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoc2VyaWFsaXplZCkpIHtcbiAgICAgIHJldHVybiBTb3VyY2VTcGFuLmZvckNoYXJQb3NpdGlvbnMoc291cmNlLCBzZXJpYWxpemVkWzBdLCBzZXJpYWxpemVkWzFdKTtcbiAgICB9IGVsc2UgaWYgKHNlcmlhbGl6ZWQgPT09IE9mZnNldEtpbmQuTm9uRXhpc3RlbnQpIHtcbiAgICAgIHJldHVybiBTb3VyY2VTcGFuLk5PTl9FWElTVEVOVDtcbiAgICB9IGVsc2UgaWYgKHNlcmlhbGl6ZWQgPT09IE9mZnNldEtpbmQuQnJva2VuKSB7XG4gICAgICByZXR1cm4gU291cmNlU3Bhbi5icm9rZW4oQlJPS0VOX0xPQ0FUSU9OKTtcbiAgICB9XG5cbiAgICBhc3NlcnROZXZlcihzZXJpYWxpemVkKTtcbiAgfVxuXG4gIHN0YXRpYyBmb3JIYnNMb2Moc291cmNlOiBTb3VyY2UsIGxvYzogU291cmNlTG9jYXRpb24pOiBTb3VyY2VTcGFuIHtcbiAgICBsZXQgc3RhcnQgPSBuZXcgSGJzUG9zaXRpb24oc291cmNlLCBsb2Muc3RhcnQpO1xuICAgIGxldCBlbmQgPSBuZXcgSGJzUG9zaXRpb24oc291cmNlLCBsb2MuZW5kKTtcbiAgICByZXR1cm4gbmV3IEhic1NwYW4oc291cmNlLCB7IHN0YXJ0LCBlbmQgfSwgbG9jKS53cmFwKCk7XG4gIH1cblxuICBzdGF0aWMgZm9yQ2hhclBvc2l0aW9ucyhzb3VyY2U6IFNvdXJjZSwgc3RhcnRQb3M6IG51bWJlciwgZW5kUG9zOiBudW1iZXIpOiBTb3VyY2VTcGFuIHtcbiAgICBsZXQgc3RhcnQgPSBuZXcgQ2hhclBvc2l0aW9uKHNvdXJjZSwgc3RhcnRQb3MpO1xuICAgIGxldCBlbmQgPSBuZXcgQ2hhclBvc2l0aW9uKHNvdXJjZSwgZW5kUG9zKTtcblxuICAgIHJldHVybiBuZXcgQ2hhclBvc2l0aW9uU3Bhbihzb3VyY2UsIHsgc3RhcnQsIGVuZCB9KS53cmFwKCk7XG4gIH1cblxuICBzdGF0aWMgc3ludGhldGljKGNoYXJzOiBzdHJpbmcpOiBTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gbmV3IEludmlzaWJsZVNwYW4oT2Zmc2V0S2luZC5JbnRlcm5hbHNTeW50aGV0aWMsIE5PTl9FWElTVEVOVF9MT0NBVElPTiwgY2hhcnMpLndyYXAoKTtcbiAgfVxuXG4gIHN0YXRpYyBicm9rZW4ocG9zOiBTb3VyY2VMb2NhdGlvbiA9IEJST0tFTl9MT0NBVElPTik6IFNvdXJjZVNwYW4ge1xuICAgIHJldHVybiBuZXcgSW52aXNpYmxlU3BhbihPZmZzZXRLaW5kLkJyb2tlbiwgcG9zKS53cmFwKCk7XG4gIH1cblxuICByZWFkb25seSBpc0ludmlzaWJsZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRhdGE6IFNwYW5EYXRhICYgQW55U3Bhbikge1xuICAgIHRoaXMuaXNJbnZpc2libGUgPVxuICAgICAgZGF0YS5raW5kICE9PSBPZmZzZXRLaW5kLkNoYXJQb3NpdGlvbiAmJiBkYXRhLmtpbmQgIT09IE9mZnNldEtpbmQuSGJzUG9zaXRpb247XG4gIH1cblxuICBnZXRTdGFydCgpOiBTb3VyY2VPZmZzZXQge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZ2V0U3RhcnQoKS53cmFwKCk7XG4gIH1cblxuICBnZXRFbmQoKTogU291cmNlT2Zmc2V0IHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmdldEVuZCgpLndyYXAoKTtcbiAgfVxuXG4gIGdldCBsb2MoKTogU291cmNlTG9jYXRpb24ge1xuICAgIGxldCBzcGFuID0gdGhpcy5kYXRhLnRvSGJzU3BhbigpO1xuICAgIHJldHVybiBzcGFuID09PSBudWxsID8gQlJPS0VOX0xPQ0FUSU9OIDogc3Bhbi50b0hic0xvYygpO1xuICB9XG5cbiAgZ2V0IG1vZHVsZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZ2V0TW9kdWxlKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBzdGFydGluZyBgU291cmNlUG9zaXRpb25gIGZvciB0aGlzIGBTb3VyY2VTcGFuYCwgbGF6aWx5IGNvbXB1dGluZyBpdCBpZiBuZWVkZWQuXG4gICAqL1xuICBnZXQgc3RhcnRQb3NpdGlvbigpOiBTb3VyY2VQb3NpdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMubG9jLnN0YXJ0O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZW5kaW5nIGBTb3VyY2VQb3NpdGlvbmAgZm9yIHRoaXMgYFNvdXJjZVNwYW5gLCBsYXppbHkgY29tcHV0aW5nIGl0IGlmIG5lZWRlZC5cbiAgICovXG4gIGdldCBlbmRQb3NpdGlvbigpOiBTb3VyY2VQb3NpdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMubG9jLmVuZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdXBwb3J0IGNvbnZlcnRpbmcgQVNUdjEgbm9kZXMgaW50byBhIHNlcmlhbGl6ZWQgZm9ybWF0IHVzaW5nIEpTT04uc3RyaW5naWZ5LlxuICAgKi9cbiAgdG9KU09OKCk6IFNvdXJjZUxvY2F0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5sb2M7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IHNwYW4gd2l0aCB0aGUgY3VycmVudCBzcGFuJ3MgZW5kIGFuZCBhIG5ldyBiZWdpbm5pbmcuXG4gICAqL1xuICB3aXRoU3RhcnQob3RoZXI6IFNvdXJjZU9mZnNldCk6IFNvdXJjZVNwYW4ge1xuICAgIHJldHVybiBzcGFuKG90aGVyLmRhdGEsIHRoaXMuZGF0YS5nZXRFbmQoKSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IHNwYW4gd2l0aCB0aGUgY3VycmVudCBzcGFuJ3MgYmVnaW5uaW5nIGFuZCBhIG5ldyBlbmRpbmcuXG4gICAqL1xuICB3aXRoRW5kKHRoaXM6IFNvdXJjZVNwYW4sIG90aGVyOiBTb3VyY2VPZmZzZXQpOiBTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gc3Bhbih0aGlzLmRhdGEuZ2V0U3RhcnQoKSwgb3RoZXIuZGF0YSk7XG4gIH1cblxuICBhc1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmRhdGEuYXNTdHJpbmcoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHRoaXMgYFNvdXJjZVNwYW5gIGludG8gYSBgU291cmNlU2xpY2VgLiBJbiBkZWJ1ZyBtb2RlLCB0aGlzIG1ldGhvZCBvcHRpb25hbGx5IGNoZWNrc1xuICAgKiB0aGF0IHRoZSBieXRlIG9mZnNldHMgcmVwcmVzZW50ZWQgYnkgdGhpcyBgU291cmNlU3BhbmAgYWN0dWFsbHkgY29ycmVzcG9uZCB0byB0aGUgZXhwZWN0ZWRcbiAgICogc3RyaW5nLlxuICAgKi9cbiAgdG9TbGljZShleHBlY3RlZD86IHN0cmluZyk6IFNvdXJjZVNsaWNlIHtcbiAgICBsZXQgY2hhcnMgPSB0aGlzLmRhdGEuYXNTdHJpbmcoKTtcblxuICAgIGlmIChERUJVRykge1xuICAgICAgaWYgKGV4cGVjdGVkICE9PSB1bmRlZmluZWQgJiYgY2hhcnMgIT09IGV4cGVjdGVkKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBgdW5leHBlY3RlZGx5IGZvdW5kICR7SlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgICBjaGFyc1xuICAgICAgICAgICl9IHdoZW4gc2xpY2luZyBzb3VyY2UsIGJ1dCBleHBlY3RlZCAke0pTT04uc3RyaW5naWZ5KGV4cGVjdGVkKX1gXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBTb3VyY2VTbGljZSh7XG4gICAgICBsb2M6IHRoaXMsXG4gICAgICBjaGFyczogZXhwZWN0ZWQgfHwgY2hhcnMsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRm9yIGNvbXBhdGliaWxpdHkgd2l0aCBTb3VyY2VMb2NhdGlvbiBpbiBBU1QgcGx1Z2luc1xuICAgKlxuICAgKiBAZGVwcmVjYXRlZCB1c2Ugc3RhcnRQb3NpdGlvbiBpbnN0ZWFkXG4gICAqL1xuICBnZXQgc3RhcnQoKTogU291cmNlUG9zaXRpb24ge1xuICAgIHJldHVybiB0aGlzLmxvYy5zdGFydDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgY29tcGF0aWJpbGl0eSB3aXRoIFNvdXJjZUxvY2F0aW9uIGluIEFTVCBwbHVnaW5zXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIHVzZSB3aXRoU3RhcnQgaW5zdGVhZFxuICAgKi9cbiAgc2V0IHN0YXJ0KHBvc2l0aW9uOiBTb3VyY2VQb3NpdGlvbikge1xuICAgIHRoaXMuZGF0YS5sb2NEaWRVcGRhdGUoeyBzdGFydDogcG9zaXRpb24gfSk7XG4gIH1cblxuICAvKipcbiAgICogRm9yIGNvbXBhdGliaWxpdHkgd2l0aCBTb3VyY2VMb2NhdGlvbiBpbiBBU1QgcGx1Z2luc1xuICAgKlxuICAgKiBAZGVwcmVjYXRlZCB1c2UgZW5kUG9zaXRpb24gaW5zdGVhZFxuICAgKi9cbiAgZ2V0IGVuZCgpOiBTb3VyY2VQb3NpdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMubG9jLmVuZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgY29tcGF0aWJpbGl0eSB3aXRoIFNvdXJjZUxvY2F0aW9uIGluIEFTVCBwbHVnaW5zXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIHVzZSB3aXRoRW5kIGluc3RlYWRcbiAgICovXG4gIHNldCBlbmQocG9zaXRpb246IFNvdXJjZVBvc2l0aW9uKSB7XG4gICAgdGhpcy5kYXRhLmxvY0RpZFVwZGF0ZSh7IGVuZDogcG9zaXRpb24gfSk7XG4gIH1cblxuICAvKipcbiAgICogRm9yIGNvbXBhdGliaWxpdHkgd2l0aCBTb3VyY2VMb2NhdGlvbiBpbiBBU1QgcGx1Z2luc1xuICAgKlxuICAgKiBAZGVwcmVjYXRlZCB1c2UgbW9kdWxlIGluc3RlYWRcbiAgICovXG4gIGdldCBzb3VyY2UoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5tb2R1bGU7XG4gIH1cblxuICBjb2xsYXBzZSh3aGVyZTogJ3N0YXJ0JyB8ICdlbmQnKTogU291cmNlU3BhbiB7XG4gICAgc3dpdGNoICh3aGVyZSkge1xuICAgICAgY2FzZSAnc3RhcnQnOlxuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdGFydCgpLmNvbGxhcHNlZCgpO1xuICAgICAgY2FzZSAnZW5kJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RW5kKCkuY29sbGFwc2VkKCk7XG4gICAgfVxuICB9XG5cbiAgZXh0ZW5kKG90aGVyOiBTb3VyY2VTcGFuKTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIHNwYW4odGhpcy5kYXRhLmdldFN0YXJ0KCksIG90aGVyLmRhdGEuZ2V0RW5kKCkpO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLnNlcmlhbGl6ZSgpO1xuICB9XG5cbiAgc2xpY2UoeyBza2lwU3RhcnQgPSAwLCBza2lwRW5kID0gMCB9OiB7IHNraXBTdGFydD86IG51bWJlcjsgc2tpcEVuZD86IG51bWJlciB9KTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIHNwYW4odGhpcy5nZXRTdGFydCgpLm1vdmUoc2tpcFN0YXJ0KS5kYXRhLCB0aGlzLmdldEVuZCgpLm1vdmUoLXNraXBFbmQpLmRhdGEpO1xuICB9XG5cbiAgc2xpY2VTdGFydENoYXJzKHsgc2tpcFN0YXJ0ID0gMCwgY2hhcnMgfTogeyBza2lwU3RhcnQ/OiBudW1iZXI7IGNoYXJzOiBudW1iZXIgfSk6IFNvdXJjZVNwYW4ge1xuICAgIHJldHVybiBzcGFuKHRoaXMuZ2V0U3RhcnQoKS5tb3ZlKHNraXBTdGFydCkuZGF0YSwgdGhpcy5nZXRTdGFydCgpLm1vdmUoc2tpcFN0YXJ0ICsgY2hhcnMpLmRhdGEpO1xuICB9XG5cbiAgc2xpY2VFbmRDaGFycyh7IHNraXBFbmQgPSAwLCBjaGFycyB9OiB7IHNraXBFbmQ/OiBudW1iZXI7IGNoYXJzOiBudW1iZXIgfSk6IFNvdXJjZVNwYW4ge1xuICAgIHJldHVybiBzcGFuKHRoaXMuZ2V0RW5kKCkubW92ZShza2lwRW5kIC0gY2hhcnMpLmRhdGEsIHRoaXMuZ2V0U3RhcnQoKS5tb3ZlKC1za2lwRW5kKS5kYXRhKTtcbiAgfVxufVxuXG50eXBlIEFueVNwYW4gPSBIYnNTcGFuIHwgQ2hhclBvc2l0aW9uU3BhbiB8IEludmlzaWJsZVNwYW47XG5cbmNsYXNzIENoYXJQb3NpdGlvblNwYW4gaW1wbGVtZW50cyBTcGFuRGF0YSB7XG4gIHJlYWRvbmx5IGtpbmQgPSBPZmZzZXRLaW5kLkNoYXJQb3NpdGlvbjtcblxuICBfbG9jUG9zU3BhbjogSGJzU3BhbiB8IEJST0tFTiB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IHNvdXJjZTogU291cmNlLFxuICAgIHJlYWRvbmx5IGNoYXJQb3NpdGlvbnM6IHsgc3RhcnQ6IENoYXJQb3NpdGlvbjsgZW5kOiBDaGFyUG9zaXRpb24gfVxuICApIHt9XG5cbiAgd3JhcCgpOiBTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gbmV3IFNvdXJjZVNwYW4odGhpcyk7XG4gIH1cblxuICBhc1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnNvdXJjZS5zbGljZSh0aGlzLmNoYXJQb3NpdGlvbnMuc3RhcnQuY2hhclBvcywgdGhpcy5jaGFyUG9zaXRpb25zLmVuZC5jaGFyUG9zKTtcbiAgfVxuXG4gIGdldE1vZHVsZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnNvdXJjZS5tb2R1bGU7XG4gIH1cblxuICBnZXRTdGFydCgpOiBBbnlQb3NpdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuY2hhclBvc2l0aW9ucy5zdGFydDtcbiAgfVxuXG4gIGdldEVuZCgpOiBBbnlQb3NpdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuY2hhclBvc2l0aW9ucy5lbmQ7XG4gIH1cblxuICBsb2NEaWRVcGRhdGUoKSB7XG4gICAgaWYgKExPQ0FMX0RFQlVHKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBgdXBkYXRpbmcgYSBsb2NhdGlvbiB0aGF0IGNhbWUgZnJvbSBhIENoYXJQb3NpdGlvbiBzcGFuIGRvZXNuJ3Qgd29yayByZWxpYWJseS4gRG9uJ3QgdHJ5IHRvIHVwZGF0ZSBsb2NhdGlvbnMgYWZ0ZXIgdGhlIHBsdWdpbiBwaGFzZWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgdG9IYnNTcGFuKCk6IEhic1NwYW4gfCBudWxsIHtcbiAgICBsZXQgbG9jUG9zU3BhbiA9IHRoaXMuX2xvY1Bvc1NwYW47XG5cbiAgICBpZiAobG9jUG9zU3BhbiA9PT0gbnVsbCkge1xuICAgICAgbGV0IHN0YXJ0ID0gdGhpcy5jaGFyUG9zaXRpb25zLnN0YXJ0LnRvSGJzUG9zKCk7XG4gICAgICBsZXQgZW5kID0gdGhpcy5jaGFyUG9zaXRpb25zLmVuZC50b0hic1BvcygpO1xuXG4gICAgICBpZiAoc3RhcnQgPT09IG51bGwgfHwgZW5kID09PSBudWxsKSB7XG4gICAgICAgIGxvY1Bvc1NwYW4gPSB0aGlzLl9sb2NQb3NTcGFuID0gQlJPS0VOO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9jUG9zU3BhbiA9IHRoaXMuX2xvY1Bvc1NwYW4gPSBuZXcgSGJzU3Bhbih0aGlzLnNvdXJjZSwge1xuICAgICAgICAgIHN0YXJ0LFxuICAgICAgICAgIGVuZCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxvY1Bvc1NwYW4gPT09IEJST0tFTiA/IG51bGwgOiBsb2NQb3NTcGFuO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRTb3VyY2VTcGFuIHtcbiAgICBsZXQge1xuICAgICAgc3RhcnQ6IHsgY2hhclBvczogc3RhcnQgfSxcbiAgICAgIGVuZDogeyBjaGFyUG9zOiBlbmQgfSxcbiAgICB9ID0gdGhpcy5jaGFyUG9zaXRpb25zO1xuXG4gICAgaWYgKHN0YXJ0ID09PSBlbmQpIHtcbiAgICAgIHJldHVybiBzdGFydDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFtzdGFydCwgZW5kXTtcbiAgICB9XG4gIH1cblxuICB0b0NoYXJQb3NTcGFuKCk6IENoYXJQb3NpdGlvblNwYW4ge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIYnNTcGFuIGltcGxlbWVudHMgU3BhbkRhdGEge1xuICByZWFkb25seSBraW5kID0gT2Zmc2V0S2luZC5IYnNQb3NpdGlvbjtcblxuICBfY2hhclBvc1NwYW46IENoYXJQb3NpdGlvblNwYW4gfCBCUk9LRU4gfCBudWxsID0gbnVsbDtcblxuICAvLyB0aGUgc291cmNlIGxvY2F0aW9uIGZyb20gSGFuZGxlYmFycyArIEFTVCBQbHVnaW5zIC0tIGNvdWxkIGJlIHdyb25nXG4gIF9wcm92aWRlZEhic0xvYzogU291cmNlTG9jYXRpb24gfCBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IHNvdXJjZTogU291cmNlLFxuICAgIHJlYWRvbmx5IGhic1Bvc2l0aW9uczogeyBzdGFydDogSGJzUG9zaXRpb247IGVuZDogSGJzUG9zaXRpb24gfSxcbiAgICBwcm92aWRlZEhic0xvYzogU291cmNlTG9jYXRpb24gfCBudWxsID0gbnVsbFxuICApIHtcbiAgICB0aGlzLl9wcm92aWRlZEhic0xvYyA9IHByb3ZpZGVkSGJzTG9jO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRDb25jcmV0ZVNvdXJjZVNwYW4ge1xuICAgIGxldCBjaGFyUG9zID0gdGhpcy50b0NoYXJQb3NTcGFuKCk7XG4gICAgcmV0dXJuIGNoYXJQb3MgPT09IG51bGwgPyBPZmZzZXRLaW5kLkJyb2tlbiA6IGNoYXJQb3Mud3JhcCgpLnNlcmlhbGl6ZSgpO1xuICB9XG5cbiAgd3JhcCgpOiBTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gbmV3IFNvdXJjZVNwYW4odGhpcyk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZVByb3ZpZGVkKHBvczogU291cmNlUG9zaXRpb24sIGVkZ2U6ICdzdGFydCcgfCAnZW5kJykge1xuICAgIGlmICh0aGlzLl9wcm92aWRlZEhic0xvYykge1xuICAgICAgdGhpcy5fcHJvdmlkZWRIYnNMb2NbZWRnZV0gPSBwb3M7XG4gICAgfVxuXG4gICAgLy8gaW52YWxpZGF0ZSBjb21wdXRlZCBjaGFyYWN0ZXIgb2Zmc2V0c1xuICAgIHRoaXMuX2NoYXJQb3NTcGFuID0gbnVsbDtcbiAgICB0aGlzLl9wcm92aWRlZEhic0xvYyA9IHtcbiAgICAgIHN0YXJ0OiBwb3MsXG4gICAgICBlbmQ6IHBvcyxcbiAgICB9O1xuICB9XG5cbiAgbG9jRGlkVXBkYXRlKHsgc3RhcnQsIGVuZCB9OiB7IHN0YXJ0PzogU291cmNlUG9zaXRpb247IGVuZD86IFNvdXJjZVBvc2l0aW9uIH0pOiB2b2lkIHtcbiAgICBpZiAoc3RhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy51cGRhdGVQcm92aWRlZChzdGFydCwgJ3N0YXJ0Jyk7XG4gICAgICB0aGlzLmhic1Bvc2l0aW9ucy5zdGFydCA9IG5ldyBIYnNQb3NpdGlvbih0aGlzLnNvdXJjZSwgc3RhcnQsIG51bGwpO1xuICAgIH1cblxuICAgIGlmIChlbmQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy51cGRhdGVQcm92aWRlZChlbmQsICdlbmQnKTtcbiAgICAgIHRoaXMuaGJzUG9zaXRpb25zLmVuZCA9IG5ldyBIYnNQb3NpdGlvbih0aGlzLnNvdXJjZSwgZW5kLCBudWxsKTtcbiAgICB9XG4gIH1cblxuICBhc1N0cmluZygpOiBzdHJpbmcge1xuICAgIGxldCBzcGFuID0gdGhpcy50b0NoYXJQb3NTcGFuKCk7XG4gICAgcmV0dXJuIHNwYW4gPT09IG51bGwgPyAnJyA6IHNwYW4uYXNTdHJpbmcoKTtcbiAgfVxuXG4gIGdldE1vZHVsZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnNvdXJjZS5tb2R1bGU7XG4gIH1cblxuICBnZXRTdGFydCgpOiBBbnlQb3NpdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuaGJzUG9zaXRpb25zLnN0YXJ0O1xuICB9XG5cbiAgZ2V0RW5kKCk6IEFueVBvc2l0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5oYnNQb3NpdGlvbnMuZW5kO1xuICB9XG5cbiAgdG9IYnNMb2MoKTogU291cmNlTG9jYXRpb24ge1xuICAgIHJldHVybiB7XG4gICAgICBzdGFydDogdGhpcy5oYnNQb3NpdGlvbnMuc3RhcnQuaGJzUG9zLFxuICAgICAgZW5kOiB0aGlzLmhic1Bvc2l0aW9ucy5lbmQuaGJzUG9zLFxuICAgIH07XG4gIH1cblxuICB0b0hic1NwYW4oKTogSGJzU3BhbiB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0b0NoYXJQb3NTcGFuKCk6IENoYXJQb3NpdGlvblNwYW4gfCBudWxsIHtcbiAgICBsZXQgY2hhclBvc1NwYW4gPSB0aGlzLl9jaGFyUG9zU3BhbjtcblxuICAgIGlmIChjaGFyUG9zU3BhbiA9PT0gbnVsbCkge1xuICAgICAgbGV0IHN0YXJ0ID0gdGhpcy5oYnNQb3NpdGlvbnMuc3RhcnQudG9DaGFyUG9zKCk7XG4gICAgICBsZXQgZW5kID0gdGhpcy5oYnNQb3NpdGlvbnMuZW5kLnRvQ2hhclBvcygpO1xuXG4gICAgICBpZiAoc3RhcnQgJiYgZW5kKSB7XG4gICAgICAgIGNoYXJQb3NTcGFuID0gdGhpcy5fY2hhclBvc1NwYW4gPSBuZXcgQ2hhclBvc2l0aW9uU3Bhbih0aGlzLnNvdXJjZSwge1xuICAgICAgICAgIHN0YXJ0LFxuICAgICAgICAgIGVuZCxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGFyUG9zU3BhbiA9IHRoaXMuX2NoYXJQb3NTcGFuID0gQlJPS0VOO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2hhclBvc1NwYW4gPT09IEJST0tFTiA/IG51bGwgOiBjaGFyUG9zU3BhbjtcbiAgfVxufVxuXG5jbGFzcyBJbnZpc2libGVTcGFuIGltcGxlbWVudHMgU3BhbkRhdGEge1xuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBraW5kOiBPZmZzZXRLaW5kLkJyb2tlbiB8IE9mZnNldEtpbmQuSW50ZXJuYWxzU3ludGhldGljIHwgT2Zmc2V0S2luZC5Ob25FeGlzdGVudCxcbiAgICAvLyB3aGF0ZXZlciB3YXMgcHJvdmlkZWQsIHBvc3NpYmx5IGJyb2tlblxuICAgIHJlYWRvbmx5IGxvYzogU291cmNlTG9jYXRpb24sXG4gICAgLy8gaWYgdGhlIHNwYW4gcmVwcmVzZW50cyBhIHN5bnRoZXRpYyBzdHJpbmdcbiAgICByZWFkb25seSBzdHJpbmc6IHN0cmluZyB8IG51bGwgPSBudWxsXG4gICkge31cblxuICBzZXJpYWxpemUoKTogU2VyaWFsaXplZENvbmNyZXRlU291cmNlU3BhbiB7XG4gICAgc3dpdGNoICh0aGlzLmtpbmQpIHtcbiAgICAgIGNhc2UgT2Zmc2V0S2luZC5Ccm9rZW46XG4gICAgICBjYXNlIE9mZnNldEtpbmQuTm9uRXhpc3RlbnQ6XG4gICAgICAgIHJldHVybiB0aGlzLmtpbmQ7XG4gICAgICBjYXNlIE9mZnNldEtpbmQuSW50ZXJuYWxzU3ludGhldGljOlxuICAgICAgICByZXR1cm4gdGhpcy5zdHJpbmcgfHwgJyc7XG4gICAgfVxuICB9XG5cbiAgd3JhcCgpOiBTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gbmV3IFNvdXJjZVNwYW4odGhpcyk7XG4gIH1cblxuICBhc1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnN0cmluZyB8fCAnJztcbiAgfVxuXG4gIGxvY0RpZFVwZGF0ZSh7IHN0YXJ0LCBlbmQgfTogeyBzdGFydD86IFNvdXJjZVBvc2l0aW9uOyBlbmQ/OiBTb3VyY2VQb3NpdGlvbiB9KSB7XG4gICAgaWYgKHN0YXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMubG9jLnN0YXJ0ID0gc3RhcnQ7XG4gICAgfVxuXG4gICAgaWYgKGVuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmxvYy5lbmQgPSBlbmQ7XG4gICAgfVxuICB9XG5cbiAgZ2V0TW9kdWxlKCk6IHN0cmluZyB7XG4gICAgLy8gVE9ETzogTWFrZSB0aGlzIHJlZmxlY3QgdGhlIGFjdHVhbCBtb2R1bGUgdGhpcyBzcGFuIG9yaWdpbmF0ZWQgZnJvbVxuICAgIHJldHVybiAnYW4gdW5rbm93biBtb2R1bGUnO1xuICB9XG5cbiAgZ2V0U3RhcnQoKTogQW55UG9zaXRpb24ge1xuICAgIHJldHVybiBuZXcgSW52aXNpYmxlUG9zaXRpb24odGhpcy5raW5kLCB0aGlzLmxvYy5zdGFydCk7XG4gIH1cblxuICBnZXRFbmQoKTogQW55UG9zaXRpb24ge1xuICAgIHJldHVybiBuZXcgSW52aXNpYmxlUG9zaXRpb24odGhpcy5raW5kLCB0aGlzLmxvYy5lbmQpO1xuICB9XG5cbiAgdG9DaGFyUG9zU3BhbigpOiBJbnZpc2libGVTcGFuIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRvSGJzU3BhbigpOiBudWxsIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHRvSGJzTG9jKCk6IFNvdXJjZUxvY2F0aW9uIHtcbiAgICByZXR1cm4gQlJPS0VOX0xPQ0FUSU9OO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBzcGFuOiBNYXRjaEZuPFNvdXJjZVNwYW4+ID0gbWF0Y2goKG0pID0+XG4gIG1cbiAgICAud2hlbihPZmZzZXRLaW5kLkhic1Bvc2l0aW9uLCBPZmZzZXRLaW5kLkhic1Bvc2l0aW9uLCAobGVmdCwgcmlnaHQpID0+XG4gICAgICBuZXcgSGJzU3BhbihsZWZ0LnNvdXJjZSwge1xuICAgICAgICBzdGFydDogbGVmdCxcbiAgICAgICAgZW5kOiByaWdodCxcbiAgICAgIH0pLndyYXAoKVxuICAgIClcbiAgICAud2hlbihPZmZzZXRLaW5kLkNoYXJQb3NpdGlvbiwgT2Zmc2V0S2luZC5DaGFyUG9zaXRpb24sIChsZWZ0LCByaWdodCkgPT5cbiAgICAgIG5ldyBDaGFyUG9zaXRpb25TcGFuKGxlZnQuc291cmNlLCB7XG4gICAgICAgIHN0YXJ0OiBsZWZ0LFxuICAgICAgICBlbmQ6IHJpZ2h0LFxuICAgICAgfSkud3JhcCgpXG4gICAgKVxuICAgIC53aGVuKE9mZnNldEtpbmQuQ2hhclBvc2l0aW9uLCBPZmZzZXRLaW5kLkhic1Bvc2l0aW9uLCAobGVmdCwgcmlnaHQpID0+IHtcbiAgICAgIGxldCByaWdodENoYXJQb3MgPSByaWdodC50b0NoYXJQb3MoKTtcblxuICAgICAgaWYgKHJpZ2h0Q2hhclBvcyA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbmV3IEludmlzaWJsZVNwYW4oT2Zmc2V0S2luZC5Ccm9rZW4sIEJST0tFTl9MT0NBVElPTikud3JhcCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNwYW4obGVmdCwgcmlnaHRDaGFyUG9zKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC53aGVuKE9mZnNldEtpbmQuSGJzUG9zaXRpb24sIE9mZnNldEtpbmQuQ2hhclBvc2l0aW9uLCAobGVmdCwgcmlnaHQpID0+IHtcbiAgICAgIGxldCBsZWZ0Q2hhclBvcyA9IGxlZnQudG9DaGFyUG9zKCk7XG5cbiAgICAgIGlmIChsZWZ0Q2hhclBvcyA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbmV3IEludmlzaWJsZVNwYW4oT2Zmc2V0S2luZC5Ccm9rZW4sIEJST0tFTl9MT0NBVElPTikud3JhcCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNwYW4obGVmdENoYXJQb3MsIHJpZ2h0KTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC53aGVuKElzSW52aXNpYmxlLCBNYXRjaEFueSwgKGxlZnQpID0+IG5ldyBJbnZpc2libGVTcGFuKGxlZnQua2luZCwgQlJPS0VOX0xPQ0FUSU9OKS53cmFwKCkpXG4gICAgLndoZW4oTWF0Y2hBbnksIElzSW52aXNpYmxlLCAoXywgcmlnaHQpID0+XG4gICAgICBuZXcgSW52aXNpYmxlU3BhbihyaWdodC5raW5kLCBCUk9LRU5fTE9DQVRJT04pLndyYXAoKVxuICAgIClcbik7XG5cbmV4cG9ydCB0eXBlIFNlcmlhbGl6ZWRDb25jcmV0ZVNvdXJjZVNwYW4gPVxuICB8IC8qKiBjb2xsYXBzZWQgKi8gbnVtYmVyXG4gIHwgLyoqIG5vcm1hbCAqLyBbc3RhcnQ6IG51bWJlciwgc2l6ZTogbnVtYmVyXVxuICB8IC8qKiBzeW50aGV0aWMgKi8gc3RyaW5nO1xuXG5leHBvcnQgdHlwZSBTZXJpYWxpemVkU291cmNlU3BhbiA9XG4gIHwgU2VyaWFsaXplZENvbmNyZXRlU291cmNlU3BhblxuICB8IE9mZnNldEtpbmQuTm9uRXhpc3RlbnRcbiAgfCBPZmZzZXRLaW5kLkJyb2tlbjtcbiJdLCJzb3VyY2VSb290IjoiIn0=