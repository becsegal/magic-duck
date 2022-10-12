"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NamedBlock = exports.NamedBlocks = exports.Block = exports.Template = void 0;

var _spanList = require("../../source/span-list");

var _args = require("./args");

var _node = require("./node");

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

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

/**
 * Corresponds to an entire template.
 */
var Template = /*#__PURE__*/function (_node$fields) {
  _inheritsLoose(Template, _node$fields);

  function Template() {
    return _node$fields.apply(this, arguments) || this;
  }

  return Template;
}((0, _node.node)().fields());
/**
 * Represents a block. In principle this could be merged with `NamedBlock`, because all cases
 * involving blocks have at least a notional name.
 */


exports.Template = Template;

var Block = /*#__PURE__*/function (_node$fields2) {
  _inheritsLoose(Block, _node$fields2);

  function Block() {
    return _node$fields2.apply(this, arguments) || this;
  }

  return Block;
}((0, _node.node)().fields());
/**
 * Corresponds to a collection of named blocks.
 */


exports.Block = Block;

var NamedBlocks = /*#__PURE__*/function (_node$fields3) {
  _inheritsLoose(NamedBlocks, _node$fields3);

  function NamedBlocks() {
    return _node$fields3.apply(this, arguments) || this;
  }

  var _proto = NamedBlocks.prototype;

  _proto.get = function get(name) {
    return this.blocks.filter(function (block) {
      return block.name.chars === name;
    })[0] || null;
  };

  return NamedBlocks;
}((0, _node.node)().fields());
/**
 * Corresponds to a single named block. This is used for anonymous named blocks (`default` and
 * `else`).
 */


exports.NamedBlocks = NamedBlocks;

var NamedBlock = /*#__PURE__*/function (_node$fields4) {
  _inheritsLoose(NamedBlock, _node$fields4);

  function NamedBlock() {
    return _node$fields4.apply(this, arguments) || this;
  }

  _createClass(NamedBlock, [{
    key: "args",
    get: function get() {
      var entries = this.componentArgs.map(function (a) {
        return a.toNamedArgument();
      });
      return _args.Args.named(new _args.NamedArguments({
        loc: _spanList.SpanList.range(entries, this.name.loc.collapse('end')),
        entries: entries
      }));
    }
  }]);

  return NamedBlock;
}((0, _node.node)().fields());

