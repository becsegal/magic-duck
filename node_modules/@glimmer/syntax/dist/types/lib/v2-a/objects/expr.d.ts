import { PresentArray } from '@glimmer/interfaces';
import { SourceSlice } from '../../source/slice';
import type { CallFields } from './base';
import type { FreeVarReference, VariableReference } from './refs';
/**
 * A Handlebars literal.
 *
 * {@link https://handlebarsjs.com/guide/expressions.html#literal-segments}
 */
export declare type LiteralValue = string | boolean | number | undefined | null;
export interface LiteralTypes {
    string: string;
    boolean: boolean;
    number: number;
    null: null;
    undefined: undefined;
}
declare const LiteralExpression_base: import("./node").TypedNodeConstructor<"Literal", {
    value: LiteralValue;
} & import("./node").BaseNodeFields>;
/**
 * Corresponds to a Handlebars literal.
 *
 * @see {LiteralValue}
 */
export declare class LiteralExpression extends LiteralExpression_base {
    toSlice(this: StringLiteral): SourceSlice;
}
export declare type StringLiteral = LiteralExpression & {
    value: string;
};
/**
 * Returns true if an input {@see ExpressionNode} is a literal.
 */
export declare function isLiteral<K extends keyof LiteralTypes = keyof LiteralTypes>(node: ExpressionNode, kind?: K): node is StringLiteral;
declare const PathExpression_base: import("./node").TypedNodeConstructor<"Path", {
    ref: VariableReference;
    tail: readonly SourceSlice[];
} & import("./node").BaseNodeFields>;
/**
 * Corresponds to a path in expression position.
 *
 * ```hbs
 * this
 * this.x
 * @x
 * @x.y
 * x
 * x.y
 * ```
 */
export declare class PathExpression extends PathExpression_base {
}
declare const CallExpression_base: import("./node").TypedNodeConstructor<"Call", CallFields & import("./node").BaseNodeFields>;
/**
 * Corresponds to a parenthesized call expression.
 *
 * ```hbs
 * (x)
 * (x.y)
 * (x y)
 * (x.y z)
 * ```
 */
export declare class CallExpression extends CallExpression_base {
}
declare const DeprecatedCallExpression_base: import("./node").TypedNodeConstructor<"DeprecatedCall", {
    arg: SourceSlice;
    callee: FreeVarReference;
} & import("./node").BaseNodeFields>;
/**
 * Corresponds to a possible deprecated helper call. Must be:
 *
 * 1. A free variable (not this.foo, not @foo, not local).
 * 2. Argument-less.
 * 3. In a component invocation's named argument position.
 * 4. Not parenthesized (not @bar={{(helper)}}).
 * 5. Not interpolated (not @bar="{{helper}}").
 *
 * ```hbs
 * <Foo @bar={{helper}} />
 * ```
 */
export declare class DeprecatedCallExpression extends DeprecatedCallExpression_base {
}
declare const InterpolateExpression_base: import("./node").TypedNodeConstructor<"Interpolate", {
    parts: PresentArray<ExpressionNode>;
} & import("./node").BaseNodeFields>;
/**
 * Corresponds to an interpolation in attribute value position.
 *
 * ```hbs
 * <a href="{{url}}.html"
 * ```
 */
export declare class InterpolateExpression extends InterpolateExpression_base {
}
export declare type ExpressionNode = LiteralExpression | PathExpression | CallExpression | DeprecatedCallExpression | InterpolateExpression;
export {};
//# sourceMappingURL=expr.d.ts.map