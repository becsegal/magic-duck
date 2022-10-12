"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Source", {
  enumerable: true,
  get: function () {
    return _source.Source;
  }
});
Object.defineProperty(exports, "builders", {
  enumerable: true,
  get: function () {
    return _publicBuilders.default;
  }
});
Object.defineProperty(exports, "normalize", {
  enumerable: true,
  get: function () {
    return _normalize.normalize;
  }
});
Object.defineProperty(exports, "SymbolTable", {
  enumerable: true,
  get: function () {
    return _symbolTable.SymbolTable;
  }
});
Object.defineProperty(exports, "BlockSymbolTable", {
  enumerable: true,
  get: function () {
    return _symbolTable.BlockSymbolTable;
  }
});
Object.defineProperty(exports, "ProgramSymbolTable", {
  enumerable: true,
  get: function () {
    return _symbolTable.ProgramSymbolTable;
  }
});
Object.defineProperty(exports, "generateSyntaxError", {
  enumerable: true,
  get: function () {
    return _syntaxError.generateSyntaxError;
  }
});
Object.defineProperty(exports, "preprocess", {
  enumerable: true,
  get: function () {
    return _tokenizerEventHandlers.preprocess;
  }
});
Object.defineProperty(exports, "print", {
  enumerable: true,
  get: function () {
    return _print.default;
  }
});
Object.defineProperty(exports, "sortByLoc", {
  enumerable: true,
  get: function () {
    return _util.sortByLoc;
  }
});
Object.defineProperty(exports, "Walker", {
  enumerable: true,
  get: function () {
    return _walker.default;
  }
});
Object.defineProperty(exports, "Path", {
  enumerable: true,
  get: function () {
    return _walker.default;
  }
});
Object.defineProperty(exports, "traverse", {
  enumerable: true,
  get: function () {
    return _traverse.default;
  }
});
Object.defineProperty(exports, "cannotRemoveNode", {
  enumerable: true,
  get: function () {
    return _errors.cannotRemoveNode;
  }
});
Object.defineProperty(exports, "cannotReplaceNode", {
  enumerable: true,
  get: function () {
    return _errors.cannotReplaceNode;
  }
});
Object.defineProperty(exports, "WalkerPath", {
  enumerable: true,
  get: function () {
    return _path.default;
  }
});
Object.defineProperty(exports, "isKeyword", {
  enumerable: true,
  get: function () {
    return _keywords.isKeyword;
  }
});
Object.defineProperty(exports, "KEYWORDS_TYPES", {
  enumerable: true,
  get: function () {
    return _keywords.KEYWORDS_TYPES;
  }
});
Object.defineProperty(exports, "getTemplateLocals", {
  enumerable: true,
  get: function () {
    return _getTemplateLocals.getTemplateLocals;
  }
});
Object.defineProperty(exports, "SourceSlice", {
  enumerable: true,
  get: function () {
    return _slice.SourceSlice;
  }
});
Object.defineProperty(exports, "SourceSpan", {
  enumerable: true,
  get: function () {
    return _span.SourceSpan;
  }
});
Object.defineProperty(exports, "SpanList", {
  enumerable: true,
  get: function () {
    return _spanList.SpanList;
  }
});
Object.defineProperty(exports, "maybeLoc", {
  enumerable: true,
  get: function () {
    return _spanList.maybeLoc;
  }
});
Object.defineProperty(exports, "loc", {
  enumerable: true,
  get: function () {
    return _spanList.loc;
  }
});
Object.defineProperty(exports, "hasSpan", {
  enumerable: true,
  get: function () {
    return _spanList.hasSpan;
  }
});
Object.defineProperty(exports, "node", {
  enumerable: true,
  get: function () {
    return _node.node;
  }
});
exports.ASTv2 = exports.AST = exports.ASTv1 = void 0;

var _source = require("./lib/source/source");

var _publicBuilders = _interopRequireDefault(require("./lib/v1/public-builders"));

var ASTv1_1 = _interopRequireWildcard(require("./lib/v1/api"));

var AST_1 = ASTv1_1;
exports.ASTv1 = ASTv1_1;
exports.AST = ASTv1_1;

var ASTv2_1 = _interopRequireWildcard(require("./lib/v2-a/api"));

exports.ASTv2 = ASTv2_1;

var _normalize = require("./lib/v2-a/normalize");

var _symbolTable = require("./lib/symbol-table");

var _syntaxError = require("./lib/syntax-error");

var _tokenizerEventHandlers = require("./lib/parser/tokenizer-event-handlers");

var _print = _interopRequireDefault(require("./lib/generation/print"));

var _util = require("./lib/generation/util");

var _walker = _interopRequireDefault(require("./lib/traversal/walker"));

var _traverse = _interopRequireDefault(require("./lib/traversal/traverse"));

var _errors = require("./lib/traversal/errors");

var _path = _interopRequireDefault(require("./lib/traversal/path"));

var _keywords = require("./lib/keywords");

var _getTemplateLocals = require("./lib/get-template-locals");

var _slice = require("./lib/source/slice");

var _span = require("./lib/source/span");

var _spanList = require("./lib/source/span-list");

