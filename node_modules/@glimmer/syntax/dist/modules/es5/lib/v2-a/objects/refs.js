function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import { node } from './node';
/**
 * Corresponds to `this` at the head of an expression.
 */

export var ThisReference = /*#__PURE__*/function (_node$fields) {
  _inheritsLoose(ThisReference, _node$fields);

  function ThisReference() {
    return _node$fields.apply(this, arguments) || this;
  }

  return ThisReference;
}(node('This').fields());
/**
 * Corresponds to `@<ident>` at the beginning of an expression.
 */

export var ArgReference = /*#__PURE__*/function (_node$fields2) {
  _inheritsLoose(ArgReference, _node$fields2);

  function ArgReference() {
    return _node$fields2.apply(this, arguments) || this;
  }

  return ArgReference;
}(node('Arg').fields());
/**
 * Corresponds to `<ident>` at the beginning of an expression, when `<ident>` is in the current
 * block's scope.
 */

export var LocalVarReference = /*#__PURE__*/function (_node$fields3) {
  _inheritsLoose(LocalVarReference, _node$fields3);

  function LocalVarReference() {
    return _node$fields3.apply(this, arguments) || this;
  }

  return LocalVarReference;
}(node('Local').fields());
/**
 * Corresponds to `<ident>` at the beginning of an expression, when `<ident>` is *not* in the
 * current block's scope.
 *
 * The `resolution: FreeVarResolution` field describes how to resolve the free variable.
 *
 * Note: In strict mode, it must always be a variable that is in a concrete JavaScript scope that
 * the template will be installed into.
 */

export var FreeVarReference = /*#__PURE__*/function (_node$fields4) {
  _inheritsLoose(FreeVarReference, _node$fields4);

  function FreeVarReference() {
    return _node$fields4.apply(this, arguments) || this;
  }

  return FreeVarReference;
}(node('Free').fields());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9vYmplY3RzL3JlZnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxTQUFBLElBQUEsUUFBQSxRQUFBO0FBR0E7Ozs7QUFHQSxXQUFNLGFBQU47QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxFQUFtQyxJQUFJLENBQUosTUFBSSxDQUFKLENBQTdCLE1BQTZCLEVBQW5DO0FBRUE7Ozs7QUFHQSxXQUFNLFlBQU47QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxFQUFrQyxJQUFJLENBQUosS0FBSSxDQUFKLENBQTVCLE1BQTRCLEVBQWxDO0FBRUE7Ozs7O0FBSUEsV0FBTSxpQkFBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLEVBQXVDLElBQUksQ0FBSixPQUFJLENBQUosQ0FBakMsTUFBaUMsRUFBdkM7QUFNQTs7Ozs7Ozs7OztBQVNBLFdBQU0sZ0JBQU47QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxFQUFzQyxJQUFJLENBQUosTUFBSSxDQUFKLENBQWhDLE1BQWdDLEVBQXRDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU291cmNlU2xpY2UgfSBmcm9tICcuLi8uLi9zb3VyY2Uvc2xpY2UnO1xuaW1wb3J0IHsgbm9kZSB9IGZyb20gJy4vbm9kZSc7XG5pbXBvcnQgdHlwZSB7IEZyZWVWYXJSZXNvbHV0aW9uIH0gZnJvbSAnLi9yZXNvbHV0aW9uJztcblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBgdGhpc2AgYXQgdGhlIGhlYWQgb2YgYW4gZXhwcmVzc2lvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFRoaXNSZWZlcmVuY2UgZXh0ZW5kcyBub2RlKCdUaGlzJykuZmllbGRzKCkge31cblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBgQDxpZGVudD5gIGF0IHRoZSBiZWdpbm5pbmcgb2YgYW4gZXhwcmVzc2lvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIEFyZ1JlZmVyZW5jZSBleHRlbmRzIG5vZGUoJ0FyZycpLmZpZWxkczx7IG5hbWU6IFNvdXJjZVNsaWNlOyBzeW1ib2w6IG51bWJlciB9PigpIHt9XG5cbi8qKlxuICogQ29ycmVzcG9uZHMgdG8gYDxpZGVudD5gIGF0IHRoZSBiZWdpbm5pbmcgb2YgYW4gZXhwcmVzc2lvbiwgd2hlbiBgPGlkZW50PmAgaXMgaW4gdGhlIGN1cnJlbnRcbiAqIGJsb2NrJ3Mgc2NvcGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2NhbFZhclJlZmVyZW5jZSBleHRlbmRzIG5vZGUoJ0xvY2FsJykuZmllbGRzPHtcbiAgbmFtZTogc3RyaW5nO1xuICBpc1RlbXBsYXRlTG9jYWw6IGJvb2xlYW47XG4gIHN5bWJvbDogbnVtYmVyO1xufT4oKSB7fVxuXG4vKipcbiAqIENvcnJlc3BvbmRzIHRvIGA8aWRlbnQ+YCBhdCB0aGUgYmVnaW5uaW5nIG9mIGFuIGV4cHJlc3Npb24sIHdoZW4gYDxpZGVudD5gIGlzICpub3QqIGluIHRoZVxuICogY3VycmVudCBibG9jaydzIHNjb3BlLlxuICpcbiAqIFRoZSBgcmVzb2x1dGlvbjogRnJlZVZhclJlc29sdXRpb25gIGZpZWxkIGRlc2NyaWJlcyBob3cgdG8gcmVzb2x2ZSB0aGUgZnJlZSB2YXJpYWJsZS5cbiAqXG4gKiBOb3RlOiBJbiBzdHJpY3QgbW9kZSwgaXQgbXVzdCBhbHdheXMgYmUgYSB2YXJpYWJsZSB0aGF0IGlzIGluIGEgY29uY3JldGUgSmF2YVNjcmlwdCBzY29wZSB0aGF0XG4gKiB0aGUgdGVtcGxhdGUgd2lsbCBiZSBpbnN0YWxsZWQgaW50by5cbiAqL1xuZXhwb3J0IGNsYXNzIEZyZWVWYXJSZWZlcmVuY2UgZXh0ZW5kcyBub2RlKCdGcmVlJykuZmllbGRzPHtcbiAgbmFtZTogc3RyaW5nO1xuICByZXNvbHV0aW9uOiBGcmVlVmFyUmVzb2x1dGlvbjtcbiAgc3ltYm9sOiBudW1iZXI7XG59PigpIHt9XG5cbmV4cG9ydCB0eXBlIFZhcmlhYmxlUmVmZXJlbmNlID0gVGhpc1JlZmVyZW5jZSB8IEFyZ1JlZmVyZW5jZSB8IExvY2FsVmFyUmVmZXJlbmNlIHwgRnJlZVZhclJlZmVyZW5jZTtcbiJdLCJzb3VyY2VSb290IjoiIn0=