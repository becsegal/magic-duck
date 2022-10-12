import { SourceSlice } from '../../source/slice';
import { NamedArgument } from './args';
import type { CallFields } from './base';
import type { ExpressionNode } from './expr';
/**
 * Attr nodes look like HTML attributes, but are classified as:
 *
 * 1. `HtmlAttr`, which means a regular HTML attribute in Glimmer
 * 2. `SplatAttr`, which means `...attributes`
 * 3. `ComponentArg`, which means an attribute whose name begins with `@`, and it is therefore a
 *    component argument.
 */
export declare type AttrNode = HtmlAttr | SplatAttr | ComponentArg;
/**
 * `HtmlAttr` and `SplatAttr` are grouped together because the order of the `SplatAttr` node,
 * relative to other attributes, matters.
 */
export declare type HtmlOrSplatAttr = HtmlAttr | SplatAttr;
/**
 * "Attr Block" nodes are allowed inside an open element tag in templates. They interact with the
 * element (or component).
 */
export declare type AttrBlockNode = AttrNode | ElementModifier;
declare const HtmlAttr_base: import("./node").TypedNodeConstructor<"HtmlAttr", AttrNodeOptions & import("./node").BaseNodeFields>;
/**
 * `HtmlAttr` nodes are valid HTML attributes, with or without a value.
 *
 * Exceptions:
 *
 * - `...attributes` is `SplatAttr`
 * - `@x=<value>` is `ComponentArg`
 */
export declare class HtmlAttr extends HtmlAttr_base {
}
declare const SplatAttr_base: import("./node").TypedNodeConstructor<"SplatAttr", {
    symbol: number;
} & import("./node").BaseNodeFields>;
export declare class SplatAttr extends SplatAttr_base {
}
declare const ComponentArg_base: import("./node").NodeConstructor<AttrNodeOptions & import("./node").BaseNodeFields>;
/**
 * Corresponds to an argument passed by a component (`@x=<value>`)
 */
export declare class ComponentArg extends ComponentArg_base {
    /**
     * Convert the component argument into a named argument node
     */
    toNamedArgument(): NamedArgument;
}
declare const ElementModifier_base: import("./node").TypedNodeConstructor<"ElementModifier", CallFields & import("./node").BaseNodeFields>;
/**
 * An `ElementModifier` is just a normal call node in modifier position.
 */
export declare class ElementModifier extends ElementModifier_base {
}
export interface AttrNodeOptions {
    name: SourceSlice;
    value: ExpressionNode;
    trusting: boolean;
}
export {};
//# sourceMappingURL=attr-block.d.ts.map