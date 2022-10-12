"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ElementModifier = exports.ComponentArg = exports.SplatAttr = exports.HtmlAttr = void 0;

var _args = require("./args");

var _node = require("./node");

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

/**
 * `HtmlAttr` nodes are valid HTML attributes, with or without a value.
 *
 * Exceptions:
 *
 * - `...attributes` is `SplatAttr`
 * - `@x=<value>` is `ComponentArg`
 */
var HtmlAttr = /*#__PURE__*/function (_node$fields) {
  _inheritsLoose(HtmlAttr, _node$fields);

  function HtmlAttr() {
    return _node$fields.apply(this, arguments) || this;
  }

  return HtmlAttr;
}((0, _node.node)('HtmlAttr').fields());

exports.HtmlAttr = HtmlAttr;

var SplatAttr = /*#__PURE__*/function (_node$fields2) {
  _inheritsLoose(SplatAttr, _node$fields2);

  function SplatAttr() {
    return _node$fields2.apply(this, arguments) || this;
  }

  return SplatAttr;
}((0, _node.node)('SplatAttr').fields());
/**
 * Corresponds to an argument passed by a component (`@x=<value>`)
 */


exports.SplatAttr = SplatAttr;

var ComponentArg = /*#__PURE__*/function (_node$fields3) {
  _inheritsLoose(ComponentArg, _node$fields3);

  function ComponentArg() {
    return _node$fields3.apply(this, arguments) || this;
  }

  var _proto = ComponentArg.prototype;
  /**
   * Convert the component argument into a named argument node
   */

  _proto.toNamedArgument = function toNamedArgument() {
    return new _args.NamedArgument({
      name: this.name,
      value: this.value
    });
  };

  return ComponentArg;
}((0, _node.node)().fields());
/**
 * An `ElementModifier` is just a normal call node in modifier position.
 */


exports.ComponentArg = ComponentArg;

var ElementModifier = /*#__PURE__*/function (_node$fields4) {
  _inheritsLoose(ElementModifier, _node$fields4);

  function ElementModifier() {
    return _node$fields4.apply(this, arguments) || this;
  }

  return ElementModifier;
}((0, _node.node)('ElementModifier').fields());

