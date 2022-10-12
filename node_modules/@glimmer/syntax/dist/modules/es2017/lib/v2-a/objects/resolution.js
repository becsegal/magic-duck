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
export class StrictResolution {
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
export const STRICT_RESOLUTION = new StrictResolution();
/**
 * A `LooseModeResolution` includes:
 *
 * - 0 or more namespaces to resolve the variable in
 * - optional fallback behavior
 *
 * In practice, there are a limited number of possible combinations of these degrees of freedom,
 * and they are captured by the `Ambiguity` union below.
 */

export class LooseModeResolution {
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
export const ARGUMENT_RESOLUTION = LooseModeResolution.fallback();
export function loadResolution(resolution) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9vYmplY3RzL3Jlc29sdXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O0FBVUE7Ozs7OztBQU1BLE9BQU0sTUFBTyxnQkFBUCxDQUF1QjtBQUE3QixFQUFBLFdBQUEsR0FBQTtBQVNXLFNBQUEsY0FBQSxHQUFpQixLQUFqQjtBQUNWOztBQVRDLEVBQUEsVUFBVSxHQUFBO0FBQ1IsV0FBQTtBQUFBO0FBQUE7QUFDRDs7QUFFRCxFQUFBLFNBQVMsR0FBQTtBQUNQLFdBQU8sUUFBUDtBQUNEOztBQVAwQjtBQVk3QixPQUFPLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxnQkFBSixFQUExQjtBQUVQOzs7Ozs7Ozs7O0FBU0EsT0FBTSxNQUFPLG1CQUFQLENBQTBCO0FBd0c5QixFQUFBLFdBQUEsQ0FBcUIsU0FBckIsRUFBb0QsY0FBQSxHQUFpQixLQUFyRSxFQUEwRTtBQUFyRCxTQUFBLFNBQUEsR0FBQSxTQUFBO0FBQStCLFNBQUEsY0FBQSxHQUFBLGNBQUE7QUFBMEI7QUF2RzlFOzs7Ozs7Ozs7Ozs7QUFVQSxTQUFPLFVBQVAsQ0FBa0IsU0FBbEIsRUFBK0MsY0FBYyxHQUFHLEtBQWhFLEVBQXFFO0FBQ25FLFdBQU8sSUFBSSxtQkFBSixDQUNMO0FBQ0UsTUFBQSxVQUFVLEVBQUUsQ0FBQyxTQUFELENBRGQ7QUFFRSxNQUFBLFFBQVEsRUFBRTtBQUZaLEtBREssRUFLTCxjQUxLLENBQVA7QUFPRDtBQUVEOzs7Ozs7Ozs7Ozs7QUFVQSxTQUFPLFFBQVAsR0FBZTtBQUNiLFdBQU8sSUFBSSxtQkFBSixDQUF3QjtBQUFFLE1BQUEsVUFBVSxFQUFFLEVBQWQ7QUFBa0IsTUFBQSxRQUFRLEVBQUU7QUFBNUIsS0FBeEIsQ0FBUDtBQUNEO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQSxTQUFPLE1BQVAsQ0FBYztBQUFFLElBQUE7QUFBRixHQUFkLEVBQTZDO0FBQzNDLFdBQU8sSUFBSSxtQkFBSixDQUF3QjtBQUM3QixNQUFBLFVBQVUsRUFBRSxDQUFBO0FBQUE7QUFBQSxRQUFBO0FBQUE7QUFBQSxPQURpQjtBQUU3QixNQUFBLFFBQVEsRUFBRSxDQUFDO0FBRmtCLEtBQXhCLENBQVA7QUFJRDtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkEsU0FBTyxjQUFQLENBQXNCO0FBQUUsSUFBQTtBQUFGLEdBQXRCLEVBQXFEO0FBQ25ELFdBQU8sSUFBSSxtQkFBSixDQUF3QjtBQUM3QixNQUFBLFVBQVUsRUFBRSxDQUFBO0FBQUE7QUFBQSxPQURpQjtBQUU3QixNQUFBLFFBQVEsRUFBRSxDQUFDO0FBRmtCLEtBQXhCLENBQVA7QUFJRDtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7QUFhQSxTQUFPLElBQVAsR0FBVztBQUNULFdBQU8sSUFBSSxtQkFBSixDQUF3QjtBQUFFLE1BQUEsVUFBVSxFQUFFLENBQUE7QUFBQTtBQUFBLE9BQWQ7QUFBeUMsTUFBQSxRQUFRLEVBQUU7QUFBbkQsS0FBeEIsQ0FBUDtBQUNEOztBQUlELEVBQUEsVUFBVSxHQUFBO0FBQ1IsUUFBSSxLQUFLLFNBQUwsQ0FBZSxVQUFmLENBQTBCLE1BQTFCLEtBQXFDLENBQXpDLEVBQTRDO0FBQzFDLGFBQUE7QUFBQTtBQUFBO0FBQ0QsS0FGRCxNQUVPLElBQUksS0FBSyxTQUFMLENBQWUsVUFBZixDQUEwQixNQUExQixLQUFxQyxDQUF6QyxFQUE0QztBQUNqRCxVQUFJLEtBQUssU0FBTCxDQUFlLFFBQW5CLEVBQTZCO0FBQzNCO0FBQ0EsZUFBQTtBQUFBO0FBQUE7QUFDRCxPQUhELE1BR087QUFDTDtBQUNBLGdCQUFRLEtBQUssU0FBTCxDQUFlLFVBQWYsQ0FBMEIsQ0FBMUIsQ0FBUjtBQUNFLGVBQUE7QUFBQTtBQUFBO0FBQ0UsbUJBQUE7QUFBQTtBQUFBOztBQUNGLGVBQUE7QUFBQTtBQUFBO0FBQ0UsbUJBQUE7QUFBQTtBQUFBOztBQUNGLGVBQUE7QUFBQTtBQUFBO0FBQ0UsbUJBQUE7QUFBQTtBQUFBO0FBTko7QUFRRDtBQUNGLEtBZk0sTUFlQSxJQUFJLEtBQUssU0FBTCxDQUFlLFFBQW5CLEVBQTZCO0FBQ2xDO0FBQ0EsYUFBQTtBQUFBO0FBQUE7QUFDRCxLQUhNLE1BR0E7QUFDTDtBQUNBLGVBQUE7QUFBQTtBQUFBO0FBQ0Q7QUFDRjs7QUFFRCxFQUFBLFNBQVMsR0FBQTtBQUNQLFFBQUksS0FBSyxTQUFMLENBQWUsVUFBZixDQUEwQixNQUExQixLQUFxQyxDQUF6QyxFQUE0QztBQUMxQyxhQUFPLE9BQVA7QUFDRCxLQUZELE1BRU8sSUFBSSxLQUFLLFNBQUwsQ0FBZSxVQUFmLENBQTBCLE1BQTFCLEtBQXFDLENBQXpDLEVBQTRDO0FBQ2pELFVBQUksS0FBSyxTQUFMLENBQWUsUUFBbkIsRUFBNkI7QUFDM0I7QUFDQSxlQUFPLENBQUMsV0FBRCxFQUFZO0FBQUE7QUFBWixTQUFQO0FBQ0QsT0FIRCxNQUdPO0FBQ0wsZUFBTyxDQUFDLElBQUQsRUFBTyxLQUFLLFNBQUwsQ0FBZSxVQUFmLENBQTBCLENBQTFCLENBQVAsQ0FBUDtBQUNEO0FBQ0YsS0FQTSxNQU9BLElBQUksS0FBSyxTQUFMLENBQWUsUUFBbkIsRUFBNkI7QUFDbEM7QUFDQSxhQUFPLENBQUMsV0FBRCxFQUFZO0FBQUE7QUFBWixPQUFQO0FBQ0QsS0FITSxNQUdBO0FBQ0w7QUFDQSxhQUFPLENBQUMsV0FBRCxFQUFZO0FBQUE7QUFBWixPQUFQO0FBQ0Q7QUFDRjs7QUF0SjZCO0FBeUpoQyxPQUFPLE1BQU0sbUJBQW1CLEdBQUcsbUJBQW1CLENBQUMsUUFBcEIsRUFBNUI7QUFpR1AsT0FBTSxTQUFVLGNBQVYsQ0FBeUIsVUFBekIsRUFBeUQ7QUFDN0QsTUFBSSxPQUFPLFVBQVAsS0FBc0IsUUFBMUIsRUFBb0M7QUFDbEMsWUFBUSxVQUFSO0FBQ0UsV0FBSyxPQUFMO0FBQ0UsZUFBTyxtQkFBbUIsQ0FBQyxRQUFwQixFQUFQOztBQUNGLFdBQUssUUFBTDtBQUNFLGVBQU8saUJBQVA7QUFKSjtBQU1EOztBQUVELFVBQVEsVUFBVSxDQUFDLENBQUQsQ0FBbEI7QUFDRSxTQUFLLFdBQUw7QUFDRSxjQUFRLFVBQVUsQ0FBQyxDQUFELENBQWxCO0FBQ0UsYUFBQTtBQUFBO0FBQUE7QUFDRSxpQkFBTyxtQkFBbUIsQ0FBQyxNQUFwQixDQUEyQjtBQUFFLFlBQUEsTUFBTSxFQUFFO0FBQVYsV0FBM0IsQ0FBUDs7QUFDRixhQUFBO0FBQUE7QUFBQTtBQUNFLGlCQUFPLG1CQUFtQixDQUFDLElBQXBCLEVBQVA7O0FBQ0YsYUFBQTtBQUFBO0FBQUE7QUFDRSxpQkFBTyxtQkFBbUIsQ0FBQyxNQUFwQixDQUEyQjtBQUFFLFlBQUEsTUFBTSxFQUFFO0FBQVYsV0FBM0IsQ0FBUDtBQU5KOztBQVNGLFNBQUssSUFBTDtBQUNFLGFBQU8sbUJBQW1CLENBQUMsVUFBcEIsQ0FBK0IsVUFBVSxDQUFDLENBQUQsQ0FBekMsQ0FBUDtBQVpKO0FBY0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEEgZnJlZSB2YXJpYWJsZSBpcyByZXNvbHZlZCBhY2NvcmRpbmcgdG8gYSByZXNvbHV0aW9uIHJ1bGU6XG4gKlxuICogMS4gU3RyaWN0IHJlc29sdXRpb25cbiAqIDIuIE5hbWVzcGFjZWQgcmVzb2x1dGlvblxuICogMy4gRmFsbGJhY2sgcmVzb2x1dGlvblxuICovXG5cbmltcG9ydCB7IEdldENvbnRleHR1YWxGcmVlT3AsIFNleHBPcGNvZGVzIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogU3RyaWN0IHJlc29sdXRpb24gaXMgdXNlZDpcbiAqXG4gKiAxLiBpbiBhIHN0cmljdCBtb2RlIHRlbXBsYXRlXG4gKiAyLiBpbiBhbiB1bmFtYmlndW91cyBpbnZvY2F0aW9uIHdpdGggZG90IHBhdGhzXG4gKi9cbmV4cG9ydCBjbGFzcyBTdHJpY3RSZXNvbHV0aW9uIHtcbiAgcmVzb2x1dGlvbigpOiBHZXRDb250ZXh0dWFsRnJlZU9wIHtcbiAgICByZXR1cm4gU2V4cE9wY29kZXMuR2V0U3RyaWN0RnJlZTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkUmVzb2x1dGlvbiB7XG4gICAgcmV0dXJuICdTdHJpY3QnO1xuICB9XG5cbiAgcmVhZG9ubHkgaXNBbmdsZUJyYWNrZXQgPSBmYWxzZTtcbn1cblxuZXhwb3J0IGNvbnN0IFNUUklDVF9SRVNPTFVUSU9OID0gbmV3IFN0cmljdFJlc29sdXRpb24oKTtcblxuLyoqXG4gKiBBIGBMb29zZU1vZGVSZXNvbHV0aW9uYCBpbmNsdWRlczpcbiAqXG4gKiAtIDAgb3IgbW9yZSBuYW1lc3BhY2VzIHRvIHJlc29sdmUgdGhlIHZhcmlhYmxlIGluXG4gKiAtIG9wdGlvbmFsIGZhbGxiYWNrIGJlaGF2aW9yXG4gKlxuICogSW4gcHJhY3RpY2UsIHRoZXJlIGFyZSBhIGxpbWl0ZWQgbnVtYmVyIG9mIHBvc3NpYmxlIGNvbWJpbmF0aW9ucyBvZiB0aGVzZSBkZWdyZWVzIG9mIGZyZWVkb20sXG4gKiBhbmQgdGhleSBhcmUgY2FwdHVyZWQgYnkgdGhlIGBBbWJpZ3VpdHlgIHVuaW9uIGJlbG93LlxuICovXG5leHBvcnQgY2xhc3MgTG9vc2VNb2RlUmVzb2x1dGlvbiB7XG4gIC8qKlxuICAgKiBOYW1lc3BhY2VkIHJlc29sdXRpb24gaXMgdXNlZCBpbiBhbiB1bmFtYmlndW91cyBzeW50YXggcG9zaXRpb246XG4gICAqXG4gICAqIDEuIGAoc2V4cClgIChuYW1lc3BhY2U6IGBIZWxwZXJgKVxuICAgKiAyLiBge3sjYmxvY2t9fWAgKG5hbWVzcGFjZTogYENvbXBvbmVudGApXG4gICAqIDMuIGA8YSB7e21vZGlmaWVyfX0+YCAobmFtZXNwYWNlOiBgTW9kaWZpZXJgKVxuICAgKiA0LiBgPENvbXBvbmVudCAvPmAgKG5hbWVzcGFjZTogYENvbXBvbmVudGApXG4gICAqXG4gICAqIEBzZWUge05hbWVzcGFjZWRBbWJpZ3VpdHl9XG4gICAqL1xuICBzdGF0aWMgbmFtZXNwYWNlZChuYW1lc3BhY2U6IEZyZWVWYXJOYW1lc3BhY2UsIGlzQW5nbGVCcmFja2V0ID0gZmFsc2UpOiBMb29zZU1vZGVSZXNvbHV0aW9uIHtcbiAgICByZXR1cm4gbmV3IExvb3NlTW9kZVJlc29sdXRpb24oXG4gICAgICB7XG4gICAgICAgIG5hbWVzcGFjZXM6IFtuYW1lc3BhY2VdLFxuICAgICAgICBmYWxsYmFjazogZmFsc2UsXG4gICAgICB9LFxuICAgICAgaXNBbmdsZUJyYWNrZXRcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZhbGxiYWNrIHJlc29sdXRpb24gaXMgdXNlZCB3aGVuIG5vIG5hbWVzcGFjZWQgcmVzb2x1dGlvbnMgYXJlIHBvc3NpYmxlLCBidXQgZmFsbGJhY2tcbiAgICogcmVzb2x1dGlvbiBpcyBzdGlsbCBhbGxvd2VkLlxuICAgKlxuICAgKiBgYGBoYnNcbiAgICoge3t4Lnl9fVxuICAgKiBgYGBcbiAgICpcbiAgICogQHNlZSB7RmFsbGJhY2tBbWJpZ3VpdHl9XG4gICAqL1xuICBzdGF0aWMgZmFsbGJhY2soKTogTG9vc2VNb2RlUmVzb2x1dGlvbiB7XG4gICAgcmV0dXJuIG5ldyBMb29zZU1vZGVSZXNvbHV0aW9uKHsgbmFtZXNwYWNlczogW10sIGZhbGxiYWNrOiB0cnVlIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGVuZCByZXNvbHV0aW9uIGlzIHVzZWQgd2hlbiB0aGUgdmFyaWFibGUgc2hvdWxkIGJlIHJlc29sdmVkIGluIGJvdGggdGhlIGBjb21wb25lbnRgIGFuZFxuICAgKiBgaGVscGVyYCBuYW1lc3BhY2VzLiBGYWxsYmFjayByZXNvbHV0aW9uIGlzIG9wdGlvbmFsLlxuICAgKlxuICAgKiBgYGBoYnNcbiAgICoge3t4fX1cbiAgICogYGBgXG4gICAqXG4gICAqIF4gYHhgIHNob3VsZCBiZSByZXNvbHZlZCBpbiB0aGUgYGNvbXBvbmVudGAgYW5kIGBoZWxwZXJgIG5hbWVzcGFjZXMgd2l0aCBmYWxsYmFjayByZXNvbHV0aW9uLlxuICAgKlxuICAgKiBgYGBoYnNcbiAgICoge3t4IHl9fVxuICAgKiBgYGBcbiAgICpcbiAgICogXiBgeGAgc2hvdWxkIGJlIHJlc29sdmVkIGluIHRoZSBgY29tcG9uZW50YCBhbmQgYGhlbHBlcmAgbmFtZXNwYWNlcyB3aXRob3V0IGZhbGxiYWNrXG4gICAqIHJlc29sdXRpb24uXG4gICAqXG4gICAqIEBzZWUge0NvbXBvbmVudE9ySGVscGVyQW1iaWd1aXR5fVxuICAgKi9cbiAgc3RhdGljIGFwcGVuZCh7IGludm9rZSB9OiB7IGludm9rZTogYm9vbGVhbiB9KTogTG9vc2VNb2RlUmVzb2x1dGlvbiB7XG4gICAgcmV0dXJuIG5ldyBMb29zZU1vZGVSZXNvbHV0aW9uKHtcbiAgICAgIG5hbWVzcGFjZXM6IFtGcmVlVmFyTmFtZXNwYWNlLkNvbXBvbmVudCwgRnJlZVZhck5hbWVzcGFjZS5IZWxwZXJdLFxuICAgICAgZmFsbGJhY2s6ICFpbnZva2UsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVHJ1c3RpbmcgYXBwZW5kIHJlc29sdXRpb24gaXMgdXNlZCB3aGVuIHRoZSB2YXJpYWJsZSBzaG91bGQgYmUgcmVzb2x2ZWQgaW4gYm90aCB0aGUgYGNvbXBvbmVudGAgYW5kXG4gICAqIGBoZWxwZXJgIG5hbWVzcGFjZXMuIEZhbGxiYWNrIHJlc29sdXRpb24gaXMgb3B0aW9uYWwuXG4gICAqXG4gICAqIGBgYGhic1xuICAgKiB7e3t4fX19XG4gICAqIGBgYFxuICAgKlxuICAgKiBeIGB4YCBzaG91bGQgYmUgcmVzb2x2ZWQgaW4gdGhlIGBjb21wb25lbnRgIGFuZCBgaGVscGVyYCBuYW1lc3BhY2VzIHdpdGggZmFsbGJhY2sgcmVzb2x1dGlvbi5cbiAgICpcbiAgICogYGBgaGJzXG4gICAqIHt7e3ggeX19fVxuICAgKiBgYGBcbiAgICpcbiAgICogXiBgeGAgc2hvdWxkIGJlIHJlc29sdmVkIGluIHRoZSBgY29tcG9uZW50YCBhbmQgYGhlbHBlcmAgbmFtZXNwYWNlcyB3aXRob3V0IGZhbGxiYWNrXG4gICAqIHJlc29sdXRpb24uXG4gICAqXG4gICAqIEBzZWUge0hlbHBlckFtYmlndWl0eX1cbiAgICovXG4gIHN0YXRpYyB0cnVzdGluZ0FwcGVuZCh7IGludm9rZSB9OiB7IGludm9rZTogYm9vbGVhbiB9KTogTG9vc2VNb2RlUmVzb2x1dGlvbiB7XG4gICAgcmV0dXJuIG5ldyBMb29zZU1vZGVSZXNvbHV0aW9uKHtcbiAgICAgIG5hbWVzcGFjZXM6IFtGcmVlVmFyTmFtZXNwYWNlLkhlbHBlcl0sXG4gICAgICBmYWxsYmFjazogIWludm9rZSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRyaWJ1dGUgcmVzb2x1dGlvbiBpcyB1c2VkIHdoZW4gdGhlIHZhcmlhYmxlIHNob3VsZCBiZSByZXNvbHZlZCBhcyBhIGBoZWxwZXJgIHdpdGggZmFsbGJhY2tcbiAgICogcmVzb2x1dGlvbi5cbiAgICpcbiAgICogYGBgaGJzXG4gICAqIDxhIGhyZWY9e3t4fX0gLz5cbiAgICogPGEgaHJlZj1cInt7eH19Lmh0bWxcIiAvPlxuICAgKiBgYGBcbiAgICpcbiAgICogXiByZXNvbHZlZCBpbiB0aGUgYGhlbHBlcmAgbmFtZXNwYWNlIHdpdGggZmFsbGJhY2tcbiAgICpcbiAgICogQHNlZSB7SGVscGVyQW1iaWd1aXR5fVxuICAgKi9cbiAgc3RhdGljIGF0dHIoKTogTG9vc2VNb2RlUmVzb2x1dGlvbiB7XG4gICAgcmV0dXJuIG5ldyBMb29zZU1vZGVSZXNvbHV0aW9uKHsgbmFtZXNwYWNlczogW0ZyZWVWYXJOYW1lc3BhY2UuSGVscGVyXSwgZmFsbGJhY2s6IHRydWUgfSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBhbWJpZ3VpdHk6IEFtYmlndWl0eSwgcmVhZG9ubHkgaXNBbmdsZUJyYWNrZXQgPSBmYWxzZSkge31cblxuICByZXNvbHV0aW9uKCk6IEdldENvbnRleHR1YWxGcmVlT3Age1xuICAgIGlmICh0aGlzLmFtYmlndWl0eS5uYW1lc3BhY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFNleHBPcGNvZGVzLkdldFN0cmljdEZyZWU7XG4gICAgfSBlbHNlIGlmICh0aGlzLmFtYmlndWl0eS5uYW1lc3BhY2VzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgaWYgKHRoaXMuYW1iaWd1aXR5LmZhbGxiYWNrKSB7XG4gICAgICAgIC8vIHNpbXBsZSBuYW1lc3BhY2VkIHJlc29sdXRpb24gd2l0aCBmYWxsYmFjayBtdXN0IGJlIGF0dHI9e3t4fX1cbiAgICAgICAgcmV0dXJuIFNleHBPcGNvZGVzLkdldEZyZWVBc0hlbHBlckhlYWRPclRoaXNGYWxsYmFjaztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHNpbXBsZSBuYW1lc3BhY2VkIHJlc29sdXRpb24gd2l0aG91dCBmYWxsYmFja1xuICAgICAgICBzd2l0Y2ggKHRoaXMuYW1iaWd1aXR5Lm5hbWVzcGFjZXNbMF0pIHtcbiAgICAgICAgICBjYXNlIEZyZWVWYXJOYW1lc3BhY2UuSGVscGVyOlxuICAgICAgICAgICAgcmV0dXJuIFNleHBPcGNvZGVzLkdldEZyZWVBc0hlbHBlckhlYWQ7XG4gICAgICAgICAgY2FzZSBGcmVlVmFyTmFtZXNwYWNlLk1vZGlmaWVyOlxuICAgICAgICAgICAgcmV0dXJuIFNleHBPcGNvZGVzLkdldEZyZWVBc01vZGlmaWVySGVhZDtcbiAgICAgICAgICBjYXNlIEZyZWVWYXJOYW1lc3BhY2UuQ29tcG9uZW50OlxuICAgICAgICAgICAgcmV0dXJuIFNleHBPcGNvZGVzLkdldEZyZWVBc0NvbXBvbmVudEhlYWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuYW1iaWd1aXR5LmZhbGxiYWNrKSB7XG4gICAgICAvLyBjb21wb25lbnQgb3IgaGVscGVyICsgZmFsbGJhY2sgKHt7c29tZXRoaW5nfX0pXG4gICAgICByZXR1cm4gU2V4cE9wY29kZXMuR2V0RnJlZUFzQ29tcG9uZW50T3JIZWxwZXJIZWFkT3JUaGlzRmFsbGJhY2s7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNvbXBvbmVudCBvciBoZWxwZXIgd2l0aG91dCBmYWxsYmFjayAoe3tzb21ldGhpbmcgc29tZXRoaW5nfX0pXG4gICAgICByZXR1cm4gU2V4cE9wY29kZXMuR2V0RnJlZUFzQ29tcG9uZW50T3JIZWxwZXJIZWFkO1xuICAgIH1cbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkUmVzb2x1dGlvbiB7XG4gICAgaWYgKHRoaXMuYW1iaWd1aXR5Lm5hbWVzcGFjZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gJ0xvb3NlJztcbiAgICB9IGVsc2UgaWYgKHRoaXMuYW1iaWd1aXR5Lm5hbWVzcGFjZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICBpZiAodGhpcy5hbWJpZ3VpdHkuZmFsbGJhY2spIHtcbiAgICAgICAgLy8gc2ltcGxlIG5hbWVzcGFjZWQgcmVzb2x1dGlvbiB3aXRoIGZhbGxiYWNrIG11c3QgYmUgYXR0cj17e3h9fVxuICAgICAgICByZXR1cm4gWydhbWJpZ3VvdXMnLCBTZXJpYWxpemVkQW1iaWd1aXR5LkF0dHJdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFsnbnMnLCB0aGlzLmFtYmlndWl0eS5uYW1lc3BhY2VzWzBdXTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuYW1iaWd1aXR5LmZhbGxiYWNrKSB7XG4gICAgICAvLyBjb21wb25lbnQgb3IgaGVscGVyICsgZmFsbGJhY2sgKHt7c29tZXRoaW5nfX0pXG4gICAgICByZXR1cm4gWydhbWJpZ3VvdXMnLCBTZXJpYWxpemVkQW1iaWd1aXR5LkFwcGVuZF07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNvbXBvbmVudCBvciBoZWxwZXIgd2l0aG91dCBmYWxsYmFjayAoe3tzb21ldGhpbmcgc29tZXRoaW5nfX0pXG4gICAgICByZXR1cm4gWydhbWJpZ3VvdXMnLCBTZXJpYWxpemVkQW1iaWd1aXR5Lkludm9rZV07XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBBUkdVTUVOVF9SRVNPTFVUSU9OID0gTG9vc2VNb2RlUmVzb2x1dGlvbi5mYWxsYmFjaygpO1xuXG5leHBvcnQgY29uc3QgZW51bSBGcmVlVmFyTmFtZXNwYWNlIHtcbiAgSGVscGVyID0gJ0hlbHBlcicsXG4gIE1vZGlmaWVyID0gJ01vZGlmaWVyJyxcbiAgQ29tcG9uZW50ID0gJ0NvbXBvbmVudCcsXG59XG5cbi8qKlxuICogQSBgQ29tcG9uZW50T3JIZWxwZXJBbWJpZ3VpdHlgIG1pZ2h0IGJlIGEgY29tcG9uZW50IG9yIGEgaGVscGVyLCB3aXRoIGFuIG9wdGlvbmFsIGZhbGxiYWNrXG4gKlxuICogYGBgaGJzXG4gKiB7e3h9fVxuICogYGBgXG4gKlxuICogXiBgeGAgaXMgcmVzb2x2ZWQgaW4gdGhlIGBjb21wb25lbnRgIGFuZCBgaGVscGVyYCBuYW1lc3BhY2VzLCB3aXRoIGZhbGxiYWNrXG4gKlxuICogYGBgaGJzXG4gKiB7e3ggeX19XG4gKiBgYGBcbiAqXG4gKiBeIGB4YCBpcyByZXNvbHZlZCBpbiB0aGUgYGNvbXBvbmVudGAgYW5kIGBoZWxwZXJgIG5hbWVzcGFjZXMsIHdpdGhvdXQgZmFsbGJhY2tcbiAqL1xudHlwZSBDb21wb25lbnRPckhlbHBlckFtYmlndWl0eSA9IHtcbiAgbmFtZXNwYWNlczogW0ZyZWVWYXJOYW1lc3BhY2UuQ29tcG9uZW50LCBGcmVlVmFyTmFtZXNwYWNlLkhlbHBlcl07XG4gIGZhbGxiYWNrOiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBBIGBIZWxwZXJBbWJpZ3VpdHlgIG11c3QgYmUgYSBoZWxwZXIsIGJ1dCBpdCBoYXMgZmFsbGJhY2suIElmIGl0IGRpZG4ndCBoYXZlIGZhbGxiYWNrLCBpdCB3b3VsZFxuICogYmUgYSBgTmFtZXNwYWNlZEFtYmlndWl0eWAuXG4gKlxuICogYGBgaGJzXG4gKiA8YSBocmVmPXt7eH19IC8+XG4gKiA8YSBocmVmPVwie3t4fX0uaHRtbFwiIC8+XG4gKiBgYGBcbiAqXG4gKiBeIGB4YCBpcyByZXNvbHZlZCBpbiB0aGUgYGhlbHBlcmAgbmFtZXNwYWNlIHdpdGggZmFsbGJhY2tcbiAqL1xudHlwZSBIZWxwZXJBbWJpZ3VpdHkgPSB7IG5hbWVzcGFjZXM6IFtGcmVlVmFyTmFtZXNwYWNlLkhlbHBlcl07IGZhbGxiYWNrOiBib29sZWFuIH07XG5cbi8qKlxuICogQSBgTmFtZXNwYWNlZEFtYmlndWl0eWAgbXVzdCBiZSByZXNvbHZlZCBpbiBhIHBhcnRpY3VsYXIgbmFtZXNwYWNlLCB3aXRob3V0IGZhbGxiYWNrLlxuICpcbiAqIGBgYGhic1xuICogPFggLz5cbiAqIGBgYFxuICpcbiAqIF4gYFhgIGlzIHJlc29sdmVkIGluIHRoZSBgY29tcG9uZW50YCBuYW1lc3BhY2Ugd2l0aG91dCBmYWxsYmFja1xuICpcbiAqIGBgYGhic1xuICogKHgpXG4gKiBgYGBcbiAqXG4gKiBeIGB4YCBpcyByZXNvbHZlZCBpbiB0aGUgYGhlbHBlcmAgbmFtZXNwYWNlIHdpdGhvdXQgZmFsbGJhY2tcbiAqXG4gKiBgYGBoYnNcbiAqIDxhIHt7eH19IC8+XG4gKiBgYGBcbiAqXG4gKiBeIGB4YCBpcyByZXNvbHZlZCBpbiB0aGUgYG1vZGlmaWVyYCBuYW1lc3BhY2Ugd2l0aG91dCBmYWxsYmFja1xuICovXG50eXBlIE5hbWVzcGFjZWRBbWJpZ3VpdHkgPSB7XG4gIG5hbWVzcGFjZXM6IFtGcmVlVmFyTmFtZXNwYWNlLkNvbXBvbmVudCB8IEZyZWVWYXJOYW1lc3BhY2UuSGVscGVyIHwgRnJlZVZhck5hbWVzcGFjZS5Nb2RpZmllcl07XG4gIGZhbGxiYWNrOiBmYWxzZTtcbn07XG5cbnR5cGUgRmFsbGJhY2tBbWJpZ3VpdHkgPSB7XG4gIG5hbWVzcGFjZXM6IFtdO1xuICBmYWxsYmFjazogdHJ1ZTtcbn07XG5cbnR5cGUgQW1iaWd1aXR5ID1cbiAgfCBDb21wb25lbnRPckhlbHBlckFtYmlndWl0eVxuICB8IEhlbHBlckFtYmlndWl0eVxuICB8IE5hbWVzcGFjZWRBbWJpZ3VpdHlcbiAgfCBGYWxsYmFja0FtYmlndWl0eTtcblxuZXhwb3J0IHR5cGUgRnJlZVZhclJlc29sdXRpb24gPSBTdHJpY3RSZXNvbHV0aW9uIHwgTG9vc2VNb2RlUmVzb2x1dGlvbjtcblxuLy8gU2VyaWFsaXphdGlvblxuXG5jb25zdCBlbnVtIFNlcmlhbGl6ZWRBbWJpZ3VpdHkge1xuICAvLyB7e3h9fVxuICBBcHBlbmQgPSAnQXBwZW5kJyxcbiAgLy8gaHJlZj17e3h9fVxuICBBdHRyID0gJ0F0dHInLFxuICAvLyB7e3ggeX19IChub3QgYXR0cilcbiAgSW52b2tlID0gJ0ludm9rZScsXG59XG5cbmV4cG9ydCB0eXBlIFNlcmlhbGl6ZWRSZXNvbHV0aW9uID1cbiAgfCAnU3RyaWN0J1xuICB8ICdMb29zZSdcbiAgfCBbJ25zJywgRnJlZVZhck5hbWVzcGFjZV1cbiAgfCBbJ2FtYmlndW91cycsIFNlcmlhbGl6ZWRBbWJpZ3VpdHldO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFJlc29sdXRpb24ocmVzb2x1dGlvbjogU2VyaWFsaXplZFJlc29sdXRpb24pOiBGcmVlVmFyUmVzb2x1dGlvbiB7XG4gIGlmICh0eXBlb2YgcmVzb2x1dGlvbiA9PT0gJ3N0cmluZycpIHtcbiAgICBzd2l0Y2ggKHJlc29sdXRpb24pIHtcbiAgICAgIGNhc2UgJ0xvb3NlJzpcbiAgICAgICAgcmV0dXJuIExvb3NlTW9kZVJlc29sdXRpb24uZmFsbGJhY2soKTtcbiAgICAgIGNhc2UgJ1N0cmljdCc6XG4gICAgICAgIHJldHVybiBTVFJJQ1RfUkVTT0xVVElPTjtcbiAgICB9XG4gIH1cblxuICBzd2l0Y2ggKHJlc29sdXRpb25bMF0pIHtcbiAgICBjYXNlICdhbWJpZ3VvdXMnOlxuICAgICAgc3dpdGNoIChyZXNvbHV0aW9uWzFdKSB7XG4gICAgICAgIGNhc2UgU2VyaWFsaXplZEFtYmlndWl0eS5BcHBlbmQ6XG4gICAgICAgICAgcmV0dXJuIExvb3NlTW9kZVJlc29sdXRpb24uYXBwZW5kKHsgaW52b2tlOiBmYWxzZSB9KTtcbiAgICAgICAgY2FzZSBTZXJpYWxpemVkQW1iaWd1aXR5LkF0dHI6XG4gICAgICAgICAgcmV0dXJuIExvb3NlTW9kZVJlc29sdXRpb24uYXR0cigpO1xuICAgICAgICBjYXNlIFNlcmlhbGl6ZWRBbWJpZ3VpdHkuSW52b2tlOlxuICAgICAgICAgIHJldHVybiBMb29zZU1vZGVSZXNvbHV0aW9uLmFwcGVuZCh7IGludm9rZTogdHJ1ZSB9KTtcbiAgICAgIH1cblxuICAgIGNhc2UgJ25zJzpcbiAgICAgIHJldHVybiBMb29zZU1vZGVSZXNvbHV0aW9uLm5hbWVzcGFjZWQocmVzb2x1dGlvblsxXSk7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=