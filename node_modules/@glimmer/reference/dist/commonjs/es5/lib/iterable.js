"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createIteratorRef = createIteratorRef;
exports.createIteratorItemRef = createIteratorItemRef;

var _globalContext = require("@glimmer/global-context");

var _util = require("@glimmer/util");

var _env = require("@glimmer/env");

var _validator = require("@glimmer/validator");

var _reference = require("./reference");

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

var NULL_IDENTITY = {};

var KEY = function KEY(_, index) {
  return index;
};

var INDEX = function INDEX(_, index) {
  return String(index);
};

var IDENTITY = function IDENTITY(item) {
  if (item === null) {
    // Returning null as an identity will cause failures since the iterator
    // can't tell that it's actually supposed to be null
    return NULL_IDENTITY;
  }

  return item;
};

function keyForPath(path) {
  if (_env.DEBUG && path[0] === '@') {
    throw new Error("invalid keypath: '" + path + "', valid keys: @index, @identity, or a path");
  }

  return uniqueKeyFor(function (item) {
    return (0, _globalContext.getPath)(item, path);
  });
}

function makeKeyFor(key) {
  switch (key) {
    case '@key':
      return uniqueKeyFor(KEY);

    case '@index':
      return uniqueKeyFor(INDEX);

    case '@identity':
      return uniqueKeyFor(IDENTITY);

    default:
      return keyForPath(key);
  }
}

var WeakMapWithPrimitives = /*#__PURE__*/function () {
  function WeakMapWithPrimitives() {}

  var _proto = WeakMapWithPrimitives.prototype;

  _proto.set = function set(key, value) {
    if ((0, _util.isObject)(key)) {
      this.weakMap.set(key, value);
    } else {
      this.primitiveMap.set(key, value);
    }
  };

  _proto.get = function get(key) {
    if ((0, _util.isObject)(key)) {
      return this.weakMap.get(key);
    } else {
      return this.primitiveMap.get(key);
    }
  };

  _createClass(WeakMapWithPrimitives, [{
    key: "weakMap",
    get: function get() {
      if (this._weakMap === undefined) {
        this._weakMap = new WeakMap();
      }

      return this._weakMap;
    }
  }, {
    key: "primitiveMap",
    get: function get() {
      if (this._primitiveMap === undefined) {
        this._primitiveMap = new Map();
      }

      return this._primitiveMap;
    }
  }]);

  return WeakMapWithPrimitives;
}();

var IDENTITIES = new WeakMapWithPrimitives();

function identityForNthOccurence(value, count) {
  var identities = IDENTITIES.get(value);

  if (identities === undefined) {
    identities = [];
    IDENTITIES.set(value, identities);
  }

  var identity = identities[count];

  if (identity === undefined) {
    identity = {
      value: value,
      count: count
    };
    identities[count] = identity;
  }

  return identity;
}
/**
 * When iterating over a list, it's possible that an item with the same unique
 * key could be encountered twice:
 *
 * ```js
 * let arr = ['same', 'different', 'same', 'same'];
 * ```
 *
 * In general, we want to treat these items as _unique within the list_. To do
 * this, we track the occurences of every item as we iterate the list, and when
 * an item occurs more than once, we generate a new unique key just for that
 * item, and that occurence within the list. The next time we iterate the list,
 * and encounter an item for the nth time, we can get the _same_ key, and let
 * Glimmer know that it should reuse the DOM for the previous nth occurence.
 */


function uniqueKeyFor(keyFor) {
  var seen = new WeakMapWithPrimitives();
  return function (value, memo) {
    var key = keyFor(value, memo);
    var count = seen.get(key) || 0;
    seen.set(key, count + 1);

    if (count === 0) {
      return key;
    }

    return identityForNthOccurence(key, count);
  };
}

function createIteratorRef(listRef, key) {
  return (0, _reference.createComputeRef)(function () {
    var iterable = (0, _reference.valueForRef)(listRef);
    var keyFor = makeKeyFor(key);

    if (Array.isArray(iterable)) {
      return new ArrayIterator(iterable, keyFor);
    }

    var maybeIterator = (0, _globalContext.toIterator)(iterable);

    if (maybeIterator === null) {
      return new ArrayIterator(_util.EMPTY_ARRAY, function () {
        return null;
      });
    }

    return new IteratorWrapper(maybeIterator, keyFor);
  });
}

