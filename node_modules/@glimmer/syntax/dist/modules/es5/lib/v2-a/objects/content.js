function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import { SpanList } from '../../source/span-list';
import { Args, NamedArguments } from './args';
import { node } from './node';
export var GlimmerComment = /*#__PURE__*/function (_node$fields) {
  _inheritsLoose(GlimmerComment, _node$fields);

  function GlimmerComment() {
    return _node$fields.apply(this, arguments) || this;
  }

  return GlimmerComment;
}(node('GlimmerComment').fields());
export var HtmlText = /*#__PURE__*/function (_node$fields2) {
  _inheritsLoose(HtmlText, _node$fields2);

  function HtmlText() {
    return _node$fields2.apply(this, arguments) || this;
  }

  return HtmlText;
}(node('HtmlText').fields());
export var HtmlComment = /*#__PURE__*/function (_node$fields3) {
  _inheritsLoose(HtmlComment, _node$fields3);

  function HtmlComment() {
    return _node$fields3.apply(this, arguments) || this;
  }

  return HtmlComment;
}(node('HtmlComment').fields());
export var AppendContent = /*#__PURE__*/function (_node$fields4) {
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
        return Args.empty(this.value.loc.collapse('end'));
      }
    }
  }]);

  return AppendContent;
}(node('AppendContent').fields());
export var InvokeBlock = /*#__PURE__*/function (_node$fields5) {
  _inheritsLoose(InvokeBlock, _node$fields5);

  function InvokeBlock() {
    return _node$fields5.apply(this, arguments) || this;
  }

  return InvokeBlock;
}(node('InvokeBlock').fields());
/**
 * Corresponds to a component invocation. When the content of a component invocation contains no
 * named blocks, `blocks` contains a single named block named `"default"`. When a component
 * invocation is self-closing, `blocks` is empty.
 */

export var InvokeComponent = /*#__PURE__*/function (_node$fields6) {
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
      return Args.named(new NamedArguments({
        loc: SpanList.range(entries, this.callee.loc.collapse('end')),
        entries: entries
      }));
    }
  }]);

  return InvokeComponent;
}(node('InvokeComponent').fields());
/**
 * Corresponds to a simple HTML element. The AST allows component arguments and modifiers to support
 * future extensions.
 */

