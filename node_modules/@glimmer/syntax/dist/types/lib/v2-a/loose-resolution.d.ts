import * as ASTv1 from '../v1/api';
import * as ASTv2 from './api';
export interface AstCallParts {
    path: ASTv1.Expression;
    params: ASTv1.Expression[];
    hash: ASTv1.Hash;
}
export interface VarPath extends ASTv1.PathExpression {
    head: ASTv1.VarHead;
}
export declare function SexpSyntaxContext(node: ASTv1.SubExpression): ASTv2.FreeVarResolution | null;
export declare function ModifierSyntaxContext(node: ASTv1.ElementModifierStatement): ASTv2.FreeVarResolution | null;
export declare function BlockSyntaxContext(node: ASTv1.BlockStatement): ASTv2.FreeVarResolution | null;
export declare function ComponentSyntaxContext(node: ASTv1.PathExpression): ASTv2.FreeVarResolution | null;
/**
 * This corresponds to append positions (text curlies or attribute
 * curlies). In strict mode, this also corresponds to arg curlies.
 */
export declare function AttrValueSyntaxContext(node: ASTv1.MustacheStatement): ASTv2.FreeVarResolution;
/**
 * This corresponds to append positions (text curlies or attribute
 * curlies). In strict mode, this also corresponds to arg curlies.
 */
export declare function AppendSyntaxContext(node: ASTv1.MustacheStatement): ASTv2.FreeVarResolution;
export declare type Resolution<P extends AstCallParts | ASTv1.PathExpression> = (call: P) => ASTv2.FreeVarResolution | null;
//# sourceMappingURL=loose-resolution.d.ts.map