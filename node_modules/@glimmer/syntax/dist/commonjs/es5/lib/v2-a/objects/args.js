"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NamedArgument = exports.NamedArguments = exports.PositionalArguments = exports.Args = void 0;

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
var Args = /*#__PURE__*/function (_node$fields) {
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
}((0, _node.node)().fields());
/**
 * Corresponds to positional arguments.
 *
 * If `PositionalArguments` is empty, the `SourceOffsets` for this node should be the collapsed
 * position immediately after the parent call node's `callee`.
 */


exports.Args = Args;

var PositionalArguments = /*#__PURE__*/function (_node$fields2) {
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
}((0, _node.node)().fields());
/**
 * Corresponds to named arguments.
 *
 * If `PositionalArguments` and `NamedArguments` are empty, the `SourceOffsets` for this node should
 * be the same as the `Args` node that contains this node.
 *
 * If `PositionalArguments` is not empty but `NamedArguments` is empty, the `SourceOffsets` for this
 * node should be the collapsed position immediately after the last positional argument.
 */


exports.PositionalArguments = PositionalArguments;

var NamedArguments = /*#__PURE__*/function (_node$fields3) {
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
}((0, _node.node)().fields());
/**
 * Corresponds to a single named argument.
 *
 * ```hbs
 * x=<expr>
 * ```
 */


exports.NamedArguments = NamedArguments;

var NamedArgument = function NamedArgument(options) {
  this.loc = options.name.loc.extend(options.value.loc);
  this.name = options.name;
  this.value = options.value;
};

