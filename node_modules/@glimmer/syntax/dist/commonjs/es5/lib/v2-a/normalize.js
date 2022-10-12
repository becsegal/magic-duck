"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalize = normalize;
exports.BlockContext = void 0;

var _util = require("@glimmer/util");

var _printer = _interopRequireDefault(require("../generation/printer"));

var _tokenizerEventHandlers = require("../parser/tokenizer-event-handlers");

var _slice = require("../source/slice");

var _spanList = require("../source/span-list");

var _symbolTable = require("../symbol-table");

var _syntaxError = require("../syntax-error");

var _utils = require("../utils");

var _parserBuilders = _interopRequireDefault(require("../v1/parser-builders"));

var ASTv2 = _interopRequireWildcard(require("./api"));

var _builders = require("./builders");

var _looseResolution = require("./loose-resolution");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length) return {
          done: true
        };
        return {
          done: false,
          value: o[i++]
        };
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  it = o[Symbol.iterator]();
  return it.next.bind(it);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

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

function normalize(source, options) {
  if (options === void 0) {
    options = {};
  }

  var _a;

  var ast = (0, _tokenizerEventHandlers.preprocess)(source, options);
  var normalizeOptions = (0, _util.assign)({
    strictMode: false,
    locals: []
  }, options);

  var top = _symbolTable.SymbolTable.top(normalizeOptions.locals, (_a = // eslint-disable-next-line @typescript-eslint/unbound-method
  options.customizeComponentName) !== null && _a !== void 0 ? _a : function (name) {
    return name;
  });

  var block = new BlockContext(source, normalizeOptions, top);
  var normalizer = new StatementNormalizer(block);
  var astV2 = new TemplateChildren(block.loc(ast.loc), ast.body.map(function (b) {
    return normalizer.normalize(b);
  }), block).assertTemplate(top);
  var locals = top.getUsedTemplateLocals();
  return [astV2, locals];
}
/**
 * A `BlockContext` represents the block that a particular AST node is contained inside of.
 *
 * `BlockContext` is aware of template-wide options (such as strict mode), as well as the bindings
 * that are in-scope within that block.
 *
 * Concretely, it has the `PrecompileOptions` and current `SymbolTable`, and provides
 * facilities for working with those options.
 *
 * `BlockContext` is stateless.
 */


var BlockContext = /*#__PURE__*/function () {
  function BlockContext(source, options, table) {
    this.source = source;
    this.options = options;
    this.table = table;
    this.builder = new _builders.Builder();
  }

  var _proto = BlockContext.prototype;

  _proto.loc = function loc(_loc) {
    return this.source.spanFor(_loc);
  };

  _proto.resolutionFor = function resolutionFor(node, resolution) {
    if (this.strict) {
      return {
        resolution: ASTv2.STRICT_RESOLUTION
      };
    }

    if (this.isFreeVar(node)) {
      var r = resolution(node);

      if (r === null) {
        return {
          resolution: 'error',
          path: printPath(node),
          head: printHead(node)
        };
      }

      return {
        resolution: r
      };
    } else {
      return {
        resolution: ASTv2.STRICT_RESOLUTION
      };
    }
  };

  _proto.isFreeVar = function isFreeVar(callee) {
    if (callee.type === 'PathExpression') {
      if (callee.head.type !== 'VarHead') {
        return false;
      }

      return !this.table.has(callee.head.name);
    } else if (callee.path.type === 'PathExpression') {
      return this.isFreeVar(callee.path);
    } else {
      return false;
    }
  };

  _proto.hasBinding = function hasBinding(name) {
    return this.table.has(name);
  };

  _proto.child = function child(blockParams) {
    return new BlockContext(this.source, this.options, this.table.child(blockParams));
  };

  _proto.customizeComponentName = function customizeComponentName(input) {
    if (this.options.customizeComponentName) {
      return this.options.customizeComponentName(input);
    } else {
      return input;
    }
  };

  _createClass(BlockContext, [{
    key: "strict",
    get: function get() {
      return this.options.strictMode || false;
    }
  }]);

  return BlockContext;
}();
/**
 * An `ExpressionNormalizer` normalizes expressions within a block.
 *
 * `ExpressionNormalizer` is stateless.
 */


exports.BlockContext = BlockContext;

var ExpressionNormalizer = /*#__PURE__*/function () {
  function ExpressionNormalizer(block) {
    this.block = block;
  }

  var _proto2 = ExpressionNormalizer.prototype;

  _proto2.normalize = function normalize(expr, resolution) {
    switch (expr.type) {
      case 'NullLiteral':
      case 'BooleanLiteral':
      case 'NumberLiteral':
      case 'StringLiteral':
      case 'UndefinedLiteral':
        return this.block.builder.literal(expr.value, this.block.loc(expr.loc));

      case 'PathExpression':
        return this.path(expr, resolution);

      case 'SubExpression':
        {
          var _resolution = this.block.resolutionFor(expr, _looseResolution.SexpSyntaxContext);

          if (_resolution.resolution === 'error') {
            throw (0, _syntaxError.generateSyntaxError)("You attempted to invoke a path (`" + _resolution.path + "`) but " + _resolution.head + " was not in scope", expr.loc);
          }

          return this.block.builder.sexp(this.callParts(expr, _resolution.resolution), this.block.loc(expr.loc));
        }
    }
  };

  _proto2.path = function path(expr, resolution) {
    var headOffsets = this.block.loc(expr.head.loc);
    var tail = []; // start with the head

    var offset = headOffsets;

    for (var _iterator = _createForOfIteratorHelperLoose(expr.tail), _step; !(_step = _iterator()).done;) {
      var part = _step.value;
      offset = offset.sliceStartChars({
        chars: part.length,
        skipStart: 1
      });
      tail.push(new _slice.SourceSlice({
        loc: offset,
        chars: part
      }));
    }

    return this.block.builder.path(this.ref(expr.head, resolution), tail, this.block.loc(expr.loc));
  }
  /**
   * The `callParts` method takes ASTv1.CallParts as well as a syntax context and normalizes
   * it to an ASTv2 CallParts.
   */
  ;

  _proto2.callParts = function callParts(parts, context) {
    var _this = this;

    var path = parts.path,
        params = parts.params,
        hash = parts.hash;
    var callee = this.normalize(path, context);
    var paramList = params.map(function (p) {
      return _this.normalize(p, ASTv2.ARGUMENT_RESOLUTION);
    });

    var paramLoc = _spanList.SpanList.range(paramList, callee.loc.collapse('end'));

    var namedLoc = this.block.loc(hash.loc);

    var argsLoc = _spanList.SpanList.range([paramLoc, namedLoc]);

    var positional = this.block.builder.positional(params.map(function (p) {
      return _this.normalize(p, ASTv2.ARGUMENT_RESOLUTION);
    }), paramLoc);
    var named = this.block.builder.named(hash.pairs.map(function (p) {
      return _this.namedArgument(p);
    }), this.block.loc(hash.loc));
    return {
      callee: callee,
      args: this.block.builder.args(positional, named, argsLoc)
    };
  };

  _proto2.namedArgument = function namedArgument(pair) {
    var offsets = this.block.loc(pair.loc);
    var keyOffsets = offsets.sliceStartChars({
      chars: pair.key.length
    });
    return this.block.builder.namedArgument(new _slice.SourceSlice({
      chars: pair.key,
      loc: keyOffsets
    }), this.normalize(pair.value, ASTv2.ARGUMENT_RESOLUTION));
  }
  /**
   * The `ref` method normalizes an `ASTv1.PathHead` into an `ASTv2.VariableReference`.
   * This method is extremely important, because it is responsible for normalizing free
   * variables into an an ASTv2.PathHead *with appropriate context*.
   *
   * The syntax context is originally determined by the syntactic position that this `PathHead`
   * came from, and is ultimately attached to the `ASTv2.VariableReference` here. In ASTv2,
   * the `VariableReference` node bears full responsibility for loose mode rules that control
   * the behavior of free variables.
   */
  ;

  _proto2.ref = function ref(head, resolution) {
    var block = this.block;
    var builder = block.builder,
        table = block.table;
    var offsets = block.loc(head.loc);

    switch (head.type) {
      case 'ThisHead':
        return builder.self(offsets);

      case 'AtHead':
        {
          var symbol = table.allocateNamed(head.name);
          return builder.at(head.name, symbol, offsets);
        }

      case 'VarHead':
        {
          if (block.hasBinding(head.name)) {
            var _table$get = table.get(head.name),
                _symbol = _table$get[0],
                isRoot = _table$get[1];

            return block.builder.localVar(head.name, _symbol, isRoot, offsets);
          } else {
            var context = block.strict ? ASTv2.STRICT_RESOLUTION : resolution;

            var _symbol2 = block.table.allocateFree(head.name, context);

            return block.builder.freeVar({
              name: head.name,
              context: context,
              symbol: _symbol2,
              loc: offsets
            });
          }
        }
    }
  };

  return ExpressionNormalizer;
}();
/**
 * `TemplateNormalizer` normalizes top-level ASTv1 statements to ASTv2.
 */


var StatementNormalizer = /*#__PURE__*/function () {
  function StatementNormalizer(block) {
    this.block = block;
  }

  var _proto3 = StatementNormalizer.prototype;

  _proto3.normalize = function normalize(node) {
    switch (node.type) {
      case 'PartialStatement':
        throw new Error("Handlebars partial syntax ({{> ...}}) is not allowed in Glimmer");

      case 'BlockStatement':
        return this.BlockStatement(node);

      case 'ElementNode':
        return new ElementNormalizer(this.block).ElementNode(node);

      case 'MustacheStatement':
        return this.MustacheStatement(node);
      // These are the same in ASTv2

      case 'MustacheCommentStatement':
        return this.MustacheCommentStatement(node);

      case 'CommentStatement':
        {
          var loc = this.block.loc(node.loc);
          return new ASTv2.HtmlComment({
            loc: loc,
            text: loc.slice({
              skipStart: 4,
              skipEnd: 3
            }).toSlice(node.value)
          });
        }

      case 'TextNode':
        return new ASTv2.HtmlText({
          loc: this.block.loc(node.loc),
          chars: node.chars
        });
    }
  };

  _proto3.MustacheCommentStatement = function MustacheCommentStatement(node) {
    var loc = this.block.loc(node.loc);
    var textLoc;

    if (loc.asString().slice(0, 5) === '{{!--') {
      textLoc = loc.slice({
        skipStart: 5,
        skipEnd: 4
      });
    } else {
      textLoc = loc.slice({
        skipStart: 3,
        skipEnd: 2
      });
    }

    return new ASTv2.GlimmerComment({
      loc: loc,
      text: textLoc.toSlice(node.value)
    });
  }
  /**
   * Normalizes an ASTv1.MustacheStatement to an ASTv2.AppendStatement
   */
  ;

  _proto3.MustacheStatement = function MustacheStatement(mustache) {
    var escaped = mustache.escaped;
    var loc = this.block.loc(mustache.loc); // Normalize the call parts in AppendSyntaxContext

    var callParts = this.expr.callParts({
      path: mustache.path,
      params: mustache.params,
      hash: mustache.hash
    }, (0, _looseResolution.AppendSyntaxContext)(mustache));
    var value = callParts.args.isEmpty() ? callParts.callee : this.block.builder.sexp(callParts, loc);
    return this.block.builder.append({
      table: this.block.table,
      trusting: !escaped,
      value: value
    }, loc);
  }
  /**
   * Normalizes a ASTv1.BlockStatement to an ASTv2.BlockStatement
   */
  ;

  _proto3.BlockStatement = function BlockStatement(block) {
    var program = block.program,
        inverse = block.inverse;
    var loc = this.block.loc(block.loc);
    var resolution = this.block.resolutionFor(block, _looseResolution.BlockSyntaxContext);

    if (resolution.resolution === 'error') {
      throw (0, _syntaxError.generateSyntaxError)("You attempted to invoke a path (`{{#" + resolution.path + "}}`) but " + resolution.head + " was not in scope", loc);
    }

    var callParts = this.expr.callParts(block, resolution.resolution);
    return this.block.builder.blockStatement((0, _util.assign)({
      symbols: this.block.table,
      program: this.Block(program),
      inverse: inverse ? this.Block(inverse) : null
    }, callParts), loc);
  };

  _proto3.Block = function Block(_ref) {
    var body = _ref.body,
        loc = _ref.loc,
        blockParams = _ref.blockParams;
    var child = this.block.child(blockParams);
    var normalizer = new StatementNormalizer(child);
    return new BlockChildren(this.block.loc(loc), body.map(function (b) {
      return normalizer.normalize(b);
    }), this.block).assertBlock(child.table);
  };

  _createClass(StatementNormalizer, [{
    key: "expr",
    get: function get() {
      return new ExpressionNormalizer(this.block);
    }
  }]);

  return StatementNormalizer;
}();

