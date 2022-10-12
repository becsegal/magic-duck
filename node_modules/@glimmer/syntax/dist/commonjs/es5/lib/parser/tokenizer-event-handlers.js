"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.preprocess = preprocess;
exports.TokenizerEventHandlers = void 0;

var _util = require("@glimmer/util");

var _parser = require("@handlebars/parser");

var _simpleHtmlTokenizer = require("simple-html-tokenizer");

var _print = _interopRequireDefault(require("../generation/print"));

var _printer = require("../generation/printer");

var _source = require("../source/source");

var _span = require("../source/span");

var _syntaxError = require("../syntax-error");

var _traverse = _interopRequireDefault(require("../traversal/traverse"));

var _walker = _interopRequireDefault(require("../traversal/walker"));

var _utils = require("../utils");

var _parserBuilders = _interopRequireDefault(require("../v1/parser-builders"));

var _publicBuilders = _interopRequireDefault(require("../v1/public-builders"));

var _handlebarsNodeVisitors = require("./handlebars-node-visitors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var TokenizerEventHandlers = /*#__PURE__*/function (_HandlebarsNodeVisito) {
  _inheritsLoose(TokenizerEventHandlers, _HandlebarsNodeVisito);

  function TokenizerEventHandlers() {
    var _this;

    _this = _HandlebarsNodeVisito.apply(this, arguments) || this;
    _this.tagOpenLine = 0;
    _this.tagOpenColumn = 0;
    return _this;
  }

  var _proto = TokenizerEventHandlers.prototype;

  _proto.reset = function reset() {
    this.currentNode = null;
  } // Comment
  ;

  _proto.beginComment = function beginComment() {
    this.currentNode = _parserBuilders.default.comment('', this.source.offsetFor(this.tagOpenLine, this.tagOpenColumn));
  };

  _proto.appendToCommentData = function appendToCommentData(_char) {
    this.currentComment.value += _char;
  };

  _proto.finishComment = function finishComment() {
    (0, _utils.appendChild)(this.currentElement(), this.finish(this.currentComment));
  } // Data
  ;

  _proto.beginData = function beginData() {
    this.currentNode = _parserBuilders.default.text({
      chars: '',
      loc: this.offset().collapsed()
    });
  };

  _proto.appendToData = function appendToData(_char2) {
    this.currentData.chars += _char2;
  };

  _proto.finishData = function finishData() {
    this.currentData.loc = this.currentData.loc.withEnd(this.offset());
    (0, _utils.appendChild)(this.currentElement(), this.currentData);
  } // Tags - basic
  ;

  _proto.tagOpen = function tagOpen() {
    this.tagOpenLine = this.tokenizer.line;
    this.tagOpenColumn = this.tokenizer.column;
  };

  _proto.beginStartTag = function beginStartTag() {
    this.currentNode = {
      type: 'StartTag',
      name: '',
      attributes: [],
      modifiers: [],
      comments: [],
      selfClosing: false,
      loc: this.source.offsetFor(this.tagOpenLine, this.tagOpenColumn)
    };
  };

  _proto.beginEndTag = function beginEndTag() {
    this.currentNode = {
      type: 'EndTag',
      name: '',
      attributes: [],
      modifiers: [],
      comments: [],
      selfClosing: false,
      loc: this.source.offsetFor(this.tagOpenLine, this.tagOpenColumn)
    };
  };

  _proto.finishTag = function finishTag() {
    var tag = this.finish(this.currentTag);

    if (tag.type === 'StartTag') {
      this.finishStartTag();

      if (tag.name === ':') {
        throw (0, _syntaxError.generateSyntaxError)('Invalid named block named detected, you may have created a named block without a name, or you may have began your name with a number. Named blocks must have names that are at least one character long, and begin with a lower case letter', this.source.spanFor({
          start: this.currentTag.loc.toJSON(),
          end: this.offset().toJSON()
        }));
      }

      if (_printer.voidMap[tag.name] || tag.selfClosing) {
        this.finishEndTag(true);
      }
    } else if (tag.type === 'EndTag') {
      this.finishEndTag(false);
    }
  };

  _proto.finishStartTag = function finishStartTag() {
    var _this$finish = this.finish(this.currentStartTag),
        name = _this$finish.name,
        attrs = _this$finish.attributes,
        modifiers = _this$finish.modifiers,
        comments = _this$finish.comments,
        selfClosing = _this$finish.selfClosing,
        loc = _this$finish.loc;

    var element = _parserBuilders.default.element({
      tag: name,
      selfClosing: selfClosing,
      attrs: attrs,
      modifiers: modifiers,
      comments: comments,
      children: [],
      blockParams: [],
      loc: loc
    });

    this.elementStack.push(element);
  };

  _proto.finishEndTag = function finishEndTag(isVoid) {
    var tag = this.finish(this.currentTag);
    var element = this.elementStack.pop();
    var parent = this.currentElement();
    this.validateEndTag(tag, element, isVoid);
    element.loc = element.loc.withEnd(this.offset());
    (0, _utils.parseElementBlockParams)(element);
    (0, _utils.appendChild)(parent, element);
  };

  _proto.markTagAsSelfClosing = function markTagAsSelfClosing() {
    this.currentTag.selfClosing = true;
  } // Tags - name
  ;

  _proto.appendToTagName = function appendToTagName(_char3) {
    this.currentTag.name += _char3;
  } // Tags - attributes
  ;

  _proto.beginAttribute = function beginAttribute() {
    var offset = this.offset();
    this.currentAttribute = {
      name: '',
      parts: [],
      currentPart: null,
      isQuoted: false,
      isDynamic: false,
      start: offset,
      valueSpan: offset.collapsed()
    };
  };

  _proto.appendToAttributeName = function appendToAttributeName(_char4) {
    this.currentAttr.name += _char4;
  };

  _proto.beginAttributeValue = function beginAttributeValue(isQuoted) {
    this.currentAttr.isQuoted = isQuoted;
    this.startTextPart();
    this.currentAttr.valueSpan = this.offset().collapsed();
  };

  _proto.appendToAttributeValue = function appendToAttributeValue(_char5) {
    var parts = this.currentAttr.parts;
    var lastPart = parts[parts.length - 1];
    var current = this.currentAttr.currentPart;

    if (current) {
      current.chars += _char5; // update end location for each added char

      current.loc = current.loc.withEnd(this.offset());
    } else {
      // initially assume the text node is a single char
      var loc = this.offset(); // the tokenizer line/column have already been advanced, correct location info

      if (_char5 === '\n') {
        loc = lastPart ? lastPart.loc.getEnd() : this.currentAttr.valueSpan.getStart();
      } else {
        loc = loc.move(-1);
      }

      this.currentAttr.currentPart = _parserBuilders.default.text({
        chars: _char5,
        loc: loc.collapsed()
      });
    }
  };

  _proto.finishAttributeValue = function finishAttributeValue() {
    this.finalizeTextPart();
    var tag = this.currentTag;
    var tokenizerPos = this.offset();

    if (tag.type === 'EndTag') {
      throw (0, _syntaxError.generateSyntaxError)("Invalid end tag: closing tag must not have attributes", this.source.spanFor({
        start: tag.loc.toJSON(),
        end: tokenizerPos.toJSON()
      }));
    }

    var _this$currentAttr = this.currentAttr,
        name = _this$currentAttr.name,
        parts = _this$currentAttr.parts,
        start = _this$currentAttr.start,
        isQuoted = _this$currentAttr.isQuoted,
        isDynamic = _this$currentAttr.isDynamic,
        valueSpan = _this$currentAttr.valueSpan;
    var value = this.assembleAttributeValue(parts, isQuoted, isDynamic, start.until(tokenizerPos));
    value.loc = valueSpan.withEnd(tokenizerPos);

    var attribute = _parserBuilders.default.attr({
      name: name,
      value: value,
      loc: start.until(tokenizerPos)
    });

    this.currentStartTag.attributes.push(attribute);
  };

  _proto.reportSyntaxError = function reportSyntaxError(message) {
    throw (0, _syntaxError.generateSyntaxError)(message, this.offset().collapsed());
  };

  _proto.assembleConcatenatedValue = function assembleConcatenatedValue(parts) {
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];

      if (part.type !== 'MustacheStatement' && part.type !== 'TextNode') {
        throw (0, _syntaxError.generateSyntaxError)('Unsupported node in quoted attribute value: ' + part['type'], part.loc);
      }
    }

    (0, _util.assertPresent)(parts, "the concatenation parts of an element should not be empty");
    var first = parts[0];
    var last = parts[parts.length - 1];
    return _parserBuilders.default.concat(parts, this.source.spanFor(first.loc).extend(this.source.spanFor(last.loc)));
  };

  _proto.validateEndTag = function validateEndTag(tag, element, selfClosing) {
    var error;

    if (_printer.voidMap[tag.name] && !selfClosing) {
      // EngTag is also called by StartTag for void and self-closing tags (i.e.
      // <input> or <br />, so we need to check for that here. Otherwise, we would
      // throw an error for those cases.
      error = "<" + tag.name + "> elements do not need end tags. You should remove it";
    } else if (element.tag === undefined) {
      error = "Closing tag </" + tag.name + "> without an open tag";
    } else if (element.tag !== tag.name) {
      error = "Closing tag </" + tag.name + "> did not match last open tag <" + element.tag + "> (on line " + element.loc.startPosition.line + ")";
    }

    if (error) {
      throw (0, _syntaxError.generateSyntaxError)(error, tag.loc);
    }
  };

  _proto.assembleAttributeValue = function assembleAttributeValue(parts, isQuoted, isDynamic, span) {
    if (isDynamic) {
      if (isQuoted) {
        return this.assembleConcatenatedValue(parts);
      } else {
        if (parts.length === 1 || parts.length === 2 && parts[1].type === 'TextNode' && parts[1].chars === '/') {
          return parts[0];
        } else {
          throw (0, _syntaxError.generateSyntaxError)("An unquoted attribute value must be a string or a mustache, " + "preceded by whitespace or a '=' character, and " + "followed by whitespace, a '>' character, or '/>'", span);
        }
      }
    } else {
      return parts.length > 0 ? parts[0] : _parserBuilders.default.text({
        chars: '',
        loc: span
      });
    }
  };

  return TokenizerEventHandlers;
}(_handlebarsNodeVisitors.HandlebarsNodeVisitors);

