"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SimpleElement = exports.InvokeComponent = exports.InvokeBlock = exports.AppendContent = exports.HtmlComment = exports.HtmlText = exports.GlimmerComment = void 0;

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

var GlimmerComment = /*#__PURE__*/function (_node$fields) {
  _inheritsLoose(GlimmerComment, _node$fields);

  function GlimmerComment() {
    return _node$fields.apply(this, arguments) || this;
  }

  return GlimmerComment;
}((0, _node.node)('GlimmerComment').fields());

exports.GlimmerComment = GlimmerComment;

var HtmlText = /*#__PURE__*/function (_node$fields2) {
  _inheritsLoose(HtmlText, _node$fields2);

  function HtmlText() {
    return _node$fields2.apply(this, arguments) || this;
  }

  return HtmlText;
}((0, _node.node)('HtmlText').fields());

exports.HtmlText = HtmlText;

var HtmlComment = /*#__PURE__*/function (_node$fields3) {
  _inheritsLoose(HtmlComment, _node$fields3);

  function HtmlComment() {
    return _node$fields3.apply(this, arguments) || this;
  }

  return HtmlComment;
}((0, _node.node)('HtmlComment').fields());

exports.HtmlComment = HtmlComment;

var AppendContent = /*#__PURE__*/function (_node$fields4) {
  _inheritsLoose(AppendContent, _node$fields4);

  function AppendContent() {
    return _node$fields4.apply(this, arguments) || this;
  }

  _createClass(AppendContent, [{
    key: "callee",
    get: function get() {
      if (this.value.type === 'Call') {
        return this.value.callee;
      } else {
        return this.value;
      }
    }
  }, {
    key: "args",
    get: function get() {
      if (this.value.type === 'Call') {
        return this.value.args;
      } else {
        return _args.Args.empty(this.value.loc.collapse('end'));
      }
    }
  }]);

  return AppendContent;
}((0, _node.node)('AppendContent').fields());

exports.AppendContent = AppendContent;

var InvokeBlock = /*#__PURE__*/function (_node$fields5) {
  _inheritsLoose(InvokeBlock, _node$fields5);

  function InvokeBlock() {
    return _node$fields5.apply(this, arguments) || this;
  }

  return InvokeBlock;
}((0, _node.node)('InvokeBlock').fields());
/**
 * Corresponds to a component invocation. When the content of a component invocation contains no
 * named blocks, `blocks` contains a single named block named `"default"`. When a component
 * invocation is self-closing, `blocks` is empty.
 */


exports.InvokeBlock = InvokeBlock;

var InvokeComponent = /*#__PURE__*/function (_node$fields6) {
  _inheritsLoose(InvokeComponent, _node$fields6);

  function InvokeComponent() {
    return _node$fields6.apply(this, arguments) || this;
  }

  _createClass(InvokeComponent, [{
    key: "args",
    get: function get() {
      var entries = this.componentArgs.map(function (a) {
        return a.toNamedArgument();
      });
      return _args.Args.named(new _args.NamedArguments({
        loc: _spanList.SpanList.range(entries, this.callee.loc.collapse('end')),
        entries: entries
      }));
    }
  }]);

  return InvokeComponent;
}((0, _node.node)('InvokeComponent').fields());
/**
 * Corresponds to a simple HTML element. The AST allows component arguments and modifiers to support
 * future extensions.
 */


exports.InvokeComponent = InvokeComponent;

var SimpleElement = /*#__PURE__*/function (_node$fields7) {
  _inheritsLoose(SimpleElement, _node$fields7);

  function SimpleElement() {
    return _node$fields7.apply(this, arguments) || this;
  }

  _createClass(SimpleElement, [{
    key: "args",
    get: function get() {
      var entries = this.componentArgs.map(function (a) {
        return a.toNamedArgument();
      });
      return _args.Args.named(new _args.NamedArguments({
        loc: _spanList.SpanList.range(entries, this.tag.loc.collapse('end')),
        entries: entries
      }));
    }
  }]);

  return SimpleElement;
}((0, _node.node)('SimpleElement').fields());

