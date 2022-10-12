"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadResolution = loadResolution;
exports.ARGUMENT_RESOLUTION = exports.LooseModeResolution = exports.STRICT_RESOLUTION = exports.StrictResolution = void 0;

/**
 * A free variable is resolved according to a resolution rule:
 *
 * 1. Strict resolution
 * 2. Namespaced resolution
 * 3. Fallback resolution
 */

/**
 * Strict resolution is used:
 *
 * 1. in a strict mode template
 * 2. in an unambiguous invocation with dot paths
 */
var StrictResolution = /*#__PURE__*/function () {
  function StrictResolution() {
    this.isAngleBracket = false;
  }

  var _proto = StrictResolution.prototype;

  _proto.resolution = function resolution() {
    return 31
    /* GetStrictFree */
    ;
  };

  _proto.serialize = function serialize() {
    return 'Strict';
  };

  return StrictResolution;
}();

exports.StrictResolution = StrictResolution;
var STRICT_RESOLUTION = new StrictResolution();
/**
 * A `LooseModeResolution` includes:
 *
 * - 0 or more namespaces to resolve the variable in
 * - optional fallback behavior
 *
 * In practice, there are a limited number of possible combinations of these degrees of freedom,
 * and they are captured by the `Ambiguity` union below.
 */

exports.STRICT_RESOLUTION = STRICT_RESOLUTION;

var LooseModeResolution = /*#__PURE__*/function () {
  function LooseModeResolution(ambiguity, isAngleBracket) {
    if (isAngleBracket === void 0) {
      isAngleBracket = false;
    }

    this.ambiguity = ambiguity;
    this.isAngleBracket = isAngleBracket;
  }
  /**
   * Namespaced resolution is used in an unambiguous syntax position:
   *
   * 1. `(sexp)` (namespace: `Helper`)
   * 2. `{{#block}}` (namespace: `Component`)
   * 3. `<a {{modifier}}>` (namespace: `Modifier`)
   * 4. `<Component />` (namespace: `Component`)
   *
   * @see {NamespacedAmbiguity}
   */


  LooseModeResolution.namespaced = function namespaced(namespace, isAngleBracket) {
    if (isAngleBracket === void 0) {
      isAngleBracket = false;
    }

    return new LooseModeResolution({
      namespaces: [namespace],
      fallback: false
    }, isAngleBracket);
  }
  /**
   * Fallback resolution is used when no namespaced resolutions are possible, but fallback
   * resolution is still allowed.
   *
   * ```hbs
   * {{x.y}}
   * ```
   *
   * @see {FallbackAmbiguity}
   */
  ;

  LooseModeResolution.fallback = function fallback() {
    return new LooseModeResolution({
      namespaces: [],
      fallback: true
    });
  }
  /**
   * Append resolution is used when the variable should be resolved in both the `component` and
   * `helper` namespaces. Fallback resolution is optional.
   *
   * ```hbs
   * {{x}}
   * ```
   *
   * ^ `x` should be resolved in the `component` and `helper` namespaces with fallback resolution.
   *
   * ```hbs
   * {{x y}}
   * ```
   *
   * ^ `x` should be resolved in the `component` and `helper` namespaces without fallback
   * resolution.
   *
   * @see {ComponentOrHelperAmbiguity}
   */
  ;

  LooseModeResolution.append = function append(_ref) {
    var invoke = _ref.invoke;
    return new LooseModeResolution({
      namespaces: ["Component"
      /* Component */
      , "Helper"
      /* Helper */
      ],
      fallback: !invoke
    });
  }
  /**
   * Trusting append resolution is used when the variable should be resolved in both the `component` and
   * `helper` namespaces. Fallback resolution is optional.
   *
   * ```hbs
   * {{{x}}}
   * ```
   *
   * ^ `x` should be resolved in the `component` and `helper` namespaces with fallback resolution.
   *
   * ```hbs
   * {{{x y}}}
   * ```
   *
   * ^ `x` should be resolved in the `component` and `helper` namespaces without fallback
   * resolution.
   *
   * @see {HelperAmbiguity}
   */
  ;

  LooseModeResolution.trustingAppend = function trustingAppend(_ref2) {
    var invoke = _ref2.invoke;
    return new LooseModeResolution({
      namespaces: ["Helper"
      /* Helper */
      ],
      fallback: !invoke
    });
  }
  /**
   * Attribute resolution is used when the variable should be resolved as a `helper` with fallback
   * resolution.
   *
   * ```hbs
   * <a href={{x}} />
   * <a href="{{x}}.html" />
   * ```
   *
   * ^ resolved in the `helper` namespace with fallback
   *
   * @see {HelperAmbiguity}
   */
  ;

  LooseModeResolution.attr = function attr() {
    return new LooseModeResolution({
      namespaces: ["Helper"
      /* Helper */
      ],
      fallback: true
    });
  };

  var _proto2 = LooseModeResolution.prototype;

  _proto2.resolution = function resolution() {
    if (this.ambiguity.namespaces.length === 0) {
      return 31
      /* GetStrictFree */
      ;
    } else if (this.ambiguity.namespaces.length === 1) {
      if (this.ambiguity.fallback) {
        // simple namespaced resolution with fallback must be attr={{x}}
        return 36
        /* GetFreeAsHelperHeadOrThisFallback */
        ;
      } else {
        // simple namespaced resolution without fallback
        switch (this.ambiguity.namespaces[0]) {
          case "Helper"
          /* Helper */
          :
            return 37
            /* GetFreeAsHelperHead */
            ;

          case "Modifier"
          /* Modifier */
          :
            return 38
            /* GetFreeAsModifierHead */
            ;

          case "Component"
          /* Component */
          :
            return 39
            /* GetFreeAsComponentHead */
            ;
        }
      }
    } else if (this.ambiguity.fallback) {
      // component or helper + fallback ({{something}})
      return 34
      /* GetFreeAsComponentOrHelperHeadOrThisFallback */
      ;
    } else {
        // component or helper without fallback ({{something something}})
        return 35
        /* GetFreeAsComponentOrHelperHead */
        ;
      }
  };

  _proto2.serialize = function serialize() {
    if (this.ambiguity.namespaces.length === 0) {
      return 'Loose';
    } else if (this.ambiguity.namespaces.length === 1) {
      if (this.ambiguity.fallback) {
        // simple namespaced resolution with fallback must be attr={{x}}
        return ['ambiguous', "Attr"
        /* Attr */
        ];
      } else {
        return ['ns', this.ambiguity.namespaces[0]];
      }
    } else if (this.ambiguity.fallback) {
      // component or helper + fallback ({{something}})
      return ['ambiguous', "Append"
      /* Append */
      ];
    } else {
      // component or helper without fallback ({{something something}})
      return ['ambiguous', "Invoke"
      /* Invoke */
      ];
    }
  };

  return LooseModeResolution;
}();

