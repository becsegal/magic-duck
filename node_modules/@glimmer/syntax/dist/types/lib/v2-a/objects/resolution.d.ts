/**
 * A free variable is resolved according to a resolution rule:
 *
 * 1. Strict resolution
 * 2. Namespaced resolution
 * 3. Fallback resolution
 */
import { GetContextualFreeOp } from '@glimmer/interfaces';
/**
 * Strict resolution is used:
 *
 * 1. in a strict mode template
 * 2. in an unambiguous invocation with dot paths
 */
export declare class StrictResolution {
    resolution(): GetContextualFreeOp;
    serialize(): SerializedResolution;
    readonly isAngleBracket = false;
}
export declare const STRICT_RESOLUTION: StrictResolution;
/**
 * A `LooseModeResolution` includes:
 *
 * - 0 or more namespaces to resolve the variable in
 * - optional fallback behavior
 *
 * In practice, there are a limited number of possible combinations of these degrees of freedom,
 * and they are captured by the `Ambiguity` union below.
 */
export declare class LooseModeResolution {
    readonly ambiguity: Ambiguity;
    readonly isAngleBracket: boolean;
    /**
     * Namespaced resolution is used in an unambiguous syntax position:
     *
     * 1. `(sexp)` (namespace: `Helper`)
     * 2. `{{#block}}` (namespace: `Component`)
     * 3. `<a {{modifier}}>` (namespace: `Modifier`)
     * 4. `<Component />` (namespace: `Component`)
     *
     * @see {NamespacedAmbiguity}
     */
    static namespaced(namespace: FreeVarNamespace, isAngleBracket?: boolean): LooseModeResolution;
    /**
     * Fallback resolution is used when no namespaced resolutions are possible, but fallback
     * resolution is still allowed.
     *
     * ```hbs
     * {{x.y}}
     * ```
     *
     * @see {FallbackAmbiguity}
     */
    static fallback(): LooseModeResolution;
    /**
     * Append resolution is used when the variable should be resolved in both the `component` and
     * `helper` namespaces. Fallback resolution is optional.
     *
     * ```hbs
     * {{x}}
     * ```
     *
     * ^ `x` should be resolved in the `component` and `helper` namespaces with fallback resolution.
     *
     * ```hbs
     * {{x y}}
     * ```
     *
     * ^ `x` should be resolved in the `component` and `helper` namespaces without fallback
     * resolution.
     *
     * @see {ComponentOrHelperAmbiguity}
     */
    static append({ invoke }: {
        invoke: boolean;
    }): LooseModeResolution;
    /**
     * Trusting append resolution is used when the variable should be resolved in both the `component` and
     * `helper` namespaces. Fallback resolution is optional.
     *
     * ```hbs
     * {{{x}}}
     * ```
     *
     * ^ `x` should be resolved in the `component` and `helper` namespaces with fallback resolution.
     *
     * ```hbs
     * {{{x y}}}
     * ```
     *
     * ^ `x` should be resolved in the `component` and `helper` namespaces without fallback
     * resolution.
     *
     * @see {HelperAmbiguity}
     */
    static trustingAppend({ invoke }: {
        invoke: boolean;
    }): LooseModeResolution;
    /**
     * Attribute resolution is used when the variable should be resolved as a `helper` with fallback
     * resolution.
     *
     * ```hbs
     * <a href={{x}} />
     * <a href="{{x}}.html" />
     * ```
     *
     * ^ resolved in the `helper` namespace with fallback
     *
     * @see {HelperAmbiguity}
     */
    static attr(): LooseModeResolution;
    constructor(ambiguity: Ambiguity, isAngleBracket?: boolean);
    resolution(): GetContextualFreeOp;
    serialize(): SerializedResolution;
}
export declare const ARGUMENT_RESOLUTION: LooseModeResolution;
export declare const enum FreeVarNamespace {
    Helper = "Helper",
    Modifier = "Modifier",
    Component = "Component"
}
/**
 * A `ComponentOrHelperAmbiguity` might be a component or a helper, with an optional fallback
 *
 * ```hbs
 * {{x}}
 * ```
 *
 * ^ `x` is resolved in the `component` and `helper` namespaces, with fallback
 *
 * ```hbs
 * {{x y}}
 * ```
 *
 * ^ `x` is resolved in the `component` and `helper` namespaces, without fallback
 */
declare type ComponentOrHelperAmbiguity = {
    namespaces: [FreeVarNamespace.Component, FreeVarNamespace.Helper];
    fallback: boolean;
};
/**
 * A `HelperAmbiguity` must be a helper, but it has fallback. If it didn't have fallback, it would
 * be a `NamespacedAmbiguity`.
 *
 * ```hbs
 * <a href={{x}} />
 * <a href="{{x}}.html" />
 * ```
 *
 * ^ `x` is resolved in the `helper` namespace with fallback
 */
declare type HelperAmbiguity = {
    namespaces: [FreeVarNamespace.Helper];
    fallback: boolean;
};
/**
 * A `NamespacedAmbiguity` must be resolved in a particular namespace, without fallback.
 *
 * ```hbs
 * <X />
 * ```
 *
 * ^ `X` is resolved in the `component` namespace without fallback
 *
 * ```hbs
 * (x)
 * ```
 *
 * ^ `x` is resolved in the `helper` namespace without fallback
 *
 * ```hbs
 * <a {{x}} />
 * ```
 *
 * ^ `x` is resolved in the `modifier` namespace without fallback
 */
declare type NamespacedAmbiguity = {
    namespaces: [FreeVarNamespace.Component | FreeVarNamespace.Helper | FreeVarNamespace.Modifier];
    fallback: false;
};
declare type FallbackAmbiguity = {
    namespaces: [];
    fallback: true;
};
declare type Ambiguity = ComponentOrHelperAmbiguity | HelperAmbiguity | NamespacedAmbiguity | FallbackAmbiguity;
export declare type FreeVarResolution = StrictResolution | LooseModeResolution;
declare const enum SerializedAmbiguity {
    Append = "Append",
    Attr = "Attr",
    Invoke = "Invoke"
}
export declare type SerializedResolution = 'Strict' | 'Loose' | ['ns', FreeVarNamespace] | ['ambiguous', SerializedAmbiguity];
export declare function loadResolution(resolution: SerializedResolution): FreeVarResolution;
export {};
//# sourceMappingURL=resolution.d.ts.map