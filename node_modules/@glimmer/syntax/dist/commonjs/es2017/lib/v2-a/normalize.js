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

function normalize(source, options = {}) {
  var _a;

  let ast = (0, _tokenizerEventHandlers.preprocess)(source, options);
  let normalizeOptions = (0, _util.assign)({
    strictMode: false,
    locals: []
  }, options);

  let top = _symbolTable.SymbolTable.top(normalizeOptions.locals, (_a = // eslint-disable-next-line @typescript-eslint/unbound-method
  options.customizeComponentName) !== null && _a !== void 0 ? _a : name => name);

  let block = new BlockContext(source, normalizeOptions, top);
  let normalizer = new StatementNormalizer(block);
  let astV2 = new TemplateChildren(block.loc(ast.loc), ast.body.map(b => normalizer.normalize(b)), block).assertTemplate(top);
  let locals = top.getUsedTemplateLocals();
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


class BlockContext {
  constructor(source, options, table) {
    this.source = source;
    this.options = options;
    this.table = table;
    this.builder = new _builders.Builder();
  }

  get strict() {
    return this.options.strictMode || false;
  }

  loc(loc) {
    return this.source.spanFor(loc);
  }

  resolutionFor(node, resolution) {
    if (this.strict) {
      return {
        resolution: ASTv2.STRICT_RESOLUTION
      };
    }

    if (this.isFreeVar(node)) {
      let r = resolution(node);

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
  }

  isFreeVar(callee) {
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
  }

  hasBinding(name) {
    return this.table.has(name);
  }

  child(blockParams) {
    return new BlockContext(this.source, this.options, this.table.child(blockParams));
  }

  customizeComponentName(input) {
    if (this.options.customizeComponentName) {
      return this.options.customizeComponentName(input);
    } else {
      return input;
    }
  }

}
/**
 * An `ExpressionNormalizer` normalizes expressions within a block.
 *
 * `ExpressionNormalizer` is stateless.
 */


exports.BlockContext = BlockContext;

class ExpressionNormalizer {
  constructor(block) {
    this.block = block;
  }

  normalize(expr, resolution) {
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
          let resolution = this.block.resolutionFor(expr, _looseResolution.SexpSyntaxContext);

          if (resolution.resolution === 'error') {
            throw (0, _syntaxError.generateSyntaxError)(`You attempted to invoke a path (\`${resolution.path}\`) but ${resolution.head} was not in scope`, expr.loc);
          }

          return this.block.builder.sexp(this.callParts(expr, resolution.resolution), this.block.loc(expr.loc));
        }
    }
  }

  path(expr, resolution) {
    let headOffsets = this.block.loc(expr.head.loc);
    let tail = []; // start with the head

    let offset = headOffsets;

    for (let part of expr.tail) {
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


  callParts(parts, context) {
    let {
      path,
      params,
      hash
    } = parts;
    let callee = this.normalize(path, context);
    let paramList = params.map(p => this.normalize(p, ASTv2.ARGUMENT_RESOLUTION));

    let paramLoc = _spanList.SpanList.range(paramList, callee.loc.collapse('end'));

    let namedLoc = this.block.loc(hash.loc);

    let argsLoc = _spanList.SpanList.range([paramLoc, namedLoc]);

    let positional = this.block.builder.positional(params.map(p => this.normalize(p, ASTv2.ARGUMENT_RESOLUTION)), paramLoc);
    let named = this.block.builder.named(hash.pairs.map(p => this.namedArgument(p)), this.block.loc(hash.loc));
    return {
      callee,
      args: this.block.builder.args(positional, named, argsLoc)
    };
  }

  namedArgument(pair) {
    let offsets = this.block.loc(pair.loc);
    let keyOffsets = offsets.sliceStartChars({
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


  ref(head, resolution) {
    let {
      block
    } = this;
    let {
      builder,
      table
    } = block;
    let offsets = block.loc(head.loc);

    switch (head.type) {
      case 'ThisHead':
        return builder.self(offsets);

      case 'AtHead':
        {
          let symbol = table.allocateNamed(head.name);
          return builder.at(head.name, symbol, offsets);
        }

      case 'VarHead':
        {
          if (block.hasBinding(head.name)) {
            let [symbol, isRoot] = table.get(head.name);
            return block.builder.localVar(head.name, symbol, isRoot, offsets);
          } else {
            let context = block.strict ? ASTv2.STRICT_RESOLUTION : resolution;
            let symbol = block.table.allocateFree(head.name, context);
            return block.builder.freeVar({
              name: head.name,
              context,
              symbol,
              loc: offsets
            });
          }
        }
    }
  }

}
/**
 * `TemplateNormalizer` normalizes top-level ASTv1 statements to ASTv2.
 */


class StatementNormalizer {
  constructor(block) {
    this.block = block;
  }

  normalize(node) {
    switch (node.type) {
      case 'PartialStatement':
        throw new Error(`Handlebars partial syntax ({{> ...}}) is not allowed in Glimmer`);

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
          let loc = this.block.loc(node.loc);
          return new ASTv2.HtmlComment({
            loc,
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
  }

  MustacheCommentStatement(node) {
    let loc = this.block.loc(node.loc);
    let textLoc;

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
      loc,
      text: textLoc.toSlice(node.value)
    });
  }
  /**
   * Normalizes an ASTv1.MustacheStatement to an ASTv2.AppendStatement
   */


  MustacheStatement(mustache) {
    let {
      escaped
    } = mustache;
    let loc = this.block.loc(mustache.loc); // Normalize the call parts in AppendSyntaxContext

    let callParts = this.expr.callParts({
      path: mustache.path,
      params: mustache.params,
      hash: mustache.hash
    }, (0, _looseResolution.AppendSyntaxContext)(mustache));
    let value = callParts.args.isEmpty() ? callParts.callee : this.block.builder.sexp(callParts, loc);
    return this.block.builder.append({
      table: this.block.table,
      trusting: !escaped,
      value
    }, loc);
  }
  /**
   * Normalizes a ASTv1.BlockStatement to an ASTv2.BlockStatement
   */


  BlockStatement(block) {
    let {
      program,
      inverse
    } = block;
    let loc = this.block.loc(block.loc);
    let resolution = this.block.resolutionFor(block, _looseResolution.BlockSyntaxContext);

    if (resolution.resolution === 'error') {
      throw (0, _syntaxError.generateSyntaxError)(`You attempted to invoke a path (\`{{#${resolution.path}}}\`) but ${resolution.head} was not in scope`, loc);
    }

    let callParts = this.expr.callParts(block, resolution.resolution);
    return this.block.builder.blockStatement((0, _util.assign)({
      symbols: this.block.table,
      program: this.Block(program),
      inverse: inverse ? this.Block(inverse) : null
    }, callParts), loc);
  }

  Block({
    body,
    loc,
    blockParams
  }) {
    let child = this.block.child(blockParams);
    let normalizer = new StatementNormalizer(child);
    return new BlockChildren(this.block.loc(loc), body.map(b => normalizer.normalize(b)), this.block).assertBlock(child.table);
  }

  get expr() {
    return new ExpressionNormalizer(this.block);
  }

}

class ElementNormalizer {
  constructor(ctx) {
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


  ElementNode(element) {
    let {
      tag,
      selfClosing,
      comments
    } = element;
    let loc = this.ctx.loc(element.loc);
    let [tagHead, ...rest] = tag.split('.'); // the head, attributes and modifiers are in the current scope

    let path = this.classifyTag(tagHead, rest, element.loc);
    let attrs = element.attributes.filter(a => a.name[0] !== '@').map(a => this.attr(a));
    let args = element.attributes.filter(a => a.name[0] === '@').map(a => this.arg(a));
    let modifiers = element.modifiers.map(m => this.modifier(m)); // the element's block params are in scope for the children

    let child = this.ctx.child(element.blockParams);
    let normalizer = new StatementNormalizer(child);
    let childNodes = element.children.map(s => normalizer.normalize(s));
    let el = this.ctx.builder.element({
      selfClosing,
      attrs,
      componentArgs: args,
      modifiers,
      comments: comments.map(c => new StatementNormalizer(this.ctx).MustacheCommentStatement(c))
    });
    let children = new ElementChildren(el, loc, childNodes, this.ctx);
    let offsets = this.ctx.loc(element.loc);
    let tagOffsets = offsets.sliceStartChars({
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
      let blocks = children.assertComponent(tag, child.table, element.blockParams.length > 0);
      return el.componentWithNamedBlocks(path, blocks, loc);
    }
  }

  modifier(m) {
    let resolution = this.ctx.resolutionFor(m, _looseResolution.ModifierSyntaxContext);

    if (resolution.resolution === 'error') {
      throw (0, _syntaxError.generateSyntaxError)(`You attempted to invoke a path (\`{{#${resolution.path}}}\`) as a modifier, but ${resolution.head} was not in scope. Try adding \`this\` to the beginning of the path`, m.loc);
    }

    let callParts = this.expr.callParts(m, resolution.resolution);
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


  mustacheAttr(mustache) {
    // Normalize the call parts in AttrValueSyntaxContext
    let sexp = this.ctx.builder.sexp(this.expr.callParts(mustache, (0, _looseResolution.AttrValueSyntaxContext)(mustache)), this.ctx.loc(mustache.loc)); // If there are no params or hash, just return the function part as its own expression

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


  attrPart(part) {
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
  }

  attrValue(part) {
    switch (part.type) {
      case 'ConcatStatement':
        {
          let parts = part.parts.map(p => this.attrPart(p).expr);
          return {
            expr: this.ctx.builder.interpolate(parts, this.ctx.loc(part.loc)),
            trusting: false
          };
        }

      default:
        return this.attrPart(part);
    }
  }

  attr(m) {
    false && (0, _util.assert)(m.name[0] !== '@', 'An attr name must not start with `@`');

    if (m.name === '...attributes') {
      return this.ctx.builder.splatAttr(this.ctx.table.allocateBlock('attrs'), this.ctx.loc(m.loc));
    }

    let offsets = this.ctx.loc(m.loc);
    let nameSlice = offsets.sliceStartChars({
      chars: m.name.length
    }).toSlice(m.name);
    let value = this.attrValue(m.value);
    return this.ctx.builder.attr({
      name: nameSlice,
      value: value.expr,
      trusting: value.trusting
    }, offsets);
  }

  maybeDeprecatedCall(arg, part) {
    if (this.ctx.strict) {
      return null;
    }

    if (part.type !== 'MustacheStatement') {
      return null;
    }

    let {
      path
    } = part;

    if (path.type !== 'PathExpression') {
      return null;
    }

    if (path.head.type !== 'VarHead') {
      return null;
    }

    let {
      name
    } = path.head;

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

    let context = ASTv2.LooseModeResolution.attr();
    let callee = this.ctx.builder.freeVar({
      name,
      context,
      symbol: this.ctx.table.allocateFree(name, context),
      loc: path.loc
    });
    return {
      expr: this.ctx.builder.deprecatedCall(arg, callee, part.loc),
      trusting: false
    };
  }

  arg(arg) {
    false && (0, _util.assert)(arg.name[0] === '@', 'An arg name must start with `@`');
    let offsets = this.ctx.loc(arg.loc);
    let nameSlice = offsets.sliceStartChars({
      chars: arg.name.length
    }).toSlice(arg.name);
    let value = this.maybeDeprecatedCall(nameSlice, arg.value) || this.attrValue(arg.value);
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


  classifyTag(variable, tail, loc) {
    let uppercase = (0, _utils.isUpperCase)(variable);
    let inScope = variable[0] === '@' || variable === 'this' || this.ctx.hasBinding(variable);

    if (this.ctx.strict && !inScope) {
      if (uppercase) {
        throw (0, _syntaxError.generateSyntaxError)(`Attempted to invoke a component that was not in scope in a strict mode template, \`<${variable}>\`. If you wanted to create an element with that name, convert it to lowercase - \`<${variable.toLowerCase()}>\``, loc);
      } // In strict mode, values are always elements unless they are in scope


      return 'ElementHead';
    } // Since the parser handed us the HTML element name as a string, we need
    // to convert it into an ASTv1 path so it can be processed using the
    // expression normalizer.


    let isComponent = inScope || uppercase;
    let variableLoc = loc.sliceStartChars({
      skipStart: 1,
      chars: variable.length
    });
    let tailLength = tail.reduce((accum, part) => accum + 1 + part.length, 0);
    let pathEnd = variableLoc.getEnd().move(tailLength);
    let pathLoc = variableLoc.withEnd(pathEnd);

    if (isComponent) {
      let path = _parserBuilders.default.path({
        head: _parserBuilders.default.head(variable, variableLoc),
        tail,
        loc: pathLoc
      });

      let resolution = this.ctx.resolutionFor(path, _looseResolution.ComponentSyntaxContext);

      if (resolution.resolution === 'error') {
        throw (0, _syntaxError.generateSyntaxError)(`You attempted to invoke a path (\`<${resolution.path}>\`) but ${resolution.head} was not in scope`, loc);
      }

      return new ExpressionNormalizer(this.ctx).normalize(path, resolution.resolution);
    } // If the tag name wasn't a valid component but contained a `.`, it's
    // a syntax error.


    if (tail.length > 0) {
      throw (0, _syntaxError.generateSyntaxError)(`You used ${variable}.${tail.join('.')} as a tag name, but ${variable} is not in scope`, loc);
    }

    return 'ElementHead';
  }

  get expr() {
    return new ExpressionNormalizer(this.ctx);
  }

}

class Children {
  constructor(loc, children, block) {
    this.loc = loc;
    this.children = children;
    this.block = block;
    this.namedBlocks = children.filter(c => c instanceof ASTv2.NamedBlock);
    this.hasSemanticContent = Boolean(children.filter(c => {
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
    this.nonBlockChildren = children.filter(c => !(c instanceof ASTv2.NamedBlock));
  }

}

class TemplateChildren extends Children {
  assertTemplate(table) {
    if ((0, _util.isPresent)(this.namedBlocks)) {
      throw (0, _syntaxError.generateSyntaxError)(`Unexpected named block at the top-level of a template`, this.loc);
    }

    return this.block.builder.template(table, this.nonBlockChildren, this.block.loc(this.loc));
  }

}

class BlockChildren extends Children {
  assertBlock(table) {
    if ((0, _util.isPresent)(this.namedBlocks)) {
      throw (0, _syntaxError.generateSyntaxError)(`Unexpected named block nested in a normal block`, this.loc);
    }

    return this.block.builder.block(table, this.nonBlockChildren, this.loc);
  }

}

class ElementChildren extends Children {
  constructor(el, loc, children, block) {
    super(loc, children, block);
    this.el = el;
  }

  assertNamedBlock(name, table) {
    if (this.el.base.selfClosing) {
      throw (0, _syntaxError.generateSyntaxError)(`<:${name.chars}/> is not a valid named block: named blocks cannot be self-closing`, this.loc);
    }

    if ((0, _util.isPresent)(this.namedBlocks)) {
      throw (0, _syntaxError.generateSyntaxError)(`Unexpected named block inside <:${name.chars}> named block: named blocks cannot contain nested named blocks`, this.loc);
    }

    if (!(0, _utils.isLowerCase)(name.chars)) {
      throw (0, _syntaxError.generateSyntaxError)(`<:${name.chars}> is not a valid named block, and named blocks must begin with a lowercase letter`, this.loc);
    }

    if (this.el.base.attrs.length > 0 || this.el.base.componentArgs.length > 0 || this.el.base.modifiers.length > 0) {
      throw (0, _syntaxError.generateSyntaxError)(`named block <:${name.chars}> cannot have attributes, arguments, or modifiers`, this.loc);
    }

    let offsets = _spanList.SpanList.range(this.nonBlockChildren, this.loc);

    return this.block.builder.namedBlock(name, this.block.builder.block(table, this.nonBlockChildren, offsets), this.loc);
  }

  assertElement(name, hasBlockParams) {
    if (hasBlockParams) {
      throw (0, _syntaxError.generateSyntaxError)(`Unexpected block params in <${name}>: simple elements cannot have block params`, this.loc);
    }

    if ((0, _util.isPresent)(this.namedBlocks)) {
      let names = this.namedBlocks.map(b => b.name);

      if (names.length === 1) {
        throw (0, _syntaxError.generateSyntaxError)(`Unexpected named block <:foo> inside <${name.chars}> HTML element`, this.loc);
      } else {
        let printedNames = names.map(n => `<:${n.chars}>`).join(', ');
        throw (0, _syntaxError.generateSyntaxError)(`Unexpected named blocks inside <${name.chars}> HTML element (${printedNames})`, this.loc);
      }
    }

    return this.el.simple(name, this.nonBlockChildren, this.loc);
  }

  assertComponent(name, table, hasBlockParams) {
    if ((0, _util.isPresent)(this.namedBlocks) && this.hasSemanticContent) {
      throw (0, _syntaxError.generateSyntaxError)(`Unexpected content inside <${name}> component invocation: when using named blocks, the tag cannot contain other content`, this.loc);
    }

    if ((0, _util.isPresent)(this.namedBlocks)) {
      if (hasBlockParams) {
        throw (0, _syntaxError.generateSyntaxError)(`Unexpected block params list on <${name}> component invocation: when passing named blocks, the invocation tag cannot take block params`, this.loc);
      }

      let seenNames = new Set();

      for (let block of this.namedBlocks) {
        let name = block.name.chars;

        if (seenNames.has(name)) {
          throw (0, _syntaxError.generateSyntaxError)(`Component had two named blocks with the same name, \`<:${name}>\`. Only one block with a given name may be passed`, this.loc);
        }

        if (name === 'inverse' && seenNames.has('else') || name === 'else' && seenNames.has('inverse')) {
          throw (0, _syntaxError.generateSyntaxError)(`Component has both <:else> and <:inverse> block. <:inverse> is an alias for <:else>`, this.loc);
        }

        seenNames.add(name);
      }

      return this.namedBlocks;
    } else {
      return [this.block.builder.namedBlock(_slice.SourceSlice.synthetic('default'), this.block.builder.block(table, this.nonBlockChildren, this.loc), this.loc)];
    }
  }

}

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9ub3JtYWxpemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFVTSxTQUFBLFNBQUEsQ0FBQSxNQUFBLEVBRUosT0FBQSxHQUZJLEVBQUEsRUFFMkI7OztBQUUvQixNQUFJLEdBQUcsR0FBRyx3Q0FBVSxNQUFWLEVBQVYsT0FBVSxDQUFWO0FBRUEsTUFBSSxnQkFBZ0IsR0FBRyxrQkFDckI7QUFDRSxJQUFBLFVBQVUsRUFEWixLQUFBO0FBRUUsSUFBQSxNQUFNLEVBQUU7QUFGVixHQURxQixFQUF2QixPQUF1QixDQUF2Qjs7QUFRQSxNQUFJLEdBQUcsR0FBRyx5QkFBQSxHQUFBLENBQ1IsZ0JBQWdCLENBRFIsTUFBQSxFQUNlLENBQUEsRUFBQSxHQUN2QjtBQUNBLEVBQUEsT0FBTyxDQUZnQixzQkFBQSxNQUFBLElBQUEsSUFFTyxFQUFBLEtBQUEsS0FGUCxDQUFBLEdBQUEsRUFBQSxHQUVhLElBQUQsSUFIckMsSUFBVSxDQUFWOztBQUtBLE1BQUksS0FBSyxHQUFHLElBQUEsWUFBQSxDQUFBLE1BQUEsRUFBQSxnQkFBQSxFQUFaLEdBQVksQ0FBWjtBQUNBLE1BQUksVUFBVSxHQUFHLElBQUEsbUJBQUEsQ0FBakIsS0FBaUIsQ0FBakI7QUFFQSxNQUFJLEtBQUssR0FBRyxJQUFBLGdCQUFBLENBQ1YsS0FBSyxDQUFMLEdBQUEsQ0FBVSxHQUFHLENBREgsR0FDVixDQURVLEVBRVYsR0FBRyxDQUFILElBQUEsQ0FBQSxHQUFBLENBQWMsQ0FBRCxJQUFPLFVBQVUsQ0FBVixTQUFBLENBRlYsQ0FFVSxDQUFwQixDQUZVLEVBQUEsS0FBQSxFQUFBLGNBQUEsQ0FBWixHQUFZLENBQVo7QUFNQSxNQUFJLE1BQU0sR0FB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LFNBQUEsQ0FBQSxJQUFBLEVBQThEO0FBQzVELE1BQUksSUFBSSxDQUFKLElBQUEsS0FBSixnQkFBQSxFQUFvQztBQUNsQyxZQUFRLElBQUksQ0FBSixJQUFBLENBQVIsSUFBQTtBQUNFLFdBQUEsUUFBQTtBQUNBLFdBQUEsU0FBQTtBQUNFLGVBQU8sSUFBSSxDQUFKLElBQUEsQ0FBUCxJQUFBOztBQUNGLFdBQUEsVUFBQTtBQUNFLGVBQUEsTUFBQTtBQUxKO0FBREYsR0FBQSxNQVFPLElBQUksSUFBSSxDQUFKLElBQUEsQ0FBQSxJQUFBLEtBQUosZ0JBQUEsRUFBeUM7QUFDOUMsV0FBTyxTQUFTLENBQUMsSUFBSSxDQUFyQixJQUFnQixDQUFoQjtBQURLLEdBQUEsTUFFQTtBQUNMLFdBQU8sSUFBQSxnQkFBQSxDQUFZO0FBQUUsTUFBQSxjQUFjLEVBQUU7QUFBbEIsS0FBWixFQUFBLEtBQUEsQ0FBUCxJQUFPLENBQVA7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJlc2VudEFycmF5IH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBhc3NlcnQsIGFzc2lnbiwgaXNQcmVzZW50IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5cbmltcG9ydCBQcmludGVyIGZyb20gJy4uL2dlbmVyYXRpb24vcHJpbnRlcic7XG5pbXBvcnQgeyBQcmVjb21waWxlT3B0aW9ucywgcHJlcHJvY2VzcyB9IGZyb20gJy4uL3BhcnNlci90b2tlbml6ZXItZXZlbnQtaGFuZGxlcnMnO1xuaW1wb3J0IHsgU291cmNlTG9jYXRpb24gfSBmcm9tICcuLi9zb3VyY2UvbG9jYXRpb24nO1xuaW1wb3J0IHsgU291cmNlU2xpY2UgfSBmcm9tICcuLi9zb3VyY2Uvc2xpY2UnO1xuaW1wb3J0IHsgU291cmNlIH0gZnJvbSAnLi4vc291cmNlL3NvdXJjZSc7XG5pbXBvcnQgeyBTb3VyY2VTcGFuIH0gZnJvbSAnLi4vc291cmNlL3NwYW4nO1xuaW1wb3J0IHsgU3Bhbkxpc3QgfSBmcm9tICcuLi9zb3VyY2Uvc3Bhbi1saXN0JztcbmltcG9ydCB7IEJsb2NrU3ltYm9sVGFibGUsIFByb2dyYW1TeW1ib2xUYWJsZSwgU3ltYm9sVGFibGUgfSBmcm9tICcuLi9zeW1ib2wtdGFibGUnO1xuaW1wb3J0IHsgZ2VuZXJhdGVTeW50YXhFcnJvciB9IGZyb20gJy4uL3N5bnRheC1lcnJvcic7XG5pbXBvcnQgeyBpc0xvd2VyQ2FzZSwgaXNVcHBlckNhc2UgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgKiBhcyBBU1R2MSBmcm9tICcuLi92MS9hcGknO1xuaW1wb3J0IGIgZnJvbSAnLi4vdjEvcGFyc2VyLWJ1aWxkZXJzJztcbmltcG9ydCAqIGFzIEFTVHYyIGZyb20gJy4vYXBpJztcbmltcG9ydCB7IEJ1aWxkRWxlbWVudCwgQnVpbGRlciwgQ2FsbFBhcnRzIH0gZnJvbSAnLi9idWlsZGVycyc7XG5pbXBvcnQge1xuICBBcHBlbmRTeW50YXhDb250ZXh0LFxuICBBdHRyVmFsdWVTeW50YXhDb250ZXh0LFxuICBCbG9ja1N5bnRheENvbnRleHQsXG4gIENvbXBvbmVudFN5bnRheENvbnRleHQsXG4gIE1vZGlmaWVyU3ludGF4Q29udGV4dCxcbiAgUmVzb2x1dGlvbixcbiAgU2V4cFN5bnRheENvbnRleHQsXG59IGZyb20gJy4vbG9vc2UtcmVzb2x1dGlvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUoXG4gIHNvdXJjZTogU291cmNlLFxuICBvcHRpb25zOiBQcmVjb21waWxlT3B0aW9ucyA9IHt9XG4pOiBbYXN0OiBBU1R2Mi5UZW1wbGF0ZSwgbG9jYWxzOiBzdHJpbmdbXV0ge1xuICBsZXQgYXN0ID0gcHJlcHJvY2Vzcyhzb3VyY2UsIG9wdGlvbnMpO1xuXG4gIGxldCBub3JtYWxpemVPcHRpb25zID0gYXNzaWduKFxuICAgIHtcbiAgICAgIHN0cmljdE1vZGU6IGZhbHNlLFxuICAgICAgbG9jYWxzOiBbXSxcbiAgICB9LFxuICAgIG9wdGlvbnNcbiAgKTtcblxuICBsZXQgdG9wID0gU3ltYm9sVGFibGUudG9wKFxuICAgIG5vcm1hbGl6ZU9wdGlvbnMubG9jYWxzLFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvdW5ib3VuZC1tZXRob2RcbiAgICBvcHRpb25zLmN1c3RvbWl6ZUNvbXBvbmVudE5hbWUgPz8gKChuYW1lKSA9PiBuYW1lKVxuICApO1xuICBsZXQgYmxvY2sgPSBuZXcgQmxvY2tDb250ZXh0KHNvdXJjZSwgbm9ybWFsaXplT3B0aW9ucywgdG9wKTtcbiAgbGV0IG5vcm1hbGl6ZXIgPSBuZXcgU3RhdGVtZW50Tm9ybWFsaXplcihibG9jayk7XG5cbiAgbGV0IGFzdFYyID0gbmV3IFRlbXBsYXRlQ2hpbGRyZW4oXG4gICAgYmxvY2subG9jKGFzdC5sb2MpLFxuICAgIGFzdC5ib2R5Lm1hcCgoYikgPT4gbm9ybWFsaXplci5ub3JtYWxpemUoYikpLFxuICAgIGJsb2NrXG4gICkuYXNzZXJ0VGVtcGxhdGUodG9wKTtcblxuICBsZXQgbG9jYWxzID0gdG9wLmdldFVzZWRUZW1wbGF0ZUxvY2FscygpO1xuXG4gIHJldHVybiBbYXN0VjIsIGxvY2Fsc107XG59XG5cbi8qKlxuICogQSBgQmxvY2tDb250ZXh0YCByZXByZXNlbnRzIHRoZSBibG9jayB0aGF0IGEgcGFydGljdWxhciBBU1Qgbm9kZSBpcyBjb250YWluZWQgaW5zaWRlIG9mLlxuICpcbiAqIGBCbG9ja0NvbnRleHRgIGlzIGF3YXJlIG9mIHRlbXBsYXRlLXdpZGUgb3B0aW9ucyAoc3VjaCBhcyBzdHJpY3QgbW9kZSksIGFzIHdlbGwgYXMgdGhlIGJpbmRpbmdzXG4gKiB0aGF0IGFyZSBpbi1zY29wZSB3aXRoaW4gdGhhdCBibG9jay5cbiAqXG4gKiBDb25jcmV0ZWx5LCBpdCBoYXMgdGhlIGBQcmVjb21waWxlT3B0aW9uc2AgYW5kIGN1cnJlbnQgYFN5bWJvbFRhYmxlYCwgYW5kIHByb3ZpZGVzXG4gKiBmYWNpbGl0aWVzIGZvciB3b3JraW5nIHdpdGggdGhvc2Ugb3B0aW9ucy5cbiAqXG4gKiBgQmxvY2tDb250ZXh0YCBpcyBzdGF0ZWxlc3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBCbG9ja0NvbnRleHQ8VGFibGUgZXh0ZW5kcyBTeW1ib2xUYWJsZSA9IFN5bWJvbFRhYmxlPiB7XG4gIHJlYWRvbmx5IGJ1aWxkZXI6IEJ1aWxkZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgc291cmNlOiBTb3VyY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSBvcHRpb25zOiBQcmVjb21waWxlT3B0aW9ucyxcbiAgICByZWFkb25seSB0YWJsZTogVGFibGVcbiAgKSB7XG4gICAgdGhpcy5idWlsZGVyID0gbmV3IEJ1aWxkZXIoKTtcbiAgfVxuXG4gIGdldCBzdHJpY3QoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5zdHJpY3RNb2RlIHx8IGZhbHNlO1xuICB9XG5cbiAgbG9jKGxvYzogU291cmNlTG9jYXRpb24pOiBTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2Uuc3BhbkZvcihsb2MpO1xuICB9XG5cbiAgcmVzb2x1dGlvbkZvcjxOIGV4dGVuZHMgQVNUdjEuQ2FsbE5vZGUgfCBBU1R2MS5QYXRoRXhwcmVzc2lvbj4oXG4gICAgbm9kZTogTixcbiAgICByZXNvbHV0aW9uOiBSZXNvbHV0aW9uPE4+XG4gICk6IHsgcmVzb2x1dGlvbjogQVNUdjIuRnJlZVZhclJlc29sdXRpb24gfSB8IHsgcmVzb2x1dGlvbjogJ2Vycm9yJzsgcGF0aDogc3RyaW5nOyBoZWFkOiBzdHJpbmcgfSB7XG4gICAgaWYgKHRoaXMuc3RyaWN0KSB7XG4gICAgICByZXR1cm4geyByZXNvbHV0aW9uOiBBU1R2Mi5TVFJJQ1RfUkVTT0xVVElPTiB9O1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzRnJlZVZhcihub2RlKSkge1xuICAgICAgbGV0IHIgPSByZXNvbHV0aW9uKG5vZGUpO1xuXG4gICAgICBpZiAociA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlc29sdXRpb246ICdlcnJvcicsXG4gICAgICAgICAgcGF0aDogcHJpbnRQYXRoKG5vZGUpLFxuICAgICAgICAgIGhlYWQ6IHByaW50SGVhZChub2RlKSxcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHsgcmVzb2x1dGlvbjogciB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4geyByZXNvbHV0aW9uOiBBU1R2Mi5TVFJJQ1RfUkVTT0xVVElPTiB9O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaXNGcmVlVmFyKGNhbGxlZTogQVNUdjEuQ2FsbE5vZGUgfCBBU1R2MS5QYXRoRXhwcmVzc2lvbik6IGJvb2xlYW4ge1xuICAgIGlmIChjYWxsZWUudHlwZSA9PT0gJ1BhdGhFeHByZXNzaW9uJykge1xuICAgICAgaWYgKGNhbGxlZS5oZWFkLnR5cGUgIT09ICdWYXJIZWFkJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAhdGhpcy50YWJsZS5oYXMoY2FsbGVlLmhlYWQubmFtZSk7XG4gICAgfSBlbHNlIGlmIChjYWxsZWUucGF0aC50eXBlID09PSAnUGF0aEV4cHJlc3Npb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy5pc0ZyZWVWYXIoY2FsbGVlLnBhdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgaGFzQmluZGluZyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZS5oYXMobmFtZSk7XG4gIH1cblxuICBjaGlsZChibG9ja1BhcmFtczogc3RyaW5nW10pOiBCbG9ja0NvbnRleHQ8QmxvY2tTeW1ib2xUYWJsZT4ge1xuICAgIHJldHVybiBuZXcgQmxvY2tDb250ZXh0KHRoaXMuc291cmNlLCB0aGlzLm9wdGlvbnMsIHRoaXMudGFibGUuY2hpbGQoYmxvY2tQYXJhbXMpKTtcbiAgfVxuXG4gIGN1c3RvbWl6ZUNvbXBvbmVudE5hbWUoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5jdXN0b21pemVDb21wb25lbnROYW1lKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmN1c3RvbWl6ZUNvbXBvbmVudE5hbWUoaW5wdXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQW4gYEV4cHJlc3Npb25Ob3JtYWxpemVyYCBub3JtYWxpemVzIGV4cHJlc3Npb25zIHdpdGhpbiBhIGJsb2NrLlxuICpcbiAqIGBFeHByZXNzaW9uTm9ybWFsaXplcmAgaXMgc3RhdGVsZXNzLlxuICovXG5jbGFzcyBFeHByZXNzaW9uTm9ybWFsaXplciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgYmxvY2s6IEJsb2NrQ29udGV4dCkge31cblxuICAvKipcbiAgICogVGhlIGBub3JtYWxpemVgIG1ldGhvZCB0YWtlcyBhbiBhcmJpdHJhcnkgZXhwcmVzc2lvbiBhbmQgaXRzIG9yaWdpbmFsIHN5bnRheCBjb250ZXh0IGFuZFxuICAgKiBub3JtYWxpemVzIGl0IHRvIGFuIEFTVHYyIGV4cHJlc3Npb24uXG4gICAqXG4gICAqIEBzZWUge1N5bnRheENvbnRleHR9XG4gICAqL1xuICBub3JtYWxpemUoZXhwcjogQVNUdjEuTGl0ZXJhbCwgcmVzb2x1dGlvbjogQVNUdjIuRnJlZVZhclJlc29sdXRpb24pOiBBU1R2Mi5MaXRlcmFsRXhwcmVzc2lvbjtcbiAgbm9ybWFsaXplKFxuICAgIGV4cHI6IEFTVHYxLk1pbmltYWxQYXRoRXhwcmVzc2lvbixcbiAgICByZXNvbHV0aW9uOiBBU1R2Mi5GcmVlVmFyUmVzb2x1dGlvblxuICApOiBBU1R2Mi5QYXRoRXhwcmVzc2lvbjtcbiAgbm9ybWFsaXplKGV4cHI6IEFTVHYxLlN1YkV4cHJlc3Npb24sIHJlc29sdXRpb246IEFTVHYyLkZyZWVWYXJSZXNvbHV0aW9uKTogQVNUdjIuQ2FsbEV4cHJlc3Npb247XG4gIG5vcm1hbGl6ZShleHByOiBBU1R2MS5FeHByZXNzaW9uLCByZXNvbHV0aW9uOiBBU1R2Mi5GcmVlVmFyUmVzb2x1dGlvbik6IEFTVHYyLkV4cHJlc3Npb25Ob2RlO1xuICBub3JtYWxpemUoXG4gICAgZXhwcjogQVNUdjEuRXhwcmVzc2lvbiB8IEFTVHYxLk1pbmltYWxQYXRoRXhwcmVzc2lvbixcbiAgICByZXNvbHV0aW9uOiBBU1R2Mi5GcmVlVmFyUmVzb2x1dGlvblxuICApOiBBU1R2Mi5FeHByZXNzaW9uTm9kZSB7XG4gICAgc3dpdGNoIChleHByLnR5cGUpIHtcbiAgICAgIGNhc2UgJ051bGxMaXRlcmFsJzpcbiAgICAgIGNhc2UgJ0Jvb2xlYW5MaXRlcmFsJzpcbiAgICAgIGNhc2UgJ051bWJlckxpdGVyYWwnOlxuICAgICAgY2FzZSAnU3RyaW5nTGl0ZXJhbCc6XG4gICAgICBjYXNlICdVbmRlZmluZWRMaXRlcmFsJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2suYnVpbGRlci5saXRlcmFsKGV4cHIudmFsdWUsIHRoaXMuYmxvY2subG9jKGV4cHIubG9jKSk7XG4gICAgICBjYXNlICdQYXRoRXhwcmVzc2lvbic6XG4gICAgICAgIHJldHVybiB0aGlzLnBhdGgoZXhwciwgcmVzb2x1dGlvbik7XG4gICAgICBjYXNlICdTdWJFeHByZXNzaW9uJzoge1xuICAgICAgICBsZXQgcmVzb2x1dGlvbiA9IHRoaXMuYmxvY2sucmVzb2x1dGlvbkZvcihleHByLCBTZXhwU3ludGF4Q29udGV4dCk7XG5cbiAgICAgICAgaWYgKHJlc29sdXRpb24ucmVzb2x1dGlvbiA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgICAgICBgWW91IGF0dGVtcHRlZCB0byBpbnZva2UgYSBwYXRoIChcXGAke3Jlc29sdXRpb24ucGF0aH1cXGApIGJ1dCAke3Jlc29sdXRpb24uaGVhZH0gd2FzIG5vdCBpbiBzY29wZWAsXG4gICAgICAgICAgICBleHByLmxvY1xuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5ibG9jay5idWlsZGVyLnNleHAoXG4gICAgICAgICAgdGhpcy5jYWxsUGFydHMoZXhwciwgcmVzb2x1dGlvbi5yZXNvbHV0aW9uKSxcbiAgICAgICAgICB0aGlzLmJsb2NrLmxvYyhleHByLmxvYylcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBhdGgoXG4gICAgZXhwcjogQVNUdjEuTWluaW1hbFBhdGhFeHByZXNzaW9uLFxuICAgIHJlc29sdXRpb246IEFTVHYyLkZyZWVWYXJSZXNvbHV0aW9uXG4gICk6IEFTVHYyLlBhdGhFeHByZXNzaW9uIHtcbiAgICBsZXQgaGVhZE9mZnNldHMgPSB0aGlzLmJsb2NrLmxvYyhleHByLmhlYWQubG9jKTtcblxuICAgIGxldCB0YWlsID0gW107XG5cbiAgICAvLyBzdGFydCB3aXRoIHRoZSBoZWFkXG4gICAgbGV0IG9mZnNldCA9IGhlYWRPZmZzZXRzO1xuXG4gICAgZm9yIChsZXQgcGFydCBvZiBleHByLnRhaWwpIHtcbiAgICAgIG9mZnNldCA9IG9mZnNldC5zbGljZVN0YXJ0Q2hhcnMoeyBjaGFyczogcGFydC5sZW5ndGgsIHNraXBTdGFydDogMSB9KTtcbiAgICAgIHRhaWwucHVzaChcbiAgICAgICAgbmV3IFNvdXJjZVNsaWNlKHtcbiAgICAgICAgICBsb2M6IG9mZnNldCxcbiAgICAgICAgICBjaGFyczogcGFydCxcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYmxvY2suYnVpbGRlci5wYXRoKHRoaXMucmVmKGV4cHIuaGVhZCwgcmVzb2x1dGlvbiksIHRhaWwsIHRoaXMuYmxvY2subG9jKGV4cHIubG9jKSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGBjYWxsUGFydHNgIG1ldGhvZCB0YWtlcyBBU1R2MS5DYWxsUGFydHMgYXMgd2VsbCBhcyBhIHN5bnRheCBjb250ZXh0IGFuZCBub3JtYWxpemVzXG4gICAqIGl0IHRvIGFuIEFTVHYyIENhbGxQYXJ0cy5cbiAgICovXG4gIGNhbGxQYXJ0cyhwYXJ0czogQVNUdjEuQ2FsbFBhcnRzLCBjb250ZXh0OiBBU1R2Mi5GcmVlVmFyUmVzb2x1dGlvbik6IENhbGxQYXJ0cyB7XG4gICAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoIH0gPSBwYXJ0cztcblxuICAgIGxldCBjYWxsZWUgPSB0aGlzLm5vcm1hbGl6ZShwYXRoLCBjb250ZXh0KTtcbiAgICBsZXQgcGFyYW1MaXN0ID0gcGFyYW1zLm1hcCgocCkgPT4gdGhpcy5ub3JtYWxpemUocCwgQVNUdjIuQVJHVU1FTlRfUkVTT0xVVElPTikpO1xuICAgIGxldCBwYXJhbUxvYyA9IFNwYW5MaXN0LnJhbmdlKHBhcmFtTGlzdCwgY2FsbGVlLmxvYy5jb2xsYXBzZSgnZW5kJykpO1xuICAgIGxldCBuYW1lZExvYyA9IHRoaXMuYmxvY2subG9jKGhhc2gubG9jKTtcbiAgICBsZXQgYXJnc0xvYyA9IFNwYW5MaXN0LnJhbmdlKFtwYXJhbUxvYywgbmFtZWRMb2NdKTtcblxuICAgIGxldCBwb3NpdGlvbmFsID0gdGhpcy5ibG9jay5idWlsZGVyLnBvc2l0aW9uYWwoXG4gICAgICBwYXJhbXMubWFwKChwKSA9PiB0aGlzLm5vcm1hbGl6ZShwLCBBU1R2Mi5BUkdVTUVOVF9SRVNPTFVUSU9OKSksXG4gICAgICBwYXJhbUxvY1xuICAgICk7XG5cbiAgICBsZXQgbmFtZWQgPSB0aGlzLmJsb2NrLmJ1aWxkZXIubmFtZWQoXG4gICAgICBoYXNoLnBhaXJzLm1hcCgocCkgPT4gdGhpcy5uYW1lZEFyZ3VtZW50KHApKSxcbiAgICAgIHRoaXMuYmxvY2subG9jKGhhc2gubG9jKVxuICAgICk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY2FsbGVlLFxuICAgICAgYXJnczogdGhpcy5ibG9jay5idWlsZGVyLmFyZ3MocG9zaXRpb25hbCwgbmFtZWQsIGFyZ3NMb2MpLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIG5hbWVkQXJndW1lbnQocGFpcjogQVNUdjEuSGFzaFBhaXIpOiBBU1R2Mi5OYW1lZEFyZ3VtZW50IHtcbiAgICBsZXQgb2Zmc2V0cyA9IHRoaXMuYmxvY2subG9jKHBhaXIubG9jKTtcblxuICAgIGxldCBrZXlPZmZzZXRzID0gb2Zmc2V0cy5zbGljZVN0YXJ0Q2hhcnMoeyBjaGFyczogcGFpci5rZXkubGVuZ3RoIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuYmxvY2suYnVpbGRlci5uYW1lZEFyZ3VtZW50KFxuICAgICAgbmV3IFNvdXJjZVNsaWNlKHsgY2hhcnM6IHBhaXIua2V5LCBsb2M6IGtleU9mZnNldHMgfSksXG4gICAgICB0aGlzLm5vcm1hbGl6ZShwYWlyLnZhbHVlLCBBU1R2Mi5BUkdVTUVOVF9SRVNPTFVUSU9OKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGByZWZgIG1ldGhvZCBub3JtYWxpemVzIGFuIGBBU1R2MS5QYXRoSGVhZGAgaW50byBhbiBgQVNUdjIuVmFyaWFibGVSZWZlcmVuY2VgLlxuICAgKiBUaGlzIG1ldGhvZCBpcyBleHRyZW1lbHkgaW1wb3J0YW50LCBiZWNhdXNlIGl0IGlzIHJlc3BvbnNpYmxlIGZvciBub3JtYWxpemluZyBmcmVlXG4gICAqIHZhcmlhYmxlcyBpbnRvIGFuIGFuIEFTVHYyLlBhdGhIZWFkICp3aXRoIGFwcHJvcHJpYXRlIGNvbnRleHQqLlxuICAgKlxuICAgKiBUaGUgc3ludGF4IGNvbnRleHQgaXMgb3JpZ2luYWxseSBkZXRlcm1pbmVkIGJ5IHRoZSBzeW50YWN0aWMgcG9zaXRpb24gdGhhdCB0aGlzIGBQYXRoSGVhZGBcbiAgICogY2FtZSBmcm9tLCBhbmQgaXMgdWx0aW1hdGVseSBhdHRhY2hlZCB0byB0aGUgYEFTVHYyLlZhcmlhYmxlUmVmZXJlbmNlYCBoZXJlLiBJbiBBU1R2MixcbiAgICogdGhlIGBWYXJpYWJsZVJlZmVyZW5jZWAgbm9kZSBiZWFycyBmdWxsIHJlc3BvbnNpYmlsaXR5IGZvciBsb29zZSBtb2RlIHJ1bGVzIHRoYXQgY29udHJvbFxuICAgKiB0aGUgYmVoYXZpb3Igb2YgZnJlZSB2YXJpYWJsZXMuXG4gICAqL1xuICBwcml2YXRlIHJlZihoZWFkOiBBU1R2MS5QYXRoSGVhZCwgcmVzb2x1dGlvbjogQVNUdjIuRnJlZVZhclJlc29sdXRpb24pOiBBU1R2Mi5WYXJpYWJsZVJlZmVyZW5jZSB7XG4gICAgbGV0IHsgYmxvY2sgfSA9IHRoaXM7XG4gICAgbGV0IHsgYnVpbGRlciwgdGFibGUgfSA9IGJsb2NrO1xuICAgIGxldCBvZmZzZXRzID0gYmxvY2subG9jKGhlYWQubG9jKTtcblxuICAgIHN3aXRjaCAoaGVhZC50eXBlKSB7XG4gICAgICBjYXNlICdUaGlzSGVhZCc6XG4gICAgICAgIHJldHVybiBidWlsZGVyLnNlbGYob2Zmc2V0cyk7XG4gICAgICBjYXNlICdBdEhlYWQnOiB7XG4gICAgICAgIGxldCBzeW1ib2wgPSB0YWJsZS5hbGxvY2F0ZU5hbWVkKGhlYWQubmFtZSk7XG4gICAgICAgIHJldHVybiBidWlsZGVyLmF0KGhlYWQubmFtZSwgc3ltYm9sLCBvZmZzZXRzKTtcbiAgICAgIH1cbiAgICAgIGNhc2UgJ1ZhckhlYWQnOiB7XG4gICAgICAgIGlmIChibG9jay5oYXNCaW5kaW5nKGhlYWQubmFtZSkpIHtcbiAgICAgICAgICBsZXQgW3N5bWJvbCwgaXNSb290XSA9IHRhYmxlLmdldChoZWFkLm5hbWUpO1xuXG4gICAgICAgICAgcmV0dXJuIGJsb2NrLmJ1aWxkZXIubG9jYWxWYXIoaGVhZC5uYW1lLCBzeW1ib2wsIGlzUm9vdCwgb2Zmc2V0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IGNvbnRleHQgPSBibG9jay5zdHJpY3QgPyBBU1R2Mi5TVFJJQ1RfUkVTT0xVVElPTiA6IHJlc29sdXRpb247XG4gICAgICAgICAgbGV0IHN5bWJvbCA9IGJsb2NrLnRhYmxlLmFsbG9jYXRlRnJlZShoZWFkLm5hbWUsIGNvbnRleHQpO1xuXG4gICAgICAgICAgcmV0dXJuIGJsb2NrLmJ1aWxkZXIuZnJlZVZhcih7XG4gICAgICAgICAgICBuYW1lOiBoZWFkLm5hbWUsXG4gICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgc3ltYm9sLFxuICAgICAgICAgICAgbG9jOiBvZmZzZXRzLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogYFRlbXBsYXRlTm9ybWFsaXplcmAgbm9ybWFsaXplcyB0b3AtbGV2ZWwgQVNUdjEgc3RhdGVtZW50cyB0byBBU1R2Mi5cbiAqL1xuY2xhc3MgU3RhdGVtZW50Tm9ybWFsaXplciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgYmxvY2s6IEJsb2NrQ29udGV4dCkge31cblxuICBub3JtYWxpemUobm9kZTogQVNUdjEuU3RhdGVtZW50KTogQVNUdjIuQ29udGVudE5vZGUgfCBBU1R2Mi5OYW1lZEJsb2NrIHtcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgICAgY2FzZSAnUGFydGlhbFN0YXRlbWVudCc6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSGFuZGxlYmFycyBwYXJ0aWFsIHN5bnRheCAoe3s+IC4uLn19KSBpcyBub3QgYWxsb3dlZCBpbiBHbGltbWVyYCk7XG4gICAgICBjYXNlICdCbG9ja1N0YXRlbWVudCc6XG4gICAgICAgIHJldHVybiB0aGlzLkJsb2NrU3RhdGVtZW50KG5vZGUpO1xuICAgICAgY2FzZSAnRWxlbWVudE5vZGUnOlxuICAgICAgICByZXR1cm4gbmV3IEVsZW1lbnROb3JtYWxpemVyKHRoaXMuYmxvY2spLkVsZW1lbnROb2RlKG5vZGUpO1xuICAgICAgY2FzZSAnTXVzdGFjaGVTdGF0ZW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy5NdXN0YWNoZVN0YXRlbWVudChub2RlKTtcblxuICAgICAgLy8gVGhlc2UgYXJlIHRoZSBzYW1lIGluIEFTVHYyXG4gICAgICBjYXNlICdNdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy5NdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQobm9kZSk7XG5cbiAgICAgIGNhc2UgJ0NvbW1lbnRTdGF0ZW1lbnQnOiB7XG4gICAgICAgIGxldCBsb2MgPSB0aGlzLmJsb2NrLmxvYyhub2RlLmxvYyk7XG4gICAgICAgIHJldHVybiBuZXcgQVNUdjIuSHRtbENvbW1lbnQoe1xuICAgICAgICAgIGxvYyxcbiAgICAgICAgICB0ZXh0OiBsb2Muc2xpY2UoeyBza2lwU3RhcnQ6IDQsIHNraXBFbmQ6IDMgfSkudG9TbGljZShub2RlLnZhbHVlKSxcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ1RleHROb2RlJzpcbiAgICAgICAgcmV0dXJuIG5ldyBBU1R2Mi5IdG1sVGV4dCh7XG4gICAgICAgICAgbG9jOiB0aGlzLmJsb2NrLmxvYyhub2RlLmxvYyksXG4gICAgICAgICAgY2hhcnM6IG5vZGUuY2hhcnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIE11c3RhY2hlQ29tbWVudFN0YXRlbWVudChub2RlOiBBU1R2MS5NdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQpOiBBU1R2Mi5HbGltbWVyQ29tbWVudCB7XG4gICAgbGV0IGxvYyA9IHRoaXMuYmxvY2subG9jKG5vZGUubG9jKTtcbiAgICBsZXQgdGV4dExvYzogU291cmNlU3BhbjtcblxuICAgIGlmIChsb2MuYXNTdHJpbmcoKS5zbGljZSgwLCA1KSA9PT0gJ3t7IS0tJykge1xuICAgICAgdGV4dExvYyA9IGxvYy5zbGljZSh7IHNraXBTdGFydDogNSwgc2tpcEVuZDogNCB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGV4dExvYyA9IGxvYy5zbGljZSh7IHNraXBTdGFydDogMywgc2tpcEVuZDogMiB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IEFTVHYyLkdsaW1tZXJDb21tZW50KHtcbiAgICAgIGxvYyxcbiAgICAgIHRleHQ6IHRleHRMb2MudG9TbGljZShub2RlLnZhbHVlKSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIGFuIEFTVHYxLk11c3RhY2hlU3RhdGVtZW50IHRvIGFuIEFTVHYyLkFwcGVuZFN0YXRlbWVudFxuICAgKi9cbiAgTXVzdGFjaGVTdGF0ZW1lbnQobXVzdGFjaGU6IEFTVHYxLk11c3RhY2hlU3RhdGVtZW50KTogQVNUdjIuQXBwZW5kQ29udGVudCB7XG4gICAgbGV0IHsgZXNjYXBlZCB9ID0gbXVzdGFjaGU7XG4gICAgbGV0IGxvYyA9IHRoaXMuYmxvY2subG9jKG11c3RhY2hlLmxvYyk7XG5cbiAgICAvLyBOb3JtYWxpemUgdGhlIGNhbGwgcGFydHMgaW4gQXBwZW5kU3ludGF4Q29udGV4dFxuICAgIGxldCBjYWxsUGFydHMgPSB0aGlzLmV4cHIuY2FsbFBhcnRzKFxuICAgICAge1xuICAgICAgICBwYXRoOiBtdXN0YWNoZS5wYXRoLFxuICAgICAgICBwYXJhbXM6IG11c3RhY2hlLnBhcmFtcyxcbiAgICAgICAgaGFzaDogbXVzdGFjaGUuaGFzaCxcbiAgICAgIH0sXG4gICAgICBBcHBlbmRTeW50YXhDb250ZXh0KG11c3RhY2hlKVxuICAgICk7XG5cbiAgICBsZXQgdmFsdWUgPSBjYWxsUGFydHMuYXJncy5pc0VtcHR5KClcbiAgICAgID8gY2FsbFBhcnRzLmNhbGxlZVxuICAgICAgOiB0aGlzLmJsb2NrLmJ1aWxkZXIuc2V4cChjYWxsUGFydHMsIGxvYyk7XG5cbiAgICByZXR1cm4gdGhpcy5ibG9jay5idWlsZGVyLmFwcGVuZChcbiAgICAgIHtcbiAgICAgICAgdGFibGU6IHRoaXMuYmxvY2sudGFibGUsXG4gICAgICAgIHRydXN0aW5nOiAhZXNjYXBlZCxcbiAgICAgICAgdmFsdWUsXG4gICAgICB9LFxuICAgICAgbG9jXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIGEgQVNUdjEuQmxvY2tTdGF0ZW1lbnQgdG8gYW4gQVNUdjIuQmxvY2tTdGF0ZW1lbnRcbiAgICovXG4gIEJsb2NrU3RhdGVtZW50KGJsb2NrOiBBU1R2MS5CbG9ja1N0YXRlbWVudCk6IEFTVHYyLkludm9rZUJsb2NrIHtcbiAgICBsZXQgeyBwcm9ncmFtLCBpbnZlcnNlIH0gPSBibG9jaztcbiAgICBsZXQgbG9jID0gdGhpcy5ibG9jay5sb2MoYmxvY2subG9jKTtcblxuICAgIGxldCByZXNvbHV0aW9uID0gdGhpcy5ibG9jay5yZXNvbHV0aW9uRm9yKGJsb2NrLCBCbG9ja1N5bnRheENvbnRleHQpO1xuXG4gICAgaWYgKHJlc29sdXRpb24ucmVzb2x1dGlvbiA9PT0gJ2Vycm9yJykge1xuICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgYFlvdSBhdHRlbXB0ZWQgdG8gaW52b2tlIGEgcGF0aCAoXFxge3sjJHtyZXNvbHV0aW9uLnBhdGh9fX1cXGApIGJ1dCAke3Jlc29sdXRpb24uaGVhZH0gd2FzIG5vdCBpbiBzY29wZWAsXG4gICAgICAgIGxvY1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgY2FsbFBhcnRzID0gdGhpcy5leHByLmNhbGxQYXJ0cyhibG9jaywgcmVzb2x1dGlvbi5yZXNvbHV0aW9uKTtcblxuICAgIHJldHVybiB0aGlzLmJsb2NrLmJ1aWxkZXIuYmxvY2tTdGF0ZW1lbnQoXG4gICAgICBhc3NpZ24oXG4gICAgICAgIHtcbiAgICAgICAgICBzeW1ib2xzOiB0aGlzLmJsb2NrLnRhYmxlLFxuICAgICAgICAgIHByb2dyYW06IHRoaXMuQmxvY2socHJvZ3JhbSksXG4gICAgICAgICAgaW52ZXJzZTogaW52ZXJzZSA/IHRoaXMuQmxvY2soaW52ZXJzZSkgOiBudWxsLFxuICAgICAgICB9LFxuICAgICAgICBjYWxsUGFydHNcbiAgICAgICksXG4gICAgICBsb2NcbiAgICApO1xuICB9XG5cbiAgQmxvY2soeyBib2R5LCBsb2MsIGJsb2NrUGFyYW1zIH06IEFTVHYxLkJsb2NrKTogQVNUdjIuQmxvY2sge1xuICAgIGxldCBjaGlsZCA9IHRoaXMuYmxvY2suY2hpbGQoYmxvY2tQYXJhbXMpO1xuICAgIGxldCBub3JtYWxpemVyID0gbmV3IFN0YXRlbWVudE5vcm1hbGl6ZXIoY2hpbGQpO1xuICAgIHJldHVybiBuZXcgQmxvY2tDaGlsZHJlbihcbiAgICAgIHRoaXMuYmxvY2subG9jKGxvYyksXG4gICAgICBib2R5Lm1hcCgoYikgPT4gbm9ybWFsaXplci5ub3JtYWxpemUoYikpLFxuICAgICAgdGhpcy5ibG9ja1xuICAgICkuYXNzZXJ0QmxvY2soY2hpbGQudGFibGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgZXhwcigpOiBFeHByZXNzaW9uTm9ybWFsaXplciB7XG4gICAgcmV0dXJuIG5ldyBFeHByZXNzaW9uTm9ybWFsaXplcih0aGlzLmJsb2NrKTtcbiAgfVxufVxuXG5jbGFzcyBFbGVtZW50Tm9ybWFsaXplciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgY3R4OiBCbG9ja0NvbnRleHQpIHt9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgYW4gQVNUdjEuRWxlbWVudE5vZGUgdG86XG4gICAqXG4gICAqIC0gQVNUdjIuTmFtZWRCbG9jayBpZiB0aGUgdGFnIG5hbWUgYmVnaW5zIHdpdGggYDpgXG4gICAqIC0gQVNUdjIuQ29tcG9uZW50IGlmIHRoZSB0YWcgbmFtZSBtYXRjaGVzIHRoZSBjb21wb25lbnQgaGV1cmlzdGljc1xuICAgKiAtIEFTVHYyLlNpbXBsZUVsZW1lbnQgaWYgdGhlIHRhZyBuYW1lIGRvZXNuJ3QgbWF0Y2ggdGhlIGNvbXBvbmVudCBoZXVyaXN0aWNzXG4gICAqXG4gICAqIEEgdGFnIG5hbWUgcmVwcmVzZW50cyBhIGNvbXBvbmVudCBpZjpcbiAgICpcbiAgICogLSBpdCBiZWdpbnMgd2l0aCBgQGBcbiAgICogLSBpdCBpcyBleGFjdGx5IGB0aGlzYCBvciBiZWdpbnMgd2l0aCBgdGhpcy5gXG4gICAqIC0gdGhlIHBhcnQgYmVmb3JlIHRoZSBmaXJzdCBgLmAgaXMgYSByZWZlcmVuY2UgdG8gYW4gaW4tc2NvcGUgdmFyaWFibGUgYmluZGluZ1xuICAgKiAtIGl0IGJlZ2lucyB3aXRoIGFuIHVwcGVyY2FzZSBjaGFyYWN0ZXJcbiAgICovXG4gIEVsZW1lbnROb2RlKGVsZW1lbnQ6IEFTVHYxLkVsZW1lbnROb2RlKTogQVNUdjIuRWxlbWVudE5vZGUge1xuICAgIGxldCB7IHRhZywgc2VsZkNsb3NpbmcsIGNvbW1lbnRzIH0gPSBlbGVtZW50O1xuICAgIGxldCBsb2MgPSB0aGlzLmN0eC5sb2MoZWxlbWVudC5sb2MpO1xuXG4gICAgbGV0IFt0YWdIZWFkLCAuLi5yZXN0XSA9IHRhZy5zcGxpdCgnLicpO1xuXG4gICAgLy8gdGhlIGhlYWQsIGF0dHJpYnV0ZXMgYW5kIG1vZGlmaWVycyBhcmUgaW4gdGhlIGN1cnJlbnQgc2NvcGVcbiAgICBsZXQgcGF0aCA9IHRoaXMuY2xhc3NpZnlUYWcodGFnSGVhZCwgcmVzdCwgZWxlbWVudC5sb2MpO1xuXG4gICAgbGV0IGF0dHJzID0gZWxlbWVudC5hdHRyaWJ1dGVzLmZpbHRlcigoYSkgPT4gYS5uYW1lWzBdICE9PSAnQCcpLm1hcCgoYSkgPT4gdGhpcy5hdHRyKGEpKTtcbiAgICBsZXQgYXJncyA9IGVsZW1lbnQuYXR0cmlidXRlcy5maWx0ZXIoKGEpID0+IGEubmFtZVswXSA9PT0gJ0AnKS5tYXAoKGEpID0+IHRoaXMuYXJnKGEpKTtcblxuICAgIGxldCBtb2RpZmllcnMgPSBlbGVtZW50Lm1vZGlmaWVycy5tYXAoKG0pID0+IHRoaXMubW9kaWZpZXIobSkpO1xuXG4gICAgLy8gdGhlIGVsZW1lbnQncyBibG9jayBwYXJhbXMgYXJlIGluIHNjb3BlIGZvciB0aGUgY2hpbGRyZW5cbiAgICBsZXQgY2hpbGQgPSB0aGlzLmN0eC5jaGlsZChlbGVtZW50LmJsb2NrUGFyYW1zKTtcbiAgICBsZXQgbm9ybWFsaXplciA9IG5ldyBTdGF0ZW1lbnROb3JtYWxpemVyKGNoaWxkKTtcblxuICAgIGxldCBjaGlsZE5vZGVzID0gZWxlbWVudC5jaGlsZHJlbi5tYXAoKHMpID0+IG5vcm1hbGl6ZXIubm9ybWFsaXplKHMpKTtcblxuICAgIGxldCBlbCA9IHRoaXMuY3R4LmJ1aWxkZXIuZWxlbWVudCh7XG4gICAgICBzZWxmQ2xvc2luZyxcbiAgICAgIGF0dHJzLFxuICAgICAgY29tcG9uZW50QXJnczogYXJncyxcbiAgICAgIG1vZGlmaWVycyxcbiAgICAgIGNvbW1lbnRzOiBjb21tZW50cy5tYXAoKGMpID0+IG5ldyBTdGF0ZW1lbnROb3JtYWxpemVyKHRoaXMuY3R4KS5NdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQoYykpLFxuICAgIH0pO1xuXG4gICAgbGV0IGNoaWxkcmVuID0gbmV3IEVsZW1lbnRDaGlsZHJlbihlbCwgbG9jLCBjaGlsZE5vZGVzLCB0aGlzLmN0eCk7XG5cbiAgICBsZXQgb2Zmc2V0cyA9IHRoaXMuY3R4LmxvYyhlbGVtZW50LmxvYyk7XG4gICAgbGV0IHRhZ09mZnNldHMgPSBvZmZzZXRzLnNsaWNlU3RhcnRDaGFycyh7IGNoYXJzOiB0YWcubGVuZ3RoLCBza2lwU3RhcnQ6IDEgfSk7XG5cbiAgICBpZiAocGF0aCA9PT0gJ0VsZW1lbnRIZWFkJykge1xuICAgICAgaWYgKHRhZ1swXSA9PT0gJzonKSB7XG4gICAgICAgIHJldHVybiBjaGlsZHJlbi5hc3NlcnROYW1lZEJsb2NrKFxuICAgICAgICAgIHRhZ09mZnNldHMuc2xpY2UoeyBza2lwU3RhcnQ6IDEgfSkudG9TbGljZSh0YWcuc2xpY2UoMSkpLFxuICAgICAgICAgIGNoaWxkLnRhYmxlXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY2hpbGRyZW4uYXNzZXJ0RWxlbWVudCh0YWdPZmZzZXRzLnRvU2xpY2UodGFnKSwgZWxlbWVudC5ibG9ja1BhcmFtcy5sZW5ndGggPiAwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudC5zZWxmQ2xvc2luZykge1xuICAgICAgcmV0dXJuIGVsLnNlbGZDbG9zaW5nQ29tcG9uZW50KHBhdGgsIGxvYyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBibG9ja3MgPSBjaGlsZHJlbi5hc3NlcnRDb21wb25lbnQodGFnLCBjaGlsZC50YWJsZSwgZWxlbWVudC5ibG9ja1BhcmFtcy5sZW5ndGggPiAwKTtcbiAgICAgIHJldHVybiBlbC5jb21wb25lbnRXaXRoTmFtZWRCbG9ja3MocGF0aCwgYmxvY2tzLCBsb2MpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgbW9kaWZpZXIobTogQVNUdjEuRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50KTogQVNUdjIuRWxlbWVudE1vZGlmaWVyIHtcbiAgICBsZXQgcmVzb2x1dGlvbiA9IHRoaXMuY3R4LnJlc29sdXRpb25Gb3IobSwgTW9kaWZpZXJTeW50YXhDb250ZXh0KTtcblxuICAgIGlmIChyZXNvbHV0aW9uLnJlc29sdXRpb24gPT09ICdlcnJvcicpIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgIGBZb3UgYXR0ZW1wdGVkIHRvIGludm9rZSBhIHBhdGggKFxcYHt7IyR7cmVzb2x1dGlvbi5wYXRofX19XFxgKSBhcyBhIG1vZGlmaWVyLCBidXQgJHtyZXNvbHV0aW9uLmhlYWR9IHdhcyBub3QgaW4gc2NvcGUuIFRyeSBhZGRpbmcgXFxgdGhpc1xcYCB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBwYXRoYCxcbiAgICAgICAgbS5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IGNhbGxQYXJ0cyA9IHRoaXMuZXhwci5jYWxsUGFydHMobSwgcmVzb2x1dGlvbi5yZXNvbHV0aW9uKTtcbiAgICByZXR1cm4gdGhpcy5jdHguYnVpbGRlci5tb2RpZmllcihjYWxsUGFydHMsIHRoaXMuY3R4LmxvYyhtLmxvYykpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGhhbmRsZXMgYXR0cmlidXRlIHZhbHVlcyB0aGF0IGFyZSBjdXJsaWVzLCBhcyB3ZWxsIGFzIGN1cmxpZXMgbmVzdGVkIGluc2lkZSBvZlxuICAgKiBpbnRlcnBvbGF0aW9uczpcbiAgICpcbiAgICogYGBgaGJzXG4gICAqIDxhIGhyZWY9e3t1cmx9fSAvPlxuICAgKiA8YSBocmVmPVwie3t1cmx9fS5odG1sXCIgLz5cbiAgICogYGBgXG4gICAqL1xuICBwcml2YXRlIG11c3RhY2hlQXR0cihtdXN0YWNoZTogQVNUdjEuTXVzdGFjaGVTdGF0ZW1lbnQpOiBBU1R2Mi5FeHByZXNzaW9uTm9kZSB7XG4gICAgLy8gTm9ybWFsaXplIHRoZSBjYWxsIHBhcnRzIGluIEF0dHJWYWx1ZVN5bnRheENvbnRleHRcbiAgICBsZXQgc2V4cCA9IHRoaXMuY3R4LmJ1aWxkZXIuc2V4cChcbiAgICAgIHRoaXMuZXhwci5jYWxsUGFydHMobXVzdGFjaGUsIEF0dHJWYWx1ZVN5bnRheENvbnRleHQobXVzdGFjaGUpKSxcbiAgICAgIHRoaXMuY3R4LmxvYyhtdXN0YWNoZS5sb2MpXG4gICAgKTtcblxuICAgIC8vIElmIHRoZXJlIGFyZSBubyBwYXJhbXMgb3IgaGFzaCwganVzdCByZXR1cm4gdGhlIGZ1bmN0aW9uIHBhcnQgYXMgaXRzIG93biBleHByZXNzaW9uXG4gICAgaWYgKHNleHAuYXJncy5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybiBzZXhwLmNhbGxlZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNleHA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGF0dHJQYXJ0IGlzIHRoZSBuYXJyb3dlZCBkb3duIGxpc3Qgb2YgdmFsaWQgYXR0cmlidXRlIHZhbHVlcyB0aGF0IGFyZSBhbHNvXG4gICAqIGFsbG93ZWQgYXMgYSBjb25jYXQgcGFydCAoeW91IGNhbid0IG5lc3QgY29uY2F0cykuXG4gICAqL1xuICBwcml2YXRlIGF0dHJQYXJ0KFxuICAgIHBhcnQ6IEFTVHYxLk11c3RhY2hlU3RhdGVtZW50IHwgQVNUdjEuVGV4dE5vZGVcbiAgKTogeyBleHByOiBBU1R2Mi5FeHByZXNzaW9uTm9kZTsgdHJ1c3Rpbmc6IGJvb2xlYW4gfSB7XG4gICAgc3dpdGNoIChwYXJ0LnR5cGUpIHtcbiAgICAgIGNhc2UgJ011c3RhY2hlU3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHsgZXhwcjogdGhpcy5tdXN0YWNoZUF0dHIocGFydCksIHRydXN0aW5nOiAhcGFydC5lc2NhcGVkIH07XG4gICAgICBjYXNlICdUZXh0Tm9kZSc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZXhwcjogdGhpcy5jdHguYnVpbGRlci5saXRlcmFsKHBhcnQuY2hhcnMsIHRoaXMuY3R4LmxvYyhwYXJ0LmxvYykpLFxuICAgICAgICAgIHRydXN0aW5nOiB0cnVlLFxuICAgICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXR0clZhbHVlKFxuICAgIHBhcnQ6IEFTVHYxLk11c3RhY2hlU3RhdGVtZW50IHwgQVNUdjEuVGV4dE5vZGUgfCBBU1R2MS5Db25jYXRTdGF0ZW1lbnRcbiAgKTogeyBleHByOiBBU1R2Mi5FeHByZXNzaW9uTm9kZTsgdHJ1c3Rpbmc6IGJvb2xlYW4gfSB7XG4gICAgc3dpdGNoIChwYXJ0LnR5cGUpIHtcbiAgICAgIGNhc2UgJ0NvbmNhdFN0YXRlbWVudCc6IHtcbiAgICAgICAgbGV0IHBhcnRzID0gcGFydC5wYXJ0cy5tYXAoKHApID0+IHRoaXMuYXR0clBhcnQocCkuZXhwcik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZXhwcjogdGhpcy5jdHguYnVpbGRlci5pbnRlcnBvbGF0ZShwYXJ0cywgdGhpcy5jdHgubG9jKHBhcnQubG9jKSksXG4gICAgICAgICAgdHJ1c3Rpbmc6IGZhbHNlLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0clBhcnQocGFydCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhdHRyKG06IEFTVHYxLkF0dHJOb2RlKTogQVNUdjIuSHRtbE9yU3BsYXRBdHRyIHtcbiAgICBhc3NlcnQobS5uYW1lWzBdICE9PSAnQCcsICdBbiBhdHRyIG5hbWUgbXVzdCBub3Qgc3RhcnQgd2l0aCBgQGAnKTtcblxuICAgIGlmIChtLm5hbWUgPT09ICcuLi5hdHRyaWJ1dGVzJykge1xuICAgICAgcmV0dXJuIHRoaXMuY3R4LmJ1aWxkZXIuc3BsYXRBdHRyKHRoaXMuY3R4LnRhYmxlLmFsbG9jYXRlQmxvY2soJ2F0dHJzJyksIHRoaXMuY3R4LmxvYyhtLmxvYykpO1xuICAgIH1cblxuICAgIGxldCBvZmZzZXRzID0gdGhpcy5jdHgubG9jKG0ubG9jKTtcbiAgICBsZXQgbmFtZVNsaWNlID0gb2Zmc2V0cy5zbGljZVN0YXJ0Q2hhcnMoeyBjaGFyczogbS5uYW1lLmxlbmd0aCB9KS50b1NsaWNlKG0ubmFtZSk7XG5cbiAgICBsZXQgdmFsdWUgPSB0aGlzLmF0dHJWYWx1ZShtLnZhbHVlKTtcbiAgICByZXR1cm4gdGhpcy5jdHguYnVpbGRlci5hdHRyKFxuICAgICAgeyBuYW1lOiBuYW1lU2xpY2UsIHZhbHVlOiB2YWx1ZS5leHByLCB0cnVzdGluZzogdmFsdWUudHJ1c3RpbmcgfSxcbiAgICAgIG9mZnNldHNcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBtYXliZURlcHJlY2F0ZWRDYWxsKFxuICAgIGFyZzogU291cmNlU2xpY2UsXG4gICAgcGFydDogQVNUdjEuTXVzdGFjaGVTdGF0ZW1lbnQgfCBBU1R2MS5UZXh0Tm9kZSB8IEFTVHYxLkNvbmNhdFN0YXRlbWVudFxuICApOiB7IGV4cHI6IEFTVHYyLkRlcHJlY2F0ZWRDYWxsRXhwcmVzc2lvbjsgdHJ1c3Rpbmc6IGJvb2xlYW4gfSB8IG51bGwge1xuICAgIGlmICh0aGlzLmN0eC5zdHJpY3QpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChwYXJ0LnR5cGUgIT09ICdNdXN0YWNoZVN0YXRlbWVudCcpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCB7IHBhdGggfSA9IHBhcnQ7XG5cbiAgICBpZiAocGF0aC50eXBlICE9PSAnUGF0aEV4cHJlc3Npb24nKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAocGF0aC5oZWFkLnR5cGUgIT09ICdWYXJIZWFkJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHsgbmFtZSB9ID0gcGF0aC5oZWFkO1xuXG4gICAgaWYgKG5hbWUgPT09ICdoYXMtYmxvY2snIHx8IG5hbWUgPT09ICdoYXMtYmxvY2stcGFyYW1zJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY3R4Lmhhc0JpbmRpbmcobmFtZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChwYXRoLnRhaWwubGVuZ3RoICE9PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAocGFydC5wYXJhbXMubGVuZ3RoICE9PSAwIHx8IHBhcnQuaGFzaC5wYWlycy5sZW5ndGggIT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCBjb250ZXh0ID0gQVNUdjIuTG9vc2VNb2RlUmVzb2x1dGlvbi5hdHRyKCk7XG5cbiAgICBsZXQgY2FsbGVlID0gdGhpcy5jdHguYnVpbGRlci5mcmVlVmFyKHtcbiAgICAgIG5hbWUsXG4gICAgICBjb250ZXh0LFxuICAgICAgc3ltYm9sOiB0aGlzLmN0eC50YWJsZS5hbGxvY2F0ZUZyZWUobmFtZSwgY29udGV4dCksXG4gICAgICBsb2M6IHBhdGgubG9jLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGV4cHI6IHRoaXMuY3R4LmJ1aWxkZXIuZGVwcmVjYXRlZENhbGwoYXJnLCBjYWxsZWUsIHBhcnQubG9jKSxcbiAgICAgIHRydXN0aW5nOiBmYWxzZSxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBhcmcoYXJnOiBBU1R2MS5BdHRyTm9kZSk6IEFTVHYyLkNvbXBvbmVudEFyZyB7XG4gICAgYXNzZXJ0KGFyZy5uYW1lWzBdID09PSAnQCcsICdBbiBhcmcgbmFtZSBtdXN0IHN0YXJ0IHdpdGggYEBgJyk7XG5cbiAgICBsZXQgb2Zmc2V0cyA9IHRoaXMuY3R4LmxvYyhhcmcubG9jKTtcbiAgICBsZXQgbmFtZVNsaWNlID0gb2Zmc2V0cy5zbGljZVN0YXJ0Q2hhcnMoeyBjaGFyczogYXJnLm5hbWUubGVuZ3RoIH0pLnRvU2xpY2UoYXJnLm5hbWUpO1xuXG4gICAgbGV0IHZhbHVlID0gdGhpcy5tYXliZURlcHJlY2F0ZWRDYWxsKG5hbWVTbGljZSwgYXJnLnZhbHVlKSB8fCB0aGlzLmF0dHJWYWx1ZShhcmcudmFsdWUpO1xuICAgIHJldHVybiB0aGlzLmN0eC5idWlsZGVyLmFyZyhcbiAgICAgIHsgbmFtZTogbmFtZVNsaWNlLCB2YWx1ZTogdmFsdWUuZXhwciwgdHJ1c3Rpbmc6IHZhbHVlLnRydXN0aW5nIH0sXG4gICAgICBvZmZzZXRzXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNsYXNzaWZpZXMgdGhlIGhlYWQgb2YgYW4gQVNUdjEuRWxlbWVudCBpbnRvIGFuIEFTVHYyLlBhdGhIZWFkIChpZiB0aGVcbiAgICogZWxlbWVudCBpcyBhIGNvbXBvbmVudCkgb3IgYCdFbGVtZW50SGVhZCdgIChpZiB0aGUgZWxlbWVudCBpcyBhIHNpbXBsZSBlbGVtZW50KS5cbiAgICpcbiAgICogUnVsZXM6XG4gICAqXG4gICAqIDEuIElmIHRoZSB2YXJpYWJsZSBpcyBhbiBgQGFyZ2AsIHJldHVybiBhbiBgQXRIZWFkYFxuICAgKiAyLiBJZiB0aGUgdmFyaWFibGUgaXMgYHRoaXNgLCByZXR1cm4gYSBgVGhpc0hlYWRgXG4gICAqIDMuIElmIHRoZSB2YXJpYWJsZSBpcyBpbiB0aGUgY3VycmVudCBzY29wZTpcbiAgICogICBhLiBJZiB0aGUgc2NvcGUgaXMgdGhlIHJvb3Qgc2NvcGUsIHRoZW4gcmV0dXJuIGEgRnJlZSBgTG9jYWxWYXJIZWFkYFxuICAgKiAgIGIuIEVsc2UsIHJldHVybiBhIHN0YW5kYXJkIGBMb2NhbFZhckhlYWRgXG4gICAqIDQuIElmIHRoZSB0YWcgbmFtZSBpcyBhIHBhdGggYW5kIHRoZSB2YXJpYWJsZSBpcyBub3QgaW4gdGhlIGN1cnJlbnQgc2NvcGUsIFN5bnRheCBFcnJvclxuICAgKiA1LiBJZiB0aGUgdmFyaWFibGUgaXMgdXBwZXJjYXNlIHJldHVybiBhIEZyZWVWYXIoUmVzb2x2ZUFzQ29tcG9uZW50SGVhZClcbiAgICogNi4gT3RoZXJ3aXNlLCByZXR1cm4gYCdFbGVtZW50SGVhZCdgXG4gICAqL1xuICBwcml2YXRlIGNsYXNzaWZ5VGFnKFxuICAgIHZhcmlhYmxlOiBzdHJpbmcsXG4gICAgdGFpbDogc3RyaW5nW10sXG4gICAgbG9jOiBTb3VyY2VTcGFuXG4gICk6IEFTVHYyLkV4cHJlc3Npb25Ob2RlIHwgJ0VsZW1lbnRIZWFkJyB7XG4gICAgbGV0IHVwcGVyY2FzZSA9IGlzVXBwZXJDYXNlKHZhcmlhYmxlKTtcbiAgICBsZXQgaW5TY29wZSA9IHZhcmlhYmxlWzBdID09PSAnQCcgfHwgdmFyaWFibGUgPT09ICd0aGlzJyB8fCB0aGlzLmN0eC5oYXNCaW5kaW5nKHZhcmlhYmxlKTtcblxuICAgIGlmICh0aGlzLmN0eC5zdHJpY3QgJiYgIWluU2NvcGUpIHtcbiAgICAgIGlmICh1cHBlcmNhc2UpIHtcbiAgICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgICBgQXR0ZW1wdGVkIHRvIGludm9rZSBhIGNvbXBvbmVudCB0aGF0IHdhcyBub3QgaW4gc2NvcGUgaW4gYSBzdHJpY3QgbW9kZSB0ZW1wbGF0ZSwgXFxgPCR7dmFyaWFibGV9PlxcYC4gSWYgeW91IHdhbnRlZCB0byBjcmVhdGUgYW4gZWxlbWVudCB3aXRoIHRoYXQgbmFtZSwgY29udmVydCBpdCB0byBsb3dlcmNhc2UgLSBcXGA8JHt2YXJpYWJsZS50b0xvd2VyQ2FzZSgpfT5cXGBgLFxuICAgICAgICAgIGxvY1xuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyBJbiBzdHJpY3QgbW9kZSwgdmFsdWVzIGFyZSBhbHdheXMgZWxlbWVudHMgdW5sZXNzIHRoZXkgYXJlIGluIHNjb3BlXG4gICAgICByZXR1cm4gJ0VsZW1lbnRIZWFkJztcbiAgICB9XG5cbiAgICAvLyBTaW5jZSB0aGUgcGFyc2VyIGhhbmRlZCB1cyB0aGUgSFRNTCBlbGVtZW50IG5hbWUgYXMgYSBzdHJpbmcsIHdlIG5lZWRcbiAgICAvLyB0byBjb252ZXJ0IGl0IGludG8gYW4gQVNUdjEgcGF0aCBzbyBpdCBjYW4gYmUgcHJvY2Vzc2VkIHVzaW5nIHRoZVxuICAgIC8vIGV4cHJlc3Npb24gbm9ybWFsaXplci5cbiAgICBsZXQgaXNDb21wb25lbnQgPSBpblNjb3BlIHx8IHVwcGVyY2FzZTtcblxuICAgIGxldCB2YXJpYWJsZUxvYyA9IGxvYy5zbGljZVN0YXJ0Q2hhcnMoeyBza2lwU3RhcnQ6IDEsIGNoYXJzOiB2YXJpYWJsZS5sZW5ndGggfSk7XG5cbiAgICBsZXQgdGFpbExlbmd0aCA9IHRhaWwucmVkdWNlKChhY2N1bSwgcGFydCkgPT4gYWNjdW0gKyAxICsgcGFydC5sZW5ndGgsIDApO1xuICAgIGxldCBwYXRoRW5kID0gdmFyaWFibGVMb2MuZ2V0RW5kKCkubW92ZSh0YWlsTGVuZ3RoKTtcbiAgICBsZXQgcGF0aExvYyA9IHZhcmlhYmxlTG9jLndpdGhFbmQocGF0aEVuZCk7XG5cbiAgICBpZiAoaXNDb21wb25lbnQpIHtcbiAgICAgIGxldCBwYXRoID0gYi5wYXRoKHtcbiAgICAgICAgaGVhZDogYi5oZWFkKHZhcmlhYmxlLCB2YXJpYWJsZUxvYyksXG4gICAgICAgIHRhaWwsXG4gICAgICAgIGxvYzogcGF0aExvYyxcbiAgICAgIH0pO1xuXG4gICAgICBsZXQgcmVzb2x1dGlvbiA9IHRoaXMuY3R4LnJlc29sdXRpb25Gb3IocGF0aCwgQ29tcG9uZW50U3ludGF4Q29udGV4dCk7XG5cbiAgICAgIGlmIChyZXNvbHV0aW9uLnJlc29sdXRpb24gPT09ICdlcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgICBgWW91IGF0dGVtcHRlZCB0byBpbnZva2UgYSBwYXRoIChcXGA8JHtyZXNvbHV0aW9uLnBhdGh9PlxcYCkgYnV0ICR7cmVzb2x1dGlvbi5oZWFkfSB3YXMgbm90IGluIHNjb3BlYCxcbiAgICAgICAgICBsb2NcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBFeHByZXNzaW9uTm9ybWFsaXplcih0aGlzLmN0eCkubm9ybWFsaXplKHBhdGgsIHJlc29sdXRpb24ucmVzb2x1dGlvbik7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHRhZyBuYW1lIHdhc24ndCBhIHZhbGlkIGNvbXBvbmVudCBidXQgY29udGFpbmVkIGEgYC5gLCBpdCdzXG4gICAgLy8gYSBzeW50YXggZXJyb3IuXG4gICAgaWYgKHRhaWwubGVuZ3RoID4gMCkge1xuICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgYFlvdSB1c2VkICR7dmFyaWFibGV9LiR7dGFpbC5qb2luKCcuJyl9IGFzIGEgdGFnIG5hbWUsIGJ1dCAke3ZhcmlhYmxlfSBpcyBub3QgaW4gc2NvcGVgLFxuICAgICAgICBsb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuICdFbGVtZW50SGVhZCc7XG4gIH1cblxuICBwcml2YXRlIGdldCBleHByKCk6IEV4cHJlc3Npb25Ob3JtYWxpemVyIHtcbiAgICByZXR1cm4gbmV3IEV4cHJlc3Npb25Ob3JtYWxpemVyKHRoaXMuY3R4KTtcbiAgfVxufVxuXG5jbGFzcyBDaGlsZHJlbiB7XG4gIHJlYWRvbmx5IG5hbWVkQmxvY2tzOiBBU1R2Mi5OYW1lZEJsb2NrW107XG4gIHJlYWRvbmx5IGhhc1NlbWFudGljQ29udGVudDogYm9vbGVhbjtcbiAgcmVhZG9ubHkgbm9uQmxvY2tDaGlsZHJlbjogQVNUdjIuQ29udGVudE5vZGVbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBsb2M6IFNvdXJjZVNwYW4sXG4gICAgcmVhZG9ubHkgY2hpbGRyZW46IChBU1R2Mi5Db250ZW50Tm9kZSB8IEFTVHYyLk5hbWVkQmxvY2spW10sXG4gICAgcmVhZG9ubHkgYmxvY2s6IEJsb2NrQ29udGV4dFxuICApIHtcbiAgICB0aGlzLm5hbWVkQmxvY2tzID0gY2hpbGRyZW4uZmlsdGVyKChjKTogYyBpcyBBU1R2Mi5OYW1lZEJsb2NrID0+IGMgaW5zdGFuY2VvZiBBU1R2Mi5OYW1lZEJsb2NrKTtcbiAgICB0aGlzLmhhc1NlbWFudGljQ29udGVudCA9IEJvb2xlYW4oXG4gICAgICBjaGlsZHJlbi5maWx0ZXIoKGMpOiBjIGlzIEFTVHYyLkNvbnRlbnROb2RlID0+IHtcbiAgICAgICAgaWYgKGMgaW5zdGFuY2VvZiBBU1R2Mi5OYW1lZEJsb2NrKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAoYy50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnR2xpbW1lckNvbW1lbnQnOlxuICAgICAgICAgIGNhc2UgJ0h0bWxDb21tZW50JzpcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICBjYXNlICdIdG1sVGV4dCc6XG4gICAgICAgICAgICByZXR1cm4gIS9eXFxzKiQvLmV4ZWMoYy5jaGFycyk7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KS5sZW5ndGhcbiAgICApO1xuICAgIHRoaXMubm9uQmxvY2tDaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlcihcbiAgICAgIChjKTogYyBpcyBBU1R2Mi5Db250ZW50Tm9kZSA9PiAhKGMgaW5zdGFuY2VvZiBBU1R2Mi5OYW1lZEJsb2NrKVxuICAgICk7XG4gIH1cbn1cblxuY2xhc3MgVGVtcGxhdGVDaGlsZHJlbiBleHRlbmRzIENoaWxkcmVuIHtcbiAgYXNzZXJ0VGVtcGxhdGUodGFibGU6IFByb2dyYW1TeW1ib2xUYWJsZSk6IEFTVHYyLlRlbXBsYXRlIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMubmFtZWRCbG9ja3MpKSB7XG4gICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKGBVbmV4cGVjdGVkIG5hbWVkIGJsb2NrIGF0IHRoZSB0b3AtbGV2ZWwgb2YgYSB0ZW1wbGF0ZWAsIHRoaXMubG9jKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5ibG9jay5idWlsZGVyLnRlbXBsYXRlKHRhYmxlLCB0aGlzLm5vbkJsb2NrQ2hpbGRyZW4sIHRoaXMuYmxvY2subG9jKHRoaXMubG9jKSk7XG4gIH1cbn1cblxuY2xhc3MgQmxvY2tDaGlsZHJlbiBleHRlbmRzIENoaWxkcmVuIHtcbiAgYXNzZXJ0QmxvY2sodGFibGU6IEJsb2NrU3ltYm9sVGFibGUpOiBBU1R2Mi5CbG9jayB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLm5hbWVkQmxvY2tzKSkge1xuICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihgVW5leHBlY3RlZCBuYW1lZCBibG9jayBuZXN0ZWQgaW4gYSBub3JtYWwgYmxvY2tgLCB0aGlzLmxvYyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYmxvY2suYnVpbGRlci5ibG9jayh0YWJsZSwgdGhpcy5ub25CbG9ja0NoaWxkcmVuLCB0aGlzLmxvYyk7XG4gIH1cbn1cblxuY2xhc3MgRWxlbWVudENoaWxkcmVuIGV4dGVuZHMgQ2hpbGRyZW4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGVsOiBCdWlsZEVsZW1lbnQsXG4gICAgbG9jOiBTb3VyY2VTcGFuLFxuICAgIGNoaWxkcmVuOiAoQVNUdjIuQ29udGVudE5vZGUgfCBBU1R2Mi5OYW1lZEJsb2NrKVtdLFxuICAgIGJsb2NrOiBCbG9ja0NvbnRleHRcbiAgKSB7XG4gICAgc3VwZXIobG9jLCBjaGlsZHJlbiwgYmxvY2spO1xuICB9XG5cbiAgYXNzZXJ0TmFtZWRCbG9jayhuYW1lOiBTb3VyY2VTbGljZSwgdGFibGU6IEJsb2NrU3ltYm9sVGFibGUpOiBBU1R2Mi5OYW1lZEJsb2NrIHtcbiAgICBpZiAodGhpcy5lbC5iYXNlLnNlbGZDbG9zaW5nKSB7XG4gICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKFxuICAgICAgICBgPDoke25hbWUuY2hhcnN9Lz4gaXMgbm90IGEgdmFsaWQgbmFtZWQgYmxvY2s6IG5hbWVkIGJsb2NrcyBjYW5ub3QgYmUgc2VsZi1jbG9zaW5nYCxcbiAgICAgICAgdGhpcy5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLm5hbWVkQmxvY2tzKSkge1xuICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgYFVuZXhwZWN0ZWQgbmFtZWQgYmxvY2sgaW5zaWRlIDw6JHtuYW1lLmNoYXJzfT4gbmFtZWQgYmxvY2s6IG5hbWVkIGJsb2NrcyBjYW5ub3QgY29udGFpbiBuZXN0ZWQgbmFtZWQgYmxvY2tzYCxcbiAgICAgICAgdGhpcy5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKCFpc0xvd2VyQ2FzZShuYW1lLmNoYXJzKSkge1xuICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgYDw6JHtuYW1lLmNoYXJzfT4gaXMgbm90IGEgdmFsaWQgbmFtZWQgYmxvY2ssIGFuZCBuYW1lZCBibG9ja3MgbXVzdCBiZWdpbiB3aXRoIGEgbG93ZXJjYXNlIGxldHRlcmAsXG4gICAgICAgIHRoaXMubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMuZWwuYmFzZS5hdHRycy5sZW5ndGggPiAwIHx8XG4gICAgICB0aGlzLmVsLmJhc2UuY29tcG9uZW50QXJncy5sZW5ndGggPiAwIHx8XG4gICAgICB0aGlzLmVsLmJhc2UubW9kaWZpZXJzLmxlbmd0aCA+IDBcbiAgICApIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgIGBuYW1lZCBibG9jayA8OiR7bmFtZS5jaGFyc30+IGNhbm5vdCBoYXZlIGF0dHJpYnV0ZXMsIGFyZ3VtZW50cywgb3IgbW9kaWZpZXJzYCxcbiAgICAgICAgdGhpcy5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IG9mZnNldHMgPSBTcGFuTGlzdC5yYW5nZSh0aGlzLm5vbkJsb2NrQ2hpbGRyZW4sIHRoaXMubG9jKTtcblxuICAgIHJldHVybiB0aGlzLmJsb2NrLmJ1aWxkZXIubmFtZWRCbG9jayhcbiAgICAgIG5hbWUsXG4gICAgICB0aGlzLmJsb2NrLmJ1aWxkZXIuYmxvY2sodGFibGUsIHRoaXMubm9uQmxvY2tDaGlsZHJlbiwgb2Zmc2V0cyksXG4gICAgICB0aGlzLmxvY1xuICAgICk7XG4gIH1cblxuICBhc3NlcnRFbGVtZW50KG5hbWU6IFNvdXJjZVNsaWNlLCBoYXNCbG9ja1BhcmFtczogYm9vbGVhbik6IEFTVHYyLlNpbXBsZUVsZW1lbnQge1xuICAgIGlmIChoYXNCbG9ja1BhcmFtcykge1xuICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgYFVuZXhwZWN0ZWQgYmxvY2sgcGFyYW1zIGluIDwke25hbWV9Pjogc2ltcGxlIGVsZW1lbnRzIGNhbm5vdCBoYXZlIGJsb2NrIHBhcmFtc2AsXG4gICAgICAgIHRoaXMubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5uYW1lZEJsb2NrcykpIHtcbiAgICAgIGxldCBuYW1lcyA9IHRoaXMubmFtZWRCbG9ja3MubWFwKChiKSA9PiBiLm5hbWUpO1xuXG4gICAgICBpZiAobmFtZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgICAgYFVuZXhwZWN0ZWQgbmFtZWQgYmxvY2sgPDpmb28+IGluc2lkZSA8JHtuYW1lLmNoYXJzfT4gSFRNTCBlbGVtZW50YCxcbiAgICAgICAgICB0aGlzLmxvY1xuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHByaW50ZWROYW1lcyA9IG5hbWVzLm1hcCgobikgPT4gYDw6JHtuLmNoYXJzfT5gKS5qb2luKCcsICcpO1xuICAgICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKFxuICAgICAgICAgIGBVbmV4cGVjdGVkIG5hbWVkIGJsb2NrcyBpbnNpZGUgPCR7bmFtZS5jaGFyc30+IEhUTUwgZWxlbWVudCAoJHtwcmludGVkTmFtZXN9KWAsXG4gICAgICAgICAgdGhpcy5sb2NcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5lbC5zaW1wbGUobmFtZSwgdGhpcy5ub25CbG9ja0NoaWxkcmVuLCB0aGlzLmxvYyk7XG4gIH1cblxuICBhc3NlcnRDb21wb25lbnQoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHRhYmxlOiBCbG9ja1N5bWJvbFRhYmxlLFxuICAgIGhhc0Jsb2NrUGFyYW1zOiBib29sZWFuXG4gICk6IFByZXNlbnRBcnJheTxBU1R2Mi5OYW1lZEJsb2NrPiB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLm5hbWVkQmxvY2tzKSAmJiB0aGlzLmhhc1NlbWFudGljQ29udGVudCkge1xuICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgYFVuZXhwZWN0ZWQgY29udGVudCBpbnNpZGUgPCR7bmFtZX0+IGNvbXBvbmVudCBpbnZvY2F0aW9uOiB3aGVuIHVzaW5nIG5hbWVkIGJsb2NrcywgdGhlIHRhZyBjYW5ub3QgY29udGFpbiBvdGhlciBjb250ZW50YCxcbiAgICAgICAgdGhpcy5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLm5hbWVkQmxvY2tzKSkge1xuICAgICAgaWYgKGhhc0Jsb2NrUGFyYW1zKSB7XG4gICAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgICAgYFVuZXhwZWN0ZWQgYmxvY2sgcGFyYW1zIGxpc3Qgb24gPCR7bmFtZX0+IGNvbXBvbmVudCBpbnZvY2F0aW9uOiB3aGVuIHBhc3NpbmcgbmFtZWQgYmxvY2tzLCB0aGUgaW52b2NhdGlvbiB0YWcgY2Fubm90IHRha2UgYmxvY2sgcGFyYW1zYCxcbiAgICAgICAgICB0aGlzLmxvY1xuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBsZXQgc2Vlbk5hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgICAgIGZvciAobGV0IGJsb2NrIG9mIHRoaXMubmFtZWRCbG9ja3MpIHtcbiAgICAgICAgbGV0IG5hbWUgPSBibG9jay5uYW1lLmNoYXJzO1xuXG4gICAgICAgIGlmIChzZWVuTmFtZXMuaGFzKG5hbWUpKSB7XG4gICAgICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgICAgIGBDb21wb25lbnQgaGFkIHR3byBuYW1lZCBibG9ja3Mgd2l0aCB0aGUgc2FtZSBuYW1lLCBcXGA8OiR7bmFtZX0+XFxgLiBPbmx5IG9uZSBibG9jayB3aXRoIGEgZ2l2ZW4gbmFtZSBtYXkgYmUgcGFzc2VkYCxcbiAgICAgICAgICAgIHRoaXMubG9jXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAobmFtZSA9PT0gJ2ludmVyc2UnICYmIHNlZW5OYW1lcy5oYXMoJ2Vsc2UnKSkgfHxcbiAgICAgICAgICAobmFtZSA9PT0gJ2Vsc2UnICYmIHNlZW5OYW1lcy5oYXMoJ2ludmVyc2UnKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgICAgIGBDb21wb25lbnQgaGFzIGJvdGggPDplbHNlPiBhbmQgPDppbnZlcnNlPiBibG9jay4gPDppbnZlcnNlPiBpcyBhbiBhbGlhcyBmb3IgPDplbHNlPmAsXG4gICAgICAgICAgICB0aGlzLmxvY1xuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWVuTmFtZXMuYWRkKG5hbWUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5uYW1lZEJsb2NrcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgdGhpcy5ibG9jay5idWlsZGVyLm5hbWVkQmxvY2soXG4gICAgICAgICAgU291cmNlU2xpY2Uuc3ludGhldGljKCdkZWZhdWx0JyksXG4gICAgICAgICAgdGhpcy5ibG9jay5idWlsZGVyLmJsb2NrKHRhYmxlLCB0aGlzLm5vbkJsb2NrQ2hpbGRyZW4sIHRoaXMubG9jKSxcbiAgICAgICAgICB0aGlzLmxvY1xuICAgICAgICApLFxuICAgICAgXTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJpbnRQYXRoKG5vZGU6IEFTVHYxLlBhdGhFeHByZXNzaW9uIHwgQVNUdjEuQ2FsbE5vZGUpOiBzdHJpbmcge1xuICBpZiAobm9kZS50eXBlICE9PSAnUGF0aEV4cHJlc3Npb24nICYmIG5vZGUucGF0aC50eXBlID09PSAnUGF0aEV4cHJlc3Npb24nKSB7XG4gICAgcmV0dXJuIHByaW50UGF0aChub2RlLnBhdGgpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgUHJpbnRlcih7IGVudGl0eUVuY29kaW5nOiAncmF3JyB9KS5wcmludChub2RlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcmludEhlYWQobm9kZTogQVNUdjEuUGF0aEV4cHJlc3Npb24gfCBBU1R2MS5DYWxsTm9kZSk6IHN0cmluZyB7XG4gIGlmIChub2RlLnR5cGUgPT09ICdQYXRoRXhwcmVzc2lvbicpIHtcbiAgICBzd2l0Y2ggKG5vZGUuaGVhZC50eXBlKSB7XG4gICAgICBjYXNlICdBdEhlYWQnOlxuICAgICAgY2FzZSAnVmFySGVhZCc6XG4gICAgICAgIHJldHVybiBub2RlLmhlYWQubmFtZTtcbiAgICAgIGNhc2UgJ1RoaXNIZWFkJzpcbiAgICAgICAgcmV0dXJuICd0aGlzJztcbiAgICB9XG4gIH0gZWxzZSBpZiAobm9kZS5wYXRoLnR5cGUgPT09ICdQYXRoRXhwcmVzc2lvbicpIHtcbiAgICByZXR1cm4gcHJpbnRIZWFkKG5vZGUucGF0aCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBQcmludGVyKHsgZW50aXR5RW5jb2Rpbmc6ICdyYXcnIH0pLnByaW50KG5vZGUpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9