var ElementNormalizer = /*#__PURE__*/function () {
  function ElementNormalizer(ctx) {
    this.ctx = ctx;
  }
  /**
   * Normalizes an ASTv1.ElementNode to:
   *
   * - ASTv2.NamedBlock if the tag name begins with `:`
   * - ASTv2.Component if the tag name matches the component heuristics
   * - ASTv2.SimpleElement if the tag name doesn't match the component heuristics
   *
   * A tag name represents a component if:
   *
   * - it begins with `@`
   * - it is exactly `this` or begins with `this.`
   * - the part before the first `.` is a reference to an in-scope variable binding
   * - it begins with an uppercase character
   */


  var _proto4 = ElementNormalizer.prototype;

  _proto4.ElementNode = function ElementNode(element) {
    var _this2 = this;

    var tag = element.tag,
        selfClosing = element.selfClosing,
        comments = element.comments;
    var loc = this.ctx.loc(element.loc);

    var _tag$split = tag.split('.'),
        tagHead = _tag$split[0],
        rest = _tag$split.slice(1); // the head, attributes and modifiers are in the current scope


    var path = this.classifyTag(tagHead, rest, element.loc);
    var attrs = element.attributes.filter(function (a) {
      return a.name[0] !== '@';
    }).map(function (a) {
      return _this2.attr(a);
    });
    var args = element.attributes.filter(function (a) {
      return a.name[0] === '@';
    }).map(function (a) {
      return _this2.arg(a);
    });
    var modifiers = element.modifiers.map(function (m) {
      return _this2.modifier(m);
    }); // the element's block params are in scope for the children

    var child = this.ctx.child(element.blockParams);
    var normalizer = new StatementNormalizer(child);
    var childNodes = element.children.map(function (s) {
      return normalizer.normalize(s);
    });
    var el = this.ctx.builder.element({
      selfClosing: selfClosing,
      attrs: attrs,
      componentArgs: args,
      modifiers: modifiers,
      comments: comments.map(function (c) {
        return new StatementNormalizer(_this2.ctx).MustacheCommentStatement(c);
      })
    });
    var children = new ElementChildren(el, loc, childNodes, this.ctx);
    var offsets = this.ctx.loc(element.loc);
    var tagOffsets = offsets.sliceStartChars({
      chars: tag.length,
      skipStart: 1
    });

    if (path === 'ElementHead') {
      if (tag[0] === ':') {
        return children.assertNamedBlock(tagOffsets.slice({
          skipStart: 1
        }).toSlice(tag.slice(1)), child.table);
      } else {
        return children.assertElement(tagOffsets.toSlice(tag), element.blockParams.length > 0);
      }
    }

    if (element.selfClosing) {
      return el.selfClosingComponent(path, loc);
    } else {
      var blocks = children.assertComponent(tag, child.table, element.blockParams.length > 0);
      return el.componentWithNamedBlocks(path, blocks, loc);
    }
  };

  _proto4.modifier = function modifier(m) {
    var resolution = this.ctx.resolutionFor(m, _looseResolution.ModifierSyntaxContext);

    if (resolution.resolution === 'error') {
      throw (0, _syntaxError.generateSyntaxError)("You attempted to invoke a path (`{{#" + resolution.path + "}}`) as a modifier, but " + resolution.head + " was not in scope. Try adding `this` to the beginning of the path", m.loc);
    }

    var callParts = this.expr.callParts(m, resolution.resolution);
    return this.ctx.builder.modifier(callParts, this.ctx.loc(m.loc));
  }
  /**
   * This method handles attribute values that are curlies, as well as curlies nested inside of
   * interpolations:
   *
   * ```hbs
   * <a href={{url}} />
   * <a href="{{url}}.html" />
   * ```
   */
  ;

  _proto4.mustacheAttr = function mustacheAttr(mustache) {
    // Normalize the call parts in AttrValueSyntaxContext
    var sexp = this.ctx.builder.sexp(this.expr.callParts(mustache, (0, _looseResolution.AttrValueSyntaxContext)(mustache)), this.ctx.loc(mustache.loc)); // If there are no params or hash, just return the function part as its own expression

    if (sexp.args.isEmpty()) {
      return sexp.callee;
    } else {
      return sexp;
    }
  }
  /**
   * attrPart is the narrowed down list of valid attribute values that are also
   * allowed as a concat part (you can't nest concats).
   */
  ;

  _proto4.attrPart = function attrPart(part) {
    switch (part.type) {
      case 'MustacheStatement':
        return {
          expr: this.mustacheAttr(part),
          trusting: !part.escaped
        };

      case 'TextNode':
        return {
          expr: this.ctx.builder.literal(part.chars, this.ctx.loc(part.loc)),
          trusting: true
        };
    }
  };

  _proto4.attrValue = function attrValue(part) {
    var _this3 = this;

    switch (part.type) {
      case 'ConcatStatement':
        {
          var parts = part.parts.map(function (p) {
            return _this3.attrPart(p).expr;
          });
          return {
            expr: this.ctx.builder.interpolate(parts, this.ctx.loc(part.loc)),
            trusting: false
          };
        }

      default:
        return this.attrPart(part);
    }
  };

  _proto4.attr = function attr(m) {
    false && (0, _util.assert)(m.name[0] !== '@', 'An attr name must not start with `@`');

    if (m.name === '...attributes') {
      return this.ctx.builder.splatAttr(this.ctx.table.allocateBlock('attrs'), this.ctx.loc(m.loc));
    }

    var offsets = this.ctx.loc(m.loc);
    var nameSlice = offsets.sliceStartChars({
      chars: m.name.length
    }).toSlice(m.name);
    var value = this.attrValue(m.value);
    return this.ctx.builder.attr({
      name: nameSlice,
      value: value.expr,
      trusting: value.trusting
    }, offsets);
  };

  _proto4.maybeDeprecatedCall = function maybeDeprecatedCall(arg, part) {
    if (this.ctx.strict) {
      return null;
    }

    if (part.type !== 'MustacheStatement') {
      return null;
    }

    var path = part.path;

    if (path.type !== 'PathExpression') {
      return null;
    }

    if (path.head.type !== 'VarHead') {
      return null;
    }

    var name = path.head.name;

    if (name === 'has-block' || name === 'has-block-params') {
      return null;
    }

    if (this.ctx.hasBinding(name)) {
      return null;
    }

    if (path.tail.length !== 0) {
      return null;
    }

    if (part.params.length !== 0 || part.hash.pairs.length !== 0) {
      return null;
    }

    var context = ASTv2.LooseModeResolution.attr();
    var callee = this.ctx.builder.freeVar({
      name: name,
      context: context,
      symbol: this.ctx.table.allocateFree(name, context),
      loc: path.loc
    });
    return {
      expr: this.ctx.builder.deprecatedCall(arg, callee, part.loc),
      trusting: false
    };
  };

  _proto4.arg = function arg(_arg) {
    false && (0, _util.assert)(_arg.name[0] === '@', 'An arg name must start with `@`');
    var offsets = this.ctx.loc(_arg.loc);
    var nameSlice = offsets.sliceStartChars({
      chars: _arg.name.length
    }).toSlice(_arg.name);
    var value = this.maybeDeprecatedCall(nameSlice, _arg.value) || this.attrValue(_arg.value);
    return this.ctx.builder.arg({
      name: nameSlice,
      value: value.expr,
      trusting: value.trusting
    }, offsets);
  }
  /**
   * This function classifies the head of an ASTv1.Element into an ASTv2.PathHead (if the
   * element is a component) or `'ElementHead'` (if the element is a simple element).
   *
   * Rules:
   *
   * 1. If the variable is an `@arg`, return an `AtHead`
   * 2. If the variable is `this`, return a `ThisHead`
   * 3. If the variable is in the current scope:
   *   a. If the scope is the root scope, then return a Free `LocalVarHead`
   *   b. Else, return a standard `LocalVarHead`
   * 4. If the tag name is a path and the variable is not in the current scope, Syntax Error
   * 5. If the variable is uppercase return a FreeVar(ResolveAsComponentHead)
   * 6. Otherwise, return `'ElementHead'`
   */
  ;

  _proto4.classifyTag = function classifyTag(variable, tail, loc) {
    var uppercase = (0, _utils.isUpperCase)(variable);
    var inScope = variable[0] === '@' || variable === 'this' || this.ctx.hasBinding(variable);

    if (this.ctx.strict && !inScope) {
      if (uppercase) {
        throw (0, _syntaxError.generateSyntaxError)("Attempted to invoke a component that was not in scope in a strict mode template, `<" + variable + ">`. If you wanted to create an element with that name, convert it to lowercase - `<" + variable.toLowerCase() + ">`", loc);
      } // In strict mode, values are always elements unless they are in scope


      return 'ElementHead';
    } // Since the parser handed us the HTML element name as a string, we need
    // to convert it into an ASTv1 path so it can be processed using the
    // expression normalizer.


    var isComponent = inScope || uppercase;
    var variableLoc = loc.sliceStartChars({
      skipStart: 1,
      chars: variable.length
    });
    var tailLength = tail.reduce(function (accum, part) {
      return accum + 1 + part.length;
    }, 0);
    var pathEnd = variableLoc.getEnd().move(tailLength);
    var pathLoc = variableLoc.withEnd(pathEnd);

    if (isComponent) {
      var path = _parserBuilders.default.path({
        head: _parserBuilders.default.head(variable, variableLoc),
        tail: tail,
        loc: pathLoc
      });

      var resolution = this.ctx.resolutionFor(path, _looseResolution.ComponentSyntaxContext);

      if (resolution.resolution === 'error') {
        throw (0, _syntaxError.generateSyntaxError)("You attempted to invoke a path (`<" + resolution.path + ">`) but " + resolution.head + " was not in scope", loc);
      }

      return new ExpressionNormalizer(this.ctx).normalize(path, resolution.resolution);
    } // If the tag name wasn't a valid component but contained a `.`, it's
    // a syntax error.


    if (tail.length > 0) {
      throw (0, _syntaxError.generateSyntaxError)("You used " + variable + "." + tail.join('.') + " as a tag name, but " + variable + " is not in scope", loc);
    }

    return 'ElementHead';
  };

  _createClass(ElementNormalizer, [{
    key: "expr",
    get: function get() {
      return new ExpressionNormalizer(this.ctx);
    }
  }]);

  return ElementNormalizer;
}();

var Children = function Children(loc, children, block) {
  this.loc = loc;
  this.children = children;
  this.block = block;
  this.namedBlocks = children.filter(function (c) {
    return c instanceof ASTv2.NamedBlock;
  });
  this.hasSemanticContent = Boolean(children.filter(function (c) {
    if (c instanceof ASTv2.NamedBlock) {
      return false;
    }

    switch (c.type) {
      case 'GlimmerComment':
      case 'HtmlComment':
        return false;

      case 'HtmlText':
        return !/^\s*$/.exec(c.chars);

      default:
        return true;
    }
  }).length);
  this.nonBlockChildren = children.filter(function (c) {
    return !(c instanceof ASTv2.NamedBlock);
  });
};

var TemplateChildren = /*#__PURE__*/function (_Children) {
  _inheritsLoose(TemplateChildren, _Children);

  function TemplateChildren() {
    return _Children.apply(this, arguments) || this;
  }

  var _proto5 = TemplateChildren.prototype;

  _proto5.assertTemplate = function assertTemplate(table) {
    if ((0, _util.isPresent)(this.namedBlocks)) {
      throw (0, _syntaxError.generateSyntaxError)("Unexpected named block at the top-level of a template", this.loc);
    }

    return this.block.builder.template(table, this.nonBlockChildren, this.block.loc(this.loc));
  };

  return TemplateChildren;
}(Children);

var BlockChildren = /*#__PURE__*/function (_Children2) {
  _inheritsLoose(BlockChildren, _Children2);

  function BlockChildren() {
    return _Children2.apply(this, arguments) || this;
  }

  var _proto6 = BlockChildren.prototype;

  _proto6.assertBlock = function assertBlock(table) {
    if ((0, _util.isPresent)(this.namedBlocks)) {
      throw (0, _syntaxError.generateSyntaxError)("Unexpected named block nested in a normal block", this.loc);
    }

    return this.block.builder.block(table, this.nonBlockChildren, this.loc);
  };

  return BlockChildren;
}(Children);

var ElementChildren = /*#__PURE__*/function (_Children3) {
  _inheritsLoose(ElementChildren, _Children3);

  function ElementChildren(el, loc, children, block) {
    var _this4;

    _this4 = _Children3.call(this, loc, children, block) || this;
    _this4.el = el;
    return _this4;
  }

  var _proto7 = ElementChildren.prototype;

  _proto7.assertNamedBlock = function assertNamedBlock(name, table) {
    if (this.el.base.selfClosing) {
      throw (0, _syntaxError.generateSyntaxError)("<:" + name.chars + "/> is not a valid named block: named blocks cannot be self-closing", this.loc);
    }

    if ((0, _util.isPresent)(this.namedBlocks)) {
      throw (0, _syntaxError.generateSyntaxError)("Unexpected named block inside <:" + name.chars + "> named block: named blocks cannot contain nested named blocks", this.loc);
    }

    if (!(0, _utils.isLowerCase)(name.chars)) {
      throw (0, _syntaxError.generateSyntaxError)("<:" + name.chars + "> is not a valid named block, and named blocks must begin with a lowercase letter", this.loc);
    }

    if (this.el.base.attrs.length > 0 || this.el.base.componentArgs.length > 0 || this.el.base.modifiers.length > 0) {
      throw (0, _syntaxError.generateSyntaxError)("named block <:" + name.chars + "> cannot have attributes, arguments, or modifiers", this.loc);
    }

    var offsets = _spanList.SpanList.range(this.nonBlockChildren, this.loc);

    return this.block.builder.namedBlock(name, this.block.builder.block(table, this.nonBlockChildren, offsets), this.loc);
  };

  _proto7.assertElement = function assertElement(name, hasBlockParams) {
    if (hasBlockParams) {
      throw (0, _syntaxError.generateSyntaxError)("Unexpected block params in <" + name + ">: simple elements cannot have block params", this.loc);
    }

    if ((0, _util.isPresent)(this.namedBlocks)) {
      var names = this.namedBlocks.map(function (b) {
        return b.name;
      });

      if (names.length === 1) {
        throw (0, _syntaxError.generateSyntaxError)("Unexpected named block <:foo> inside <" + name.chars + "> HTML element", this.loc);
      } else {
        var printedNames = names.map(function (n) {
          return "<:" + n.chars + ">";
        }).join(', ');
        throw (0, _syntaxError.generateSyntaxError)("Unexpected named blocks inside <" + name.chars + "> HTML element (" + printedNames + ")", this.loc);
      }
    }

    return this.el.simple(name, this.nonBlockChildren, this.loc);
  };

  _proto7.assertComponent = function assertComponent(name, table, hasBlockParams) {
    if ((0, _util.isPresent)(this.namedBlocks) && this.hasSemanticContent) {
      throw (0, _syntaxError.generateSyntaxError)("Unexpected content inside <" + name + "> component invocation: when using named blocks, the tag cannot contain other content", this.loc);
    }

    if ((0, _util.isPresent)(this.namedBlocks)) {
      if (hasBlockParams) {
        throw (0, _syntaxError.generateSyntaxError)("Unexpected block params list on <" + name + "> component invocation: when passing named blocks, the invocation tag cannot take block params", this.loc);
      }

      var seenNames = new Set();

      for (var _iterator2 = _createForOfIteratorHelperLoose(this.namedBlocks), _step2; !(_step2 = _iterator2()).done;) {
        var block = _step2.value;
        var _name = block.name.chars;

        if (seenNames.has(_name)) {
          throw (0, _syntaxError.generateSyntaxError)("Component had two named blocks with the same name, `<:" + _name + ">`. Only one block with a given name may be passed", this.loc);
        }

        if (_name === 'inverse' && seenNames.has('else') || _name === 'else' && seenNames.has('inverse')) {
          throw (0, _syntaxError.generateSyntaxError)("Component has both <:else> and <:inverse> block. <:inverse> is an alias for <:else>", this.loc);
        }

        seenNames.add(_name);
      }

      return this.namedBlocks;
    } else {
      return [this.block.builder.namedBlock(_slice.SourceSlice.synthetic('default'), this.block.builder.block(table, this.nonBlockChildren, this.loc), this.loc)];
    }
  };

  return ElementChildren;
}(Children);

