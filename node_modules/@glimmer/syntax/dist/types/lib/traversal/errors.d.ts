import { Option } from '@glimmer/interfaces';
import * as ASTv1 from '../v1/api';
export interface TraversalError extends Error {
    constructor: TraversalErrorConstructor;
    key: string;
    node: ASTv1.Node;
    parent: Option<ASTv1.Node>;
}
export interface TraversalErrorConstructor {
    new (message: string, node: ASTv1.Node, parent: Option<ASTv1.Node>, key: string): TraversalError;
    readonly prototype: TraversalError;
}
declare const TraversalError: TraversalErrorConstructor;
export default TraversalError;
export declare function cannotRemoveNode(node: ASTv1.Node, parent: ASTv1.Node, key: string): TraversalError;
export declare function cannotReplaceNode(node: ASTv1.Node, parent: ASTv1.Node, key: string): TraversalError;
export declare function cannotReplaceOrRemoveInKeyHandlerYet(node: ASTv1.Node, key: string): TraversalError;
//# sourceMappingURL=errors.d.ts.map