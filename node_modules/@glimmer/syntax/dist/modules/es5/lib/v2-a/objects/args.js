function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import { node } from './node';
/**
 * Corresponds to syntaxes with positional and named arguments:
 *
 * - SubExpression
 * - Invoking Append
 * - Invoking attributes
 * - InvokeBlock
 *
 * If `Args` is empty, the `SourceOffsets` for this node should be the collapsed position
 * immediately after the parent call node's `callee`.
 */

export var Args = /*#__PURE__*/function (_node$fields) {
  _inheritsLoose(Args, _node$fields);

  function Args() {
    return _node$fields.apply(this, arguments) || this;
  }

  Args.empty = function empty(loc) {
    return new Args({
      loc: loc,
      positional: PositionalArguments.empty(loc),
      named: NamedArguments.empty(loc)
    });
  };

  Args.named = function named(_named) {
    return new Args({
      loc: _named.loc,
      positional: PositionalArguments.empty(_named.loc.collapse('end')),
      named: _named
    });
  };

  var _proto = Args.prototype;

  _proto.nth = function nth(offset) {
    return this.positional.nth(offset);
  };

  _proto.get = function get(name) {
    return this.named.get(name);
  };

  _proto.isEmpty = function isEmpty() {
    return this.positional.isEmpty() && this.named.isEmpty();
  };

  return Args;
}(node().fields());
/**
 * Corresponds to positional arguments.
 *
 * If `PositionalArguments` is empty, the `SourceOffsets` for this node should be the collapsed
 * position immediately after the parent call node's `callee`.
 */

export var PositionalArguments = /*#__PURE__*/function (_node$fields2) {
  _inheritsLoose(PositionalArguments, _node$fields2);

  function PositionalArguments() {
    return _node$fields2.apply(this, arguments) || this;
  }

  PositionalArguments.empty = function empty(loc) {
    return new PositionalArguments({
      loc: loc,
      exprs: []
    });
  };

  var _proto2 = PositionalArguments.prototype;

  _proto2.nth = function nth(offset) {
    return this.exprs[offset] || null;
  };

  _proto2.isEmpty = function isEmpty() {
    return this.exprs.length === 0;
  };

  _createClass(PositionalArguments, [{
    key: "size",
    get: function get() {
      return this.exprs.length;
    }
  }]);

  return PositionalArguments;
}(node().fields());
/**
 * Corresponds to named arguments.
 *
 * If `PositionalArguments` and `NamedArguments` are empty, the `SourceOffsets` for this node should
 * be the same as the `Args` node that contains this node.
 *
 * If `PositionalArguments` is not empty but `NamedArguments` is empty, the `SourceOffsets` for this
 * node should be the collapsed position immediately after the last positional argument.
 */

export var NamedArguments = /*#__PURE__*/function (_node$fields3) {
  _inheritsLoose(NamedArguments, _node$fields3);

  function NamedArguments() {
    return _node$fields3.apply(this, arguments) || this;
  }

  NamedArguments.empty = function empty(loc) {
    return new NamedArguments({
      loc: loc,
      entries: []
    });
  };

  var _proto3 = NamedArguments.prototype;

  _proto3.get = function get(name) {
    var entry = this.entries.filter(function (e) {
      return e.name.chars === name;
    })[0];
    return entry ? entry.value : null;
  };

  _proto3.isEmpty = function isEmpty() {
    return this.entries.length === 0;
  };

  _createClass(NamedArguments, [{
    key: "size",
    get: function get() {
      return this.entries.length;
    }
  }]);

  return NamedArguments;
}(node().fields());
/**
 * Corresponds to a single named argument.
 *
 * ```hbs
 * x=<expr>
 * ```
 */

