function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import { dict } from '@glimmer/util';
import { isUpperCase } from './utils';
export var SymbolTable = /*#__PURE__*/function () {
  function SymbolTable() {}

  SymbolTable.top = function top(locals, customizeComponentName) {
    return new ProgramSymbolTable(locals, customizeComponentName);
  };

  var _proto = SymbolTable.prototype;

  _proto.child = function child(locals) {
    var _this = this;

    var symbols = locals.map(function (name) {
      return _this.allocate(name);
    });
    return new BlockSymbolTable(this, locals, symbols);
  };

  return SymbolTable;
}();
export var ProgramSymbolTable = /*#__PURE__*/function (_SymbolTable) {
  _inheritsLoose(ProgramSymbolTable, _SymbolTable);

  function ProgramSymbolTable(templateLocals, customizeComponentName) {
    var _this2;

    _this2 = _SymbolTable.call(this) || this;
    _this2.templateLocals = templateLocals;
    _this2.customizeComponentName = customizeComponentName;
    _this2.symbols = [];
    _this2.upvars = [];
    _this2.size = 1;
    _this2.named = dict();
    _this2.blocks = dict();
    _this2.usedTemplateLocals = [];
    _this2._hasEval = false;
    return _this2;
  }

  var _proto2 = ProgramSymbolTable.prototype;

  _proto2.getUsedTemplateLocals = function getUsedTemplateLocals() {
    return this.usedTemplateLocals;
  };

  _proto2.setHasEval = function setHasEval() {
    this._hasEval = true;
  };

  _proto2.has = function has(name) {
    return this.templateLocals.indexOf(name) !== -1;
  };

  _proto2.get = function get(name) {
    var index = this.usedTemplateLocals.indexOf(name);

    if (index !== -1) {
      return [index, true];
    }

    index = this.usedTemplateLocals.length;
    this.usedTemplateLocals.push(name);
    return [index, true];
  };

  _proto2.getLocalsMap = function getLocalsMap() {
    return dict();
  };

  _proto2.getEvalInfo = function getEvalInfo() {
    var locals = this.getLocalsMap();
    return Object.keys(locals).map(function (symbol) {
      return locals[symbol];
    });
  };

  _proto2.allocateFree = function allocateFree(name, resolution) {
    // If the name in question is an uppercase (i.e. angle-bracket) component invocation, run
    // the optional `customizeComponentName` function provided to the precompiler.
    if (resolution.resolution() === 39
    /* GetFreeAsComponentHead */
    && resolution.isAngleBracket && isUpperCase(name)) {
      name = this.customizeComponentName(name);
    }

    var index = this.upvars.indexOf(name);

    if (index !== -1) {
      return index;
    }

    index = this.upvars.length;
    this.upvars.push(name);
    return index;
  };

  _proto2.allocateNamed = function allocateNamed(name) {
    var named = this.named[name];

    if (!named) {
      named = this.named[name] = this.allocate(name);
    }

    return named;
  };

  _proto2.allocateBlock = function allocateBlock(name) {
    if (name === 'inverse') {
      name = 'else';
    }

    var block = this.blocks[name];

    if (!block) {
      block = this.blocks[name] = this.allocate("&" + name);
    }

    return block;
  };

  _proto2.allocate = function allocate(identifier) {
    this.symbols.push(identifier);
    return this.size++;
  };

  _createClass(ProgramSymbolTable, [{
    key: "hasEval",
    get: function get() {
      return this._hasEval;
    }
  }]);

  return ProgramSymbolTable;
}(SymbolTable);
export var BlockSymbolTable = /*#__PURE__*/function (_SymbolTable2) {
  _inheritsLoose(BlockSymbolTable, _SymbolTable2);

  function BlockSymbolTable(parent, symbols, slots) {
    var _this3;

    _this3 = _SymbolTable2.call(this) || this;
    _this3.parent = parent;
    _this3.symbols = symbols;
    _this3.slots = slots;
    return _this3;
  }

  var _proto3 = BlockSymbolTable.prototype;

  _proto3.has = function has(name) {
    return this.symbols.indexOf(name) !== -1 || this.parent.has(name);
  };

  _proto3.get = function get(name) {
    var slot = this.symbols.indexOf(name);
    return slot === -1 ? this.parent.get(name) : [this.slots[slot], false];
  };

  _proto3.getLocalsMap = function getLocalsMap() {
    var _this4 = this;

    var dict = this.parent.getLocalsMap();
    this.symbols.forEach(function (symbol) {
      return dict[symbol] = _this4.get(symbol)[0];
    });
    return dict;
  };

  _proto3.getEvalInfo = function getEvalInfo() {
    var locals = this.getLocalsMap();
    return Object.keys(locals).map(function (symbol) {
      return locals[symbol];
    });
  };

  _proto3.setHasEval = function setHasEval() {
    this.parent.setHasEval();
  };

  _proto3.allocateFree = function allocateFree(name, resolution) {
    return this.parent.allocateFree(name, resolution);
  };

  _proto3.allocateNamed = function allocateNamed(name) {
    return this.parent.allocateNamed(name);
  };

  _proto3.allocateBlock = function allocateBlock(name) {
    return this.parent.allocateBlock(name);
  };

  _proto3.allocate = function allocate(identifier) {
    return this.parent.allocate(identifier);
  };

  _createClass(BlockSymbolTable, [{
    key: "locals",
    get: function get() {
      return this.symbols;
    }
  }]);

  return BlockSymbolTable;
}(SymbolTable);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvc3ltYm9sLXRhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLFNBQUEsSUFBQSxRQUFBLGVBQUE7QUFHQSxTQUFBLFdBQUEsUUFBQSxTQUFBO0FBRUEsV0FBTSxXQUFOO0FBQUE7O0FBQUEsY0FDRSxHQURGLEdBQ0UsYUFBQSxNQUFBLEVBQUEsc0JBQUEsRUFFbUQ7QUFFakQsV0FBTyxJQUFBLGtCQUFBLENBQUEsTUFBQSxFQUFQLHNCQUFPLENBQVA7QUFDRCxHQU5IOztBQUFBOztBQUFBLFNBcUJFLEtBckJGLEdBcUJFLGVBQUssTUFBTCxFQUFzQjtBQUFBOztBQUNwQixRQUFJLE9BQU8sR0FBRyxNQUFNLENBQU4sR0FBQSxDQUFZLFVBQUEsSUFBRDtBQUFBLGFBQVUsS0FBQSxDQUFBLFFBQUEsQ0FBbkMsSUFBbUMsQ0FBVjtBQUFBLEtBQVgsQ0FBZDtBQUNBLFdBQU8sSUFBQSxnQkFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLEVBQVAsT0FBTyxDQUFQO0FBQ0QsR0F4Qkg7O0FBQUE7QUFBQTtBQTJCQSxXQUFNLGtCQUFOO0FBQUE7O0FBQ0UsOEJBQUEsY0FBQSxFQUFBLHNCQUFBLEVBRTJEO0FBQUE7O0FBRXpEO0FBSFEsV0FBQSxjQUFBLEdBQUEsY0FBQTtBQUNBLFdBQUEsc0JBQUEsR0FBQSxzQkFBQTtBQUtILFdBQUEsT0FBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLE1BQUEsR0FBQSxFQUFBO0FBRUMsV0FBQSxJQUFBLEdBQUEsQ0FBQTtBQUNBLFdBQUEsS0FBQSxHQUFRLElBQVIsRUFBQTtBQUNBLFdBQUEsTUFBQSxHQUFTLElBQVQsRUFBQTtBQUNBLFdBQUEsa0JBQUEsR0FBQSxFQUFBO0FBRVIsV0FBQSxRQUFBLEdBQUEsS0FBQTtBQWIyRDtBQUcxRDs7QUFOSDs7QUFBQSxVQWtCRSxxQkFsQkYsR0FrQkUsaUNBQXFCO0FBQ25CLFdBQU8sS0FBUCxr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QUFPLE1BQU0sQ0FBTixJQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsQ0FBeUIsVUFBQSxNQUFEO0FBQUEsYUFBWSxNQUFNLENBQWpELE1BQWlELENBQWxCO0FBQUEsS0FBeEIsQ0FBUDtBQUNELEdBM0JIOztBQUFBLFVBNkJFLFVBN0JGLEdBNkJFLHNCQUFVO0FBQ1IsU0FBQSxNQUFBLENBQUEsVUFBQTtBQUNELEdBL0JIOztBQUFBLFVBaUNFLFlBakNGLEdBaUNFLHNCQUFZLElBQVosRUFBWSxVQUFaLEVBQThEO0FBQzVELFdBQU8sS0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsRUFBUCxVQUFPLENBQVA7QUFDRCxHQW5DSDs7QUFBQSxVQXFDRSxhQXJDRixHQXFDRSx1QkFBYSxJQUFiLEVBQTBCO0FBQ3hCLFdBQU8sS0FBQSxNQUFBLENBQUEsYUFBQSxDQUFQLElBQU8sQ0FBUDtBQUNELEdBdkNIOztBQUFBLFVBeUNFLGFBekNGLEdBeUNFLHVCQUFhLElBQWIsRUFBMEI7QUFDeEIsV0FBTyxLQUFBLE1BQUEsQ0FBQSxhQUFBLENBQVAsSUFBTyxDQUFQO0FBQ0QsR0EzQ0g7O0FBQUEsVUE2Q0UsUUE3Q0YsR0E2Q0Usa0JBQVEsVUFBUixFQUEyQjtBQUN6QixXQUFPLEtBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBUCxVQUFPLENBQVA7QUFDRCxHQS9DSDs7QUFBQTtBQUFBO0FBQUEsd0JBS1k7QUFDUixhQUFPLEtBQVAsT0FBQTtBQUNEO0FBUEg7O0FBQUE7QUFBQSxFQUFNLFdBQU4iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb3JlLCBEaWN0LCBTZXhwT3Bjb2RlcyB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgZGljdCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuXG5pbXBvcnQgeyBBU1R2MiB9IGZyb20gJy4uJztcbmltcG9ydCB7IGlzVXBwZXJDYXNlIH0gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTeW1ib2xUYWJsZSB7XG4gIHN0YXRpYyB0b3AoXG4gICAgbG9jYWxzOiBzdHJpbmdbXSxcbiAgICBjdXN0b21pemVDb21wb25lbnROYW1lOiAoaW5wdXQ6IHN0cmluZykgPT4gc3RyaW5nXG4gICk6IFByb2dyYW1TeW1ib2xUYWJsZSB7XG4gICAgcmV0dXJuIG5ldyBQcm9ncmFtU3ltYm9sVGFibGUobG9jYWxzLCBjdXN0b21pemVDb21wb25lbnROYW1lKTtcbiAgfVxuXG4gIGFic3RyYWN0IGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuO1xuICBhYnN0cmFjdCBnZXQobmFtZTogc3RyaW5nKTogW3N5bWJvbDogbnVtYmVyLCBpc1Jvb3Q6IGJvb2xlYW5dO1xuXG4gIGFic3RyYWN0IGdldExvY2Fsc01hcCgpOiBEaWN0PG51bWJlcj47XG4gIGFic3RyYWN0IGdldEV2YWxJbmZvKCk6IENvcmUuRXZhbEluZm87XG5cbiAgYWJzdHJhY3QgYWxsb2NhdGVGcmVlKG5hbWU6IHN0cmluZywgcmVzb2x1dGlvbjogQVNUdjIuRnJlZVZhclJlc29sdXRpb24pOiBudW1iZXI7XG4gIGFic3RyYWN0IGFsbG9jYXRlTmFtZWQobmFtZTogc3RyaW5nKTogbnVtYmVyO1xuICBhYnN0cmFjdCBhbGxvY2F0ZUJsb2NrKG5hbWU6IHN0cmluZyk6IG51bWJlcjtcbiAgYWJzdHJhY3QgYWxsb2NhdGUoaWRlbnRpZmllcjogc3RyaW5nKTogbnVtYmVyO1xuXG4gIGFic3RyYWN0IHNldEhhc0V2YWwoKTogdm9pZDtcblxuICBjaGlsZChsb2NhbHM6IHN0cmluZ1tdKTogQmxvY2tTeW1ib2xUYWJsZSB7XG4gICAgbGV0IHN5bWJvbHMgPSBsb2NhbHMubWFwKChuYW1lKSA9PiB0aGlzLmFsbG9jYXRlKG5hbWUpKTtcbiAgICByZXR1cm4gbmV3IEJsb2NrU3ltYm9sVGFibGUodGhpcywgbG9jYWxzLCBzeW1ib2xzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJvZ3JhbVN5bWJvbFRhYmxlIGV4dGVuZHMgU3ltYm9sVGFibGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHRlbXBsYXRlTG9jYWxzOiBzdHJpbmdbXSxcbiAgICBwcml2YXRlIGN1c3RvbWl6ZUNvbXBvbmVudE5hbWU6IChpbnB1dDogc3RyaW5nKSA9PiBzdHJpbmdcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIHB1YmxpYyBzeW1ib2xzOiBzdHJpbmdbXSA9IFtdO1xuICBwdWJsaWMgdXB2YXJzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIHByaXZhdGUgc2l6ZSA9IDE7XG4gIHByaXZhdGUgbmFtZWQgPSBkaWN0PG51bWJlcj4oKTtcbiAgcHJpdmF0ZSBibG9ja3MgPSBkaWN0PG51bWJlcj4oKTtcbiAgcHJpdmF0ZSB1c2VkVGVtcGxhdGVMb2NhbHM6IHN0cmluZ1tdID0gW107XG5cbiAgX2hhc0V2YWwgPSBmYWxzZTtcblxuICBnZXRVc2VkVGVtcGxhdGVMb2NhbHMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLnVzZWRUZW1wbGF0ZUxvY2FscztcbiAgfVxuXG4gIHNldEhhc0V2YWwoKTogdm9pZCB7XG4gICAgdGhpcy5faGFzRXZhbCA9IHRydWU7XG4gIH1cblxuICBnZXQgaGFzRXZhbCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faGFzRXZhbDtcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZUxvY2Fscy5pbmRleE9mKG5hbWUpICE9PSAtMTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBbbnVtYmVyLCBib29sZWFuXSB7XG4gICAgbGV0IGluZGV4ID0gdGhpcy51c2VkVGVtcGxhdGVMb2NhbHMuaW5kZXhPZihuYW1lKTtcblxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBbaW5kZXgsIHRydWVdO1xuICAgIH1cblxuICAgIGluZGV4ID0gdGhpcy51c2VkVGVtcGxhdGVMb2NhbHMubGVuZ3RoO1xuICAgIHRoaXMudXNlZFRlbXBsYXRlTG9jYWxzLnB1c2gobmFtZSk7XG4gICAgcmV0dXJuIFtpbmRleCwgdHJ1ZV07XG4gIH1cblxuICBnZXRMb2NhbHNNYXAoKTogRGljdDxudW1iZXI+IHtcbiAgICByZXR1cm4gZGljdCgpO1xuICB9XG5cbiAgZ2V0RXZhbEluZm8oKTogQ29yZS5FdmFsSW5mbyB7XG4gICAgbGV0IGxvY2FscyA9IHRoaXMuZ2V0TG9jYWxzTWFwKCk7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGxvY2FscykubWFwKChzeW1ib2wpID0+IGxvY2Fsc1tzeW1ib2xdKTtcbiAgfVxuXG4gIGFsbG9jYXRlRnJlZShuYW1lOiBzdHJpbmcsIHJlc29sdXRpb246IEFTVHYyLkZyZWVWYXJSZXNvbHV0aW9uKTogbnVtYmVyIHtcbiAgICAvLyBJZiB0aGUgbmFtZSBpbiBxdWVzdGlvbiBpcyBhbiB1cHBlcmNhc2UgKGkuZS4gYW5nbGUtYnJhY2tldCkgY29tcG9uZW50IGludm9jYXRpb24sIHJ1blxuICAgIC8vIHRoZSBvcHRpb25hbCBgY3VzdG9taXplQ29tcG9uZW50TmFtZWAgZnVuY3Rpb24gcHJvdmlkZWQgdG8gdGhlIHByZWNvbXBpbGVyLlxuICAgIGlmIChcbiAgICAgIHJlc29sdXRpb24ucmVzb2x1dGlvbigpID09PSBTZXhwT3Bjb2Rlcy5HZXRGcmVlQXNDb21wb25lbnRIZWFkICYmXG4gICAgICByZXNvbHV0aW9uLmlzQW5nbGVCcmFja2V0ICYmXG4gICAgICBpc1VwcGVyQ2FzZShuYW1lKVxuICAgICkge1xuICAgICAgbmFtZSA9IHRoaXMuY3VzdG9taXplQ29tcG9uZW50TmFtZShuYW1lKTtcbiAgICB9XG5cbiAgICBsZXQgaW5kZXggPSB0aGlzLnVwdmFycy5pbmRleE9mKG5hbWUpO1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cblxuICAgIGluZGV4ID0gdGhpcy51cHZhcnMubGVuZ3RoO1xuICAgIHRoaXMudXB2YXJzLnB1c2gobmFtZSk7XG4gICAgcmV0dXJuIGluZGV4O1xuICB9XG5cbiAgYWxsb2NhdGVOYW1lZChuYW1lOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGxldCBuYW1lZCA9IHRoaXMubmFtZWRbbmFtZV07XG5cbiAgICBpZiAoIW5hbWVkKSB7XG4gICAgICBuYW1lZCA9IHRoaXMubmFtZWRbbmFtZV0gPSB0aGlzLmFsbG9jYXRlKG5hbWUpO1xuICAgIH1cblxuICAgIHJldHVybiBuYW1lZDtcbiAgfVxuXG4gIGFsbG9jYXRlQmxvY2sobmFtZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBpZiAobmFtZSA9PT0gJ2ludmVyc2UnKSB7XG4gICAgICBuYW1lID0gJ2Vsc2UnO1xuICAgIH1cblxuICAgIGxldCBibG9jayA9IHRoaXMuYmxvY2tzW25hbWVdO1xuXG4gICAgaWYgKCFibG9jaykge1xuICAgICAgYmxvY2sgPSB0aGlzLmJsb2Nrc1tuYW1lXSA9IHRoaXMuYWxsb2NhdGUoYCYke25hbWV9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJsb2NrO1xuICB9XG5cbiAgYWxsb2NhdGUoaWRlbnRpZmllcjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICB0aGlzLnN5bWJvbHMucHVzaChpZGVudGlmaWVyKTtcbiAgICByZXR1cm4gdGhpcy5zaXplKys7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJsb2NrU3ltYm9sVGFibGUgZXh0ZW5kcyBTeW1ib2xUYWJsZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcGFyZW50OiBTeW1ib2xUYWJsZSwgcHVibGljIHN5bWJvbHM6IHN0cmluZ1tdLCBwdWJsaWMgc2xvdHM6IG51bWJlcltdKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCBsb2NhbHMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLnN5bWJvbHM7XG4gIH1cblxuICBoYXMobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc3ltYm9scy5pbmRleE9mKG5hbWUpICE9PSAtMSB8fCB0aGlzLnBhcmVudC5oYXMobmFtZSk7XG4gIH1cblxuICBnZXQobmFtZTogc3RyaW5nKTogW251bWJlciwgYm9vbGVhbl0ge1xuICAgIGxldCBzbG90ID0gdGhpcy5zeW1ib2xzLmluZGV4T2YobmFtZSk7XG4gICAgcmV0dXJuIHNsb3QgPT09IC0xID8gdGhpcy5wYXJlbnQuZ2V0KG5hbWUpIDogW3RoaXMuc2xvdHNbc2xvdF0sIGZhbHNlXTtcbiAgfVxuXG4gIGdldExvY2Fsc01hcCgpOiBEaWN0PG51bWJlcj4ge1xuICAgIGxldCBkaWN0ID0gdGhpcy5wYXJlbnQuZ2V0TG9jYWxzTWFwKCk7XG4gICAgdGhpcy5zeW1ib2xzLmZvckVhY2goKHN5bWJvbCkgPT4gKGRpY3Rbc3ltYm9sXSA9IHRoaXMuZ2V0KHN5bWJvbClbMF0pKTtcbiAgICByZXR1cm4gZGljdDtcbiAgfVxuXG4gIGdldEV2YWxJbmZvKCk6IENvcmUuRXZhbEluZm8ge1xuICAgIGxldCBsb2NhbHMgPSB0aGlzLmdldExvY2Fsc01hcCgpO1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhsb2NhbHMpLm1hcCgoc3ltYm9sKSA9PiBsb2NhbHNbc3ltYm9sXSk7XG4gIH1cblxuICBzZXRIYXNFdmFsKCk6IHZvaWQge1xuICAgIHRoaXMucGFyZW50LnNldEhhc0V2YWwoKTtcbiAgfVxuXG4gIGFsbG9jYXRlRnJlZShuYW1lOiBzdHJpbmcsIHJlc29sdXRpb246IEFTVHYyLkZyZWVWYXJSZXNvbHV0aW9uKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQuYWxsb2NhdGVGcmVlKG5hbWUsIHJlc29sdXRpb24pO1xuICB9XG5cbiAgYWxsb2NhdGVOYW1lZChuYW1lOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnBhcmVudC5hbGxvY2F0ZU5hbWVkKG5hbWUpO1xuICB9XG5cbiAgYWxsb2NhdGVCbG9jayhuYW1lOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnBhcmVudC5hbGxvY2F0ZUJsb2NrKG5hbWUpO1xuICB9XG5cbiAgYWxsb2NhdGUoaWRlbnRpZmllcjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQuYWxsb2NhdGUoaWRlbnRpZmllcik7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=