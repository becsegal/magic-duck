import { assert, assign, isPresent } from '@glimmer/util';
import Printer from '../generation/printer';
import { preprocess } from '../parser/tokenizer-event-handlers';
import { SourceSlice } from '../source/slice';
import { SpanList } from '../source/span-list';
import { SymbolTable } from '../symbol-table';
import { generateSyntaxError } from '../syntax-error';
import { isLowerCase, isUpperCase } from '../utils';
import b from '../v1/parser-builders';
import * as ASTv2 from './api';
import { Builder } from './builders';
import { AppendSyntaxContext, AttrValueSyntaxContext, BlockSyntaxContext, ComponentSyntaxContext, ModifierSyntaxContext, SexpSyntaxContext } from './loose-resolution';
export function normalize(source, options = {}) {
  var _a;

  let ast = preprocess(source, options);
  let normalizeOptions = assign({
    strictMode: false,
    locals: []
  }, options);
  let top = SymbolTable.top(normalizeOptions.locals, (_a = // eslint-disable-next-line @typescript-eslint/unbound-method
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

export class BlockContext {
  constructor(source, options, table) {
    this.source = source;
    this.options = options;
    this.table = table;
    this.builder = new Builder();
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
          let resolution = this.block.resolutionFor(expr, SexpSyntaxContext);

          if (resolution.resolution === 'error') {
            throw generateSyntaxError(`You attempted to invoke a path (\`${resolution.path}\`) but ${resolution.head} was not in scope`, expr.loc);
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
      tail.push(new SourceSlice({
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
    let paramLoc = SpanList.range(paramList, callee.loc.collapse('end'));
    let namedLoc = this.block.loc(hash.loc);
    let argsLoc = SpanList.range([paramLoc, namedLoc]);
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
    return this.block.builder.namedArgument(new SourceSlice({
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
    }, AppendSyntaxContext(mustache));
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
    let resolution = this.block.resolutionFor(block, BlockSyntaxContext);

    if (resolution.resolution === 'error') {
      throw generateSyntaxError(`You attempted to invoke a path (\`{{#${resolution.path}}}\`) but ${resolution.head} was not in scope`, loc);
    }

    let callParts = this.expr.callParts(block, resolution.resolution);
    return this.block.builder.blockStatement(assign({
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
    let resolution = this.ctx.resolutionFor(m, ModifierSyntaxContext);

    if (resolution.resolution === 'error') {
      throw generateSyntaxError(`You attempted to invoke a path (\`{{#${resolution.path}}}\`) as a modifier, but ${resolution.head} was not in scope. Try adding \`this\` to the beginning of the path`, m.loc);
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
    let sexp = this.ctx.builder.sexp(this.expr.callParts(mustache, AttrValueSyntaxContext(mustache)), this.ctx.loc(mustache.loc)); // If there are no params or hash, just return the function part as its own expression

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
    (false && assert(m.name[0] !== '@', 'An attr name must not start with `@`'));

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
    (false && assert(arg.name[0] === '@', 'An arg name must start with `@`'));
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
    let uppercase = isUpperCase(variable);
    let inScope = variable[0] === '@' || variable === 'this' || this.ctx.hasBinding(variable);

    if (this.ctx.strict && !inScope) {
      if (uppercase) {
        throw generateSyntaxError(`Attempted to invoke a component that was not in scope in a strict mode template, \`<${variable}>\`. If you wanted to create an element with that name, convert it to lowercase - \`<${variable.toLowerCase()}>\``, loc);
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
      let path = b.path({
        head: b.head(variable, variableLoc),
        tail,
        loc: pathLoc
      });
      let resolution = this.ctx.resolutionFor(path, ComponentSyntaxContext);

      if (resolution.resolution === 'error') {
        throw generateSyntaxError(`You attempted to invoke a path (\`<${resolution.path}>\`) but ${resolution.head} was not in scope`, loc);
      }

      return new ExpressionNormalizer(this.ctx).normalize(path, resolution.resolution);
    } // If the tag name wasn't a valid component but contained a `.`, it's
    // a syntax error.


    if (tail.length > 0) {
      throw generateSyntaxError(`You used ${variable}.${tail.join('.')} as a tag name, but ${variable} is not in scope`, loc);
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
    if (isPresent(this.namedBlocks)) {
      throw generateSyntaxError(`Unexpected named block at the top-level of a template`, this.loc);
    }

    return this.block.builder.template(table, this.nonBlockChildren, this.block.loc(this.loc));
  }

}

class BlockChildren extends Children {
  assertBlock(table) {
    if (isPresent(this.namedBlocks)) {
      throw generateSyntaxError(`Unexpected named block nested in a normal block`, this.loc);
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
      throw generateSyntaxError(`<:${name.chars}/> is not a valid named block: named blocks cannot be self-closing`, this.loc);
    }

    if (isPresent(this.namedBlocks)) {
      throw generateSyntaxError(`Unexpected named block inside <:${name.chars}> named block: named blocks cannot contain nested named blocks`, this.loc);
    }

    if (!isLowerCase(name.chars)) {
      throw generateSyntaxError(`<:${name.chars}> is not a valid named block, and named blocks must begin with a lowercase letter`, this.loc);
    }

    if (this.el.base.attrs.length > 0 || this.el.base.componentArgs.length > 0 || this.el.base.modifiers.length > 0) {
      throw generateSyntaxError(`named block <:${name.chars}> cannot have attributes, arguments, or modifiers`, this.loc);
    }

    let offsets = SpanList.range(this.nonBlockChildren, this.loc);
    return this.block.builder.namedBlock(name, this.block.builder.block(table, this.nonBlockChildren, offsets), this.loc);
  }

  assertElement(name, hasBlockParams) {
    if (hasBlockParams) {
      throw generateSyntaxError(`Unexpected block params in <${name}>: simple elements cannot have block params`, this.loc);
    }

    if (isPresent(this.namedBlocks)) {
      let names = this.namedBlocks.map(b => b.name);

      if (names.length === 1) {
        throw generateSyntaxError(`Unexpected named block <:foo> inside <${name.chars}> HTML element`, this.loc);
      } else {
        let printedNames = names.map(n => `<:${n.chars}>`).join(', ');
        throw generateSyntaxError(`Unexpected named blocks inside <${name.chars}> HTML element (${printedNames})`, this.loc);
      }
    }

    return this.el.simple(name, this.nonBlockChildren, this.loc);
  }

  assertComponent(name, table, hasBlockParams) {
    if (isPresent(this.namedBlocks) && this.hasSemanticContent) {
      throw generateSyntaxError(`Unexpected content inside <${name}> component invocation: when using named blocks, the tag cannot contain other content`, this.loc);
    }

    if (isPresent(this.namedBlocks)) {
      if (hasBlockParams) {
        throw generateSyntaxError(`Unexpected block params list on <${name}> component invocation: when passing named blocks, the invocation tag cannot take block params`, this.loc);
      }

      let seenNames = new Set();

      for (let block of this.namedBlocks) {
        let name = block.name.chars;

        if (seenNames.has(name)) {
          throw generateSyntaxError(`Component had two named blocks with the same name, \`<:${name}>\`. Only one block with a given name may be passed`, this.loc);
        }

        if (name === 'inverse' && seenNames.has('else') || name === 'else' && seenNames.has('inverse')) {
          throw generateSyntaxError(`Component has both <:else> and <:inverse> block. <:inverse> is an alias for <:else>`, this.loc);
        }

        seenNames.add(name);
      }

      return this.namedBlocks;
    } else {
      return [this.block.builder.namedBlock(SourceSlice.synthetic('default'), this.block.builder.block(table, this.nonBlockChildren, this.loc), this.loc)];
    }
  }

}

function printPath(node) {
  if (node.type !== 'PathExpression' && node.path.type === 'PathExpression') {
    return printPath(node.path);
  } else {
    return new Printer({
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
    return new Printer({
      entityEncoding: 'raw'
    }).print(node);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9ub3JtYWxpemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsU0FBUyxNQUFULEVBQWlCLE1BQWpCLEVBQXlCLFNBQXpCLFFBQTBDLGVBQTFDO0FBRUEsT0FBTyxPQUFQLE1BQW9CLHVCQUFwQjtBQUNBLFNBQTRCLFVBQTVCLFFBQThDLG9DQUE5QztBQUVBLFNBQVMsV0FBVCxRQUE0QixpQkFBNUI7QUFHQSxTQUFTLFFBQVQsUUFBeUIscUJBQXpCO0FBQ0EsU0FBK0MsV0FBL0MsUUFBa0UsaUJBQWxFO0FBQ0EsU0FBUyxtQkFBVCxRQUFvQyxpQkFBcEM7QUFDQSxTQUFTLFdBQVQsRUFBc0IsV0FBdEIsUUFBeUMsVUFBekM7QUFFQSxPQUFPLENBQVAsTUFBYyx1QkFBZDtBQUNBLE9BQU8sS0FBSyxLQUFaLE1BQXVCLE9BQXZCO0FBQ0EsU0FBdUIsT0FBdkIsUUFBaUQsWUFBakQ7QUFDQSxTQUNFLG1CQURGLEVBRUUsc0JBRkYsRUFHRSxrQkFIRixFQUlFLHNCQUpGLEVBS0UscUJBTEYsRUFPRSxpQkFQRixRQVFPLG9CQVJQO0FBVUEsT0FBTSxTQUFVLFNBQVYsQ0FDSixNQURJLEVBRUosT0FBQSxHQUE2QixFQUZ6QixFQUUyQjs7O0FBRS9CLE1BQUksR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFELEVBQVMsT0FBVCxDQUFwQjtBQUVBLE1BQUksZ0JBQWdCLEdBQUcsTUFBTSxDQUMzQjtBQUNFLElBQUEsVUFBVSxFQUFFLEtBRGQ7QUFFRSxJQUFBLE1BQU0sRUFBRTtBQUZWLEdBRDJCLEVBSzNCLE9BTDJCLENBQTdCO0FBUUEsTUFBSSxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQVosQ0FDUixnQkFBZ0IsQ0FBQyxNQURULEVBQ2UsQ0FBQSxFQUFBLEdBQ3ZCO0FBQ0EsRUFBQSxPQUFPLENBQUMsc0JBRmUsTUFFTyxJQUZQLElBRU8sRUFBQSxLQUFBLEtBQUEsQ0FG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QVMsU0FBVCxDQUFtQixJQUFuQixFQUE4RDtBQUM1RCxNQUFJLElBQUksQ0FBQyxJQUFMLEtBQWMsZ0JBQWxCLEVBQW9DO0FBQ2xDLFlBQVEsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFsQjtBQUNFLFdBQUssUUFBTDtBQUNBLFdBQUssU0FBTDtBQUNFLGVBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFqQjs7QUFDRixXQUFLLFVBQUw7QUFDRSxlQUFPLE1BQVA7QUFMSjtBQU9ELEdBUkQsTUFRTyxJQUFJLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVixLQUFtQixnQkFBdkIsRUFBeUM7QUFDOUMsV0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQU4sQ0FBaEI7QUFDRCxHQUZNLE1BRUE7QUFDTCxXQUFPLElBQUksT0FBSixDQUFZO0FBQUUsTUFBQSxjQUFjLEVBQUU7QUFBbEIsS0FBWixFQUF1QyxLQUF2QyxDQUE2QyxJQUE3QyxDQUFQO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByZXNlbnRBcnJheSB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYXNzZXJ0LCBhc3NpZ24sIGlzUHJlc2VudCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuXG5pbXBvcnQgUHJpbnRlciBmcm9tICcuLi9nZW5lcmF0aW9uL3ByaW50ZXInO1xuaW1wb3J0IHsgUHJlY29tcGlsZU9wdGlvbnMsIHByZXByb2Nlc3MgfSBmcm9tICcuLi9wYXJzZXIvdG9rZW5pemVyLWV2ZW50LWhhbmRsZXJzJztcbmltcG9ydCB7IFNvdXJjZUxvY2F0aW9uIH0gZnJvbSAnLi4vc291cmNlL2xvY2F0aW9uJztcbmltcG9ydCB7IFNvdXJjZVNsaWNlIH0gZnJvbSAnLi4vc291cmNlL3NsaWNlJztcbmltcG9ydCB7IFNvdXJjZSB9IGZyb20gJy4uL3NvdXJjZS9zb3VyY2UnO1xuaW1wb3J0IHsgU291cmNlU3BhbiB9IGZyb20gJy4uL3NvdXJjZS9zcGFuJztcbmltcG9ydCB7IFNwYW5MaXN0IH0gZnJvbSAnLi4vc291cmNlL3NwYW4tbGlzdCc7XG5pbXBvcnQgeyBCbG9ja1N5bWJvbFRhYmxlLCBQcm9ncmFtU3ltYm9sVGFibGUsIFN5bWJvbFRhYmxlIH0gZnJvbSAnLi4vc3ltYm9sLXRhYmxlJztcbmltcG9ydCB7IGdlbmVyYXRlU3ludGF4RXJyb3IgfSBmcm9tICcuLi9zeW50YXgtZXJyb3InO1xuaW1wb3J0IHsgaXNMb3dlckNhc2UsIGlzVXBwZXJDYXNlIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0ICogYXMgQVNUdjEgZnJvbSAnLi4vdjEvYXBpJztcbmltcG9ydCBiIGZyb20gJy4uL3YxL3BhcnNlci1idWlsZGVycyc7XG5pbXBvcnQgKiBhcyBBU1R2MiBmcm9tICcuL2FwaSc7XG5pbXBvcnQgeyBCdWlsZEVsZW1lbnQsIEJ1aWxkZXIsIENhbGxQYXJ0cyB9IGZyb20gJy4vYnVpbGRlcnMnO1xuaW1wb3J0IHtcbiAgQXBwZW5kU3ludGF4Q29udGV4dCxcbiAgQXR0clZhbHVlU3ludGF4Q29udGV4dCxcbiAgQmxvY2tTeW50YXhDb250ZXh0LFxuICBDb21wb25lbnRTeW50YXhDb250ZXh0LFxuICBNb2RpZmllclN5bnRheENvbnRleHQsXG4gIFJlc29sdXRpb24sXG4gIFNleHBTeW50YXhDb250ZXh0LFxufSBmcm9tICcuL2xvb3NlLXJlc29sdXRpb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKFxuICBzb3VyY2U6IFNvdXJjZSxcbiAgb3B0aW9uczogUHJlY29tcGlsZU9wdGlvbnMgPSB7fVxuKTogW2FzdDogQVNUdjIuVGVtcGxhdGUsIGxvY2Fsczogc3RyaW5nW11dIHtcbiAgbGV0IGFzdCA9IHByZXByb2Nlc3Moc291cmNlLCBvcHRpb25zKTtcblxuICBsZXQgbm9ybWFsaXplT3B0aW9ucyA9IGFzc2lnbihcbiAgICB7XG4gICAgICBzdHJpY3RNb2RlOiBmYWxzZSxcbiAgICAgIGxvY2FsczogW10sXG4gICAgfSxcbiAgICBvcHRpb25zXG4gICk7XG5cbiAgbGV0IHRvcCA9IFN5bWJvbFRhYmxlLnRvcChcbiAgICBub3JtYWxpemVPcHRpb25zLmxvY2FscyxcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3VuYm91bmQtbWV0aG9kXG4gICAgb3B0aW9ucy5jdXN0b21pemVDb21wb25lbnROYW1lID8/ICgobmFtZSkgPT4gbmFtZSlcbiAgKTtcbiAgbGV0IGJsb2NrID0gbmV3IEJsb2NrQ29udGV4dChzb3VyY2UsIG5vcm1hbGl6ZU9wdGlvbnMsIHRvcCk7XG4gIGxldCBub3JtYWxpemVyID0gbmV3IFN0YXRlbWVudE5vcm1hbGl6ZXIoYmxvY2spO1xuXG4gIGxldCBhc3RWMiA9IG5ldyBUZW1wbGF0ZUNoaWxkcmVuKFxuICAgIGJsb2NrLmxvYyhhc3QubG9jKSxcbiAgICBhc3QuYm9keS5tYXAoKGIpID0+IG5vcm1hbGl6ZXIubm9ybWFsaXplKGIpKSxcbiAgICBibG9ja1xuICApLmFzc2VydFRlbXBsYXRlKHRvcCk7XG5cbiAgbGV0IGxvY2FscyA9IHRvcC5nZXRVc2VkVGVtcGxhdGVMb2NhbHMoKTtcblxuICByZXR1cm4gW2FzdFYyLCBsb2NhbHNdO1xufVxuXG4vKipcbiAqIEEgYEJsb2NrQ29udGV4dGAgcmVwcmVzZW50cyB0aGUgYmxvY2sgdGhhdCBhIHBhcnRpY3VsYXIgQVNUIG5vZGUgaXMgY29udGFpbmVkIGluc2lkZSBvZi5cbiAqXG4gKiBgQmxvY2tDb250ZXh0YCBpcyBhd2FyZSBvZiB0ZW1wbGF0ZS13aWRlIG9wdGlvbnMgKHN1Y2ggYXMgc3RyaWN0IG1vZGUpLCBhcyB3ZWxsIGFzIHRoZSBiaW5kaW5nc1xuICogdGhhdCBhcmUgaW4tc2NvcGUgd2l0aGluIHRoYXQgYmxvY2suXG4gKlxuICogQ29uY3JldGVseSwgaXQgaGFzIHRoZSBgUHJlY29tcGlsZU9wdGlvbnNgIGFuZCBjdXJyZW50IGBTeW1ib2xUYWJsZWAsIGFuZCBwcm92aWRlc1xuICogZmFjaWxpdGllcyBmb3Igd29ya2luZyB3aXRoIHRob3NlIG9wdGlvbnMuXG4gKlxuICogYEJsb2NrQ29udGV4dGAgaXMgc3RhdGVsZXNzLlxuICovXG5leHBvcnQgY2xhc3MgQmxvY2tDb250ZXh0PFRhYmxlIGV4dGVuZHMgU3ltYm9sVGFibGUgPSBTeW1ib2xUYWJsZT4ge1xuICByZWFkb25seSBidWlsZGVyOiBCdWlsZGVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IHNvdXJjZTogU291cmNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9uczogUHJlY29tcGlsZU9wdGlvbnMsXG4gICAgcmVhZG9ubHkgdGFibGU6IFRhYmxlXG4gICkge1xuICAgIHRoaXMuYnVpbGRlciA9IG5ldyBCdWlsZGVyKCk7XG4gIH1cblxuICBnZXQgc3RyaWN0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuc3RyaWN0TW9kZSB8fCBmYWxzZTtcbiAgfVxuXG4gIGxvYyhsb2M6IFNvdXJjZUxvY2F0aW9uKTogU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlLnNwYW5Gb3IobG9jKTtcbiAgfVxuXG4gIHJlc29sdXRpb25Gb3I8TiBleHRlbmRzIEFTVHYxLkNhbGxOb2RlIHwgQVNUdjEuUGF0aEV4cHJlc3Npb24+KFxuICAgIG5vZGU6IE4sXG4gICAgcmVzb2x1dGlvbjogUmVzb2x1dGlvbjxOPlxuICApOiB7IHJlc29sdXRpb246IEFTVHYyLkZyZWVWYXJSZXNvbHV0aW9uIH0gfCB7IHJlc29sdXRpb246ICdlcnJvcic7IHBhdGg6IHN0cmluZzsgaGVhZDogc3RyaW5nIH0ge1xuICAgIGlmICh0aGlzLnN0cmljdCkge1xuICAgICAgcmV0dXJuIHsgcmVzb2x1dGlvbjogQVNUdjIuU1RSSUNUX1JFU09MVVRJT04gfTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0ZyZWVWYXIobm9kZSkpIHtcbiAgICAgIGxldCByID0gcmVzb2x1dGlvbihub2RlKTtcblxuICAgICAgaWYgKHIgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXNvbHV0aW9uOiAnZXJyb3InLFxuICAgICAgICAgIHBhdGg6IHByaW50UGF0aChub2RlKSxcbiAgICAgICAgICBoZWFkOiBwcmludEhlYWQobm9kZSksXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7IHJlc29sdXRpb246IHIgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHsgcmVzb2x1dGlvbjogQVNUdjIuU1RSSUNUX1JFU09MVVRJT04gfTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGlzRnJlZVZhcihjYWxsZWU6IEFTVHYxLkNhbGxOb2RlIHwgQVNUdjEuUGF0aEV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICBpZiAoY2FsbGVlLnR5cGUgPT09ICdQYXRoRXhwcmVzc2lvbicpIHtcbiAgICAgIGlmIChjYWxsZWUuaGVhZC50eXBlICE9PSAnVmFySGVhZCcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gIXRoaXMudGFibGUuaGFzKGNhbGxlZS5oZWFkLm5hbWUpO1xuICAgIH0gZWxzZSBpZiAoY2FsbGVlLnBhdGgudHlwZSA9PT0gJ1BhdGhFeHByZXNzaW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMuaXNGcmVlVmFyKGNhbGxlZS5wYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGhhc0JpbmRpbmcobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudGFibGUuaGFzKG5hbWUpO1xuICB9XG5cbiAgY2hpbGQoYmxvY2tQYXJhbXM6IHN0cmluZ1tdKTogQmxvY2tDb250ZXh0PEJsb2NrU3ltYm9sVGFibGU+IHtcbiAgICByZXR1cm4gbmV3IEJsb2NrQ29udGV4dCh0aGlzLnNvdXJjZSwgdGhpcy5vcHRpb25zLCB0aGlzLnRhYmxlLmNoaWxkKGJsb2NrUGFyYW1zKSk7XG4gIH1cblxuICBjdXN0b21pemVDb21wb25lbnROYW1lKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuY3VzdG9taXplQ29tcG9uZW50TmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5jdXN0b21pemVDb21wb25lbnROYW1lKGlucHV0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGlucHV0O1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFuIGBFeHByZXNzaW9uTm9ybWFsaXplcmAgbm9ybWFsaXplcyBleHByZXNzaW9ucyB3aXRoaW4gYSBibG9jay5cbiAqXG4gKiBgRXhwcmVzc2lvbk5vcm1hbGl6ZXJgIGlzIHN0YXRlbGVzcy5cbiAqL1xuY2xhc3MgRXhwcmVzc2lvbk5vcm1hbGl6ZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGJsb2NrOiBCbG9ja0NvbnRleHQpIHt9XG5cbiAgLyoqXG4gICAqIFRoZSBgbm9ybWFsaXplYCBtZXRob2QgdGFrZXMgYW4gYXJiaXRyYXJ5IGV4cHJlc3Npb24gYW5kIGl0cyBvcmlnaW5hbCBzeW50YXggY29udGV4dCBhbmRcbiAgICogbm9ybWFsaXplcyBpdCB0byBhbiBBU1R2MiBleHByZXNzaW9uLlxuICAgKlxuICAgKiBAc2VlIHtTeW50YXhDb250ZXh0fVxuICAgKi9cbiAgbm9ybWFsaXplKGV4cHI6IEFTVHYxLkxpdGVyYWwsIHJlc29sdXRpb246IEFTVHYyLkZyZWVWYXJSZXNvbHV0aW9uKTogQVNUdjIuTGl0ZXJhbEV4cHJlc3Npb247XG4gIG5vcm1hbGl6ZShcbiAgICBleHByOiBBU1R2MS5NaW5pbWFsUGF0aEV4cHJlc3Npb24sXG4gICAgcmVzb2x1dGlvbjogQVNUdjIuRnJlZVZhclJlc29sdXRpb25cbiAgKTogQVNUdjIuUGF0aEV4cHJlc3Npb247XG4gIG5vcm1hbGl6ZShleHByOiBBU1R2MS5TdWJFeHByZXNzaW9uLCByZXNvbHV0aW9uOiBBU1R2Mi5GcmVlVmFyUmVzb2x1dGlvbik6IEFTVHYyLkNhbGxFeHByZXNzaW9uO1xuICBub3JtYWxpemUoZXhwcjogQVNUdjEuRXhwcmVzc2lvbiwgcmVzb2x1dGlvbjogQVNUdjIuRnJlZVZhclJlc29sdXRpb24pOiBBU1R2Mi5FeHByZXNzaW9uTm9kZTtcbiAgbm9ybWFsaXplKFxuICAgIGV4cHI6IEFTVHYxLkV4cHJlc3Npb24gfCBBU1R2MS5NaW5pbWFsUGF0aEV4cHJlc3Npb24sXG4gICAgcmVzb2x1dGlvbjogQVNUdjIuRnJlZVZhclJlc29sdXRpb25cbiAgKTogQVNUdjIuRXhwcmVzc2lvbk5vZGUge1xuICAgIHN3aXRjaCAoZXhwci50eXBlKSB7XG4gICAgICBjYXNlICdOdWxsTGl0ZXJhbCc6XG4gICAgICBjYXNlICdCb29sZWFuTGl0ZXJhbCc6XG4gICAgICBjYXNlICdOdW1iZXJMaXRlcmFsJzpcbiAgICAgIGNhc2UgJ1N0cmluZ0xpdGVyYWwnOlxuICAgICAgY2FzZSAnVW5kZWZpbmVkTGl0ZXJhbCc6XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrLmJ1aWxkZXIubGl0ZXJhbChleHByLnZhbHVlLCB0aGlzLmJsb2NrLmxvYyhleHByLmxvYykpO1xuICAgICAgY2FzZSAnUGF0aEV4cHJlc3Npb24nOlxuICAgICAgICByZXR1cm4gdGhpcy5wYXRoKGV4cHIsIHJlc29sdXRpb24pO1xuICAgICAgY2FzZSAnU3ViRXhwcmVzc2lvbic6IHtcbiAgICAgICAgbGV0IHJlc29sdXRpb24gPSB0aGlzLmJsb2NrLnJlc29sdXRpb25Gb3IoZXhwciwgU2V4cFN5bnRheENvbnRleHQpO1xuXG4gICAgICAgIGlmIChyZXNvbHV0aW9uLnJlc29sdXRpb24gPT09ICdlcnJvcicpIHtcbiAgICAgICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKFxuICAgICAgICAgICAgYFlvdSBhdHRlbXB0ZWQgdG8gaW52b2tlIGEgcGF0aCAoXFxgJHtyZXNvbHV0aW9uLnBhdGh9XFxgKSBidXQgJHtyZXNvbHV0aW9uLmhlYWR9IHdhcyBub3QgaW4gc2NvcGVgLFxuICAgICAgICAgICAgZXhwci5sb2NcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2suYnVpbGRlci5zZXhwKFxuICAgICAgICAgIHRoaXMuY2FsbFBhcnRzKGV4cHIsIHJlc29sdXRpb24ucmVzb2x1dGlvbiksXG4gICAgICAgICAgdGhpcy5ibG9jay5sb2MoZXhwci5sb2MpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwYXRoKFxuICAgIGV4cHI6IEFTVHYxLk1pbmltYWxQYXRoRXhwcmVzc2lvbixcbiAgICByZXNvbHV0aW9uOiBBU1R2Mi5GcmVlVmFyUmVzb2x1dGlvblxuICApOiBBU1R2Mi5QYXRoRXhwcmVzc2lvbiB7XG4gICAgbGV0IGhlYWRPZmZzZXRzID0gdGhpcy5ibG9jay5sb2MoZXhwci5oZWFkLmxvYyk7XG5cbiAgICBsZXQgdGFpbCA9IFtdO1xuXG4gICAgLy8gc3RhcnQgd2l0aCB0aGUgaGVhZFxuICAgIGxldCBvZmZzZXQgPSBoZWFkT2Zmc2V0cztcblxuICAgIGZvciAobGV0IHBhcnQgb2YgZXhwci50YWlsKSB7XG4gICAgICBvZmZzZXQgPSBvZmZzZXQuc2xpY2VTdGFydENoYXJzKHsgY2hhcnM6IHBhcnQubGVuZ3RoLCBza2lwU3RhcnQ6IDEgfSk7XG4gICAgICB0YWlsLnB1c2goXG4gICAgICAgIG5ldyBTb3VyY2VTbGljZSh7XG4gICAgICAgICAgbG9jOiBvZmZzZXQsXG4gICAgICAgICAgY2hhcnM6IHBhcnQsXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmJsb2NrLmJ1aWxkZXIucGF0aCh0aGlzLnJlZihleHByLmhlYWQsIHJlc29sdXRpb24pLCB0YWlsLCB0aGlzLmJsb2NrLmxvYyhleHByLmxvYykpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBgY2FsbFBhcnRzYCBtZXRob2QgdGFrZXMgQVNUdjEuQ2FsbFBhcnRzIGFzIHdlbGwgYXMgYSBzeW50YXggY29udGV4dCBhbmQgbm9ybWFsaXplc1xuICAgKiBpdCB0byBhbiBBU1R2MiBDYWxsUGFydHMuXG4gICAqL1xuICBjYWxsUGFydHMocGFydHM6IEFTVHYxLkNhbGxQYXJ0cywgY29udGV4dDogQVNUdjIuRnJlZVZhclJlc29sdXRpb24pOiBDYWxsUGFydHMge1xuICAgIGxldCB7IHBhdGgsIHBhcmFtcywgaGFzaCB9ID0gcGFydHM7XG5cbiAgICBsZXQgY2FsbGVlID0gdGhpcy5ub3JtYWxpemUocGF0aCwgY29udGV4dCk7XG4gICAgbGV0IHBhcmFtTGlzdCA9IHBhcmFtcy5tYXAoKHApID0+IHRoaXMubm9ybWFsaXplKHAsIEFTVHYyLkFSR1VNRU5UX1JFU09MVVRJT04pKTtcbiAgICBsZXQgcGFyYW1Mb2MgPSBTcGFuTGlzdC5yYW5nZShwYXJhbUxpc3QsIGNhbGxlZS5sb2MuY29sbGFwc2UoJ2VuZCcpKTtcbiAgICBsZXQgbmFtZWRMb2MgPSB0aGlzLmJsb2NrLmxvYyhoYXNoLmxvYyk7XG4gICAgbGV0IGFyZ3NMb2MgPSBTcGFuTGlzdC5yYW5nZShbcGFyYW1Mb2MsIG5hbWVkTG9jXSk7XG5cbiAgICBsZXQgcG9zaXRpb25hbCA9IHRoaXMuYmxvY2suYnVpbGRlci5wb3NpdGlvbmFsKFxuICAgICAgcGFyYW1zLm1hcCgocCkgPT4gdGhpcy5ub3JtYWxpemUocCwgQVNUdjIuQVJHVU1FTlRfUkVTT0xVVElPTikpLFxuICAgICAgcGFyYW1Mb2NcbiAgICApO1xuXG4gICAgbGV0IG5hbWVkID0gdGhpcy5ibG9jay5idWlsZGVyLm5hbWVkKFxuICAgICAgaGFzaC5wYWlycy5tYXAoKHApID0+IHRoaXMubmFtZWRBcmd1bWVudChwKSksXG4gICAgICB0aGlzLmJsb2NrLmxvYyhoYXNoLmxvYylcbiAgICApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNhbGxlZSxcbiAgICAgIGFyZ3M6IHRoaXMuYmxvY2suYnVpbGRlci5hcmdzKHBvc2l0aW9uYWwsIG5hbWVkLCBhcmdzTG9jKSxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBuYW1lZEFyZ3VtZW50KHBhaXI6IEFTVHYxLkhhc2hQYWlyKTogQVNUdjIuTmFtZWRBcmd1bWVudCB7XG4gICAgbGV0IG9mZnNldHMgPSB0aGlzLmJsb2NrLmxvYyhwYWlyLmxvYyk7XG5cbiAgICBsZXQga2V5T2Zmc2V0cyA9IG9mZnNldHMuc2xpY2VTdGFydENoYXJzKHsgY2hhcnM6IHBhaXIua2V5Lmxlbmd0aCB9KTtcblxuICAgIHJldHVybiB0aGlzLmJsb2NrLmJ1aWxkZXIubmFtZWRBcmd1bWVudChcbiAgICAgIG5ldyBTb3VyY2VTbGljZSh7IGNoYXJzOiBwYWlyLmtleSwgbG9jOiBrZXlPZmZzZXRzIH0pLFxuICAgICAgdGhpcy5ub3JtYWxpemUocGFpci52YWx1ZSwgQVNUdjIuQVJHVU1FTlRfUkVTT0xVVElPTilcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBgcmVmYCBtZXRob2Qgbm9ybWFsaXplcyBhbiBgQVNUdjEuUGF0aEhlYWRgIGludG8gYW4gYEFTVHYyLlZhcmlhYmxlUmVmZXJlbmNlYC5cbiAgICogVGhpcyBtZXRob2QgaXMgZXh0cmVtZWx5IGltcG9ydGFudCwgYmVjYXVzZSBpdCBpcyByZXNwb25zaWJsZSBmb3Igbm9ybWFsaXppbmcgZnJlZVxuICAgKiB2YXJpYWJsZXMgaW50byBhbiBhbiBBU1R2Mi5QYXRoSGVhZCAqd2l0aCBhcHByb3ByaWF0ZSBjb250ZXh0Ki5cbiAgICpcbiAgICogVGhlIHN5bnRheCBjb250ZXh0IGlzIG9yaWdpbmFsbHkgZGV0ZXJtaW5lZCBieSB0aGUgc3ludGFjdGljIHBvc2l0aW9uIHRoYXQgdGhpcyBgUGF0aEhlYWRgXG4gICAqIGNhbWUgZnJvbSwgYW5kIGlzIHVsdGltYXRlbHkgYXR0YWNoZWQgdG8gdGhlIGBBU1R2Mi5WYXJpYWJsZVJlZmVyZW5jZWAgaGVyZS4gSW4gQVNUdjIsXG4gICAqIHRoZSBgVmFyaWFibGVSZWZlcmVuY2VgIG5vZGUgYmVhcnMgZnVsbCByZXNwb25zaWJpbGl0eSBmb3IgbG9vc2UgbW9kZSBydWxlcyB0aGF0IGNvbnRyb2xcbiAgICogdGhlIGJlaGF2aW9yIG9mIGZyZWUgdmFyaWFibGVzLlxuICAgKi9cbiAgcHJpdmF0ZSByZWYoaGVhZDogQVNUdjEuUGF0aEhlYWQsIHJlc29sdXRpb246IEFTVHYyLkZyZWVWYXJSZXNvbHV0aW9uKTogQVNUdjIuVmFyaWFibGVSZWZlcmVuY2Uge1xuICAgIGxldCB7IGJsb2NrIH0gPSB0aGlzO1xuICAgIGxldCB7IGJ1aWxkZXIsIHRhYmxlIH0gPSBibG9jaztcbiAgICBsZXQgb2Zmc2V0cyA9IGJsb2NrLmxvYyhoZWFkLmxvYyk7XG5cbiAgICBzd2l0Y2ggKGhlYWQudHlwZSkge1xuICAgICAgY2FzZSAnVGhpc0hlYWQnOlxuICAgICAgICByZXR1cm4gYnVpbGRlci5zZWxmKG9mZnNldHMpO1xuICAgICAgY2FzZSAnQXRIZWFkJzoge1xuICAgICAgICBsZXQgc3ltYm9sID0gdGFibGUuYWxsb2NhdGVOYW1lZChoZWFkLm5hbWUpO1xuICAgICAgICByZXR1cm4gYnVpbGRlci5hdChoZWFkLm5hbWUsIHN5bWJvbCwgb2Zmc2V0cyk7XG4gICAgICB9XG4gICAgICBjYXNlICdWYXJIZWFkJzoge1xuICAgICAgICBpZiAoYmxvY2suaGFzQmluZGluZyhoZWFkLm5hbWUpKSB7XG4gICAgICAgICAgbGV0IFtzeW1ib2wsIGlzUm9vdF0gPSB0YWJsZS5nZXQoaGVhZC5uYW1lKTtcblxuICAgICAgICAgIHJldHVybiBibG9jay5idWlsZGVyLmxvY2FsVmFyKGhlYWQubmFtZSwgc3ltYm9sLCBpc1Jvb3QsIG9mZnNldHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBjb250ZXh0ID0gYmxvY2suc3RyaWN0ID8gQVNUdjIuU1RSSUNUX1JFU09MVVRJT04gOiByZXNvbHV0aW9uO1xuICAgICAgICAgIGxldCBzeW1ib2wgPSBibG9jay50YWJsZS5hbGxvY2F0ZUZyZWUoaGVhZC5uYW1lLCBjb250ZXh0KTtcblxuICAgICAgICAgIHJldHVybiBibG9jay5idWlsZGVyLmZyZWVWYXIoe1xuICAgICAgICAgICAgbmFtZTogaGVhZC5uYW1lLFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIHN5bWJvbCxcbiAgICAgICAgICAgIGxvYzogb2Zmc2V0cyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIGBUZW1wbGF0ZU5vcm1hbGl6ZXJgIG5vcm1hbGl6ZXMgdG9wLWxldmVsIEFTVHYxIHN0YXRlbWVudHMgdG8gQVNUdjIuXG4gKi9cbmNsYXNzIFN0YXRlbWVudE5vcm1hbGl6ZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGJsb2NrOiBCbG9ja0NvbnRleHQpIHt9XG5cbiAgbm9ybWFsaXplKG5vZGU6IEFTVHYxLlN0YXRlbWVudCk6IEFTVHYyLkNvbnRlbnROb2RlIHwgQVNUdjIuTmFtZWRCbG9jayB7XG4gICAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ1BhcnRpYWxTdGF0ZW1lbnQnOlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhhbmRsZWJhcnMgcGFydGlhbCBzeW50YXggKHt7PiAuLi59fSkgaXMgbm90IGFsbG93ZWQgaW4gR2xpbW1lcmApO1xuICAgICAgY2FzZSAnQmxvY2tTdGF0ZW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy5CbG9ja1N0YXRlbWVudChub2RlKTtcbiAgICAgIGNhc2UgJ0VsZW1lbnROb2RlJzpcbiAgICAgICAgcmV0dXJuIG5ldyBFbGVtZW50Tm9ybWFsaXplcih0aGlzLmJsb2NrKS5FbGVtZW50Tm9kZShub2RlKTtcbiAgICAgIGNhc2UgJ011c3RhY2hlU3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuTXVzdGFjaGVTdGF0ZW1lbnQobm9kZSk7XG5cbiAgICAgIC8vIFRoZXNlIGFyZSB0aGUgc2FtZSBpbiBBU1R2MlxuICAgICAgY2FzZSAnTXVzdGFjaGVDb21tZW50U3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuTXVzdGFjaGVDb21tZW50U3RhdGVtZW50KG5vZGUpO1xuXG4gICAgICBjYXNlICdDb21tZW50U3RhdGVtZW50Jzoge1xuICAgICAgICBsZXQgbG9jID0gdGhpcy5ibG9jay5sb2Mobm9kZS5sb2MpO1xuICAgICAgICByZXR1cm4gbmV3IEFTVHYyLkh0bWxDb21tZW50KHtcbiAgICAgICAgICBsb2MsXG4gICAgICAgICAgdGV4dDogbG9jLnNsaWNlKHsgc2tpcFN0YXJ0OiA0LCBza2lwRW5kOiAzIH0pLnRvU2xpY2Uobm9kZS52YWx1ZSksXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdUZXh0Tm9kZSc6XG4gICAgICAgIHJldHVybiBuZXcgQVNUdjIuSHRtbFRleHQoe1xuICAgICAgICAgIGxvYzogdGhpcy5ibG9jay5sb2Mobm9kZS5sb2MpLFxuICAgICAgICAgIGNoYXJzOiBub2RlLmNoYXJzLFxuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBNdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQobm9kZTogQVNUdjEuTXVzdGFjaGVDb21tZW50U3RhdGVtZW50KTogQVNUdjIuR2xpbW1lckNvbW1lbnQge1xuICAgIGxldCBsb2MgPSB0aGlzLmJsb2NrLmxvYyhub2RlLmxvYyk7XG4gICAgbGV0IHRleHRMb2M6IFNvdXJjZVNwYW47XG5cbiAgICBpZiAobG9jLmFzU3RyaW5nKCkuc2xpY2UoMCwgNSkgPT09ICd7eyEtLScpIHtcbiAgICAgIHRleHRMb2MgPSBsb2Muc2xpY2UoeyBza2lwU3RhcnQ6IDUsIHNraXBFbmQ6IDQgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRleHRMb2MgPSBsb2Muc2xpY2UoeyBza2lwU3RhcnQ6IDMsIHNraXBFbmQ6IDIgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBBU1R2Mi5HbGltbWVyQ29tbWVudCh7XG4gICAgICBsb2MsXG4gICAgICB0ZXh0OiB0ZXh0TG9jLnRvU2xpY2Uobm9kZS52YWx1ZSksXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyBhbiBBU1R2MS5NdXN0YWNoZVN0YXRlbWVudCB0byBhbiBBU1R2Mi5BcHBlbmRTdGF0ZW1lbnRcbiAgICovXG4gIE11c3RhY2hlU3RhdGVtZW50KG11c3RhY2hlOiBBU1R2MS5NdXN0YWNoZVN0YXRlbWVudCk6IEFTVHYyLkFwcGVuZENvbnRlbnQge1xuICAgIGxldCB7IGVzY2FwZWQgfSA9IG11c3RhY2hlO1xuICAgIGxldCBsb2MgPSB0aGlzLmJsb2NrLmxvYyhtdXN0YWNoZS5sb2MpO1xuXG4gICAgLy8gTm9ybWFsaXplIHRoZSBjYWxsIHBhcnRzIGluIEFwcGVuZFN5bnRheENvbnRleHRcbiAgICBsZXQgY2FsbFBhcnRzID0gdGhpcy5leHByLmNhbGxQYXJ0cyhcbiAgICAgIHtcbiAgICAgICAgcGF0aDogbXVzdGFjaGUucGF0aCxcbiAgICAgICAgcGFyYW1zOiBtdXN0YWNoZS5wYXJhbXMsXG4gICAgICAgIGhhc2g6IG11c3RhY2hlLmhhc2gsXG4gICAgICB9LFxuICAgICAgQXBwZW5kU3ludGF4Q29udGV4dChtdXN0YWNoZSlcbiAgICApO1xuXG4gICAgbGV0IHZhbHVlID0gY2FsbFBhcnRzLmFyZ3MuaXNFbXB0eSgpXG4gICAgICA/IGNhbGxQYXJ0cy5jYWxsZWVcbiAgICAgIDogdGhpcy5ibG9jay5idWlsZGVyLnNleHAoY2FsbFBhcnRzLCBsb2MpO1xuXG4gICAgcmV0dXJuIHRoaXMuYmxvY2suYnVpbGRlci5hcHBlbmQoXG4gICAgICB7XG4gICAgICAgIHRhYmxlOiB0aGlzLmJsb2NrLnRhYmxlLFxuICAgICAgICB0cnVzdGluZzogIWVzY2FwZWQsXG4gICAgICAgIHZhbHVlLFxuICAgICAgfSxcbiAgICAgIGxvY1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyBhIEFTVHYxLkJsb2NrU3RhdGVtZW50IHRvIGFuIEFTVHYyLkJsb2NrU3RhdGVtZW50XG4gICAqL1xuICBCbG9ja1N0YXRlbWVudChibG9jazogQVNUdjEuQmxvY2tTdGF0ZW1lbnQpOiBBU1R2Mi5JbnZva2VCbG9jayB7XG4gICAgbGV0IHsgcHJvZ3JhbSwgaW52ZXJzZSB9ID0gYmxvY2s7XG4gICAgbGV0IGxvYyA9IHRoaXMuYmxvY2subG9jKGJsb2NrLmxvYyk7XG5cbiAgICBsZXQgcmVzb2x1dGlvbiA9IHRoaXMuYmxvY2sucmVzb2x1dGlvbkZvcihibG9jaywgQmxvY2tTeW50YXhDb250ZXh0KTtcblxuICAgIGlmIChyZXNvbHV0aW9uLnJlc29sdXRpb24gPT09ICdlcnJvcicpIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgIGBZb3UgYXR0ZW1wdGVkIHRvIGludm9rZSBhIHBhdGggKFxcYHt7IyR7cmVzb2x1dGlvbi5wYXRofX19XFxgKSBidXQgJHtyZXNvbHV0aW9uLmhlYWR9IHdhcyBub3QgaW4gc2NvcGVgLFxuICAgICAgICBsb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IGNhbGxQYXJ0cyA9IHRoaXMuZXhwci5jYWxsUGFydHMoYmxvY2ssIHJlc29sdXRpb24ucmVzb2x1dGlvbik7XG5cbiAgICByZXR1cm4gdGhpcy5ibG9jay5idWlsZGVyLmJsb2NrU3RhdGVtZW50KFxuICAgICAgYXNzaWduKFxuICAgICAgICB7XG4gICAgICAgICAgc3ltYm9sczogdGhpcy5ibG9jay50YWJsZSxcbiAgICAgICAgICBwcm9ncmFtOiB0aGlzLkJsb2NrKHByb2dyYW0pLFxuICAgICAgICAgIGludmVyc2U6IGludmVyc2UgPyB0aGlzLkJsb2NrKGludmVyc2UpIDogbnVsbCxcbiAgICAgICAgfSxcbiAgICAgICAgY2FsbFBhcnRzXG4gICAgICApLFxuICAgICAgbG9jXG4gICAgKTtcbiAgfVxuXG4gIEJsb2NrKHsgYm9keSwgbG9jLCBibG9ja1BhcmFtcyB9OiBBU1R2MS5CbG9jayk6IEFTVHYyLkJsb2NrIHtcbiAgICBsZXQgY2hpbGQgPSB0aGlzLmJsb2NrLmNoaWxkKGJsb2NrUGFyYW1zKTtcbiAgICBsZXQgbm9ybWFsaXplciA9IG5ldyBTdGF0ZW1lbnROb3JtYWxpemVyKGNoaWxkKTtcbiAgICByZXR1cm4gbmV3IEJsb2NrQ2hpbGRyZW4oXG4gICAgICB0aGlzLmJsb2NrLmxvYyhsb2MpLFxuICAgICAgYm9keS5tYXAoKGIpID0+IG5vcm1hbGl6ZXIubm9ybWFsaXplKGIpKSxcbiAgICAgIHRoaXMuYmxvY2tcbiAgICApLmFzc2VydEJsb2NrKGNoaWxkLnRhYmxlKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGV4cHIoKTogRXhwcmVzc2lvbk5vcm1hbGl6ZXIge1xuICAgIHJldHVybiBuZXcgRXhwcmVzc2lvbk5vcm1hbGl6ZXIodGhpcy5ibG9jayk7XG4gIH1cbn1cblxuY2xhc3MgRWxlbWVudE5vcm1hbGl6ZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGN0eDogQmxvY2tDb250ZXh0KSB7fVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIGFuIEFTVHYxLkVsZW1lbnROb2RlIHRvOlxuICAgKlxuICAgKiAtIEFTVHYyLk5hbWVkQmxvY2sgaWYgdGhlIHRhZyBuYW1lIGJlZ2lucyB3aXRoIGA6YFxuICAgKiAtIEFTVHYyLkNvbXBvbmVudCBpZiB0aGUgdGFnIG5hbWUgbWF0Y2hlcyB0aGUgY29tcG9uZW50IGhldXJpc3RpY3NcbiAgICogLSBBU1R2Mi5TaW1wbGVFbGVtZW50IGlmIHRoZSB0YWcgbmFtZSBkb2Vzbid0IG1hdGNoIHRoZSBjb21wb25lbnQgaGV1cmlzdGljc1xuICAgKlxuICAgKiBBIHRhZyBuYW1lIHJlcHJlc2VudHMgYSBjb21wb25lbnQgaWY6XG4gICAqXG4gICAqIC0gaXQgYmVnaW5zIHdpdGggYEBgXG4gICAqIC0gaXQgaXMgZXhhY3RseSBgdGhpc2Agb3IgYmVnaW5zIHdpdGggYHRoaXMuYFxuICAgKiAtIHRoZSBwYXJ0IGJlZm9yZSB0aGUgZmlyc3QgYC5gIGlzIGEgcmVmZXJlbmNlIHRvIGFuIGluLXNjb3BlIHZhcmlhYmxlIGJpbmRpbmdcbiAgICogLSBpdCBiZWdpbnMgd2l0aCBhbiB1cHBlcmNhc2UgY2hhcmFjdGVyXG4gICAqL1xuICBFbGVtZW50Tm9kZShlbGVtZW50OiBBU1R2MS5FbGVtZW50Tm9kZSk6IEFTVHYyLkVsZW1lbnROb2RlIHtcbiAgICBsZXQgeyB0YWcsIHNlbGZDbG9zaW5nLCBjb21tZW50cyB9ID0gZWxlbWVudDtcbiAgICBsZXQgbG9jID0gdGhpcy5jdHgubG9jKGVsZW1lbnQubG9jKTtcblxuICAgIGxldCBbdGFnSGVhZCwgLi4ucmVzdF0gPSB0YWcuc3BsaXQoJy4nKTtcblxuICAgIC8vIHRoZSBoZWFkLCBhdHRyaWJ1dGVzIGFuZCBtb2RpZmllcnMgYXJlIGluIHRoZSBjdXJyZW50IHNjb3BlXG4gICAgbGV0IHBhdGggPSB0aGlzLmNsYXNzaWZ5VGFnKHRhZ0hlYWQsIHJlc3QsIGVsZW1lbnQubG9jKTtcblxuICAgIGxldCBhdHRycyA9IGVsZW1lbnQuYXR0cmlidXRlcy5maWx0ZXIoKGEpID0+IGEubmFtZVswXSAhPT0gJ0AnKS5tYXAoKGEpID0+IHRoaXMuYXR0cihhKSk7XG4gICAgbGV0IGFyZ3MgPSBlbGVtZW50LmF0dHJpYnV0ZXMuZmlsdGVyKChhKSA9PiBhLm5hbWVbMF0gPT09ICdAJykubWFwKChhKSA9PiB0aGlzLmFyZyhhKSk7XG5cbiAgICBsZXQgbW9kaWZpZXJzID0gZWxlbWVudC5tb2RpZmllcnMubWFwKChtKSA9PiB0aGlzLm1vZGlmaWVyKG0pKTtcblxuICAgIC8vIHRoZSBlbGVtZW50J3MgYmxvY2sgcGFyYW1zIGFyZSBpbiBzY29wZSBmb3IgdGhlIGNoaWxkcmVuXG4gICAgbGV0IGNoaWxkID0gdGhpcy5jdHguY2hpbGQoZWxlbWVudC5ibG9ja1BhcmFtcyk7XG4gICAgbGV0IG5vcm1hbGl6ZXIgPSBuZXcgU3RhdGVtZW50Tm9ybWFsaXplcihjaGlsZCk7XG5cbiAgICBsZXQgY2hpbGROb2RlcyA9IGVsZW1lbnQuY2hpbGRyZW4ubWFwKChzKSA9PiBub3JtYWxpemVyLm5vcm1hbGl6ZShzKSk7XG5cbiAgICBsZXQgZWwgPSB0aGlzLmN0eC5idWlsZGVyLmVsZW1lbnQoe1xuICAgICAgc2VsZkNsb3NpbmcsXG4gICAgICBhdHRycyxcbiAgICAgIGNvbXBvbmVudEFyZ3M6IGFyZ3MsXG4gICAgICBtb2RpZmllcnMsXG4gICAgICBjb21tZW50czogY29tbWVudHMubWFwKChjKSA9PiBuZXcgU3RhdGVtZW50Tm9ybWFsaXplcih0aGlzLmN0eCkuTXVzdGFjaGVDb21tZW50U3RhdGVtZW50KGMpKSxcbiAgICB9KTtcblxuICAgIGxldCBjaGlsZHJlbiA9IG5ldyBFbGVtZW50Q2hpbGRyZW4oZWwsIGxvYywgY2hpbGROb2RlcywgdGhpcy5jdHgpO1xuXG4gICAgbGV0IG9mZnNldHMgPSB0aGlzLmN0eC5sb2MoZWxlbWVudC5sb2MpO1xuICAgIGxldCB0YWdPZmZzZXRzID0gb2Zmc2V0cy5zbGljZVN0YXJ0Q2hhcnMoeyBjaGFyczogdGFnLmxlbmd0aCwgc2tpcFN0YXJ0OiAxIH0pO1xuXG4gICAgaWYgKHBhdGggPT09ICdFbGVtZW50SGVhZCcpIHtcbiAgICAgIGlmICh0YWdbMF0gPT09ICc6Jykge1xuICAgICAgICByZXR1cm4gY2hpbGRyZW4uYXNzZXJ0TmFtZWRCbG9jayhcbiAgICAgICAgICB0YWdPZmZzZXRzLnNsaWNlKHsgc2tpcFN0YXJ0OiAxIH0pLnRvU2xpY2UodGFnLnNsaWNlKDEpKSxcbiAgICAgICAgICBjaGlsZC50YWJsZVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkcmVuLmFzc2VydEVsZW1lbnQodGFnT2Zmc2V0cy50b1NsaWNlKHRhZyksIGVsZW1lbnQuYmxvY2tQYXJhbXMubGVuZ3RoID4gMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVsZW1lbnQuc2VsZkNsb3NpbmcpIHtcbiAgICAgIHJldHVybiBlbC5zZWxmQ2xvc2luZ0NvbXBvbmVudChwYXRoLCBsb2MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgYmxvY2tzID0gY2hpbGRyZW4uYXNzZXJ0Q29tcG9uZW50KHRhZywgY2hpbGQudGFibGUsIGVsZW1lbnQuYmxvY2tQYXJhbXMubGVuZ3RoID4gMCk7XG4gICAgICByZXR1cm4gZWwuY29tcG9uZW50V2l0aE5hbWVkQmxvY2tzKHBhdGgsIGJsb2NrcywgbG9jKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG1vZGlmaWVyKG06IEFTVHYxLkVsZW1lbnRNb2RpZmllclN0YXRlbWVudCk6IEFTVHYyLkVsZW1lbnRNb2RpZmllciB7XG4gICAgbGV0IHJlc29sdXRpb24gPSB0aGlzLmN0eC5yZXNvbHV0aW9uRm9yKG0sIE1vZGlmaWVyU3ludGF4Q29udGV4dCk7XG5cbiAgICBpZiAocmVzb2x1dGlvbi5yZXNvbHV0aW9uID09PSAnZXJyb3InKSB7XG4gICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKFxuICAgICAgICBgWW91IGF0dGVtcHRlZCB0byBpbnZva2UgYSBwYXRoIChcXGB7eyMke3Jlc29sdXRpb24ucGF0aH19fVxcYCkgYXMgYSBtb2RpZmllciwgYnV0ICR7cmVzb2x1dGlvbi5oZWFkfSB3YXMgbm90IGluIHNjb3BlLiBUcnkgYWRkaW5nIFxcYHRoaXNcXGAgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgcGF0aGAsXG4gICAgICAgIG0ubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCBjYWxsUGFydHMgPSB0aGlzLmV4cHIuY2FsbFBhcnRzKG0sIHJlc29sdXRpb24ucmVzb2x1dGlvbik7XG4gICAgcmV0dXJuIHRoaXMuY3R4LmJ1aWxkZXIubW9kaWZpZXIoY2FsbFBhcnRzLCB0aGlzLmN0eC5sb2MobS5sb2MpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBoYW5kbGVzIGF0dHJpYnV0ZSB2YWx1ZXMgdGhhdCBhcmUgY3VybGllcywgYXMgd2VsbCBhcyBjdXJsaWVzIG5lc3RlZCBpbnNpZGUgb2ZcbiAgICogaW50ZXJwb2xhdGlvbnM6XG4gICAqXG4gICAqIGBgYGhic1xuICAgKiA8YSBocmVmPXt7dXJsfX0gLz5cbiAgICogPGEgaHJlZj1cInt7dXJsfX0uaHRtbFwiIC8+XG4gICAqIGBgYFxuICAgKi9cbiAgcHJpdmF0ZSBtdXN0YWNoZUF0dHIobXVzdGFjaGU6IEFTVHYxLk11c3RhY2hlU3RhdGVtZW50KTogQVNUdjIuRXhwcmVzc2lvbk5vZGUge1xuICAgIC8vIE5vcm1hbGl6ZSB0aGUgY2FsbCBwYXJ0cyBpbiBBdHRyVmFsdWVTeW50YXhDb250ZXh0XG4gICAgbGV0IHNleHAgPSB0aGlzLmN0eC5idWlsZGVyLnNleHAoXG4gICAgICB0aGlzLmV4cHIuY2FsbFBhcnRzKG11c3RhY2hlLCBBdHRyVmFsdWVTeW50YXhDb250ZXh0KG11c3RhY2hlKSksXG4gICAgICB0aGlzLmN0eC5sb2MobXVzdGFjaGUubG9jKVxuICAgICk7XG5cbiAgICAvLyBJZiB0aGVyZSBhcmUgbm8gcGFyYW1zIG9yIGhhc2gsIGp1c3QgcmV0dXJuIHRoZSBmdW5jdGlvbiBwYXJ0IGFzIGl0cyBvd24gZXhwcmVzc2lvblxuICAgIGlmIChzZXhwLmFyZ3MuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gc2V4cC5jYWxsZWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzZXhwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBhdHRyUGFydCBpcyB0aGUgbmFycm93ZWQgZG93biBsaXN0IG9mIHZhbGlkIGF0dHJpYnV0ZSB2YWx1ZXMgdGhhdCBhcmUgYWxzb1xuICAgKiBhbGxvd2VkIGFzIGEgY29uY2F0IHBhcnQgKHlvdSBjYW4ndCBuZXN0IGNvbmNhdHMpLlxuICAgKi9cbiAgcHJpdmF0ZSBhdHRyUGFydChcbiAgICBwYXJ0OiBBU1R2MS5NdXN0YWNoZVN0YXRlbWVudCB8IEFTVHYxLlRleHROb2RlXG4gICk6IHsgZXhwcjogQVNUdjIuRXhwcmVzc2lvbk5vZGU7IHRydXN0aW5nOiBib29sZWFuIH0ge1xuICAgIHN3aXRjaCAocGFydC50eXBlKSB7XG4gICAgICBjYXNlICdNdXN0YWNoZVN0YXRlbWVudCc6XG4gICAgICAgIHJldHVybiB7IGV4cHI6IHRoaXMubXVzdGFjaGVBdHRyKHBhcnQpLCB0cnVzdGluZzogIXBhcnQuZXNjYXBlZCB9O1xuICAgICAgY2FzZSAnVGV4dE5vZGUnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGV4cHI6IHRoaXMuY3R4LmJ1aWxkZXIubGl0ZXJhbChwYXJ0LmNoYXJzLCB0aGlzLmN0eC5sb2MocGFydC5sb2MpKSxcbiAgICAgICAgICB0cnVzdGluZzogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGF0dHJWYWx1ZShcbiAgICBwYXJ0OiBBU1R2MS5NdXN0YWNoZVN0YXRlbWVudCB8IEFTVHYxLlRleHROb2RlIHwgQVNUdjEuQ29uY2F0U3RhdGVtZW50XG4gICk6IHsgZXhwcjogQVNUdjIuRXhwcmVzc2lvbk5vZGU7IHRydXN0aW5nOiBib29sZWFuIH0ge1xuICAgIHN3aXRjaCAocGFydC50eXBlKSB7XG4gICAgICBjYXNlICdDb25jYXRTdGF0ZW1lbnQnOiB7XG4gICAgICAgIGxldCBwYXJ0cyA9IHBhcnQucGFydHMubWFwKChwKSA9PiB0aGlzLmF0dHJQYXJ0KHApLmV4cHIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGV4cHI6IHRoaXMuY3R4LmJ1aWxkZXIuaW50ZXJwb2xhdGUocGFydHMsIHRoaXMuY3R4LmxvYyhwYXJ0LmxvYykpLFxuICAgICAgICAgIHRydXN0aW5nOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHJQYXJ0KHBhcnQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXR0cihtOiBBU1R2MS5BdHRyTm9kZSk6IEFTVHYyLkh0bWxPclNwbGF0QXR0ciB7XG4gICAgYXNzZXJ0KG0ubmFtZVswXSAhPT0gJ0AnLCAnQW4gYXR0ciBuYW1lIG11c3Qgbm90IHN0YXJ0IHdpdGggYEBgJyk7XG5cbiAgICBpZiAobS5uYW1lID09PSAnLi4uYXR0cmlidXRlcycpIHtcbiAgICAgIHJldHVybiB0aGlzLmN0eC5idWlsZGVyLnNwbGF0QXR0cih0aGlzLmN0eC50YWJsZS5hbGxvY2F0ZUJsb2NrKCdhdHRycycpLCB0aGlzLmN0eC5sb2MobS5sb2MpKTtcbiAgICB9XG5cbiAgICBsZXQgb2Zmc2V0cyA9IHRoaXMuY3R4LmxvYyhtLmxvYyk7XG4gICAgbGV0IG5hbWVTbGljZSA9IG9mZnNldHMuc2xpY2VTdGFydENoYXJzKHsgY2hhcnM6IG0ubmFtZS5sZW5ndGggfSkudG9TbGljZShtLm5hbWUpO1xuXG4gICAgbGV0IHZhbHVlID0gdGhpcy5hdHRyVmFsdWUobS52YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXMuY3R4LmJ1aWxkZXIuYXR0cihcbiAgICAgIHsgbmFtZTogbmFtZVNsaWNlLCB2YWx1ZTogdmFsdWUuZXhwciwgdHJ1c3Rpbmc6IHZhbHVlLnRydXN0aW5nIH0sXG4gICAgICBvZmZzZXRzXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgbWF5YmVEZXByZWNhdGVkQ2FsbChcbiAgICBhcmc6IFNvdXJjZVNsaWNlLFxuICAgIHBhcnQ6IEFTVHYxLk11c3RhY2hlU3RhdGVtZW50IHwgQVNUdjEuVGV4dE5vZGUgfCBBU1R2MS5Db25jYXRTdGF0ZW1lbnRcbiAgKTogeyBleHByOiBBU1R2Mi5EZXByZWNhdGVkQ2FsbEV4cHJlc3Npb247IHRydXN0aW5nOiBib29sZWFuIH0gfCBudWxsIHtcbiAgICBpZiAodGhpcy5jdHguc3RyaWN0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAocGFydC50eXBlICE9PSAnTXVzdGFjaGVTdGF0ZW1lbnQnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgeyBwYXRoIH0gPSBwYXJ0O1xuXG4gICAgaWYgKHBhdGgudHlwZSAhPT0gJ1BhdGhFeHByZXNzaW9uJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHBhdGguaGVhZC50eXBlICE9PSAnVmFySGVhZCcpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCB7IG5hbWUgfSA9IHBhdGguaGVhZDtcblxuICAgIGlmIChuYW1lID09PSAnaGFzLWJsb2NrJyB8fCBuYW1lID09PSAnaGFzLWJsb2NrLXBhcmFtcycpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmN0eC5oYXNCaW5kaW5nKG5hbWUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAocGF0aC50YWlsLmxlbmd0aCAhPT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHBhcnQucGFyYW1zLmxlbmd0aCAhPT0gMCB8fCBwYXJ0Lmhhc2gucGFpcnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgY29udGV4dCA9IEFTVHYyLkxvb3NlTW9kZVJlc29sdXRpb24uYXR0cigpO1xuXG4gICAgbGV0IGNhbGxlZSA9IHRoaXMuY3R4LmJ1aWxkZXIuZnJlZVZhcih7XG4gICAgICBuYW1lLFxuICAgICAgY29udGV4dCxcbiAgICAgIHN5bWJvbDogdGhpcy5jdHgudGFibGUuYWxsb2NhdGVGcmVlKG5hbWUsIGNvbnRleHQpLFxuICAgICAgbG9jOiBwYXRoLmxvYyxcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBleHByOiB0aGlzLmN0eC5idWlsZGVyLmRlcHJlY2F0ZWRDYWxsKGFyZywgY2FsbGVlLCBwYXJ0LmxvYyksXG4gICAgICB0cnVzdGluZzogZmFsc2UsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgYXJnKGFyZzogQVNUdjEuQXR0ck5vZGUpOiBBU1R2Mi5Db21wb25lbnRBcmcge1xuICAgIGFzc2VydChhcmcubmFtZVswXSA9PT0gJ0AnLCAnQW4gYXJnIG5hbWUgbXVzdCBzdGFydCB3aXRoIGBAYCcpO1xuXG4gICAgbGV0IG9mZnNldHMgPSB0aGlzLmN0eC5sb2MoYXJnLmxvYyk7XG4gICAgbGV0IG5hbWVTbGljZSA9IG9mZnNldHMuc2xpY2VTdGFydENoYXJzKHsgY2hhcnM6IGFyZy5uYW1lLmxlbmd0aCB9KS50b1NsaWNlKGFyZy5uYW1lKTtcblxuICAgIGxldCB2YWx1ZSA9IHRoaXMubWF5YmVEZXByZWNhdGVkQ2FsbChuYW1lU2xpY2UsIGFyZy52YWx1ZSkgfHwgdGhpcy5hdHRyVmFsdWUoYXJnLnZhbHVlKTtcbiAgICByZXR1cm4gdGhpcy5jdHguYnVpbGRlci5hcmcoXG4gICAgICB7IG5hbWU6IG5hbWVTbGljZSwgdmFsdWU6IHZhbHVlLmV4cHIsIHRydXN0aW5nOiB2YWx1ZS50cnVzdGluZyB9LFxuICAgICAgb2Zmc2V0c1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiBjbGFzc2lmaWVzIHRoZSBoZWFkIG9mIGFuIEFTVHYxLkVsZW1lbnQgaW50byBhbiBBU1R2Mi5QYXRoSGVhZCAoaWYgdGhlXG4gICAqIGVsZW1lbnQgaXMgYSBjb21wb25lbnQpIG9yIGAnRWxlbWVudEhlYWQnYCAoaWYgdGhlIGVsZW1lbnQgaXMgYSBzaW1wbGUgZWxlbWVudCkuXG4gICAqXG4gICAqIFJ1bGVzOlxuICAgKlxuICAgKiAxLiBJZiB0aGUgdmFyaWFibGUgaXMgYW4gYEBhcmdgLCByZXR1cm4gYW4gYEF0SGVhZGBcbiAgICogMi4gSWYgdGhlIHZhcmlhYmxlIGlzIGB0aGlzYCwgcmV0dXJuIGEgYFRoaXNIZWFkYFxuICAgKiAzLiBJZiB0aGUgdmFyaWFibGUgaXMgaW4gdGhlIGN1cnJlbnQgc2NvcGU6XG4gICAqICAgYS4gSWYgdGhlIHNjb3BlIGlzIHRoZSByb290IHNjb3BlLCB0aGVuIHJldHVybiBhIEZyZWUgYExvY2FsVmFySGVhZGBcbiAgICogICBiLiBFbHNlLCByZXR1cm4gYSBzdGFuZGFyZCBgTG9jYWxWYXJIZWFkYFxuICAgKiA0LiBJZiB0aGUgdGFnIG5hbWUgaXMgYSBwYXRoIGFuZCB0aGUgdmFyaWFibGUgaXMgbm90IGluIHRoZSBjdXJyZW50IHNjb3BlLCBTeW50YXggRXJyb3JcbiAgICogNS4gSWYgdGhlIHZhcmlhYmxlIGlzIHVwcGVyY2FzZSByZXR1cm4gYSBGcmVlVmFyKFJlc29sdmVBc0NvbXBvbmVudEhlYWQpXG4gICAqIDYuIE90aGVyd2lzZSwgcmV0dXJuIGAnRWxlbWVudEhlYWQnYFxuICAgKi9cbiAgcHJpdmF0ZSBjbGFzc2lmeVRhZyhcbiAgICB2YXJpYWJsZTogc3RyaW5nLFxuICAgIHRhaWw6IHN0cmluZ1tdLFxuICAgIGxvYzogU291cmNlU3BhblxuICApOiBBU1R2Mi5FeHByZXNzaW9uTm9kZSB8ICdFbGVtZW50SGVhZCcge1xuICAgIGxldCB1cHBlcmNhc2UgPSBpc1VwcGVyQ2FzZSh2YXJpYWJsZSk7XG4gICAgbGV0IGluU2NvcGUgPSB2YXJpYWJsZVswXSA9PT0gJ0AnIHx8IHZhcmlhYmxlID09PSAndGhpcycgfHwgdGhpcy5jdHguaGFzQmluZGluZyh2YXJpYWJsZSk7XG5cbiAgICBpZiAodGhpcy5jdHguc3RyaWN0ICYmICFpblNjb3BlKSB7XG4gICAgICBpZiAodXBwZXJjYXNlKSB7XG4gICAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgICAgYEF0dGVtcHRlZCB0byBpbnZva2UgYSBjb21wb25lbnQgdGhhdCB3YXMgbm90IGluIHNjb3BlIGluIGEgc3RyaWN0IG1vZGUgdGVtcGxhdGUsIFxcYDwke3ZhcmlhYmxlfT5cXGAuIElmIHlvdSB3YW50ZWQgdG8gY3JlYXRlIGFuIGVsZW1lbnQgd2l0aCB0aGF0IG5hbWUsIGNvbnZlcnQgaXQgdG8gbG93ZXJjYXNlIC0gXFxgPCR7dmFyaWFibGUudG9Mb3dlckNhc2UoKX0+XFxgYCxcbiAgICAgICAgICBsb2NcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gSW4gc3RyaWN0IG1vZGUsIHZhbHVlcyBhcmUgYWx3YXlzIGVsZW1lbnRzIHVubGVzcyB0aGV5IGFyZSBpbiBzY29wZVxuICAgICAgcmV0dXJuICdFbGVtZW50SGVhZCc7XG4gICAgfVxuXG4gICAgLy8gU2luY2UgdGhlIHBhcnNlciBoYW5kZWQgdXMgdGhlIEhUTUwgZWxlbWVudCBuYW1lIGFzIGEgc3RyaW5nLCB3ZSBuZWVkXG4gICAgLy8gdG8gY29udmVydCBpdCBpbnRvIGFuIEFTVHYxIHBhdGggc28gaXQgY2FuIGJlIHByb2Nlc3NlZCB1c2luZyB0aGVcbiAgICAvLyBleHByZXNzaW9uIG5vcm1hbGl6ZXIuXG4gICAgbGV0IGlzQ29tcG9uZW50ID0gaW5TY29wZSB8fCB1cHBlcmNhc2U7XG5cbiAgICBsZXQgdmFyaWFibGVMb2MgPSBsb2Muc2xpY2VTdGFydENoYXJzKHsgc2tpcFN0YXJ0OiAxLCBjaGFyczogdmFyaWFibGUubGVuZ3RoIH0pO1xuXG4gICAgbGV0IHRhaWxMZW5ndGggPSB0YWlsLnJlZHVjZSgoYWNjdW0sIHBhcnQpID0+IGFjY3VtICsgMSArIHBhcnQubGVuZ3RoLCAwKTtcbiAgICBsZXQgcGF0aEVuZCA9IHZhcmlhYmxlTG9jLmdldEVuZCgpLm1vdmUodGFpbExlbmd0aCk7XG4gICAgbGV0IHBhdGhMb2MgPSB2YXJpYWJsZUxvYy53aXRoRW5kKHBhdGhFbmQpO1xuXG4gICAgaWYgKGlzQ29tcG9uZW50KSB7XG4gICAgICBsZXQgcGF0aCA9IGIucGF0aCh7XG4gICAgICAgIGhlYWQ6IGIuaGVhZCh2YXJpYWJsZSwgdmFyaWFibGVMb2MpLFxuICAgICAgICB0YWlsLFxuICAgICAgICBsb2M6IHBhdGhMb2MsXG4gICAgICB9KTtcblxuICAgICAgbGV0IHJlc29sdXRpb24gPSB0aGlzLmN0eC5yZXNvbHV0aW9uRm9yKHBhdGgsIENvbXBvbmVudFN5bnRheENvbnRleHQpO1xuXG4gICAgICBpZiAocmVzb2x1dGlvbi5yZXNvbHV0aW9uID09PSAnZXJyb3InKSB7XG4gICAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgICAgYFlvdSBhdHRlbXB0ZWQgdG8gaW52b2tlIGEgcGF0aCAoXFxgPCR7cmVzb2x1dGlvbi5wYXRofT5cXGApIGJ1dCAke3Jlc29sdXRpb24uaGVhZH0gd2FzIG5vdCBpbiBzY29wZWAsXG4gICAgICAgICAgbG9jXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgRXhwcmVzc2lvbk5vcm1hbGl6ZXIodGhpcy5jdHgpLm5vcm1hbGl6ZShwYXRoLCByZXNvbHV0aW9uLnJlc29sdXRpb24pO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSB0YWcgbmFtZSB3YXNuJ3QgYSB2YWxpZCBjb21wb25lbnQgYnV0IGNvbnRhaW5lZCBhIGAuYCwgaXQnc1xuICAgIC8vIGEgc3ludGF4IGVycm9yLlxuICAgIGlmICh0YWlsLmxlbmd0aCA+IDApIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgIGBZb3UgdXNlZCAke3ZhcmlhYmxlfS4ke3RhaWwuam9pbignLicpfSBhcyBhIHRhZyBuYW1lLCBidXQgJHt2YXJpYWJsZX0gaXMgbm90IGluIHNjb3BlYCxcbiAgICAgICAgbG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAnRWxlbWVudEhlYWQnO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgZXhwcigpOiBFeHByZXNzaW9uTm9ybWFsaXplciB7XG4gICAgcmV0dXJuIG5ldyBFeHByZXNzaW9uTm9ybWFsaXplcih0aGlzLmN0eCk7XG4gIH1cbn1cblxuY2xhc3MgQ2hpbGRyZW4ge1xuICByZWFkb25seSBuYW1lZEJsb2NrczogQVNUdjIuTmFtZWRCbG9ja1tdO1xuICByZWFkb25seSBoYXNTZW1hbnRpY0NvbnRlbnQ6IGJvb2xlYW47XG4gIHJlYWRvbmx5IG5vbkJsb2NrQ2hpbGRyZW46IEFTVHYyLkNvbnRlbnROb2RlW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgbG9jOiBTb3VyY2VTcGFuLFxuICAgIHJlYWRvbmx5IGNoaWxkcmVuOiAoQVNUdjIuQ29udGVudE5vZGUgfCBBU1R2Mi5OYW1lZEJsb2NrKVtdLFxuICAgIHJlYWRvbmx5IGJsb2NrOiBCbG9ja0NvbnRleHRcbiAgKSB7XG4gICAgdGhpcy5uYW1lZEJsb2NrcyA9IGNoaWxkcmVuLmZpbHRlcigoYyk6IGMgaXMgQVNUdjIuTmFtZWRCbG9jayA9PiBjIGluc3RhbmNlb2YgQVNUdjIuTmFtZWRCbG9jayk7XG4gICAgdGhpcy5oYXNTZW1hbnRpY0NvbnRlbnQgPSBCb29sZWFuKFxuICAgICAgY2hpbGRyZW4uZmlsdGVyKChjKTogYyBpcyBBU1R2Mi5Db250ZW50Tm9kZSA9PiB7XG4gICAgICAgIGlmIChjIGluc3RhbmNlb2YgQVNUdjIuTmFtZWRCbG9jaykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKGMudHlwZSkge1xuICAgICAgICAgIGNhc2UgJ0dsaW1tZXJDb21tZW50JzpcbiAgICAgICAgICBjYXNlICdIdG1sQ29tbWVudCc6XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgY2FzZSAnSHRtbFRleHQnOlxuICAgICAgICAgICAgcmV0dXJuICEvXlxccyokLy5leGVjKGMuY2hhcnMpO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSkubGVuZ3RoXG4gICAgKTtcbiAgICB0aGlzLm5vbkJsb2NrQ2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoXG4gICAgICAoYyk6IGMgaXMgQVNUdjIuQ29udGVudE5vZGUgPT4gIShjIGluc3RhbmNlb2YgQVNUdjIuTmFtZWRCbG9jaylcbiAgICApO1xuICB9XG59XG5cbmNsYXNzIFRlbXBsYXRlQ2hpbGRyZW4gZXh0ZW5kcyBDaGlsZHJlbiB7XG4gIGFzc2VydFRlbXBsYXRlKHRhYmxlOiBQcm9ncmFtU3ltYm9sVGFibGUpOiBBU1R2Mi5UZW1wbGF0ZSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLm5hbWVkQmxvY2tzKSkge1xuICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihgVW5leHBlY3RlZCBuYW1lZCBibG9jayBhdCB0aGUgdG9wLWxldmVsIG9mIGEgdGVtcGxhdGVgLCB0aGlzLmxvYyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYmxvY2suYnVpbGRlci50ZW1wbGF0ZSh0YWJsZSwgdGhpcy5ub25CbG9ja0NoaWxkcmVuLCB0aGlzLmJsb2NrLmxvYyh0aGlzLmxvYykpO1xuICB9XG59XG5cbmNsYXNzIEJsb2NrQ2hpbGRyZW4gZXh0ZW5kcyBDaGlsZHJlbiB7XG4gIGFzc2VydEJsb2NrKHRhYmxlOiBCbG9ja1N5bWJvbFRhYmxlKTogQVNUdjIuQmxvY2sge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5uYW1lZEJsb2NrcykpIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoYFVuZXhwZWN0ZWQgbmFtZWQgYmxvY2sgbmVzdGVkIGluIGEgbm9ybWFsIGJsb2NrYCwgdGhpcy5sb2MpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmJsb2NrLmJ1aWxkZXIuYmxvY2sodGFibGUsIHRoaXMubm9uQmxvY2tDaGlsZHJlbiwgdGhpcy5sb2MpO1xuICB9XG59XG5cbmNsYXNzIEVsZW1lbnRDaGlsZHJlbiBleHRlbmRzIENoaWxkcmVuIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBlbDogQnVpbGRFbGVtZW50LFxuICAgIGxvYzogU291cmNlU3BhbixcbiAgICBjaGlsZHJlbjogKEFTVHYyLkNvbnRlbnROb2RlIHwgQVNUdjIuTmFtZWRCbG9jaylbXSxcbiAgICBibG9jazogQmxvY2tDb250ZXh0XG4gICkge1xuICAgIHN1cGVyKGxvYywgY2hpbGRyZW4sIGJsb2NrKTtcbiAgfVxuXG4gIGFzc2VydE5hbWVkQmxvY2sobmFtZTogU291cmNlU2xpY2UsIHRhYmxlOiBCbG9ja1N5bWJvbFRhYmxlKTogQVNUdjIuTmFtZWRCbG9jayB7XG4gICAgaWYgKHRoaXMuZWwuYmFzZS5zZWxmQ2xvc2luZykge1xuICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgYDw6JHtuYW1lLmNoYXJzfS8+IGlzIG5vdCBhIHZhbGlkIG5hbWVkIGJsb2NrOiBuYW1lZCBibG9ja3MgY2Fubm90IGJlIHNlbGYtY2xvc2luZ2AsXG4gICAgICAgIHRoaXMubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5uYW1lZEJsb2NrcykpIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgIGBVbmV4cGVjdGVkIG5hbWVkIGJsb2NrIGluc2lkZSA8OiR7bmFtZS5jaGFyc30+IG5hbWVkIGJsb2NrOiBuYW1lZCBibG9ja3MgY2Fubm90IGNvbnRhaW4gbmVzdGVkIG5hbWVkIGJsb2Nrc2AsXG4gICAgICAgIHRoaXMubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICghaXNMb3dlckNhc2UobmFtZS5jaGFycykpIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgIGA8OiR7bmFtZS5jaGFyc30+IGlzIG5vdCBhIHZhbGlkIG5hbWVkIGJsb2NrLCBhbmQgbmFtZWQgYmxvY2tzIG11c3QgYmVnaW4gd2l0aCBhIGxvd2VyY2FzZSBsZXR0ZXJgLFxuICAgICAgICB0aGlzLmxvY1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLmVsLmJhc2UuYXR0cnMubGVuZ3RoID4gMCB8fFxuICAgICAgdGhpcy5lbC5iYXNlLmNvbXBvbmVudEFyZ3MubGVuZ3RoID4gMCB8fFxuICAgICAgdGhpcy5lbC5iYXNlLm1vZGlmaWVycy5sZW5ndGggPiAwXG4gICAgKSB7XG4gICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKFxuICAgICAgICBgbmFtZWQgYmxvY2sgPDoke25hbWUuY2hhcnN9PiBjYW5ub3QgaGF2ZSBhdHRyaWJ1dGVzLCBhcmd1bWVudHMsIG9yIG1vZGlmaWVyc2AsXG4gICAgICAgIHRoaXMubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCBvZmZzZXRzID0gU3Bhbkxpc3QucmFuZ2UodGhpcy5ub25CbG9ja0NoaWxkcmVuLCB0aGlzLmxvYyk7XG5cbiAgICByZXR1cm4gdGhpcy5ibG9jay5idWlsZGVyLm5hbWVkQmxvY2soXG4gICAgICBuYW1lLFxuICAgICAgdGhpcy5ibG9jay5idWlsZGVyLmJsb2NrKHRhYmxlLCB0aGlzLm5vbkJsb2NrQ2hpbGRyZW4sIG9mZnNldHMpLFxuICAgICAgdGhpcy5sb2NcbiAgICApO1xuICB9XG5cbiAgYXNzZXJ0RWxlbWVudChuYW1lOiBTb3VyY2VTbGljZSwgaGFzQmxvY2tQYXJhbXM6IGJvb2xlYW4pOiBBU1R2Mi5TaW1wbGVFbGVtZW50IHtcbiAgICBpZiAoaGFzQmxvY2tQYXJhbXMpIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgIGBVbmV4cGVjdGVkIGJsb2NrIHBhcmFtcyBpbiA8JHtuYW1lfT46IHNpbXBsZSBlbGVtZW50cyBjYW5ub3QgaGF2ZSBibG9jayBwYXJhbXNgLFxuICAgICAgICB0aGlzLmxvY1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMubmFtZWRCbG9ja3MpKSB7XG4gICAgICBsZXQgbmFtZXMgPSB0aGlzLm5hbWVkQmxvY2tzLm1hcCgoYikgPT4gYi5uYW1lKTtcblxuICAgICAgaWYgKG5hbWVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKFxuICAgICAgICAgIGBVbmV4cGVjdGVkIG5hbWVkIGJsb2NrIDw6Zm9vPiBpbnNpZGUgPCR7bmFtZS5jaGFyc30+IEhUTUwgZWxlbWVudGAsXG4gICAgICAgICAgdGhpcy5sb2NcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBwcmludGVkTmFtZXMgPSBuYW1lcy5tYXAoKG4pID0+IGA8OiR7bi5jaGFyc30+YCkuam9pbignLCAnKTtcbiAgICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgICBgVW5leHBlY3RlZCBuYW1lZCBibG9ja3MgaW5zaWRlIDwke25hbWUuY2hhcnN9PiBIVE1MIGVsZW1lbnQgKCR7cHJpbnRlZE5hbWVzfSlgLFxuICAgICAgICAgIHRoaXMubG9jXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZWwuc2ltcGxlKG5hbWUsIHRoaXMubm9uQmxvY2tDaGlsZHJlbiwgdGhpcy5sb2MpO1xuICB9XG5cbiAgYXNzZXJ0Q29tcG9uZW50KFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICB0YWJsZTogQmxvY2tTeW1ib2xUYWJsZSxcbiAgICBoYXNCbG9ja1BhcmFtczogYm9vbGVhblxuICApOiBQcmVzZW50QXJyYXk8QVNUdjIuTmFtZWRCbG9jaz4ge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5uYW1lZEJsb2NrcykgJiYgdGhpcy5oYXNTZW1hbnRpY0NvbnRlbnQpIHtcbiAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgIGBVbmV4cGVjdGVkIGNvbnRlbnQgaW5zaWRlIDwke25hbWV9PiBjb21wb25lbnQgaW52b2NhdGlvbjogd2hlbiB1c2luZyBuYW1lZCBibG9ja3MsIHRoZSB0YWcgY2Fubm90IGNvbnRhaW4gb3RoZXIgY29udGVudGAsXG4gICAgICAgIHRoaXMubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5uYW1lZEJsb2NrcykpIHtcbiAgICAgIGlmIChoYXNCbG9ja1BhcmFtcykge1xuICAgICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKFxuICAgICAgICAgIGBVbmV4cGVjdGVkIGJsb2NrIHBhcmFtcyBsaXN0IG9uIDwke25hbWV9PiBjb21wb25lbnQgaW52b2NhdGlvbjogd2hlbiBwYXNzaW5nIG5hbWVkIGJsb2NrcywgdGhlIGludm9jYXRpb24gdGFnIGNhbm5vdCB0YWtlIGJsb2NrIHBhcmFtc2AsXG4gICAgICAgICAgdGhpcy5sb2NcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHNlZW5OYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gICAgICBmb3IgKGxldCBibG9jayBvZiB0aGlzLm5hbWVkQmxvY2tzKSB7XG4gICAgICAgIGxldCBuYW1lID0gYmxvY2submFtZS5jaGFycztcblxuICAgICAgICBpZiAoc2Vlbk5hbWVzLmhhcyhuYW1lKSkge1xuICAgICAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgICAgICBgQ29tcG9uZW50IGhhZCB0d28gbmFtZWQgYmxvY2tzIHdpdGggdGhlIHNhbWUgbmFtZSwgXFxgPDoke25hbWV9PlxcYC4gT25seSBvbmUgYmxvY2sgd2l0aCBhIGdpdmVuIG5hbWUgbWF5IGJlIHBhc3NlZGAsXG4gICAgICAgICAgICB0aGlzLmxvY1xuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXG4gICAgICAgICAgKG5hbWUgPT09ICdpbnZlcnNlJyAmJiBzZWVuTmFtZXMuaGFzKCdlbHNlJykpIHx8XG4gICAgICAgICAgKG5hbWUgPT09ICdlbHNlJyAmJiBzZWVuTmFtZXMuaGFzKCdpbnZlcnNlJykpXG4gICAgICAgICkge1xuICAgICAgICAgIHRocm93IGdlbmVyYXRlU3ludGF4RXJyb3IoXG4gICAgICAgICAgICBgQ29tcG9uZW50IGhhcyBib3RoIDw6ZWxzZT4gYW5kIDw6aW52ZXJzZT4gYmxvY2suIDw6aW52ZXJzZT4gaXMgYW4gYWxpYXMgZm9yIDw6ZWxzZT5gLFxuICAgICAgICAgICAgdGhpcy5sb2NcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgc2Vlbk5hbWVzLmFkZChuYW1lKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMubmFtZWRCbG9ja3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIHRoaXMuYmxvY2suYnVpbGRlci5uYW1lZEJsb2NrKFxuICAgICAgICAgIFNvdXJjZVNsaWNlLnN5bnRoZXRpYygnZGVmYXVsdCcpLFxuICAgICAgICAgIHRoaXMuYmxvY2suYnVpbGRlci5ibG9jayh0YWJsZSwgdGhpcy5ub25CbG9ja0NoaWxkcmVuLCB0aGlzLmxvYyksXG4gICAgICAgICAgdGhpcy5sb2NcbiAgICAgICAgKSxcbiAgICAgIF07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHByaW50UGF0aChub2RlOiBBU1R2MS5QYXRoRXhwcmVzc2lvbiB8IEFTVHYxLkNhbGxOb2RlKTogc3RyaW5nIHtcbiAgaWYgKG5vZGUudHlwZSAhPT0gJ1BhdGhFeHByZXNzaW9uJyAmJiBub2RlLnBhdGgudHlwZSA9PT0gJ1BhdGhFeHByZXNzaW9uJykge1xuICAgIHJldHVybiBwcmludFBhdGgobm9kZS5wYXRoKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFByaW50ZXIoeyBlbnRpdHlFbmNvZGluZzogJ3JhdycgfSkucHJpbnQobm9kZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJpbnRIZWFkKG5vZGU6IEFTVHYxLlBhdGhFeHByZXNzaW9uIHwgQVNUdjEuQ2FsbE5vZGUpOiBzdHJpbmcge1xuICBpZiAobm9kZS50eXBlID09PSAnUGF0aEV4cHJlc3Npb24nKSB7XG4gICAgc3dpdGNoIChub2RlLmhlYWQudHlwZSkge1xuICAgICAgY2FzZSAnQXRIZWFkJzpcbiAgICAgIGNhc2UgJ1ZhckhlYWQnOlxuICAgICAgICByZXR1cm4gbm9kZS5oZWFkLm5hbWU7XG4gICAgICBjYXNlICdUaGlzSGVhZCc6XG4gICAgICAgIHJldHVybiAndGhpcyc7XG4gICAgfVxuICB9IGVsc2UgaWYgKG5vZGUucGF0aC50eXBlID09PSAnUGF0aEV4cHJlc3Npb24nKSB7XG4gICAgcmV0dXJuIHByaW50SGVhZChub2RlLnBhdGgpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgUHJpbnRlcih7IGVudGl0eUVuY29kaW5nOiAncmF3JyB9KS5wcmludChub2RlKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==