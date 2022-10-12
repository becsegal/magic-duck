import { SourceSpan } from '../source/span';
import { PathExpression, PathHead } from './nodes-v1';
export declare class PathExpressionImplV1 implements PathExpression {
    original: string;
    loc: SourceSpan;
    type: 'PathExpression';
    parts: string[];
    this: boolean;
    data: boolean;
    constructor(original: string, head: PathHead, tail: string[], loc: SourceSpan);
    _head?: PathHead;
    get head(): PathHead;
    get tail(): string[];
}
//# sourceMappingURL=legacy-interop.d.ts.map