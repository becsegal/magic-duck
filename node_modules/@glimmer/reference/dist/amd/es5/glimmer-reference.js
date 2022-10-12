define('@glimmer/reference', ['exports', '@glimmer/env', '@glimmer/global-context', '@glimmer/util', '@glimmer/validator'], function (exports, env, globalContext, util, validator) { 'use strict';

  var REFERENCE = util.symbol('REFERENCE');

  var ReferenceImpl = function ReferenceImpl(type) {
    this.tag = null;
    this.lastRevision = validator.INITIAL;
    this.children = null;
    this.compute = null;
    this.update = null;
    this[REFERENCE] = type;
  };

  function createPrimitiveRef(value) {
    var ref = new ReferenceImpl(2
    /* Unbound */
    );
    ref.tag = validator.CONSTANT_TAG;
    ref.lastValue = value;

    if (env.DEBUG) {
      ref.debugLabel = String(value);
    }

    return ref;
  }
  var UNDEFINED_REFERENCE = createPrimitiveRef(undefined);
  var NULL_REFERENCE = createPrimitiveRef(null);
  var TRUE_REFERENCE = createPrimitiveRef(true);
  var FALSE_REFERENCE = createPrimitiveRef(false);
  function createConstRef(value, debugLabel) {
    var ref = new ReferenceImpl(0
    /* Constant */
    );
    ref.lastValue = value;
    ref.tag = validator.CONSTANT_TAG;

    if (env.DEBUG) {
      ref.debugLabel = debugLabel;
    }

    return ref;
  }
  function createUnboundRef(value, debugLabel) {
    var ref = new ReferenceImpl(2
    /* Unbound */
    );
    ref.lastValue = value;
    ref.tag = validator.CONSTANT_TAG;

    if (env.DEBUG) {
      ref.debugLabel = debugLabel;
    }

    return ref;
  }
  function createComputeRef(compute, update, debugLabel) {
    if (update === void 0) {
      update = null;
    }

    if (debugLabel === void 0) {
      debugLabel = 'unknown';
    }

    var ref = new ReferenceImpl(1
    /* Compute */
    );
    ref.compute = compute;
    ref.update = update;

    if (env.DEBUG) {
      ref.debugLabel = "(result of a `" + debugLabel + "` helper)";
    }

    return ref;
  }
  function createReadOnlyRef(ref) {
    if (!isUpdatableRef(ref)) return ref;
    return createComputeRef(function () {
      return valueForRef(ref);
    }, null, ref.debugLabel);
  }
  function isInvokableRef(ref) {
    return ref[REFERENCE] === 3
    /* Invokable */
    ;
  }
  function createInvokableRef(inner) {
    var ref = createComputeRef(function () {
      return valueForRef(inner);
    }, function (value) {
      return updateRef(inner, value);
    });
    ref.debugLabel = inner.debugLabel;
    ref[REFERENCE] = 3
    /* Invokable */
    ;
    return ref;
  }
  function isConstRef(_ref) {
    var ref = _ref;
    return ref.tag === validator.CONSTANT_TAG;
  }
  function isUpdatableRef(_ref) {
    var ref = _ref;
    return ref.update !== null;
  }
  function valueForRef(_ref) {
    var ref = _ref;
    var tag = ref.tag;

    if (tag === validator.CONSTANT_TAG) {
      return ref.lastValue;
    }

    var lastRevision = ref.lastRevision;
    var lastValue;

    if (tag === null || !validator.validateTag(tag, lastRevision)) {
      var compute = ref.compute;
      tag = ref.tag = validator.track(function () {
        lastValue = ref.lastValue = compute();
      }, env.DEBUG && ref.debugLabel);
      ref.lastRevision = validator.valueForTag(tag);
    } else {
      lastValue = ref.lastValue;
    }

    validator.consumeTag(tag);
    return lastValue;
  }
  function updateRef(_ref, value) {
    var ref = _ref;
    var update = ref.update;
    update(value);
  }
  function childRefFor(_parentRef, path) {
    var parentRef = _parentRef;
    var type = parentRef[REFERENCE];
    var children = parentRef.children;
    var child;

    if (children === null) {
      children = parentRef.children = new Map();
    } else {
      child = children.get(path);

      if (child !== undefined) {
        return child;
      }
    }

    if (type === 2
    /* Unbound */
    ) {
        var parent = valueForRef(parentRef);

        if (util.isDict(parent)) {
          child = createUnboundRef(parent[path], env.DEBUG && parentRef.debugLabel + "." + path);
        } else {
          child = UNDEFINED_REFERENCE;
        }
      } else {
      child = createComputeRef(function () {
        var parent = valueForRef(parentRef);

        if (util.isDict(parent)) {
          return globalContext.getProp(parent, path);
        }
      }, function (val) {
        var parent = valueForRef(parentRef);

        if (util.isDict(parent)) {
          return globalContext.setProp(parent, path, val);
        }
      });

      if (env.DEBUG) {
        child.debugLabel = parentRef.debugLabel + "." + path;
      }
    }

    children.set(path, child);
    return child;
  }
  function childRefFromParts(root, parts) {
    var reference = root;

    for (var i = 0; i < parts.length; i++) {
      reference = childRefFor(reference, parts[i]);
    }

    return reference;
  }

  if (env.DEBUG) {
    exports.createDebugAliasRef = function createDebugAliasRef(debugLabel, inner) {
      var update = isUpdatableRef(inner) ? function (value) {
        return updateRef(inner, value);
      } : null;
      var ref = createComputeRef(function () {
        return valueForRef(inner);
      }, update);
      ref[REFERENCE] = inner[REFERENCE];
      ref.debugLabel = debugLabel;
      return ref;
    };
  }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }
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
    if (env.DEBUG && path[0] === '@') {
      throw new Error("invalid keypath: '" + path + "', valid keys: @index, @identity, or a path");
    }

    return uniqueKeyFor(function (item) {
      return globalContext.getPath(item, path);
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
      if (util.isObject(key)) {
        this.weakMap.set(key, value);
      } else {
        this.primitiveMap.set(key, value);
      }
    };

    _proto.get = function get(key) {
      if (util.isObject(key)) {
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
    return createComputeRef(function () {
      var iterable = valueForRef(listRef);
      var keyFor = makeKeyFor(key);

      if (Array.isArray(iterable)) {
        return new ArrayIterator(iterable, keyFor);
      }

      var maybeIterator = globalContext.toIterator(iterable);

      if (maybeIterator === null) {
        return new ArrayIterator(util.EMPTY_ARRAY, function () {
          return null;
        });
      }

      return new IteratorWrapper(maybeIterator, keyFor);
    });
  }
  function createIteratorItemRef(_value) {
    var value = _value;
    var tag = validator.createTag();
    return createComputeRef(function () {
      validator.consumeTag(tag);
      return value;
    }, function (newValue) {
      if (value !== newValue) {
        value = newValue;
        validator.dirtyTag(tag);
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

  exports.FALSE_REFERENCE = FALSE_REFERENCE;
  exports.NULL_REFERENCE = NULL_REFERENCE;
  exports.REFERENCE = REFERENCE;
  exports.TRUE_REFERENCE = TRUE_REFERENCE;
  exports.UNDEFINED_REFERENCE = UNDEFINED_REFERENCE;
  exports.childRefFor = childRefFor;
  exports.childRefFromParts = childRefFromParts;
  exports.createComputeRef = createComputeRef;
  exports.createConstRef = createConstRef;
  exports.createInvokableRef = createInvokableRef;
  exports.createIteratorItemRef = createIteratorItemRef;
  exports.createIteratorRef = createIteratorRef;
  exports.createPrimitiveRef = createPrimitiveRef;
  exports.createReadOnlyRef = createReadOnlyRef;
  exports.createUnboundRef = createUnboundRef;
  exports.isConstRef = isConstRef;
  exports.isInvokableRef = isInvokableRef;
  exports.isUpdatableRef = isUpdatableRef;
  exports.updateRef = updateRef;
  exports.valueForRef = valueForRef;

  Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xpbW1lci1yZWZlcmVuY2UuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvcmVmZXJlbmNlLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcmVmZXJlbmNlL2xpYi9pdGVyYWJsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBERUJVRyB9IGZyb20gJ0BnbGltbWVyL2Vudic7XG5pbXBvcnQgeyBnZXRQcm9wLCBzZXRQcm9wIH0gZnJvbSAnQGdsaW1tZXIvZ2xvYmFsLWNvbnRleHQnO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBleHBlY3QsIGlzRGljdCwgc3ltYm9sIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQge1xuICBDT05TVEFOVF9UQUcsXG4gIGNvbnN1bWVUYWcsXG4gIElOSVRJQUwsXG4gIFJldmlzaW9uLFxuICBUYWcsXG4gIHRyYWNrLFxuICB2YWxpZGF0ZVRhZyxcbiAgdmFsdWVGb3JUYWcsXG59IGZyb20gJ0BnbGltbWVyL3ZhbGlkYXRvcic7XG5cbmV4cG9ydCBjb25zdCBSRUZFUkVOQ0U6IHVuaXF1ZSBzeW1ib2wgPSBzeW1ib2woJ1JFRkVSRU5DRScpO1xuXG5jb25zdCBlbnVtIFJlZmVyZW5jZVR5cGUge1xuICBDb25zdGFudCxcbiAgQ29tcHV0ZSxcbiAgVW5ib3VuZCxcbiAgSW52b2thYmxlLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlZmVyZW5jZTxfVCA9IHVua25vd24+IHtcbiAgW1JFRkVSRU5DRV06IFJlZmVyZW5jZVR5cGU7XG4gIGRlYnVnTGFiZWw/OiBzdHJpbmc7XG4gIGNoaWxkcmVuOiBudWxsIHwgTWFwPHN0cmluZyB8IFJlZmVyZW5jZSwgUmVmZXJlbmNlPjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgUmVmZXJlbmNlO1xuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVmZXJlbmNlRW52aXJvbm1lbnQge1xuICBnZXRQcm9wKG9iajogdW5rbm93biwgcGF0aDogc3RyaW5nKTogdW5rbm93bjtcbiAgc2V0UHJvcChvYmo6IHVua25vd24sIHBhdGg6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiB1bmtub3duO1xufVxuXG5jbGFzcyBSZWZlcmVuY2VJbXBsPFQgPSB1bmtub3duPiBpbXBsZW1lbnRzIFJlZmVyZW5jZSB7XG4gIFtSRUZFUkVOQ0VdOiBSZWZlcmVuY2VUeXBlO1xuICBwdWJsaWMgdGFnOiBPcHRpb248VGFnPiA9IG51bGw7XG4gIHB1YmxpYyBsYXN0UmV2aXNpb246IFJldmlzaW9uID0gSU5JVElBTDtcbiAgcHVibGljIGxhc3RWYWx1ZT86IFQ7XG5cbiAgcHVibGljIGNoaWxkcmVuOiBPcHRpb248TWFwPHN0cmluZyB8IFJlZmVyZW5jZSwgUmVmZXJlbmNlPj4gPSBudWxsO1xuXG4gIHB1YmxpYyBjb21wdXRlOiBPcHRpb248KCkgPT4gVD4gPSBudWxsO1xuICBwdWJsaWMgdXBkYXRlOiBPcHRpb248KHZhbDogVCkgPT4gdm9pZD4gPSBudWxsO1xuXG4gIHB1YmxpYyBkZWJ1Z0xhYmVsPzogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHR5cGU6IFJlZmVyZW5jZVR5cGUpIHtcbiAgICB0aGlzW1JFRkVSRU5DRV0gPSB0eXBlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcmltaXRpdmVSZWYodmFsdWU6IHVua25vd24pOiBSZWZlcmVuY2Uge1xuICBsZXQgcmVmID0gbmV3IFJlZmVyZW5jZUltcGwoUmVmZXJlbmNlVHlwZS5VbmJvdW5kKTtcblxuICByZWYudGFnID0gQ09OU1RBTlRfVEFHO1xuICByZWYubGFzdFZhbHVlID0gdmFsdWU7XG5cbiAgaWYgKERFQlVHKSB7XG4gICAgcmVmLmRlYnVnTGFiZWwgPSBTdHJpbmcodmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIHJlZjtcbn1cblxuZXhwb3J0IGNvbnN0IFVOREVGSU5FRF9SRUZFUkVOQ0UgPSBjcmVhdGVQcmltaXRpdmVSZWYodW5kZWZpbmVkKTtcbmV4cG9ydCBjb25zdCBOVUxMX1JFRkVSRU5DRSA9IGNyZWF0ZVByaW1pdGl2ZVJlZihudWxsKTtcbmV4cG9ydCBjb25zdCBUUlVFX1JFRkVSRU5DRSA9IGNyZWF0ZVByaW1pdGl2ZVJlZih0cnVlKTtcbmV4cG9ydCBjb25zdCBGQUxTRV9SRUZFUkVOQ0UgPSBjcmVhdGVQcmltaXRpdmVSZWYoZmFsc2UpO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29uc3RSZWYodmFsdWU6IHVua25vd24sIGRlYnVnTGFiZWw6IGZhbHNlIHwgc3RyaW5nKTogUmVmZXJlbmNlIHtcbiAgbGV0IHJlZiA9IG5ldyBSZWZlcmVuY2VJbXBsKFJlZmVyZW5jZVR5cGUuQ29uc3RhbnQpO1xuXG4gIHJlZi5sYXN0VmFsdWUgPSB2YWx1ZTtcbiAgcmVmLnRhZyA9IENPTlNUQU5UX1RBRztcblxuICBpZiAoREVCVUcpIHtcbiAgICByZWYuZGVidWdMYWJlbCA9IGRlYnVnTGFiZWwgYXMgc3RyaW5nO1xuICB9XG5cbiAgcmV0dXJuIHJlZjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVVuYm91bmRSZWYodmFsdWU6IHVua25vd24sIGRlYnVnTGFiZWw6IGZhbHNlIHwgc3RyaW5nKTogUmVmZXJlbmNlIHtcbiAgbGV0IHJlZiA9IG5ldyBSZWZlcmVuY2VJbXBsKFJlZmVyZW5jZVR5cGUuVW5ib3VuZCk7XG5cbiAgcmVmLmxhc3RWYWx1ZSA9IHZhbHVlO1xuICByZWYudGFnID0gQ09OU1RBTlRfVEFHO1xuXG4gIGlmIChERUJVRykge1xuICAgIHJlZi5kZWJ1Z0xhYmVsID0gZGVidWdMYWJlbCBhcyBzdHJpbmc7XG4gIH1cblxuICByZXR1cm4gcmVmO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcHV0ZVJlZjxUID0gdW5rbm93bj4oXG4gIGNvbXB1dGU6ICgpID0+IFQsXG4gIHVwZGF0ZTogT3B0aW9uPCh2YWx1ZTogVCkgPT4gdm9pZD4gPSBudWxsLFxuICBkZWJ1Z0xhYmVsOiBmYWxzZSB8IHN0cmluZyA9ICd1bmtub3duJ1xuKTogUmVmZXJlbmNlPFQ+IHtcbiAgbGV0IHJlZiA9IG5ldyBSZWZlcmVuY2VJbXBsPFQ+KFJlZmVyZW5jZVR5cGUuQ29tcHV0ZSk7XG5cbiAgcmVmLmNvbXB1dGUgPSBjb21wdXRlO1xuICByZWYudXBkYXRlID0gdXBkYXRlO1xuXG4gIGlmIChERUJVRykge1xuICAgIHJlZi5kZWJ1Z0xhYmVsID0gYChyZXN1bHQgb2YgYSBcXGAke2RlYnVnTGFiZWx9XFxgIGhlbHBlcilgO1xuICB9XG5cbiAgcmV0dXJuIHJlZjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlYWRPbmx5UmVmKHJlZjogUmVmZXJlbmNlKTogUmVmZXJlbmNlIHtcbiAgaWYgKCFpc1VwZGF0YWJsZVJlZihyZWYpKSByZXR1cm4gcmVmO1xuXG4gIHJldHVybiBjcmVhdGVDb21wdXRlUmVmKCgpID0+IHZhbHVlRm9yUmVmKHJlZiksIG51bGwsIHJlZi5kZWJ1Z0xhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSW52b2thYmxlUmVmKHJlZjogUmVmZXJlbmNlKSB7XG4gIHJldHVybiByZWZbUkVGRVJFTkNFXSA9PT0gUmVmZXJlbmNlVHlwZS5JbnZva2FibGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJbnZva2FibGVSZWYoaW5uZXI6IFJlZmVyZW5jZSk6IFJlZmVyZW5jZSB7XG4gIGxldCByZWYgPSBjcmVhdGVDb21wdXRlUmVmKFxuICAgICgpID0+IHZhbHVlRm9yUmVmKGlubmVyKSxcbiAgICAodmFsdWUpID0+IHVwZGF0ZVJlZihpbm5lciwgdmFsdWUpXG4gICk7XG4gIHJlZi5kZWJ1Z0xhYmVsID0gaW5uZXIuZGVidWdMYWJlbDtcbiAgcmVmW1JFRkVSRU5DRV0gPSBSZWZlcmVuY2VUeXBlLkludm9rYWJsZTtcblxuICByZXR1cm4gcmVmO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb25zdFJlZihfcmVmOiBSZWZlcmVuY2UpIHtcbiAgbGV0IHJlZiA9IF9yZWYgYXMgUmVmZXJlbmNlSW1wbDtcblxuICByZXR1cm4gcmVmLnRhZyA9PT0gQ09OU1RBTlRfVEFHO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNVcGRhdGFibGVSZWYoX3JlZjogUmVmZXJlbmNlKSB7XG4gIGxldCByZWYgPSBfcmVmIGFzIFJlZmVyZW5jZUltcGw7XG5cbiAgcmV0dXJuIHJlZi51cGRhdGUgIT09IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWx1ZUZvclJlZjxUPihfcmVmOiBSZWZlcmVuY2U8VD4pOiBUIHtcbiAgbGV0IHJlZiA9IF9yZWYgYXMgUmVmZXJlbmNlSW1wbDxUPjtcblxuICBsZXQgeyB0YWcgfSA9IHJlZjtcblxuICBpZiAodGFnID09PSBDT05TVEFOVF9UQUcpIHtcbiAgICByZXR1cm4gcmVmLmxhc3RWYWx1ZSBhcyBUO1xuICB9XG5cbiAgbGV0IHsgbGFzdFJldmlzaW9uIH0gPSByZWY7XG4gIGxldCBsYXN0VmFsdWU7XG5cbiAgaWYgKHRhZyA9PT0gbnVsbCB8fCAhdmFsaWRhdGVUYWcodGFnLCBsYXN0UmV2aXNpb24pKSB7XG4gICAgbGV0IHsgY29tcHV0ZSB9ID0gcmVmO1xuXG4gICAgdGFnID0gcmVmLnRhZyA9IHRyYWNrKCgpID0+IHtcbiAgICAgIGxhc3RWYWx1ZSA9IHJlZi5sYXN0VmFsdWUgPSBjb21wdXRlISgpO1xuICAgIH0sIERFQlVHICYmIHJlZi5kZWJ1Z0xhYmVsKTtcblxuICAgIHJlZi5sYXN0UmV2aXNpb24gPSB2YWx1ZUZvclRhZyh0YWcpO1xuICB9IGVsc2Uge1xuICAgIGxhc3RWYWx1ZSA9IHJlZi5sYXN0VmFsdWU7XG4gIH1cblxuICBjb25zdW1lVGFnKHRhZyk7XG5cbiAgcmV0dXJuIGxhc3RWYWx1ZSBhcyBUO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlUmVmKF9yZWY6IFJlZmVyZW5jZSwgdmFsdWU6IHVua25vd24pIHtcbiAgbGV0IHJlZiA9IF9yZWYgYXMgUmVmZXJlbmNlSW1wbDtcblxuICBsZXQgdXBkYXRlID0gZXhwZWN0KHJlZi51cGRhdGUsICdjYWxsZWQgdXBkYXRlIG9uIGEgbm9uLXVwZGF0YWJsZSByZWZlcmVuY2UnKTtcblxuICB1cGRhdGUodmFsdWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hpbGRSZWZGb3IoX3BhcmVudFJlZjogUmVmZXJlbmNlLCBwYXRoOiBzdHJpbmcpOiBSZWZlcmVuY2Uge1xuICBsZXQgcGFyZW50UmVmID0gX3BhcmVudFJlZiBhcyBSZWZlcmVuY2VJbXBsO1xuXG4gIGxldCB0eXBlID0gcGFyZW50UmVmW1JFRkVSRU5DRV07XG5cbiAgbGV0IGNoaWxkcmVuID0gcGFyZW50UmVmLmNoaWxkcmVuO1xuICBsZXQgY2hpbGQ6IFJlZmVyZW5jZTtcblxuICBpZiAoY2hpbGRyZW4gPT09IG51bGwpIHtcbiAgICBjaGlsZHJlbiA9IHBhcmVudFJlZi5jaGlsZHJlbiA9IG5ldyBNYXAoKTtcbiAgfSBlbHNlIHtcbiAgICBjaGlsZCA9IGNoaWxkcmVuLmdldChwYXRoKSE7XG5cbiAgICBpZiAoY2hpbGQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlID09PSBSZWZlcmVuY2VUeXBlLlVuYm91bmQpIHtcbiAgICBsZXQgcGFyZW50ID0gdmFsdWVGb3JSZWYocGFyZW50UmVmKTtcblxuICAgIGlmIChpc0RpY3QocGFyZW50KSkge1xuICAgICAgY2hpbGQgPSBjcmVhdGVVbmJvdW5kUmVmKFxuICAgICAgICAocGFyZW50IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVtwYXRoXSxcbiAgICAgICAgREVCVUcgJiYgYCR7cGFyZW50UmVmLmRlYnVnTGFiZWx9LiR7cGF0aH1gXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGlsZCA9IFVOREVGSU5FRF9SRUZFUkVOQ0U7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNoaWxkID0gY3JlYXRlQ29tcHV0ZVJlZihcbiAgICAgICgpID0+IHtcbiAgICAgICAgbGV0IHBhcmVudCA9IHZhbHVlRm9yUmVmKHBhcmVudFJlZik7XG5cbiAgICAgICAgaWYgKGlzRGljdChwYXJlbnQpKSB7XG4gICAgICAgICAgcmV0dXJuIGdldFByb3AocGFyZW50LCBwYXRoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgICh2YWwpID0+IHtcbiAgICAgICAgbGV0IHBhcmVudCA9IHZhbHVlRm9yUmVmKHBhcmVudFJlZik7XG5cbiAgICAgICAgaWYgKGlzRGljdChwYXJlbnQpKSB7XG4gICAgICAgICAgcmV0dXJuIHNldFByb3AocGFyZW50LCBwYXRoLCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcblxuICAgIGlmIChERUJVRykge1xuICAgICAgY2hpbGQuZGVidWdMYWJlbCA9IGAke3BhcmVudFJlZi5kZWJ1Z0xhYmVsfS4ke3BhdGh9YDtcbiAgICB9XG4gIH1cblxuICBjaGlsZHJlbi5zZXQocGF0aCwgY2hpbGQpO1xuXG4gIHJldHVybiBjaGlsZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoaWxkUmVmRnJvbVBhcnRzKHJvb3Q6IFJlZmVyZW5jZSwgcGFydHM6IHN0cmluZ1tdKTogUmVmZXJlbmNlIHtcbiAgbGV0IHJlZmVyZW5jZSA9IHJvb3Q7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIHJlZmVyZW5jZSA9IGNoaWxkUmVmRm9yKHJlZmVyZW5jZSwgcGFydHNbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJlZmVyZW5jZTtcbn1cblxuZXhwb3J0IGxldCBjcmVhdGVEZWJ1Z0FsaWFzUmVmOiB1bmRlZmluZWQgfCAoKGRlYnVnTGFiZWw6IHN0cmluZywgaW5uZXI6IFJlZmVyZW5jZSkgPT4gUmVmZXJlbmNlKTtcblxuaWYgKERFQlVHKSB7XG4gIGNyZWF0ZURlYnVnQWxpYXNSZWYgPSAoZGVidWdMYWJlbDogc3RyaW5nLCBpbm5lcjogUmVmZXJlbmNlKSA9PiB7XG4gICAgbGV0IHVwZGF0ZSA9IGlzVXBkYXRhYmxlUmVmKGlubmVyKSA/ICh2YWx1ZTogdW5rbm93bikgPT4gdXBkYXRlUmVmKGlubmVyLCB2YWx1ZSkgOiBudWxsO1xuICAgIGxldCByZWYgPSBjcmVhdGVDb21wdXRlUmVmKCgpID0+IHZhbHVlRm9yUmVmKGlubmVyKSwgdXBkYXRlKTtcblxuICAgIHJlZltSRUZFUkVOQ0VdID0gaW5uZXJbUkVGRVJFTkNFXTtcblxuICAgIHJlZi5kZWJ1Z0xhYmVsID0gZGVidWdMYWJlbDtcblxuICAgIHJldHVybiByZWY7XG4gIH07XG59XG4iLCJpbXBvcnQgeyBnZXRQYXRoLCB0b0l0ZXJhdG9yIH0gZnJvbSAnQGdsaW1tZXIvZ2xvYmFsLWNvbnRleHQnO1xuaW1wb3J0IHsgT3B0aW9uLCBEaWN0IH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBFTVBUWV9BUlJBWSwgaXNPYmplY3QgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IERFQlVHIH0gZnJvbSAnQGdsaW1tZXIvZW52JztcbmltcG9ydCB7IGNyZWF0ZVRhZywgY29uc3VtZVRhZywgZGlydHlUYWcgfSBmcm9tICdAZ2xpbW1lci92YWxpZGF0b3InO1xuaW1wb3J0IHsgUmVmZXJlbmNlLCBSZWZlcmVuY2VFbnZpcm9ubWVudCwgdmFsdWVGb3JSZWYsIGNyZWF0ZUNvbXB1dGVSZWYgfSBmcm9tICcuL3JlZmVyZW5jZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmF0aW9uSXRlbTxULCBVPiB7XG4gIGtleTogdW5rbm93bjtcbiAgdmFsdWU6IFQ7XG4gIG1lbW86IFU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWJzdHJhY3RJdGVyYXRvcjxULCBVLCBWIGV4dGVuZHMgSXRlcmF0aW9uSXRlbTxULCBVPj4ge1xuICBpc0VtcHR5KCk6IGJvb2xlYW47XG4gIG5leHQoKTogT3B0aW9uPFY+O1xufVxuXG5leHBvcnQgdHlwZSBPcGFxdWVJdGVyYXRpb25JdGVtID0gSXRlcmF0aW9uSXRlbTx1bmtub3duLCB1bmtub3duPjtcbmV4cG9ydCB0eXBlIE9wYXF1ZUl0ZXJhdG9yID0gQWJzdHJhY3RJdGVyYXRvcjx1bmtub3duLCB1bmtub3duLCBPcGFxdWVJdGVyYXRpb25JdGVtPjtcblxuZXhwb3J0IGludGVyZmFjZSBJdGVyYXRvckRlbGVnYXRlIHtcbiAgaXNFbXB0eSgpOiBib29sZWFuO1xuICBuZXh0KCk6IHsgdmFsdWU6IHVua25vd247IG1lbW86IHVua25vd24gfSB8IG51bGw7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmF0b3JSZWZlcmVuY2VFbnZpcm9ubWVudCBleHRlbmRzIFJlZmVyZW5jZUVudmlyb25tZW50IHtcbiAgZ2V0UGF0aChvYmo6IHVua25vd24sIHBhdGg6IHN0cmluZyk6IHVua25vd247XG4gIHRvSXRlcmF0b3Iob2JqOiB1bmtub3duKTogT3B0aW9uPEl0ZXJhdG9yRGVsZWdhdGU+O1xufVxuXG50eXBlIEtleUZvciA9IChpdGVtOiB1bmtub3duLCBpbmRleDogdW5rbm93bikgPT4gdW5rbm93bjtcblxuY29uc3QgTlVMTF9JREVOVElUWSA9IHt9O1xuXG5jb25zdCBLRVk6IEtleUZvciA9IChfLCBpbmRleCkgPT4gaW5kZXg7XG5jb25zdCBJTkRFWDogS2V5Rm9yID0gKF8sIGluZGV4KSA9PiBTdHJpbmcoaW5kZXgpO1xuY29uc3QgSURFTlRJVFk6IEtleUZvciA9IChpdGVtKSA9PiB7XG4gIGlmIChpdGVtID09PSBudWxsKSB7XG4gICAgLy8gUmV0dXJuaW5nIG51bGwgYXMgYW4gaWRlbnRpdHkgd2lsbCBjYXVzZSBmYWlsdXJlcyBzaW5jZSB0aGUgaXRlcmF0b3JcbiAgICAvLyBjYW4ndCB0ZWxsIHRoYXQgaXQncyBhY3R1YWxseSBzdXBwb3NlZCB0byBiZSBudWxsXG4gICAgcmV0dXJuIE5VTExfSURFTlRJVFk7XG4gIH1cblxuICByZXR1cm4gaXRlbTtcbn07XG5cbmZ1bmN0aW9uIGtleUZvclBhdGgocGF0aDogc3RyaW5nKTogS2V5Rm9yIHtcbiAgaWYgKERFQlVHICYmIHBhdGhbMF0gPT09ICdAJykge1xuICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBrZXlwYXRoOiAnJHtwYXRofScsIHZhbGlkIGtleXM6IEBpbmRleCwgQGlkZW50aXR5LCBvciBhIHBhdGhgKTtcbiAgfVxuICByZXR1cm4gdW5pcXVlS2V5Rm9yKChpdGVtKSA9PiBnZXRQYXRoKGl0ZW0gYXMgb2JqZWN0LCBwYXRoKSk7XG59XG5cbmZ1bmN0aW9uIG1ha2VLZXlGb3Ioa2V5OiBzdHJpbmcpIHtcbiAgc3dpdGNoIChrZXkpIHtcbiAgICBjYXNlICdAa2V5JzpcbiAgICAgIHJldHVybiB1bmlxdWVLZXlGb3IoS0VZKTtcbiAgICBjYXNlICdAaW5kZXgnOlxuICAgICAgcmV0dXJuIHVuaXF1ZUtleUZvcihJTkRFWCk7XG4gICAgY2FzZSAnQGlkZW50aXR5JzpcbiAgICAgIHJldHVybiB1bmlxdWVLZXlGb3IoSURFTlRJVFkpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ga2V5Rm9yUGF0aChrZXkpO1xuICB9XG59XG5cbmNsYXNzIFdlYWtNYXBXaXRoUHJpbWl0aXZlczxUPiB7XG4gIHByaXZhdGUgX3dlYWtNYXA/OiBXZWFrTWFwPG9iamVjdCwgVD47XG4gIHByaXZhdGUgX3ByaW1pdGl2ZU1hcD86IE1hcDx1bmtub3duLCBUPjtcblxuICBwcml2YXRlIGdldCB3ZWFrTWFwKCkge1xuICAgIGlmICh0aGlzLl93ZWFrTWFwID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX3dlYWtNYXAgPSBuZXcgV2Vha01hcCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl93ZWFrTWFwO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgcHJpbWl0aXZlTWFwKCkge1xuICAgIGlmICh0aGlzLl9wcmltaXRpdmVNYXAgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fcHJpbWl0aXZlTWFwID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9wcmltaXRpdmVNYXA7XG4gIH1cblxuICBzZXQoa2V5OiB1bmtub3duLCB2YWx1ZTogVCkge1xuICAgIGlmIChpc09iamVjdChrZXkpKSB7XG4gICAgICB0aGlzLndlYWtNYXAuc2V0KGtleSBhcyBvYmplY3QsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcmltaXRpdmVNYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIGdldChrZXk6IHVua25vd24pOiBUIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoaXNPYmplY3Qoa2V5KSkge1xuICAgICAgcmV0dXJuIHRoaXMud2Vha01hcC5nZXQoa2V5IGFzIG9iamVjdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnByaW1pdGl2ZU1hcC5nZXQoa2V5KTtcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgSURFTlRJVElFUyA9IG5ldyBXZWFrTWFwV2l0aFByaW1pdGl2ZXM8b2JqZWN0W10+KCk7XG5cbmZ1bmN0aW9uIGlkZW50aXR5Rm9yTnRoT2NjdXJlbmNlKHZhbHVlOiBhbnksIGNvdW50OiBudW1iZXIpIHtcbiAgbGV0IGlkZW50aXRpZXMgPSBJREVOVElUSUVTLmdldCh2YWx1ZSk7XG5cbiAgaWYgKGlkZW50aXRpZXMgPT09IHVuZGVmaW5lZCkge1xuICAgIGlkZW50aXRpZXMgPSBbXTtcbiAgICBJREVOVElUSUVTLnNldCh2YWx1ZSwgaWRlbnRpdGllcyk7XG4gIH1cblxuICBsZXQgaWRlbnRpdHkgPSBpZGVudGl0aWVzW2NvdW50XTtcblxuICBpZiAoaWRlbnRpdHkgPT09IHVuZGVmaW5lZCkge1xuICAgIGlkZW50aXR5ID0geyB2YWx1ZSwgY291bnQgfTtcbiAgICBpZGVudGl0aWVzW2NvdW50XSA9IGlkZW50aXR5O1xuICB9XG5cbiAgcmV0dXJuIGlkZW50aXR5O1xufVxuXG4vKipcbiAqIFdoZW4gaXRlcmF0aW5nIG92ZXIgYSBsaXN0LCBpdCdzIHBvc3NpYmxlIHRoYXQgYW4gaXRlbSB3aXRoIHRoZSBzYW1lIHVuaXF1ZVxuICoga2V5IGNvdWxkIGJlIGVuY291bnRlcmVkIHR3aWNlOlxuICpcbiAqIGBgYGpzXG4gKiBsZXQgYXJyID0gWydzYW1lJywgJ2RpZmZlcmVudCcsICdzYW1lJywgJ3NhbWUnXTtcbiAqIGBgYFxuICpcbiAqIEluIGdlbmVyYWwsIHdlIHdhbnQgdG8gdHJlYXQgdGhlc2UgaXRlbXMgYXMgX3VuaXF1ZSB3aXRoaW4gdGhlIGxpc3RfLiBUbyBkb1xuICogdGhpcywgd2UgdHJhY2sgdGhlIG9jY3VyZW5jZXMgb2YgZXZlcnkgaXRlbSBhcyB3ZSBpdGVyYXRlIHRoZSBsaXN0LCBhbmQgd2hlblxuICogYW4gaXRlbSBvY2N1cnMgbW9yZSB0aGFuIG9uY2UsIHdlIGdlbmVyYXRlIGEgbmV3IHVuaXF1ZSBrZXkganVzdCBmb3IgdGhhdFxuICogaXRlbSwgYW5kIHRoYXQgb2NjdXJlbmNlIHdpdGhpbiB0aGUgbGlzdC4gVGhlIG5leHQgdGltZSB3ZSBpdGVyYXRlIHRoZSBsaXN0LFxuICogYW5kIGVuY291bnRlciBhbiBpdGVtIGZvciB0aGUgbnRoIHRpbWUsIHdlIGNhbiBnZXQgdGhlIF9zYW1lXyBrZXksIGFuZCBsZXRcbiAqIEdsaW1tZXIga25vdyB0aGF0IGl0IHNob3VsZCByZXVzZSB0aGUgRE9NIGZvciB0aGUgcHJldmlvdXMgbnRoIG9jY3VyZW5jZS5cbiAqL1xuZnVuY3Rpb24gdW5pcXVlS2V5Rm9yKGtleUZvcjogS2V5Rm9yKSB7XG4gIGxldCBzZWVuID0gbmV3IFdlYWtNYXBXaXRoUHJpbWl0aXZlczxudW1iZXI+KCk7XG5cbiAgcmV0dXJuICh2YWx1ZTogdW5rbm93biwgbWVtbzogdW5rbm93bikgPT4ge1xuICAgIGxldCBrZXkgPSBrZXlGb3IodmFsdWUsIG1lbW8pO1xuICAgIGxldCBjb3VudCA9IHNlZW4uZ2V0KGtleSkgfHwgMDtcblxuICAgIHNlZW4uc2V0KGtleSwgY291bnQgKyAxKTtcblxuICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGtleTtcbiAgICB9XG5cbiAgICByZXR1cm4gaWRlbnRpdHlGb3JOdGhPY2N1cmVuY2Uoa2V5LCBjb3VudCk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJdGVyYXRvclJlZihsaXN0UmVmOiBSZWZlcmVuY2UsIGtleTogc3RyaW5nKSB7XG4gIHJldHVybiBjcmVhdGVDb21wdXRlUmVmKCgpID0+IHtcbiAgICBsZXQgaXRlcmFibGUgPSB2YWx1ZUZvclJlZihsaXN0UmVmKSBhcyB7IFtTeW1ib2wuaXRlcmF0b3JdOiBhbnkgfSB8IG51bGwgfCBmYWxzZTtcblxuICAgIGxldCBrZXlGb3IgPSBtYWtlS2V5Rm9yKGtleSk7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVyYWJsZSkpIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcihpdGVyYWJsZSwga2V5Rm9yKTtcbiAgICB9XG5cbiAgICBsZXQgbWF5YmVJdGVyYXRvciA9IHRvSXRlcmF0b3IoaXRlcmFibGUpO1xuXG4gICAgaWYgKG1heWJlSXRlcmF0b3IgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcihFTVBUWV9BUlJBWSwgKCkgPT4gbnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBJdGVyYXRvcldyYXBwZXIobWF5YmVJdGVyYXRvciwga2V5Rm9yKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJdGVyYXRvckl0ZW1SZWYoX3ZhbHVlOiB1bmtub3duKSB7XG4gIGxldCB2YWx1ZSA9IF92YWx1ZTtcbiAgbGV0IHRhZyA9IGNyZWF0ZVRhZygpO1xuXG4gIHJldHVybiBjcmVhdGVDb21wdXRlUmVmKFxuICAgICgpID0+IHtcbiAgICAgIGNvbnN1bWVUYWcodGFnKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuICAgIChuZXdWYWx1ZSkgPT4ge1xuICAgICAgaWYgKHZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICB2YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICBkaXJ0eVRhZyh0YWcpO1xuICAgICAgfVxuICAgIH1cbiAgKTtcbn1cblxuY2xhc3MgSXRlcmF0b3JXcmFwcGVyIGltcGxlbWVudHMgT3BhcXVlSXRlcmF0b3Ige1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBJdGVyYXRvckRlbGVnYXRlLCBwcml2YXRlIGtleUZvcjogS2V5Rm9yKSB7fVxuXG4gIGlzRW1wdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXIuaXNFbXB0eSgpO1xuICB9XG5cbiAgbmV4dCgpIHtcbiAgICBsZXQgbmV4dFZhbHVlID0gdGhpcy5pbm5lci5uZXh0KCkgYXMgT3BhcXVlSXRlcmF0aW9uSXRlbTtcblxuICAgIGlmIChuZXh0VmFsdWUgIT09IG51bGwpIHtcbiAgICAgIG5leHRWYWx1ZS5rZXkgPSB0aGlzLmtleUZvcihuZXh0VmFsdWUudmFsdWUsIG5leHRWYWx1ZS5tZW1vKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dFZhbHVlO1xuICB9XG59XG5cbmNsYXNzIEFycmF5SXRlcmF0b3IgaW1wbGVtZW50cyBPcGFxdWVJdGVyYXRvciB7XG4gIHByaXZhdGUgY3VycmVudDogeyBraW5kOiAnZW1wdHknIH0gfCB7IGtpbmQ6ICdmaXJzdCc7IHZhbHVlOiB1bmtub3duIH0gfCB7IGtpbmQ6ICdwcm9ncmVzcycgfTtcbiAgcHJpdmF0ZSBwb3MgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaXRlcmF0b3I6IHVua25vd25bXSB8IHJlYWRvbmx5IHVua25vd25bXSwgcHJpdmF0ZSBrZXlGb3I6IEtleUZvcikge1xuICAgIGlmIChpdGVyYXRvci5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHsga2luZDogJ2VtcHR5JyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB7IGtpbmQ6ICdmaXJzdCcsIHZhbHVlOiBpdGVyYXRvclt0aGlzLnBvc10gfTtcbiAgICB9XG4gIH1cblxuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnQua2luZCA9PT0gJ2VtcHR5JztcbiAgfVxuXG4gIG5leHQoKTogT3B0aW9uPEl0ZXJhdGlvbkl0ZW08dW5rbm93biwgbnVtYmVyPj4ge1xuICAgIGxldCB2YWx1ZTogdW5rbm93bjtcblxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5jdXJyZW50O1xuICAgIGlmIChjdXJyZW50LmtpbmQgPT09ICdmaXJzdCcpIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHsga2luZDogJ3Byb2dyZXNzJyB9O1xuICAgICAgdmFsdWUgPSBjdXJyZW50LnZhbHVlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wb3MgPj0gdGhpcy5pdGVyYXRvci5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSB0aGlzLml0ZXJhdG9yWysrdGhpcy5wb3NdO1xuICAgIH1cblxuICAgIGxldCB7IGtleUZvciB9ID0gdGhpcztcblxuICAgIGxldCBrZXkgPSBrZXlGb3IodmFsdWUgYXMgRGljdCwgdGhpcy5wb3MpO1xuICAgIGxldCBtZW1vID0gdGhpcy5wb3M7XG5cbiAgICByZXR1cm4geyBrZXksIHZhbHVlLCBtZW1vIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJzeW1ib2wiLCJJTklUSUFMIiwiQ09OU1RBTlRfVEFHIiwiREVCVUciLCJ2YWxpZGF0ZVRhZyIsInRyYWNrIiwidmFsdWVGb3JUYWciLCJjb25zdW1lVGFnIiwiaXNEaWN0IiwiZ2V0UHJvcCIsInNldFByb3AiLCJjcmVhdGVEZWJ1Z0FsaWFzUmVmIiwiZ2V0UGF0aCIsImlzT2JqZWN0IiwidG9JdGVyYXRvciIsIkVNUFRZX0FSUkFZIiwiY3JlYXRlVGFnIiwiZGlydHlUYWciXSwibWFwcGluZ3MiOiI7O01BZWEsU0FBUyxHQUFrQkEsV0FBTSxDQUF2QyxXQUF1Qzs7TUF3QjlDLGdCQWFFLHVCQUFBLElBQUEsRUFBK0I7RUFY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