function createIteratorItemRef(_value) {
  var value = _value;
  var tag = (0, _validator.createTag)();
  return (0, _reference.createComputeRef)(function () {
    (0, _validator.consumeTag)(tag);
    return value;
  }, function (newValue) {
    if (value !== newValue) {
      value = newValue;
      (0, _validator.dirtyTag)(tag);
    }
  });
}

var IteratorWrapper = /*#__PURE__*/function () {
  function IteratorWrapper(inner, keyFor) {
    this.inner = inner;
    this.keyFor = keyFor;
  }

  var _proto2 = IteratorWrapper.prototype;

  _proto2.isEmpty = function isEmpty() {
    return this.inner.isEmpty();
  };

  _proto2.next = function next() {
    var nextValue = this.inner.next();

    if (nextValue !== null) {
      nextValue.key = this.keyFor(nextValue.value, nextValue.memo);
    }

    return nextValue;
  };

  return IteratorWrapper;
}();

var ArrayIterator = /*#__PURE__*/function () {
  function ArrayIterator(iterator, keyFor) {
    this.iterator = iterator;
    this.keyFor = keyFor;
    this.pos = 0;

    if (iterator.length === 0) {
      this.current = {
        kind: 'empty'
      };
    } else {
      this.current = {
        kind: 'first',
        value: iterator[this.pos]
      };
    }
  }

  var _proto3 = ArrayIterator.prototype;

  _proto3.isEmpty = function isEmpty() {
    return this.current.kind === 'empty';
  };

  _proto3.next = function next() {
    var value;
    var current = this.current;

    if (current.kind === 'first') {
      this.current = {
        kind: 'progress'
      };
      value = current.value;
    } else if (this.pos >= this.iterator.length - 1) {
      return null;
    } else {
      value = this.iterator[++this.pos];
    }

    var keyFor = this.keyFor;
    var key = keyFor(value, this.pos);
    var memo = this.pos;
    return {
      key: key,
      value: value,
      memo: memo
    };
  };

  return ArrayIterator;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvaXRlcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNEJBLElBQU0sYUFBYSxHQUFuQixFQUFBOztBQUVBLElBQU0sR0FBRyxHQUFXLFNBQWQsR0FBYyxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7QUFBQSxTQUFwQixLQUFvQjtBQUFwQixDQUFBOztBQUNBLElBQU0sS0FBSyxHQUFXLFNBQWhCLEtBQWdCLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQTtBQUFBLFNBQWMsTUFBTSxDQUExQyxLQUEwQyxDQUFwQjtBQUF0QixDQUFBOztBQUNBLElBQU0sUUFBUSxHQUFZLFNBQXBCLFFBQW9CLENBQUQsSUFBQyxFQUFRO0FBQ2hDLE1BQUksSUFBSSxLQUFSLElBQUEsRUFBbUI7QUFDakI7QUFDQTtBQUNBLFdBQUEsYUFBQTtBQUNEOztBQUVELFNBQUEsSUFBQTtBQVBGLENBQUE7O0FBVUEsU0FBQSxVQUFBLENBQUEsSUFBQSxFQUFnQztBQUM5QixNQUFJLGNBQVMsSUFBSSxDQUFKLENBQUksQ0FBSixLQUFiLEdBQUEsRUFBOEI7QUFDNUIsVUFBTSxJQUFBLEtBQUEsQ0FBQSx1QkFBTixJQUFNLEdBQU4sNkNBQU0sQ0FBTjtBQUNEOztBQUNELFNBQU8sWUFBWSxDQUFFLFVBQUQsSUFBQyxFQUFEO0FBQUEsV0FBVSw0QkFBTyxJQUFQLEVBQTlCLElBQThCLENBQVY7QUFBcEIsR0FBbUIsQ0FBbkI7QUFDRDs7QUFFRCxTQUFBLFVBQUEsQ0FBQSxHQUFBLEVBQStCO0FBQzdCLFVBQUEsR0FBQTtBQUNFLFNBQUEsTUFBQTtBQUNFLGFBQU8sWUFBWSxDQUFuQixHQUFtQixDQUFuQjs7QUFDRixTQUFBLFFBQUE7QUFDRSxhQUFPLFlBQVksQ0FBbkIsS0FBbUIsQ0FBbkI7O0FBQ0Ys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QUksR0FBRyxLQUFYLEdBQUE7QUFFQSxXQUFPO0FBQUUsTUFBQSxHQUFGLEVBQUEsR0FBQTtBQUFPLE1BQUEsS0FBUCxFQUFBLEtBQUE7QUFBYyxNQUFBLElBQUEsRUFBQTtBQUFkLEtBQVAiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRQYXRoLCB0b0l0ZXJhdG9yIH0gZnJvbSAnQGdsaW1tZXIvZ2xvYmFsLWNvbnRleHQnO1xuaW1wb3J0IHsgT3B0aW9uLCBEaWN0IH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBFTVBUWV9BUlJBWSwgaXNPYmplY3QgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IERFQlVHIH0gZnJvbSAnQGdsaW1tZXIvZW52JztcbmltcG9ydCB7IGNyZWF0ZVRhZywgY29uc3VtZVRhZywgZGlydHlUYWcgfSBmcm9tICdAZ2xpbW1lci92YWxpZGF0b3InO1xuaW1wb3J0IHsgUmVmZXJlbmNlLCBSZWZlcmVuY2VFbnZpcm9ubWVudCwgdmFsdWVGb3JSZWYsIGNyZWF0ZUNvbXB1dGVSZWYgfSBmcm9tICcuL3JlZmVyZW5jZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmF0aW9uSXRlbTxULCBVPiB7XG4gIGtleTogdW5rbm93bjtcbiAgdmFsdWU6IFQ7XG4gIG1lbW86IFU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWJzdHJhY3RJdGVyYXRvcjxULCBVLCBWIGV4dGVuZHMgSXRlcmF0aW9uSXRlbTxULCBVPj4ge1xuICBpc0VtcHR5KCk6IGJvb2xlYW47XG4gIG5leHQoKTogT3B0aW9uPFY+O1xufVxuXG5leHBvcnQgdHlwZSBPcGFxdWVJdGVyYXRpb25JdGVtID0gSXRlcmF0aW9uSXRlbTx1bmtub3duLCB1bmtub3duPjtcbmV4cG9ydCB0eXBlIE9wYXF1ZUl0ZXJhdG9yID0gQWJzdHJhY3RJdGVyYXRvcjx1bmtub3duLCB1bmtub3duLCBPcGFxdWVJdGVyYXRpb25JdGVtPjtcblxuZXhwb3J0IGludGVyZmFjZSBJdGVyYXRvckRlbGVnYXRlIHtcbiAgaXNFbXB0eSgpOiBib29sZWFuO1xuICBuZXh0KCk6IHsgdmFsdWU6IHVua25vd247IG1lbW86IHVua25vd24gfSB8IG51bGw7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmF0b3JSZWZlcmVuY2VFbnZpcm9ubWVudCBleHRlbmRzIFJlZmVyZW5jZUVudmlyb25tZW50IHtcbiAgZ2V0UGF0aChvYmo6IHVua25vd24sIHBhdGg6IHN0cmluZyk6IHVua25vd247XG4gIHRvSXRlcmF0b3Iob2JqOiB1bmtub3duKTogT3B0aW9uPEl0ZXJhdG9yRGVsZWdhdGU+O1xufVxuXG50eXBlIEtleUZvciA9IChpdGVtOiB1bmtub3duLCBpbmRleDogdW5rbm93bikgPT4gdW5rbm93bjtcblxuY29uc3QgTlVMTF9JREVOVElUWSA9IHt9O1xuXG5jb25zdCBLRVk6IEtleUZvciA9IChfLCBpbmRleCkgPT4gaW5kZXg7XG5jb25zdCBJTkRFWDogS2V5Rm9yID0gKF8sIGluZGV4KSA9PiBTdHJpbmcoaW5kZXgpO1xuY29uc3QgSURFTlRJVFk6IEtleUZvciA9IChpdGVtKSA9PiB7XG4gIGlmIChpdGVtID09PSBudWxsKSB7XG4gICAgLy8gUmV0dXJuaW5nIG51bGwgYXMgYW4gaWRlbnRpdHkgd2lsbCBjYXVzZSBmYWlsdXJlcyBzaW5jZSB0aGUgaXRlcmF0b3JcbiAgICAvLyBjYW4ndCB0ZWxsIHRoYXQgaXQncyBhY3R1YWxseSBzdXBwb3NlZCB0byBiZSBudWxsXG4gICAgcmV0dXJuIE5VTExfSURFTlRJVFk7XG4gIH1cblxuICByZXR1cm4gaXRlbTtcbn07XG5cbmZ1bmN0aW9uIGtleUZvclBhdGgocGF0aDogc3RyaW5nKTogS2V5Rm9yIHtcbiAgaWYgKERFQlVHICYmIHBhdGhbMF0gPT09ICdAJykge1xuICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBrZXlwYXRoOiAnJHtwYXRofScsIHZhbGlkIGtleXM6IEBpbmRleCwgQGlkZW50aXR5LCBvciBhIHBhdGhgKTtcbiAgfVxuICByZXR1cm4gdW5pcXVlS2V5Rm9yKChpdGVtKSA9PiBnZXRQYXRoKGl0ZW0gYXMgb2JqZWN0LCBwYXRoKSk7XG59XG5cbmZ1bmN0aW9uIG1ha2VLZXlGb3Ioa2V5OiBzdHJpbmcpIHtcbiAgc3dpdGNoIChrZXkpIHtcbiAgICBjYXNlICdAa2V5JzpcbiAgICAgIHJldHVybiB1bmlxdWVLZXlGb3IoS0VZKTtcbiAgICBjYXNlICdAaW5kZXgnOlxuICAgICAgcmV0dXJuIHVuaXF1ZUtleUZvcihJTkRFWCk7XG4gICAgY2FzZSAnQGlkZW50aXR5JzpcbiAgICAgIHJldHVybiB1bmlxdWVLZXlGb3IoSURFTlRJVFkpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ga2V5Rm9yUGF0aChrZXkpO1xuICB9XG59XG5cbmNsYXNzIFdlYWtNYXBXaXRoUHJpbWl0aXZlczxUPiB7XG4gIHByaXZhdGUgX3dlYWtNYXA/OiBXZWFrTWFwPG9iamVjdCwgVD47XG4gIHByaXZhdGUgX3ByaW1pdGl2ZU1hcD86IE1hcDx1bmtub3duLCBUPjtcblxuICBwcml2YXRlIGdldCB3ZWFrTWFwKCkge1xuICAgIGlmICh0aGlzLl93ZWFrTWFwID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX3dlYWtNYXAgPSBuZXcgV2Vha01hcCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl93ZWFrTWFwO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgcHJpbWl0aXZlTWFwKCkge1xuICAgIGlmICh0aGlzLl9wcmltaXRpdmVNYXAgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fcHJpbWl0aXZlTWFwID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9wcmltaXRpdmVNYXA7XG4gIH1cblxuICBzZXQoa2V5OiB1bmtub3duLCB2YWx1ZTogVCkge1xuICAgIGlmIChpc09iamVjdChrZXkpKSB7XG4gICAgICB0aGlzLndlYWtNYXAuc2V0KGtleSBhcyBvYmplY3QsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcmltaXRpdmVNYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIGdldChrZXk6IHVua25vd24pOiBUIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoaXNPYmplY3Qoa2V5KSkge1xuICAgICAgcmV0dXJuIHRoaXMud2Vha01hcC5nZXQoa2V5IGFzIG9iamVjdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnByaW1pdGl2ZU1hcC5nZXQoa2V5KTtcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgSURFTlRJVElFUyA9IG5ldyBXZWFrTWFwV2l0aFByaW1pdGl2ZXM8b2JqZWN0W10+KCk7XG5cbmZ1bmN0aW9uIGlkZW50aXR5Rm9yTnRoT2NjdXJlbmNlKHZhbHVlOiBhbnksIGNvdW50OiBudW1iZXIpIHtcbiAgbGV0IGlkZW50aXRpZXMgPSBJREVOVElUSUVTLmdldCh2YWx1ZSk7XG5cbiAgaWYgKGlkZW50aXRpZXMgPT09IHVuZGVmaW5lZCkge1xuICAgIGlkZW50aXRpZXMgPSBbXTtcbiAgICBJREVOVElUSUVTLnNldCh2YWx1ZSwgaWRlbnRpdGllcyk7XG4gIH1cblxuICBsZXQgaWRlbnRpdHkgPSBpZGVudGl0aWVzW2NvdW50XTtcblxuICBpZiAoaWRlbnRpdHkgPT09IHVuZGVmaW5lZCkge1xuICAgIGlkZW50aXR5ID0geyB2YWx1ZSwgY291bnQgfTtcbiAgICBpZGVudGl0aWVzW2NvdW50XSA9IGlkZW50aXR5O1xuICB9XG5cbiAgcmV0dXJuIGlkZW50aXR5O1xufVxuXG4vKipcbiAqIFdoZW4gaXRlcmF0aW5nIG92ZXIgYSBsaXN0LCBpdCdzIHBvc3NpYmxlIHRoYXQgYW4gaXRlbSB3aXRoIHRoZSBzYW1lIHVuaXF1ZVxuICoga2V5IGNvdWxkIGJlIGVuY291bnRlcmVkIHR3aWNlOlxuICpcbiAqIGBgYGpzXG4gKiBsZXQgYXJyID0gWydzYW1lJywgJ2RpZmZlcmVudCcsICdzYW1lJywgJ3NhbWUnXTtcbiAqIGBgYFxuICpcbiAqIEluIGdlbmVyYWwsIHdlIHdhbnQgdG8gdHJlYXQgdGhlc2UgaXRlbXMgYXMgX3VuaXF1ZSB3aXRoaW4gdGhlIGxpc3RfLiBUbyBkb1xuICogdGhpcywgd2UgdHJhY2sgdGhlIG9jY3VyZW5jZXMgb2YgZXZlcnkgaXRlbSBhcyB3ZSBpdGVyYXRlIHRoZSBsaXN0LCBhbmQgd2hlblxuICogYW4gaXRlbSBvY2N1cnMgbW9yZSB0aGFuIG9uY2UsIHdlIGdlbmVyYXRlIGEgbmV3IHVuaXF1ZSBrZXkganVzdCBmb3IgdGhhdFxuICogaXRlbSwgYW5kIHRoYXQgb2NjdXJlbmNlIHdpdGhpbiB0aGUgbGlzdC4gVGhlIG5leHQgdGltZSB3ZSBpdGVyYXRlIHRoZSBsaXN0LFxuICogYW5kIGVuY291bnRlciBhbiBpdGVtIGZvciB0aGUgbnRoIHRpbWUsIHdlIGNhbiBnZXQgdGhlIF9zYW1lXyBrZXksIGFuZCBsZXRcbiAqIEdsaW1tZXIga25vdyB0aGF0IGl0IHNob3VsZCByZXVzZSB0aGUgRE9NIGZvciB0aGUgcHJldmlvdXMgbnRoIG9jY3VyZW5jZS5cbiAqL1xuZnVuY3Rpb24gdW5pcXVlS2V5Rm9yKGtleUZvcjogS2V5Rm9yKSB7XG4gIGxldCBzZWVuID0gbmV3IFdlYWtNYXBXaXRoUHJpbWl0aXZlczxudW1iZXI+KCk7XG5cbiAgcmV0dXJuICh2YWx1ZTogdW5rbm93biwgbWVtbzogdW5rbm93bikgPT4ge1xuICAgIGxldCBrZXkgPSBrZXlGb3IodmFsdWUsIG1lbW8pO1xuICAgIGxldCBjb3VudCA9IHNlZW4uZ2V0KGtleSkgfHwgMDtcblxuICAgIHNlZW4uc2V0KGtleSwgY291bnQgKyAxKTtcblxuICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGtleTtcbiAgICB9XG5cbiAgICByZXR1cm4gaWRlbnRpdHlGb3JOdGhPY2N1cmVuY2Uoa2V5LCBjb3VudCk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJdGVyYXRvclJlZihsaXN0UmVmOiBSZWZlcmVuY2UsIGtleTogc3RyaW5nKSB7XG4gIHJldHVybiBjcmVhdGVDb21wdXRlUmVmKCgpID0+IHtcbiAgICBsZXQgaXRlcmFibGUgPSB2YWx1ZUZvclJlZihsaXN0UmVmKSBhcyB7IFtTeW1ib2wuaXRlcmF0b3JdOiBhbnkgfSB8IG51bGwgfCBmYWxzZTtcblxuICAgIGxldCBrZXlGb3IgPSBtYWtlS2V5Rm9yKGtleSk7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVyYWJsZSkpIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcihpdGVyYWJsZSwga2V5Rm9yKTtcbiAgICB9XG5cbiAgICBsZXQgbWF5YmVJdGVyYXRvciA9IHRvSXRlcmF0b3IoaXRlcmFibGUpO1xuXG4gICAgaWYgKG1heWJlSXRlcmF0b3IgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcihFTVBUWV9BUlJBWSwgKCkgPT4gbnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBJdGVyYXRvcldyYXBwZXIobWF5YmVJdGVyYXRvciwga2V5Rm9yKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJdGVyYXRvckl0ZW1SZWYoX3ZhbHVlOiB1bmtub3duKSB7XG4gIGxldCB2YWx1ZSA9IF92YWx1ZTtcbiAgbGV0IHRhZyA9IGNyZWF0ZVRhZygpO1xuXG4gIHJldHVybiBjcmVhdGVDb21wdXRlUmVmKFxuICAgICgpID0+IHtcbiAgICAgIGNvbnN1bWVUYWcodGFnKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuICAgIChuZXdWYWx1ZSkgPT4ge1xuICAgICAgaWYgKHZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICB2YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICBkaXJ0eVRhZyh0YWcpO1xuICAgICAgfVxuICAgIH1cbiAgKTtcbn1cblxuY2xhc3MgSXRlcmF0b3JXcmFwcGVyIGltcGxlbWVudHMgT3BhcXVlSXRlcmF0b3Ige1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBJdGVyYXRvckRlbGVnYXRlLCBwcml2YXRlIGtleUZvcjogS2V5Rm9yKSB7fVxuXG4gIGlzRW1wdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXIuaXNFbXB0eSgpO1xuICB9XG5cbiAgbmV4dCgpIHtcbiAgICBsZXQgbmV4dFZhbHVlID0gdGhpcy5pbm5lci5uZXh0KCkgYXMgT3BhcXVlSXRlcmF0aW9uSXRlbTtcblxuICAgIGlmIChuZXh0VmFsdWUgIT09IG51bGwpIHtcbiAgICAgIG5leHRWYWx1ZS5rZXkgPSB0aGlzLmtleUZvcihuZXh0VmFsdWUudmFsdWUsIG5leHRWYWx1ZS5tZW1vKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dFZhbHVlO1xuICB9XG59XG5cbmNsYXNzIEFycmF5SXRlcmF0b3IgaW1wbGVtZW50cyBPcGFxdWVJdGVyYXRvciB7XG4gIHByaXZhdGUgY3VycmVudDogeyBraW5kOiAnZW1wdHknIH0gfCB7IGtpbmQ6ICdmaXJzdCc7IHZhbHVlOiB1bmtub3duIH0gfCB7IGtpbmQ6ICdwcm9ncmVzcycgfTtcbiAgcHJpdmF0ZSBwb3MgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaXRlcmF0b3I6IHVua25vd25bXSB8IHJlYWRvbmx5IHVua25vd25bXSwgcHJpdmF0ZSBrZXlGb3I6IEtleUZvcikge1xuICAgIGlmIChpdGVyYXRvci5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHsga2luZDogJ2VtcHR5JyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB7IGtpbmQ6ICdmaXJzdCcsIHZhbHVlOiBpdGVyYXRvclt0aGlzLnBvc10gfTtcbiAgICB9XG4gIH1cblxuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnQua2luZCA9PT0gJ2VtcHR5JztcbiAgfVxuXG4gIG5leHQoKTogT3B0aW9uPEl0ZXJhdGlvbkl0ZW08dW5rbm93biwgbnVtYmVyPj4ge1xuICAgIGxldCB2YWx1ZTogdW5rbm93bjtcblxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5jdXJyZW50O1xuICAgIGlmIChjdXJyZW50LmtpbmQgPT09ICdmaXJzdCcpIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHsga2luZDogJ3Byb2dyZXNzJyB9O1xuICAgICAgdmFsdWUgPSBjdXJyZW50LnZhbHVlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wb3MgPj0gdGhpcy5pdGVyYXRvci5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSB0aGlzLml0ZXJhdG9yWysrdGhpcy5wb3NdO1xuICAgIH1cblxuICAgIGxldCB7IGtleUZvciB9ID0gdGhpcztcblxuICAgIGxldCBrZXkgPSBrZXlGb3IodmFsdWUgYXMgRGljdCwgdGhpcy5wb3MpO1xuICAgIGxldCBtZW1vID0gdGhpcy5wb3M7XG5cbiAgICByZXR1cm4geyBrZXksIHZhbHVlLCBtZW1vIH07XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=