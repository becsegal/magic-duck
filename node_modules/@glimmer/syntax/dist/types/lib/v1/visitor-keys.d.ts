import * as ASTv1 from './api';
declare const visitorKeys: {
    Program: ["body"];
    Template: ["body"];
    Block: ["body"];
    MustacheStatement: ["path", "params", "hash"];
    BlockStatement: ["path", "params", "hash", "program", "inverse"];
    ElementModifierStatement: ["path", "params", "hash"];
    PartialStatement: ["name", "params", "hash"];
    CommentStatement: [];
    MustacheCommentStatement: [];
    ElementNode: ["attributes", "modifiers", "children", "comments"];
    AttrNode: ["value"];
    TextNode: [];
    ConcatStatement: ["parts"];
    SubExpression: ["path", "params", "hash"];
    PathExpression: [];
    PathHead: [];
    StringLiteral: [];
    BooleanLiteral: [];
    NumberLiteral: [];
    NullLiteral: [];
    UndefinedLiteral: [];
    Hash: ["pairs"];
    HashPair: ["value"];
    NamedBlock: ["attributes", "modifiers", "children", "comments"];
    SimpleElement: ["attributes", "modifiers", "children", "comments"];
    Component: ["head", "attributes", "modifiers", "children", "comments"];
};
declare type VisitorKeysMap = typeof visitorKeys;
export declare type VisitorKeys = {
    [P in keyof VisitorKeysMap]: VisitorKeysMap[P][number];
};
export declare type VisitorKey<N extends ASTv1.Node> = VisitorKeys[N['type']] & keyof N;
export default visitorKeys;
//# sourceMappingURL=visitor-keys.d.ts.map