var _node = require("./lib/v2-a/objects/node");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ3VCOzs7Ozs7QUFDQTs7OztBQUN2Qjs7QUFDQTs7QUFDQTs7QUFDQTs7QUFTQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFVQSIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB7IFNvdXJjZSB9IGZyb20gJy4vbGliL3NvdXJjZS9zb3VyY2UnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBidWlsZGVycyB9IGZyb20gJy4vbGliL3YxL3B1YmxpYy1idWlsZGVycyc7XG5leHBvcnQgKiBhcyBBU1R2MSBmcm9tICcuL2xpYi92MS9hcGknO1xuZXhwb3J0ICogYXMgQVNUdjIgZnJvbSAnLi9saWIvdjItYS9hcGknO1xuZXhwb3J0IHsgbm9ybWFsaXplIH0gZnJvbSAnLi9saWIvdjItYS9ub3JtYWxpemUnO1xuZXhwb3J0IHsgU3ltYm9sVGFibGUsIEJsb2NrU3ltYm9sVGFibGUsIFByb2dyYW1TeW1ib2xUYWJsZSB9IGZyb20gJy4vbGliL3N5bWJvbC10YWJsZSc7XG5leHBvcnQgeyBnZW5lcmF0ZVN5bnRheEVycm9yLCBHbGltbWVyU3ludGF4RXJyb3IgfSBmcm9tICcuL2xpYi9zeW50YXgtZXJyb3InO1xuZXhwb3J0IHtcbiAgcHJlcHJvY2VzcyxcbiAgQVNUUGx1Z2luLFxuICBBU1RQbHVnaW5CdWlsZGVyLFxuICBBU1RQbHVnaW5FbnZpcm9ubWVudCxcbiAgU3ludGF4LFxuICBUZW1wbGF0ZUlkRm4sXG4gIFByZWNvbXBpbGVPcHRpb25zLFxufSBmcm9tICcuL2xpYi9wYXJzZXIvdG9rZW5pemVyLWV2ZW50LWhhbmRsZXJzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgcHJpbnQgfSBmcm9tICcuL2xpYi9nZW5lcmF0aW9uL3ByaW50JztcbmV4cG9ydCB7IHNvcnRCeUxvYyB9IGZyb20gJy4vbGliL2dlbmVyYXRpb24vdXRpbCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFdhbGtlciB9IGZyb20gJy4vbGliL3RyYXZlcnNhbC93YWxrZXInO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyB0cmF2ZXJzZSB9IGZyb20gJy4vbGliL3RyYXZlcnNhbC90cmF2ZXJzZSc7XG5leHBvcnQgeyBOb2RlVmlzaXRvciB9IGZyb20gJy4vbGliL3RyYXZlcnNhbC92aXNpdG9yJztcbmV4cG9ydCB7IGNhbm5vdFJlbW92ZU5vZGUsIGNhbm5vdFJlcGxhY2VOb2RlIH0gZnJvbSAnLi9saWIvdHJhdmVyc2FsL2Vycm9ycyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFdhbGtlclBhdGggfSBmcm9tICcuL2xpYi90cmF2ZXJzYWwvcGF0aCc7XG5leHBvcnQgeyBpc0tleXdvcmQsIEtleXdvcmRUeXBlLCBLRVlXT1JEU19UWVBFUyB9IGZyb20gJy4vbGliL2tleXdvcmRzJztcbmV4cG9ydCB7IGdldFRlbXBsYXRlTG9jYWxzIH0gZnJvbSAnLi9saWIvZ2V0LXRlbXBsYXRlLWxvY2Fscyc7XG5cbmV4cG9ydCB7IFNvdXJjZVNsaWNlIH0gZnJvbSAnLi9saWIvc291cmNlL3NsaWNlJztcbmV4cG9ydCB7IFNvdXJjZVNwYW4gfSBmcm9tICcuL2xpYi9zb3VyY2Uvc3Bhbic7XG5leHBvcnQge1xuICBTcGFuTGlzdCxcbiAgbWF5YmVMb2MsXG4gIE1heWJlSGFzU291cmNlU3BhbixcbiAgbG9jLFxuICBIYXNTb3VyY2VTcGFuLFxuICBoYXNTcGFuLFxufSBmcm9tICcuL2xpYi9zb3VyY2Uvc3Bhbi1saXN0JztcbmV4cG9ydCB7IFByZXByb2Nlc3NPcHRpb25zIH0gZnJvbSAnLi9saWIvcGFyc2VyL3Rva2VuaXplci1ldmVudC1oYW5kbGVycyc7XG5cbmV4cG9ydCB7IG5vZGUgfSBmcm9tICcuL2xpYi92Mi1hL29iamVjdHMvbm9kZSc7XG5cbi8qKiBAZGVwcmVjYXRlZCB1c2UgV2Fsa2VyUGF0aCBpbnN0ZWFkICovXG5leHBvcnQgeyBkZWZhdWx0IGFzIFBhdGggfSBmcm9tICcuL2xpYi90cmF2ZXJzYWwvd2Fsa2VyJztcblxuLyoqIEBkZXByZWNhdGVkIHVzZSBBU1R2MSBpbnN0ZWFkICovXG5leHBvcnQgKiBhcyBBU1QgZnJvbSAnLi9saWIvdjEvYXBpJztcbiJdLCJzb3VyY2VSb290IjoiIn0=