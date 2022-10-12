import * as ASTv1 from './v1/api';
import * as HBS from './v1/handlebars-ast';
export declare function parseElementBlockParams(element: ASTv1.ElementNode): void;
export declare function childrenFor(node: ASTv1.Block | ASTv1.Template | ASTv1.ElementNode): ASTv1.TopLevelStatement[];
export declare function appendChild(parent: ASTv1.Block | ASTv1.Template | ASTv1.ElementNode, node: ASTv1.Statement): void;
export declare function isHBSLiteral(path: HBS.Expression): path is HBS.Literal;
export declare function isHBSLiteral(path: ASTv1.Expression): path is ASTv1.Literal;
export declare function printLiteral(literal: ASTv1.Literal): string;
export declare function isUpperCase(tag: string): boolean;
export declare function isLowerCase(tag: string): boolean;
//# sourceMappingURL=utils.d.ts.map