export var SimpleElement = /*#__PURE__*/function (_node$fields7) {
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
      return Args.named(new NamedArguments({
        loc: SpanList.range(entries, this.tag.loc.collapse('end')),
        entries: entries
      }));
    }
  }]);

  return SimpleElement;
}(node('SimpleElement').fields());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9vYmplY3RzL2NvbnRlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsU0FBQSxRQUFBLFFBQUEsd0JBQUE7QUFFQSxTQUFBLElBQUEsRUFBQSxjQUFBLFFBQUEsUUFBQTtBQUtBLFNBQUEsSUFBQSxRQUFBLFFBQUE7QUFpQkEsV0FBTSxjQUFOO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsRUFBb0MsSUFBSSxDQUFKLGdCQUFJLENBQUosQ0FBOUIsTUFBOEIsRUFBcEM7QUFDQSxXQUFNLFFBQU47QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxFQUE4QixJQUFJLENBQUosVUFBSSxDQUFKLENBQXhCLE1BQXdCLEVBQTlCO0FBQ0EsV0FBTSxXQUFOO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsRUFBaUMsSUFBSSxDQUFKLGFBQUksQ0FBSixDQUEzQixNQUEyQixFQUFqQztBQUVBLFdBQU0sYUFBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsd0JBS1k7QUFDUixVQUFJLEtBQUEsS0FBQSxDQUFBLElBQUEsS0FBSixNQUFBLEVBQWdDO0FBQzlCLGVBQU8sS0FBQSxLQUFBLENBQVAsTUFBQTtBQURGLE9BQUEsTUFFTztBQUNMLGVBQU8sS0FBUCxLQUFBO0FBQ0Q7QUFDRjtBQVhIO0FBQUE7QUFBQSx3QkFhVTtBQUNOLFVBQUksS0FBQSxLQUFBLENBQUEsSUFBQSxLQUFKLE1BQUEsRUFBZ0M7QUFDOUIsZUFBTyxLQUFBLEtBQUEsQ0FBUCxJQUFBO0FBREYsT0FBQSxNQUVPO0FBQ0wsZUFBTyxJQUFJLENBQUosS0FBQSxDQUFXLEtBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQWxCLEtBQWtCLENBQVgsQ0FBUDtBQUNEO0FBQ0Y7QUFuQkg7O0FBQUE7QUFBQSxFQUFtQyxJQUFJLENBQUosZUFBSSxDQUFKLENBQTdCLE1BQTZCLEVBQW5DO0FBc0JBLFdBQU0sV0FBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLEVBQWlDLElBQUksQ0FBSixhQUFJLENBQUosQ0FBM0IsTUFBMkIsRUFBakM7QUFZQTs7Ozs7O0FBS0EsV0FBTSxlQUFOO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSx3QkFDVTtBQUNOLFVBQUksT0FBTyxHQUFHLEtBQUEsYUFBQSxDQUFBLEdBQUEsQ0FBd0IsVUFBQSxDQUFEO0FBQUEsZUFBTyxDQUFDLENBQTdDLGVBQTRDLEVBQVA7QUFBQSxPQUF2QixDQUFkO0FBRUEsYUFBTyxJQUFJLENBQUosS0FBQSxDQUNMLElBQUEsY0FBQSxDQUFtQjtBQUNqQixRQUFBLEdBQUcsRUFBRSxRQUFRLENBQVIsS0FBQSxDQUFBLE9BQUEsRUFBd0IsS0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FEWixLQUNZLENBQXhCLENBRFk7QUFFakIsUUFBQSxPQUFBLEVBQUE7QUFGaUIsT0FBbkIsQ0FESyxDQUFQO0FBTUQ7QUFWSDs7QUFBQTtBQUFBLEVBQXFDLElBQUksQ0FBSixpQkFBSSxDQUFKLENBQS9CLE1BQStCLEVBQXJDO0FBcUJBOzs7OztBQUlBLFdBQU0sYUFBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsd0JBQ1U7QUFDTixVQUFJLE9BQU8sR0FBRyxLQUFBLGFBQUEsQ0FBQSxHQUFBLENBQXdCLFVBQUEsQ0FBRDtBQUFBLGVBQU8sQ0FBQyxDQUE3QyxlQUE0QyxFQUFQO0FBQUEsT0FBdkIsQ0FBZDtBQUVBLGFBQU8sSUFBSSxDQUFKLEtBQUEsQ0FDTCxJQUFBLGNBQUEsQ0FBbUI7QUFDakIsUUFBQSxHQUFHLEVBQUUsUUFBUSxDQUFSLEtBQUEsQ0FBQSxPQUFBLEVBQXdCLEtBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBRFosS0FDWSxDQUF4QixDQURZO0FBRWpCLFFBQUEsT0FBQSxFQUFBO0FBRmlCLE9BQW5CLENBREssQ0FBUDtBQU1EO0FBVkg7O0FBQUE7QUFBQSxFQUFtQyxJQUFJLENBQUosZUFBSSxDQUFKLENBQTdCLE1BQTZCLEVBQW5DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU291cmNlU2xpY2UgfSBmcm9tICcuLi8uLi9zb3VyY2Uvc2xpY2UnO1xuaW1wb3J0IHsgU3Bhbkxpc3QgfSBmcm9tICcuLi8uLi9zb3VyY2Uvc3Bhbi1saXN0JztcbmltcG9ydCB7IFN5bWJvbFRhYmxlIH0gZnJvbSAnLi4vLi4vc3ltYm9sLXRhYmxlJztcbmltcG9ydCB7IEFyZ3MsIE5hbWVkQXJndW1lbnRzIH0gZnJvbSAnLi9hcmdzJztcbmltcG9ydCB0eXBlIHsgQ29tcG9uZW50QXJnLCBFbGVtZW50TW9kaWZpZXIsIEh0bWxPclNwbGF0QXR0ciB9IGZyb20gJy4vYXR0ci1ibG9jayc7XG5pbXBvcnQgdHlwZSB7IENhbGxGaWVsZHMgfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHR5cGUgeyBFeHByZXNzaW9uTm9kZSB9IGZyb20gJy4vZXhwcic7XG5pbXBvcnQgdHlwZSB7IE5hbWVkQmxvY2ssIE5hbWVkQmxvY2tzIH0gZnJvbSAnLi9pbnRlcm5hbC1ub2RlJztcbmltcG9ydCB7IEJhc2VOb2RlRmllbGRzLCBub2RlIH0gZnJvbSAnLi9ub2RlJztcblxuLyoqXG4gKiBDb250ZW50IE5vZGVzIGFyZSBhbGxvd2VkIGluIGNvbnRlbnQgcG9zaXRpb25zIGluIHRlbXBsYXRlcy4gVGhleSBjb3JyZXNwb25kIHRvIGJlaGF2aW9yIGluIHRoZVxuICogW0RhdGFdW2RhdGFdIHRva2VuaXphdGlvbiBzdGF0ZSBpbiBIVE1MLlxuICpcbiAqIFtkYXRhXTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvcGFyc2luZy5odG1sI2RhdGEtc3RhdGVcbiAqL1xuZXhwb3J0IHR5cGUgQ29udGVudE5vZGUgPVxuICB8IEh0bWxUZXh0XG4gIHwgSHRtbENvbW1lbnRcbiAgfCBBcHBlbmRDb250ZW50XG4gIHwgSW52b2tlQmxvY2tcbiAgfCBJbnZva2VDb21wb25lbnRcbiAgfCBTaW1wbGVFbGVtZW50XG4gIHwgR2xpbW1lckNvbW1lbnQ7XG5cbmV4cG9ydCBjbGFzcyBHbGltbWVyQ29tbWVudCBleHRlbmRzIG5vZGUoJ0dsaW1tZXJDb21tZW50JykuZmllbGRzPHsgdGV4dDogU291cmNlU2xpY2UgfT4oKSB7fVxuZXhwb3J0IGNsYXNzIEh0bWxUZXh0IGV4dGVuZHMgbm9kZSgnSHRtbFRleHQnKS5maWVsZHM8eyBjaGFyczogc3RyaW5nIH0+KCkge31cbmV4cG9ydCBjbGFzcyBIdG1sQ29tbWVudCBleHRlbmRzIG5vZGUoJ0h0bWxDb21tZW50JykuZmllbGRzPHsgdGV4dDogU291cmNlU2xpY2UgfT4oKSB7fVxuXG5leHBvcnQgY2xhc3MgQXBwZW5kQ29udGVudCBleHRlbmRzIG5vZGUoJ0FwcGVuZENvbnRlbnQnKS5maWVsZHM8e1xuICB2YWx1ZTogRXhwcmVzc2lvbk5vZGU7XG4gIHRydXN0aW5nOiBib29sZWFuO1xuICB0YWJsZTogU3ltYm9sVGFibGU7XG59PigpIHtcbiAgZ2V0IGNhbGxlZSgpOiBFeHByZXNzaW9uTm9kZSB7XG4gICAgaWYgKHRoaXMudmFsdWUudHlwZSA9PT0gJ0NhbGwnKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZS5jYWxsZWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIGdldCBhcmdzKCk6IEFyZ3Mge1xuICAgIGlmICh0aGlzLnZhbHVlLnR5cGUgPT09ICdDYWxsJykge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWUuYXJncztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIEFyZ3MuZW1wdHkodGhpcy52YWx1ZS5sb2MuY29sbGFwc2UoJ2VuZCcpKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEludm9rZUJsb2NrIGV4dGVuZHMgbm9kZSgnSW52b2tlQmxvY2snKS5maWVsZHM8XG4gIENhbGxGaWVsZHMgJiB7IGJsb2NrczogTmFtZWRCbG9ja3MgfVxuPigpIHt9XG5cbmludGVyZmFjZSBJbnZva2VDb21wb25lbnRGaWVsZHMge1xuICBjYWxsZWU6IEV4cHJlc3Npb25Ob2RlO1xuICBibG9ja3M6IE5hbWVkQmxvY2tzO1xuICBhdHRyczogcmVhZG9ubHkgSHRtbE9yU3BsYXRBdHRyW107XG4gIGNvbXBvbmVudEFyZ3M6IHJlYWRvbmx5IENvbXBvbmVudEFyZ1tdO1xuICBtb2RpZmllcnM6IHJlYWRvbmx5IEVsZW1lbnRNb2RpZmllcltdO1xufVxuXG4vKipcbiAqIENvcnJlc3BvbmRzIHRvIGEgY29tcG9uZW50IGludm9jYXRpb24uIFdoZW4gdGhlIGNvbnRlbnQgb2YgYSBjb21wb25lbnQgaW52b2NhdGlvbiBjb250YWlucyBub1xuICogbmFtZWQgYmxvY2tzLCBgYmxvY2tzYCBjb250YWlucyBhIHNpbmdsZSBuYW1lZCBibG9jayBuYW1lZCBgXCJkZWZhdWx0XCJgLiBXaGVuIGEgY29tcG9uZW50XG4gKiBpbnZvY2F0aW9uIGlzIHNlbGYtY2xvc2luZywgYGJsb2Nrc2AgaXMgZW1wdHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnZva2VDb21wb25lbnQgZXh0ZW5kcyBub2RlKCdJbnZva2VDb21wb25lbnQnKS5maWVsZHM8SW52b2tlQ29tcG9uZW50RmllbGRzPigpIHtcbiAgZ2V0IGFyZ3MoKTogQXJncyB7XG4gICAgbGV0IGVudHJpZXMgPSB0aGlzLmNvbXBvbmVudEFyZ3MubWFwKChhKSA9PiBhLnRvTmFtZWRBcmd1bWVudCgpKTtcblxuICAgIHJldHVybiBBcmdzLm5hbWVkKFxuICAgICAgbmV3IE5hbWVkQXJndW1lbnRzKHtcbiAgICAgICAgbG9jOiBTcGFuTGlzdC5yYW5nZShlbnRyaWVzLCB0aGlzLmNhbGxlZS5sb2MuY29sbGFwc2UoJ2VuZCcpKSxcbiAgICAgICAgZW50cmllcyxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgU2ltcGxlRWxlbWVudE9wdGlvbnMgZXh0ZW5kcyBCYXNlTm9kZUZpZWxkcyB7XG4gIHRhZzogU291cmNlU2xpY2U7XG4gIGJvZHk6IHJlYWRvbmx5IENvbnRlbnROb2RlW107XG4gIGF0dHJzOiByZWFkb25seSBIdG1sT3JTcGxhdEF0dHJbXTtcbiAgY29tcG9uZW50QXJnczogcmVhZG9ubHkgQ29tcG9uZW50QXJnW107XG4gIG1vZGlmaWVyczogcmVhZG9ubHkgRWxlbWVudE1vZGlmaWVyW107XG59XG5cbi8qKlxuICogQ29ycmVzcG9uZHMgdG8gYSBzaW1wbGUgSFRNTCBlbGVtZW50LiBUaGUgQVNUIGFsbG93cyBjb21wb25lbnQgYXJndW1lbnRzIGFuZCBtb2RpZmllcnMgdG8gc3VwcG9ydFxuICogZnV0dXJlIGV4dGVuc2lvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBTaW1wbGVFbGVtZW50IGV4dGVuZHMgbm9kZSgnU2ltcGxlRWxlbWVudCcpLmZpZWxkczxTaW1wbGVFbGVtZW50T3B0aW9ucz4oKSB7XG4gIGdldCBhcmdzKCk6IEFyZ3Mge1xuICAgIGxldCBlbnRyaWVzID0gdGhpcy5jb21wb25lbnRBcmdzLm1hcCgoYSkgPT4gYS50b05hbWVkQXJndW1lbnQoKSk7XG5cbiAgICByZXR1cm4gQXJncy5uYW1lZChcbiAgICAgIG5ldyBOYW1lZEFyZ3VtZW50cyh7XG4gICAgICAgIGxvYzogU3Bhbkxpc3QucmFuZ2UoZW50cmllcywgdGhpcy50YWcubG9jLmNvbGxhcHNlKCdlbmQnKSksXG4gICAgICAgIGVudHJpZXMsXG4gICAgICB9KVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgRWxlbWVudE5vZGUgPSBOYW1lZEJsb2NrIHwgSW52b2tlQ29tcG9uZW50IHwgU2ltcGxlRWxlbWVudDtcbiJdLCJzb3VyY2VSb290IjoiIn0=