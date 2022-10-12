define('@glimmer/validator', ['exports', '@glimmer/env', '@glimmer/global-context'], function (exports, env, globalContext) { 'use strict';

  // eslint-disable-next-line @typescript-eslint/ban-types
  function indexable(input) {
    return input;
  } // This is a duplicate utility from @glimmer/util because `@glimmer/validator`
  // should not depend on any other @glimmer packages, in order to avoid pulling
  // in types and prevent regressions in `@glimmer/tracking` (which has public types).

  var symbol = typeof Symbol !== 'undefined' ? Symbol : // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function (key) {
    return "__" + key + Math.floor(Math.random() * Date.now()) + "__";
  }; // eslint-disable-next-line @typescript-eslint/no-explicit-any

  var symbolFor = typeof Symbol !== 'undefined' ? Symbol["for"] : function (key) {
    return "__GLIMMER_VALIDATOR_SYMBOL_FOR_" + key;
  };
  function getGlobal() {
    // eslint-disable-next-line node/no-unsupported-features/es-builtins
    if (typeof globalThis !== 'undefined') return indexable(globalThis);
    if (typeof self !== 'undefined') return indexable(self);
    if (typeof window !== 'undefined') return indexable(window);
    if (typeof global !== 'undefined') return indexable(global);
    throw new Error('unable to locate global object');
  }
  function unwrap(val) {
    if (val === null || val === undefined) throw new Error("Expected value to be present");
    return val;
  }

  var resetTrackingTransaction;
  var assertTagNotConsumed;

  var _markTagAsConsumed;

  if (env.DEBUG) {
    var CONSUMED_TAGS = null;
    var TRANSACTION_STACK = []; /////////

    var TRANSACTION_ENV = {
      debugMessage: function debugMessage(obj, keyName) {
        var objName;

        if (typeof obj === 'function') {
          objName = obj.name;
        } else if (typeof obj === 'object' && obj !== null) {
          var className = obj.constructor && obj.constructor.name || '(unknown class)';
          objName = "(an instance of " + className + ")";
        } else if (obj === undefined) {
          objName = '(an unknown tag)';
        } else {
          objName = String(obj);
        }

        var dirtyString = keyName ? "`" + keyName + "` on `" + objName + "`" : "`" + objName + "`";
        return "You attempted to update " + dirtyString + ", but it had already been used previously in the same computation.  Attempting to update a value after using it in a computation can cause logical errors, infinite revalidation bugs, and performance issues, and is not supported.";
      }
    };

    exports.setTrackingTransactionEnv = function setTrackingTransactionEnv(env) {
      return Object.assign(TRANSACTION_ENV, env);
    };

    exports.beginTrackingTransaction = function beginTrackingTransaction(_debugLabel) {
      CONSUMED_TAGS = CONSUMED_TAGS || new WeakMap();
      var debugLabel = _debugLabel || undefined;
      var parent = TRANSACTION_STACK[TRANSACTION_STACK.length - 1] || null;
      TRANSACTION_STACK.push({
        parent: parent,
        debugLabel: debugLabel
      });
    };

    exports.endTrackingTransaction = function endTrackingTransaction() {
      if (TRANSACTION_STACK.length === 0) {
        throw new Error('attempted to close a tracking transaction, but one was not open');
      }

      TRANSACTION_STACK.pop();

      if (TRANSACTION_STACK.length === 0) {
        CONSUMED_TAGS = null;
      }
    };

    resetTrackingTransaction = function resetTrackingTransaction() {
      var stack = '';

      if (TRANSACTION_STACK.length > 0) {
        stack = exports.logTrackingStack(TRANSACTION_STACK[TRANSACTION_STACK.length - 1]);
      }

      TRANSACTION_STACK = [];
      CONSUMED_TAGS = null;
      return stack;
    };
    /**
     * Creates a global autotracking transaction. This will prevent any backflow
     * in any `track` calls within the transaction, even if they are not
     * externally consumed.
     *
     * `runInAutotrackingTransaction` can be called within itself, and it will add
     * onto the existing transaction if one exists.
     *
     * TODO: Only throw an error if the `track` is consumed.
     */


    exports.runInTrackingTransaction = function runInTrackingTransaction(fn, debugLabel) {
      exports.beginTrackingTransaction(debugLabel);
      var didError = true;

      try {
        var value = fn();
        didError = false;
        return value;
      } finally {
        if (didError !== true) {
          exports.endTrackingTransaction();
        }
      }
    };

    var nthIndex = function nthIndex(str, pattern, n, startingPos) {
      if (startingPos === void 0) {
        startingPos = -1;
      }

      var i = startingPos;

      while (n-- > 0 && i++ < str.length) {
        i = str.indexOf(pattern, i);
        if (i < 0) break;
      }

      return i;
    };

    var makeTrackingErrorMessage = function makeTrackingErrorMessage(transaction, obj, keyName) {
      var message = [TRANSACTION_ENV.debugMessage(obj, keyName && String(keyName))];
      message.push("`" + String(keyName) + "` was first used:");
      message.push(exports.logTrackingStack(transaction));
      message.push("Stack trace for the update:");
      return message.join('\n\n');
    };

    exports.logTrackingStack = function logTrackingStack(transaction) {
      var trackingStack = [];
      var current = transaction || TRANSACTION_STACK[TRANSACTION_STACK.length - 1];
      if (current === undefined) return '';

      while (current) {
        if (current.debugLabel) {
          trackingStack.unshift(current.debugLabel);
        }

        current = current.parent;
      } // TODO: Use String.prototype.repeat here once we can drop support for IE11


      return trackingStack.map(function (label, index) {
        return Array(2 * index + 1).join(' ') + label;
      }).join('\n');
    };

    _markTagAsConsumed = function markTagAsConsumed(_tag) {
      if (!CONSUMED_TAGS || CONSUMED_TAGS.has(_tag)) return;
      CONSUMED_TAGS.set(_tag, TRANSACTION_STACK[TRANSACTION_STACK.length - 1]); // We need to mark the tag and all of its subtags as consumed, so we need to
      // cast it and access its internals. In the future this shouldn't be necessary,
      // this is only for computed properties.

      var tag = _tag;

      if (tag.subtag) {
        _markTagAsConsumed(tag.subtag);
      }

      if (tag.subtags) {
        tag.subtags.forEach(function (tag) {
          return _markTagAsConsumed(tag);
        });
      }
    };

    assertTagNotConsumed = function assertTagNotConsumed(tag, obj, keyName) {
      if (CONSUMED_TAGS === null) return;
      var transaction = CONSUMED_TAGS.get(tag);
      if (!transaction) return; // This hack makes the assertion message nicer, we can cut off the first
      // few lines of the stack trace and let users know where the actual error
      // occurred.

      try {
        globalContext.assert(false, makeTrackingErrorMessage(transaction, obj, keyName));
      } catch (e) {
        if (e.stack) {
          var updateStackBegin = e.stack.indexOf('Stack trace for the update:');

          if (updateStackBegin !== -1) {
            var start = nthIndex(e.stack, '\n', 1, updateStackBegin);
            var end = nthIndex(e.stack, '\n', 4, updateStackBegin);
            e.stack = e.stack.substr(0, start) + e.stack.substr(end);
          }
        }

        throw e;
      }
    };
  }

  var CONSTANT = 0;
  var INITIAL = 1;
  var VOLATILE = NaN;
  var $REVISION = INITIAL;
  function bump() {
    $REVISION++;
  } //////////

  var COMPUTE = symbol('TAG_COMPUTE'); //////////

  /**
   * `value` receives a tag and returns an opaque Revision based on that tag. This
   * snapshot can then later be passed to `validate` with the same tag to
   * determine if the tag has changed at all since the time that `value` was
   * called.
   *
   * @param tag
   */

  function valueForTag(tag) {
    return tag[COMPUTE]();
  }
  /**
   * `validate` receives a tag and a snapshot from a previous call to `value` with
   * the same tag, and determines if the tag is still valid compared to the
   * snapshot. If the tag's state has changed at all since then, `validate` will
   * return false, otherwise it will return true. This is used to determine if a
   * calculation related to the tags should be rerun.
   *
   * @param tag
   * @param snapshot
   */

  function validateTag(tag, snapshot) {
    return snapshot >= tag[COMPUTE]();
  }
  var TYPE = symbol('TAG_TYPE'); // this is basically a const

  if (env.DEBUG) {
    exports.ALLOW_CYCLES = new WeakMap();
  }

  function allowsCycles(tag) {
    if (exports.ALLOW_CYCLES === undefined) {
      return true;
    } else {
      return exports.ALLOW_CYCLES.has(tag);
    }
  }

  var MonomorphicTagImpl = /*#__PURE__*/function () {
    function MonomorphicTagImpl(type) {
      this.revision = INITIAL;
      this.lastChecked = INITIAL;
      this.lastValue = INITIAL;
      this.isUpdating = false;
      this.subtag = null;
      this.subtagBufferCache = null;
      this[TYPE] = type;
    }

    MonomorphicTagImpl.combine = function combine(tags) {
      switch (tags.length) {
        case 0:
          return CONSTANT_TAG;

        case 1:
          return tags[0];

        default:
          var tag = new MonomorphicTagImpl(2
          /* Combinator */
          );
          tag.subtag = tags;
          return tag;
      }
    };

    var _proto = MonomorphicTagImpl.prototype;

    _proto[COMPUTE] = function () {
      var lastChecked = this.lastChecked;

      if (this.isUpdating === true) {
        if (env.DEBUG && !allowsCycles(this)) {
          throw new Error('Cycles in tags are not allowed');
        }

        this.lastChecked = ++$REVISION;
      } else if (lastChecked !== $REVISION) {
        this.isUpdating = true;
        this.lastChecked = $REVISION;

        try {
          var subtag = this.subtag,
              revision = this.revision;

          if (subtag !== null) {
            if (Array.isArray(subtag)) {
              for (var i = 0; i < subtag.length; i++) {
                var value = subtag[i][COMPUTE]();
                revision = Math.max(value, revision);
              }
            } else {
              var subtagValue = subtag[COMPUTE]();

              if (subtagValue === this.subtagBufferCache) {
                revision = Math.max(revision, this.lastValue);
              } else {
                // Clear the temporary buffer cache
                this.subtagBufferCache = null;
                revision = Math.max(revision, subtagValue);
              }
            }
          }

          this.lastValue = revision;
        } finally {
          this.isUpdating = false;
        }
      }

      return this.lastValue;
    };

    MonomorphicTagImpl.updateTag = function updateTag(_tag, _subtag) {
      if (env.DEBUG && _tag[TYPE] !== 1
      /* Updatable */
      ) {
          throw new Error('Attempted to update a tag that was not updatable');
        } // TODO: TS 3.7 should allow us to do this via assertion


      var tag = _tag;
      var subtag = _subtag;

      if (subtag === CONSTANT_TAG) {
        tag.subtag = null;
      } else {
        // There are two different possibilities when updating a subtag:
        //
        // 1. subtag[COMPUTE]() <= tag[COMPUTE]();
        // 2. subtag[COMPUTE]() > tag[COMPUTE]();
        //
        // The first possibility is completely fine within our caching model, but
        // the second possibility presents a problem. If the parent tag has
        // already been read, then it's value is cached and will not update to
        // reflect the subtag's greater value. Next time the cache is busted, the
        // subtag's value _will_ be read, and it's value will be _greater_ than
        // the saved snapshot of the parent, causing the resulting calculation to
        // be rerun erroneously.
        //
        // In order to prevent this, when we first update to a new subtag we store
        // its computed value, and then check against that computed value on
        // subsequent updates. If its value hasn't changed, then we return the
        // parent's previous value. Once the subtag changes for the first time,
        // we clear the cache and everything is finally in sync with the parent.
        tag.subtagBufferCache = subtag[COMPUTE]();
        tag.subtag = subtag;
      }
    };

    MonomorphicTagImpl.dirtyTag = function dirtyTag(tag, disableConsumptionAssertion) {
      if (env.DEBUG && !(tag[TYPE] === 1
      /* Updatable */
      || tag[TYPE] === 0
      /* Dirtyable */
      )) {
        throw new Error('Attempted to dirty a tag that was not dirtyable');
      }

      if (env.DEBUG && disableConsumptionAssertion !== true) {
        // Usually by this point, we've already asserted with better error information,
        // but this is our last line of defense.
        unwrap(assertTagNotConsumed)(tag);
      }

      tag.revision = ++$REVISION;
      globalContext.scheduleRevalidate();
    };

    return MonomorphicTagImpl;
  }();

  var DIRTY_TAG = MonomorphicTagImpl.dirtyTag;
  var UPDATE_TAG = MonomorphicTagImpl.updateTag; //////////

  function createTag() {
    return new MonomorphicTagImpl(0
    /* Dirtyable */
    );
  }
  function createUpdatableTag() {
    return new MonomorphicTagImpl(1
    /* Updatable */
    );
  } //////////

  var CONSTANT_TAG = new MonomorphicTagImpl(3
  /* Constant */
  );
  function isConstTag(tag) {
    return tag === CONSTANT_TAG;
  } //////////

  var VolatileTag = /*#__PURE__*/function () {
    function VolatileTag() {}

    var _proto2 = VolatileTag.prototype;

    _proto2[COMPUTE] = function () {
      return VOLATILE;
    };

    return VolatileTag;
  }();
  var VOLATILE_TAG = new VolatileTag(); //////////

  var CurrentTag = /*#__PURE__*/function () {
    function CurrentTag() {}

    var _proto3 = CurrentTag.prototype;

    _proto3[COMPUTE] = function () {
      return $REVISION;
    };

    return CurrentTag;
  }();
  var CURRENT_TAG = new CurrentTag(); //////////

  var combine = MonomorphicTagImpl.combine; // Warm

  var tag1 = createUpdatableTag();
  var tag2 = createUpdatableTag();
  var tag3 = createUpdatableTag();
  valueForTag(tag1);
  DIRTY_TAG(tag1);
  valueForTag(tag1);
  UPDATE_TAG(tag1, combine([tag2, tag3]));
  valueForTag(tag1);
  DIRTY_TAG(tag2);
  valueForTag(tag1);
  DIRTY_TAG(tag3);
  valueForTag(tag1);
  UPDATE_TAG(tag1, tag3);
  valueForTag(tag1);
  DIRTY_TAG(tag3);
  valueForTag(tag1);

  function isObjectLike(u) {
    return typeof u === 'object' && u !== null || typeof u === 'function';
  }

  var TRACKED_TAGS = new WeakMap();
  function dirtyTagFor(obj, key, meta) {
    if (env.DEBUG && !isObjectLike(obj)) {
      throw new Error("BUG: Can't update a tag for a primitive");
    }

    var tags = meta === undefined ? TRACKED_TAGS.get(obj) : meta; // No tags have been setup for this object yet, return

    if (tags === undefined) return; // Dirty the tag for the specific property if it exists

    var propertyTag = tags.get(key);

    if (propertyTag !== undefined) {
      if (env.DEBUG) {
        unwrap(assertTagNotConsumed)(propertyTag, obj, key);
      }

      DIRTY_TAG(propertyTag, true);
    }
  }
  function tagMetaFor(obj) {
    var tags = TRACKED_TAGS.get(obj);

    if (tags === undefined) {
      tags = new Map();
      TRACKED_TAGS.set(obj, tags);
    }

    return tags;
  }
  function tagFor(obj, key, meta) {
    var tags = meta === undefined ? tagMetaFor(obj) : meta;
    var tag = tags.get(key);

    if (tag === undefined) {
      tag = createUpdatableTag();
      tags.set(key, tag);
    }

    return tag;
  }

  /**
   * An object that that tracks @tracked properties that were consumed.
   */

  var Tracker = /*#__PURE__*/function () {
    function Tracker() {
      this.tags = new Set();
      this.last = null;
    }

    var _proto = Tracker.prototype;

    _proto.add = function add(tag) {
      if (tag === CONSTANT_TAG) return;
      this.tags.add(tag);

      if (env.DEBUG) {
        unwrap(_markTagAsConsumed)(tag);
      }

      this.last = tag;
    };

    _proto.combine = function combine$1() {
      var tags = this.tags;

      if (tags.size === 0) {
        return CONSTANT_TAG;
      } else if (tags.size === 1) {
        return this.last;
      } else {
        var tagsArr = [];
        tags.forEach(function (tag) {
          return tagsArr.push(tag);
        });
        return combine(tagsArr);
      }
    };

    return Tracker;
  }();
  /**
   * Whenever a tracked computed property is entered, the current tracker is
   * saved off and a new tracker is replaced.
   *
   * Any tracked properties consumed are added to the current tracker.
   *
   * When a tracked computed property is exited, the tracker's tags are
   * combined and added to the parent tracker.
   *
   * The consequence is that each tracked computed property has a tag
   * that corresponds to the tracked properties consumed inside of
   * itself, including child tracked computed properties.
   */


  var CURRENT_TRACKER = null;
  var OPEN_TRACK_FRAMES = [];
  function beginTrackFrame(debuggingContext) {
    OPEN_TRACK_FRAMES.push(CURRENT_TRACKER);
    CURRENT_TRACKER = new Tracker();

    if (env.DEBUG) {
      unwrap(exports.beginTrackingTransaction)(debuggingContext);
    }
  }
  function endTrackFrame() {
    var current = CURRENT_TRACKER;

    if (env.DEBUG) {
      if (OPEN_TRACK_FRAMES.length === 0) {
        throw new Error('attempted to close a tracking frame, but one was not open');
      }

      unwrap(exports.endTrackingTransaction)();
    }

    CURRENT_TRACKER = OPEN_TRACK_FRAMES.pop() || null;
    return unwrap(current).combine();
  }
  function beginUntrackFrame() {
    OPEN_TRACK_FRAMES.push(CURRENT_TRACKER);
    CURRENT_TRACKER = null;
  }
  function endUntrackFrame() {
    if (env.DEBUG && OPEN_TRACK_FRAMES.length === 0) {
      throw new Error('attempted to close a tracking frame, but one was not open');
    }

    CURRENT_TRACKER = OPEN_TRACK_FRAMES.pop() || null;
  } // This function is only for handling errors and resetting to a valid state

  function resetTracking() {
    while (OPEN_TRACK_FRAMES.length > 0) {
      OPEN_TRACK_FRAMES.pop();
    }

    CURRENT_TRACKER = null;

    if (env.DEBUG) {
      return unwrap(resetTrackingTransaction)();
    }
  }
  function isTracking() {
    return CURRENT_TRACKER !== null;
  }
  function consumeTag(tag) {
    if (CURRENT_TRACKER !== null) {
      CURRENT_TRACKER.add(tag);
    }
  } //////////
  var FN = symbol('FN');
  var LAST_VALUE = symbol('LAST_VALUE');
  var TAG = symbol('TAG');
  var SNAPSHOT = symbol('SNAPSHOT');
  var DEBUG_LABEL = symbol('DEBUG_LABEL');
  function createCache(fn, debuggingLabel) {
    var _cache;

    if (env.DEBUG && !(typeof fn === 'function')) {
      throw new Error("createCache() must be passed a function as its first parameter. Called with: " + String(fn));
    }

    var cache = (_cache = {}, _cache[FN] = fn, _cache[LAST_VALUE] = undefined, _cache[TAG] = undefined, _cache[SNAPSHOT] = -1, _cache);

    if (env.DEBUG) {
      cache[DEBUG_LABEL] = debuggingLabel;
    }

    return cache;
  }
  function getValue(cache) {
    assertCache(cache, 'getValue');
    var fn = cache[FN];
    var tag = cache[TAG];
    var snapshot = cache[SNAPSHOT];

    if (tag === undefined || !validateTag(tag, snapshot)) {
      beginTrackFrame();

      try {
        cache[LAST_VALUE] = fn();
      } finally {
        tag = endTrackFrame();
        cache[TAG] = tag;
        cache[SNAPSHOT] = valueForTag(tag);
        consumeTag(tag);
      }
    } else {
      consumeTag(tag);
    }

    return cache[LAST_VALUE];
  }
  function isConst(cache) {
    assertCache(cache, 'isConst');
    var tag = cache[TAG];
    assertTag(tag, cache);
    return isConstTag(tag);
  }

  function assertCache(value, fnName) {
    if (env.DEBUG && !(typeof value === 'object' && value !== null && FN in value)) {
      throw new Error(fnName + "() can only be used on an instance of a cache created with createCache(). Called with: " + String(value));
    }
  } // replace this with `expect` when we can


  function assertTag(tag, cache) {
    if (env.DEBUG && tag === undefined) {
      throw new Error("isConst() can only be used on a cache once getValue() has been called at least once. Called with cache function:\n\n" + String(cache[FN]));
    }
  } //////////
  // Legacy tracking APIs
  // track() shouldn't be necessary at all in the VM once the autotracking
  // refactors are merged, and we should generally be moving away from it. It may
  // be necessary in Ember for a while longer, but I think we'll be able to drop
  // it in favor of cache sooner rather than later.


  function track(callback, debugLabel) {
    beginTrackFrame(debugLabel);
    var tag;

    try {
      callback();
    } finally {
      tag = endTrackFrame();
    }

    return tag;
  } // untrack() is currently mainly used to handle places that were previously not
  // tracked, and that tracking now would cause backtracking rerender assertions.
  // I think once we move everyone forward onto modern APIs, we'll probably be
  // able to remove it, but I'm not sure yet.

  function untrack(callback) {
    beginUntrackFrame();

    try {
      return callback();
    } finally {
      endUntrackFrame();
    }
  }

  function trackedData(key, initializer) {
    var values = new WeakMap();
    var hasInitializer = typeof initializer === 'function';

    function getter(self) {
      consumeTag(tagFor(self, key));
      var value; // If the field has never been initialized, we should initialize it

      if (hasInitializer && !values.has(self)) {
        value = initializer.call(self);
        values.set(self, value);
      } else {
        value = values.get(self);
      }

      return value;
    }

    function setter(self, value) {
      dirtyTagFor(self, key);
      values.set(self, value);
    }

    return {
      getter: getter,
      setter: setter
    };
  }

  var GLIMMER_VALIDATOR_REGISTRATION = symbolFor('GLIMMER_VALIDATOR_REGISTRATION');
  var globalObj = getGlobal();

  if (globalObj[GLIMMER_VALIDATOR_REGISTRATION] === true) {
    throw new Error('The `@glimmer/validator` library has been included twice in this application. It could be different versions of the package, or the same version included twice by mistake. `@glimmer/validator` depends on having a single copy of the package in use at any time in an application, even if they are the same version. You must dedupe your build to remove the duplicate packages in order to prevent this error.');
  }

  globalObj[GLIMMER_VALIDATOR_REGISTRATION] = true;

  exports.COMPUTE = COMPUTE;
  exports.CONSTANT = CONSTANT;
  exports.CONSTANT_TAG = CONSTANT_TAG;
  exports.CURRENT_TAG = CURRENT_TAG;
  exports.CurrentTag = CurrentTag;
  exports.INITIAL = INITIAL;
  exports.VOLATILE = VOLATILE;
  exports.VOLATILE_TAG = VOLATILE_TAG;
  exports.VolatileTag = VolatileTag;
  exports.beginTrackFrame = beginTrackFrame;
  exports.beginUntrackFrame = beginUntrackFrame;
  exports.bump = bump;
  exports.combine = combine;
  exports.consumeTag = consumeTag;
  exports.createCache = createCache;
  exports.createTag = createTag;
  exports.createUpdatableTag = createUpdatableTag;
  exports.dirtyTag = DIRTY_TAG;
  exports.dirtyTagFor = dirtyTagFor;
  exports.endTrackFrame = endTrackFrame;
  exports.endUntrackFrame = endUntrackFrame;
  exports.getValue = getValue;
  exports.isConst = isConst;
  exports.isConstTag = isConstTag;
  exports.isTracking = isTracking;
  exports.resetTracking = resetTracking;
  exports.tagFor = tagFor;
  exports.tagMetaFor = tagMetaFor;
  exports.track = track;
  exports.trackedData = trackedData;
  exports.untrack = untrack;
  exports.updateTag = UPDATE_TAG;
  exports.validateTag = validateTag;
  exports.valueForTag = valueForTag;

  Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xpbW1lci12YWxpZGF0b3IuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZhbGlkYXRvci9saWIvdXRpbHMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci92YWxpZGF0b3IvbGliL2RlYnVnLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdmFsaWRhdG9yL2xpYi92YWxpZGF0b3JzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdmFsaWRhdG9yL2xpYi9tZXRhLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdmFsaWRhdG9yL2xpYi90cmFja2luZy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZhbGlkYXRvci9saWIvdHJhY2tlZC1kYXRhLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdmFsaWRhdG9yL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB0eXBlIFVuaW9uVG9JbnRlcnNlY3Rpb248VT4gPSAoVSBleHRlbmRzIHVua25vd24gPyAoazogVSkgPT4gdm9pZCA6IG5ldmVyKSBleHRlbmRzIChcbiAgazogaW5mZXIgSVxuKSA9PiB2b2lkXG4gID8gSVxuICA6IG5ldmVyO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuZXhwb3J0IHR5cGUgQW55S2V5ID0ga2V5b2YgYW55O1xuZXhwb3J0IHR5cGUgSW5kZXhhYmxlID0gUmVjb3JkPEFueUtleSwgdW5rbm93bj47XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXR5cGVzXG5leHBvcnQgZnVuY3Rpb24gaW5kZXhhYmxlPFQgZXh0ZW5kcyBvYmplY3Q+KGlucHV0OiBUKTogVCAmIEluZGV4YWJsZSB7XG4gIHJldHVybiBpbnB1dCBhcyBUICYgSW5kZXhhYmxlO1xufVxuXG4vLyBUaGlzIGlzIGEgZHVwbGljYXRlIHV0aWxpdHkgZnJvbSBAZ2xpbW1lci91dGlsIGJlY2F1c2UgYEBnbGltbWVyL3ZhbGlkYXRvcmBcbi8vIHNob3VsZCBub3QgZGVwZW5kIG9uIGFueSBvdGhlciBAZ2xpbW1lciBwYWNrYWdlcywgaW4gb3JkZXIgdG8gYXZvaWQgcHVsbGluZ1xuLy8gaW4gdHlwZXMgYW5kIHByZXZlbnQgcmVncmVzc2lvbnMgaW4gYEBnbGltbWVyL3RyYWNraW5nYCAod2hpY2ggaGFzIHB1YmxpYyB0eXBlcykuXG5leHBvcnQgY29uc3Qgc3ltYm9sID1cbiAgdHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCdcbiAgICA/IFN5bWJvbFxuICAgIDogLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgIChrZXk6IHN0cmluZykgPT4gYF9fJHtrZXl9JHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBEYXRlLm5vdygpKX1fX2AgYXMgYW55O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuZXhwb3J0IGNvbnN0IHN5bWJvbEZvcjogKGtleTogc3RyaW5nKSA9PiBhbnkgPVxuICB0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJ1xuICAgID8gU3ltYm9sLmZvclxuICAgIDogKGtleTogc3RyaW5nKSA9PiBgX19HTElNTUVSX1ZBTElEQVRPUl9TWU1CT0xfRk9SXyR7a2V5fWA7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRHbG9iYWwoKTogSW5kZXhhYmxlIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vZGUvbm8tdW5zdXBwb3J0ZWQtZmVhdHVyZXMvZXMtYnVpbHRpbnNcbiAgaWYgKHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIGluZGV4YWJsZShnbG9iYWxUaGlzKTtcbiAgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIGluZGV4YWJsZShzZWxmKTtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSByZXR1cm4gaW5kZXhhYmxlKHdpbmRvdyk7XG4gIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIGluZGV4YWJsZShnbG9iYWwpO1xuXG4gIHRocm93IG5ldyBFcnJvcigndW5hYmxlIHRvIGxvY2F0ZSBnbG9iYWwgb2JqZWN0Jyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bndyYXA8VD4odmFsOiBUIHwgbnVsbCB8IHVuZGVmaW5lZCk6IFQge1xuICBpZiAodmFsID09PSBudWxsIHx8IHZhbCA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIHZhbHVlIHRvIGJlIHByZXNlbnRgKTtcbiAgcmV0dXJuIHZhbCBhcyBUO1xufVxuIiwiaW1wb3J0IHsgVGFnIH0gZnJvbSAnLi92YWxpZGF0b3JzJztcbmltcG9ydCB7IERFQlVHIH0gZnJvbSAnQGdsaW1tZXIvZW52JztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJ0BnbGltbWVyL2dsb2JhbC1jb250ZXh0JztcblxuZXhwb3J0IGxldCBiZWdpblRyYWNraW5nVHJhbnNhY3Rpb246XG4gIHwgdW5kZWZpbmVkXG4gIHwgKChkZWJ1Z2dpbmdDb250ZXh0Pzogc3RyaW5nIHwgZmFsc2UsIGRlcHJlY2F0ZT86IGJvb2xlYW4pID0+IHZvaWQpO1xuZXhwb3J0IGxldCBlbmRUcmFja2luZ1RyYW5zYWN0aW9uOiB1bmRlZmluZWQgfCAoKCkgPT4gdm9pZCk7XG5leHBvcnQgbGV0IHJ1bkluVHJhY2tpbmdUcmFuc2FjdGlvbjpcbiAgfCB1bmRlZmluZWRcbiAgfCAoPFQ+KGZuOiAoKSA9PiBULCBkZWJ1Z2dpbmdDb250ZXh0Pzogc3RyaW5nIHwgZmFsc2UpID0+IFQpO1xuXG5leHBvcnQgbGV0IHJlc2V0VHJhY2tpbmdUcmFuc2FjdGlvbjogdW5kZWZpbmVkIHwgKCgpID0+IHN0cmluZyk7XG5leHBvcnQgbGV0IHNldFRyYWNraW5nVHJhbnNhY3Rpb25FbnY6XG4gIHwgdW5kZWZpbmVkXG4gIHwgKChlbnY6IHsgZGVidWdNZXNzYWdlPyhvYmo/OiB1bmtub3duLCBrZXlOYW1lPzogc3RyaW5nKTogc3RyaW5nIH0pID0+IHZvaWQpO1xuXG5leHBvcnQgbGV0IGFzc2VydFRhZ05vdENvbnN1bWVkOlxuICB8IHVuZGVmaW5lZFxuICB8ICg8VD4odGFnOiBUYWcsIG9iaj86IFQsIGtleU5hbWU/OiBrZXlvZiBUIHwgc3RyaW5nIHwgc3ltYm9sKSA9PiB2b2lkKTtcblxuZXhwb3J0IGxldCBtYXJrVGFnQXNDb25zdW1lZDogdW5kZWZpbmVkIHwgKChfdGFnOiBUYWcpID0+IHZvaWQpO1xuXG5leHBvcnQgbGV0IGxvZ1RyYWNraW5nU3RhY2s6IHVuZGVmaW5lZCB8ICgodHJhbnNhY3Rpb24/OiBUcmFuc2FjdGlvbikgPT4gc3RyaW5nKTtcblxuaW50ZXJmYWNlIFRyYW5zYWN0aW9uIHtcbiAgcGFyZW50OiBUcmFuc2FjdGlvbiB8IG51bGw7XG4gIGRlYnVnTGFiZWw/OiBzdHJpbmc7XG59XG5cbmlmIChERUJVRykge1xuICBsZXQgQ09OU1VNRURfVEFHUzogV2Vha01hcDxUYWcsIFRyYW5zYWN0aW9uPiB8IG51bGwgPSBudWxsO1xuXG4gIGxldCBUUkFOU0FDVElPTl9TVEFDSzogVHJhbnNhY3Rpb25bXSA9IFtdO1xuXG4gIC8vLy8vLy8vL1xuXG4gIGxldCBUUkFOU0FDVElPTl9FTlYgPSB7XG4gICAgZGVidWdNZXNzYWdlKG9iaj86IHVua25vd24sIGtleU5hbWU/OiBzdHJpbmcpIHtcbiAgICAgIGxldCBvYmpOYW1lO1xuXG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvYmpOYW1lID0gb2JqLm5hbWU7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIG9iaiAhPT0gbnVsbCkge1xuICAgICAgICBsZXQgY2xhc3NOYW1lID0gKG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IubmFtZSkgfHwgJyh1bmtub3duIGNsYXNzKSc7XG5cbiAgICAgICAgb2JqTmFtZSA9IGAoYW4gaW5zdGFuY2Ugb2YgJHtjbGFzc05hbWV9KWA7XG4gICAgICB9IGVsc2UgaWYgKG9iaiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG9iak5hbWUgPSAnKGFuIHVua25vd24gdGFnKSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvYmpOYW1lID0gU3RyaW5nKG9iaik7XG4gICAgICB9XG5cbiAgICAgIGxldCBkaXJ0eVN0cmluZyA9IGtleU5hbWUgPyBgXFxgJHtrZXlOYW1lfVxcYCBvbiBcXGAke29iak5hbWV9XFxgYCA6IGBcXGAke29iak5hbWV9XFxgYDtcblxuICAgICAgcmV0dXJuIGBZb3UgYXR0ZW1wdGVkIHRvIHVwZGF0ZSAke2RpcnR5U3RyaW5nfSwgYnV0IGl0IGhhZCBhbHJlYWR5IGJlZW4gdXNlZCBwcmV2aW91c2x5IGluIHRoZSBzYW1lIGNvbXB1dGF0aW9uLiAgQXR0ZW1wdGluZyB0byB1cGRhdGUgYSB2YWx1ZSBhZnRlciB1c2luZyBpdCBpbiBhIGNvbXB1dGF0aW9uIGNhbiBjYXVzZSBsb2dpY2FsIGVycm9ycywgaW5maW5pdGUgcmV2YWxpZGF0aW9uIGJ1Z3MsIGFuZCBwZXJmb3JtYW5jZSBpc3N1ZXMsIGFuZCBpcyBub3Qgc3VwcG9ydGVkLmA7XG4gICAgfSxcbiAgfTtcblxuICBzZXRUcmFja2luZ1RyYW5zYWN0aW9uRW52ID0gKGVudikgPT4gT2JqZWN0LmFzc2lnbihUUkFOU0FDVElPTl9FTlYsIGVudik7XG5cbiAgYmVnaW5UcmFja2luZ1RyYW5zYWN0aW9uID0gKF9kZWJ1Z0xhYmVsPzogc3RyaW5nIHwgZmFsc2UpID0+IHtcbiAgICBDT05TVU1FRF9UQUdTID0gQ09OU1VNRURfVEFHUyB8fCBuZXcgV2Vha01hcCgpO1xuXG4gICAgbGV0IGRlYnVnTGFiZWwgPSBfZGVidWdMYWJlbCB8fCB1bmRlZmluZWQ7XG5cbiAgICBsZXQgcGFyZW50ID0gVFJBTlNBQ1RJT05fU1RBQ0tbVFJBTlNBQ1RJT05fU1RBQ0subGVuZ3RoIC0gMV0gfHwgbnVsbDtcblxuICAgIFRSQU5TQUNUSU9OX1NUQUNLLnB1c2goe1xuICAgICAgcGFyZW50LFxuICAgICAgZGVidWdMYWJlbCxcbiAgICB9KTtcbiAgfTtcblxuICBlbmRUcmFja2luZ1RyYW5zYWN0aW9uID0gKCkgPT4ge1xuICAgIGlmIChUUkFOU0FDVElPTl9TVEFDSy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYXR0ZW1wdGVkIHRvIGNsb3NlIGEgdHJhY2tpbmcgdHJhbnNhY3Rpb24sIGJ1dCBvbmUgd2FzIG5vdCBvcGVuJyk7XG4gICAgfVxuXG4gICAgVFJBTlNBQ1RJT05fU1RBQ0sucG9wKCk7XG5cbiAgICBpZiAoVFJBTlNBQ1RJT05fU1RBQ0subGVuZ3RoID09PSAwKSB7XG4gICAgICBDT05TVU1FRF9UQUdTID0gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgcmVzZXRUcmFja2luZ1RyYW5zYWN0aW9uID0gKCkgPT4ge1xuICAgIGxldCBzdGFjayA9ICcnO1xuXG4gICAgaWYgKFRSQU5TQUNUSU9OX1NUQUNLLmxlbmd0aCA+IDApIHtcbiAgICAgIHN0YWNrID0gbG9nVHJhY2tpbmdTdGFjayEoVFJBTlNBQ1RJT05fU1RBQ0tbVFJBTlNBQ1RJT05fU1RBQ0subGVuZ3RoIC0gMV0pO1xuICAgIH1cblxuICAgIFRSQU5TQUNUSU9OX1NUQUNLID0gW107XG4gICAgQ09OU1VNRURfVEFHUyA9IG51bGw7XG5cbiAgICByZXR1cm4gc3RhY2s7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBnbG9iYWwgYXV0b3RyYWNraW5nIHRyYW5zYWN0aW9uLiBUaGlzIHdpbGwgcHJldmVudCBhbnkgYmFja2Zsb3dcbiAgICogaW4gYW55IGB0cmFja2AgY2FsbHMgd2l0aGluIHRoZSB0cmFuc2FjdGlvbiwgZXZlbiBpZiB0aGV5IGFyZSBub3RcbiAgICogZXh0ZXJuYWxseSBjb25zdW1lZC5cbiAgICpcbiAgICogYHJ1bkluQXV0b3RyYWNraW5nVHJhbnNhY3Rpb25gIGNhbiBiZSBjYWxsZWQgd2l0aGluIGl0c2VsZiwgYW5kIGl0IHdpbGwgYWRkXG4gICAqIG9udG8gdGhlIGV4aXN0aW5nIHRyYW5zYWN0aW9uIGlmIG9uZSBleGlzdHMuXG4gICAqXG4gICAqIFRPRE86IE9ubHkgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIGB0cmFja2AgaXMgY29uc3VtZWQuXG4gICAqL1xuICBydW5JblRyYWNraW5nVHJhbnNhY3Rpb24gPSA8VD4oZm46ICgpID0+IFQsIGRlYnVnTGFiZWw/OiBzdHJpbmcgfCBmYWxzZSkgPT4ge1xuICAgIGJlZ2luVHJhY2tpbmdUcmFuc2FjdGlvbiEoZGVidWdMYWJlbCk7XG4gICAgbGV0IGRpZEVycm9yID0gdHJ1ZTtcblxuICAgIHRyeSB7XG4gICAgICBsZXQgdmFsdWUgPSBmbigpO1xuICAgICAgZGlkRXJyb3IgPSBmYWxzZTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKGRpZEVycm9yICE9PSB0cnVlKSB7XG4gICAgICAgIGVuZFRyYWNraW5nVHJhbnNhY3Rpb24hKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGxldCBudGhJbmRleCA9IChzdHI6IHN0cmluZywgcGF0dGVybjogc3RyaW5nLCBuOiBudW1iZXIsIHN0YXJ0aW5nUG9zID0gLTEpID0+IHtcbiAgICBsZXQgaSA9IHN0YXJ0aW5nUG9zO1xuXG4gICAgd2hpbGUgKG4tLSA+IDAgJiYgaSsrIDwgc3RyLmxlbmd0aCkge1xuICAgICAgaSA9IHN0ci5pbmRleE9mKHBhdHRlcm4sIGkpO1xuICAgICAgaWYgKGkgPCAwKSBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gaTtcbiAgfTtcblxuICBsZXQgbWFrZVRyYWNraW5nRXJyb3JNZXNzYWdlID0gPFQ+KFxuICAgIHRyYW5zYWN0aW9uOiBUcmFuc2FjdGlvbixcbiAgICBvYmo/OiBULFxuICAgIGtleU5hbWU/OiBrZXlvZiBUIHwgc3RyaW5nIHwgc3ltYm9sXG4gICkgPT4ge1xuICAgIGxldCBtZXNzYWdlID0gW1RSQU5TQUNUSU9OX0VOVi5kZWJ1Z01lc3NhZ2Uob2JqLCBrZXlOYW1lICYmIFN0cmluZyhrZXlOYW1lKSldO1xuXG4gICAgbWVzc2FnZS5wdXNoKGBcXGAke1N0cmluZyhrZXlOYW1lKX1cXGAgd2FzIGZpcnN0IHVzZWQ6YCk7XG5cbiAgICBtZXNzYWdlLnB1c2gobG9nVHJhY2tpbmdTdGFjayEodHJhbnNhY3Rpb24pKTtcblxuICAgIG1lc3NhZ2UucHVzaChgU3RhY2sgdHJhY2UgZm9yIHRoZSB1cGRhdGU6YCk7XG5cbiAgICByZXR1cm4gbWVzc2FnZS5qb2luKCdcXG5cXG4nKTtcbiAgfTtcblxuICBsb2dUcmFja2luZ1N0YWNrID0gKHRyYW5zYWN0aW9uPzogVHJhbnNhY3Rpb24pID0+IHtcbiAgICBsZXQgdHJhY2tpbmdTdGFjayA9IFtdO1xuICAgIGxldCBjdXJyZW50OiBUcmFuc2FjdGlvbiB8IG51bGwgfCB1bmRlZmluZWQgPVxuICAgICAgdHJhbnNhY3Rpb24gfHwgVFJBTlNBQ1RJT05fU1RBQ0tbVFJBTlNBQ1RJT05fU1RBQ0subGVuZ3RoIC0gMV07XG5cbiAgICBpZiAoY3VycmVudCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gJyc7XG5cbiAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgaWYgKGN1cnJlbnQuZGVidWdMYWJlbCkge1xuICAgICAgICB0cmFja2luZ1N0YWNrLnVuc2hpZnQoY3VycmVudC5kZWJ1Z0xhYmVsKTtcbiAgICAgIH1cblxuICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50O1xuICAgIH1cblxuICAgIC8vIFRPRE86IFVzZSBTdHJpbmcucHJvdG90eXBlLnJlcGVhdCBoZXJlIG9uY2Ugd2UgY2FuIGRyb3Agc3VwcG9ydCBmb3IgSUUxMVxuICAgIHJldHVybiB0cmFja2luZ1N0YWNrLm1hcCgobGFiZWwsIGluZGV4KSA9PiBBcnJheSgyICogaW5kZXggKyAxKS5qb2luKCcgJykgKyBsYWJlbCkuam9pbignXFxuJyk7XG4gIH07XG5cbiAgbWFya1RhZ0FzQ29uc3VtZWQgPSAoX3RhZzogVGFnKSA9PiB7XG4gICAgaWYgKCFDT05TVU1FRF9UQUdTIHx8IENPTlNVTUVEX1RBR1MuaGFzKF90YWcpKSByZXR1cm47XG5cbiAgICBDT05TVU1FRF9UQUdTLnNldChfdGFnLCBUUkFOU0FDVElPTl9TVEFDS1tUUkFOU0FDVElPTl9TVEFDSy5sZW5ndGggLSAxXSk7XG5cbiAgICAvLyBXZSBuZWVkIHRvIG1hcmsgdGhlIHRhZyBhbmQgYWxsIG9mIGl0cyBzdWJ0YWdzIGFzIGNvbnN1bWVkLCBzbyB3ZSBuZWVkIHRvXG4gICAgLy8gY2FzdCBpdCBhbmQgYWNjZXNzIGl0cyBpbnRlcm5hbHMuIEluIHRoZSBmdXR1cmUgdGhpcyBzaG91bGRuJ3QgYmUgbmVjZXNzYXJ5LFxuICAgIC8vIHRoaXMgaXMgb25seSBmb3IgY29tcHV0ZWQgcHJvcGVydGllcy5cbiAgICBsZXQgdGFnID0gX3RhZyBhcyBhbnk7XG5cbiAgICBpZiAodGFnLnN1YnRhZykge1xuICAgICAgbWFya1RhZ0FzQ29uc3VtZWQhKHRhZy5zdWJ0YWcpO1xuICAgIH1cblxuICAgIGlmICh0YWcuc3VidGFncykge1xuICAgICAgdGFnLnN1YnRhZ3MuZm9yRWFjaCgodGFnOiBUYWcpID0+IG1hcmtUYWdBc0NvbnN1bWVkISh0YWcpKTtcbiAgICB9XG4gIH07XG5cbiAgYXNzZXJ0VGFnTm90Q29uc3VtZWQgPSA8VD4odGFnOiBUYWcsIG9iaj86IFQsIGtleU5hbWU/OiBrZXlvZiBUIHwgc3RyaW5nIHwgc3ltYm9sKSA9PiB7XG4gICAgaWYgKENPTlNVTUVEX1RBR1MgPT09IG51bGwpIHJldHVybjtcblxuICAgIGxldCB0cmFuc2FjdGlvbiA9IENPTlNVTUVEX1RBR1MuZ2V0KHRhZyk7XG5cbiAgICBpZiAoIXRyYW5zYWN0aW9uKSByZXR1cm47XG5cbiAgICAvLyBUaGlzIGhhY2sgbWFrZXMgdGhlIGFzc2VydGlvbiBtZXNzYWdlIG5pY2VyLCB3ZSBjYW4gY3V0IG9mZiB0aGUgZmlyc3RcbiAgICAvLyBmZXcgbGluZXMgb2YgdGhlIHN0YWNrIHRyYWNlIGFuZCBsZXQgdXNlcnMga25vdyB3aGVyZSB0aGUgYWN0dWFsIGVycm9yXG4gICAgLy8gb2NjdXJyZWQuXG4gICAgdHJ5IHtcbiAgICAgIGFzc2VydChmYWxzZSwgbWFrZVRyYWNraW5nRXJyb3JNZXNzYWdlKHRyYW5zYWN0aW9uLCBvYmosIGtleU5hbWUpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5zdGFjaykge1xuICAgICAgICBsZXQgdXBkYXRlU3RhY2tCZWdpbiA9IGUuc3RhY2suaW5kZXhPZignU3RhY2sgdHJhY2UgZm9yIHRoZSB1cGRhdGU6Jyk7XG5cbiAgICAgICAgaWYgKHVwZGF0ZVN0YWNrQmVnaW4gIT09IC0xKSB7XG4gICAgICAgICAgbGV0IHN0YXJ0ID0gbnRoSW5kZXgoZS5zdGFjaywgJ1xcbicsIDEsIHVwZGF0ZVN0YWNrQmVnaW4pO1xuICAgICAgICAgIGxldCBlbmQgPSBudGhJbmRleChlLnN0YWNrLCAnXFxuJywgNCwgdXBkYXRlU3RhY2tCZWdpbik7XG4gICAgICAgICAgZS5zdGFjayA9IGUuc3RhY2suc3Vic3RyKDAsIHN0YXJ0KSArIGUuc3RhY2suc3Vic3RyKGVuZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH07XG59XG4iLCJpbXBvcnQgeyBERUJVRyB9IGZyb20gJ0BnbGltbWVyL2Vudic7XG5pbXBvcnQgeyBzY2hlZHVsZVJldmFsaWRhdGUgfSBmcm9tICdAZ2xpbW1lci9nbG9iYWwtY29udGV4dCc7XG5pbXBvcnQgeyBzeW1ib2wsIHVud3JhcCB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgYXNzZXJ0VGFnTm90Q29uc3VtZWQgfSBmcm9tICcuL2RlYnVnJztcblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgdHlwZSBSZXZpc2lvbiA9IG51bWJlcjtcblxuZXhwb3J0IGNvbnN0IENPTlNUQU5UOiBSZXZpc2lvbiA9IDA7XG5leHBvcnQgY29uc3QgSU5JVElBTDogUmV2aXNpb24gPSAxO1xuZXhwb3J0IGNvbnN0IFZPTEFUSUxFOiBSZXZpc2lvbiA9IE5hTjtcblxubGV0ICRSRVZJU0lPTiA9IElOSVRJQUw7XG5cbmV4cG9ydCBmdW5jdGlvbiBidW1wKCk6IHZvaWQge1xuICAkUkVWSVNJT04rKztcbn1cblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgY29uc3QgQ09NUFVURTogdW5pcXVlIHN5bWJvbCA9IHN5bWJvbCgnVEFHX0NPTVBVVEUnKTtcblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlUYWc8VD4ge1xuICBbQ09NUFVURV0oKTogVDtcbn1cblxuZXhwb3J0IHR5cGUgVGFnID0gRW50aXR5VGFnPFJldmlzaW9uPjtcblxuLy8vLy8vLy8vL1xuXG4vKipcbiAqIGB2YWx1ZWAgcmVjZWl2ZXMgYSB0YWcgYW5kIHJldHVybnMgYW4gb3BhcXVlIFJldmlzaW9uIGJhc2VkIG9uIHRoYXQgdGFnLiBUaGlzXG4gKiBzbmFwc2hvdCBjYW4gdGhlbiBsYXRlciBiZSBwYXNzZWQgdG8gYHZhbGlkYXRlYCB3aXRoIHRoZSBzYW1lIHRhZyB0b1xuICogZGV0ZXJtaW5lIGlmIHRoZSB0YWcgaGFzIGNoYW5nZWQgYXQgYWxsIHNpbmNlIHRoZSB0aW1lIHRoYXQgYHZhbHVlYCB3YXNcbiAqIGNhbGxlZC5cbiAqXG4gKiBAcGFyYW0gdGFnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWx1ZUZvclRhZyh0YWc6IFRhZyk6IFJldmlzaW9uIHtcbiAgcmV0dXJuIHRhZ1tDT01QVVRFXSgpO1xufVxuXG4vKipcbiAqIGB2YWxpZGF0ZWAgcmVjZWl2ZXMgYSB0YWcgYW5kIGEgc25hcHNob3QgZnJvbSBhIHByZXZpb3VzIGNhbGwgdG8gYHZhbHVlYCB3aXRoXG4gKiB0aGUgc2FtZSB0YWcsIGFuZCBkZXRlcm1pbmVzIGlmIHRoZSB0YWcgaXMgc3RpbGwgdmFsaWQgY29tcGFyZWQgdG8gdGhlXG4gKiBzbmFwc2hvdC4gSWYgdGhlIHRhZydzIHN0YXRlIGhhcyBjaGFuZ2VkIGF0IGFsbCBzaW5jZSB0aGVuLCBgdmFsaWRhdGVgIHdpbGxcbiAqIHJldHVybiBmYWxzZSwgb3RoZXJ3aXNlIGl0IHdpbGwgcmV0dXJuIHRydWUuIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgaWYgYVxuICogY2FsY3VsYXRpb24gcmVsYXRlZCB0byB0aGUgdGFncyBzaG91bGQgYmUgcmVydW4uXG4gKlxuICogQHBhcmFtIHRhZ1xuICogQHBhcmFtIHNuYXBzaG90XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVRhZyh0YWc6IFRhZywgc25hcHNob3Q6IFJldmlzaW9uKTogYm9vbGVhbiB7XG4gIHJldHVybiBzbmFwc2hvdCA+PSB0YWdbQ09NUFVURV0oKTtcbn1cblxuLy8vLy8vLy8vL1xuXG4vKipcbiAqIFRoaXMgZW51bSByZXByZXNlbnRzIGFsbCBvZiB0aGUgcG9zc2libGUgdGFnIHR5cGVzIGZvciB0aGUgbW9ub21vcnBoaWMgdGFnIGNsYXNzLlxuICogT3RoZXIgY3VzdG9tIHRhZyBjbGFzc2VzIGNhbiBleGlzdCwgc3VjaCBhcyBDdXJyZW50VGFnIGFuZCBWb2xhdGlsZVRhZywgYnV0IGZvclxuICogcGVyZm9ybWFuY2UgcmVhc29ucywgYW55IHR5cGUgb2YgdGFnIHRoYXQgaXMgbWVhbnQgdG8gYmUgdXNlZCBmcmVxdWVudGx5IHNob3VsZFxuICogYmUgYWRkZWQgdG8gdGhlIG1vbm9tb3JwaGljIHRhZy5cbiAqL1xuY29uc3QgZW51bSBNb25vbW9ycGhpY1RhZ1R5cGVzIHtcbiAgRGlydHlhYmxlLFxuICBVcGRhdGFibGUsXG4gIENvbWJpbmF0b3IsXG4gIENvbnN0YW50LFxufVxuXG5jb25zdCBUWVBFOiB1bmlxdWUgc3ltYm9sID0gc3ltYm9sKCdUQUdfVFlQRScpO1xuXG4vLyB0aGlzIGlzIGJhc2ljYWxseSBhIGNvbnN0XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG5leHBvcnQgbGV0IEFMTE9XX0NZQ0xFUzogV2Vha01hcDxUYWcsIGJvb2xlYW4+IHwgdW5kZWZpbmVkO1xuXG5pZiAoREVCVUcpIHtcbiAgQUxMT1dfQ1lDTEVTID0gbmV3IFdlYWtNYXAoKTtcbn1cblxuZnVuY3Rpb24gYWxsb3dzQ3ljbGVzKHRhZzogVGFnKTogYm9vbGVhbiB7XG4gIGlmIChBTExPV19DWUNMRVMgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBBTExPV19DWUNMRVMuaGFzKHRhZyk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIE1vbm9tb3JwaGljVGFnQmFzZTxUIGV4dGVuZHMgTW9ub21vcnBoaWNUYWdUeXBlcz4gZXh0ZW5kcyBUYWcge1xuICBbVFlQRV06IFQ7XG59XG5cbmV4cG9ydCB0eXBlIERpcnR5YWJsZVRhZyA9IE1vbm9tb3JwaGljVGFnQmFzZTxNb25vbW9ycGhpY1RhZ1R5cGVzLkRpcnR5YWJsZT47XG5leHBvcnQgdHlwZSBVcGRhdGFibGVUYWcgPSBNb25vbW9ycGhpY1RhZ0Jhc2U8TW9ub21vcnBoaWNUYWdUeXBlcy5VcGRhdGFibGU+O1xuZXhwb3J0IHR5cGUgQ29tYmluYXRvclRhZyA9IE1vbm9tb3JwaGljVGFnQmFzZTxNb25vbW9ycGhpY1RhZ1R5cGVzLkNvbWJpbmF0b3I+O1xuZXhwb3J0IHR5cGUgQ29uc3RhbnRUYWcgPSBNb25vbW9ycGhpY1RhZ0Jhc2U8TW9ub21vcnBoaWNUYWdUeXBlcy5Db25zdGFudD47XG5cbmNsYXNzIE1vbm9tb3JwaGljVGFnSW1wbDxUIGV4dGVuZHMgTW9ub21vcnBoaWNUYWdUeXBlcyA9IE1vbm9tb3JwaGljVGFnVHlwZXM+IHtcbiAgc3RhdGljIGNvbWJpbmUodGFnczogVGFnW10pOiBUYWcge1xuICAgIHN3aXRjaCAodGFncy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcmV0dXJuIENPTlNUQU5UX1RBRztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIHRhZ3NbMF07XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZXQgdGFnOiBNb25vbW9ycGhpY1RhZ0ltcGwgPSBuZXcgTW9ub21vcnBoaWNUYWdJbXBsKE1vbm9tb3JwaGljVGFnVHlwZXMuQ29tYmluYXRvcik7XG4gICAgICAgIHRhZy5zdWJ0YWcgPSB0YWdzO1xuICAgICAgICByZXR1cm4gdGFnO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIHJldmlzaW9uID0gSU5JVElBTDtcbiAgcHJpdmF0ZSBsYXN0Q2hlY2tlZCA9IElOSVRJQUw7XG4gIHByaXZhdGUgbGFzdFZhbHVlID0gSU5JVElBTDtcblxuICBwcml2YXRlIGlzVXBkYXRpbmcgPSBmYWxzZTtcbiAgcHJpdmF0ZSBzdWJ0YWc6IFRhZyB8IFRhZ1tdIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgc3VidGFnQnVmZmVyQ2FjaGU6IFJldmlzaW9uIHwgbnVsbCA9IG51bGw7XG5cbiAgW1RZUEVdOiBUO1xuXG4gIGNvbnN0cnVjdG9yKHR5cGU6IFQpIHtcbiAgICB0aGlzW1RZUEVdID0gdHlwZTtcbiAgfVxuXG4gIFtDT01QVVRFXSgpOiBSZXZpc2lvbiB7XG4gICAgbGV0IHsgbGFzdENoZWNrZWQgfSA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5pc1VwZGF0aW5nID09PSB0cnVlKSB7XG4gICAgICBpZiAoREVCVUcgJiYgIWFsbG93c0N5Y2xlcyh0aGlzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N5Y2xlcyBpbiB0YWdzIGFyZSBub3QgYWxsb3dlZCcpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxhc3RDaGVja2VkID0gKyskUkVWSVNJT047XG4gICAgfSBlbHNlIGlmIChsYXN0Q2hlY2tlZCAhPT0gJFJFVklTSU9OKSB7XG4gICAgICB0aGlzLmlzVXBkYXRpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5sYXN0Q2hlY2tlZCA9ICRSRVZJU0lPTjtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IHsgc3VidGFnLCByZXZpc2lvbiB9ID0gdGhpcztcblxuICAgICAgICBpZiAoc3VidGFnICE9PSBudWxsKSB7XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc3VidGFnKSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdWJ0YWcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgbGV0IHZhbHVlID0gc3VidGFnW2ldW0NPTVBVVEVdKCk7XG4gICAgICAgICAgICAgIHJldmlzaW9uID0gTWF0aC5tYXgodmFsdWUsIHJldmlzaW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHN1YnRhZ1ZhbHVlID0gc3VidGFnW0NPTVBVVEVdKCk7XG5cbiAgICAgICAgICAgIGlmIChzdWJ0YWdWYWx1ZSA9PT0gdGhpcy5zdWJ0YWdCdWZmZXJDYWNoZSkge1xuICAgICAgICAgICAgICByZXZpc2lvbiA9IE1hdGgubWF4KHJldmlzaW9uLCB0aGlzLmxhc3RWYWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBDbGVhciB0aGUgdGVtcG9yYXJ5IGJ1ZmZlciBjYWNoZVxuICAgICAgICAgICAgICB0aGlzLnN1YnRhZ0J1ZmZlckNhY2hlID0gbnVsbDtcbiAgICAgICAgICAgICAgcmV2aXNpb24gPSBNYXRoLm1heChyZXZpc2lvbiwgc3VidGFnVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubGFzdFZhbHVlID0gcmV2aXNpb247XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0aGlzLmlzVXBkYXRpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5sYXN0VmFsdWU7XG4gIH1cblxuICBzdGF0aWMgdXBkYXRlVGFnKF90YWc6IFVwZGF0YWJsZVRhZywgX3N1YnRhZzogVGFnKSB7XG4gICAgaWYgKERFQlVHICYmIF90YWdbVFlQRV0gIT09IE1vbm9tb3JwaGljVGFnVHlwZXMuVXBkYXRhYmxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0dGVtcHRlZCB0byB1cGRhdGUgYSB0YWcgdGhhdCB3YXMgbm90IHVwZGF0YWJsZScpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFRTIDMuNyBzaG91bGQgYWxsb3cgdXMgdG8gZG8gdGhpcyB2aWEgYXNzZXJ0aW9uXG4gICAgbGV0IHRhZyA9IF90YWcgYXMgTW9ub21vcnBoaWNUYWdJbXBsO1xuICAgIGxldCBzdWJ0YWcgPSBfc3VidGFnIGFzIE1vbm9tb3JwaGljVGFnSW1wbDtcblxuICAgIGlmIChzdWJ0YWcgPT09IENPTlNUQU5UX1RBRykge1xuICAgICAgdGFnLnN1YnRhZyA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZXJlIGFyZSB0d28gZGlmZmVyZW50IHBvc3NpYmlsaXRpZXMgd2hlbiB1cGRhdGluZyBhIHN1YnRhZzpcbiAgICAgIC8vXG4gICAgICAvLyAxLiBzdWJ0YWdbQ09NUFVURV0oKSA8PSB0YWdbQ09NUFVURV0oKTtcbiAgICAgIC8vIDIuIHN1YnRhZ1tDT01QVVRFXSgpID4gdGFnW0NPTVBVVEVdKCk7XG4gICAgICAvL1xuICAgICAgLy8gVGhlIGZpcnN0IHBvc3NpYmlsaXR5IGlzIGNvbXBsZXRlbHkgZmluZSB3aXRoaW4gb3VyIGNhY2hpbmcgbW9kZWwsIGJ1dFxuICAgICAgLy8gdGhlIHNlY29uZCBwb3NzaWJpbGl0eSBwcmVzZW50cyBhIHByb2JsZW0uIElmIHRoZSBwYXJlbnQgdGFnIGhhc1xuICAgICAgLy8gYWxyZWFkeSBiZWVuIHJlYWQsIHRoZW4gaXQncyB2YWx1ZSBpcyBjYWNoZWQgYW5kIHdpbGwgbm90IHVwZGF0ZSB0b1xuICAgICAgLy8gcmVmbGVjdCB0aGUgc3VidGFnJ3MgZ3JlYXRlciB2YWx1ZS4gTmV4dCB0aW1lIHRoZSBjYWNoZSBpcyBidXN0ZWQsIHRoZVxuICAgICAgLy8gc3VidGFnJ3MgdmFsdWUgX3dpbGxfIGJlIHJlYWQsIGFuZCBpdCdzIHZhbHVlIHdpbGwgYmUgX2dyZWF0ZXJfIHRoYW5cbiAgICAgIC8vIHRoZSBzYXZlZCBzbmFwc2hvdCBvZiB0aGUgcGFyZW50LCBjYXVzaW5nIHRoZSByZXN1bHRpbmcgY2FsY3VsYXRpb24gdG9cbiAgICAgIC8vIGJlIHJlcnVuIGVycm9uZW91c2x5LlxuICAgICAgLy9cbiAgICAgIC8vIEluIG9yZGVyIHRvIHByZXZlbnQgdGhpcywgd2hlbiB3ZSBmaXJzdCB1cGRhdGUgdG8gYSBuZXcgc3VidGFnIHdlIHN0b3JlXG4gICAgICAvLyBpdHMgY29tcHV0ZWQgdmFsdWUsIGFuZCB0aGVuIGNoZWNrIGFnYWluc3QgdGhhdCBjb21wdXRlZCB2YWx1ZSBvblxuICAgICAgLy8gc3Vic2VxdWVudCB1cGRhdGVzLiBJZiBpdHMgdmFsdWUgaGFzbid0IGNoYW5nZWQsIHRoZW4gd2UgcmV0dXJuIHRoZVxuICAgICAgLy8gcGFyZW50J3MgcHJldmlvdXMgdmFsdWUuIE9uY2UgdGhlIHN1YnRhZyBjaGFuZ2VzIGZvciB0aGUgZmlyc3QgdGltZSxcbiAgICAgIC8vIHdlIGNsZWFyIHRoZSBjYWNoZSBhbmQgZXZlcnl0aGluZyBpcyBmaW5hbGx5IGluIHN5bmMgd2l0aCB0aGUgcGFyZW50LlxuICAgICAgdGFnLnN1YnRhZ0J1ZmZlckNhY2hlID0gc3VidGFnW0NPTVBVVEVdKCk7XG4gICAgICB0YWcuc3VidGFnID0gc3VidGFnO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBkaXJ0eVRhZyh0YWc6IERpcnR5YWJsZVRhZyB8IFVwZGF0YWJsZVRhZywgZGlzYWJsZUNvbnN1bXB0aW9uQXNzZXJ0aW9uPzogYm9vbGVhbikge1xuICAgIGlmIChcbiAgICAgIERFQlVHICYmXG4gICAgICAhKHRhZ1tUWVBFXSA9PT0gTW9ub21vcnBoaWNUYWdUeXBlcy5VcGRhdGFibGUgfHwgdGFnW1RZUEVdID09PSBNb25vbW9ycGhpY1RhZ1R5cGVzLkRpcnR5YWJsZSlcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQXR0ZW1wdGVkIHRvIGRpcnR5IGEgdGFnIHRoYXQgd2FzIG5vdCBkaXJ0eWFibGUnKTtcbiAgICB9XG5cbiAgICBpZiAoREVCVUcgJiYgZGlzYWJsZUNvbnN1bXB0aW9uQXNzZXJ0aW9uICE9PSB0cnVlKSB7XG4gICAgICAvLyBVc3VhbGx5IGJ5IHRoaXMgcG9pbnQsIHdlJ3ZlIGFscmVhZHkgYXNzZXJ0ZWQgd2l0aCBiZXR0ZXIgZXJyb3IgaW5mb3JtYXRpb24sXG4gICAgICAvLyBidXQgdGhpcyBpcyBvdXIgbGFzdCBsaW5lIG9mIGRlZmVuc2UuXG4gICAgICB1bndyYXAoYXNzZXJ0VGFnTm90Q29uc3VtZWQpKHRhZyk7XG4gICAgfVxuXG4gICAgKHRhZyBhcyBNb25vbW9ycGhpY1RhZ0ltcGwpLnJldmlzaW9uID0gKyskUkVWSVNJT047XG5cbiAgICBzY2hlZHVsZVJldmFsaWRhdGUoKTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgRElSVFlfVEFHID0gTW9ub21vcnBoaWNUYWdJbXBsLmRpcnR5VGFnO1xuZXhwb3J0IGNvbnN0IFVQREFURV9UQUcgPSBNb25vbW9ycGhpY1RhZ0ltcGwudXBkYXRlVGFnO1xuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUYWcoKTogRGlydHlhYmxlVGFnIHtcbiAgcmV0dXJuIG5ldyBNb25vbW9ycGhpY1RhZ0ltcGwoTW9ub21vcnBoaWNUYWdUeXBlcy5EaXJ0eWFibGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVXBkYXRhYmxlVGFnKCk6IFVwZGF0YWJsZVRhZyB7XG4gIHJldHVybiBuZXcgTW9ub21vcnBoaWNUYWdJbXBsKE1vbm9tb3JwaGljVGFnVHlwZXMuVXBkYXRhYmxlKTtcbn1cblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgY29uc3QgQ09OU1RBTlRfVEFHOiBDb25zdGFudFRhZyA9IG5ldyBNb25vbW9ycGhpY1RhZ0ltcGwoTW9ub21vcnBoaWNUYWdUeXBlcy5Db25zdGFudCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbnN0VGFnKHRhZzogVGFnKTogdGFnIGlzIENvbnN0YW50VGFnIHtcbiAgcmV0dXJuIHRhZyA9PT0gQ09OU1RBTlRfVEFHO1xufVxuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBjbGFzcyBWb2xhdGlsZVRhZyBpbXBsZW1lbnRzIFRhZyB7XG4gIFtDT01QVVRFXSgpOiBSZXZpc2lvbiB7XG4gICAgcmV0dXJuIFZPTEFUSUxFO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBWT0xBVElMRV9UQUcgPSBuZXcgVm9sYXRpbGVUYWcoKTtcblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgY2xhc3MgQ3VycmVudFRhZyBpbXBsZW1lbnRzIEN1cnJlbnRUYWcge1xuICBbQ09NUFVURV0oKTogUmV2aXNpb24ge1xuICAgIHJldHVybiAkUkVWSVNJT047XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IENVUlJFTlRfVEFHID0gbmV3IEN1cnJlbnRUYWcoKTtcblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgY29uc3QgY29tYmluZSA9IE1vbm9tb3JwaGljVGFnSW1wbC5jb21iaW5lO1xuXG4vLyBXYXJtXG5cbmxldCB0YWcxID0gY3JlYXRlVXBkYXRhYmxlVGFnKCk7XG5sZXQgdGFnMiA9IGNyZWF0ZVVwZGF0YWJsZVRhZygpO1xubGV0IHRhZzMgPSBjcmVhdGVVcGRhdGFibGVUYWcoKTtcblxudmFsdWVGb3JUYWcodGFnMSk7XG5ESVJUWV9UQUcodGFnMSk7XG52YWx1ZUZvclRhZyh0YWcxKTtcblVQREFURV9UQUcodGFnMSwgY29tYmluZShbdGFnMiwgdGFnM10pKTtcbnZhbHVlRm9yVGFnKHRhZzEpO1xuRElSVFlfVEFHKHRhZzIpO1xudmFsdWVGb3JUYWcodGFnMSk7XG5ESVJUWV9UQUcodGFnMyk7XG52YWx1ZUZvclRhZyh0YWcxKTtcblVQREFURV9UQUcodGFnMSwgdGFnMyk7XG52YWx1ZUZvclRhZyh0YWcxKTtcbkRJUlRZX1RBRyh0YWczKTtcbnZhbHVlRm9yVGFnKHRhZzEpO1xuIiwiaW1wb3J0IHsgREVCVUcgfSBmcm9tICdAZ2xpbW1lci9lbnYnO1xuaW1wb3J0IHsgRElSVFlfVEFHLCBjcmVhdGVVcGRhdGFibGVUYWcsIFVwZGF0YWJsZVRhZywgQ29uc3RhbnRUYWcgfSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHsgYXNzZXJ0VGFnTm90Q29uc3VtZWQgfSBmcm9tICcuL2RlYnVnJztcbmltcG9ydCB7IEluZGV4YWJsZSwgdW53cmFwIH0gZnJvbSAnLi91dGlscyc7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZTxUPih1OiBUKTogdSBpcyBJbmRleGFibGUgJiBUIHtcbiAgcmV0dXJuICh0eXBlb2YgdSA9PT0gJ29iamVjdCcgJiYgdSAhPT0gbnVsbCkgfHwgdHlwZW9mIHUgPT09ICdmdW5jdGlvbic7XG59XG5cbi8vLy8vLy8vLy8vXG5cbmV4cG9ydCB0eXBlIFRhZ01ldGEgPSBNYXA8UHJvcGVydHlLZXksIFVwZGF0YWJsZVRhZz47XG5cbmNvbnN0IFRSQUNLRURfVEFHUyA9IG5ldyBXZWFrTWFwPG9iamVjdCwgVGFnTWV0YT4oKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRpcnR5VGFnRm9yPFQgZXh0ZW5kcyBvYmplY3Q+KFxuICBvYmo6IFQsXG4gIGtleToga2V5b2YgVCB8IHN0cmluZyB8IHN5bWJvbCxcbiAgbWV0YT86IFRhZ01ldGFcbik6IHZvaWQge1xuICBpZiAoREVCVUcgJiYgIWlzT2JqZWN0TGlrZShvYmopKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBCVUc6IENhbid0IHVwZGF0ZSBhIHRhZyBmb3IgYSBwcmltaXRpdmVgKTtcbiAgfVxuXG4gIGxldCB0YWdzID0gbWV0YSA9PT0gdW5kZWZpbmVkID8gVFJBQ0tFRF9UQUdTLmdldChvYmopIDogbWV0YTtcblxuICAvLyBObyB0YWdzIGhhdmUgYmVlbiBzZXR1cCBmb3IgdGhpcyBvYmplY3QgeWV0LCByZXR1cm5cbiAgaWYgKHRhZ3MgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gIC8vIERpcnR5IHRoZSB0YWcgZm9yIHRoZSBzcGVjaWZpYyBwcm9wZXJ0eSBpZiBpdCBleGlzdHNcbiAgbGV0IHByb3BlcnR5VGFnID0gdGFncy5nZXQoa2V5KTtcblxuICBpZiAocHJvcGVydHlUYWcgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmIChERUJVRykge1xuICAgICAgdW53cmFwKGFzc2VydFRhZ05vdENvbnN1bWVkKShwcm9wZXJ0eVRhZywgb2JqLCBrZXkpO1xuICAgIH1cblxuICAgIERJUlRZX1RBRyhwcm9wZXJ0eVRhZywgdHJ1ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRhZ01ldGFGb3Iob2JqOiBvYmplY3QpOiBUYWdNZXRhIHtcbiAgbGV0IHRhZ3MgPSBUUkFDS0VEX1RBR1MuZ2V0KG9iaik7XG5cbiAgaWYgKHRhZ3MgPT09IHVuZGVmaW5lZCkge1xuICAgIHRhZ3MgPSBuZXcgTWFwKCk7XG5cbiAgICBUUkFDS0VEX1RBR1Muc2V0KG9iaiwgdGFncyk7XG4gIH1cblxuICByZXR1cm4gdGFncztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRhZ0ZvcjxUIGV4dGVuZHMgb2JqZWN0PihcbiAgb2JqOiBULFxuICBrZXk6IGtleW9mIFQgfCBzdHJpbmcgfCBzeW1ib2wsXG4gIG1ldGE/OiBUYWdNZXRhXG4pOiBVcGRhdGFibGVUYWcgfCBDb25zdGFudFRhZyB7XG4gIGxldCB0YWdzID0gbWV0YSA9PT0gdW5kZWZpbmVkID8gdGFnTWV0YUZvcihvYmopIDogbWV0YTtcbiAgbGV0IHRhZyA9IHRhZ3MuZ2V0KGtleSk7XG5cbiAgaWYgKHRhZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGFnID0gY3JlYXRlVXBkYXRhYmxlVGFnKCk7XG4gICAgdGFncy5zZXQoa2V5LCB0YWcpO1xuICB9XG5cbiAgcmV0dXJuIHRhZztcbn1cbiIsImltcG9ydCB7IERFQlVHIH0gZnJvbSAnQGdsaW1tZXIvZW52JztcbmltcG9ydCB7XG4gIFRhZyxcbiAgQ09OU1RBTlRfVEFHLFxuICB2YWxpZGF0ZVRhZyxcbiAgUmV2aXNpb24sXG4gIHZhbHVlRm9yVGFnLFxuICBpc0NvbnN0VGFnLFxuICBjb21iaW5lLFxufSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuXG5pbXBvcnQge1xuICBtYXJrVGFnQXNDb25zdW1lZCxcbiAgYmVnaW5UcmFja2luZ1RyYW5zYWN0aW9uLFxuICBlbmRUcmFja2luZ1RyYW5zYWN0aW9uLFxuICByZXNldFRyYWNraW5nVHJhbnNhY3Rpb24sXG59IGZyb20gJy4vZGVidWcnO1xuaW1wb3J0IHsgc3ltYm9sLCB1bndyYXAgfSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBBbiBvYmplY3QgdGhhdCB0aGF0IHRyYWNrcyBAdHJhY2tlZCBwcm9wZXJ0aWVzIHRoYXQgd2VyZSBjb25zdW1lZC5cbiAqL1xuY2xhc3MgVHJhY2tlciB7XG4gIHByaXZhdGUgdGFncyA9IG5ldyBTZXQ8VGFnPigpO1xuICBwcml2YXRlIGxhc3Q6IFRhZyB8IG51bGwgPSBudWxsO1xuXG4gIGFkZCh0YWc6IFRhZykge1xuICAgIGlmICh0YWcgPT09IENPTlNUQU5UX1RBRykgcmV0dXJuO1xuXG4gICAgdGhpcy50YWdzLmFkZCh0YWcpO1xuXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICB1bndyYXAobWFya1RhZ0FzQ29uc3VtZWQpKHRhZyk7XG4gICAgfVxuXG4gICAgdGhpcy5sYXN0ID0gdGFnO1xuICB9XG5cbiAgY29tYmluZSgpOiBUYWcge1xuICAgIGxldCB7IHRhZ3MgfSA9IHRoaXM7XG5cbiAgICBpZiAodGFncy5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gQ09OU1RBTlRfVEFHO1xuICAgIH0gZWxzZSBpZiAodGFncy5zaXplID09PSAxKSB7XG4gICAgICByZXR1cm4gdGhpcy5sYXN0IGFzIFRhZztcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHRhZ3NBcnI6IFRhZ1tdID0gW107XG4gICAgICB0YWdzLmZvckVhY2goKHRhZykgPT4gdGFnc0Fyci5wdXNoKHRhZykpO1xuICAgICAgcmV0dXJuIGNvbWJpbmUodGFnc0Fycik7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogV2hlbmV2ZXIgYSB0cmFja2VkIGNvbXB1dGVkIHByb3BlcnR5IGlzIGVudGVyZWQsIHRoZSBjdXJyZW50IHRyYWNrZXIgaXNcbiAqIHNhdmVkIG9mZiBhbmQgYSBuZXcgdHJhY2tlciBpcyByZXBsYWNlZC5cbiAqXG4gKiBBbnkgdHJhY2tlZCBwcm9wZXJ0aWVzIGNvbnN1bWVkIGFyZSBhZGRlZCB0byB0aGUgY3VycmVudCB0cmFja2VyLlxuICpcbiAqIFdoZW4gYSB0cmFja2VkIGNvbXB1dGVkIHByb3BlcnR5IGlzIGV4aXRlZCwgdGhlIHRyYWNrZXIncyB0YWdzIGFyZVxuICogY29tYmluZWQgYW5kIGFkZGVkIHRvIHRoZSBwYXJlbnQgdHJhY2tlci5cbiAqXG4gKiBUaGUgY29uc2VxdWVuY2UgaXMgdGhhdCBlYWNoIHRyYWNrZWQgY29tcHV0ZWQgcHJvcGVydHkgaGFzIGEgdGFnXG4gKiB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSB0cmFja2VkIHByb3BlcnRpZXMgY29uc3VtZWQgaW5zaWRlIG9mXG4gKiBpdHNlbGYsIGluY2x1ZGluZyBjaGlsZCB0cmFja2VkIGNvbXB1dGVkIHByb3BlcnRpZXMuXG4gKi9cbmxldCBDVVJSRU5UX1RSQUNLRVI6IFRyYWNrZXIgfCBudWxsID0gbnVsbDtcblxuY29uc3QgT1BFTl9UUkFDS19GUkFNRVM6IChUcmFja2VyIHwgbnVsbClbXSA9IFtdO1xuXG5leHBvcnQgZnVuY3Rpb24gYmVnaW5UcmFja0ZyYW1lKGRlYnVnZ2luZ0NvbnRleHQ/OiBzdHJpbmcgfCBmYWxzZSk6IHZvaWQge1xuICBPUEVOX1RSQUNLX0ZSQU1FUy5wdXNoKENVUlJFTlRfVFJBQ0tFUik7XG5cbiAgQ1VSUkVOVF9UUkFDS0VSID0gbmV3IFRyYWNrZXIoKTtcblxuICBpZiAoREVCVUcpIHtcbiAgICB1bndyYXAoYmVnaW5UcmFja2luZ1RyYW5zYWN0aW9uKShkZWJ1Z2dpbmdDb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kVHJhY2tGcmFtZSgpOiBUYWcge1xuICBsZXQgY3VycmVudCA9IENVUlJFTlRfVFJBQ0tFUjtcblxuICBpZiAoREVCVUcpIHtcbiAgICBpZiAoT1BFTl9UUkFDS19GUkFNRVMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2F0dGVtcHRlZCB0byBjbG9zZSBhIHRyYWNraW5nIGZyYW1lLCBidXQgb25lIHdhcyBub3Qgb3BlbicpO1xuICAgIH1cblxuICAgIHVud3JhcChlbmRUcmFja2luZ1RyYW5zYWN0aW9uKSgpO1xuICB9XG5cbiAgQ1VSUkVOVF9UUkFDS0VSID0gT1BFTl9UUkFDS19GUkFNRVMucG9wKCkgfHwgbnVsbDtcblxuICByZXR1cm4gdW53cmFwKGN1cnJlbnQpLmNvbWJpbmUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJlZ2luVW50cmFja0ZyYW1lKCk6IHZvaWQge1xuICBPUEVOX1RSQUNLX0ZSQU1FUy5wdXNoKENVUlJFTlRfVFJBQ0tFUik7XG4gIENVUlJFTlRfVFJBQ0tFUiA9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmRVbnRyYWNrRnJhbWUoKTogdm9pZCB7XG4gIGlmIChERUJVRyAmJiBPUEVOX1RSQUNLX0ZSQU1FUy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2F0dGVtcHRlZCB0byBjbG9zZSBhIHRyYWNraW5nIGZyYW1lLCBidXQgb25lIHdhcyBub3Qgb3BlbicpO1xuICB9XG5cbiAgQ1VSUkVOVF9UUkFDS0VSID0gT1BFTl9UUkFDS19GUkFNRVMucG9wKCkgfHwgbnVsbDtcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiBpcyBvbmx5IGZvciBoYW5kbGluZyBlcnJvcnMgYW5kIHJlc2V0dGluZyB0byBhIHZhbGlkIHN0YXRlXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRUcmFja2luZygpOiBzdHJpbmcgfCB2b2lkIHtcbiAgd2hpbGUgKE9QRU5fVFJBQ0tfRlJBTUVTLmxlbmd0aCA+IDApIHtcbiAgICBPUEVOX1RSQUNLX0ZSQU1FUy5wb3AoKTtcbiAgfVxuXG4gIENVUlJFTlRfVFJBQ0tFUiA9IG51bGw7XG5cbiAgaWYgKERFQlVHKSB7XG4gICAgcmV0dXJuIHVud3JhcChyZXNldFRyYWNraW5nVHJhbnNhY3Rpb24pKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVHJhY2tpbmcoKTogYm9vbGVhbiB7XG4gIHJldHVybiBDVVJSRU5UX1RSQUNLRVIgIT09IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lVGFnKHRhZzogVGFnKTogdm9pZCB7XG4gIGlmIChDVVJSRU5UX1RSQUNLRVIgIT09IG51bGwpIHtcbiAgICBDVVJSRU5UX1RSQUNLRVIuYWRkKHRhZyk7XG4gIH1cbn1cblxuLy8vLy8vLy8vL1xuXG5jb25zdCBDQUNIRV9LRVk6IHVuaXF1ZSBzeW1ib2wgPSBzeW1ib2woJ0NBQ0hFX0tFWScpO1xuXG4vLyBwdWJsaWMgaW50ZXJmYWNlXG5leHBvcnQgaW50ZXJmYWNlIENhY2hlPFQgPSB1bmtub3duPiB7XG4gIFtDQUNIRV9LRVldOiBUO1xufVxuXG5jb25zdCBGTjogdW5pcXVlIHN5bWJvbCA9IHN5bWJvbCgnRk4nKTtcbmNvbnN0IExBU1RfVkFMVUU6IHVuaXF1ZSBzeW1ib2wgPSBzeW1ib2woJ0xBU1RfVkFMVUUnKTtcbmNvbnN0IFRBRzogdW5pcXVlIHN5bWJvbCA9IHN5bWJvbCgnVEFHJyk7XG5jb25zdCBTTkFQU0hPVDogdW5pcXVlIHN5bWJvbCA9IHN5bWJvbCgnU05BUFNIT1QnKTtcbmNvbnN0IERFQlVHX0xBQkVMOiB1bmlxdWUgc3ltYm9sID0gc3ltYm9sKCdERUJVR19MQUJFTCcpO1xuXG5pbnRlcmZhY2UgSW50ZXJuYWxDYWNoZTxUID0gdW5rbm93bj4ge1xuICBbRk5dOiAoLi4uYXJnczogdW5rbm93bltdKSA9PiBUO1xuICBbTEFTVF9WQUxVRV06IFQgfCB1bmRlZmluZWQ7XG4gIFtUQUddOiBUYWcgfCB1bmRlZmluZWQ7XG4gIFtTTkFQU0hPVF06IFJldmlzaW9uO1xuICBbREVCVUdfTEFCRUxdPzogc3RyaW5nIHwgZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDYWNoZTxUPihmbjogKCkgPT4gVCwgZGVidWdnaW5nTGFiZWw/OiBzdHJpbmcgfCBmYWxzZSk6IENhY2hlPFQ+IHtcbiAgaWYgKERFQlVHICYmICEodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBjcmVhdGVDYWNoZSgpIG11c3QgYmUgcGFzc2VkIGEgZnVuY3Rpb24gYXMgaXRzIGZpcnN0IHBhcmFtZXRlci4gQ2FsbGVkIHdpdGg6ICR7U3RyaW5nKGZuKX1gXG4gICAgKTtcbiAgfVxuXG4gIGxldCBjYWNoZTogSW50ZXJuYWxDYWNoZTxUPiA9IHtcbiAgICBbRk5dOiBmbixcbiAgICBbTEFTVF9WQUxVRV06IHVuZGVmaW5lZCxcbiAgICBbVEFHXTogdW5kZWZpbmVkLFxuICAgIFtTTkFQU0hPVF06IC0xLFxuICB9O1xuXG4gIGlmIChERUJVRykge1xuICAgIGNhY2hlW0RFQlVHX0xBQkVMXSA9IGRlYnVnZ2luZ0xhYmVsO1xuICB9XG5cbiAgcmV0dXJuIChjYWNoZSBhcyB1bmtub3duKSBhcyBDYWNoZTxUPjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFZhbHVlPFQ+KGNhY2hlOiBDYWNoZTxUPik6IFQgfCB1bmRlZmluZWQge1xuICBhc3NlcnRDYWNoZShjYWNoZSwgJ2dldFZhbHVlJyk7XG5cbiAgbGV0IGZuID0gY2FjaGVbRk5dO1xuICBsZXQgdGFnID0gY2FjaGVbVEFHXTtcbiAgbGV0IHNuYXBzaG90ID0gY2FjaGVbU05BUFNIT1RdO1xuXG4gIGlmICh0YWcgPT09IHVuZGVmaW5lZCB8fCAhdmFsaWRhdGVUYWcodGFnLCBzbmFwc2hvdCkpIHtcbiAgICBiZWdpblRyYWNrRnJhbWUoKTtcblxuICAgIHRyeSB7XG4gICAgICBjYWNoZVtMQVNUX1ZBTFVFXSA9IGZuKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRhZyA9IGVuZFRyYWNrRnJhbWUoKTtcbiAgICAgIGNhY2hlW1RBR10gPSB0YWc7XG4gICAgICBjYWNoZVtTTkFQU0hPVF0gPSB2YWx1ZUZvclRhZyh0YWcpO1xuICAgICAgY29uc3VtZVRhZyh0YWcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zdW1lVGFnKHRhZyk7XG4gIH1cblxuICByZXR1cm4gY2FjaGVbTEFTVF9WQUxVRV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbnN0KGNhY2hlOiBDYWNoZSk6IGJvb2xlYW4ge1xuICBhc3NlcnRDYWNoZShjYWNoZSwgJ2lzQ29uc3QnKTtcblxuICBsZXQgdGFnID0gY2FjaGVbVEFHXTtcblxuICBhc3NlcnRUYWcodGFnLCBjYWNoZSk7XG5cbiAgcmV0dXJuIGlzQ29uc3RUYWcodGFnKTtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0Q2FjaGU8VD4oXG4gIHZhbHVlOiBDYWNoZTxUPiB8IEludGVybmFsQ2FjaGU8VD4sXG4gIGZuTmFtZTogc3RyaW5nXG4pOiBhc3NlcnRzIHZhbHVlIGlzIEludGVybmFsQ2FjaGU8VD4ge1xuICBpZiAoREVCVUcgJiYgISh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsICYmIEZOIGluIHZhbHVlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGAke2ZuTmFtZX0oKSBjYW4gb25seSBiZSB1c2VkIG9uIGFuIGluc3RhbmNlIG9mIGEgY2FjaGUgY3JlYXRlZCB3aXRoIGNyZWF0ZUNhY2hlKCkuIENhbGxlZCB3aXRoOiAke1N0cmluZyhcbiAgICAgICAgdmFsdWVcbiAgICAgICl9YFxuICAgICk7XG4gIH1cbn1cblxuLy8gcmVwbGFjZSB0aGlzIHdpdGggYGV4cGVjdGAgd2hlbiB3ZSBjYW5cbmZ1bmN0aW9uIGFzc2VydFRhZyh0YWc6IFRhZyB8IHVuZGVmaW5lZCwgY2FjaGU6IEludGVybmFsQ2FjaGUpOiBhc3NlcnRzIHRhZyBpcyBUYWcge1xuICBpZiAoREVCVUcgJiYgdGFnID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgaXNDb25zdCgpIGNhbiBvbmx5IGJlIHVzZWQgb24gYSBjYWNoZSBvbmNlIGdldFZhbHVlKCkgaGFzIGJlZW4gY2FsbGVkIGF0IGxlYXN0IG9uY2UuIENhbGxlZCB3aXRoIGNhY2hlIGZ1bmN0aW9uOlxcblxcbiR7U3RyaW5nKFxuICAgICAgICBjYWNoZVtGTl1cbiAgICAgICl9YFxuICAgICk7XG4gIH1cbn1cblxuLy8vLy8vLy8vL1xuXG4vLyBMZWdhY3kgdHJhY2tpbmcgQVBJc1xuXG4vLyB0cmFjaygpIHNob3VsZG4ndCBiZSBuZWNlc3NhcnkgYXQgYWxsIGluIHRoZSBWTSBvbmNlIHRoZSBhdXRvdHJhY2tpbmdcbi8vIHJlZmFjdG9ycyBhcmUgbWVyZ2VkLCBhbmQgd2Ugc2hvdWxkIGdlbmVyYWxseSBiZSBtb3ZpbmcgYXdheSBmcm9tIGl0LiBJdCBtYXlcbi8vIGJlIG5lY2Vzc2FyeSBpbiBFbWJlciBmb3IgYSB3aGlsZSBsb25nZXIsIGJ1dCBJIHRoaW5rIHdlJ2xsIGJlIGFibGUgdG8gZHJvcFxuLy8gaXQgaW4gZmF2b3Igb2YgY2FjaGUgc29vbmVyIHJhdGhlciB0aGFuIGxhdGVyLlxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNrKGNhbGxiYWNrOiAoKSA9PiB2b2lkLCBkZWJ1Z0xhYmVsPzogc3RyaW5nIHwgZmFsc2UpOiBUYWcge1xuICBiZWdpblRyYWNrRnJhbWUoZGVidWdMYWJlbCk7XG5cbiAgbGV0IHRhZztcblxuICB0cnkge1xuICAgIGNhbGxiYWNrKCk7XG4gIH0gZmluYWxseSB7XG4gICAgdGFnID0gZW5kVHJhY2tGcmFtZSgpO1xuICB9XG5cbiAgcmV0dXJuIHRhZztcbn1cblxuLy8gdW50cmFjaygpIGlzIGN1cnJlbnRseSBtYWlubHkgdXNlZCB0byBoYW5kbGUgcGxhY2VzIHRoYXQgd2VyZSBwcmV2aW91c2x5IG5vdFxuLy8gdHJhY2tlZCwgYW5kIHRoYXQgdHJhY2tpbmcgbm93IHdvdWxkIGNhdXNlIGJhY2t0cmFja2luZyByZXJlbmRlciBhc3NlcnRpb25zLlxuLy8gSSB0aGluayBvbmNlIHdlIG1vdmUgZXZlcnlvbmUgZm9yd2FyZCBvbnRvIG1vZGVybiBBUElzLCB3ZSdsbCBwcm9iYWJseSBiZVxuLy8gYWJsZSB0byByZW1vdmUgaXQsIGJ1dCBJJ20gbm90IHN1cmUgeWV0LlxuZXhwb3J0IGZ1bmN0aW9uIHVudHJhY2s8VD4oY2FsbGJhY2s6ICgpID0+IFQpOiBUIHtcbiAgYmVnaW5VbnRyYWNrRnJhbWUoKTtcblxuICB0cnkge1xuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICB9IGZpbmFsbHkge1xuICAgIGVuZFVudHJhY2tGcmFtZSgpO1xuICB9XG59XG4iLCJpbXBvcnQgeyB0YWdGb3IsIGRpcnR5VGFnRm9yIH0gZnJvbSAnLi9tZXRhJztcbmltcG9ydCB7IGNvbnN1bWVUYWcgfSBmcm9tICcuL3RyYWNraW5nJztcblxuZXhwb3J0IHR5cGUgR2V0dGVyPFQsIEsgZXh0ZW5kcyBrZXlvZiBUPiA9IChzZWxmOiBUKSA9PiBUW0tdIHwgdW5kZWZpbmVkO1xuZXhwb3J0IHR5cGUgU2V0dGVyPFQsIEsgZXh0ZW5kcyBrZXlvZiBUPiA9IChzZWxmOiBULCB2YWx1ZTogVFtLXSkgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNrZWREYXRhPFQgZXh0ZW5kcyBvYmplY3QsIEsgZXh0ZW5kcyBrZXlvZiBUPihcbiAga2V5OiBLLFxuICBpbml0aWFsaXplcj86ICh0aGlzOiBUKSA9PiBUW0tdXG4pOiB7IGdldHRlcjogR2V0dGVyPFQsIEs+OyBzZXR0ZXI6IFNldHRlcjxULCBLPiB9IHtcbiAgbGV0IHZhbHVlcyA9IG5ldyBXZWFrTWFwPFQsIFRbS10+KCk7XG4gIGxldCBoYXNJbml0aWFsaXplciA9IHR5cGVvZiBpbml0aWFsaXplciA9PT0gJ2Z1bmN0aW9uJztcblxuICBmdW5jdGlvbiBnZXR0ZXIoc2VsZjogVCkge1xuICAgIGNvbnN1bWVUYWcodGFnRm9yKHNlbGYsIGtleSkpO1xuXG4gICAgbGV0IHZhbHVlO1xuXG4gICAgLy8gSWYgdGhlIGZpZWxkIGhhcyBuZXZlciBiZWVuIGluaXRpYWxpemVkLCB3ZSBzaG91bGQgaW5pdGlhbGl6ZSBpdFxuICAgIGlmIChoYXNJbml0aWFsaXplciAmJiAhdmFsdWVzLmhhcyhzZWxmKSkge1xuICAgICAgdmFsdWUgPSBpbml0aWFsaXplciEuY2FsbChzZWxmKTtcbiAgICAgIHZhbHVlcy5zZXQoc2VsZiwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlcy5nZXQoc2VsZik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0dGVyKHNlbGY6IFQsIHZhbHVlOiBUW0tdKTogdm9pZCB7XG4gICAgZGlydHlUYWdGb3Ioc2VsZiwga2V5KTtcbiAgICB2YWx1ZXMuc2V0KHNlbGYsIHZhbHVlKTtcbiAgfVxuXG4gIHJldHVybiB7IGdldHRlciwgc2V0dGVyIH07XG59XG4iLCJpbXBvcnQgeyBzeW1ib2xGb3IsIGdldEdsb2JhbCB9IGZyb20gJy4vbGliL3V0aWxzJztcblxuY29uc3QgR0xJTU1FUl9WQUxJREFUT1JfUkVHSVNUUkFUSU9OID0gc3ltYm9sRm9yKCdHTElNTUVSX1ZBTElEQVRPUl9SRUdJU1RSQVRJT04nKTtcblxuY29uc3QgZ2xvYmFsT2JqID0gZ2V0R2xvYmFsKCk7XG5cbmlmIChnbG9iYWxPYmpbR0xJTU1FUl9WQUxJREFUT1JfUkVHSVNUUkFUSU9OXSA9PT0gdHJ1ZSkge1xuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgJ1RoZSBgQGdsaW1tZXIvdmFsaWRhdG9yYCBsaWJyYXJ5IGhhcyBiZWVuIGluY2x1ZGVkIHR3aWNlIGluIHRoaXMgYXBwbGljYXRpb24uIEl0IGNvdWxkIGJlIGRpZmZlcmVudCB2ZXJzaW9ucyBvZiB0aGUgcGFja2FnZSwgb3IgdGhlIHNhbWUgdmVyc2lvbiBpbmNsdWRlZCB0d2ljZSBieSBtaXN0YWtlLiBgQGdsaW1tZXIvdmFsaWRhdG9yYCBkZXBlbmRzIG9uIGhhdmluZyBhIHNpbmdsZSBjb3B5IG9mIHRoZSBwYWNrYWdlIGluIHVzZSBhdCBhbnkgdGltZSBpbiBhbiBhcHBsaWNhdGlvbiwgZXZlbiBpZiB0aGV5IGFyZSB0aGUgc2FtZSB2ZXJzaW9uLiBZb3UgbXVzdCBkZWR1cGUgeW91ciBidWlsZCB0byByZW1vdmUgdGhlIGR1cGxpY2F0ZSBwYWNrYWdlcyBpbiBvcmRlciB0byBwcmV2ZW50IHRoaXMgZXJyb3IuJ1xuICApO1xufVxuXG5nbG9iYWxPYmpbR0xJTU1FUl9WQUxJREFUT1JfUkVHSVNUUkFUSU9OXSA9IHRydWU7XG5cbmV4cG9ydCB7XG4gIEFMTE9XX0NZQ0xFUyxcbiAgYnVtcCxcbiAgQ29tYmluYXRvclRhZyxcbiAgY29tYmluZSxcbiAgQ09NUFVURSxcbiAgQ09OU1RBTlRfVEFHLFxuICBDT05TVEFOVCxcbiAgQ29uc3RhbnRUYWcsXG4gIGNyZWF0ZVRhZyxcbiAgY3JlYXRlVXBkYXRhYmxlVGFnLFxuICBDdXJyZW50VGFnLFxuICBDVVJSRU5UX1RBRyxcbiAgRElSVFlfVEFHIGFzIGRpcnR5VGFnLFxuICBEaXJ0eWFibGVUYWcsXG4gIEVudGl0eVRhZyxcbiAgSU5JVElBTCxcbiAgaXNDb25zdFRhZyxcbiAgUmV2aXNpb24sXG4gIFRhZyxcbiAgVXBkYXRhYmxlVGFnLFxuICBVUERBVEVfVEFHIGFzIHVwZGF0ZVRhZyxcbiAgdmFsaWRhdGVUYWcsXG4gIHZhbHVlRm9yVGFnLFxuICBWb2xhdGlsZVRhZyxcbiAgVk9MQVRJTEVfVEFHLFxuICBWT0xBVElMRSxcbn0gZnJvbSAnLi9saWIvdmFsaWRhdG9ycyc7XG5cbmV4cG9ydCB7IGRpcnR5VGFnRm9yLCB0YWdGb3IsIHRhZ01ldGFGb3IsIFRhZ01ldGEgfSBmcm9tICcuL2xpYi9tZXRhJztcblxuZXhwb3J0IHtcbiAgYmVnaW5UcmFja0ZyYW1lLFxuICBlbmRUcmFja0ZyYW1lLFxuICBiZWdpblVudHJhY2tGcmFtZSxcbiAgZW5kVW50cmFja0ZyYW1lLFxuICByZXNldFRyYWNraW5nLFxuICBjb25zdW1lVGFnLFxuICBpc1RyYWNraW5nLFxuICB0cmFjayxcbiAgdW50cmFjayxcbiAgQ2FjaGUsXG4gIGNyZWF0ZUNhY2hlLFxuICBpc0NvbnN0LFxuICBnZXRWYWx1ZSxcbn0gZnJvbSAnLi9saWIvdHJhY2tpbmcnO1xuXG5leHBvcnQgeyB0cmFja2VkRGF0YSB9IGZyb20gJy4vbGliL3RyYWNrZWQtZGF0YSc7XG5cbmV4cG9ydCB7XG4gIGxvZ1RyYWNraW5nU3RhY2ssXG4gIHNldFRyYWNraW5nVHJhbnNhY3Rpb25FbnYsXG4gIHJ1bkluVHJhY2tpbmdUcmFuc2FjdGlvbixcbiAgYmVnaW5UcmFja2luZ1RyYW5zYWN0aW9uLFxuICBlbmRUcmFja2luZ1RyYW5zYWN0aW9uLFxufSBmcm9tICcuL2xpYi9kZWJ1Zyc7XG4iXSwibmFtZXMiOlsiREVCVUciLCJzZXRUcmFja2luZ1RyYW5zYWN0aW9uRW52IiwiYmVnaW5UcmFja2luZ1RyYW5zYWN0aW9uIiwiZW5kVHJhY2tpbmdUcmFuc2FjdGlvbiIsImxvZ1RyYWNraW5nU3RhY2siLCJydW5JblRyYWNraW5nVHJhbnNhY3Rpb24iLCJhc3NlcnQiLCJBTExPV19DWUNMRVMiLCJzY2hlZHVsZVJldmFsaWRhdGUiLCJtYXJrVGFnQXNDb25zdW1lZCIsIl9jb21iaW5lIl0sIm1hcHBpbmdzIjoiOztFQVVBO0VBQ00sU0FBQSxTQUFBLENBQUEsS0FBQSxFQUE4QztFQUNsRCxTQUFBLEtBQUE7O0VBSUY7RUFDQTs7RUFDTyxJQUFNLE1BQU0sR0FDakIsT0FBQSxNQUFBLEtBQUEsV0FBQSxHQUFBLE1BQUE7RUFHSyxVQUFBLEdBQUQ7RUFBQSxnQkFBc0IsR0FBdEIsR0FBNEIsSUFBSSxDQUFKLEtBQUEsQ0FBVyxJQUFJLENBQUos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
