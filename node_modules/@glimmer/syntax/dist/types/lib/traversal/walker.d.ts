import { Option } from '@glimmer/interfaces';
import * as ASTv1 from '../v1/api';
export declare type NodeCallback<N extends ASTv1.Node> = (node: N, walker: Walker) => void;
export default class Walker {
    order?: unknown;
    stack: unknown[];
    constructor(order?: unknown);
    visit<N extends ASTv1.Node>(node: Option<N>, callback: NodeCallback<N>): void;
    children<N extends ASTv1.Node>(node: N & ASTv1.Node, callback: NodeCallback<N & ASTv1.Node>): void;
}
//# sourceMappingURL=walker.d.ts.map