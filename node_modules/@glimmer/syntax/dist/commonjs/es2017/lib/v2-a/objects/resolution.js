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
class StrictResolution {
  constructor() {
    this.isAngleBracket = false;
  }

  resolution() {
    return 31
    /* GetStrictFree */
    ;
  }

  serialize() {
    return 'Strict';
  }

}

exports.StrictResolution = StrictResolution;
const STRICT_RESOLUTION = new StrictResolution();
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

class LooseModeResolution {
  constructor(ambiguity, isAngleBracket = false) {
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


  static namespaced(namespace, isAngleBracket = false) {
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


  static fallback() {
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


  static append({
    invoke
  }) {
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


  static trustingAppend({
    invoke
  }) {
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


  static attr() {
    return new LooseModeResolution({
      namespaces: ["Helper"
      /* Helper */
      ],
      fallback: true
    });
  }

  resolution() {
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
  }

  serialize() {
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
  }

}

exports.LooseModeResolution = LooseModeResolution;
const ARGUMENT_RESOLUTION = LooseModeResolution.fallback();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9vYmplY3RzL3Jlc29sdXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7QUFVQTs7Ozs7O0FBTU0sTUFBQSxnQkFBQSxDQUF1QjtBQUE3QixFQUFBLFdBQUEsR0FBQTtBQVNXLFNBQUEsY0FBQSxHQUFBLEtBQUE7QUFDVjs7QUFUQyxFQUFBLFVBQVUsR0FBQTtBQUNSLFdBQUE7QUFBQTtBQUFBO0FBQ0Q7O0FBRUQsRUFBQSxTQUFTLEdBQUE7QUFDUCxXQUFBLFFBQUE7QUFDRDs7QUFQMEI7OztBQVl0QixNQUFNLGlCQUFpQixHQUFHLElBQTFCLGdCQUEwQixFQUExQjtBQUVQOzs7Ozs7Ozs7Ozs7QUFTTSxNQUFBLG1CQUFBLENBQTBCO0FBd0c5QixFQUFBLFdBQUEsQ0FBQSxTQUFBLEVBQW9ELGNBQUEsR0FBcEQsS0FBQSxFQUEwRTtBQUFyRCxTQUFBLFNBQUEsR0FBQSxTQUFBO0FBQStCLFNBQUEsY0FBQSxHQUFBLGNBQUE7QUFBMEI7QUF2RzlFOzs7Ozs7Ozs7Ozs7QUFVQSxTQUFBLFVBQUEsQ0FBQSxTQUFBLEVBQStDLGNBQWMsR0FBN0QsS0FBQSxFQUFxRTtBQUNuRSxXQUFPLElBQUEsbUJBQUEsQ0FDTDtBQUNFLE1BQUEsVUFBVSxFQUFFLENBRGQsU0FDYyxDQURkO0FBRUUsTUFBQSxRQUFRLEVBQUU7QUFGWixLQURLLEVBQVAsY0FBTyxDQUFQO0FBT0Q7QUFFRDs7Ozs7Ozs7Ozs7O0FBVUEsU0FBQSxRQUFBLEdBQWU7QUFDYixXQUFPLElBQUEsbUJBQUEsQ0FBd0I7QUFBRSxNQUFBLFVBQVUsRUFBWixFQUFBO0FBQWtCLE1BQUEsUUFBUSxFQUFFO0FBQTVCLEtBQXhCLENBQVA7QUFDRDtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkEsU0FBQSxNQUFBLENBQWM7QUFBRSxJQUFBO0FBQUYsR0FBZCxFQUE2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QUFDRSxjQUFRLFVBQVUsQ0FBbEIsQ0FBa0IsQ0FBbEI7QUFDRSxhQUFBO0FBQUE7QUFBQTtBQUNFLGlCQUFPLG1CQUFtQixDQUFuQixNQUFBLENBQTJCO0FBQUUsWUFBQSxNQUFNLEVBQUU7QUFBVixXQUEzQixDQUFQOztBQUNGLGFBQUE7QUFBQTtBQUFBO0FBQ0UsaUJBQU8sbUJBQW1CLENBQTFCLElBQU8sRUFBUDs7QUFDRixhQUFBO0FBQUE7QUFBQTtBQUNFLGlCQUFPLG1CQUFtQixDQUFuQixNQUFBLENBQTJCO0FBQUUsWUFBQSxNQUFNLEVBQUU7QUFBVixXQUEzQixDQUFQO0FBTko7O0FBU0YsU0FBQSxJQUFBO0FBQ0UsYUFBTyxtQkFBbUIsQ0FBbkIsVUFBQSxDQUErQixVQUFVLENBQWhELENBQWdELENBQXpDLENBQVA7QUFaSjtBQWNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBIGZyZWUgdmFyaWFibGUgaXMgcmVzb2x2ZWQgYWNjb3JkaW5nIHRvIGEgcmVzb2x1dGlvbiBydWxlOlxuICpcbiAqIDEuIFN0cmljdCByZXNvbHV0aW9uXG4gKiAyLiBOYW1lc3BhY2VkIHJlc29sdXRpb25cbiAqIDMuIEZhbGxiYWNrIHJlc29sdXRpb25cbiAqL1xuXG5pbXBvcnQgeyBHZXRDb250ZXh0dWFsRnJlZU9wLCBTZXhwT3Bjb2RlcyB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG4vKipcbiAqIFN0cmljdCByZXNvbHV0aW9uIGlzIHVzZWQ6XG4gKlxuICogMS4gaW4gYSBzdHJpY3QgbW9kZSB0ZW1wbGF0ZVxuICogMi4gaW4gYW4gdW5hbWJpZ3VvdXMgaW52b2NhdGlvbiB3aXRoIGRvdCBwYXRoc1xuICovXG5leHBvcnQgY2xhc3MgU3RyaWN0UmVzb2x1dGlvbiB7XG4gIHJlc29sdXRpb24oKTogR2V0Q29udGV4dHVhbEZyZWVPcCB7XG4gICAgcmV0dXJuIFNleHBPcGNvZGVzLkdldFN0cmljdEZyZWU7XG4gIH1cblxuICBzZXJpYWxpemUoKTogU2VyaWFsaXplZFJlc29sdXRpb24ge1xuICAgIHJldHVybiAnU3RyaWN0JztcbiAgfVxuXG4gIHJlYWRvbmx5IGlzQW5nbGVCcmFja2V0ID0gZmFsc2U7XG59XG5cbmV4cG9ydCBjb25zdCBTVFJJQ1RfUkVTT0xVVElPTiA9IG5ldyBTdHJpY3RSZXNvbHV0aW9uKCk7XG5cbi8qKlxuICogQSBgTG9vc2VNb2RlUmVzb2x1dGlvbmAgaW5jbHVkZXM6XG4gKlxuICogLSAwIG9yIG1vcmUgbmFtZXNwYWNlcyB0byByZXNvbHZlIHRoZSB2YXJpYWJsZSBpblxuICogLSBvcHRpb25hbCBmYWxsYmFjayBiZWhhdmlvclxuICpcbiAqIEluIHByYWN0aWNlLCB0aGVyZSBhcmUgYSBsaW1pdGVkIG51bWJlciBvZiBwb3NzaWJsZSBjb21iaW5hdGlvbnMgb2YgdGhlc2UgZGVncmVlcyBvZiBmcmVlZG9tLFxuICogYW5kIHRoZXkgYXJlIGNhcHR1cmVkIGJ5IHRoZSBgQW1iaWd1aXR5YCB1bmlvbiBiZWxvdy5cbiAqL1xuZXhwb3J0IGNsYXNzIExvb3NlTW9kZVJlc29sdXRpb24ge1xuICAvKipcbiAgICogTmFtZXNwYWNlZCByZXNvbHV0aW9uIGlzIHVzZWQgaW4gYW4gdW5hbWJpZ3VvdXMgc3ludGF4IHBvc2l0aW9uOlxuICAgKlxuICAgKiAxLiBgKHNleHApYCAobmFtZXNwYWNlOiBgSGVscGVyYClcbiAgICogMi4gYHt7I2Jsb2NrfX1gIChuYW1lc3BhY2U6IGBDb21wb25lbnRgKVxuICAgKiAzLiBgPGEge3ttb2RpZmllcn19PmAgKG5hbWVzcGFjZTogYE1vZGlmaWVyYClcbiAgICogNC4gYDxDb21wb25lbnQgLz5gIChuYW1lc3BhY2U6IGBDb21wb25lbnRgKVxuICAgKlxuICAgKiBAc2VlIHtOYW1lc3BhY2VkQW1iaWd1aXR5fVxuICAgKi9cbiAgc3RhdGljIG5hbWVzcGFjZWQobmFtZXNwYWNlOiBGcmVlVmFyTmFtZXNwYWNlLCBpc0FuZ2xlQnJhY2tldCA9IGZhbHNlKTogTG9vc2VNb2RlUmVzb2x1dGlvbiB7XG4gICAgcmV0dXJuIG5ldyBMb29zZU1vZGVSZXNvbHV0aW9uKFxuICAgICAge1xuICAgICAgICBuYW1lc3BhY2VzOiBbbmFtZXNwYWNlXSxcbiAgICAgICAgZmFsbGJhY2s6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIGlzQW5nbGVCcmFja2V0XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGYWxsYmFjayByZXNvbHV0aW9uIGlzIHVzZWQgd2hlbiBubyBuYW1lc3BhY2VkIHJlc29sdXRpb25zIGFyZSBwb3NzaWJsZSwgYnV0IGZhbGxiYWNrXG4gICAqIHJlc29sdXRpb24gaXMgc3RpbGwgYWxsb3dlZC5cbiAgICpcbiAgICogYGBgaGJzXG4gICAqIHt7eC55fX1cbiAgICogYGBgXG4gICAqXG4gICAqIEBzZWUge0ZhbGxiYWNrQW1iaWd1aXR5fVxuICAgKi9cbiAgc3RhdGljIGZhbGxiYWNrKCk6IExvb3NlTW9kZVJlc29sdXRpb24ge1xuICAgIHJldHVybiBuZXcgTG9vc2VNb2RlUmVzb2x1dGlvbih7IG5hbWVzcGFjZXM6IFtdLCBmYWxsYmFjazogdHJ1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmQgcmVzb2x1dGlvbiBpcyB1c2VkIHdoZW4gdGhlIHZhcmlhYmxlIHNob3VsZCBiZSByZXNvbHZlZCBpbiBib3RoIHRoZSBgY29tcG9uZW50YCBhbmRcbiAgICogYGhlbHBlcmAgbmFtZXNwYWNlcy4gRmFsbGJhY2sgcmVzb2x1dGlvbiBpcyBvcHRpb25hbC5cbiAgICpcbiAgICogYGBgaGJzXG4gICAqIHt7eH19XG4gICAqIGBgYFxuICAgKlxuICAgKiBeIGB4YCBzaG91bGQgYmUgcmVzb2x2ZWQgaW4gdGhlIGBjb21wb25lbnRgIGFuZCBgaGVscGVyYCBuYW1lc3BhY2VzIHdpdGggZmFsbGJhY2sgcmVzb2x1dGlvbi5cbiAgICpcbiAgICogYGBgaGJzXG4gICAqIHt7eCB5fX1cbiAgICogYGBgXG4gICAqXG4gICAqIF4gYHhgIHNob3VsZCBiZSByZXNvbHZlZCBpbiB0aGUgYGNvbXBvbmVudGAgYW5kIGBoZWxwZXJgIG5hbWVzcGFjZXMgd2l0aG91dCBmYWxsYmFja1xuICAgKiByZXNvbHV0aW9uLlxuICAgKlxuICAgKiBAc2VlIHtDb21wb25lbnRPckhlbHBlckFtYmlndWl0eX1cbiAgICovXG4gIHN0YXRpYyBhcHBlbmQoeyBpbnZva2UgfTogeyBpbnZva2U6IGJvb2xlYW4gfSk6IExvb3NlTW9kZVJlc29sdXRpb24ge1xuICAgIHJldHVybiBuZXcgTG9vc2VNb2RlUmVzb2x1dGlvbih7XG4gICAgICBuYW1lc3BhY2VzOiBbRnJlZVZhck5hbWVzcGFjZS5Db21wb25lbnQsIEZyZWVWYXJOYW1lc3BhY2UuSGVscGVyXSxcbiAgICAgIGZhbGxiYWNrOiAhaW52b2tlLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRydXN0aW5nIGFwcGVuZCByZXNvbHV0aW9uIGlzIHVzZWQgd2hlbiB0aGUgdmFyaWFibGUgc2hvdWxkIGJlIHJlc29sdmVkIGluIGJvdGggdGhlIGBjb21wb25lbnRgIGFuZFxuICAgKiBgaGVscGVyYCBuYW1lc3BhY2VzLiBGYWxsYmFjayByZXNvbHV0aW9uIGlzIG9wdGlvbmFsLlxuICAgKlxuICAgKiBgYGBoYnNcbiAgICoge3t7eH19fVxuICAgKiBgYGBcbiAgICpcbiAgICogXiBgeGAgc2hvdWxkIGJlIHJlc29sdmVkIGluIHRoZSBgY29tcG9uZW50YCBhbmQgYGhlbHBlcmAgbmFtZXNwYWNlcyB3aXRoIGZhbGxiYWNrIHJlc29sdXRpb24uXG4gICAqXG4gICAqIGBgYGhic1xuICAgKiB7e3t4IHl9fX1cbiAgICogYGBgXG4gICAqXG4gICAqIF4gYHhgIHNob3VsZCBiZSByZXNvbHZlZCBpbiB0aGUgYGNvbXBvbmVudGAgYW5kIGBoZWxwZXJgIG5hbWVzcGFjZXMgd2l0aG91dCBmYWxsYmFja1xuICAgKiByZXNvbHV0aW9uLlxuICAgKlxuICAgKiBAc2VlIHtIZWxwZXJBbWJpZ3VpdHl9XG4gICAqL1xuICBzdGF0aWMgdHJ1c3RpbmdBcHBlbmQoeyBpbnZva2UgfTogeyBpbnZva2U6IGJvb2xlYW4gfSk6IExvb3NlTW9kZVJlc29sdXRpb24ge1xuICAgIHJldHVybiBuZXcgTG9vc2VNb2RlUmVzb2x1dGlvbih7XG4gICAgICBuYW1lc3BhY2VzOiBbRnJlZVZhck5hbWVzcGFjZS5IZWxwZXJdLFxuICAgICAgZmFsbGJhY2s6ICFpbnZva2UsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQXR0cmlidXRlIHJlc29sdXRpb24gaXMgdXNlZCB3aGVuIHRoZSB2YXJpYWJsZSBzaG91bGQgYmUgcmVzb2x2ZWQgYXMgYSBgaGVscGVyYCB3aXRoIGZhbGxiYWNrXG4gICAqIHJlc29sdXRpb24uXG4gICAqXG4gICAqIGBgYGhic1xuICAgKiA8YSBocmVmPXt7eH19IC8+XG4gICAqIDxhIGhyZWY9XCJ7e3h9fS5odG1sXCIgLz5cbiAgICogYGBgXG4gICAqXG4gICAqIF4gcmVzb2x2ZWQgaW4gdGhlIGBoZWxwZXJgIG5hbWVzcGFjZSB3aXRoIGZhbGxiYWNrXG4gICAqXG4gICAqIEBzZWUge0hlbHBlckFtYmlndWl0eX1cbiAgICovXG4gIHN0YXRpYyBhdHRyKCk6IExvb3NlTW9kZVJlc29sdXRpb24ge1xuICAgIHJldHVybiBuZXcgTG9vc2VNb2RlUmVzb2x1dGlvbih7IG5hbWVzcGFjZXM6IFtGcmVlVmFyTmFtZXNwYWNlLkhlbHBlcl0sIGZhbGxiYWNrOiB0cnVlIH0pO1xuICB9XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgYW1iaWd1aXR5OiBBbWJpZ3VpdHksIHJlYWRvbmx5IGlzQW5nbGVCcmFja2V0ID0gZmFsc2UpIHt9XG5cbiAgcmVzb2x1dGlvbigpOiBHZXRDb250ZXh0dWFsRnJlZU9wIHtcbiAgICBpZiAodGhpcy5hbWJpZ3VpdHkubmFtZXNwYWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBTZXhwT3Bjb2Rlcy5HZXRTdHJpY3RGcmVlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5hbWJpZ3VpdHkubmFtZXNwYWNlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGlmICh0aGlzLmFtYmlndWl0eS5mYWxsYmFjaykge1xuICAgICAgICAvLyBzaW1wbGUgbmFtZXNwYWNlZCByZXNvbHV0aW9uIHdpdGggZmFsbGJhY2sgbXVzdCBiZSBhdHRyPXt7eH19XG4gICAgICAgIHJldHVybiBTZXhwT3Bjb2Rlcy5HZXRGcmVlQXNIZWxwZXJIZWFkT3JUaGlzRmFsbGJhY2s7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBzaW1wbGUgbmFtZXNwYWNlZCByZXNvbHV0aW9uIHdpdGhvdXQgZmFsbGJhY2tcbiAgICAgICAgc3dpdGNoICh0aGlzLmFtYmlndWl0eS5uYW1lc3BhY2VzWzBdKSB7XG4gICAgICAgICAgY2FzZSBGcmVlVmFyTmFtZXNwYWNlLkhlbHBlcjpcbiAgICAgICAgICAgIHJldHVybiBTZXhwT3Bjb2Rlcy5HZXRGcmVlQXNIZWxwZXJIZWFkO1xuICAgICAgICAgIGNhc2UgRnJlZVZhck5hbWVzcGFjZS5Nb2RpZmllcjpcbiAgICAgICAgICAgIHJldHVybiBTZXhwT3Bjb2Rlcy5HZXRGcmVlQXNNb2RpZmllckhlYWQ7XG4gICAgICAgICAgY2FzZSBGcmVlVmFyTmFtZXNwYWNlLkNvbXBvbmVudDpcbiAgICAgICAgICAgIHJldHVybiBTZXhwT3Bjb2Rlcy5HZXRGcmVlQXNDb21wb25lbnRIZWFkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLmFtYmlndWl0eS5mYWxsYmFjaykge1xuICAgICAgLy8gY29tcG9uZW50IG9yIGhlbHBlciArIGZhbGxiYWNrICh7e3NvbWV0aGluZ319KVxuICAgICAgcmV0dXJuIFNleHBPcGNvZGVzLkdldEZyZWVBc0NvbXBvbmVudE9ySGVscGVySGVhZE9yVGhpc0ZhbGxiYWNrO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjb21wb25lbnQgb3IgaGVscGVyIHdpdGhvdXQgZmFsbGJhY2sgKHt7c29tZXRoaW5nIHNvbWV0aGluZ319KVxuICAgICAgcmV0dXJuIFNleHBPcGNvZGVzLkdldEZyZWVBc0NvbXBvbmVudE9ySGVscGVySGVhZDtcbiAgICB9XG4gIH1cblxuICBzZXJpYWxpemUoKTogU2VyaWFsaXplZFJlc29sdXRpb24ge1xuICAgIGlmICh0aGlzLmFtYmlndWl0eS5uYW1lc3BhY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuICdMb29zZSc7XG4gICAgfSBlbHNlIGlmICh0aGlzLmFtYmlndWl0eS5uYW1lc3BhY2VzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgaWYgKHRoaXMuYW1iaWd1aXR5LmZhbGxiYWNrKSB7XG4gICAgICAgIC8vIHNpbXBsZSBuYW1lc3BhY2VkIHJlc29sdXRpb24gd2l0aCBmYWxsYmFjayBtdXN0IGJlIGF0dHI9e3t4fX1cbiAgICAgICAgcmV0dXJuIFsnYW1iaWd1b3VzJywgU2VyaWFsaXplZEFtYmlndWl0eS5BdHRyXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbJ25zJywgdGhpcy5hbWJpZ3VpdHkubmFtZXNwYWNlc1swXV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLmFtYmlndWl0eS5mYWxsYmFjaykge1xuICAgICAgLy8gY29tcG9uZW50IG9yIGhlbHBlciArIGZhbGxiYWNrICh7e3NvbWV0aGluZ319KVxuICAgICAgcmV0dXJuIFsnYW1iaWd1b3VzJywgU2VyaWFsaXplZEFtYmlndWl0eS5BcHBlbmRdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjb21wb25lbnQgb3IgaGVscGVyIHdpdGhvdXQgZmFsbGJhY2sgKHt7c29tZXRoaW5nIHNvbWV0aGluZ319KVxuICAgICAgcmV0dXJuIFsnYW1iaWd1b3VzJywgU2VyaWFsaXplZEFtYmlndWl0eS5JbnZva2VdO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQVJHVU1FTlRfUkVTT0xVVElPTiA9IExvb3NlTW9kZVJlc29sdXRpb24uZmFsbGJhY2soKTtcblxuZXhwb3J0IGNvbnN0IGVudW0gRnJlZVZhck5hbWVzcGFjZSB7XG4gIEhlbHBlciA9ICdIZWxwZXInLFxuICBNb2RpZmllciA9ICdNb2RpZmllcicsXG4gIENvbXBvbmVudCA9ICdDb21wb25lbnQnLFxufVxuXG4vKipcbiAqIEEgYENvbXBvbmVudE9ySGVscGVyQW1iaWd1aXR5YCBtaWdodCBiZSBhIGNvbXBvbmVudCBvciBhIGhlbHBlciwgd2l0aCBhbiBvcHRpb25hbCBmYWxsYmFja1xuICpcbiAqIGBgYGhic1xuICoge3t4fX1cbiAqIGBgYFxuICpcbiAqIF4gYHhgIGlzIHJlc29sdmVkIGluIHRoZSBgY29tcG9uZW50YCBhbmQgYGhlbHBlcmAgbmFtZXNwYWNlcywgd2l0aCBmYWxsYmFja1xuICpcbiAqIGBgYGhic1xuICoge3t4IHl9fVxuICogYGBgXG4gKlxuICogXiBgeGAgaXMgcmVzb2x2ZWQgaW4gdGhlIGBjb21wb25lbnRgIGFuZCBgaGVscGVyYCBuYW1lc3BhY2VzLCB3aXRob3V0IGZhbGxiYWNrXG4gKi9cbnR5cGUgQ29tcG9uZW50T3JIZWxwZXJBbWJpZ3VpdHkgPSB7XG4gIG5hbWVzcGFjZXM6IFtGcmVlVmFyTmFtZXNwYWNlLkNvbXBvbmVudCwgRnJlZVZhck5hbWVzcGFjZS5IZWxwZXJdO1xuICBmYWxsYmFjazogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogQSBgSGVscGVyQW1iaWd1aXR5YCBtdXN0IGJlIGEgaGVscGVyLCBidXQgaXQgaGFzIGZhbGxiYWNrLiBJZiBpdCBkaWRuJ3QgaGF2ZSBmYWxsYmFjaywgaXQgd291bGRcbiAqIGJlIGEgYE5hbWVzcGFjZWRBbWJpZ3VpdHlgLlxuICpcbiAqIGBgYGhic1xuICogPGEgaHJlZj17e3h9fSAvPlxuICogPGEgaHJlZj1cInt7eH19Lmh0bWxcIiAvPlxuICogYGBgXG4gKlxuICogXiBgeGAgaXMgcmVzb2x2ZWQgaW4gdGhlIGBoZWxwZXJgIG5hbWVzcGFjZSB3aXRoIGZhbGxiYWNrXG4gKi9cbnR5cGUgSGVscGVyQW1iaWd1aXR5ID0geyBuYW1lc3BhY2VzOiBbRnJlZVZhck5hbWVzcGFjZS5IZWxwZXJdOyBmYWxsYmFjazogYm9vbGVhbiB9O1xuXG4vKipcbiAqIEEgYE5hbWVzcGFjZWRBbWJpZ3VpdHlgIG11c3QgYmUgcmVzb2x2ZWQgaW4gYSBwYXJ0aWN1bGFyIG5hbWVzcGFjZSwgd2l0aG91dCBmYWxsYmFjay5cbiAqXG4gKiBgYGBoYnNcbiAqIDxYIC8+XG4gKiBgYGBcbiAqXG4gKiBeIGBYYCBpcyByZXNvbHZlZCBpbiB0aGUgYGNvbXBvbmVudGAgbmFtZXNwYWNlIHdpdGhvdXQgZmFsbGJhY2tcbiAqXG4gKiBgYGBoYnNcbiAqICh4KVxuICogYGBgXG4gKlxuICogXiBgeGAgaXMgcmVzb2x2ZWQgaW4gdGhlIGBoZWxwZXJgIG5hbWVzcGFjZSB3aXRob3V0IGZhbGxiYWNrXG4gKlxuICogYGBgaGJzXG4gKiA8YSB7e3h9fSAvPlxuICogYGBgXG4gKlxuICogXiBgeGAgaXMgcmVzb2x2ZWQgaW4gdGhlIGBtb2RpZmllcmAgbmFtZXNwYWNlIHdpdGhvdXQgZmFsbGJhY2tcbiAqL1xudHlwZSBOYW1lc3BhY2VkQW1iaWd1aXR5ID0ge1xuICBuYW1lc3BhY2VzOiBbRnJlZVZhck5hbWVzcGFjZS5Db21wb25lbnQgfCBGcmVlVmFyTmFtZXNwYWNlLkhlbHBlciB8IEZyZWVWYXJOYW1lc3BhY2UuTW9kaWZpZXJdO1xuICBmYWxsYmFjazogZmFsc2U7XG59O1xuXG50eXBlIEZhbGxiYWNrQW1iaWd1aXR5ID0ge1xuICBuYW1lc3BhY2VzOiBbXTtcbiAgZmFsbGJhY2s6IHRydWU7XG59O1xuXG50eXBlIEFtYmlndWl0eSA9XG4gIHwgQ29tcG9uZW50T3JIZWxwZXJBbWJpZ3VpdHlcbiAgfCBIZWxwZXJBbWJpZ3VpdHlcbiAgfCBOYW1lc3BhY2VkQW1iaWd1aXR5XG4gIHwgRmFsbGJhY2tBbWJpZ3VpdHk7XG5cbmV4cG9ydCB0eXBlIEZyZWVWYXJSZXNvbHV0aW9uID0gU3RyaWN0UmVzb2x1dGlvbiB8IExvb3NlTW9kZVJlc29sdXRpb247XG5cbi8vIFNlcmlhbGl6YXRpb25cblxuY29uc3QgZW51bSBTZXJpYWxpemVkQW1iaWd1aXR5IHtcbiAgLy8ge3t4fX1cbiAgQXBwZW5kID0gJ0FwcGVuZCcsXG4gIC8vIGhyZWY9e3t4fX1cbiAgQXR0ciA9ICdBdHRyJyxcbiAgLy8ge3t4IHl9fSAobm90IGF0dHIpXG4gIEludm9rZSA9ICdJbnZva2UnLFxufVxuXG5leHBvcnQgdHlwZSBTZXJpYWxpemVkUmVzb2x1dGlvbiA9XG4gIHwgJ1N0cmljdCdcbiAgfCAnTG9vc2UnXG4gIHwgWyducycsIEZyZWVWYXJOYW1lc3BhY2VdXG4gIHwgWydhbWJpZ3VvdXMnLCBTZXJpYWxpemVkQW1iaWd1aXR5XTtcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRSZXNvbHV0aW9uKHJlc29sdXRpb246IFNlcmlhbGl6ZWRSZXNvbHV0aW9uKTogRnJlZVZhclJlc29sdXRpb24ge1xuICBpZiAodHlwZW9mIHJlc29sdXRpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgc3dpdGNoIChyZXNvbHV0aW9uKSB7XG4gICAgICBjYXNlICdMb29zZSc6XG4gICAgICAgIHJldHVybiBMb29zZU1vZGVSZXNvbHV0aW9uLmZhbGxiYWNrKCk7XG4gICAgICBjYXNlICdTdHJpY3QnOlxuICAgICAgICByZXR1cm4gU1RSSUNUX1JFU09MVVRJT047XG4gICAgfVxuICB9XG5cbiAgc3dpdGNoIChyZXNvbHV0aW9uWzBdKSB7XG4gICAgY2FzZSAnYW1iaWd1b3VzJzpcbiAgICAgIHN3aXRjaCAocmVzb2x1dGlvblsxXSkge1xuICAgICAgICBjYXNlIFNlcmlhbGl6ZWRBbWJpZ3VpdHkuQXBwZW5kOlxuICAgICAgICAgIHJldHVybiBMb29zZU1vZGVSZXNvbHV0aW9uLmFwcGVuZCh7IGludm9rZTogZmFsc2UgfSk7XG4gICAgICAgIGNhc2UgU2VyaWFsaXplZEFtYmlndWl0eS5BdHRyOlxuICAgICAgICAgIHJldHVybiBMb29zZU1vZGVSZXNvbHV0aW9uLmF0dHIoKTtcbiAgICAgICAgY2FzZSBTZXJpYWxpemVkQW1iaWd1aXR5Lkludm9rZTpcbiAgICAgICAgICByZXR1cm4gTG9vc2VNb2RlUmVzb2x1dGlvbi5hcHBlbmQoeyBpbnZva2U6IHRydWUgfSk7XG4gICAgICB9XG5cbiAgICBjYXNlICducyc6XG4gICAgICByZXR1cm4gTG9vc2VNb2RlUmVzb2x1dGlvbi5uYW1lc3BhY2VkKHJlc29sdXRpb25bMV0pO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9