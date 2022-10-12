import * as ASTv2 from '../api';
import type { SerializedAppendContent, SerializedArgReference, SerializedCallExpression, SerializedDeprecatedCallExpression, SerializedFreeVarReference, SerializedGlimmerComment, SerializedHtmlComment, SerializedHtmlText, SerializedInterpolateExpression, SerializedInvokeBlock, SerializedInvokeComponent, SerializedLiteralExpression, SerializedLocalVarReference, SerializedPathExpression, SerializedSimpleElement, SerializedThisReference } from './types';
export declare class RefSerializer {
    arg(ref: ASTv2.ArgReference): SerializedArgReference;
    free(ref: ASTv2.FreeVarReference): SerializedFreeVarReference;
    local(ref: ASTv2.LocalVarReference): SerializedLocalVarReference;
    self(ref: ASTv2.ThisReference): SerializedThisReference;
}
export declare class ExprSerializer {
    literal(literal: ASTv2.LiteralExpression): SerializedLiteralExpression;
    path(path: ASTv2.PathExpression): SerializedPathExpression;
    call(call: ASTv2.CallExpression): SerializedCallExpression;
    deprecatedCall(call: ASTv2.DeprecatedCallExpression): SerializedDeprecatedCallExpression;
    interpolate(interpolate: ASTv2.InterpolateExpression): SerializedInterpolateExpression;
}
export declare class ContentSerializer {
    append(node: ASTv2.AppendContent): SerializedAppendContent;
    glimmerComment(node: ASTv2.GlimmerComment): SerializedGlimmerComment;
    htmlComment(node: ASTv2.HtmlComment): SerializedHtmlComment;
    htmlText(node: ASTv2.HtmlText): SerializedHtmlText;
    invokeBlock(node: ASTv2.InvokeBlock): SerializedInvokeBlock;
    invokeComponent(node: ASTv2.InvokeComponent): SerializedInvokeComponent;
    simpleElement(node: ASTv2.SimpleElement): SerializedSimpleElement;
}
//# sourceMappingURL=serialize.d.ts.map