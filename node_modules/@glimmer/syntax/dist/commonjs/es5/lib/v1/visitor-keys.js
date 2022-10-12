"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = require("@glimmer/util");

// ensure stays in sync with typing
// ParentNode and ChildKey types are derived from VisitorKeysMap
var visitorKeys = {
  Program: (0, _util.tuple)('body'),
  Template: (0, _util.tuple)('body'),
  Block: (0, _util.tuple)('body'),
  MustacheStatement: (0, _util.tuple)('path', 'params', 'hash'),
  BlockStatement: (0, _util.tuple)('path', 'params', 'hash', 'program', 'inverse'),
  ElementModifierStatement: (0, _util.tuple)('path', 'params', 'hash'),
  PartialStatement: (0, _util.tuple)('name', 'params', 'hash'),
  CommentStatement: (0, _util.tuple)(),
  MustacheCommentStatement: (0, _util.tuple)(),
  ElementNode: (0, _util.tuple)('attributes', 'modifiers', 'children', 'comments'),
  AttrNode: (0, _util.tuple)('value'),
  TextNode: (0, _util.tuple)(),
  ConcatStatement: (0, _util.tuple)('parts'),
  SubExpression: (0, _util.tuple)('path', 'params', 'hash'),
  PathExpression: (0, _util.tuple)(),
  PathHead: (0, _util.tuple)(),
  StringLiteral: (0, _util.tuple)(),
  BooleanLiteral: (0, _util.tuple)(),
  NumberLiteral: (0, _util.tuple)(),
  NullLiteral: (0, _util.tuple)(),
  UndefinedLiteral: (0, _util.tuple)(),
  Hash: (0, _util.tuple)('pairs'),
  HashPair: (0, _util.tuple)('value'),
  // v2 new nodes
  NamedBlock: (0, _util.tuple)('attributes', 'modifiers', 'children', 'comments'),
  SimpleElement: (0, _util.tuple)('attributes', 'modifiers', 'children', 'comments'),
  Component: (0, _util.tuple)('head', 'attributes', 'modifiers', 'children', 'comments')
};
var _default = visitorKeys;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjEvdmlzaXRvci1rZXlzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFJQTtBQUNBO0FBQ0EsSUFBTSxXQUFXLEdBQUc7QUFDbEIsRUFBQSxPQUFPLEVBQUUsaUJBRFMsTUFDVCxDQURTO0FBRWxCLEVBQUEsUUFBUSxFQUFFLGlCQUZRLE1BRVIsQ0FGUTtBQUdsQixFQUFBLEtBQUssRUFBRSxpQkFIVyxNQUdYLENBSFc7QUFLbEIsRUFBQSxpQkFBaUIsRUFBRSxpQkFBSyxNQUFMLEVBQUssUUFBTCxFQUxELE1BS0MsQ0FMRDtBQU1sQixFQUFBLGNBQWMsRUFBRSxpQkFBSyxNQUFMLEVBQUssUUFBTCxFQUFLLE1BQUwsRUFBSyxTQUFMLEVBTkUsU0FNRixDQU5FO0FBT2xCLEVBQUEsd0JBQXdCLEVBQUUsaUJBQUssTUFBTCxFQUFLLFFBQUwsRUFQUixNQU9RLENBUFI7QUFRbEIsRUFBQSxnQkFBZ0IsRUFBRSxpQkFBSyxNQUFMLEVBQUssUUFBTCxFQVJBLE1BUUEsQ0FSQTtBQVNsQixFQUFBLGdCQUFnQixFQVRFLGtCQUFBO0FBVWxCLEVBQUEsd0JBQXdCLEVBVk4sa0JBQUE7QUFXbEIsRUFBQSxXQUFXLEVBQUUsaUJBQUssWUFBTCxFQUFLLFdBQUwsRUFBSyxVQUFMLEVBWEssVUFXTCxDQVhLO0FBWWxCLEVBQUEsUUFBUSxFQUFFLGlCQVpRLE9BWVIsQ0FaUTtBQWFsQixFQUFBLFFBQVEsRUFiVSxrQkFBQTtBQWVsQixFQUFBLGVBQWUsRUFBRSxpQkFmQyxPQWVELENBZkM7QUFnQmxCLEVBQUEsYUFBYSxFQUFFLGlCQUFLLE1BQUwsRUFBSyxRQUFMLEVBaEJHLE1BZ0JILENBaEJHO0FBaUJsQixFQUFBLGNBQWMsRUFqQkksa0JBQUE7QUFrQmxCLEVBQUEsUUFBUSxFQWxCVSxrQkFBQTtBQW9CbEIsRUFBQSxhQUFhLEVBcEJLLGtCQUFBO0FBcUJsQixFQUFBLGNBQWMsRUFyQkksa0JBQUE7QUFzQmxCLEVBQUEsYUFBYSxFQXRCSyxrQkFBQTtBQXVCbEIsRUFBQSxXQUFXLEVBdkJPLGtCQUFBO0FBd0JsQixFQUFBLGdCQUFnQixFQXhCRSxrQkFBQTtBQTBCbEIsRUFBQSxJQUFJLEVBQUUsaUJBMUJZLE9BMEJaLENBMUJZO0FBMkJsQixFQUFBLFFBQVEsRUFBRSxpQkEzQlEsT0EyQlIsQ0EzQlE7QUE2QmxCO0FBQ0EsRUFBQSxVQUFVLEVBQUUsaUJBQUssWUFBTCxFQUFLLFdBQUwsRUFBSyxVQUFMLEVBOUJNLFVBOEJOLENBOUJNO0FBK0JsQixFQUFBLGFBQWEsRUFBRSxpQkFBSyxZQUFMLEVBQUssV0FBTCxFQUFLLFVBQUwsRUEvQkcsVUErQkgsQ0EvQkc7QUFnQ2xCLEVBQUEsU0FBUyxFQUFFLGlCQUFLLE1BQUwsRUFBSyxZQUFMLEVBQUssV0FBTCxFQUFLLFVBQUwsRUFBSyxVQUFMO0FBaENPLENBQXBCO2VBd0NBLFciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB0dXBsZSB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuXG5pbXBvcnQgKiBhcyBBU1R2MSBmcm9tICcuL2FwaSc7XG5cbi8vIGVuc3VyZSBzdGF5cyBpbiBzeW5jIHdpdGggdHlwaW5nXG4vLyBQYXJlbnROb2RlIGFuZCBDaGlsZEtleSB0eXBlcyBhcmUgZGVyaXZlZCBmcm9tIFZpc2l0b3JLZXlzTWFwXG5jb25zdCB2aXNpdG9yS2V5cyA9IHtcbiAgUHJvZ3JhbTogdHVwbGUoJ2JvZHknKSxcbiAgVGVtcGxhdGU6IHR1cGxlKCdib2R5JyksXG4gIEJsb2NrOiB0dXBsZSgnYm9keScpLFxuXG4gIE11c3RhY2hlU3RhdGVtZW50OiB0dXBsZSgncGF0aCcsICdwYXJhbXMnLCAnaGFzaCcpLFxuICBCbG9ja1N0YXRlbWVudDogdHVwbGUoJ3BhdGgnLCAncGFyYW1zJywgJ2hhc2gnLCAncHJvZ3JhbScsICdpbnZlcnNlJyksXG4gIEVsZW1lbnRNb2RpZmllclN0YXRlbWVudDogdHVwbGUoJ3BhdGgnLCAncGFyYW1zJywgJ2hhc2gnKSxcbiAgUGFydGlhbFN0YXRlbWVudDogdHVwbGUoJ25hbWUnLCAncGFyYW1zJywgJ2hhc2gnKSxcbiAgQ29tbWVudFN0YXRlbWVudDogdHVwbGUoKSxcbiAgTXVzdGFjaGVDb21tZW50U3RhdGVtZW50OiB0dXBsZSgpLFxuICBFbGVtZW50Tm9kZTogdHVwbGUoJ2F0dHJpYnV0ZXMnLCAnbW9kaWZpZXJzJywgJ2NoaWxkcmVuJywgJ2NvbW1lbnRzJyksXG4gIEF0dHJOb2RlOiB0dXBsZSgndmFsdWUnKSxcbiAgVGV4dE5vZGU6IHR1cGxlKCksXG5cbiAgQ29uY2F0U3RhdGVtZW50OiB0dXBsZSgncGFydHMnKSxcbiAgU3ViRXhwcmVzc2lvbjogdHVwbGUoJ3BhdGgnLCAncGFyYW1zJywgJ2hhc2gnKSxcbiAgUGF0aEV4cHJlc3Npb246IHR1cGxlKCksXG4gIFBhdGhIZWFkOiB0dXBsZSgpLFxuXG4gIFN0cmluZ0xpdGVyYWw6IHR1cGxlKCksXG4gIEJvb2xlYW5MaXRlcmFsOiB0dXBsZSgpLFxuICBOdW1iZXJMaXRlcmFsOiB0dXBsZSgpLFxuICBOdWxsTGl0ZXJhbDogdHVwbGUoKSxcbiAgVW5kZWZpbmVkTGl0ZXJhbDogdHVwbGUoKSxcblxuICBIYXNoOiB0dXBsZSgncGFpcnMnKSxcbiAgSGFzaFBhaXI6IHR1cGxlKCd2YWx1ZScpLFxuXG4gIC8vIHYyIG5ldyBub2Rlc1xuICBOYW1lZEJsb2NrOiB0dXBsZSgnYXR0cmlidXRlcycsICdtb2RpZmllcnMnLCAnY2hpbGRyZW4nLCAnY29tbWVudHMnKSxcbiAgU2ltcGxlRWxlbWVudDogdHVwbGUoJ2F0dHJpYnV0ZXMnLCAnbW9kaWZpZXJzJywgJ2NoaWxkcmVuJywgJ2NvbW1lbnRzJyksXG4gIENvbXBvbmVudDogdHVwbGUoJ2hlYWQnLCAnYXR0cmlidXRlcycsICdtb2RpZmllcnMnLCAnY2hpbGRyZW4nLCAnY29tbWVudHMnKSxcbn07XG5cbnR5cGUgVmlzaXRvcktleXNNYXAgPSB0eXBlb2YgdmlzaXRvcktleXM7XG5cbmV4cG9ydCB0eXBlIFZpc2l0b3JLZXlzID0geyBbUCBpbiBrZXlvZiBWaXNpdG9yS2V5c01hcF06IFZpc2l0b3JLZXlzTWFwW1BdW251bWJlcl0gfTtcbmV4cG9ydCB0eXBlIFZpc2l0b3JLZXk8TiBleHRlbmRzIEFTVHYxLk5vZGU+ID0gVmlzaXRvcktleXNbTlsndHlwZSddXSAmIGtleW9mIE47XG5cbmV4cG9ydCBkZWZhdWx0IHZpc2l0b3JLZXlzO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==