function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import { SpanList } from '../../source/span-list';
import { Args, NamedArguments } from './args';
import { node } from './node';
/**
 * Corresponds to an entire template.
 */

export var Template = /*#__PURE__*/function (_node$fields) {
  _inheritsLoose(Template, _node$fields);

  function Template() {
    return _node$fields.apply(this, arguments) || this;
  }

  return Template;
}(node().fields());
/**
 * Represents a block. In principle this could be merged with `NamedBlock`, because all cases
 * involving blocks have at least a notional name.
 */

export var Block = /*#__PURE__*/function (_node$fields2) {
  _inheritsLoose(Block, _node$fields2);

  function Block() {
    return _node$fields2.apply(this, arguments) || this;
  }

  return Block;
}(node().fields());
/**
 * Corresponds to a collection of named blocks.
 */

export var NamedBlocks = /*#__PURE__*/function (_node$fields3) {
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
}(node().fields());
/**
 * Corresponds to a single named block. This is used for anonymous named blocks (`default` and
 * `else`).
 */

export var NamedBlock = /*#__PURE__*/function (_node$fields4) {
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
      return Args.named(new NamedArguments({
        loc: SpanList.range(entries, this.name.loc.collapse('end')),
        entries: entries
      }));
    }
  }]);

  return NamedBlock;
}(node().fields());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9vYmplY3RzL2ludGVybmFsLW5vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsU0FBQSxRQUFBLFFBQUEsd0JBQUE7QUFFQSxTQUFBLElBQUEsRUFBQSxjQUFBLFFBQUEsUUFBQTtBQUdBLFNBQUEsSUFBQSxRQUFBLFFBQUE7QUFFQTs7OztBQUdBLFdBQU0sUUFBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLEVBQThCLElBQUksR0FBNUIsTUFBd0IsRUFBOUI7QUFNQTs7Ozs7QUFJQSxXQUFNLEtBQU47QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxFQUEyQixJQUFJLEdBQXpCLE1BQXFCLEVBQTNCO0FBSUE7Ozs7QUFHQSxXQUFNLFdBQU47QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUEsU0FNRSxHQU5GLEdBTUUsYUFBRyxJQUFILEVBQWdCO0FBQ2QsV0FBTyxLQUFBLE1BQUEsQ0FBQSxNQUFBLENBQW9CLFVBQUEsS0FBRDtBQUFBLGFBQVcsS0FBSyxDQUFMLElBQUEsQ0FBQSxLQUFBLEtBQTlCLElBQW1CO0FBQUEsS0FBbkIsRUFBQSxDQUFBLEtBQVAsSUFBQTtBQUNELEdBUkg7O0FBQUE7QUFBQSxFQUFpQyxJQUFJLEdBQS9CLE1BQTJCLEVBQWpDO0FBcUJBOzs7OztBQUlBLFdBQU0sVUFBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsd0JBQ1U7QUFDTixVQUFJLE9BQU8sR0FBRyxLQUFBLGFBQUEsQ0FBQSxHQUFBLENBQXdCLFVBQUEsQ0FBRDtBQUFBLGVBQU8sQ0FBQyxDQUE3QyxlQUE0QyxFQUFQO0FBQUEsT0FBdkIsQ0FBZDtBQUVBLGFBQU8sSUFBSSxDQUFKLEtBQUEsQ0FDTCxJQUFBLGNBQUEsQ0FBbUI7QUFDakIsUUFBQSxHQUFHLEVBQUUsUUFBUSxDQUFSLEtBQUEsQ0FBQSxPQUFBLEVBQXdCLEtBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBRFosS0FDWSxDQUF4QixDQURZO0FBRWpCLFFBQUEsT0FBQSxFQUFBO0FBRmlCLE9BQW5CLENBREssQ0FBUDtBQU1EO0FBVkg7O0FBQUE7QUFBQSxFQUFnQyxJQUFJLEdBQTlCLE1BQTBCLEVBQWhDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU291cmNlU2xpY2UgfSBmcm9tICcuLi8uLi9zb3VyY2Uvc2xpY2UnO1xuaW1wb3J0IHsgU3Bhbkxpc3QgfSBmcm9tICcuLi8uLi9zb3VyY2Uvc3Bhbi1saXN0JztcbmltcG9ydCB7IEJsb2NrU3ltYm9sVGFibGUsIFByb2dyYW1TeW1ib2xUYWJsZSB9IGZyb20gJy4uLy4uL3N5bWJvbC10YWJsZSc7XG5pbXBvcnQgeyBBcmdzLCBOYW1lZEFyZ3VtZW50cyB9IGZyb20gJy4vYXJncyc7XG5pbXBvcnQgdHlwZSB7IENvbXBvbmVudEFyZywgRWxlbWVudE1vZGlmaWVyLCBIdG1sT3JTcGxhdEF0dHIgfSBmcm9tICcuL2F0dHItYmxvY2snO1xuaW1wb3J0IHR5cGUgeyBHbGltbWVyUGFyZW50Tm9kZU9wdGlvbnMgfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgQmFzZU5vZGVGaWVsZHMsIG5vZGUgfSBmcm9tICcuL25vZGUnO1xuXG4vKipcbiAqIENvcnJlc3BvbmRzIHRvIGFuIGVudGlyZSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlIGV4dGVuZHMgbm9kZSgpLmZpZWxkczxcbiAge1xuICAgIHRhYmxlOiBQcm9ncmFtU3ltYm9sVGFibGU7XG4gIH0gJiBHbGltbWVyUGFyZW50Tm9kZU9wdGlvbnNcbj4oKSB7fVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBibG9jay4gSW4gcHJpbmNpcGxlIHRoaXMgY291bGQgYmUgbWVyZ2VkIHdpdGggYE5hbWVkQmxvY2tgLCBiZWNhdXNlIGFsbCBjYXNlc1xuICogaW52b2x2aW5nIGJsb2NrcyBoYXZlIGF0IGxlYXN0IGEgbm90aW9uYWwgbmFtZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEJsb2NrIGV4dGVuZHMgbm9kZSgpLmZpZWxkczxcbiAgeyBzY29wZTogQmxvY2tTeW1ib2xUYWJsZSB9ICYgR2xpbW1lclBhcmVudE5vZGVPcHRpb25zXG4+KCkge31cblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBhIGNvbGxlY3Rpb24gb2YgbmFtZWQgYmxvY2tzLlxuICovXG5leHBvcnQgY2xhc3MgTmFtZWRCbG9ja3MgZXh0ZW5kcyBub2RlKCkuZmllbGRzPHsgYmxvY2tzOiByZWFkb25seSBOYW1lZEJsb2NrW10gfT4oKSB7XG4gIC8qKlxuICAgKiBHZXQgdGhlIGBOYW1lZEJsb2NrYCBmb3IgYSBnaXZlbiBuYW1lLlxuICAgKi9cbiAgZ2V0KG5hbWU6ICdkZWZhdWx0Jyk6IE5hbWVkQmxvY2s7XG4gIGdldChuYW1lOiBzdHJpbmcpOiBOYW1lZEJsb2NrIHwgbnVsbDtcbiAgZ2V0KG5hbWU6IHN0cmluZyk6IE5hbWVkQmxvY2sgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja3MuZmlsdGVyKChibG9jaykgPT4gYmxvY2submFtZS5jaGFycyA9PT0gbmFtZSlbMF0gfHwgbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5hbWVkQmxvY2tGaWVsZHMgZXh0ZW5kcyBCYXNlTm9kZUZpZWxkcyB7XG4gIG5hbWU6IFNvdXJjZVNsaWNlO1xuICBibG9jazogQmxvY2s7XG5cbiAgLy8gdGhlc2UgYXJlIG5vdCBjdXJyZW50bHkgc3VwcG9ydGVkLCBidXQgYXJlIGhlcmUgZm9yIGZ1dHVyZSBleHBhbnNpb25cbiAgYXR0cnM6IHJlYWRvbmx5IEh0bWxPclNwbGF0QXR0cltdO1xuICBjb21wb25lbnRBcmdzOiByZWFkb25seSBDb21wb25lbnRBcmdbXTtcbiAgbW9kaWZpZXJzOiByZWFkb25seSBFbGVtZW50TW9kaWZpZXJbXTtcbn1cblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBhIHNpbmdsZSBuYW1lZCBibG9jay4gVGhpcyBpcyB1c2VkIGZvciBhbm9ueW1vdXMgbmFtZWQgYmxvY2tzIChgZGVmYXVsdGAgYW5kXG4gKiBgZWxzZWApLlxuICovXG5leHBvcnQgY2xhc3MgTmFtZWRCbG9jayBleHRlbmRzIG5vZGUoKS5maWVsZHM8TmFtZWRCbG9ja0ZpZWxkcz4oKSB7XG4gIGdldCBhcmdzKCk6IEFyZ3Mge1xuICAgIGxldCBlbnRyaWVzID0gdGhpcy5jb21wb25lbnRBcmdzLm1hcCgoYSkgPT4gYS50b05hbWVkQXJndW1lbnQoKSk7XG5cbiAgICByZXR1cm4gQXJncy5uYW1lZChcbiAgICAgIG5ldyBOYW1lZEFyZ3VtZW50cyh7XG4gICAgICAgIGxvYzogU3Bhbkxpc3QucmFuZ2UoZW50cmllcywgdGhpcy5uYW1lLmxvYy5jb2xsYXBzZSgnZW5kJykpLFxuICAgICAgICBlbnRyaWVzLFxuICAgICAgfSlcbiAgICApO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9