function printPath(node) {
  if (node.type !== 'PathExpression' && node.path.type === 'PathExpression') {
    return printPath(node.path);
  } else {
    return new _printer.default({
      entityEncoding: 'raw'
    }).print(node);
  }
}

function printHead(node) {
  if (node.type === 'PathExpression') {
    switch (node.head.type) {
      case 'AtHead':
      case 'VarHead':
        return node.head.name;

      case 'ThisHead':
        return 'this';
    }
  } else if (node.path.type === 'PathExpression') {
    return printHead(node.path);
  } else {
    return new _printer.default({
      entityEncoding: 'raw'
    }).print(node);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9ub3JtYWxpemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFVTSxTQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsT0FBQSxFQUUyQjtBQUFBLE1BQS9CLE9BQStCLEtBQUEsS0FBQSxDQUFBLEVBQUE7QUFBL0IsSUFBQSxPQUErQixHQUYzQixFQUVKO0FBQStCOzs7O0FBRS9CLE1BQUksR0FBRyxHQUFHLHdDQUFVLE1BQVYsRUFBVixPQUFVLENBQVY7QUFFQSxNQUFJLGdCQUFnQixHQUFHLGtCQUNyQjtBQUNFLElBQUEsVUFBVSxFQURaLEtBQUE7QUFFRSxJQUFBLE1BQU0sRUFBRTtBQUZWLEdBRHFCLEVBQXZCLE9BQXVCLENBQXZCOztBQVFBLE1BQUksR0FBRyxHQUFHLHlCQUFBLEdBQUEsQ0FDUixnQkFBZ0IsQ0FEUixNQUFBLEVBQ2UsQ0FBQSxFQUFBLEdBQ3ZCO0FBQ0EsRUFBQSxPQUFPLENBRmdCLHNCQUFBLE1BQUEsSUFBQSxJQUVPLEVBQUEsS0FBQSxLQUZQLENBQUEsR0FBQSxFQUFBLEdBRWEsVUFBRCxJQUFDLEVBQUQ7QUFBQSxXQUhyQyxJQUdxQztBQUhyQyxHQUFVLENBQVY7O0FBS0EsTUFBSSxLQUFLLEdBQUcsSUFBQSxZQUFBLENBQUEsTUFBQSxFQUFBLGdCQUFBLEVBQVosR0FBWSxDQUFaO0FBQ0EsTUFBSSxVQUFVLEdBQUcsSUFBQSxtQkFBQSxDQUFqQixLQUFpQixDQUFqQjtBQUVBLE1BQUksS0FBSyxHQUFHLElBQUEsZ0JBQUEsQ0FDVixLQUFLLENBQUwsR0FBQSxDQUFV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QUFDNUQsTUFBSSxJQUFJLENBQUosSUFBQSxLQUFBLGdCQUFBLElBQWtDLElBQUksQ0FBSixJQUFBLENBQUEsSUFBQSxLQUF0QyxnQkFBQSxFQUEyRTtBQUN6RSxXQUFPLFNBQVMsQ0FBQyxJQUFJLENBQXJCLElBQWdCLENBQWhCO0FBREYsR0FBQSxNQUVPO0FBQ0wsV0FBTyxJQUFBLGdCQUFBLENBQVk7QUFBRSxNQUFBLGNBQWMsRUFBRTtBQUFsQixLQUFaLEVBQUEsS0FBQSxDQUFQLElBQU8sQ0FBUDtBQUNEO0FBQ0Y7O0FBRUQsU0FBQSxTQUFBLENBQUEsSUFBQSxFQUE4RDtBQUM1RCxNQUFJLElBQUksQ0FBSixJQUFBLEtBQUosZ0JBQUEsRUFBb0M7QUFDbEMsWUFBUSxJQUFJLENBQUosSUFBQSxDQUFSLElBQUE7QUFDRSxXQUFBLFFBQUE7QUFDQSxXQUFBLFNBQUE7QUFDRSxlQUFPLElBQUksQ0FBSixJQUFBLENBQVAsSUFBQTs7QUFDRixXQUFBLFVBQUE7QUFDRSxlQUFBLE1BQUE7QUFMSjtBQURGLEdBQUEsTUFRTyxJQUFJLElBQUksQ0FBSixJQUFBLENBQUEsSUFBQSxLQUFKLGdCQUFBLEVBQXlDO0FBQzlDLFdBQU8sU0FBUyxDQUFDLElBQUksQ0FBckIsSUFBZ0IsQ0FBaEI7QUFESyxHQUFBLE1BRUE7QUFDTCxXQUFPLElBQUEsZ0JBQUEsQ0FBWTtBQUFFLE1BQUEsY0FBYyxFQUFFO0FBQWxCLEtBQVosRUFBQSxLQUFBLENBQVAsSUFBTyxDQUFQO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByZXNlbnRBcnJheSB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYXNzZXJ0LCBhc3NpZ24sIGlzUHJlc2VudCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuXG5pbXBvcnQgUHJpbnRlciBmcm9tICcuLi9nZW5lcmF0aW9uL3ByaW50ZXInO1xuaW1wb3J0IHsgUHJlY29tcGlsZU9wdGlvbnMsIHByZXByb2Nlc3MgfSBmcm9tICcuLi9wYXJzZXIvdG9rZW5pemVyLWV2ZW50LWhhbmRsZXJzJztcbmltcG9ydCB7IFNvdXJjZUxvY2F0aW9uIH0gZnJvbSAnLi4vc291cmNlL2xvY2F0aW9uJztcbmltcG9ydCB7IFNvdXJjZVNsaWNlIH0gZnJvbSAnLi4vc291cmNlL3NsaWNlJztcbmltcG9ydCB7IFNvdXJjZSB9IGZyb20gJy4uL3NvdXJjZS9zb3VyY2UnO1xuaW1wb3J0IHsgU291cmNlU3BhbiB9IGZyb20gJy4uL3NvdXJjZS9zcGFuJztcbmltcG9ydCB7IFNwYW5MaXN0IH0gZnJvbSAnLi4vc291cmNlL3NwYW4tbGlzdCc7XG5pbXBvcnQgeyBCbG9ja1N5bWJvbFRhYmxlLCBQcm9ncmFtU3ltYm9sVGFibGUsIFN5bWJvbFRhYmxlIH0gZnJvbSAnLi4vc3ltYm9sLXRhYmxlJztcbmltcG9ydCB7IGdlbmVyYXRlU3ludGF4RXJyb3IgfSBmcm9tICcuLi9zeW50YXgtZXJyb3InO1xuaW1wb3J0IHsgaXNMb3dlckNhc2UsIGlzVXBwZXJDYXNlIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0ICogYXMgQVNUdjEgZnJvbSAnLi4vdjEvYXBpJztcbmltcG9ydCBiIGZyb20gJy4uL3YxL3BhcnNlci1idWlsZGVycyc7XG5pbXBvcnQgKiBhcyBBU1R2MiBmcm9tICcuL2FwaSc7XG5pbXBvcnQgeyBCdWlsZEVsZW1lbnQsIEJ1aWxkZXIsIENhbGxQYXJ0cyB9IGZyb20gJy4vYnVpbGRlcnMnO1xuaW1wb3J0IHtcbiAgQXBwZW5kU3ludGF4Q29udGV4dCxcbiAgQXR0clZhbHVlU3ludGF4Q29udGV4dCxcbiAgQmxvY2tTeW50YXhDb250ZXh0LFxuICBDb21wb25lbnRTeW50YXhDb250ZXh0LFxuICBNb2RpZmllclN5bnRheENvbnRleHQsXG4gIFJlc29sdXRpb24sXG4gIFNleHBTeW50YXhDb250ZXh0LFxufSBmcm9tICcuL2xvb3NlLXJlc29sdXRpb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKFxuICBzb3VyY2U6IFNvdXJjZSxcbiAgb3B0aW9uczogUHJlY29tcGlsZU9wdGlvbnMgPSB7fVxuKTogW2FzdDogQVNUdjIuVGVtcGxhdGUsIGxvY2Fsczogc3RyaW5nW11dIHtcbiAgbGV0IGFzdCA9IHByZXByb2Nlc3Moc291cmNlLCBvcHRpb25zKTtcblxuICBsZXQgbm9ybWFsaXplT3B0aW9ucyA9IGFzc2lnbihcbiAgICB7XG4gICAgICBzdHJpY3RNb2RlOiBmYWxzZSxcbiAgICAgIGxvY2FsczogW10sXG4gICAgfSxcbiAgICBvcHRpb25zXG4gICk7XG5cbiAgbGV0IHRvcCA9IFN5bWJvbFRhYmxlLnRvcChcbiAgICBub3JtYWxpemVPcHRpb25zLmxvY2FscyxcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3VuYm91bmQtbWV0aG9kXG4gICAgb3B0aW9ucy5jdXN0b21pemVDb21wb25lbnROYW1lID8/ICgobmFtZSkgPT4gbmFtZSlcbiAgKTtcbiAgbGV0IGJsb2NrID0gbmV3IEJsb2NrQ29udGV4dChzb3VyY2UsIG5vcm1hbGl6ZU9wdGlvbnMsIHRvcCk7XG4gIGxldCBub3JtYWxpemVyID0gbmV3IFN0YXRlbWVudE5vcm1hbGl6ZXIoYmxvY2spO1xuXG4gIGxldCBhc3RWMiA9IG5ldyBUZW1wbGF0ZUNoaWxkcmVuKFxuICAgIGJsb2NrLmxvYyhhc3QubG9jKSxcbiAgICBhc3QuYm9keS5tYXAoKGIpID0+IG5vcm1hbGl6ZXIubm9ybWFsaXplKGIpKSxcbiAgICBibG9ja1xuICApLmFzc2VydFRlbXBsYXRlKHRvcCk7XG5cbiAgbGV0IGxvY2FscyA9IHRvcC5nZXRVc2VkVGVtcGxhdGVMb2NhbHMoKTtcblxuICByZXR1cm4gW2FzdFYyLCBsb2NhbHNdO1xufVxuXG4vKipcbiAqIEEgYEJsb2NrQ29udGV4dGAgcmVwcmVzZW50cyB0aGUgYmxvY2sgdGhhdCBhIHBhcnRpY3VsYXIgQVNUIG5vZGUgaXMgY29udGFpbmVkIGluc2lkZSBvZi5cbiAqXG4gKiBgQmxvY2tDb250ZXh0YCBpcyBhd2FyZSBvZiB0ZW1wbGF0ZS13aWRlIG9wdGlvbnMgKHN1Y2ggYXMgc3RyaWN0IG1vZGUpLCBhcyB3ZWxsIGFzIHRoZSBiaW5kaW5nc1xuICogdGhhdCBhcmUgaW4tc2NvcGUgd2l0aGluIHRoYXQgYmxvY2suXG4gKlxuICogQ29uY3JldGVseSwgaXQgaGFzIHRoZSBgUHJlY29tcGlsZU9wdGlvbnNgIGFuZCBjdXJyZW50IGBTeW1ib2xUYWJsZWAsIGFuZCBwcm92aWRlc1xuICogZmFjaWxpdGllcyBmb3Igd29ya2luZyB3aXRoIHRob3NlIG9wdGlvbnMuXG4gKlxuICogYEJsb2NrQ29udGV4dGAgaXMgc3RhdGVsZXNzLlxuICovXG5leHBvcnQgY2xhc3MgQmxvY2tDb250ZXh0PFRhYmxlIGV4dGVuZHMgU3ltYm9sVGFibGUgPSBTeW1ib2xUYWJsZT4ge1xuICByZWFkb25seSBidWlsZGVyOiBCdWlsZGVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IHNvdXJjZTogU291cmNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9uczogUHJlY29tcGlsZU9wdGlvbnMsXG4gICAgcmVhZG9ubHkgdGFibGU6IFRhYmxlXG4gICkge1xuICAgIHRoaXMuYnVpbGRlciA9IG5ldyBCdWlsZGVyKCk7XG4gIH1cblxuICBnZXQgc3RyaWN0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuc3RyaWN0TW9kZSB8fCBmYWxzZTtcbiAgfVxuXG4gIGxvYyhsb2M6IFNvdXJjZUxvY2F0aW9uKTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlLnNwYW5Gb3IobG9jKTtcbiAgfVxuXG4gIHJlc29sdXRpb25Gb3I8TiBleHRlbmRzIEFTVHYxLkNhbGxOb2RlIHwgQVNUdjEuUGF0aEV4cHJlc3Npb24+KFxuICAgIG5vZGU6IE4sXG4gICAgcmVzb2x1dGlvbjogUmVzb2x1dGlvbjxOPlxuICApOiB7IHJlc29sdXRpb246IEFTVHYyLkZyZWVWYXJSZXNvbHV0aW9uIH0gfCB7IHJlc29sdXRpb246ICdlcnJvcic7IHBhdGg6IHN0cmluZzsgaGVhZDogc3RyaW5nIH0ge1xuICAgIGlmICh0aGlzLnN0cmljdCkge1xuICAgICAgcmV0dXJuIHsgcmVzb2x1dGlvbjogQVNUdjIuU1RSSUNUX1JFU09MVVRJT04gfTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0ZyZWVWYXIobm9kZSkpIHtcbiAgICAgIGxldCByID0gcmVzb2x1dGlvbihub2RlKTtcblxuICAgICAgaWYgKHIgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXNvbHV0aW9uOiAnZXJyb3InLFxuICAgICAgICAgIHBhdGg6IHByaW50UGF0aChub2RlKSxcbiAgICAgICAgICBoZWFkOiBwcmludEhlYWQobm9kZSksXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7IHJlc29sdXRpb246IHIgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHsgcmVzb2x1dGlvbjogQVNUdjIuU1RSSUNUX1JFU09MVVRJT04gfTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGlzRnJlZVZhcihjYWxsZWU6IEFTVHYxLkNhbGxOb2RlIHwgQVNUdjEuUGF0aEV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICBpZiAoY2FsbGVlLnR5cGUgPT09ICdQYXRoRXhwcmVzc2lvbicpIHtcbiAgICAgIGlmIChjYWxsZWUuaGVhZC50eXBlICE9PSAnVmFySGVhZCcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gIXRoaXMudGFibGUuaGFzKGNhbGxlZS5oZWFkLm5hbWUpO1xuICAgIH0gZWxzZSBpZiAoY2FsbGVlLnBhdGgudHlwZSA9PT0gJ1BhdGhFeHByZXNzaW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMuaXNGcmVlVmFyKGNhbGxlZS5wYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGhhc0JpbmRpbmcobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudGFibGUuaGFzKG5hbWUpO1xuICB9XG5cbiAgY2hpbGQoYmxvY2tQYXJhbXM6IHN0cmluZ1tdKTogQmxvY2tDb250ZXh0PEJsb2NrU3ltYm9sVGFibGU+IHtcbiAgICByZXR1cm4gbmV3IEJsb2NrQ29udGV4dCh0aGlzLnNvdXJjZSwgdGhpcy5vcHRpb25zLCB0aGlzLnRhYmxlLmNoaWxkKGJsb2NrUGFyYW1zKSk7XG4gIH1cblxuICBjdXN0b21pemVDb21wb25lbnROYW1lKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuY3VzdG9taXplQ29tcG9uZW50TmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5jdXN0b21pemVDb21wb25lbnROYW1lKGlucHV0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGlucHV0O1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFuIGBFeHByZXNzaW9uTm9ybWFsaXplcmAgbm9ybWFsaXplcyBleHByZXNzaW9ucyB3aXRoaW4gYSBibG9jay5cbiAqXG4gKiBgRXhwcmVzc2lvbk5vcm1hbGl6ZXJgIGlzIHN0YXRlbGVzcy5cbiAqL1xuY2xhc3MgRXhwcmVzc2lvbk5vcm1hbGl6ZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGJsb2NrOiBCbG9ja0NvbnRleHQpIHt9XG5cbiAgLyoqXG4gICAqIFRoZSBgbm9ybWFsaXplYCBtZXRob2QgdGFrZXMgYW4gYXJiaXRyYXJ5IGV4cHJlc3Npb24gYW5kIGl0cyBvcmlnaW5hbCBzeW50YXggY29udGV4dCBhbmRcbiAgICogbm9ybWFsaXplcyBpdCB0byBhbiBBU1R2MiBleHByZXNzaW9uLlxuICAgKlxuICAgKiBAc2VlIHtTeW50YXhDb250ZXh0fVxuICAgKi9cbiAgbm9ybWFsaXplKGV4cHI6IEFTVHYxLkxpdGVyYWwsIHJlc29sdXRpb246IEFTVHYyLkZyZWVWYXJSZXNvbHV0aW9uKTogQVNUdjIuTGl0ZXJhbEV4cHJlc3Npb247XG4gIG5vcm1hbGl6ZShcbiAgICBleHByOiBBU1R2MS5NaW5pbWFsUGF0aEV4cHJlc3Npb24sXG4gICAgcmVzb2x1dGlvbjogQVNUdjIuRnJlZVZhclJlc29sdXRpb25cbiAgKTogQVNUdjIuUGF0aEV4cHJlc3Npb247XG4gIG5vcm1hbGl6ZShleHByOiBBU1R2MS5TdWJFeHByZXNzaW9uLCByZXNvbHV0aW9uOiBBU1R2Mi5GcmVlVmFyUmVzb2x1dGlvbik6IEFTVHYyLkNhbGxFeHByZXNzaW9uO1xuICBub3JtYWxpemUoZXhwcjogQVNUdjEuRXhwcmVzc2lvbiwgcmVzb2x1dGlvbjogQVNUdjIuRnJlZVZhclJlc29sdXRpb24pOiBBU1R2Mi5FeHByZXNzaW9uTm9kZTtcbiAgbm9ybWFsaXplKFxuICAgIGV4cHI6IEFTVHYxLkV4cHJlc3Npb24gfCBBU1R2MS5NaW5pbWFsUGF0aEV4cHJlc3Npb24sXG4gICAgcmVzb2x1dGlvbjogQVNUdjIuRnJlZVZhclJlc29sdXRpb25cbiAgKTogQVNUdjIuRXhwcmVzc2lvbk5vZGUge1xuICAgIHN3aXRjaCAoZXhwci50eXBlKSB7XG4gICAgICBjYXNlICdOdWxsTGl0ZXJhbCc6XG4gICAgICBjYXNlICdCb29sZWFuTGl0ZXJhbCc6XG4gICAgICBjYXNlICdOdW1iZXJMaXRlcmFsJzpcbiAgICAgIGNhc2UgJ1N0cmluZ0xpdGVyYWwnOlxuICAgICAgY2FzZSAnVW5kZWZpbmVkTGl0ZXJhbCc6XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrLmJ1aWxkZXIubGl0ZXJhbChleHByLnZhbHVlLCB0aGlzLmJsb2NrLmxvYyhleHByLmxvYykpO1xuICAgICAgY2FzZSAnUGF0aEV4cHJlc3Npb24nOlxuICAgICAgICByZXR1cm4gdGhpcy5wYXRoKGV4cHIsIHJlc29sdXRpb24pO1xuICAgICAgY2FzZSAnU3ViRXhwcmVzc2lvbic6IHtcbiAgICAgICAgbGV0IHJlc29sdXRpb24gPSB0aGlzLmJsb2NrLnJlc29sdXRpb25Gb3IoZXhwciwgU2V4cFN5bnRheENvbnRleHQpO1xuXG4gICAgICAgIGlmIChyZXNvbHV0aW9uLnJlc29sdXRpb24gPT09ICdlcnJvcicpIHtcbiAgICAgICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKFxuICAgICAgICAgICAgYFlvdSBhdHRlbXB0ZWQgdG8gaW52b2tlIGEgcGF0aCAoXFxgJHtyZXNvbHV0aW9uLnBhdGh9XFxgKSBidXQgJHtyZXNvbHV0aW9uLmhlYWR9IHdhcyBub3QgaW4gc2NvcGVgLFxuICAgICAgICAgICAgZXhwci5sb2NcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2suYnVpbGRlci5zZXhwKFxuICAgICAgICAgIHRoaXMuY2FsbFBhcnRzKGV4cHIsIHJlc29sdXRpb24ucmVzb2x1dGlvbiksXG4gICAgICAgICAgdGhpcy5ibG9jay5sb2MoZXhwci5sb2MpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwYXRoKFxuICAgIGV4cHI6IEFTVHYxLk1pbmltYWxQYXRoRXhwcmVzc2lvbixcbiAgICByZXNvbHV0aW9uOiBBU1R2Mi5GcmVlVmFyUmVzb2x1dGlvblxuICApOiBBU1R2Mi5QYXRoRXhwcmVzc2lvbiB7XG4gICAgbGV0IGhlYWRPZmZzZXRzID0gdGhpcy5ibG9jay5sb2MoZXhwci5oZWFkLmxvYyk7XG5cbiAgICBsZXQgdGFpbCA9IFtdO1xuXG4gICAgLy8gc3RhcnQgd2l0aCB0aGUgaGVhZFxuICAgIGxldCBvZmZzZXQgPSBoZWFkT2Zmc2V0cztcblxuICAgIGZvciAobGV0IHBhcnQgb2YgZXhwci50YWlsKSB7XG4gICAgICBvZmZzZXQgPSBvZmZzZXQuc2xpY2VTdGFydENoYXJzKHsgY2hhcnM6IHBhcnQubGVuZ3RoLCBza2lwU3RhcnQ6IDEgfSk7XG4gICAgICB0YWlsLnB1c2goXG4gICAgICAgIG5ldyBTb3VyY2VTbGljZSh7XG4gICAgICAgICAgbG9jOiBvZmZzZXQsXG4gICAgICAgICAgY2hhcnM6IHBhcnQsXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmJsb2NrLmJ1aWxkZXIucGF0aCh0aGlzLnJlZihleHByLmhlYWQsIHJlc29sdXRpb24pLCB0YWlsLCB0aGlzLmJsb2NrLmxvYyhleHByLmxvYykpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBgY2FsbFBhcnRzYCBtZXRob2QgdGFrZXMgQVNUdjEuQ2FsbFBhcnRzIGFzIHdlbGwgYXMgYSBzeW50YXggY29udGV4dCBhbmQgbm9ybWFsaXplc1xuICAgKiBpdCB0byBhbiBBU1R2MiBDYWxsUGFydHMuXG4gICAqL1xuICBjYWxsUGFydHMocGFydHM6IEFTVHYxLkNhbGxQYXJ0cywgY29udGV4dDogQVNUdjIuRnJlZVZhclJlc29sdXRpb24pOiBDYWxsUGFydHMge1xuICAgIGxldCB7IHBhdGgsIHBhcmFtcywgaGFzaCB9ID0gcGFydHM7XG5cbiAgICBsZXQgY2FsbGVlID0gdGhpcy5ub3JtYWxpemUocGF0aCwgY29udGV4dCk7XG4gICAgbGV0IHBhcmFtTGlzdCA9IHBhcmFtcy5tYXAoKHApID0+IHRoaXMubm9ybWFsaXplKHAsIEFTVHYyLkFSR1VNRU5UX1JFU09MVVRJT04pKTtcbiAgICBsZXQgcGFyYW1Mb2MgPSBTcGFuTGlzdC5yYW5nZShwYXJhbUxpc3QsIGNhbGxlZS5sb2MuY29sbGFwc2UoJ2VuZCcpKTtcbiAgICBsZXQgbmFtZWRMb2MgPSB0aGlzLmJsb2NrLmxvYyhoYXNoLmxvYyk7XG4gICAgbGV0IGFyZ3NMb2MgPSBTcGFuTGlzdC5yYW5nZShbcGFyYW1Mb2MsIG5hbWVkTG9jXSk7XG5cbiAgICBsZXQgcG9zaXRpb25hbCA9IHRoaXMuYmxvY2suYnVpbGRlci5wb3NpdGlvbmFsKFxuICAgICAgcGFyYW1zLm1hcCgocCkgPT4gdGhpcy5ub3JtYWxpemUocCwgQVNUdjIuQVJHVU1FTlRfUkVTT0xVVElPTikpLFxuICAgICAgcGFyYW1Mb2NcbiAgICApO1xuXG4gICAgbGV0IG5hbWVkID0gdGhpcy5ibG9jay5idWlsZGVyLm5hbWVkKFxuICAgICAgaGFzaC5wYWlycy5tYXAoKHApID0+IHRoaXMubmFtZWRBcmd1bWVudChwKSksXG4gICAgICB0aGlzLmJsb2NrLmxvYyhoYXNoLmxvYylcbiAgICApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNhbGxlZSxcbiAgICAgIGFyZ3M6IHRoaXMuYmxvY2suYnVpbGRlci5hcmdzKHBvc2l0aW9uYWwsIG5hbWVkLCBhcmdzTG9jKSxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBuYW1lZEFyZ3VtZW50KHBhaXI6IEFTVHYxLkhhc2hQYWlyKTogQVNUdjIuTmFtZWRBcmd1bWVudCB7XG4gICAgbGV0IG9mZnNldHMgPSB0aGlzLmJsb2NrLmxvYyhwYWlyLmxvYyk7XG5cbiAgICBsZXQga2V5T2Zmc2V0cyA9IG9mZnNldHMuc2xpY2VTdGFydENoYXJzKHsgY2hhcnM6IHBhaXIua2V5Lmxlbmd0aCB9KTtcblxuICAgIHJldHVybiB0aGlzLmJsb2NrLmJ1aWxkZXIubmFtZWRBcmd1bWVudChcbiAgICAgIG5ldyBTb3VyY2VTbGljZSh7IGNoYXJzOiBwYWlyLmtleSwgbG9jOiBrZXlPZmZzZXRzIH0pLFxuICAgICAgdGhpcy5ub3JtYWxpemUocGFpci52YWx1ZSwgQVNUdjIuQVJHVU1FTlRfUkVTT0xVVElPTilcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBgcmVmYCBtZXRob2Qgbm9ybWFsaXplcyBhbiBgQVNUdjEuUGF0aEhlYWRgIGludG8gYW4gYEFTVHYyLlZhcmlhYmxlUmVmZXJlbmNlYC5cbiAgICogVGhpcyBtZXRob2QgaXMgZXh0cmVtZWx5IGltcG9ydGFudCwgYmVjYXVzZSBpdCBpcyByZXNwb25zaWJsZSBmb3Igbm9ybWFsaXppbmcgZnJlZVxuICAgKiB2YXJpYWJsZXMgaW50byBhbiBhbiBBU1R2Mi5QYXRoSGVhZCAqd2l0aCBhcHByb3ByaWF0ZSBjb250ZXh0Ki5cbiAgICpcbiAgICogVGhlIHN5bnRheCBjb250ZXh0IGlzIG9yaWdpbmFsbHkgZGV0ZXJtaW5lZCBieSB0aGUgc3ludGFjdGljIHBvc2l0aW9uIHRoYXQgdGhpcyBgUGF0aEhlYWRgXG4gICAqIGNhbWUgZnJvbSwgYW5kIGlzIHVsdGltYXRlbHkgYXR0YWNoZWQgdG8gdGhlIGBBU1R2Mi5WYXJpYWJsZVJlZmVyZW5jZWAgaGVyZS4gSW4gQVNUdjIsXG4gICAqIHRoZSBgVmFyaWFibGVSZWZlcmVuY2VgIG5vZGUgYmVhcnMgZnVsbCByZXNwb25zaWJpbGl0eSBmb3IgbG9vc2UgbW9kZSBydWxlcyB0aGF0IGNvbnRyb2xcbiAgICogdGhlIGJlaGF2aW9yIG9mIGZyZWUgdmFyaWFibGVzLlxuICAgKi9cbiAgcHJpdmF0ZSByZWYoaGVhZDogQVNUdjEuUGF0aEhlYWQsIHJlc29sdXRpb246IEFTVHYyLkZyZWVWYXJSZXNvbHV0aW9uKTogQVNUdjIuVmFyaWFibGVSZWZlcmVuY2Uge1xuICAgIGxldCB7IGJsb2NrIH0gPSB0aGlzO1xuICAgIGxldCB7IGJ1aWxkZXIsIHRhYmxlIH0gPSBibG9jaztcbiAgICBsZXQgb2Zmc2V0cyA9IGJsb2NrLmxvYyhoZWFkLmxvYyk7XG5cbiAgICBzd2l0Y2ggKGhlYWQudHlwZSkge1xuICAgICAgY2FzZSAnVGhpc0hlYWQnOlxuICAgICAgICByZXR1cm4gYnVpbGRlci5zZWxmKG9mZnNldHMpO1xuICAgICAgY2FzZSAnQXRIZWFkJzoge1xuICAgICAgICBsZXQgc3ltYm9sID0gdGFibGUuYWxsb2NhdGVOYW1lZChoZWFkLm5hbWUpO1xuICAgICAgICByZXR1cm4gYnVpbGRlci5hdChoZWFkLm5hbWUsIHN5bWJvbCwgb2Zmc2V0cyk7XG4gICAgICB9XG4gICAgICBjYXNlICdWYXJIZWFkJzoge1xuICAgICAgICBpZiAoYmxvY2suaGFzQmluZGluZyhoZWFkLm5hbWUpKSB7XG4gICAgICAgICAgbGV0IFtzeW1ib2wsIGlzUm9vdF0gPSB0YWJsZS5nZXQoaGVhZC5uYW1lKTtcblxuICAgICAgICAgIHJldHVybiBibG9jay5idWlsZGVyLmxvY2FsVmFyKGhlYWQubmFtZSwgc3ltYm9sLCBpc1Jvb3QsIG9mZnNldHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBjb250ZXh0ID0gYmxvY2suc3RyaWN0ID8gQVNUdjIuU1RSSUNUX1JFU09MVVRJT04gOiByZXNvbHV0aW9uO1xuICAgICAgICAgIGxldCBzeW1ib2wgPSBibG9jay50YWJsZS5hbGxvY2F0ZUZyZWUoaGVhZC5uYW1lLCBjb250ZXh0KTtcblxuICAgICAgICAgIHJldHVybiBibG9jay5idWlsZGVyLmZyZWVWYXIoe1xuICAgICAgICAgICAgbmFtZTogaGVhZC5uYW1lLFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIHN5bWJvbCxcbiAgICAgICAgICAgIGxvYzogb2Zmc2V0cyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIGBUZW1wbGF0ZU5vcm1hbGl6ZXJgIG5vcm1hbGl6ZXMgdG9wLWxldmVsIEFTVHYxIHN0YXRlbWVudHMgdG8gQVNUdjIuXG4gKi9cbmNsYXNzIFN0YXRlbWVudE5vcm1hbGl6ZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGJsb2NrOiBCbG9ja0NvbnRleHQpIHt9XG5cbiAgbm9ybWFsaXplKG5vZGU6IEFTVHYxLlN0YXRlbWVudCk6IEFTVHYyLkNvbnRlbnROb2RlIHwgQVNUdjIuTmFtZWRCbG9jayB7XG4gICAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ1BhcnRpYWxTdGF0ZW1lbnQnOlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhhbmRsZWJhcnMgcGFydGlhbCBzeW50YXggKHt7PiAuLi59fSkgaXMgbm90IGFsbG93ZWQgaW4gR2xpbW1lcmApO1xuICAgICAgY2FzZSAnQmxvY2tTdGF0ZW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy5CbG9ja1N0YXRlbWVudChub2RlKTtcbiAgICAgIGNhc2UgJ0VsZW1lbnROb2RlJzpcbiAgICAgICAgcmV0dXJuIG5ldyBFbGVtZW50Tm9ybWFsaXplcih0aGlzLmJsb2NrKS5FbGVtZW50Tm9kZShub2RlKTtcbiAgICAgIGNhc2UgJ011c3RhY2hlU3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuTXVzdGFjaGVTdGF0ZW1lbnQobm9kZSk7XG5cbiAgICAgIC8vIFRoZXNlIGFyZSB0aGUgc2FtZSBpbiBBU1R2MlxuICAgICAgY2FzZSAnTXVzdGFjaGVDb21tZW50U3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuTXVzdGFjaGVDb21tZW50U3RhdGVtZW50KG5vZGUpO1xuXG4gICAgICBjYXNlICdDb21tZW50U3RhdGVtZW50Jzoge1xuICAgICAgICBsZXQgbG9jID0gdGhpcy5ibG9jay5sb2Mobm9kZS5sb2MpO1xuICAgICAgICByZXR1cm4gbmV3IEFTVHYyLkh0bWxDb21tZW50KHtcbiAgICAgICAgICBsb2MsXG4gICAgICAgICAgdGV4dDogbG9jLnNsaWNlKHsgc2tpcFN0YXJ0OiA0LCBza2lwRW5kOiAzIH0pLnRvU2xpY2Uobm9kZS52YWx1ZSksXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdUZXh0Tm9kZSc6XG4gICAgICAgIHJldHVybiBuZXcgQVNUdjIuSHRtbFRleHQoe1xuICAgICAgICAgIGxvYzogdGhpcy5ibG9jay5sb2Mobm9kZS5sb2MpLFxuICAgICAgICAgIGNoYXJzOiBub2RlLmNoYXJzLFxuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBNdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQobm9kZTogQVNUdjEuTXVzdGFjaGVDb21tZW50U3RhdGVtZW50KTogQVNUdjIuR2xpbW1lckNvbW1lbnQge1xuICAgIGxldCBsb2MgPSB0aGlzLmJsb2NrLmxvYyhub2RlLmxvYyk7XG4gICAgbGV0IHRleHRMb2M6IFNvdXJjZVNwYW47XG5cbiAgICBpZiAobG9jLmFzU3RyaW5nKCkuc2xpY2UoMCwgNSkgPT09ICd7eyEtLScpIHtcbiAgICAgIHRleHRMb2MgPSBsb2Muc2xpY2UoeyBza2lwU3RhcnQ6IDUsIHNraXBFbmQ6IDQgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRleHRMb2MgPSBsb2Muc2xpY2UoeyBza2lwU3RhcnQ6IDMsIHNraXBFbmQ6IDIgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBBU1R2Mi5HbGltbWVyQ29tbWVudCh7XG4gICAgICBsb2MsXG4gICAgICB0ZXh0OiB0ZXh0TG9jLnRvU2xpY2Uobm9kZS52YWx1ZSksXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyBhbiBBU1R2MS5NdXN0YWNoZVN0YXRlbWVudCB0byBhbiBBU1R2Mi5BcHBlbmRTdGF0ZW1lbnRcbiAgICovXG4gIE11c3RhY2hlU3RhdGVtZW50KG11c3RhY2hlOiBBU1R2MS5NdXN0YWNoZVN0YXRlbWVudCk6IEFTVHYyLkFwcGVuZENvbnRlbnQge1xuICAgIGxldCB7IGVzY2FwZWQgfSA9IG11c3RhY2hlO1xuICAgIGxldCBsb2MgPSB0aGlzLmJsb2NrLmxvYyhtdXN0YWNoZS5sb2MpO1xuXG4gICAgLy8gTm9ybWFsaXplIHRoZSBjYWxsIHBhcnRzIGluIEFwcGVuZFN5bnRheENvbnRleHRcbiAgICBsZXQgY2FsbFBhcnRzID0gdGhpcy5leHByLmNhbGxQYXJ0cyhcbiAgICAgIHtcbiAgICAgICAgcGF0aDogbXVzdGFjaGUucGF0aCxcbiAgICAgICAgcGFyYW1zOiBtdXN0YWNoZS5wYXJhbXMsXG4gICAgICAgIGhhc2g6IG11c3RhY2hlLmhhc2gsXG4gICAgICB9LFxuICAgICAgQXBwZW5kU3ludGF4Q29udGV4dChtdXN0YWNoZSlcbiAgICApO1xuXG4gICAgbGV0IHZhbHVlID0gY2FsbFBhcnRzLmFyZ3MuaXNFbXB0eSgpXG4gICAgICA/IGNhbGxQYXJ0cy5jYWxsZWVcbiAgICAgIDogdGhpcy5ibG9jay5idWlsZGVyLnNleHAoY2FsbFBhcnRzLCBsb2MpO1xuXG4gICAgcmV0dXJuIHRoaXMuYmxvY2suYnVpbGRlci5hcHBlbmQoXG4gICAgICB7XG4gICAgICAgIHRhYmxlOiB0aGlzLmJsb2NrLnRhYmxlLFxuICAgICAgICB0cnVzdGluZzogIWVzY2FwZWQsXG4gICAgICAgIHZhbHVlLFxuICAgICAgfSxcbiAgICAgIGxvY1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyBhIEFTVHYxLkJsb2NrU3RhdGVtZW50IHRvIGFuIEFTVHYyLkJsb2NrU3RhdGVtZW50XG4gICAqL1xuICBCbG9ja1N0YXRlbWVudChibG9jazogQVNUdjEuQmxvY2tTdGF0ZW1lbnQpOiBBU1R2Mi5JbnZva2VCbG9jayB7XG4gICAgbGV0IHsgcHJvZ3JhbSwgaW52ZXJzZSB9ID0gYmxvY2s7XG4gICAgbGV0IGxvYyA9IHRoaXMuYmxvY2subG9jKGJsb2NrLmxvYyk7XG5cbiAgICBsZXQgcmVzb2x1dGlvbiA9IHRoaXMuYmxvY2sucmVzb2x1dGlvbkZvcihibG9jaywgQmxvY2tTeW50YXhDb250ZXh0KTtcblxuICAgIGlmIChyZXNvbHV0aW9uLnJlc29sdXRpb24gPT09ICdlcnJvcicpIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgIGBZb3UgYXR0ZW1wdGVkIHRvIGludm9rZSBhIHBhdGggKFxcYHt7IyR7cmVzb2x1dGlvbi5wYXRofX19XFxgKSBidXQgJHtyZXNvbHV0aW9uLmhlYWR9IHdhcyBub3QgaW4gc2NvcGVgLFxuICAgICAgICBsb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IGNhbGxQYXJ0cyA9IHRoaXMuZXhwci5jYWxsUGFydHMoYmxvY2ssIHJlc29sdXRpb24ucmVzb2x1dGlvbik7XG5cbiAgICByZXR1cm4gdGhpcy5ibG9jay5idWlsZGVyLmJsb2NrU3RhdGVtZW50KFxuICAgICAgYXNzaWduKFxuICAgICAgICB7XG4gICAgICAgICAgc3ltYm9sczogdGhpcy5ibG9jay50YWJsZSxcbiAgICAgICAgICBwcm9ncmFtOiB0aGlzLkJsb2NrKHByb2dyYW0pLFxuICAgICAgICAgIGludmVyc2U6IGludmVyc2UgPyB0aGlzLkJsb2NrKGludmVyc2UpIDogbnVsbCxcbiAgICAgICAgfSxcbiAgICAgICAgY2FsbFBhcnRzXG4gICAgICApLFxuICAgICAgbG9jXG4gICAgKTtcbiAgfVxuXG4gIEJsb2NrKHsgYm9keSwgbG9jLCBibG9ja1BhcmFtcyB9OiBBU1R2MS5CbG9jayk6IEFTVHYyLkJsb2NrIHtcbiAgICBsZXQgY2hpbGQgPSB0aGlzLmJsb2NrLmNoaWxkKGJsb2NrUGFyYW1zKTtcbiAgICBsZXQgbm9ybWFsaXplciA9IG5ldyBTdGF0ZW1lbnROb3JtYWxpemVyKGNoaWxkKTtcbiAgICByZXR1cm4gbmV3IEJsb2NrQ2hpbGRyZW4oXG4gICAgICB0aGlzLmJsb2NrLmxvYyhsb2MpLFxuICAgICAgYm9keS5tYXAoKGIpID0+IG5vcm1hbGl6ZXIubm9ybWFsaXplKGIpKSxcbiAgICAgIHRoaXMuYmxvY2tcbiAgICApLmFzc2VydEJsb2NrKGNoaWxkLnRhYmxlKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGV4cHIoKTogRXhwcmVzc2lvbk5vcm1hbGl6ZXIge1xuICAgIHJldHVybiBuZXcgRXhwcmVzc2lvbk5vcm1hbGl6ZXIodGhpcy5ibG9jayk7XG4gIH1cbn1cblxuY2xhc3MgRWxlbWVudE5vcm1hbGl6ZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGN0eDogQmxvY2tDb250ZXh0KSB7fVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIGFuIEFTVHYxLkVsZW1lbnROb2RlIHRvOlxuICAgKlxuICAgKiAtIEFTVHYyLk5hbWVkQmxvY2sgaWYgdGhlIHRhZyBuYW1lIGJlZ2lucyB3aXRoIGA6YFxuICAgKiAtIEFTVHYyLkNvbXBvbmVudCBpZiB0aGUgdGFnIG5hbWUgbWF0Y2hlcyB0aGUgY29tcG9uZW50IGhldXJpc3RpY3NcbiAgICogLSBBU1R2Mi5TaW1wbGVFbGVtZW50IGlmIHRoZSB0YWcgbmFtZSBkb2Vzbid0IG1hdGNoIHRoZSBjb21wb25lbnQgaGV1cmlzdGljc1xuICAgKlxuICAgKiBBIHRhZyBuYW1lIHJlcHJlc2VudHMgYSBjb21wb25lbnQgaWY6XG4gICAqXG4gICAqIC0gaXQgYmVnaW5zIHdpdGggYEBgXG4gICAqIC0gaXQgaXMgZXhhY3RseSBgdGhpc2Agb3IgYmVnaW5zIHdpdGggYHRoaXMuYFxuICAgKiAtIHRoZSBwYXJ0IGJlZm9yZSB0aGUgZmlyc3QgYC5gIGlzIGEgcmVmZXJlbmNlIHRvIGFuIGluLXNjb3BlIHZhcmlhYmxlIGJpbmRpbmdcbiAgICogLSBpdCBiZWdpbnMgd2l0aCBhbiB1cHBlcmNhc2UgY2hhcmFjdGVyXG4gICAqL1xuICBFbGVtZW50Tm9kZShlbGVtZW50OiBBU1R2MS5FbGVtZW50Tm9kZSk6IEFTVHYyLkVsZW1lbnROb2RlIHtcbiAgICBsZXQgeyB0YWcsIHNlbGZDbG9zaW5nLCBjb21tZW50cyB9ID0gZWxlbWVudDtcbiAgICBsZXQgbG9jID0gdGhpcy5jdHgubG9jKGVsZW1lbnQubG9jKTtcblxuICAgIGxldCBbdGFnSGVhZCwgLi4ucmVzdF0gPSB0YWcuc3BsaXQoJy4nKTtcblxuICAgIC8vIHRoZSBoZWFkLCBhdHRyaWJ1dGVzIGFuZCBtb2RpZmllcnMgYXJlIGluIHRoZSBjdXJyZW50IHNjb3BlXG4gICAgbGV0IHBhdGggPSB0aGlzLmNsYXNzaWZ5VGFnKHRhZ0hlYWQsIHJlc3QsIGVsZW1lbnQubG9jKTtcblxuICAgIGxldCBhdHRycyA9IGVsZW1lbnQuYXR0cmlidXRlcy5maWx0ZXIoKGEpID0+IGEubmFtZVswXSAhPT0gJ0AnKS5tYXAoKGEpID0+IHRoaXMuYXR0cihhKSk7XG4gICAgbGV0IGFyZ3MgPSBlbGVtZW50LmF0dHJpYnV0ZXMuZmlsdGVyKChhKSA9PiBhLm5hbWVbMF0gPT09ICdAJykubWFwKChhKSA9PiB0aGlzLmFyZyhhKSk7XG5cbiAgICBsZXQgbW9kaWZpZXJzID0gZWxlbWVudC5tb2RpZmllcnMubWFwKChtKSA9PiB0aGlzLm1vZGlmaWVyKG0pKTtcblxuICAgIC8vIHRoZSBlbGVtZW50J3MgYmxvY2sgcGFyYW1zIGFyZSBpbiBzY29wZSBmb3IgdGhlIGNoaWxkcmVuXG4gICAgbGV0IGNoaWxkID0gdGhpcy5jdHguY2hpbGQoZWxlbWVudC5ibG9ja1BhcmFtcyk7XG4gICAgbGV0IG5vcm1hbGl6ZXIgPSBuZXcgU3RhdGVtZW50Tm9ybWFsaXplcihjaGlsZCk7XG5cbiAgICBsZXQgY2hpbGROb2RlcyA9IGVsZW1lbnQuY2hpbGRyZW4ubWFwKChzKSA9PiBub3JtYWxpemVyLm5vcm1hbGl6ZShzKSk7XG5cbiAgICBsZXQgZWwgPSB0aGlzLmN0eC5idWlsZGVyLmVsZW1lbnQoe1xuICAgICAgc2VsZkNsb3NpbmcsXG4gICAgICBhdHRycyxcbiAgICAgIGNvbXBvbmVudEFyZ3M6IGFyZ3MsXG4gICAgICBtb2RpZmllcnMsXG4gICAgICBjb21tZW50czogY29tbWVudHMubWFwKChjKSA9PiBuZXcgU3RhdGVtZW50Tm9ybWFsaXplcih0aGlzLmN0eCkuTXVzdGFjaGVDb21tZW50U3RhdGVtZW50KGMpKSxcbiAgICB9KTtcblxuICAgIGxldCBjaGlsZHJlbiA9IG5ldyBFbGVtZW50Q2hpbGRyZW4oZWwsIGxvYywgY2hpbGROb2RlcywgdGhpcy5jdHgpO1xuXG4gICAgbGV0IG9mZnNldHMgPSB0aGlzLmN0eC5sb2MoZWxlbWVudC5sb2MpO1xuICAgIGxldCB0YWdPZmZzZXRzID0gb2Zmc2V0cy5zbGljZVN0YXJ0Q2hhcnMoeyBjaGFyczogdGFnLmxlbmd0aCwgc2tpcFN0YXJ0OiAxIH0pO1xuXG4gICAgaWYgKHBhdGggPT09ICdFbGVtZW50SGVhZCcpIHtcbiAgICAgIGlmICh0YWdbMF0gPT09ICc6Jykge1xuICAgICAgICByZXR1cm4gY2hpbGRyZW4uYXNzZXJ0TmFtZWRCbG9jayhcbiAgICAgICAgICB0YWdPZmZzZXRzLnNsaWNlKHsgc2tpcFN0YXJ0OiAxIH0pLnRvU2xpY2UodGFnLnNsaWNlKDEpKSxcbiAgICAgICAgICBjaGlsZC50YWJsZVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkcmVuLmFzc2VydEVsZW1lbnQodGFnT2Zmc2V0cy50b1NsaWNlKHRhZyksIGVsZW1lbnQuYmxvY2tQYXJhbXMubGVuZ3RoID4gMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVsZW1lbnQuc2VsZkNsb3NpbmcpIHtcbiAgICAgIHJldHVybiBlbC5zZWxmQ2xvc2luZ0NvbXBvbmVudChwYXRoLCBsb2MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgYmxvY2tzID0gY2hpbGRyZW4uYXNzZXJ0Q29tcG9uZW50KHRhZywgY2hpbGQudGFibGUsIGVsZW1lbnQuYmxvY2tQYXJhbXMubGVuZ3RoID4gMCk7XG4gICAgICByZXR1cm4gZWwuY29tcG9uZW50V2l0aE5hbWVkQmxvY2tzKHBhdGgsIGJsb2NrcywgbG9jKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG1vZGlmaWVyKG06IEFTVHYxLkVsZW1lbnRNb2RpZmllclN0YXRlbWVudCk6IEFTVHYyLkVsZW1lbnRNb2RpZmllciB7XG4gICAgbGV0IHJlc29sdXRpb24gPSB0aGlzLmN0eC5yZXNvbHV0aW9uRm9yKG0sIE1vZGlmaWVyU3ludGF4Q29udGV4dCk7XG5cbiAgICBpZiAocmVzb2x1dGlvbi5yZXNvbHV0aW9uID09PSAnZXJyb3InKSB7XG4gICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKFxuICAgICAgICBgWW91IGF0dGVtcHRlZCB0byBpbnZva2UgYSBwYXRoIChcXGB7eyMke3Jlc29sdXRpb24ucGF0aH19fVxcYCkgYXMgYSBtb2RpZmllciwgYnV0ICR7cmVzb2x1dGlvbi5oZWFkfSB3YXMgbm90IGluIHNjb3BlLiBUcnkgYWRkaW5nIFxcYHRoaXNcXGAgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgcGF0aGAsXG4gICAgICAgIG0ubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCBjYWxsUGFydHMgPSB0aGlzLmV4cHIuY2FsbFBhcnRzKG0sIHJlc29sdXRpb24ucmVzb2x1dGlvbik7XG4gICAgcmV0dXJuIHRoaXMuY3R4LmJ1aWxkZXIubW9kaWZpZXIoY2FsbFBhcnRzLCB0aGlzLmN0eC5sb2MobS5sb2MpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBoYW5kbGVzIGF0dHJpYnV0ZSB2YWx1ZXMgdGhhdCBhcmUgY3VybGllcywgYXMgd2VsbCBhcyBjdXJsaWVzIG5lc3RlZCBpbnNpZGUgb2ZcbiAgICogaW50ZXJwb2xhdGlvbnM6XG4gICAqXG4gICAqIGBgYGhic1xuICAgKiA8YSBocmVmPXt7dXJsfX0gLz5cbiAgICogPGEgaHJlZj1cInt7dXJsfX0uaHRtbFwiIC8+XG4gICAqIGBgYFxuICAgKi9cbiAgcHJpdmF0ZSBtdXN0YWNoZUF0dHIobXVzdGFjaGU6IEFTVHYxLk11c3RhY2hlU3RhdGVtZW50KTogQVNUdjIuRXhwcmVzc2lvbk5vZGUge1xuICAgIC8vIE5vcm1hbGl6ZSB0aGUgY2FsbCBwYXJ0cyBpbiBBdHRyVmFsdWVTeW50YXhDb250ZXh0XG4gICAgbGV0IHNleHAgPSB0aGlzLmN0eC5idWlsZGVyLnNleHAoXG4gICAgICB0aGlzLmV4cHIuY2FsbFBhcnRzKG11c3RhY2hlLCBBdHRyVmFsdWVTeW50YXhDb250ZXh0KG11c3RhY2hlKSksXG4gICAgICB0aGlzLmN0eC5sb2MobXVzdGFjaGUubG9jKVxuICAgICk7XG5cbiAgICAvLyBJZiB0aGVyZSBhcmUgbm8gcGFyYW1zIG9yIGhhc2gsIGp1c3QgcmV0dXJuIHRoZSBmdW5jdGlvbiBwYXJ0IGFzIGl0cyBvd24gZXhwcmVzc2lvblxuICAgIGlmIChzZXhwLmFyZ3MuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gc2V4cC5jYWxsZWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzZXhwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBhdHRyUGFydCBpcyB0aGUgbmFycm93ZWQgZG93biBsaXN0IG9mIHZhbGlkIGF0dHJpYnV0ZSB2YWx1ZXMgdGhhdCBhcmUgYWxzb1xuICAgKiBhbGxvd2VkIGFzIGEgY29uY2F0IHBhcnQgKHlvdSBjYW4ndCBuZXN0IGNvbmNhdHMpLlxuICAgKi9cbiAgcHJpdmF0ZSBhdHRyUGFydChcbiAgICBwYXJ0OiBBU1R2MS5NdXN0YWNoZVN0YXRlbWVudCB8IEFTVHYxLlRleHROb2RlXG4gICk6IHsgZXhwcjogQVNUdjIuRXhwcmVzc2lvbk5vZGU7IHRydXN0aW5nOiBib29sZWFuIH0ge1xuICAgIHN3aXRjaCAocGFydC50eXBlKSB7XG4gICAgICBjYXNlICdNdXN0YWNoZVN0YXRlbWVudCc6XG4gICAgICAgIHJldHVybiB7IGV4cHI6IHRoaXMubXVzdGFjaGVBdHRyKHBhcnQpLCB0cnVzdGluZzogIXBhcnQuZXNjYXBlZCB9O1xuICAgICAgY2FzZSAnVGV4dE5vZGUnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGV4cHI6IHRoaXMuY3R4LmJ1aWxkZXIubGl0ZXJhbChwYXJ0LmNoYXJzLCB0aGlzLmN0eC5sb2MocGFydC5sb2MpKSxcbiAgICAgICAgICB0cnVzdGluZzogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGF0dHJWYWx1ZShcbiAgICBwYXJ0OiBBU1R2MS5NdXN0YWNoZVN0YXRlbWVudCB8IEFTVHYxLlRleHROb2RlIHwgQVNUdjEuQ29uY2F0U3RhdGVtZW50XG4gICk6IHsgZXhwcjogQVNUdjIuRXhwcmVzc2lvbk5vZGU7IHRydXN0aW5nOiBib29sZWFuIH0ge1xuICAgIHN3aXRjaCAocGFydC50eXBlKSB7XG4gICAgICBjYXNlICdDb25jYXRTdGF0ZW1lbnQnOiB7XG4gICAgICAgIGxldCBwYXJ0cyA9IHBhcnQucGFydHMubWFwKChwKSA9PiB0aGlzLmF0dHJQYXJ0KHApLmV4cHIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGV4cHI6IHRoaXMuY3R4LmJ1aWxkZXIuaW50ZXJwb2xhdGUocGFydHMsIHRoaXMuY3R4LmxvYyhwYXJ0LmxvYykpLFxuICAgICAgICAgIHRydXN0aW5nOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHJQYXJ0KHBhcnQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXR0cihtOiBBU1R2MS5BdHRyTm9kZSk6IEFTVHYyLkh0bWxPclNwbGF0QXR0ciB7XG4gICAgYXNzZXJ0KG0ubmFtZVswXSAhPT0gJ0AnLCAnQW4gYXR0ciBuYW1lIG11c3Qgbm90IHN0YXJ0IHdpdGggYEBgJyk7XG5cbiAgICBpZiAobS5uYW1lID09PSAnLi4uYXR0cmlidXRlcycpIHtcbiAgICAgIHJldHVybiB0aGlzLmN0eC5idWlsZGVyLnNwbGF0QXR0cih0aGlzLmN0eC50YWJsZS5hbGxvY2F0ZUJsb2NrKCdhdHRycycpLCB0aGlzLmN0eC5sb2MobS5sb2MpKTtcbiAgICB9XG5cbiAgICBsZXQgb2Zmc2V0cyA9IHRoaXMuY3R4LmxvYyhtLmxvYyk7XG4gICAgbGV0IG5hbWVTbGljZSA9IG9mZnNldHMuc2xpY2VTdGFydENoYXJzKHsgY2hhcnM6IG0ubmFtZS5sZW5ndGggfSkudG9TbGljZShtLm5hbWUpO1xuXG4gICAgbGV0IHZhbHVlID0gdGhpcy5hdHRyVmFsdWUobS52YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXMuY3R4LmJ1aWxkZXIuYXR0cihcbiAgICAgIHsgbmFtZTogbmFtZVNsaWNlLCB2YWx1ZTogdmFsdWUuZXhwciwgdHJ1c3Rpbmc6IHZhbHVlLnRydXN0aW5nIH0sXG4gICAgICBvZmZzZXRzXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgbWF5YmVEZXByZWNhdGVkQ2FsbChcbiAgICBhcmc6IFNvdXJjZVNsaWNlLFxuICAgIHBhcnQ6IEFTVHYxLk11c3RhY2hlU3RhdGVtZW50IHwgQVNUdjEuVGV4dE5vZGUgfCBBU1R2MS5Db25jYXRTdGF0ZW1lbnRcbiAgKTogeyBleHByOiBBU1R2Mi5EZXByZWNhdGVkQ2FsbEV4cHJlc3Npb247IHRydXN0aW5nOiBib29sZWFuIH0gfCBudWxsIHtcbiAgICBpZiAodGhpcy5jdHguc3RyaWN0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAocGFydC50eXBlICE9PSAnTXVzdGFjaGVTdGF0ZW1lbnQnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgeyBwYXRoIH0gPSBwYXJ0O1xuXG4gICAgaWYgKHBhdGgudHlwZSAhPT0gJ1BhdGhFeHByZXNzaW9uJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHBhdGguaGVhZC50eXBlICE9PSAnVmFySGVhZCcpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCB7IG5hbWUgfSA9IHBhdGguaGVhZDtcblxuICAgIGlmIChuYW1lID09PSAnaGFzLWJsb2NrJyB8fCBuYW1lID09PSAnaGFzLWJsb2NrLXBhcmFtcycpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmN0eC5oYXNCaW5kaW5nKG5hbWUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAocGF0aC50YWlsLmxlbmd0aCAhPT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHBhcnQucGFyYW1zLmxlbmd0aCAhPT0gMCB8fCBwYXJ0Lmhhc2gucGFpcnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgY29udGV4dCA9IEFTVHYyLkxvb3NlTW9kZVJlc29sdXRpb24uYXR0cigpO1xuXG4gICAgbGV0IGNhbGxlZSA9IHRoaXMuY3R4LmJ1aWxkZXIuZnJlZVZhcih7XG4gICAgICBuYW1lLFxuICAgICAgY29udGV4dCxcbiAgICAgIHN5bWJvbDogdGhpcy5jdHgudGFibGUuYWxsb2NhdGVGcmVlKG5hbWUsIGNvbnRleHQpLFxuICAgICAgbG9jOiBwYXRoLmxvYyxcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBleHByOiB0aGlzLmN0eC5idWlsZGVyLmRlcHJlY2F0ZWRDYWxsKGFyZywgY2FsbGVlLCBwYXJ0LmxvYyksXG4gICAgICB0cnVzdGluZzogZmFsc2UsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgYXJnKGFyZzogQVNUdjEuQXR0ck5vZGUpOiBBU1R2Mi5Db21wb25lbnRBcmcge1xuICAgIGFzc2VydChhcmcubmFtZVswXSA9PT0gJ0AnLCAnQW4gYXJnIG5hbWUgbXVzdCBzdGFydCB3aXRoIGBAYCcpO1xuXG4gICAgbGV0IG9mZnNldHMgPSB0aGlzLmN0eC5sb2MoYXJnLmxvYyk7XG4gICAgbGV0IG5hbWVTbGljZSA9IG9mZnNldHMuc2xpY2VTdGFydENoYXJzKHsgY2hhcnM6IGFyZy5uYW1lLmxlbmd0aCB9KS50b1NsaWNlKGFyZy5uYW1lKTtcblxuICAgIGxldCB2YWx1ZSA9IHRoaXMubWF5YmVEZXByZWNhdGVkQ2FsbChuYW1lU2xpY2UsIGFyZy52YWx1ZSkgfHwgdGhpcy5hdHRyVmFsdWUoYXJnLnZhbHVlKTtcbiAgICByZXR1cm4gdGhpcy5jdHguYnVpbGRlci5hcmcoXG4gICAgICB7IG5hbWU6IG5hbWVTbGljZSwgdmFsdWU6IHZhbHVlLmV4cHIsIHRydXN0aW5nOiB2YWx1ZS50cnVzdGluZyB9LFxuICAgICAgb2Zmc2V0c1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiBjbGFzc2lmaWVzIHRoZSBoZWFkIG9mIGFuIEFTVHYxLkVsZW1lbnQgaW50byBhbiBBU1R2Mi5QYXRoSGVhZCAoaWYgdGhlXG4gICAqIGVsZW1lbnQgaXMgYSBjb21wb25lbnQpIG9yIGAnRWxlbWVudEhlYWQnYCAoaWYgdGhlIGVsZW1lbnQgaXMgYSBzaW1wbGUgZWxlbWVudCkuXG4gICAqXG4gICAqIFJ1bGVzOlxuICAgKlxuICAgKiAxLiBJZiB0aGUgdmFyaWFibGUgaXMgYW4gYEBhcmdgLCByZXR1cm4gYW4gYEF0SGVhZGBcbiAgICogMi4gSWYgdGhlIHZhcmlhYmxlIGlzIGB0aGlzYCwgcmV0dXJuIGEgYFRoaXNIZWFkYFxuICAgKiAzLiBJZiB0aGUgdmFyaWFibGUgaXMgaW4gdGhlIGN1cnJlbnQgc2NvcGU6XG4gICAqICAgYS4gSWYgdGhlIHNjb3BlIGlzIHRoZSByb290IHNjb3BlLCB0aGVuIHJldHVybiBhIEZyZWUgYExvY2FsVmFySGVhZGBcbiAgICogICBiLiBFbHNlLCByZXR1cm4gYSBzdGFuZGFyZCBgTG9jYWxWYXJIZWFkYFxuICAgKiA0LiBJZiB0aGUgdGFnIG5hbWUgaXMgYSBwYXRoIGFuZCB0aGUgdmFyaWFibGUgaXMgbm90IGluIHRoZSBjdXJyZW50IHNjb3BlLCBTeW50YXggRXJyb3JcbiAgICogNS4gSWYgdGhlIHZhcmlhYmxlIGlzIHVwcGVyY2FzZSByZXR1cm4gYSBGcmVlVmFyKFJlc29sdmVBc0NvbXBvbmVudEhlYWQpXG4gICAqIDYuIE90aGVyd2lzZSwgcmV0dXJuIGAnRWxlbWVudEhlYWQnYFxuICAgKi9cbiAgcHJpdmF0ZSBjbGFzc2lmeVRhZyhcbiAgICB2YXJpYWJsZTogc3RyaW5nLFxuICAgIHRhaWw6IHN0cmluZ1tdLFxuICAgIGxvYzogU291cmNlU3BhblxuICApOiBBU1R2Mi5FeHByZXNzaW9uTm9kZSB8ICdFbGVtZW50SGVhZCcge1xuICAgIGxldCB1cHBlcmNhc2UgPSBpc1VwcGVyQ2FzZSh2YXJpYWJsZSk7XG4gICAgbGV0IGluU2NvcGUgPSB2YXJpYWJsZVswXSA9PT0gJ0AnIHx8IHZhcmlhYmxlID09PSAndGhpcycgfHwgdGhpcy5jdHguaGFzQmluZGluZyh2YXJpYWJsZSk7XG5cbiAgICBpZiAodGhpcy5jdHguc3RyaWN0ICYmICFpblNjb3BlKSB7XG4gICAgICBpZiAodXBwZXJjYXNlKSB7XG4gICAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgICAgYEF0dGVtcHRlZCB0byBpbnZva2UgYSBjb21wb25lbnQgdGhhdCB3YXMgbm90IGluIHNjb3BlIGluIGEgc3RyaWN0IG1vZGUgdGVtcGxhdGUsIFxcYDwke3ZhcmlhYmxlfT5cXGAuIElmIHlvdSB3YW50ZWQgdG8gY3JlYXRlIGFuIGVsZW1lbnQgd2l0aCB0aGF0IG5hbWUsIGNvbnZlcnQgaXQgdG8gbG93ZXJjYXNlIC0gXFxgPCR7dmFyaWFibGUudG9Mb3dlckNhc2UoKX0+XFxgYCxcbiAgICAgICAgICBsb2NcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gSW4gc3RyaWN0IG1vZGUsIHZhbHVlcyBhcmUgYWx3YXlzIGVsZW1lbnRzIHVubGVzcyB0aGV5IGFyZSBpbiBzY29wZVxuICAgICAgcmV0dXJuICdFbGVtZW50SGVhZCc7XG4gICAgfVxuXG4gICAgLy8gU2luY2UgdGhlIHBhcnNlciBoYW5kZWQgdXMgdGhlIEhUTUwgZWxlbWVudCBuYW1lIGFzIGEgc3RyaW5nLCB3ZSBuZWVkXG4gICAgLy8gdG8gY29udmVydCBpdCBpbnRvIGFuIEFTVHYxIHBhdGggc28gaXQgY2FuIGJlIHByb2Nlc3NlZCB1c2luZyB0aGVcbiAgICAvLyBleHByZXNzaW9uIG5vcm1hbGl6ZXIuXG4gICAgbGV0IGlzQ29tcG9uZW50ID0gaW5TY29wZSB8fCB1cHBlcmNhc2U7XG5cbiAgICBsZXQgdmFyaWFibGVMb2MgPSBsb2Muc2xpY2VTdGFydENoYXJzKHsgc2tpcFN0YXJ0OiAxLCBjaGFyczogdmFyaWFibGUubGVuZ3RoIH0pO1xuXG4gICAgbGV0IHRhaWxMZW5ndGggPSB0YWlsLnJlZHVjZSgoYWNjdW0sIHBhcnQpID0+IGFjY3VtICsgMSArIHBhcnQubGVuZ3RoLCAwKTtcbiAgICBsZXQgcGF0aEVuZCA9IHZhcmlhYmxlTG9jLmdldEVuZCgpLm1vdmUodGFpbExlbmd0aCk7XG4gICAgbGV0IHBhdGhMb2MgPSB2YXJpYWJsZUxvYy53aXRoRW5kKHBhdGhFbmQpO1xuXG4gICAgaWYgKGlzQ29tcG9uZW50KSB7XG4gICAgICBsZXQgcGF0aCA9IGIucGF0aCh7XG4gICAgICAgIGhlYWQ6IGIuaGVhZCh2YXJpYWJsZSwgdmFyaWFibGVMb2MpLFxuICAgICAgICB0YWlsLFxuICAgICAgICBsb2M6IHBhdGhMb2MsXG4gICAgICB9KTtcblxuICAgICAgbGV0IHJlc29sdXRpb24gPSB0aGlzLmN0eC5yZXNvbHV0aW9uRm9yKHBhdGgsIENvbXBvbmVudFN5bnRheENvbnRleHQpO1xuXG4gICAgICBpZiAocmVzb2x1dGlvbi5yZXNvbHV0aW9uID09PSAnZXJyb3InKSB7XG4gICAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgICAgYFlvdSBhdHRlbXB0ZWQgdG8gaW52b2tlIGEgcGF0aCAoXFxgPCR7cmVzb2x1dGlvbi5wYXRofT5cXGApIGJ1dCAke3Jlc29sdXRpb24uaGVhZH0gd2FzIG5vdCBpbiBzY29wZWAsXG4gICAgICAgICAgbG9jXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgRXhwcmVzc2lvbk5vcm1hbGl6ZXIodGhpcy5jdHgpLm5vcm1hbGl6ZShwYXRoLCByZXNvbHV0aW9uLnJlc29sdXRpb24pO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSB0YWcgbmFtZSB3YXNuJ3QgYSB2YWxpZCBjb21wb25lbnQgYnV0IGNvbnRhaW5lZCBhIGAuYCwgaXQnc1xuICAgIC8vIGEgc3ludGF4IGVycm9yLlxuICAgIGlmICh0YWlsLmxlbmd0aCA+IDApIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgIGBZb3UgdXNlZCAke3ZhcmlhYmxlfS4ke3RhaWwuam9pbignLicpfSBhcyBhIHRhZyBuYW1lLCBidXQgJHt2YXJpYWJsZX0gaXMgbm90IGluIHNjb3BlYCxcbiAgICAgICAgbG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAnRWxlbWVudEhlYWQnO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgZXhwcigpOiBFeHByZXNzaW9uTm9ybWFsaXplciB7XG4gICAgcmV0dXJuIG5ldyBFeHByZXNzaW9uTm9ybWFsaXplcih0aGlzLmN0eCk7XG4gIH1cbn1cblxuY2xhc3MgQ2hpbGRyZW4ge1xuICByZWFkb25seSBuYW1lZEJsb2NrczogQVNUdjIuTmFtZWRCbG9ja1tdO1xuICByZWFkb25seSBoYXNTZW1hbnRpY0NvbnRlbnQ6IGJvb2xlYW47XG4gIHJlYWRvbmx5IG5vbkJsb2NrQ2hpbGRyZW46IEFTVHYyLkNvbnRlbnROb2RlW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgbG9jOiBTb3VyY2VTcGFuLFxuICAgIHJlYWRvbmx5IGNoaWxkcmVuOiAoQVNUdjIuQ29udGVudE5vZGUgfCBBU1R2Mi5OYW1lZEJsb2NrKVtdLFxuICAgIHJlYWRvbmx5IGJsb2NrOiBCbG9ja0NvbnRleHRcbiAgKSB7XG4gICAgdGhpcy5uYW1lZEJsb2NrcyA9IGNoaWxkcmVuLmZpbHRlcigoYyk6IGMgaXMgQVNUdjIuTmFtZWRCbG9jayA9PiBjIGluc3RhbmNlb2YgQVNUdjIuTmFtZWRCbG9jayk7XG4gICAgdGhpcy5oYXNTZW1hbnRpY0NvbnRlbnQgPSBCb29sZWFuKFxuICAgICAgY2hpbGRyZW4uZmlsdGVyKChjKTogYyBpcyBBU1R2Mi5Db250ZW50Tm9kZSA9PiB7XG4gICAgICAgIGlmIChjIGluc3RhbmNlb2YgQVNUdjIuTmFtZWRCbG9jaykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKGMudHlwZSkge1xuICAgICAgICAgIGNhc2UgJ0dsaW1tZXJDb21tZW50JzpcbiAgICAgICAgICBjYXNlICdIdG1sQ29tbWVudCc6XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgY2FzZSAnSHRtbFRleHQnOlxuICAgICAgICAgICAgcmV0dXJuICEvXlxccyokLy5leGVjKGMuY2hhcnMpO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSkubGVuZ3RoXG4gICAgKTtcbiAgICB0aGlzLm5vbkJsb2NrQ2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoXG4gICAgICAoYyk6IGMgaXMgQVNUdjIuQ29udGVudE5vZGUgPT4gIShjIGluc3RhbmNlb2YgQVNUdjIuTmFtZWRCbG9jaylcbiAgICApO1xuICB9XG59XG5cbmNsYXNzIFRlbXBsYXRlQ2hpbGRyZW4gZXh0ZW5kcyBDaGlsZHJlbiB7XG4gIGFzc2VydFRlbXBsYXRlKHRhYmxlOiBQcm9ncmFtU3ltYm9sVGFibGUpOiBBU1R2Mi5UZW1wbGF0ZSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLm5hbWVkQmxvY2tzKSkge1xuICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihgVW5leHBlY3RlZCBuYW1lZCBibG9jayBhdCB0aGUgdG9wLWxldmVsIG9mIGEgdGVtcGxhdGVgLCB0aGlzLmxvYyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYmxvY2suYnVpbGRlci50ZW1wbGF0ZSh0YWJsZSwgdGhpcy5ub25CbG9ja0NoaWxkcmVuLCB0aGlzLmJsb2NrLmxvYyh0aGlzLmxvYykpO1xuICB9XG59XG5cbmNsYXNzIEJsb2NrQ2hpbGRyZW4gZXh0ZW5kcyBDaGlsZHJlbiB7XG4gIGFzc2VydEJsb2NrKHRhYmxlOiBCbG9ja1N5bWJvbFRhYmxlKTogQVNUdjIuQmxvY2sge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5uYW1lZEJsb2NrcykpIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoYFVuZXhwZWN0ZWQgbmFtZWQgYmxvY2sgbmVzdGVkIGluIGEgbm9ybWFsIGJsb2NrYCwgdGhpcy5sb2MpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmJsb2NrLmJ1aWxkZXIuYmxvY2sodGFibGUsIHRoaXMubm9uQmxvY2tDaGlsZHJlbiwgdGhpcy5sb2MpO1xuICB9XG59XG5cbmNsYXNzIEVsZW1lbnRDaGlsZHJlbiBleHRlbmRzIENoaWxkcmVuIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBlbDogQnVpbGRFbGVtZW50LFxuICAgIGxvYzogU291cmNlU3BhbixcbiAgICBjaGlsZHJlbjogKEFTVHYyLkNvbnRlbnROb2RlIHwgQVNUdjIuTmFtZWRCbG9jaylbXSxcbiAgICBibG9jazogQmxvY2tDb250ZXh0XG4gICkge1xuICAgIHN1cGVyKGxvYywgY2hpbGRyZW4sIGJsb2NrKTtcbiAgfVxuXG4gIGFzc2VydE5hbWVkQmxvY2sobmFtZTogU291cmNlU2xpY2UsIHRhYmxlOiBCbG9ja1N5bWJvbFRhYmxlKTogQVNUdjIuTmFtZWRCbG9jayB7XG4gICAgaWYgKHRoaXMuZWwuYmFzZS5zZWxmQ2xvc2luZykge1xuICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgYDw6JHtuYW1lLmNoYXJzfS8+IGlzIG5vdCBhIHZhbGlkIG5hbWVkIGJsb2NrOiBuYW1lZCBibG9ja3MgY2Fubm90IGJlIHNlbGYtY2xvc2luZ2AsXG4gICAgICAgIHRoaXMubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5uYW1lZEJsb2NrcykpIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgIGBVbmV4cGVjdGVkIG5hbWVkIGJsb2NrIGluc2lkZSA8OiR7bmFtZS5jaGFyc30+IG5hbWVkIGJsb2NrOiBuYW1lZCBibG9ja3MgY2Fubm90IGNvbnRhaW4gbmVzdGVkIG5hbWVkIGJsb2Nrc2AsXG4gICAgICAgIHRoaXMubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICghaXNMb3dlckNhc2UobmFtZS5jaGFycykpIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgIGA8OiR7bmFtZS5jaGFyc30+IGlzIG5vdCBhIHZhbGlkIG5hbWVkIGJsb2NrLCBhbmQgbmFtZWQgYmxvY2tzIG11c3QgYmVnaW4gd2l0aCBhIGxvd2VyY2FzZSBsZXR0ZXJgLFxuICAgICAgICB0aGlzLmxvY1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLmVsLmJhc2UuYXR0cnMubGVuZ3RoID4gMCB8fFxuICAgICAgdGhpcy5lbC5iYXNlLmNvbXBvbmVudEFyZ3MubGVuZ3RoID4gMCB8fFxuICAgICAgdGhpcy5lbC5iYXNlLm1vZGlmaWVycy5sZW5ndGggPiAwXG4gICAgKSB7XG4gICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKFxuICAgICAgICBgbmFtZWQgYmxvY2sgPDoke25hbWUuY2hhcnN9PiBjYW5ub3QgaGF2ZSBhdHRyaWJ1dGVzLCBhcmd1bWVudHMsIG9yIG1vZGlmaWVyc2AsXG4gICAgICAgIHRoaXMubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCBvZmZzZXRzID0gU3Bhbkxpc3QucmFuZ2UodGhpcy5ub25CbG9ja0NoaWxkcmVuLCB0aGlzLmxvYyk7XG5cbiAgICByZXR1cm4gdGhpcy5ibG9jay5idWlsZGVyLm5hbWVkQmxvY2soXG4gICAgICBuYW1lLFxuICAgICAgdGhpcy5ibG9jay5idWlsZGVyLmJsb2NrKHRhYmxlLCB0aGlzLm5vbkJsb2NrQ2hpbGRyZW4sIG9mZnNldHMpLFxuICAgICAgdGhpcy5sb2NcbiAgICApO1xuICB9XG5cbiAgYXNzZXJ0RWxlbWVudChuYW1lOiBTb3VyY2VTbGljZSwgaGFzQmxvY2tQYXJhbXM6IGJvb2xlYW4pOiBBU1R2Mi5TaW1wbGVFbGVtZW50IHtcbiAgICBpZiAoaGFzQmxvY2tQYXJhbXMpIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgIGBVbmV4cGVjdGVkIGJsb2NrIHBhcmFtcyBpbiA8JHtuYW1lfT46IHNpbXBsZSBlbGVtZW50cyBjYW5ub3QgaGF2ZSBibG9jayBwYXJhbXNgLFxuICAgICAgICB0aGlzLmxvY1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMubmFtZWRCbG9ja3MpKSB7XG4gICAgICBsZXQgbmFtZXMgPSB0aGlzLm5hbWVkQmxvY2tzLm1hcCgoYikgPT4gYi5uYW1lKTtcblxuICAgICAgaWYgKG5hbWVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKFxuICAgICAgICAgIGBVbmV4cGVjdGVkIG5hbWVkIGJsb2NrIDw6Zm9vPiBpbnNpZGUgPCR7bmFtZS5jaGFyc30+IEhUTUwgZWxlbWVudGAsXG4gICAgICAgICAgdGhpcy5sb2NcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBwcmludGVkTmFtZXMgPSBuYW1lcy5tYXAoKG4pID0+IGA8OiR7bi5jaGFyc30+YCkuam9pbignLCAnKTtcbiAgICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgICBgVW5leHBlY3RlZCBuYW1lZCBibG9ja3MgaW5zaWRlIDwke25hbWUuY2hhcnN9PiBIVE1MIGVsZW1lbnQgKCR7cHJpbnRlZE5hbWVzfSlgLFxuICAgICAgICAgIHRoaXMubG9jXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZWwuc2ltcGxlKG5hbWUsIHRoaXMubm9uQmxvY2tDaGlsZHJlbiwgdGhpcy5sb2MpO1xuICB9XG5cbiAgYXNzZXJ0Q29tcG9uZW50KFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICB0YWJsZTogQmxvY2tTeW1ib2xUYWJsZSxcbiAgICBoYXNCbG9ja1BhcmFtczogYm9vbGVhblxuICApOiBQcmVzZW50QXJyYXk8QVNUdjIuTmFtZWRCbG9jaz4ge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5uYW1lZEJsb2NrcykgJiYgdGhpcy5oYXNTZW1hbnRpY0NvbnRlbnQpIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgIGBVbmV4cGVjdGVkIGNvbnRlbnQgaW5zaWRlIDwke25hbWV9PiBjb21wb25lbnQgaW52b2NhdGlvbjogd2hlbiB1c2luZyBuYW1lZCBibG9ja3MsIHRoZSB0YWcgY2Fubm90IGNvbnRhaW4gb3RoZXIgY29udGVudGAsXG4gICAgICAgIHRoaXMubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5uYW1lZEJsb2NrcykpIHtcbiAgICAgIGlmIChoYXNCbG9ja1BhcmFtcykge1xuICAgICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKFxuICAgICAgICAgIGBVbmV4cGVjdGVkIGJsb2NrIHBhcmFtcyBsaXN0IG9uIDwke25hbWV9PiBjb21wb25lbnQgaW52b2NhdGlvbjogd2hlbiBwYXNzaW5nIG5hbWVkIGJsb2NrcywgdGhlIGludm9jYXRpb24gdGFnIGNhbm5vdCB0YWtlIGJsb2NrIHBhcmFtc2AsXG4gICAgICAgICAgdGhpcy5sb2NcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHNlZW5OYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gICAgICBmb3IgKGxldCBibG9jayBvZiB0aGlzLm5hbWVkQmxvY2tzKSB7XG4gICAgICAgIGxldCBuYW1lID0gYmxvY2submFtZS5jaGFycztcblxuICAgICAgICBpZiAoc2Vlbk5hbWVzLmhhcyhuYW1lKSkge1xuICAgICAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgICAgICBgQ29tcG9uZW50IGhhZCB0d28gbmFtZWQgYmxvY2tzIHdpdGggdGhlIHNhbWUgbmFtZSwgXFxgPDoke25hbWV9PlxcYC4gT25seSBvbmUgYmxvY2sgd2l0aCBhIGdpdmVuIG5hbWUgbWF5IGJlIHBhc3NlZGAsXG4gICAgICAgICAgICB0aGlzLmxvY1xuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXG4gICAgICAgICAgKG5hbWUgPT09ICdpbnZlcnNlJyAmJiBzZWVuTmFtZXMuaGFzKCdlbHNlJykpIHx8XG4gICAgICAgICAgKG5hbWUgPT09ICdlbHNlJyAmJiBzZWVuTmFtZXMuaGFzKCdpbnZlcnNlJykpXG4gICAgICAgICkge1xuICAgICAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgICAgICBgQ29tcG9uZW50IGhhcyBib3RoIDw6ZWxzZT4gYW5kIDw6aW52ZXJzZT4gYmxvY2suIDw6aW52ZXJzZT4gaXMgYW4gYWxpYXMgZm9yIDw6ZWxzZT5gLFxuICAgICAgICAgICAgdGhpcy5sb2NcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgc2Vlbk5hbWVzLmFkZChuYW1lKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMubmFtZWRCbG9ja3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIHRoaXMuYmxvY2suYnVpbGRlci5uYW1lZEJsb2NrKFxuICAgICAgICAgIFNvdXJjZVNsaWNlLnN5bnRoZXRpYygnZGVmYXVsdCcpLFxuICAgICAgICAgIHRoaXMuYmxvY2suYnVpbGRlci5ibG9jayh0YWJsZSwgdGhpcy5ub25CbG9ja0NoaWxkcmVuLCB0aGlzLmxvYyksXG4gICAgICAgICAgdGhpcy5sb2NcbiAgICAgICAgKSxcbiAgICAgIF07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHByaW50UGF0aChub2RlOiBBU1R2MS5QYXRoRXhwcmVzc2lvbiB8IEFTVHYxLkNhbGxOb2RlKTogc3RyaW5nIHtcbiAgaWYgKG5vZGUudHlwZSAhPT0gJ1BhdGhFeHByZXNzaW9uJyAmJiBub2RlLnBhdGgudHlwZSA9PT0gJ1BhdGhFeHByZXNzaW9uJykge1xuICAgIHJldHVybiBwcmludFBhdGgobm9kZS5wYXRoKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFByaW50ZXIoeyBlbnRpdHlFbmNvZGluZzogJ3JhdycgfSkucHJpbnQobm9kZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJpbnRIZWFkKG5vZGU6IEFTVHYxLlBhdGhFeHByZXNzaW9uIHwgQVNUdjEuQ2FsbE5vZGUpOiBzdHJpbmcge1xuICBpZiAobm9kZS50eXBlID09PSAnUGF0aEV4cHJlc3Npb24nKSB7XG4gICAgc3dpdGNoIChub2RlLmhlYWQudHlwZSkge1xuICAgICAgY2FzZSAnQXRIZWFkJzpcbiAgICAgIGNhc2UgJ1ZhckhlYWQnOlxuICAgICAgICByZXR1cm4gbm9kZS5oZWFkLm5hbWU7XG4gICAgICBjYXNlICdUaGlzSGVhZCc6XG4gICAgICAgIHJldHVybiAndGhpcyc7XG4gICAgfVxuICB9IGVsc2UgaWYgKG5vZGUucGF0aC50eXBlID09PSAnUGF0aEV4cHJlc3Npb24nKSB7XG4gICAgcmV0dXJuIHByaW50SGVhZChub2RlLnBhdGgpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgUHJpbnRlcih7IGVudGl0eUVuY29kaW5nOiAncmF3JyB9KS5wcmludChub2RlKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==