exports.NamedArgument = NamedArgument;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9vYmplY3RzL2FyZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUdBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLElBQU4sR0FBQSxhQUFBLFVBQUEsWUFBQSxFQUFBO0FBQUEsRUFBQSxjQUFBLENBQUEsSUFBQSxFQUFBLFlBQUEsQ0FBQTs7QUFBQSxXQUFBLElBQUEsR0FBQTtBQUFBLFdBQUEsWUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUEsU0FBQSxLQUFBLElBQUE7QUFBQTs7QUFBQSxFQUFBLElBQUEsQ0FBQSxLQUFBLEdBSUUsU0FBQSxLQUFBLENBQUEsR0FBQSxFQUE0QjtBQUMxQixXQUFPLElBQUEsSUFBQSxDQUFTO0FBQ2QsTUFBQSxHQURjLEVBQUEsR0FBQTtBQUVkLE1BQUEsVUFBVSxFQUFFLG1CQUFtQixDQUFuQixLQUFBLENBRkUsR0FFRixDQUZFO0FBR2QsTUFBQSxLQUFLLEVBQUUsY0FBYyxDQUFkLEtBQUEsQ0FBQSxHQUFBO0FBSE8sS0FBVCxDQUFQO0FBTEosR0FBQTs7QUFBQSxFQUFBLElBQUEsQ0FBQSxLQUFBLEdBWUUsU0FBQSxLQUFBLENBQUEsTUFBQSxFQUFrQztBQUNoQyxXQUFPLElBQUEsSUFBQSxDQUFTO0FBQ2QsTUFBQSxHQUFHLEVBQUUsTUFBSyxDQURJLEdBQUE7QUFFZCxNQUFBLFVBQVUsRUFBRSxtQkFBbUIsQ0FBbkIsS0FBQSxDQUEwQixNQUFLLENBQUwsR0FBQSxDQUFBLFFBQUEsQ0FGeEIsS0FFd0IsQ0FBMUIsQ0FGRTtBQUdkLE1BQUEsS0FBQSxFQUFBO0FBSGMsS0FBVCxDQUFQO0FBYkosR0FBQTs7QUFBQSxNQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsU0FBQTs7QUFBQSxFQUFBLE1BQUEsQ0FBQSxHQUFBLEdBb0JFLFNBQUEsR0FBQSxDQUFBLE1B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RSxTQUFBLE9BQUEsR0FBTztBQUNMLFdBQU8sS0FBQSxPQUFBLENBQUEsTUFBQSxLQUFQLENBQUE7QUFyQkosR0FBQTs7QUFBQSxFQUFBLFlBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQTtBQUFBLElBQUEsR0FBQSxFQUFBLE1BQUE7QUFBQSxJQUFBLEdBQUEsRUFBQSxTQUFBLEdBQUEsR0FVVTtBQUNOLGFBQU8sS0FBQSxPQUFBLENBQVAsTUFBQTtBQUNEO0FBWkgsR0FBQSxDQUFBLENBQUE7O0FBQUEsU0FBQSxjQUFBO0FBQUEsQ0FBQSxDQUFvQyxrQkFBcEMsTUFBb0MsRUFBcEMsQ0FBQTtBQXlCQTs7Ozs7Ozs7Ozs7QUFPQSxJQUFNLGFBQU4sR0FLRSxTQUFBLGFBQUEsQ0FBQSxPQUFBLEVBQWlFO0FBQy9ELE9BQUEsR0FBQSxHQUFXLE9BQU8sQ0FBUCxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBd0IsT0FBTyxDQUFQLEtBQUEsQ0FBbkMsR0FBVyxDQUFYO0FBQ0EsT0FBQSxJQUFBLEdBQVksT0FBTyxDQUFuQixJQUFBO0FBQ0EsT0FBQSxLQUFBLEdBQWEsT0FBTyxDQUFwQixLQUFBO0FBUkosQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNvdXJjZVNsaWNlIH0gZnJvbSAnLi4vLi4vc291cmNlL3NsaWNlJztcbmltcG9ydCB7IFNvdXJjZVNwYW4gfSBmcm9tICcuLi8uLi9zb3VyY2Uvc3Bhbic7XG5pbXBvcnQgdHlwZSB7IEV4cHJlc3Npb25Ob2RlIH0gZnJvbSAnLi9leHByJztcbmltcG9ydCB7IG5vZGUgfSBmcm9tICcuL25vZGUnO1xuXG4vKipcbiAqIENvcnJlc3BvbmRzIHRvIHN5bnRheGVzIHdpdGggcG9zaXRpb25hbCBhbmQgbmFtZWQgYXJndW1lbnRzOlxuICpcbiAqIC0gU3ViRXhwcmVzc2lvblxuICogLSBJbnZva2luZyBBcHBlbmRcbiAqIC0gSW52b2tpbmcgYXR0cmlidXRlc1xuICogLSBJbnZva2VCbG9ja1xuICpcbiAqIElmIGBBcmdzYCBpcyBlbXB0eSwgdGhlIGBTb3VyY2VPZmZzZXRzYCBmb3IgdGhpcyBub2RlIHNob3VsZCBiZSB0aGUgY29sbGFwc2VkIHBvc2l0aW9uXG4gKiBpbW1lZGlhdGVseSBhZnRlciB0aGUgcGFyZW50IGNhbGwgbm9kZSdzIGBjYWxsZWVgLlxuICovXG5leHBvcnQgY2xhc3MgQXJncyBleHRlbmRzIG5vZGUoKS5maWVsZHM8e1xuICBwb3NpdGlvbmFsOiBQb3NpdGlvbmFsQXJndW1lbnRzO1xuICBuYW1lZDogTmFtZWRBcmd1bWVudHM7XG59PigpIHtcbiAgc3RhdGljIGVtcHR5KGxvYzogU291cmNlU3Bhbik6IEFyZ3Mge1xuICAgIHJldHVybiBuZXcgQXJncyh7XG4gICAgICBsb2MsXG4gICAgICBwb3NpdGlvbmFsOiBQb3NpdGlvbmFsQXJndW1lbnRzLmVtcHR5KGxvYyksXG4gICAgICBuYW1lZDogTmFtZWRBcmd1bWVudHMuZW1wdHkobG9jKSxcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBuYW1lZChuYW1lZDogTmFtZWRBcmd1bWVudHMpOiBBcmdzIHtcbiAgICByZXR1cm4gbmV3IEFyZ3Moe1xuICAgICAgbG9jOiBuYW1lZC5sb2MsXG4gICAgICBwb3NpdGlvbmFsOiBQb3NpdGlvbmFsQXJndW1lbnRzLmVtcHR5KG5hbWVkLmxvYy5jb2xsYXBzZSgnZW5kJykpLFxuICAgICAgbmFtZWQsXG4gICAgfSk7XG4gIH1cblxuICBudGgob2Zmc2V0OiBudW1iZXIpOiBFeHByZXNzaW9uTm9kZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uYWwubnRoKG9mZnNldCk7XG4gIH1cblxuICBnZXQobmFtZTogc3RyaW5nKTogRXhwcmVzc2lvbk5vZGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lZC5nZXQobmFtZSk7XG4gIH1cblxuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uYWwuaXNFbXB0eSgpICYmIHRoaXMubmFtZWQuaXNFbXB0eSgpO1xuICB9XG59XG5cbi8qKlxuICogQ29ycmVzcG9uZHMgdG8gcG9zaXRpb25hbCBhcmd1bWVudHMuXG4gKlxuICogSWYgYFBvc2l0aW9uYWxBcmd1bWVudHNgIGlzIGVtcHR5LCB0aGUgYFNvdXJjZU9mZnNldHNgIGZvciB0aGlzIG5vZGUgc2hvdWxkIGJlIHRoZSBjb2xsYXBzZWRcbiAqIHBvc2l0aW9uIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBwYXJlbnQgY2FsbCBub2RlJ3MgYGNhbGxlZWAuXG4gKi9cbmV4cG9ydCBjbGFzcyBQb3NpdGlvbmFsQXJndW1lbnRzIGV4dGVuZHMgbm9kZSgpLmZpZWxkczx7XG4gIGV4cHJzOiByZWFkb25seSBFeHByZXNzaW9uTm9kZVtdO1xufT4oKSB7XG4gIHN0YXRpYyBlbXB0eShsb2M6IFNvdXJjZVNwYW4pOiBQb3NpdGlvbmFsQXJndW1lbnRzIHtcbiAgICByZXR1cm4gbmV3IFBvc2l0aW9uYWxBcmd1bWVudHMoe1xuICAgICAgbG9jLFxuICAgICAgZXhwcnM6IFtdLFxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IHNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5leHBycy5sZW5ndGg7XG4gIH1cblxuICBudGgob2Zmc2V0OiBudW1iZXIpOiBFeHByZXNzaW9uTm9kZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmV4cHJzW29mZnNldF0gfHwgbnVsbDtcbiAgfVxuXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZXhwcnMubGVuZ3RoID09PSAwO1xuICB9XG59XG5cbi8qKlxuICogQ29ycmVzcG9uZHMgdG8gbmFtZWQgYXJndW1lbnRzLlxuICpcbiAqIElmIGBQb3NpdGlvbmFsQXJndW1lbnRzYCBhbmQgYE5hbWVkQXJndW1lbnRzYCBhcmUgZW1wdHksIHRoZSBgU291cmNlT2Zmc2V0c2AgZm9yIHRoaXMgbm9kZSBzaG91bGRcbiAqIGJlIHRoZSBzYW1lIGFzIHRoZSBgQXJnc2Agbm9kZSB0aGF0IGNvbnRhaW5zIHRoaXMgbm9kZS5cbiAqXG4gKiBJZiBgUG9zaXRpb25hbEFyZ3VtZW50c2AgaXMgbm90IGVtcHR5IGJ1dCBgTmFtZWRBcmd1bWVudHNgIGlzIGVtcHR5LCB0aGUgYFNvdXJjZU9mZnNldHNgIGZvciB0aGlzXG4gKiBub2RlIHNob3VsZCBiZSB0aGUgY29sbGFwc2VkIHBvc2l0aW9uIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBsYXN0IHBvc2l0aW9uYWwgYXJndW1lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBOYW1lZEFyZ3VtZW50cyBleHRlbmRzIG5vZGUoKS5maWVsZHM8e1xuICBlbnRyaWVzOiByZWFkb25seSBOYW1lZEFyZ3VtZW50W107XG59PigpIHtcbiAgc3RhdGljIGVtcHR5KGxvYzogU291cmNlU3Bhbik6IE5hbWVkQXJndW1lbnRzIHtcbiAgICByZXR1cm4gbmV3IE5hbWVkQXJndW1lbnRzKHtcbiAgICAgIGxvYyxcbiAgICAgIGVudHJpZXM6IFtdLFxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IHNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzLmxlbmd0aDtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBFeHByZXNzaW9uTm9kZSB8IG51bGwge1xuICAgIGxldCBlbnRyeSA9IHRoaXMuZW50cmllcy5maWx0ZXIoKGUpID0+IGUubmFtZS5jaGFycyA9PT0gbmFtZSlbMF07XG5cbiAgICByZXR1cm4gZW50cnkgPyBlbnRyeS52YWx1ZSA6IG51bGw7XG4gIH1cblxuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXMubGVuZ3RoID09PSAwO1xuICB9XG59XG5cbi8qKlxuICogQ29ycmVzcG9uZHMgdG8gYSBzaW5nbGUgbmFtZWQgYXJndW1lbnQuXG4gKlxuICogYGBgaGJzXG4gKiB4PTxleHByPlxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBOYW1lZEFyZ3VtZW50IHtcbiAgcmVhZG9ubHkgbG9jOiBTb3VyY2VTcGFuO1xuICByZWFkb25seSBuYW1lOiBTb3VyY2VTbGljZTtcbiAgcmVhZG9ubHkgdmFsdWU6IEV4cHJlc3Npb25Ob2RlO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHsgbmFtZTogU291cmNlU2xpY2U7IHZhbHVlOiBFeHByZXNzaW9uTm9kZSB9KSB7XG4gICAgdGhpcy5sb2MgPSBvcHRpb25zLm5hbWUubG9jLmV4dGVuZChvcHRpb25zLnZhbHVlLmxvYyk7XG4gICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lO1xuICAgIHRoaXMudmFsdWUgPSBvcHRpb25zLnZhbHVlO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9