exports.NamedBlock = NamedBlock;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9vYmplY3RzL2ludGVybmFsLW5vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUVBOztBQUdBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTs7O0FBR0EsSUFBTSxRQUFOLEdBQUEsYUFBQSxVQUFBLFlBQUEsRUFBQTtBQUFBLEVBQUEsY0FBQSxDQUFBLFFBQUEsRUFBQSxZQUFBLENBQUE7O0FBQUEsV0FBQSxRQUFBLEdBQUE7QUFBQSxXQUFBLFlBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxFQUFBLFNBQUEsS0FBQSxJQUFBO0FBQUE7O0FBQUEsU0FBQSxRQUFBO0FBQUEsQ0FBQSxDQUE4QixrQkFBOUIsTUFBOEIsRUFBOUIsQ0FBQTtBQU1BOzs7Ozs7OztBQUlBLElBQU0sS0FBTixHQUFBLGFBQUEsVUFBQSxhQUFBLEVBQUE7QUFBQSxFQUFBLGNBQUEsQ0FBQSxLQUFBLEVBQUEsYUFBQSxDQUFBOztBQUFBLFdBQUEsS0FBQSxHQUFBO0FBQUEsV0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxTQUFBLEtBQUEsSUFBQTtBQUFBOztBQUFBLFNBQUEsS0FBQTtBQUFBLENBQUEsQ0FBMkIsa0JBQTNCLE1BQTJCLEVBQTNCLENBQUE7QUFJQTs7Ozs7OztBQUdBLElBQU0sV0FBTixHQUFBLGFBQUEsVUFBQSxhQUFBLEVBQUE7QUFBQSxFQUFBLGNBQUEsQ0FBQSxXQUFBLEVBQUEsYUFBQSxDQUFBOztBQUFBLFdBQUEsV0FBQSxHQUFBO0FBQUEsV0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxTQUFBLEtBQUEsSUFBQTtBQUFBOztBQUFBLE1BQUEsTUFBQSxHQUFBLFdBQUEsQ0FBQSxTQUFBOztBQUFBLEVBQUEsTUFBQSxDQUFBLEdBQUEsR0FNRSxTQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQWdCO0FBQ2QsV0FBTyxLQUFBLE1BQUEsQ0FBQSxNQUFBLENBQW9CLFVBQUQsS0FBQyxFQUFEO0FBQUEsYUFBVyxLQUFLLENBQUwsSUFBQSxDQUFBLEtBQUEsS0FBOUIsSUFBbUI7QUFBbkIsS0FBQSxFQUFBLENBQUEsS0FBUCxJQUFBO0FBUEosR0FBQTs7QUFBQSxTQUFBLFdBQUE7QUFBQSxDQUFBLENBQWlDLGtCQUFqQyxNQUFpQyxFQUFqQyxDQUFBO0FBcUJBOzs7Ozs7OztBQUlBLElBQU0sVUFBTixHQUFBLGFBQUEsVUFBQSxhQUFBLEVBQUE7QUFBQSxFQUFBLGNBQUEsQ0FBQSxVQUFBLEVBQUEsYUFBQSxDQUFBOztBQUFBLFdBQUEsVUFBQSxHQUFBO0FBQUEsV0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxTQUFBLEtBQUEsSUFBQTtBQUFBOztBQUFBLEVBQUEsWUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBO0FBQUEsSUFBQSxHQUFBLEVBQUEsTUFBQTtBQUFBLElBQUEsR0FBQSxFQUFBLFNBQUEsR0FBQSxHQUNVO0FBQ04sVUFBSSxPQUFPLEdBQUcsS0FBQSxhQUFBLENBQUEsR0FBQSxDQUF3QixVQUFELENBQUMsRUFBRDtBQUFBLGVBQU8sQ0FBQyxDQUE3QyxlQUE0QyxFQUFQO0FBQXJDLE9BQWMsQ0FBZDtBQUVBLGFBQU8sV0FBQSxLQUFBLENBQ0wsSUFBQSxvQkFBQSxDQUFtQjtBQUNqQixRQUFBLEdBQUcsRUFBRSxtQkFBQSxLQUFBLENBQUEsT0FBQSxFQUF3QixLQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQURaLEtBQ1ksQ0FBeEIsQ0FEWTtBQUVqQixRQUFBLE9BQUEsRUFBQTtBQUZpQixPQUFuQixDQURLLENBQVA7QUFNRDtBQVZILEdBQUEsQ0FBQSxDQUFBOztBQUFBLFNBQUEsVUFBQTtBQUFBLENBQUEsQ0FBZ0Msa0JBQWhDLE1BQWdDLEVBQWhDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTb3VyY2VTbGljZSB9IGZyb20gJy4uLy4uL3NvdXJjZS9zbGljZSc7XG5pbXBvcnQgeyBTcGFuTGlzdCB9IGZyb20gJy4uLy4uL3NvdXJjZS9zcGFuLWxpc3QnO1xuaW1wb3J0IHsgQmxvY2tTeW1ib2xUYWJsZSwgUHJvZ3JhbVN5bWJvbFRhYmxlIH0gZnJvbSAnLi4vLi4vc3ltYm9sLXRhYmxlJztcbmltcG9ydCB7IEFyZ3MsIE5hbWVkQXJndW1lbnRzIH0gZnJvbSAnLi9hcmdzJztcbmltcG9ydCB0eXBlIHsgQ29tcG9uZW50QXJnLCBFbGVtZW50TW9kaWZpZXIsIEh0bWxPclNwbGF0QXR0ciB9IGZyb20gJy4vYXR0ci1ibG9jayc7XG5pbXBvcnQgdHlwZSB7IEdsaW1tZXJQYXJlbnROb2RlT3B0aW9ucyB9IGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgeyBCYXNlTm9kZUZpZWxkcywgbm9kZSB9IGZyb20gJy4vbm9kZSc7XG5cbi8qKlxuICogQ29ycmVzcG9uZHMgdG8gYW4gZW50aXJlIHRlbXBsYXRlLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGUgZXh0ZW5kcyBub2RlKCkuZmllbGRzPFxuICB7XG4gICAgdGFibGU6IFByb2dyYW1TeW1ib2xUYWJsZTtcbiAgfSAmIEdsaW1tZXJQYXJlbnROb2RlT3B0aW9uc1xuPigpIHt9XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIGJsb2NrLiBJbiBwcmluY2lwbGUgdGhpcyBjb3VsZCBiZSBtZXJnZWQgd2l0aCBgTmFtZWRCbG9ja2AsIGJlY2F1c2UgYWxsIGNhc2VzXG4gKiBpbnZvbHZpbmcgYmxvY2tzIGhhdmUgYXQgbGVhc3QgYSBub3Rpb25hbCBuYW1lLlxuICovXG5leHBvcnQgY2xhc3MgQmxvY2sgZXh0ZW5kcyBub2RlKCkuZmllbGRzPFxuICB7IHNjb3BlOiBCbG9ja1N5bWJvbFRhYmxlIH0gJiBHbGltbWVyUGFyZW50Tm9kZU9wdGlvbnNcbj4oKSB7fVxuXG4vKipcbiAqIENvcnJlc3BvbmRzIHRvIGEgY29sbGVjdGlvbiBvZiBuYW1lZCBibG9ja3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBOYW1lZEJsb2NrcyBleHRlbmRzIG5vZGUoKS5maWVsZHM8eyBibG9ja3M6IHJlYWRvbmx5IE5hbWVkQmxvY2tbXSB9PigpIHtcbiAgLyoqXG4gICAqIEdldCB0aGUgYE5hbWVkQmxvY2tgIGZvciBhIGdpdmVuIG5hbWUuXG4gICAqL1xuICBnZXQobmFtZTogJ2RlZmF1bHQnKTogTmFtZWRCbG9jaztcbiAgZ2V0KG5hbWU6IHN0cmluZyk6IE5hbWVkQmxvY2sgfCBudWxsO1xuICBnZXQobmFtZTogc3RyaW5nKTogTmFtZWRCbG9jayB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmJsb2Nrcy5maWx0ZXIoKGJsb2NrKSA9PiBibG9jay5uYW1lLmNoYXJzID09PSBuYW1lKVswXSB8fCBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmFtZWRCbG9ja0ZpZWxkcyBleHRlbmRzIEJhc2VOb2RlRmllbGRzIHtcbiAgbmFtZTogU291cmNlU2xpY2U7XG4gIGJsb2NrOiBCbG9jaztcblxuICAvLyB0aGVzZSBhcmUgbm90IGN1cnJlbnRseSBzdXBwb3J0ZWQsIGJ1dCBhcmUgaGVyZSBmb3IgZnV0dXJlIGV4cGFuc2lvblxuICBhdHRyczogcmVhZG9ubHkgSHRtbE9yU3BsYXRBdHRyW107XG4gIGNvbXBvbmVudEFyZ3M6IHJlYWRvbmx5IENvbXBvbmVudEFyZ1tdO1xuICBtb2RpZmllcnM6IHJlYWRvbmx5IEVsZW1lbnRNb2RpZmllcltdO1xufVxuXG4vKipcbiAqIENvcnJlc3BvbmRzIHRvIGEgc2luZ2xlIG5hbWVkIGJsb2NrLiBUaGlzIGlzIHVzZWQgZm9yIGFub255bW91cyBuYW1lZCBibG9ja3MgKGBkZWZhdWx0YCBhbmRcbiAqIGBlbHNlYCkuXG4gKi9cbmV4cG9ydCBjbGFzcyBOYW1lZEJsb2NrIGV4dGVuZHMgbm9kZSgpLmZpZWxkczxOYW1lZEJsb2NrRmllbGRzPigpIHtcbiAgZ2V0IGFyZ3MoKTogQXJncyB7XG4gICAgbGV0IGVudHJpZXMgPSB0aGlzLmNvbXBvbmVudEFyZ3MubWFwKChhKSA9PiBhLnRvTmFtZWRBcmd1bWVudCgpKTtcblxuICAgIHJldHVybiBBcmdzLm5hbWVkKFxuICAgICAgbmV3IE5hbWVkQXJndW1lbnRzKHtcbiAgICAgICAgbG9jOiBTcGFuTGlzdC5yYW5nZShlbnRyaWVzLCB0aGlzLm5hbWUubG9jLmNvbGxhcHNlKCdlbmQnKSksXG4gICAgICAgIGVudHJpZXMsXG4gICAgICB9KVxuICAgICk7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=