exports.LooseModeResolution = LooseModeResolution;
var ARGUMENT_RESOLUTION = LooseModeResolution.fallback();
exports.ARGUMENT_RESOLUTION = ARGUMENT_RESOLUTION;

function loadResolution(resolution) {
  if (typeof resolution === 'string') {
    switch (resolution) {
      case 'Loose':
        return LooseModeResolution.fallback();

      case 'Strict':
        return STRICT_RESOLUTION;
    }
  }

  switch (resolution[0]) {
    case 'ambiguous':
      switch (resolution[1]) {
        case "Append"
        /* Append */
        :
          return LooseModeResolution.append({
            invoke: false
          });

        case "Attr"
        /* Attr */
        :
          return LooseModeResolution.attr();

        case "Invoke"
        /* Invoke */
        :
          return LooseModeResolution.append({
            invoke: true
          });
      }

    case 'ns':
      return LooseModeResolution.namespaced(resolution[1]);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9vYmplY3RzL3Jlc29sdXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7QUFVQTs7Ozs7O0FBTUEsSUFBTSxnQkFBTixHQUFBLGFBQUEsWUFBQTtBQUFBLFdBQUEsZ0JBQUEsR0FBQTtBQVNXLFNBQUEsY0FBQSxHQUFBLEtBQUE7QUFDVjs7QUFWRCxNQUFBLE1BQUEsR0FBQSxnQkFBQSxDQUFBLFNBQUE7O0FBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxHQUNFLFNBQUEsVUFBQSxHQUFVO0FBQ1IsV0FBQTtBQUFBO0FBQUE7QUFGSixHQUFBOztBQUFBLEVBQUEsTUFBQSxDQUFBLFNBQUEsR0FLRSxTQUFBLFNBQUEsR0FBUztBQUNQLFdBQUEsUUFBQTtBQU5KLEdBQUE7O0FBQUEsU0FBQSxnQkFBQTtBQUFBLENBQUEsRUFBQTs7O0FBWU8sSUFBTSxpQkFBaUIsR0FBRyxJQUExQixnQkFBMEIsRUFBMUI7QUFFUDs7Ozs7Ozs7Ozs7O0FBU0EsSUFBTSxtQkFBTixHQUFBLGFBQUEsWUFBQTtBQXdHRSxXQUFBLG1CQUFBLENBQUEsU0FBQSxFQUFBLGNBQUEsRUFBMEU7QUFBQSxRQUF0QixjQUFzQixLQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQXRCLE1BQUEsY0FBc0IsR0FBMUUsS0FBb0Q7QUFBc0I7O0FBQXJELFNBQUEsU0FBQSxHQUFBLFNBQUE7QUFBK0IsU0FBQSxjQUFBLEdBQUEsY0FBQTtBQUEwQjtBQXZHOUU7Ozs7Ozs7Ozs7OztBQURGLEVBQUEsbUJBQUEsQ0FBQSxVQUFBLEdBV0UsU0FBQSxVQUFBLENBQUEsU0FBQSxFQUFBLGNBQUEsRUFBcUU7QUFBQSxRQUF0QixjQUFzQixLQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQXRCLE1BQUEsY0FBc0IsR0FBckUsS0FBK0M7QUFBc0I7O0FBQ25FLFdBQU8sSUFBQSxtQkFBQSxDQUNM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QW5CLFVBQUEsQ0FBK0IsVUFBVSxDQUFoRCxDQUFnRCxDQUF6QyxDQUFQO0FBWko7QUFjRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQSBmcmVlIHZhcmlhYmxlIGlzIHJlc29sdmVkIGFjY29yZGluZyB0byBhIHJlc29sdXRpb24gcnVsZTpcbiAqXG4gKiAxLiBTdHJpY3QgcmVzb2x1dGlvblxuICogMi4gTmFtZXNwYWNlZCByZXNvbHV0aW9uXG4gKiAzLiBGYWxsYmFjayByZXNvbHV0aW9uXG4gKi9cblxuaW1wb3J0IHsgR2V0Q29udGV4dHVhbEZyZWVPcCwgU2V4cE9wY29kZXMgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBTdHJpY3QgcmVzb2x1dGlvbiBpcyB1c2VkOlxuICpcbiAqIDEuIGluIGEgc3RyaWN0IG1vZGUgdGVtcGxhdGVcbiAqIDIuIGluIGFuIHVuYW1iaWd1b3VzIGludm9jYXRpb24gd2l0aCBkb3QgcGF0aHNcbiAqL1xuZXhwb3J0IGNsYXNzIFN0cmljdFJlc29sdXRpb24ge1xuICByZXNvbHV0aW9uKCk6IEdldENvbnRleHR1YWxGcmVlT3Age1xuICAgIHJldHVybiBTZXhwT3Bjb2Rlcy5HZXRTdHJpY3RGcmVlO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRSZXNvbHV0aW9uIHtcbiAgICByZXR1cm4gJ1N0cmljdCc7XG4gIH1cblxuICByZWFkb25seSBpc0FuZ2xlQnJhY2tldCA9IGZhbHNlO1xufVxuXG5leHBvcnQgY29uc3QgU1RSSUNUX1JFU09MVVRJT04gPSBuZXcgU3RyaWN0UmVzb2x1dGlvbigpO1xuXG4vKipcbiAqIEEgYExvb3NlTW9kZVJlc29sdXRpb25gIGluY2x1ZGVzOlxuICpcbiAqIC0gMCBvciBtb3JlIG5hbWVzcGFjZXMgdG8gcmVzb2x2ZSB0aGUgdmFyaWFibGUgaW5cbiAqIC0gb3B0aW9uYWwgZmFsbGJhY2sgYmVoYXZpb3JcbiAqXG4gKiBJbiBwcmFjdGljZSwgdGhlcmUgYXJlIGEgbGltaXRlZCBudW1iZXIgb2YgcG9zc2libGUgY29tYmluYXRpb25zIG9mIHRoZXNlIGRlZ3JlZXMgb2YgZnJlZWRvbSxcbiAqIGFuZCB0aGV5IGFyZSBjYXB0dXJlZCBieSB0aGUgYEFtYmlndWl0eWAgdW5pb24gYmVsb3cuXG4gKi9cbmV4cG9ydCBjbGFzcyBMb29zZU1vZGVSZXNvbHV0aW9uIHtcbiAgLyoqXG4gICAqIE5hbWVzcGFjZWQgcmVzb2x1dGlvbiBpcyB1c2VkIGluIGFuIHVuYW1iaWd1b3VzIHN5bnRheCBwb3NpdGlvbjpcbiAgICpcbiAgICogMS4gYChzZXhwKWAgKG5hbWVzcGFjZTogYEhlbHBlcmApXG4gICAqIDIuIGB7eyNibG9ja319YCAobmFtZXNwYWNlOiBgQ29tcG9uZW50YClcbiAgICogMy4gYDxhIHt7bW9kaWZpZXJ9fT5gIChuYW1lc3BhY2U6IGBNb2RpZmllcmApXG4gICAqIDQuIGA8Q29tcG9uZW50IC8+YCAobmFtZXNwYWNlOiBgQ29tcG9uZW50YClcbiAgICpcbiAgICogQHNlZSB7TmFtZXNwYWNlZEFtYmlndWl0eX1cbiAgICovXG4gIHN0YXRpYyBuYW1lc3BhY2VkKG5hbWVzcGFjZTogRnJlZVZhck5hbWVzcGFjZSwgaXNBbmdsZUJyYWNrZXQgPSBmYWxzZSk6IExvb3NlTW9kZVJlc29sdXRpb24ge1xuICAgIHJldHVybiBuZXcgTG9vc2VNb2RlUmVzb2x1dGlvbihcbiAgICAgIHtcbiAgICAgICAgbmFtZXNwYWNlczogW25hbWVzcGFjZV0sXG4gICAgICAgIGZhbGxiYWNrOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBpc0FuZ2xlQnJhY2tldFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogRmFsbGJhY2sgcmVzb2x1dGlvbiBpcyB1c2VkIHdoZW4gbm8gbmFtZXNwYWNlZCByZXNvbHV0aW9ucyBhcmUgcG9zc2libGUsIGJ1dCBmYWxsYmFja1xuICAgKiByZXNvbHV0aW9uIGlzIHN0aWxsIGFsbG93ZWQuXG4gICAqXG4gICAqIGBgYGhic1xuICAgKiB7e3gueX19XG4gICAqIGBgYFxuICAgKlxuICAgKiBAc2VlIHtGYWxsYmFja0FtYmlndWl0eX1cbiAgICovXG4gIHN0YXRpYyBmYWxsYmFjaygpOiBMb29zZU1vZGVSZXNvbHV0aW9uIHtcbiAgICByZXR1cm4gbmV3IExvb3NlTW9kZVJlc29sdXRpb24oeyBuYW1lc3BhY2VzOiBbXSwgZmFsbGJhY2s6IHRydWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kIHJlc29sdXRpb24gaXMgdXNlZCB3aGVuIHRoZSB2YXJpYWJsZSBzaG91bGQgYmUgcmVzb2x2ZWQgaW4gYm90aCB0aGUgYGNvbXBvbmVudGAgYW5kXG4gICAqIGBoZWxwZXJgIG5hbWVzcGFjZXMuIEZhbGxiYWNrIHJlc29sdXRpb24gaXMgb3B0aW9uYWwuXG4gICAqXG4gICAqIGBgYGhic1xuICAgKiB7e3h9fVxuICAgKiBgYGBcbiAgICpcbiAgICogXiBgeGAgc2hvdWxkIGJlIHJlc29sdmVkIGluIHRoZSBgY29tcG9uZW50YCBhbmQgYGhlbHBlcmAgbmFtZXNwYWNlcyB3aXRoIGZhbGxiYWNrIHJlc29sdXRpb24uXG4gICAqXG4gICAqIGBgYGhic1xuICAgKiB7e3ggeX19XG4gICAqIGBgYFxuICAgKlxuICAgKiBeIGB4YCBzaG91bGQgYmUgcmVzb2x2ZWQgaW4gdGhlIGBjb21wb25lbnRgIGFuZCBgaGVscGVyYCBuYW1lc3BhY2VzIHdpdGhvdXQgZmFsbGJhY2tcbiAgICogcmVzb2x1dGlvbi5cbiAgICpcbiAgICogQHNlZSB7Q29tcG9uZW50T3JIZWxwZXJBbWJpZ3VpdHl9XG4gICAqL1xuICBzdGF0aWMgYXBwZW5kKHsgaW52b2tlIH06IHsgaW52b2tlOiBib29sZWFuIH0pOiBMb29zZU1vZGVSZXNvbHV0aW9uIHtcbiAgICByZXR1cm4gbmV3IExvb3NlTW9kZVJlc29sdXRpb24oe1xuICAgICAgbmFtZXNwYWNlczogW0ZyZWVWYXJOYW1lc3BhY2UuQ29tcG9uZW50LCBGcmVlVmFyTmFtZXNwYWNlLkhlbHBlcl0sXG4gICAgICBmYWxsYmFjazogIWludm9rZSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcnVzdGluZyBhcHBlbmQgcmVzb2x1dGlvbiBpcyB1c2VkIHdoZW4gdGhlIHZhcmlhYmxlIHNob3VsZCBiZSByZXNvbHZlZCBpbiBib3RoIHRoZSBgY29tcG9uZW50YCBhbmRcbiAgICogYGhlbHBlcmAgbmFtZXNwYWNlcy4gRmFsbGJhY2sgcmVzb2x1dGlvbiBpcyBvcHRpb25hbC5cbiAgICpcbiAgICogYGBgaGJzXG4gICAqIHt7e3h9fX1cbiAgICogYGBgXG4gICAqXG4gICAqIF4gYHhgIHNob3VsZCBiZSByZXNvbHZlZCBpbiB0aGUgYGNvbXBvbmVudGAgYW5kIGBoZWxwZXJgIG5hbWVzcGFjZXMgd2l0aCBmYWxsYmFjayByZXNvbHV0aW9uLlxuICAgKlxuICAgKiBgYGBoYnNcbiAgICoge3t7eCB5fX19XG4gICAqIGBgYFxuICAgKlxuICAgKiBeIGB4YCBzaG91bGQgYmUgcmVzb2x2ZWQgaW4gdGhlIGBjb21wb25lbnRgIGFuZCBgaGVscGVyYCBuYW1lc3BhY2VzIHdpdGhvdXQgZmFsbGJhY2tcbiAgICogcmVzb2x1dGlvbi5cbiAgICpcbiAgICogQHNlZSB7SGVscGVyQW1iaWd1aXR5fVxuICAgKi9cbiAgc3RhdGljIHRydXN0aW5nQXBwZW5kKHsgaW52b2tlIH06IHsgaW52b2tlOiBib29sZWFuIH0pOiBMb29zZU1vZGVSZXNvbHV0aW9uIHtcbiAgICByZXR1cm4gbmV3IExvb3NlTW9kZVJlc29sdXRpb24oe1xuICAgICAgbmFtZXNwYWNlczogW0ZyZWVWYXJOYW1lc3BhY2UuSGVscGVyXSxcbiAgICAgIGZhbGxiYWNrOiAhaW52b2tlLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dHJpYnV0ZSByZXNvbHV0aW9uIGlzIHVzZWQgd2hlbiB0aGUgdmFyaWFibGUgc2hvdWxkIGJlIHJlc29sdmVkIGFzIGEgYGhlbHBlcmAgd2l0aCBmYWxsYmFja1xuICAgKiByZXNvbHV0aW9uLlxuICAgKlxuICAgKiBgYGBoYnNcbiAgICogPGEgaHJlZj17e3h9fSAvPlxuICAgKiA8YSBocmVmPVwie3t4fX0uaHRtbFwiIC8+XG4gICAqIGBgYFxuICAgKlxuICAgKiBeIHJlc29sdmVkIGluIHRoZSBgaGVscGVyYCBuYW1lc3BhY2Ugd2l0aCBmYWxsYmFja1xuICAgKlxuICAgKiBAc2VlIHtIZWxwZXJBbWJpZ3VpdHl9XG4gICAqL1xuICBzdGF0aWMgYXR0cigpOiBMb29zZU1vZGVSZXNvbHV0aW9uIHtcbiAgICByZXR1cm4gbmV3IExvb3NlTW9kZVJlc29sdXRpb24oeyBuYW1lc3BhY2VzOiBbRnJlZVZhck5hbWVzcGFjZS5IZWxwZXJdLCBmYWxsYmFjazogdHJ1ZSB9KTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGFtYmlndWl0eTogQW1iaWd1aXR5LCByZWFkb25seSBpc0FuZ2xlQnJhY2tldCA9IGZhbHNlKSB7fVxuXG4gIHJlc29sdXRpb24oKTogR2V0Q29udGV4dHVhbEZyZWVPcCB7XG4gICAgaWYgKHRoaXMuYW1iaWd1aXR5Lm5hbWVzcGFjZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gU2V4cE9wY29kZXMuR2V0U3RyaWN0RnJlZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuYW1iaWd1aXR5Lm5hbWVzcGFjZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICBpZiAodGhpcy5hbWJpZ3VpdHkuZmFsbGJhY2spIHtcbiAgICAgICAgLy8gc2ltcGxlIG5hbWVzcGFjZWQgcmVzb2x1dGlvbiB3aXRoIGZhbGxiYWNrIG11c3QgYmUgYXR0cj17e3h9fVxuICAgICAgICByZXR1cm4gU2V4cE9wY29kZXMuR2V0RnJlZUFzSGVscGVySGVhZE9yVGhpc0ZhbGxiYWNrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gc2ltcGxlIG5hbWVzcGFjZWQgcmVzb2x1dGlvbiB3aXRob3V0IGZhbGxiYWNrXG4gICAgICAgIHN3aXRjaCAodGhpcy5hbWJpZ3VpdHkubmFtZXNwYWNlc1swXSkge1xuICAgICAgICAgIGNhc2UgRnJlZVZhck5hbWVzcGFjZS5IZWxwZXI6XG4gICAgICAgICAgICByZXR1cm4gU2V4cE9wY29kZXMuR2V0RnJlZUFzSGVscGVySGVhZDtcbiAgICAgICAgICBjYXNlIEZyZWVWYXJOYW1lc3BhY2UuTW9kaWZpZXI6XG4gICAgICAgICAgICByZXR1cm4gU2V4cE9wY29kZXMuR2V0RnJlZUFzTW9kaWZpZXJIZWFkO1xuICAgICAgICAgIGNhc2UgRnJlZVZhck5hbWVzcGFjZS5Db21wb25lbnQ6XG4gICAgICAgICAgICByZXR1cm4gU2V4cE9wY29kZXMuR2V0RnJlZUFzQ29tcG9uZW50SGVhZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5hbWJpZ3VpdHkuZmFsbGJhY2spIHtcbiAgICAgIC8vIGNvbXBvbmVudCBvciBoZWxwZXIgKyBmYWxsYmFjayAoe3tzb21ldGhpbmd9fSlcbiAgICAgIHJldHVybiBTZXhwT3Bjb2Rlcy5HZXRGcmVlQXNDb21wb25lbnRPckhlbHBlckhlYWRPclRoaXNGYWxsYmFjaztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29tcG9uZW50IG9yIGhlbHBlciB3aXRob3V0IGZhbGxiYWNrICh7e3NvbWV0aGluZyBzb21ldGhpbmd9fSlcbiAgICAgIHJldHVybiBTZXhwT3Bjb2Rlcy5HZXRGcmVlQXNDb21wb25lbnRPckhlbHBlckhlYWQ7XG4gICAgfVxuICB9XG5cbiAgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRSZXNvbHV0aW9uIHtcbiAgICBpZiAodGhpcy5hbWJpZ3VpdHkubmFtZXNwYWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiAnTG9vc2UnO1xuICAgIH0gZWxzZSBpZiAodGhpcy5hbWJpZ3VpdHkubmFtZXNwYWNlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGlmICh0aGlzLmFtYmlndWl0eS5mYWxsYmFjaykge1xuICAgICAgICAvLyBzaW1wbGUgbmFtZXNwYWNlZCByZXNvbHV0aW9uIHdpdGggZmFsbGJhY2sgbXVzdCBiZSBhdHRyPXt7eH19XG4gICAgICAgIHJldHVybiBbJ2FtYmlndW91cycsIFNlcmlhbGl6ZWRBbWJpZ3VpdHkuQXR0cl07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gWyducycsIHRoaXMuYW1iaWd1aXR5Lm5hbWVzcGFjZXNbMF1dO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5hbWJpZ3VpdHkuZmFsbGJhY2spIHtcbiAgICAgIC8vIGNvbXBvbmVudCBvciBoZWxwZXIgKyBmYWxsYmFjayAoe3tzb21ldGhpbmd9fSlcbiAgICAgIHJldHVybiBbJ2FtYmlndW91cycsIFNlcmlhbGl6ZWRBbWJpZ3VpdHkuQXBwZW5kXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29tcG9uZW50IG9yIGhlbHBlciB3aXRob3V0IGZhbGxiYWNrICh7e3NvbWV0aGluZyBzb21ldGhpbmd9fSlcbiAgICAgIHJldHVybiBbJ2FtYmlndW91cycsIFNlcmlhbGl6ZWRBbWJpZ3VpdHkuSW52b2tlXTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IEFSR1VNRU5UX1JFU09MVVRJT04gPSBMb29zZU1vZGVSZXNvbHV0aW9uLmZhbGxiYWNrKCk7XG5cbmV4cG9ydCBjb25zdCBlbnVtIEZyZWVWYXJOYW1lc3BhY2Uge1xuICBIZWxwZXIgPSAnSGVscGVyJyxcbiAgTW9kaWZpZXIgPSAnTW9kaWZpZXInLFxuICBDb21wb25lbnQgPSAnQ29tcG9uZW50Jyxcbn1cblxuLyoqXG4gKiBBIGBDb21wb25lbnRPckhlbHBlckFtYmlndWl0eWAgbWlnaHQgYmUgYSBjb21wb25lbnQgb3IgYSBoZWxwZXIsIHdpdGggYW4gb3B0aW9uYWwgZmFsbGJhY2tcbiAqXG4gKiBgYGBoYnNcbiAqIHt7eH19XG4gKiBgYGBcbiAqXG4gKiBeIGB4YCBpcyByZXNvbHZlZCBpbiB0aGUgYGNvbXBvbmVudGAgYW5kIGBoZWxwZXJgIG5hbWVzcGFjZXMsIHdpdGggZmFsbGJhY2tcbiAqXG4gKiBgYGBoYnNcbiAqIHt7eCB5fX1cbiAqIGBgYFxuICpcbiAqIF4gYHhgIGlzIHJlc29sdmVkIGluIHRoZSBgY29tcG9uZW50YCBhbmQgYGhlbHBlcmAgbmFtZXNwYWNlcywgd2l0aG91dCBmYWxsYmFja1xuICovXG50eXBlIENvbXBvbmVudE9ySGVscGVyQW1iaWd1aXR5ID0ge1xuICBuYW1lc3BhY2VzOiBbRnJlZVZhck5hbWVzcGFjZS5Db21wb25lbnQsIEZyZWVWYXJOYW1lc3BhY2UuSGVscGVyXTtcbiAgZmFsbGJhY2s6IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIEEgYEhlbHBlckFtYmlndWl0eWAgbXVzdCBiZSBhIGhlbHBlciwgYnV0IGl0IGhhcyBmYWxsYmFjay4gSWYgaXQgZGlkbid0IGhhdmUgZmFsbGJhY2ssIGl0IHdvdWxkXG4gKiBiZSBhIGBOYW1lc3BhY2VkQW1iaWd1aXR5YC5cbiAqXG4gKiBgYGBoYnNcbiAqIDxhIGhyZWY9e3t4fX0gLz5cbiAqIDxhIGhyZWY9XCJ7e3h9fS5odG1sXCIgLz5cbiAqIGBgYFxuICpcbiAqIF4gYHhgIGlzIHJlc29sdmVkIGluIHRoZSBgaGVscGVyYCBuYW1lc3BhY2Ugd2l0aCBmYWxsYmFja1xuICovXG50eXBlIEhlbHBlckFtYmlndWl0eSA9IHsgbmFtZXNwYWNlczogW0ZyZWVWYXJOYW1lc3BhY2UuSGVscGVyXTsgZmFsbGJhY2s6IGJvb2xlYW4gfTtcblxuLyoqXG4gKiBBIGBOYW1lc3BhY2VkQW1iaWd1aXR5YCBtdXN0IGJlIHJlc29sdmVkIGluIGEgcGFydGljdWxhciBuYW1lc3BhY2UsIHdpdGhvdXQgZmFsbGJhY2suXG4gKlxuICogYGBgaGJzXG4gKiA8WCAvPlxuICogYGBgXG4gKlxuICogXiBgWGAgaXMgcmVzb2x2ZWQgaW4gdGhlIGBjb21wb25lbnRgIG5hbWVzcGFjZSB3aXRob3V0IGZhbGxiYWNrXG4gKlxuICogYGBgaGJzXG4gKiAoeClcbiAqIGBgYFxuICpcbiAqIF4gYHhgIGlzIHJlc29sdmVkIGluIHRoZSBgaGVscGVyYCBuYW1lc3BhY2Ugd2l0aG91dCBmYWxsYmFja1xuICpcbiAqIGBgYGhic1xuICogPGEge3t4fX0gLz5cbiAqIGBgYFxuICpcbiAqIF4gYHhgIGlzIHJlc29sdmVkIGluIHRoZSBgbW9kaWZpZXJgIG5hbWVzcGFjZSB3aXRob3V0IGZhbGxiYWNrXG4gKi9cbnR5cGUgTmFtZXNwYWNlZEFtYmlndWl0eSA9IHtcbiAgbmFtZXNwYWNlczogW0ZyZWVWYXJOYW1lc3BhY2UuQ29tcG9uZW50IHwgRnJlZVZhck5hbWVzcGFjZS5IZWxwZXIgfCBGcmVlVmFyTmFtZXNwYWNlLk1vZGlmaWVyXTtcbiAgZmFsbGJhY2s6IGZhbHNlO1xufTtcblxudHlwZSBGYWxsYmFja0FtYmlndWl0eSA9IHtcbiAgbmFtZXNwYWNlczogW107XG4gIGZhbGxiYWNrOiB0cnVlO1xufTtcblxudHlwZSBBbWJpZ3VpdHkgPVxuICB8IENvbXBvbmVudE9ySGVscGVyQW1iaWd1aXR5XG4gIHwgSGVscGVyQW1iaWd1aXR5XG4gIHwgTmFtZXNwYWNlZEFtYmlndWl0eVxuICB8IEZhbGxiYWNrQW1iaWd1aXR5O1xuXG5leHBvcnQgdHlwZSBGcmVlVmFyUmVzb2x1dGlvbiA9IFN0cmljdFJlc29sdXRpb24gfCBMb29zZU1vZGVSZXNvbHV0aW9uO1xuXG4vLyBTZXJpYWxpemF0aW9uXG5cbmNvbnN0IGVudW0gU2VyaWFsaXplZEFtYmlndWl0eSB7XG4gIC8vIHt7eH19XG4gIEFwcGVuZCA9ICdBcHBlbmQnLFxuICAvLyBocmVmPXt7eH19XG4gIEF0dHIgPSAnQXR0cicsXG4gIC8vIHt7eCB5fX0gKG5vdCBhdHRyKVxuICBJbnZva2UgPSAnSW52b2tlJyxcbn1cblxuZXhwb3J0IHR5cGUgU2VyaWFsaXplZFJlc29sdXRpb24gPVxuICB8ICdTdHJpY3QnXG4gIHwgJ0xvb3NlJ1xuICB8IFsnbnMnLCBGcmVlVmFyTmFtZXNwYWNlXVxuICB8IFsnYW1iaWd1b3VzJywgU2VyaWFsaXplZEFtYmlndWl0eV07XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkUmVzb2x1dGlvbihyZXNvbHV0aW9uOiBTZXJpYWxpemVkUmVzb2x1dGlvbik6IEZyZWVWYXJSZXNvbHV0aW9uIHtcbiAgaWYgKHR5cGVvZiByZXNvbHV0aW9uID09PSAnc3RyaW5nJykge1xuICAgIHN3aXRjaCAocmVzb2x1dGlvbikge1xuICAgICAgY2FzZSAnTG9vc2UnOlxuICAgICAgICByZXR1cm4gTG9vc2VNb2RlUmVzb2x1dGlvbi5mYWxsYmFjaygpO1xuICAgICAgY2FzZSAnU3RyaWN0JzpcbiAgICAgICAgcmV0dXJuIFNUUklDVF9SRVNPTFVUSU9OO1xuICAgIH1cbiAgfVxuXG4gIHN3aXRjaCAocmVzb2x1dGlvblswXSkge1xuICAgIGNhc2UgJ2FtYmlndW91cyc6XG4gICAgICBzd2l0Y2ggKHJlc29sdXRpb25bMV0pIHtcbiAgICAgICAgY2FzZSBTZXJpYWxpemVkQW1iaWd1aXR5LkFwcGVuZDpcbiAgICAgICAgICByZXR1cm4gTG9vc2VNb2RlUmVzb2x1dGlvbi5hcHBlbmQoeyBpbnZva2U6IGZhbHNlIH0pO1xuICAgICAgICBjYXNlIFNlcmlhbGl6ZWRBbWJpZ3VpdHkuQXR0cjpcbiAgICAgICAgICByZXR1cm4gTG9vc2VNb2RlUmVzb2x1dGlvbi5hdHRyKCk7XG4gICAgICAgIGNhc2UgU2VyaWFsaXplZEFtYmlndWl0eS5JbnZva2U6XG4gICAgICAgICAgcmV0dXJuIExvb3NlTW9kZVJlc29sdXRpb24uYXBwZW5kKHsgaW52b2tlOiB0cnVlIH0pO1xuICAgICAgfVxuXG4gICAgY2FzZSAnbnMnOlxuICAgICAgcmV0dXJuIExvb3NlTW9kZVJlc29sdXRpb24ubmFtZXNwYWNlZChyZXNvbHV0aW9uWzFdKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==