exports.SimpleElement = SimpleElement;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9vYmplY3RzL2NvbnRlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUVBOztBQUtBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQkEsSUFBTSxjQUFOLEdBQUEsYUFBQSxVQUFBLFlBQUEsRUFBQTtBQUFBLEVBQUEsY0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBLENBQUE7O0FBQUEsV0FBQSxjQUFBLEdBQUE7QUFBQSxXQUFBLFlBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxFQUFBLFNBQUEsS0FBQSxJQUFBO0FBQUE7O0FBQUEsU0FBQSxjQUFBO0FBQUEsQ0FBQSxDQUFvQyxnQkFBQSxnQkFBQSxFQUFwQyxNQUFvQyxFQUFwQyxDQUFBOzs7O0FBQ0EsSUFBTSxRQUFOLEdBQUEsYUFBQSxVQUFBLGFBQUEsRUFBQTtBQUFBLEVBQUEsY0FBQSxDQUFBLFFBQUEsRUFBQSxhQUFBLENBQUE7O0FBQUEsV0FBQSxRQUFBLEdBQUE7QUFBQSxXQUFBLGFBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxFQUFBLFNBQUEsS0FBQSxJQUFBO0FBQUE7O0FBQUEsU0FBQSxRQUFBO0FBQUEsQ0FBQSxDQUE4QixnQkFBQSxVQUFBLEVBQTlCLE1BQThCLEVBQTlCLENBQUE7Ozs7QUFDQSxJQUFNLFdBQU4sR0FBQSxhQUFBLFVBQUEsYUFBQSxFQUFBO0FBQUEsRUFBQSxjQUFBLENBQUEsV0FBQSxFQUFBLGFBQUEsQ0FBQTs7QUFBQSxXQUFBLFdBQUEsR0FBQTtBQUFBLFdBQUEsYUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUEsU0FBQSxLQUFBLElBQUE7QUFBQTs7QUFBQSxTQUFBLFdBQUE7QUFBQSxDQUFBLENBQWlDLGdCQUFBLGFBQUEsRUFBakMsTUFBaUMsRUFBakMsQ0FBQTs7OztBQUVBLElBQU0sYUFBTixHQUFBLGFBQUEsVUFBQSxhQUFBLEVBQUE7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O0FBQUEsSUFBQSxHQUFBLEVBQUEsU0FBQSxHQUFBLEdBQ1U7QUFDTixVQUFJLE9BQU8sR0FBRyxLQUFBLGFBQUEsQ0FBQSxHQUFBLENBQXdCLFVBQUQsQ0FBQyxFQUFEO0FBQUEsZUFBTyxDQUFDLENBQTdDLGVBQTRDLEVBQVA7QUFBckMsT0FBYyxDQUFkO0FBRUEsYUFBTyxXQUFBLEtBQUEsQ0FDTCxJQUFBLG9CQUFBLENBQW1CO0FBQ2pCLFFBQUEsR0FBRyxFQUFFLG1CQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQXdCLEtBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBRFosS0FDWSxDQUF4QixDQURZO0FBRWpCLFFBQUEsT0FBQSxFQUFBO0FBRmlCLE9BQW5CLENBREssQ0FBUDtBQU1EO0FBVkgsR0FBQSxDQUFBLENBQUE7O0FBQUEsU0FBQSxhQUFBO0FBQUEsQ0FBQSxDQUFtQyxnQkFBQSxlQUFBLEVBQW5DLE1BQW1DLEVBQW5DLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTb3VyY2VTbGljZSB9IGZyb20gJy4uLy4uL3NvdXJjZS9zbGljZSc7XG5pbXBvcnQgeyBTcGFuTGlzdCB9IGZyb20gJy4uLy4uL3NvdXJjZS9zcGFuLWxpc3QnO1xuaW1wb3J0IHsgU3ltYm9sVGFibGUgfSBmcm9tICcuLi8uLi9zeW1ib2wtdGFibGUnO1xuaW1wb3J0IHsgQXJncywgTmFtZWRBcmd1bWVudHMgfSBmcm9tICcuL2FyZ3MnO1xuaW1wb3J0IHR5cGUgeyBDb21wb25lbnRBcmcsIEVsZW1lbnRNb2RpZmllciwgSHRtbE9yU3BsYXRBdHRyIH0gZnJvbSAnLi9hdHRyLWJsb2NrJztcbmltcG9ydCB0eXBlIHsgQ2FsbEZpZWxkcyB9IGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgdHlwZSB7IEV4cHJlc3Npb25Ob2RlIH0gZnJvbSAnLi9leHByJztcbmltcG9ydCB0eXBlIHsgTmFtZWRCbG9jaywgTmFtZWRCbG9ja3MgfSBmcm9tICcuL2ludGVybmFsLW5vZGUnO1xuaW1wb3J0IHsgQmFzZU5vZGVGaWVsZHMsIG5vZGUgfSBmcm9tICcuL25vZGUnO1xuXG4vKipcbiAqIENvbnRlbnQgTm9kZXMgYXJlIGFsbG93ZWQgaW4gY29udGVudCBwb3NpdGlvbnMgaW4gdGVtcGxhdGVzLiBUaGV5IGNvcnJlc3BvbmQgdG8gYmVoYXZpb3IgaW4gdGhlXG4gKiBbRGF0YV1bZGF0YV0gdG9rZW5pemF0aW9uIHN0YXRlIGluIEhUTUwuXG4gKlxuICogW2RhdGFdOiBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9wYXJzaW5nLmh0bWwjZGF0YS1zdGF0ZVxuICovXG5leHBvcnQgdHlwZSBDb250ZW50Tm9kZSA9XG4gIHwgSHRtbFRleHRcbiAgfCBIdG1sQ29tbWVudFxuICB8IEFwcGVuZENvbnRlbnRcbiAgfCBJbnZva2VCbG9ja1xuICB8IEludm9rZUNvbXBvbmVudFxuICB8IFNpbXBsZUVsZW1lbnRcbiAgfCBHbGltbWVyQ29tbWVudDtcblxuZXhwb3J0IGNsYXNzIEdsaW1tZXJDb21tZW50IGV4dGVuZHMgbm9kZSgnR2xpbW1lckNvbW1lbnQnKS5maWVsZHM8eyB0ZXh0OiBTb3VyY2VTbGljZSB9PigpIHt9XG5leHBvcnQgY2xhc3MgSHRtbFRleHQgZXh0ZW5kcyBub2RlKCdIdG1sVGV4dCcpLmZpZWxkczx7IGNoYXJzOiBzdHJpbmcgfT4oKSB7fVxuZXhwb3J0IGNsYXNzIEh0bWxDb21tZW50IGV4dGVuZHMgbm9kZSgnSHRtbENvbW1lbnQnKS5maWVsZHM8eyB0ZXh0OiBTb3VyY2VTbGljZSB9PigpIHt9XG5cbmV4cG9ydCBjbGFzcyBBcHBlbmRDb250ZW50IGV4dGVuZHMgbm9kZSgnQXBwZW5kQ29udGVudCcpLmZpZWxkczx7XG4gIHZhbHVlOiBFeHByZXNzaW9uTm9kZTtcbiAgdHJ1c3Rpbmc6IGJvb2xlYW47XG4gIHRhYmxlOiBTeW1ib2xUYWJsZTtcbn0+KCkge1xuICBnZXQgY2FsbGVlKCk6IEV4cHJlc3Npb25Ob2RlIHtcbiAgICBpZiAodGhpcy52YWx1ZS50eXBlID09PSAnQ2FsbCcpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlLmNhbGxlZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGFyZ3MoKTogQXJncyB7XG4gICAgaWYgKHRoaXMudmFsdWUudHlwZSA9PT0gJ0NhbGwnKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZS5hcmdzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gQXJncy5lbXB0eSh0aGlzLnZhbHVlLmxvYy5jb2xsYXBzZSgnZW5kJykpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW52b2tlQmxvY2sgZXh0ZW5kcyBub2RlKCdJbnZva2VCbG9jaycpLmZpZWxkczxcbiAgQ2FsbEZpZWxkcyAmIHsgYmxvY2tzOiBOYW1lZEJsb2NrcyB9XG4+KCkge31cblxuaW50ZXJmYWNlIEludm9rZUNvbXBvbmVudEZpZWxkcyB7XG4gIGNhbGxlZTogRXhwcmVzc2lvbk5vZGU7XG4gIGJsb2NrczogTmFtZWRCbG9ja3M7XG4gIGF0dHJzOiByZWFkb25seSBIdG1sT3JTcGxhdEF0dHJbXTtcbiAgY29tcG9uZW50QXJnczogcmVhZG9ubHkgQ29tcG9uZW50QXJnW107XG4gIG1vZGlmaWVyczogcmVhZG9ubHkgRWxlbWVudE1vZGlmaWVyW107XG59XG5cbi8qKlxuICogQ29ycmVzcG9uZHMgdG8gYSBjb21wb25lbnQgaW52b2NhdGlvbi4gV2hlbiB0aGUgY29udGVudCBvZiBhIGNvbXBvbmVudCBpbnZvY2F0aW9uIGNvbnRhaW5zIG5vXG4gKiBuYW1lZCBibG9ja3MsIGBibG9ja3NgIGNvbnRhaW5zIGEgc2luZ2xlIG5hbWVkIGJsb2NrIG5hbWVkIGBcImRlZmF1bHRcImAuIFdoZW4gYSBjb21wb25lbnRcbiAqIGludm9jYXRpb24gaXMgc2VsZi1jbG9zaW5nLCBgYmxvY2tzYCBpcyBlbXB0eS5cbiAqL1xuZXhwb3J0IGNsYXNzIEludm9rZUNvbXBvbmVudCBleHRlbmRzIG5vZGUoJ0ludm9rZUNvbXBvbmVudCcpLmZpZWxkczxJbnZva2VDb21wb25lbnRGaWVsZHM+KCkge1xuICBnZXQgYXJncygpOiBBcmdzIHtcbiAgICBsZXQgZW50cmllcyA9IHRoaXMuY29tcG9uZW50QXJncy5tYXAoKGEpID0+IGEudG9OYW1lZEFyZ3VtZW50KCkpO1xuXG4gICAgcmV0dXJuIEFyZ3MubmFtZWQoXG4gICAgICBuZXcgTmFtZWRBcmd1bWVudHMoe1xuICAgICAgICBsb2M6IFNwYW5MaXN0LnJhbmdlKGVudHJpZXMsIHRoaXMuY2FsbGVlLmxvYy5jb2xsYXBzZSgnZW5kJykpLFxuICAgICAgICBlbnRyaWVzLFxuICAgICAgfSlcbiAgICApO1xuICB9XG59XG5cbmludGVyZmFjZSBTaW1wbGVFbGVtZW50T3B0aW9ucyBleHRlbmRzIEJhc2VOb2RlRmllbGRzIHtcbiAgdGFnOiBTb3VyY2VTbGljZTtcbiAgYm9keTogcmVhZG9ubHkgQ29udGVudE5vZGVbXTtcbiAgYXR0cnM6IHJlYWRvbmx5IEh0bWxPclNwbGF0QXR0cltdO1xuICBjb21wb25lbnRBcmdzOiByZWFkb25seSBDb21wb25lbnRBcmdbXTtcbiAgbW9kaWZpZXJzOiByZWFkb25seSBFbGVtZW50TW9kaWZpZXJbXTtcbn1cblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBhIHNpbXBsZSBIVE1MIGVsZW1lbnQuIFRoZSBBU1QgYWxsb3dzIGNvbXBvbmVudCBhcmd1bWVudHMgYW5kIG1vZGlmaWVycyB0byBzdXBwb3J0XG4gKiBmdXR1cmUgZXh0ZW5zaW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFNpbXBsZUVsZW1lbnQgZXh0ZW5kcyBub2RlKCdTaW1wbGVFbGVtZW50JykuZmllbGRzPFNpbXBsZUVsZW1lbnRPcHRpb25zPigpIHtcbiAgZ2V0IGFyZ3MoKTogQXJncyB7XG4gICAgbGV0IGVudHJpZXMgPSB0aGlzLmNvbXBvbmVudEFyZ3MubWFwKChhKSA9PiBhLnRvTmFtZWRBcmd1bWVudCgpKTtcblxuICAgIHJldHVybiBBcmdzLm5hbWVkKFxuICAgICAgbmV3IE5hbWVkQXJndW1lbnRzKHtcbiAgICAgICAgbG9jOiBTcGFuTGlzdC5yYW5nZShlbnRyaWVzLCB0aGlzLnRhZy5sb2MuY29sbGFwc2UoJ2VuZCcpKSxcbiAgICAgICAgZW50cmllcyxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBFbGVtZW50Tm9kZSA9IE5hbWVkQmxvY2sgfCBJbnZva2VDb21wb25lbnQgfCBTaW1wbGVFbGVtZW50O1xuIl0sInNvdXJjZVJvb3QiOiIifQ==