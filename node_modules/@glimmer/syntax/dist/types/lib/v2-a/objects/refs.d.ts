import { SourceSlice } from '../../source/slice';
import type { FreeVarResolution } from './resolution';
declare const ThisReference_base: import("./node").TypedNodeConstructor<"This", object & import("./node").BaseNodeFields>;
/**
 * Corresponds to `this` at the head of an expression.
 */
export declare class ThisReference extends ThisReference_base {
}
declare const ArgReference_base: import("./node").TypedNodeConstructor<"Arg", {
    name: SourceSlice;
    symbol: number;
} & import("./node").BaseNodeFields>;
/**
 * Corresponds to `@<ident>` at the beginning of an expression.
 */
export declare class ArgReference extends ArgReference_base {
}
declare const LocalVarReference_base: import("./node").TypedNodeConstructor<"Local", {
    name: string;
    isTemplateLocal: boolean;
    symbol: number;
} & import("./node").BaseNodeFields>;
/**
 * Corresponds to `<ident>` at the beginning of an expression, when `<ident>` is in the current
 * block's scope.
 */
export declare class LocalVarReference extends LocalVarReference_base {
}
declare const FreeVarReference_base: import("./node").TypedNodeConstructor<"Free", {
    name: string;
    resolution: FreeVarResolution;
    symbol: number;
} & import("./node").BaseNodeFields>;
/**
 * Corresponds to `<ident>` at the beginning of an expression, when `<ident>` is *not* in the
 * current block's scope.
 *
 * The `resolution: FreeVarResolution` field describes how to resolve the free variable.
 *
 * Note: In strict mode, it must always be a variable that is in a concrete JavaScript scope that
 * the template will be installed into.
 */
export declare class FreeVarReference extends FreeVarReference_base {
}
export declare type VariableReference = ThisReference | ArgReference | LocalVarReference | FreeVarReference;
export {};
//# sourceMappingURL=refs.d.ts.map