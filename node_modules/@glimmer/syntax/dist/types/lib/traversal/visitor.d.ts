import * as ASTv1 from '../v1/api';
import { VisitorKey } from '../v1/visitor-keys';
import WalkerPath from './path';
export interface FullNodeTraversal<N extends ASTv1.Node> {
    enter?(node: N, path: WalkerPath<N>): void;
    exit?(node: N, path: WalkerPath<N>): void;
    keys?: KeysVisitor<N>;
}
export declare type NodeHandler<N extends ASTv1.Node> = (node: N, path: WalkerPath<N>) => void;
export declare type NodeTraversal<N extends ASTv1.Node> = FullNodeTraversal<N> | NodeHandler<N>;
export declare type NodeVisitor = {
    [P in keyof ASTv1.Nodes]?: NodeTraversal<ASTv1.Nodes[P]>;
} & {
    All?: NodeTraversal<ASTv1.Node>;
};
export interface FullKeyTraversal<N extends ASTv1.Node, K extends string> {
    enter?(node: N, key: K): void;
    exit?(node: N, key: K): void;
}
export declare type KeyHandler<N extends ASTv1.Node, K extends VisitorKey<N>> = (node: N, key: K) => void;
export declare type KeyTraversal<N extends ASTv1.Node, K extends VisitorKey<N>> = FullKeyTraversal<N, K> | KeyHandler<N, K>;
export declare type KeysVisitor<N extends ASTv1.Node> = {
    [P in VisitorKey<N>]?: KeyTraversal<N, P>;
} & {
    All?: KeyTraversal<N, VisitorKey<N>>;
};
//# sourceMappingURL=visitor.d.ts.map