export var NamedArgument = function NamedArgument(options) {
  this.loc = options.name.loc.extend(options.value.loc);
  this.name = options.name;
  this.value = options.value;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9vYmplY3RzL2FyZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBR0EsU0FBQSxJQUFBLFFBQUEsUUFBQTtBQUVBOzs7Ozs7Ozs7Ozs7QUFXQSxXQUFNLElBQU47QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUEsT0FJRSxLQUpGLEdBSUUsZUFBQSxHQUFBLEVBQTRCO0FBQzFCLFdBQU8sSUFBQSxJQUFBLENBQVM7QUFDZCxNQUFBLEdBRGMsRUFDZCxHQURjO0FBRWQsTUFBQSxVQUFVLEVBQUUsbUJBQW1CLENBQW5CLEtBQUEsQ0FGRSxHQUVGLENBRkU7QUFHZCxNQUFBLEtBQUssRUFBRSxjQUFjLENBQWQsS0FBQSxDQUFBLEdBQUE7QUFITyxLQUFULENBQVA7QUFLRCxHQVZIOztBQUFBLE9BWUUsS0FaRixHQVlFLGVBQUEsTUFBQSxFQUFrQztBQUNoQyxXQUFPLElBQUEsSUFBQSxDQUFTO0FBQ2QsTUFBQSxHQUFHLEVBQUUsTUFBSyxDQURJLEdBQUE7QUFFZCxNQUFBLFVBQVUsRUFBRSxtQkFBbUIsQ0FBbkIsS0FBQSxDQUEwQixNQUFLLENBQUwsR0FBQSxDQUFBLFFBQUEsQ0FGeEIsS0FFd0IsQ0FBMUIsQ0FGRTtBQUdkLE1BQUEsS0FBQSxFQUFBO0FBSGMsS0FBVCxDQUFQO0FBS0QsR0FsQkg7O0FBQUE7O0FBQUEsU0FvQkUsR0FwQkYsR0FvQkUsYUFBRyxNQUFILEVBQWtCO0FBQ2hCLFdBQU8sS0FBQSxVQUFBLENBQUEsR0FBQSxDQUFQLE1BQU8sQ0FBUDtBQUNELEdBdEJIOztBQUFBLFNBd0JFLEdBeEJGLEdBd0JFLGFBQUcsSUFBSCxFQUFnQjtBQUNkLFdBQU8sS0FBQSxLQUFBLENBQUEsR0FBQSxDQUFQLElBQU8sQ0FBUDtBQUNELEdBMUJIOztBQUFBLFNBNEJFLE9BNUJGLEdBNEJFLG1CQUFPO0FBQ0wsV0FBTyxLQUFBLFVBQUEsQ0FBQSxPQUFBLE1BQTZCLEtBQUEsS0FBQSxDQUFwQyxPQUFvQyxFQUFwQztBQUNELEdBOUJIOztBQUFBO0FBQUEsRUFBMEIsSUFBSSxHQUF4QixNQUFvQixFQUExQjtBQWlDQTs7Ozs7OztBQU1BLFdBQU0sbUJBQU47QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUEsc0JBR0UsS0FIRixHQUdFLGVBQUEsR0FBQSxFQUE0QjtBQUMxQixXQUFPLElBQUEsbUJBQUEsQ0FBd0I7QUFDN0IsTUFBQSxHQUQ2QixFQUM3QixHQUQ2QjtBQUU3QixNQUFBLEtBQUssRUFBRTtBQUZzQixLQUF4QixDQUFQO0FBSUQsR0FSSDs7QUFBQTs7QUFBQSxVQWNFLEdBZEYsR0FjRSxhQUFHLE1BQUgsRUFBa0I7QUFDaEIsV0FBTyxLQUFBLEtBQUEsQ0FBQSxNQUFBLEtBQVAsSUFBQTtBQUNELEdBaEJIOztBQUFBLFVBa0JFLE9BbEJGLEdBa0JFLG1CQUFPO0FBQ0wsV0FBTyxLQUFBLEtBQUEsQ0FBQSxNQUFBLEtBQVAsQ0FBQTtBQUNELEdBcEJIOztBQUFBO0FBQUE7QUFBQSx3QkFVVTtBQUNOLGFBQU8sS0FBQSxLQUFBLENBQVAsTUFBQTtBQUNEO0FBWkg7O0FBQUE7QUFBQSxFQUF5QyxJQUFJLEdBQXZDLE1BQW1DLEVBQXpDO0FBdUJBOzs7Ozs7Ozs7O0FBU0EsV0FBTSxjQUFOO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBLGlCQUdFLEtBSEYsR0FHRSxlQUFBLEdBQUEsRUFBNEI7QUFDMUIsV0FBTyxJQUFBLGNBQUEsQ0FBbUI7QUFDeEIsTUFBQSxHQUR3QixFQUN4QixHQUR3QjtBQUV4QixNQUFBLE9BQU8sRUFBRTtBQUZlLEtBQW5CLENBQVA7QUFJRCxHQVJIOztBQUFBOztBQUFBLFVBY0UsR0FkRixHQWNFLGFBQUcsSUFBSCxFQUFnQjtBQUNkLFFBQUksS0FBSyxHQUFHLEtBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBcUIsVUFBQSxDQUFEO0FBQUEsYUFBTyxDQUFDLENBQUQsSUFBQSxDQUFBLEtBQUEsS0FBM0IsSUFBb0I7QUFBQSxLQUFwQixFQUFaLENBQVksQ0FBWjtBQUVBLFdBQU8sS0FBSyxHQUFHLEtBQUssQ0FBUixLQUFBLEdBQVosSUFBQTtBQUNELEdBbEJIOztBQUFBLFVBb0JFLE9BcEJGLEdBb0JFLG1CQUFPO0FBQ0wsV0FBTyxLQUFBLE9BQUEsQ0FBQSxNQUFBLEtBQVAsQ0FBQTtBQUNELEdBdEJIOztBQUFBO0FBQUE7QUFBQSx3QkFVVTtBQUNOLGFBQU8sS0FBQSxPQUFBLENBQVAsTUFBQTtBQUNEO0FBWkg7O0FBQUE7QUFBQSxFQUFvQyxJQUFJLEdBQWxDLE1BQThCLEVBQXBDO0FBeUJBOzs7Ozs7OztBQU9BLFdBQU0sYUFBTixHQUtFLHVCQUFBLE9BQUEsRUFBaUU7QUFDL0QsT0FBQSxHQUFBLEdBQVcsT0FBTyxDQUFQLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUF3QixPQUFPLENBQVAsS0FBQSxDQUFuQyxHQUFXLENBQVg7QUFDQSxPQUFBLElBQUEsR0FBWSxPQUFPLENBQW5CLElBQUE7QUFDQSxPQUFBLEtBQUEsR0FBYSxPQUFPLENBQXBCLEtBQUE7QUFDRCxDQVRIIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU291cmNlU2xpY2UgfSBmcm9tICcuLi8uLi9zb3VyY2Uvc2xpY2UnO1xuaW1wb3J0IHsgU291cmNlU3BhbiB9IGZyb20gJy4uLy4uL3NvdXJjZS9zcGFuJztcbmltcG9ydCB0eXBlIHsgRXhwcmVzc2lvbk5vZGUgfSBmcm9tICcuL2V4cHInO1xuaW1wb3J0IHsgbm9kZSB9IGZyb20gJy4vbm9kZSc7XG5cbi8qKlxuICogQ29ycmVzcG9uZHMgdG8gc3ludGF4ZXMgd2l0aCBwb3NpdGlvbmFsIGFuZCBuYW1lZCBhcmd1bWVudHM6XG4gKlxuICogLSBTdWJFeHByZXNzaW9uXG4gKiAtIEludm9raW5nIEFwcGVuZFxuICogLSBJbnZva2luZyBhdHRyaWJ1dGVzXG4gKiAtIEludm9rZUJsb2NrXG4gKlxuICogSWYgYEFyZ3NgIGlzIGVtcHR5LCB0aGUgYFNvdXJjZU9mZnNldHNgIGZvciB0aGlzIG5vZGUgc2hvdWxkIGJlIHRoZSBjb2xsYXBzZWQgcG9zaXRpb25cbiAqIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBwYXJlbnQgY2FsbCBub2RlJ3MgYGNhbGxlZWAuXG4gKi9cbmV4cG9ydCBjbGFzcyBBcmdzIGV4dGVuZHMgbm9kZSgpLmZpZWxkczx7XG4gIHBvc2l0aW9uYWw6IFBvc2l0aW9uYWxBcmd1bWVudHM7XG4gIG5hbWVkOiBOYW1lZEFyZ3VtZW50cztcbn0+KCkge1xuICBzdGF0aWMgZW1wdHkobG9jOiBTb3VyY2VTcGFuKTogQXJncyB7XG4gICAgcmV0dXJuIG5ldyBBcmdzKHtcbiAgICAgIGxvYyxcbiAgICAgIHBvc2l0aW9uYWw6IFBvc2l0aW9uYWxBcmd1bWVudHMuZW1wdHkobG9jKSxcbiAgICAgIG5hbWVkOiBOYW1lZEFyZ3VtZW50cy5lbXB0eShsb2MpLFxuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIG5hbWVkKG5hbWVkOiBOYW1lZEFyZ3VtZW50cyk6IEFyZ3Mge1xuICAgIHJldHVybiBuZXcgQXJncyh7XG4gICAgICBsb2M6IG5hbWVkLmxvYyxcbiAgICAgIHBvc2l0aW9uYWw6IFBvc2l0aW9uYWxBcmd1bWVudHMuZW1wdHkobmFtZWQubG9jLmNvbGxhcHNlKCdlbmQnKSksXG4gICAgICBuYW1lZCxcbiAgICB9KTtcbiAgfVxuXG4gIG50aChvZmZzZXQ6IG51bWJlcik6IEV4cHJlc3Npb25Ob2RlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb25hbC5udGgob2Zmc2V0KTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBFeHByZXNzaW9uTm9kZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLm5hbWVkLmdldChuYW1lKTtcbiAgfVxuXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb25hbC5pc0VtcHR5KCkgJiYgdGhpcy5uYW1lZC5pc0VtcHR5KCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBwb3NpdGlvbmFsIGFyZ3VtZW50cy5cbiAqXG4gKiBJZiBgUG9zaXRpb25hbEFyZ3VtZW50c2AgaXMgZW1wdHksIHRoZSBgU291cmNlT2Zmc2V0c2AgZm9yIHRoaXMgbm9kZSBzaG91bGQgYmUgdGhlIGNvbGxhcHNlZFxuICogcG9zaXRpb24gaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHBhcmVudCBjYWxsIG5vZGUncyBgY2FsbGVlYC5cbiAqL1xuZXhwb3J0IGNsYXNzIFBvc2l0aW9uYWxBcmd1bWVudHMgZXh0ZW5kcyBub2RlKCkuZmllbGRzPHtcbiAgZXhwcnM6IHJlYWRvbmx5IEV4cHJlc3Npb25Ob2RlW107XG59PigpIHtcbiAgc3RhdGljIGVtcHR5KGxvYzogU291cmNlU3Bhbik6IFBvc2l0aW9uYWxBcmd1bWVudHMge1xuICAgIHJldHVybiBuZXcgUG9zaXRpb25hbEFyZ3VtZW50cyh7XG4gICAgICBsb2MsXG4gICAgICBleHByczogW10sXG4gICAgfSk7XG4gIH1cblxuICBnZXQgc2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmV4cHJzLmxlbmd0aDtcbiAgfVxuXG4gIG50aChvZmZzZXQ6IG51bWJlcik6IEV4cHJlc3Npb25Ob2RlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuZXhwcnNbb2Zmc2V0XSB8fCBudWxsO1xuICB9XG5cbiAgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5leHBycy5sZW5ndGggPT09IDA7XG4gIH1cbn1cblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBuYW1lZCBhcmd1bWVudHMuXG4gKlxuICogSWYgYFBvc2l0aW9uYWxBcmd1bWVudHNgIGFuZCBgTmFtZWRBcmd1bWVudHNgIGFyZSBlbXB0eSwgdGhlIGBTb3VyY2VPZmZzZXRzYCBmb3IgdGhpcyBub2RlIHNob3VsZFxuICogYmUgdGhlIHNhbWUgYXMgdGhlIGBBcmdzYCBub2RlIHRoYXQgY29udGFpbnMgdGhpcyBub2RlLlxuICpcbiAqIElmIGBQb3NpdGlvbmFsQXJndW1lbnRzYCBpcyBub3QgZW1wdHkgYnV0IGBOYW1lZEFyZ3VtZW50c2AgaXMgZW1wdHksIHRoZSBgU291cmNlT2Zmc2V0c2AgZm9yIHRoaXNcbiAqIG5vZGUgc2hvdWxkIGJlIHRoZSBjb2xsYXBzZWQgcG9zaXRpb24gaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGxhc3QgcG9zaXRpb25hbCBhcmd1bWVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIE5hbWVkQXJndW1lbnRzIGV4dGVuZHMgbm9kZSgpLmZpZWxkczx7XG4gIGVudHJpZXM6IHJlYWRvbmx5IE5hbWVkQXJndW1lbnRbXTtcbn0+KCkge1xuICBzdGF0aWMgZW1wdHkobG9jOiBTb3VyY2VTcGFuKTogTmFtZWRBcmd1bWVudHMge1xuICAgIHJldHVybiBuZXcgTmFtZWRBcmd1bWVudHMoe1xuICAgICAgbG9jLFxuICAgICAgZW50cmllczogW10sXG4gICAgfSk7XG4gIH1cblxuICBnZXQgc2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXMubGVuZ3RoO1xuICB9XG5cbiAgZ2V0KG5hbWU6IHN0cmluZyk6IEV4cHJlc3Npb25Ob2RlIHwgbnVsbCB7XG4gICAgbGV0IGVudHJ5ID0gdGhpcy5lbnRyaWVzLmZpbHRlcigoZSkgPT4gZS5uYW1lLmNoYXJzID09PSBuYW1lKVswXTtcblxuICAgIHJldHVybiBlbnRyeSA/IGVudHJ5LnZhbHVlIDogbnVsbDtcbiAgfVxuXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllcy5sZW5ndGggPT09IDA7XG4gIH1cbn1cblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBhIHNpbmdsZSBuYW1lZCBhcmd1bWVudC5cbiAqXG4gKiBgYGBoYnNcbiAqIHg9PGV4cHI+XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIE5hbWVkQXJndW1lbnQge1xuICByZWFkb25seSBsb2M6IFNvdXJjZVNwYW47XG4gIHJlYWRvbmx5IG5hbWU6IFNvdXJjZVNsaWNlO1xuICByZWFkb25seSB2YWx1ZTogRXhwcmVzc2lvbk5vZGU7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogeyBuYW1lOiBTb3VyY2VTbGljZTsgdmFsdWU6IEV4cHJlc3Npb25Ob2RlIH0pIHtcbiAgICB0aGlzLmxvYyA9IG9wdGlvbnMubmFtZS5sb2MuZXh0ZW5kKG9wdGlvbnMudmFsdWUubG9jKTtcbiAgICB0aGlzLm5hbWUgPSBvcHRpb25zLm5hbWU7XG4gICAgdGhpcy52YWx1ZSA9IG9wdGlvbnMudmFsdWU7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=