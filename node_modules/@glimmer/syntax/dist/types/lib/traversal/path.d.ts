import * as ASTv1 from '../v1/api';
export default class WalkerPath<N extends ASTv1.Node> {
    node: N;
    parent: WalkerPath<ASTv1.Node> | null;
    parentKey: string | null;
    constructor(node: N, parent?: WalkerPath<ASTv1.Node> | null, parentKey?: string | null);
    get parentNode(): ASTv1.Node | null;
    parents(): Iterable<WalkerPath<ASTv1.Node> | null>;
}
//# sourceMappingURL=path.d.ts.map