exports.ElementModifier = ElementModifier;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9vYmplY3RzL2F0dHItYmxvY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUdBOzs7Ozs7OztBQXdCQTs7Ozs7Ozs7QUFRQSxJQUFNLFFBQU4sR0FBQSxhQUFBLFVBQUEsWUFBQSxFQUFBO0FBQUEsRUFBQSxjQUFBLENBQUEsUUFBQSxFQUFBLFlBQUEsQ0FBQTs7QUFBQSxXQUFBLFFBQUEsR0FBQTtBQUFBLFdBQUEsWUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUEsU0FBQSxLQUFBLElBQUE7QUFBQTs7QUFBQSxTQUFBLFFBQUE7QUFBQSxDQUFBLENBQThCLGdCQUFBLFVBQUEsRUFBOUIsTUFBOEIsRUFBOUIsQ0FBQTs7OztBQUVBLElBQU0sU0FBTixHQUFBLGFBQUEsVUFBQSxhQUFBLEVBQUE7QUFBQSxFQUFBLGNBQUEsQ0FBQSxTQUFBLEVBQUEsYUFBQSxDQUFBOztBQUFBLFdBQUEsU0FBQSxHQUFBO0FBQUEsV0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxTQUFBLEtBQUEsSUFBQTtBQUFBOztBQUFBLFNBQUEsU0FBQTtBQUFBLENBQUEsQ0FBK0IsZ0JBQUEsV0FBQSxFQUEvQixNQUErQixFQUEvQixDQUFBO0FBRUE7Ozs7Ozs7QUFHQSxJQUFNLFlBQU4sR0FBQSxhQUFBLFVBQUEsYUFBQSxFQUFBO0FBQUEsRUFBQSxjQUFBLENBQUEsWUFBQSxFQUFBLGFBQUEsQ0FBQTs7QUFBQSxXQUFBLFlBQUEsR0FBQTtBQUFBLFdBQUEsYUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUEsU0FBQSxLQUFBLElBQUE7QUFBQTs7QUFBQSxNQUFBLE1BQUEsR0FBQSxZQUFBLENBQUEsU0FBQTtBQUNFOzs7O0FBREYsRUFBQSxNQUFBLENBQUEsZUFBQSxHQUlFLFNBQUEsZUFBQSxHQUFlO0FBQ2IsV0FBTyxJQUFBLG1CQUFBLENBQWtCO0FBQ3ZCLE1BQUEsSUFBSSxFQUFFLEtBRGlCLElBQUE7QUFFdkIsTUFBQSxLQUFLLEVBQUUsS0FBSztBQUZXLEtBQWxCLENBQVA7QUFMSixHQUFBOztBQUFBLFNBQUEsWUFBQTtBQUFBLENBQUEsQ0FBa0Msa0JBQWxDLE1BQWtDLEVBQWxDLENBQUE7QUFZQTs7Ozs7OztBQUdBLElBQU0sZUFBTixHQUFBLGFBQUEsVUFBQSxhQUFBLEVBQUE7QUFBQSxFQUFBLGNBQUEsQ0FBQSxlQUFBLEVBQUEsYUFBQSxDQUFBOztBQUFBLFdBQUEsZUFBQSxHQUFBO0FBQUEsV0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxTQUFBLEtBQUEsSUFBQTtBQUFBOztBQUFBLFNBQUEsZUFBQTtBQUFBLENBQUEsQ0FBcUMsZ0JBQUEsaUJBQUEsRUFBckMsTUFBcUMsRUFBckMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNvdXJjZVNsaWNlIH0gZnJvbSAnLi4vLi4vc291cmNlL3NsaWNlJztcbmltcG9ydCB7IE5hbWVkQXJndW1lbnQgfSBmcm9tICcuL2FyZ3MnO1xuaW1wb3J0IHR5cGUgeyBDYWxsRmllbGRzIH0gZnJvbSAnLi9iYXNlJztcbmltcG9ydCB0eXBlIHsgRXhwcmVzc2lvbk5vZGUgfSBmcm9tICcuL2V4cHInO1xuaW1wb3J0IHsgbm9kZSB9IGZyb20gJy4vbm9kZSc7XG5cbi8qKlxuICogQXR0ciBub2RlcyBsb29rIGxpa2UgSFRNTCBhdHRyaWJ1dGVzLCBidXQgYXJlIGNsYXNzaWZpZWQgYXM6XG4gKlxuICogMS4gYEh0bWxBdHRyYCwgd2hpY2ggbWVhbnMgYSByZWd1bGFyIEhUTUwgYXR0cmlidXRlIGluIEdsaW1tZXJcbiAqIDIuIGBTcGxhdEF0dHJgLCB3aGljaCBtZWFucyBgLi4uYXR0cmlidXRlc2BcbiAqIDMuIGBDb21wb25lbnRBcmdgLCB3aGljaCBtZWFucyBhbiBhdHRyaWJ1dGUgd2hvc2UgbmFtZSBiZWdpbnMgd2l0aCBgQGAsIGFuZCBpdCBpcyB0aGVyZWZvcmUgYVxuICogICAgY29tcG9uZW50IGFyZ3VtZW50LlxuICovXG5leHBvcnQgdHlwZSBBdHRyTm9kZSA9IEh0bWxBdHRyIHwgU3BsYXRBdHRyIHwgQ29tcG9uZW50QXJnO1xuXG4vKipcbiAqIGBIdG1sQXR0cmAgYW5kIGBTcGxhdEF0dHJgIGFyZSBncm91cGVkIHRvZ2V0aGVyIGJlY2F1c2UgdGhlIG9yZGVyIG9mIHRoZSBgU3BsYXRBdHRyYCBub2RlLFxuICogcmVsYXRpdmUgdG8gb3RoZXIgYXR0cmlidXRlcywgbWF0dGVycy5cbiAqL1xuZXhwb3J0IHR5cGUgSHRtbE9yU3BsYXRBdHRyID0gSHRtbEF0dHIgfCBTcGxhdEF0dHI7XG5cbi8qKlxuICogXCJBdHRyIEJsb2NrXCIgbm9kZXMgYXJlIGFsbG93ZWQgaW5zaWRlIGFuIG9wZW4gZWxlbWVudCB0YWcgaW4gdGVtcGxhdGVzLiBUaGV5IGludGVyYWN0IHdpdGggdGhlXG4gKiBlbGVtZW50IChvciBjb21wb25lbnQpLlxuICovXG5leHBvcnQgdHlwZSBBdHRyQmxvY2tOb2RlID0gQXR0ck5vZGUgfCBFbGVtZW50TW9kaWZpZXI7XG5cbi8qKlxuICogYEh0bWxBdHRyYCBub2RlcyBhcmUgdmFsaWQgSFRNTCBhdHRyaWJ1dGVzLCB3aXRoIG9yIHdpdGhvdXQgYSB2YWx1ZS5cbiAqXG4gKiBFeGNlcHRpb25zOlxuICpcbiAqIC0gYC4uLmF0dHJpYnV0ZXNgIGlzIGBTcGxhdEF0dHJgXG4gKiAtIGBAeD08dmFsdWU+YCBpcyBgQ29tcG9uZW50QXJnYFxuICovXG5leHBvcnQgY2xhc3MgSHRtbEF0dHIgZXh0ZW5kcyBub2RlKCdIdG1sQXR0cicpLmZpZWxkczxBdHRyTm9kZU9wdGlvbnM+KCkge31cblxuZXhwb3J0IGNsYXNzIFNwbGF0QXR0ciBleHRlbmRzIG5vZGUoJ1NwbGF0QXR0cicpLmZpZWxkczx7IHN5bWJvbDogbnVtYmVyIH0+KCkge31cblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBhbiBhcmd1bWVudCBwYXNzZWQgYnkgYSBjb21wb25lbnQgKGBAeD08dmFsdWU+YClcbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvbmVudEFyZyBleHRlbmRzIG5vZGUoKS5maWVsZHM8QXR0ck5vZGVPcHRpb25zPigpIHtcbiAgLyoqXG4gICAqIENvbnZlcnQgdGhlIGNvbXBvbmVudCBhcmd1bWVudCBpbnRvIGEgbmFtZWQgYXJndW1lbnQgbm9kZVxuICAgKi9cbiAgdG9OYW1lZEFyZ3VtZW50KCk6IE5hbWVkQXJndW1lbnQge1xuICAgIHJldHVybiBuZXcgTmFtZWRBcmd1bWVudCh7XG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICB2YWx1ZTogdGhpcy52YWx1ZSxcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGBFbGVtZW50TW9kaWZpZXJgIGlzIGp1c3QgYSBub3JtYWwgY2FsbCBub2RlIGluIG1vZGlmaWVyIHBvc2l0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgRWxlbWVudE1vZGlmaWVyIGV4dGVuZHMgbm9kZSgnRWxlbWVudE1vZGlmaWVyJykuZmllbGRzPENhbGxGaWVsZHM+KCkge31cblxuZXhwb3J0IGludGVyZmFjZSBBdHRyTm9kZU9wdGlvbnMge1xuICBuYW1lOiBTb3VyY2VTbGljZTtcbiAgdmFsdWU6IEV4cHJlc3Npb25Ob2RlO1xuICB0cnVzdGluZzogYm9vbGVhbjtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=