exports.TokenizerEventHandlers = TokenizerEventHandlers;
var syntax = {
  parse: preprocess,
  builders: _publicBuilders.default,
  print: _print.default,
  traverse: _traverse.default,
  Walker: _walker.default
};

var CodemodEntityParser = /*#__PURE__*/function (_EntityParser) {
  _inheritsLoose(CodemodEntityParser, _EntityParser); // match upstream types, but never match an entity


  function CodemodEntityParser() {
    return _EntityParser.call(this, {}) || this;
  }

  var _proto2 = CodemodEntityParser.prototype;

  _proto2.parse = function parse() {
    return undefined;
  };

  return CodemodEntityParser;
}(_simpleHtmlTokenizer.EntityParser);

function preprocess(input, options) {
  if (options === void 0) {
    options = {};
  }

  var _a, _b, _c;

  var mode = options.mode || 'precompile';
  var source;
  var ast;

  if (typeof input === 'string') {
    source = new _source.Source(input, (_a = options.meta) === null || _a === void 0 ? void 0 : _a.moduleName);

    if (mode === 'codemod') {
      ast = (0, _parser.parseWithoutProcessing)(input, options.parseOptions);
    } else {
      ast = (0, _parser.parse)(input, options.parseOptions);
    }
  } else if (input instanceof _source.Source) {
    source = input;

    if (mode === 'codemod') {
      ast = (0, _parser.parseWithoutProcessing)(input.source, options.parseOptions);
    } else {
      ast = (0, _parser.parse)(input.source, options.parseOptions);
    }
  } else {
    source = new _source.Source('', (_b = options.meta) === null || _b === void 0 ? void 0 : _b.moduleName);
    ast = input;
  }

  var entityParser = undefined;

  if (mode === 'codemod') {
    entityParser = new CodemodEntityParser();
  }

  var offsets = _span.SourceSpan.forCharPositions(source, 0, source.source.length);

  ast.loc = {
    source: '(program)',
    start: offsets.startPosition,
    end: offsets.endPosition
  };
  var program = new TokenizerEventHandlers(source, entityParser, mode).acceptTemplate(ast);

  if (options.strictMode) {
    program.blockParams = (_c = options.locals) !== null && _c !== void 0 ? _c : [];
  }

  if (options && options.plugins && options.plugins.ast) {
    for (var i = 0, l = options.plugins.ast.length; i < l; i++) {
      var transform = options.plugins.ast[i];
      var env = (0, _util.assign)({}, options, {
        syntax: syntax
      }, {
        plugins: undefined
      });
      var pluginResult = transform(env);
      (0, _traverse.default)(program, pluginResult.visitor);
    }
  }

  return program;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvcGFyc2VyL3Rva2VuaXplci1ldmVudC1oYW5kbGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBRUEsSUFBTSxzQkFBTixHQUFBLGFBQUEsVUFBQSxxQkFBQSxFQUFBO0FBQUEsRUFBQSxjQUFBLENBQUEsc0JBQUEsRUFBQSxxQkFBQSxDQUFBOztBQUFBLFdBQUEsc0JBQUEsR0FBQTtBQUFBLFFBQUEsS0FBQTs7O0FBQ1UsSUFBQSxLQUFBLENBQUEsV0FBQSxHQUFBLENBQUE7QUFDQSxJQUFBLEtBQUEsQ0FBQSxhQUFBLEdBQUEsQ0FBQTtBQUZWLFdBQUEsS0FBQTtBQWtTQzs7QUFsU0QsTUFBQSxNQUFBLEdBQUEsc0JBQUEsQ0FBQSxTQUFBOztBQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsR0FJRSxTQUFBLEtBQUEsR0FBSztBQUNILFNBQUEsV0FBQSxHQUFBLElBQUE7QUFMSixHQUFBLENBUUU7QUFSRjs7QUFBQSxFQUFBLE1BQUEsQ0FBQSxZQUFBLEdBVUUsU0FBQSxZQUFBLEdBQVk7QUFDVixTQUFBLFdBQUEsR0FBbUIsd0JBQUEsT0FBQSxDQUFBLEVBQUEsRUFBYyxLQUFBLE1BQUEsQ0FBQSxTQUFBLENBQXNCLEtBQXRCLFdBQUEsRUFBd0MsS0FBekUsYUFBaUMsQ0FBZCxDQUFuQjtBQVhKLEdBQUE7O0FBQUEsRUFBQSxNQUFBLENBQUEsbUJBQUEsR0FjRSxTQUFBLG1CQUFBLENBQUEsS0FBQSxFQUFnQztBQUM5QixTQUFBLGNBQUEsQ0FBQSxLQUFBLElBQUEsS0FBQTtBQWZKLEdBQUE7O0FBQUEsRUFBQSxNQUFBLENBQUEsYUFBQSxHQWtCRSxTQUFBLGFBQUEsR0FBYTtBQUNYLDRC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LE9BQVIsRUFBa0IsWUFBWSxDQUE5QixPQUFBO0FBQ0Q7QUFDRjs7QUFFRCxTQUFBLE9BQUE7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYXNzZXJ0UHJlc2VudCwgYXNzaWduIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBwYXJzZSwgcGFyc2VXaXRob3V0UHJvY2Vzc2luZyB9IGZyb20gJ0BoYW5kbGViYXJzL3BhcnNlcic7XG5pbXBvcnQgeyBFbnRpdHlQYXJzZXIgfSBmcm9tICdzaW1wbGUtaHRtbC10b2tlbml6ZXInO1xuXG5pbXBvcnQgcHJpbnQgZnJvbSAnLi4vZ2VuZXJhdGlvbi9wcmludCc7XG5pbXBvcnQgeyB2b2lkTWFwIH0gZnJvbSAnLi4vZ2VuZXJhdGlvbi9wcmludGVyJztcbmltcG9ydCB7IFRhZyB9IGZyb20gJy4uL3BhcnNlcic7XG5pbXBvcnQgeyBTb3VyY2UgfSBmcm9tICcuLi9zb3VyY2Uvc291cmNlJztcbmltcG9ydCB7IFNvdXJjZU9mZnNldCwgU291cmNlU3BhbiB9IGZyb20gJy4uL3NvdXJjZS9zcGFuJztcbmltcG9ydCB7IGdlbmVyYXRlU3ludGF4RXJyb3IgfSBmcm9tICcuLi9zeW50YXgtZXJyb3InO1xuaW1wb3J0IHRyYXZlcnNlIGZyb20gJy4uL3RyYXZlcnNhbC90cmF2ZXJzZSc7XG5pbXBvcnQgeyBOb2RlVmlzaXRvciB9IGZyb20gJy4uL3RyYXZlcnNhbC92aXNpdG9yJztcbmltcG9ydCBXYWxrZXIgZnJvbSAnLi4vdHJhdmVyc2FsL3dhbGtlcic7XG5pbXBvcnQgeyBhcHBlbmRDaGlsZCwgcGFyc2VFbGVtZW50QmxvY2tQYXJhbXMgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgKiBhcyBBU1R2MSBmcm9tICcuLi92MS9hcGknO1xuaW1wb3J0ICogYXMgSEJTIGZyb20gJy4uL3YxL2hhbmRsZWJhcnMtYXN0JztcbmltcG9ydCBiIGZyb20gJy4uL3YxL3BhcnNlci1idWlsZGVycyc7XG5pbXBvcnQgcHVibGljQnVpbGRlciBmcm9tICcuLi92MS9wdWJsaWMtYnVpbGRlcnMnO1xuaW1wb3J0IHsgSGFuZGxlYmFyc05vZGVWaXNpdG9ycyB9IGZyb20gJy4vaGFuZGxlYmFycy1ub2RlLXZpc2l0b3JzJztcblxuZXhwb3J0IGNsYXNzIFRva2VuaXplckV2ZW50SGFuZGxlcnMgZXh0ZW5kcyBIYW5kbGViYXJzTm9kZVZpc2l0b3JzIHtcbiAgcHJpdmF0ZSB0YWdPcGVuTGluZSA9IDA7XG4gIHByaXZhdGUgdGFnT3BlbkNvbHVtbiA9IDA7XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IG51bGw7XG4gIH1cblxuICAvLyBDb21tZW50XG5cbiAgYmVnaW5Db21tZW50KCk6IHZvaWQge1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSBiLmNvbW1lbnQoJycsIHRoaXMuc291cmNlLm9mZnNldEZvcih0aGlzLnRhZ09wZW5MaW5lLCB0aGlzLnRhZ09wZW5Db2x1bW4pKTtcbiAgfVxuXG4gIGFwcGVuZFRvQ29tbWVudERhdGEoY2hhcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jdXJyZW50Q29tbWVudC52YWx1ZSArPSBjaGFyO1xuICB9XG5cbiAgZmluaXNoQ29tbWVudCgpOiB2b2lkIHtcbiAgICBhcHBlbmRDaGlsZCh0aGlzLmN1cnJlbnRFbGVtZW50KCksIHRoaXMuZmluaXNoKHRoaXMuY3VycmVudENvbW1lbnQpKTtcbiAgfVxuXG4gIC8vIERhdGFcblxuICBiZWdpbkRhdGEoKTogdm9pZCB7XG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IGIudGV4dCh7XG4gICAgICBjaGFyczogJycsXG4gICAgICBsb2M6IHRoaXMub2Zmc2V0KCkuY29sbGFwc2VkKCksXG4gICAgfSk7XG4gIH1cblxuICBhcHBlbmRUb0RhdGEoY2hhcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jdXJyZW50RGF0YS5jaGFycyArPSBjaGFyO1xuICB9XG5cbiAgZmluaXNoRGF0YSgpOiB2b2lkIHtcbiAgICB0aGlzLmN1cnJlbnREYXRhLmxvYyA9IHRoaXMuY3VycmVudERhdGEubG9jLndpdGhFbmQodGhpcy5vZmZzZXQoKSk7XG5cbiAgICBhcHBlbmRDaGlsZCh0aGlzLmN1cnJlbnRFbGVtZW50KCksIHRoaXMuY3VycmVudERhdGEpO1xuICB9XG5cbiAgLy8gVGFncyAtIGJhc2ljXG5cbiAgdGFnT3BlbigpOiB2b2lkIHtcbiAgICB0aGlzLnRhZ09wZW5MaW5lID0gdGhpcy50b2tlbml6ZXIubGluZTtcbiAgICB0aGlzLnRhZ09wZW5Db2x1bW4gPSB0aGlzLnRva2VuaXplci5jb2x1bW47XG4gIH1cblxuICBiZWdpblN0YXJ0VGFnKCk6IHZvaWQge1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSB7XG4gICAgICB0eXBlOiAnU3RhcnRUYWcnLFxuICAgICAgbmFtZTogJycsXG4gICAgICBhdHRyaWJ1dGVzOiBbXSxcbiAgICAgIG1vZGlmaWVyczogW10sXG4gICAgICBjb21tZW50czogW10sXG4gICAgICBzZWxmQ2xvc2luZzogZmFsc2UsXG4gICAgICBsb2M6IHRoaXMuc291cmNlLm9mZnNldEZvcih0aGlzLnRhZ09wZW5MaW5lLCB0aGlzLnRhZ09wZW5Db2x1bW4pLFxuICAgIH07XG4gIH1cblxuICBiZWdpbkVuZFRhZygpOiB2b2lkIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0ge1xuICAgICAgdHlwZTogJ0VuZFRhZycsXG4gICAgICBuYW1lOiAnJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFtdLFxuICAgICAgbW9kaWZpZXJzOiBbXSxcbiAgICAgIGNvbW1lbnRzOiBbXSxcbiAgICAgIHNlbGZDbG9zaW5nOiBmYWxzZSxcbiAgICAgIGxvYzogdGhpcy5zb3VyY2Uub2Zmc2V0Rm9yKHRoaXMudGFnT3BlbkxpbmUsIHRoaXMudGFnT3BlbkNvbHVtbiksXG4gICAgfTtcbiAgfVxuXG4gIGZpbmlzaFRhZygpOiB2b2lkIHtcbiAgICBsZXQgdGFnID0gdGhpcy5maW5pc2godGhpcy5jdXJyZW50VGFnKTtcblxuICAgIGlmICh0YWcudHlwZSA9PT0gJ1N0YXJ0VGFnJykge1xuICAgICAgdGhpcy5maW5pc2hTdGFydFRhZygpO1xuXG4gICAgICBpZiAodGFnLm5hbWUgPT09ICc6Jykge1xuICAgICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKFxuICAgICAgICAgICdJbnZhbGlkIG5hbWVkIGJsb2NrIG5hbWVkIGRldGVjdGVkLCB5b3UgbWF5IGhhdmUgY3JlYXRlZCBhIG5hbWVkIGJsb2NrIHdpdGhvdXQgYSBuYW1lLCBvciB5b3UgbWF5IGhhdmUgYmVnYW4geW91ciBuYW1lIHdpdGggYSBudW1iZXIuIE5hbWVkIGJsb2NrcyBtdXN0IGhhdmUgbmFtZXMgdGhhdCBhcmUgYXQgbGVhc3Qgb25lIGNoYXJhY3RlciBsb25nLCBhbmQgYmVnaW4gd2l0aCBhIGxvd2VyIGNhc2UgbGV0dGVyJyxcbiAgICAgICAgICB0aGlzLnNvdXJjZS5zcGFuRm9yKHtcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmN1cnJlbnRUYWcubG9jLnRvSlNPTigpLFxuICAgICAgICAgICAgZW5kOiB0aGlzLm9mZnNldCgpLnRvSlNPTigpLFxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGlmICh2b2lkTWFwW3RhZy5uYW1lXSB8fCB0YWcuc2VsZkNsb3NpbmcpIHtcbiAgICAgICAgdGhpcy5maW5pc2hFbmRUYWcodHJ1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0YWcudHlwZSA9PT0gJ0VuZFRhZycpIHtcbiAgICAgIHRoaXMuZmluaXNoRW5kVGFnKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBmaW5pc2hTdGFydFRhZygpOiB2b2lkIHtcbiAgICBsZXQgeyBuYW1lLCBhdHRyaWJ1dGVzOiBhdHRycywgbW9kaWZpZXJzLCBjb21tZW50cywgc2VsZkNsb3NpbmcsIGxvYyB9ID0gdGhpcy5maW5pc2goXG4gICAgICB0aGlzLmN1cnJlbnRTdGFydFRhZ1xuICAgICk7XG5cbiAgICBsZXQgZWxlbWVudCA9IGIuZWxlbWVudCh7XG4gICAgICB0YWc6IG5hbWUsXG4gICAgICBzZWxmQ2xvc2luZyxcbiAgICAgIGF0dHJzLFxuICAgICAgbW9kaWZpZXJzLFxuICAgICAgY29tbWVudHMsXG4gICAgICBjaGlsZHJlbjogW10sXG4gICAgICBibG9ja1BhcmFtczogW10sXG4gICAgICBsb2MsXG4gICAgfSk7XG4gICAgdGhpcy5lbGVtZW50U3RhY2sucHVzaChlbGVtZW50KTtcbiAgfVxuXG4gIGZpbmlzaEVuZFRhZyhpc1ZvaWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBsZXQgdGFnID0gdGhpcy5maW5pc2godGhpcy5jdXJyZW50VGFnKTtcblxuICAgIGxldCBlbGVtZW50ID0gdGhpcy5lbGVtZW50U3RhY2sucG9wKCkgYXMgQVNUdjEuRWxlbWVudE5vZGU7XG4gICAgbGV0IHBhcmVudCA9IHRoaXMuY3VycmVudEVsZW1lbnQoKTtcblxuICAgIHRoaXMudmFsaWRhdGVFbmRUYWcodGFnLCBlbGVtZW50LCBpc1ZvaWQpO1xuXG4gICAgZWxlbWVudC5sb2MgPSBlbGVtZW50LmxvYy53aXRoRW5kKHRoaXMub2Zmc2V0KCkpO1xuICAgIHBhcnNlRWxlbWVudEJsb2NrUGFyYW1zKGVsZW1lbnQpO1xuICAgIGFwcGVuZENoaWxkKHBhcmVudCwgZWxlbWVudCk7XG4gIH1cblxuICBtYXJrVGFnQXNTZWxmQ2xvc2luZygpOiB2b2lkIHtcbiAgICB0aGlzLmN1cnJlbnRUYWcuc2VsZkNsb3NpbmcgPSB0cnVlO1xuICB9XG5cbiAgLy8gVGFncyAtIG5hbWVcblxuICBhcHBlbmRUb1RhZ05hbWUoY2hhcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jdXJyZW50VGFnLm5hbWUgKz0gY2hhcjtcbiAgfVxuXG4gIC8vIFRhZ3MgLSBhdHRyaWJ1dGVzXG5cbiAgYmVnaW5BdHRyaWJ1dGUoKTogdm9pZCB7XG4gICAgbGV0IG9mZnNldCA9IHRoaXMub2Zmc2V0KCk7XG5cbiAgICB0aGlzLmN1cnJlbnRBdHRyaWJ1dGUgPSB7XG4gICAgICBuYW1lOiAnJyxcbiAgICAgIHBhcnRzOiBbXSxcbiAgICAgIGN1cnJlbnRQYXJ0OiBudWxsLFxuICAgICAgaXNRdW90ZWQ6IGZhbHNlLFxuICAgICAgaXNEeW5hbWljOiBmYWxzZSxcbiAgICAgIHN0YXJ0OiBvZmZzZXQsXG4gICAgICB2YWx1ZVNwYW46IG9mZnNldC5jb2xsYXBzZWQoKSxcbiAgICB9O1xuICB9XG5cbiAgYXBwZW5kVG9BdHRyaWJ1dGVOYW1lKGNoYXI6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY3VycmVudEF0dHIubmFtZSArPSBjaGFyO1xuICB9XG5cbiAgYmVnaW5BdHRyaWJ1dGVWYWx1ZShpc1F1b3RlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuY3VycmVudEF0dHIuaXNRdW90ZWQgPSBpc1F1b3RlZDtcbiAgICB0aGlzLnN0YXJ0VGV4dFBhcnQoKTtcbiAgICB0aGlzLmN1cnJlbnRBdHRyLnZhbHVlU3BhbiA9IHRoaXMub2Zmc2V0KCkuY29sbGFwc2VkKCk7XG4gIH1cblxuICBhcHBlbmRUb0F0dHJpYnV0ZVZhbHVlKGNoYXI6IHN0cmluZyk6IHZvaWQge1xuICAgIGxldCBwYXJ0cyA9IHRoaXMuY3VycmVudEF0dHIucGFydHM7XG4gICAgbGV0IGxhc3RQYXJ0ID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XG5cbiAgICBsZXQgY3VycmVudCA9IHRoaXMuY3VycmVudEF0dHIuY3VycmVudFBhcnQ7XG5cbiAgICBpZiAoY3VycmVudCkge1xuICAgICAgY3VycmVudC5jaGFycyArPSBjaGFyO1xuXG4gICAgICAvLyB1cGRhdGUgZW5kIGxvY2F0aW9uIGZvciBlYWNoIGFkZGVkIGNoYXJcbiAgICAgIGN1cnJlbnQubG9jID0gY3VycmVudC5sb2Mud2l0aEVuZCh0aGlzLm9mZnNldCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gaW5pdGlhbGx5IGFzc3VtZSB0aGUgdGV4dCBub2RlIGlzIGEgc2luZ2xlIGNoYXJcbiAgICAgIGxldCBsb2M6IFNvdXJjZU9mZnNldCA9IHRoaXMub2Zmc2V0KCk7XG5cbiAgICAgIC8vIHRoZSB0b2tlbml6ZXIgbGluZS9jb2x1bW4gaGF2ZSBhbHJlYWR5IGJlZW4gYWR2YW5jZWQsIGNvcnJlY3QgbG9jYXRpb24gaW5mb1xuICAgICAgaWYgKGNoYXIgPT09ICdcXG4nKSB7XG4gICAgICAgIGxvYyA9IGxhc3RQYXJ0ID8gbGFzdFBhcnQubG9jLmdldEVuZCgpIDogdGhpcy5jdXJyZW50QXR0ci52YWx1ZVNwYW4uZ2V0U3RhcnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvYyA9IGxvYy5tb3ZlKC0xKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jdXJyZW50QXR0ci5jdXJyZW50UGFydCA9IGIudGV4dCh7IGNoYXJzOiBjaGFyLCBsb2M6IGxvYy5jb2xsYXBzZWQoKSB9KTtcbiAgICB9XG4gIH1cblxuICBmaW5pc2hBdHRyaWJ1dGVWYWx1ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmZpbmFsaXplVGV4dFBhcnQoKTtcblxuICAgIGxldCB0YWcgPSB0aGlzLmN1cnJlbnRUYWc7XG4gICAgbGV0IHRva2VuaXplclBvcyA9IHRoaXMub2Zmc2V0KCk7XG5cbiAgICBpZiAodGFnLnR5cGUgPT09ICdFbmRUYWcnKSB7XG4gICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKFxuICAgICAgICBgSW52YWxpZCBlbmQgdGFnOiBjbG9zaW5nIHRhZyBtdXN0IG5vdCBoYXZlIGF0dHJpYnV0ZXNgLFxuICAgICAgICB0aGlzLnNvdXJjZS5zcGFuRm9yKHsgc3RhcnQ6IHRhZy5sb2MudG9KU09OKCksIGVuZDogdG9rZW5pemVyUG9zLnRvSlNPTigpIH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCB7IG5hbWUsIHBhcnRzLCBzdGFydCwgaXNRdW90ZWQsIGlzRHluYW1pYywgdmFsdWVTcGFuIH0gPSB0aGlzLmN1cnJlbnRBdHRyO1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuYXNzZW1ibGVBdHRyaWJ1dGVWYWx1ZShwYXJ0cywgaXNRdW90ZWQsIGlzRHluYW1pYywgc3RhcnQudW50aWwodG9rZW5pemVyUG9zKSk7XG4gICAgdmFsdWUubG9jID0gdmFsdWVTcGFuLndpdGhFbmQodG9rZW5pemVyUG9zKTtcblxuICAgIGxldCBhdHRyaWJ1dGUgPSBiLmF0dHIoeyBuYW1lLCB2YWx1ZSwgbG9jOiBzdGFydC51bnRpbCh0b2tlbml6ZXJQb3MpIH0pO1xuXG4gICAgdGhpcy5jdXJyZW50U3RhcnRUYWcuYXR0cmlidXRlcy5wdXNoKGF0dHJpYnV0ZSk7XG4gIH1cblxuICByZXBvcnRTeW50YXhFcnJvcihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKG1lc3NhZ2UsIHRoaXMub2Zmc2V0KCkuY29sbGFwc2VkKCkpO1xuICB9XG5cbiAgYXNzZW1ibGVDb25jYXRlbmF0ZWRWYWx1ZShcbiAgICBwYXJ0czogKEFTVHYxLk11c3RhY2hlU3RhdGVtZW50IHwgQVNUdjEuVGV4dE5vZGUpW11cbiAgKTogQVNUdjEuQ29uY2F0U3RhdGVtZW50IHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgcGFydDogQVNUdjEuQmFzZU5vZGUgPSBwYXJ0c1tpXTtcblxuICAgICAgaWYgKHBhcnQudHlwZSAhPT0gJ011c3RhY2hlU3RhdGVtZW50JyAmJiBwYXJ0LnR5cGUgIT09ICdUZXh0Tm9kZScpIHtcbiAgICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgICAnVW5zdXBwb3J0ZWQgbm9kZSBpbiBxdW90ZWQgYXR0cmlidXRlIHZhbHVlOiAnICsgcGFydFsndHlwZSddLFxuICAgICAgICAgIHBhcnQubG9jXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYXNzZXJ0UHJlc2VudChwYXJ0cywgYHRoZSBjb25jYXRlbmF0aW9uIHBhcnRzIG9mIGFuIGVsZW1lbnQgc2hvdWxkIG5vdCBiZSBlbXB0eWApO1xuXG4gICAgbGV0IGZpcnN0ID0gcGFydHNbMF07XG4gICAgbGV0IGxhc3QgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXTtcblxuICAgIHJldHVybiBiLmNvbmNhdChwYXJ0cywgdGhpcy5zb3VyY2Uuc3BhbkZvcihmaXJzdC5sb2MpLmV4dGVuZCh0aGlzLnNvdXJjZS5zcGFuRm9yKGxhc3QubG9jKSkpO1xuICB9XG5cbiAgdmFsaWRhdGVFbmRUYWcoXG4gICAgdGFnOiBUYWc8J1N0YXJ0VGFnJyB8ICdFbmRUYWcnPixcbiAgICBlbGVtZW50OiBBU1R2MS5FbGVtZW50Tm9kZSxcbiAgICBzZWxmQ2xvc2luZzogYm9vbGVhblxuICApOiB2b2lkIHtcbiAgICBsZXQgZXJyb3I7XG5cbiAgICBpZiAodm9pZE1hcFt0YWcubmFtZV0gJiYgIXNlbGZDbG9zaW5nKSB7XG4gICAgICAvLyBFbmdUYWcgaXMgYWxzbyBjYWxsZWQgYnkgU3RhcnRUYWcgZm9yIHZvaWQgYW5kIHNlbGYtY2xvc2luZyB0YWdzIChpLmUuXG4gICAgICAvLyA8aW5wdXQ+IG9yIDxiciAvPiwgc28gd2UgbmVlZCB0byBjaGVjayBmb3IgdGhhdCBoZXJlLiBPdGhlcndpc2UsIHdlIHdvdWxkXG4gICAgICAvLyB0aHJvdyBhbiBlcnJvciBmb3IgdGhvc2UgY2FzZXMuXG4gICAgICBlcnJvciA9IGA8JHt0YWcubmFtZX0+IGVsZW1lbnRzIGRvIG5vdCBuZWVkIGVuZCB0YWdzLiBZb3Ugc2hvdWxkIHJlbW92ZSBpdGA7XG4gICAgfSBlbHNlIGlmIChlbGVtZW50LnRhZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvciA9IGBDbG9zaW5nIHRhZyA8LyR7dGFnLm5hbWV9PiB3aXRob3V0IGFuIG9wZW4gdGFnYDtcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnQudGFnICE9PSB0YWcubmFtZSkge1xuICAgICAgZXJyb3IgPSBgQ2xvc2luZyB0YWcgPC8ke3RhZy5uYW1lfT4gZGlkIG5vdCBtYXRjaCBsYXN0IG9wZW4gdGFnIDwke2VsZW1lbnQudGFnfT4gKG9uIGxpbmUgJHtlbGVtZW50LmxvYy5zdGFydFBvc2l0aW9uLmxpbmV9KWA7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yKSB7XG4gICAgICB0aHJvdyBnZW5lcmF0ZVN5bnRheEVycm9yKGVycm9yLCB0YWcubG9jKTtcbiAgICB9XG4gIH1cblxuICBhc3NlbWJsZUF0dHJpYnV0ZVZhbHVlKFxuICAgIHBhcnRzOiAoQVNUdjEuTXVzdGFjaGVTdGF0ZW1lbnQgfCBBU1R2MS5UZXh0Tm9kZSlbXSxcbiAgICBpc1F1b3RlZDogYm9vbGVhbixcbiAgICBpc0R5bmFtaWM6IGJvb2xlYW4sXG4gICAgc3BhbjogU291cmNlU3BhblxuICApOiBBU1R2MS5Db25jYXRTdGF0ZW1lbnQgfCBBU1R2MS5NdXN0YWNoZVN0YXRlbWVudCB8IEFTVHYxLlRleHROb2RlIHtcbiAgICBpZiAoaXNEeW5hbWljKSB7XG4gICAgICBpZiAoaXNRdW90ZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXNzZW1ibGVDb25jYXRlbmF0ZWRWYWx1ZShwYXJ0cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgcGFydHMubGVuZ3RoID09PSAxIHx8XG4gICAgICAgICAgKHBhcnRzLmxlbmd0aCA9PT0gMiAmJlxuICAgICAgICAgICAgcGFydHNbMV0udHlwZSA9PT0gJ1RleHROb2RlJyAmJlxuICAgICAgICAgICAgKHBhcnRzWzFdIGFzIEFTVHYxLlRleHROb2RlKS5jaGFycyA9PT0gJy8nKVxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4gcGFydHNbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgZ2VuZXJhdGVTeW50YXhFcnJvcihcbiAgICAgICAgICAgIGBBbiB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUgbXVzdCBiZSBhIHN0cmluZyBvciBhIG11c3RhY2hlLCBgICtcbiAgICAgICAgICAgICAgYHByZWNlZGVkIGJ5IHdoaXRlc3BhY2Ugb3IgYSAnPScgY2hhcmFjdGVyLCBhbmQgYCArXG4gICAgICAgICAgICAgIGBmb2xsb3dlZCBieSB3aGl0ZXNwYWNlLCBhICc+JyBjaGFyYWN0ZXIsIG9yICcvPidgLFxuICAgICAgICAgICAgc3BhblxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHBhcnRzLmxlbmd0aCA+IDAgPyBwYXJ0c1swXSA6IGIudGV4dCh7IGNoYXJzOiAnJywgbG9jOiBzcGFuIH0pO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAgQVNUUGx1Z2lucyBjYW4gbWFrZSBjaGFuZ2VzIHRvIHRoZSBHbGltbWVyIHRlbXBsYXRlIEFTVCBiZWZvcmVcbiAgY29tcGlsYXRpb24gYmVnaW5zLlxuKi9cbmV4cG9ydCBpbnRlcmZhY2UgQVNUUGx1Z2luQnVpbGRlcjxURW52IGV4dGVuZHMgQVNUUGx1Z2luRW52aXJvbm1lbnQgPSBBU1RQbHVnaW5FbnZpcm9ubWVudD4ge1xuICAoZW52OiBURW52KTogQVNUUGx1Z2luO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFTVFBsdWdpbiB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmlzaXRvcjogTm9kZVZpc2l0b3I7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQVNUUGx1Z2luRW52aXJvbm1lbnQge1xuICBtZXRhPzogb2JqZWN0O1xuICBzeW50YXg6IFN5bnRheDtcbn1cblxuaW50ZXJmYWNlIEhhbmRsZWJhcnNQYXJzZU9wdGlvbnMge1xuICBzcmNOYW1lPzogc3RyaW5nO1xuICBpZ25vcmVTdGFuZGFsb25lPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZUlkRm4ge1xuICAoc3JjOiBzdHJpbmcpOiBPcHRpb248c3RyaW5nPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcmVjb21waWxlT3B0aW9ucyBleHRlbmRzIFByZXByb2Nlc3NPcHRpb25zIHtcbiAgaWQ/OiBUZW1wbGF0ZUlkRm47XG4gIGN1c3RvbWl6ZUNvbXBvbmVudE5hbWU/KGlucHV0OiBzdHJpbmcpOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJlcHJvY2Vzc09wdGlvbnMge1xuICBzdHJpY3RNb2RlPzogYm9vbGVhbjtcbiAgbG9jYWxzPzogc3RyaW5nW107XG4gIG1ldGE/OiB7XG4gICAgbW9kdWxlTmFtZT86IHN0cmluZztcbiAgfTtcbiAgcGx1Z2lucz86IHtcbiAgICBhc3Q/OiBBU1RQbHVnaW5CdWlsZGVyW107XG4gIH07XG4gIHBhcnNlT3B0aW9ucz86IEhhbmRsZWJhcnNQYXJzZU9wdGlvbnM7XG4gIGN1c3RvbWl6ZUNvbXBvbmVudE5hbWU/KGlucHV0OiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAgVXNlZnVsIGZvciBzcGVjaWZ5aW5nIGEgZ3JvdXAgb2Ygb3B0aW9ucyB0b2dldGhlci5cblxuICAgIFdoZW4gYCdjb2RlbW9kJ2Agd2UgZGlzYWJsZSBhbGwgd2hpdGVzcGFjZSBjb250cm9sIGluIGhhbmRsZWJhcnNcbiAgICAodG8gcHJlc2VydmUgYXMgbXVjaCBhcyBwb3NzaWJsZSkgYW5kIHdlIGFsc28gYXZvaWQgYW55XG4gICAgZXNjYXBpbmcvdW5lc2NhcGluZyBvZiBIVE1MIGVudGl0eSBjb2Rlcy5cbiAgICovXG4gIG1vZGU/OiAnY29kZW1vZCcgfCAncHJlY29tcGlsZSc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3ludGF4IHtcbiAgcGFyc2U6IHR5cGVvZiBwcmVwcm9jZXNzO1xuICBidWlsZGVyczogdHlwZW9mIHB1YmxpY0J1aWxkZXI7XG4gIHByaW50OiB0eXBlb2YgcHJpbnQ7XG4gIHRyYXZlcnNlOiB0eXBlb2YgdHJhdmVyc2U7XG4gIFdhbGtlcjogdHlwZW9mIFdhbGtlcjtcbn1cblxuY29uc3Qgc3ludGF4OiBTeW50YXggPSB7XG4gIHBhcnNlOiBwcmVwcm9jZXNzLFxuICBidWlsZGVyczogcHVibGljQnVpbGRlcixcbiAgcHJpbnQsXG4gIHRyYXZlcnNlLFxuICBXYWxrZXIsXG59O1xuXG5jbGFzcyBDb2RlbW9kRW50aXR5UGFyc2VyIGV4dGVuZHMgRW50aXR5UGFyc2VyIHtcbiAgLy8gbWF0Y2ggdXBzdHJlYW0gdHlwZXMsIGJ1dCBuZXZlciBtYXRjaCBhbiBlbnRpdHlcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoe30pO1xuICB9XG5cbiAgcGFyc2UoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVwcm9jZXNzKFxuICBpbnB1dDogc3RyaW5nIHwgU291cmNlIHwgSEJTLlByb2dyYW0sXG4gIG9wdGlvbnM6IFByZXByb2Nlc3NPcHRpb25zID0ge31cbik6IEFTVHYxLlRlbXBsYXRlIHtcbiAgbGV0IG1vZGUgPSBvcHRpb25zLm1vZGUgfHwgJ3ByZWNvbXBpbGUnO1xuXG4gIGxldCBzb3VyY2U6IFNvdXJjZTtcbiAgbGV0IGFzdDogSEJTLlByb2dyYW07XG4gIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgc291cmNlID0gbmV3IFNvdXJjZShpbnB1dCwgb3B0aW9ucy5tZXRhPy5tb2R1bGVOYW1lKTtcblxuICAgIGlmIChtb2RlID09PSAnY29kZW1vZCcpIHtcbiAgICAgIGFzdCA9IHBhcnNlV2l0aG91dFByb2Nlc3NpbmcoaW5wdXQsIG9wdGlvbnMucGFyc2VPcHRpb25zKSBhcyBIQlMuUHJvZ3JhbTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXN0ID0gcGFyc2UoaW5wdXQsIG9wdGlvbnMucGFyc2VPcHRpb25zKSBhcyBIQlMuUHJvZ3JhbTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaW5wdXQgaW5zdGFuY2VvZiBTb3VyY2UpIHtcbiAgICBzb3VyY2UgPSBpbnB1dDtcblxuICAgIGlmIChtb2RlID09PSAnY29kZW1vZCcpIHtcbiAgICAgIGFzdCA9IHBhcnNlV2l0aG91dFByb2Nlc3NpbmcoaW5wdXQuc291cmNlLCBvcHRpb25zLnBhcnNlT3B0aW9ucykgYXMgSEJTLlByb2dyYW07XG4gICAgfSBlbHNlIHtcbiAgICAgIGFzdCA9IHBhcnNlKGlucHV0LnNvdXJjZSwgb3B0aW9ucy5wYXJzZU9wdGlvbnMpIGFzIEhCUy5Qcm9ncmFtO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBzb3VyY2UgPSBuZXcgU291cmNlKCcnLCBvcHRpb25zLm1ldGE/Lm1vZHVsZU5hbWUpO1xuICAgIGFzdCA9IGlucHV0O1xuICB9XG5cbiAgbGV0IGVudGl0eVBhcnNlciA9IHVuZGVmaW5lZDtcbiAgaWYgKG1vZGUgPT09ICdjb2RlbW9kJykge1xuICAgIGVudGl0eVBhcnNlciA9IG5ldyBDb2RlbW9kRW50aXR5UGFyc2VyKCk7XG4gIH1cblxuICBsZXQgb2Zmc2V0cyA9IFNvdXJjZVNwYW4uZm9yQ2hhclBvc2l0aW9ucyhzb3VyY2UsIDAsIHNvdXJjZS5zb3VyY2UubGVuZ3RoKTtcbiAgYXN0LmxvYyA9IHtcbiAgICBzb3VyY2U6ICcocHJvZ3JhbSknLFxuICAgIHN0YXJ0OiBvZmZzZXRzLnN0YXJ0UG9zaXRpb24sXG4gICAgZW5kOiBvZmZzZXRzLmVuZFBvc2l0aW9uLFxuICB9O1xuXG4gIGxldCBwcm9ncmFtID0gbmV3IFRva2VuaXplckV2ZW50SGFuZGxlcnMoc291cmNlLCBlbnRpdHlQYXJzZXIsIG1vZGUpLmFjY2VwdFRlbXBsYXRlKGFzdCk7XG5cbiAgaWYgKG9wdGlvbnMuc3RyaWN0TW9kZSkge1xuICAgIHByb2dyYW0uYmxvY2tQYXJhbXMgPSBvcHRpb25zLmxvY2FscyA/PyBbXTtcbiAgfVxuXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMucGx1Z2lucyAmJiBvcHRpb25zLnBsdWdpbnMuYXN0KSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSBvcHRpb25zLnBsdWdpbnMuYXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgbGV0IHRyYW5zZm9ybSA9IG9wdGlvbnMucGx1Z2lucy5hc3RbaV07XG4gICAgICBsZXQgZW52OiBBU1RQbHVnaW5FbnZpcm9ubWVudCA9IGFzc2lnbih7fSwgb3B0aW9ucywgeyBzeW50YXggfSwgeyBwbHVnaW5zOiB1bmRlZmluZWQgfSk7XG5cbiAgICAgIGxldCBwbHVnaW5SZXN1bHQgPSB0cmFuc2Zvcm0oZW52KTtcblxuICAgICAgdHJhdmVyc2UocHJvZ3JhbSwgcGx1Z2luUmVzdWx0LnZpc2l0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwcm9ncmFtO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==