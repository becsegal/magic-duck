import { SourceSlice } from '../../source/slice';
import { SourceSpan } from '../../source/span';
import type { ExpressionNode } from './expr';
declare const Args_base: import("./node").NodeConstructor<{
    positional: PositionalArguments;
    named: NamedArguments;
} & import("./node").BaseNodeFields>;
/**
 * Corresponds to syntaxes with positional and named arguments:
 *
 * - SubExpression
 * - Invoking Append
 * - Invoking attributes
 * - InvokeBlock
 *
 * If `Args` is empty, the `SourceOffsets` for this node should be the collapsed position
 * immediately after the parent call node's `callee`.
 */
export declare class Args extends Args_base {
    static empty(loc: SourceSpan): Args;
    static named(named: NamedArguments): Args;
    nth(offset: number): ExpressionNode | null;
    get(name: string): ExpressionNode | null;
    isEmpty(): boolean;
}
declare const PositionalArguments_base: import("./node").NodeConstructor<{
    exprs: readonly ExpressionNode[];
} & import("./node").BaseNodeFields>;
/**
 * Corresponds to positional arguments.
 *
 * If `PositionalArguments` is empty, the `SourceOffsets` for this node should be the collapsed
 * position immediately after the parent call node's `callee`.
 */
export declare class PositionalArguments extends PositionalArguments_base {
    static empty(loc: SourceSpan): PositionalArguments;
    get size(): number;
    nth(offset: number): ExpressionNode | null;
    isEmpty(): boolean;
}
declare const NamedArguments_base: import("./node").NodeConstructor<{
    entries: readonly NamedArgument[];
} & import("./node").BaseNodeFields>;
/**
 * Corresponds to named arguments.
 *
 * If `PositionalArguments` and `NamedArguments` are empty, the `SourceOffsets` for this node should
 * be the same as the `Args` node that contains this node.
 *
 * If `PositionalArguments` is not empty but `NamedArguments` is empty, the `SourceOffsets` for this
 * node should be the collapsed position immediately after the last positional argument.
 */
export declare class NamedArguments extends NamedArguments_base {
    static empty(loc: SourceSpan): NamedArguments;
    get size(): number;
    get(name: string): ExpressionNode | null;
    isEmpty(): boolean;
}
/**
 * Corresponds to a single named argument.
 *
 * ```hbs
 * x=<expr>
 * ```
 */
export declare class NamedArgument {
    readonly loc: SourceSpan;
    readonly name: SourceSlice;
    readonly value: ExpressionNode;
    constructor(options: {
        name: SourceSlice;
        value: ExpressionNode;
    });
}
export {};
//# sourceMappingURL=args.d.ts.map