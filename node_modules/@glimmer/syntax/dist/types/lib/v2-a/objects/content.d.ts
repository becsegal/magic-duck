import { SourceSlice } from '../../source/slice';
import { SymbolTable } from '../../symbol-table';
import { Args } from './args';
import type { ComponentArg, ElementModifier, HtmlOrSplatAttr } from './attr-block';
import type { CallFields } from './base';
import type { ExpressionNode } from './expr';
import type { NamedBlock, NamedBlocks } from './internal-node';
import { BaseNodeFields } from './node';
/**
 * Content Nodes are allowed in content positions in templates. They correspond to behavior in the
 * [Data][data] tokenization state in HTML.
 *
 * [data]: https://html.spec.whatwg.org/multipage/parsing.html#data-state
 */
export declare type ContentNode = HtmlText | HtmlComment | AppendContent | InvokeBlock | InvokeComponent | SimpleElement | GlimmerComment;
declare const GlimmerComment_base: import("./node").TypedNodeConstructor<"GlimmerComment", {
    text: SourceSlice;
} & BaseNodeFields>;
export declare class GlimmerComment extends GlimmerComment_base {
}
declare const HtmlText_base: import("./node").TypedNodeConstructor<"HtmlText", {
    chars: string;
} & BaseNodeFields>;
export declare class HtmlText extends HtmlText_base {
}
declare const HtmlComment_base: import("./node").TypedNodeConstructor<"HtmlComment", {
    text: SourceSlice;
} & BaseNodeFields>;
export declare class HtmlComment extends HtmlComment_base {
}
declare const AppendContent_base: import("./node").TypedNodeConstructor<"AppendContent", {
    value: ExpressionNode;
    trusting: boolean;
    table: SymbolTable;
} & BaseNodeFields>;
export declare class AppendContent extends AppendContent_base {
    get callee(): ExpressionNode;
    get args(): Args;
}
declare const InvokeBlock_base: import("./node").TypedNodeConstructor<"InvokeBlock", CallFields & {
    blocks: NamedBlocks;
} & BaseNodeFields>;
export declare class InvokeBlock extends InvokeBlock_base {
}
interface InvokeComponentFields {
    callee: ExpressionNode;
    blocks: NamedBlocks;
    attrs: readonly HtmlOrSplatAttr[];
    componentArgs: readonly ComponentArg[];
    modifiers: readonly ElementModifier[];
}
declare const InvokeComponent_base: import("./node").TypedNodeConstructor<"InvokeComponent", InvokeComponentFields & BaseNodeFields>;
/**
 * Corresponds to a component invocation. When the content of a component invocation contains no
 * named blocks, `blocks` contains a single named block named `"default"`. When a component
 * invocation is self-closing, `blocks` is empty.
 */
export declare class InvokeComponent extends InvokeComponent_base {
    get args(): Args;
}
interface SimpleElementOptions extends BaseNodeFields {
    tag: SourceSlice;
    body: readonly ContentNode[];
    attrs: readonly HtmlOrSplatAttr[];
    componentArgs: readonly ComponentArg[];
    modifiers: readonly ElementModifier[];
}
declare const SimpleElement_base: import("./node").TypedNodeConstructor<"SimpleElement", SimpleElementOptions & BaseNodeFields>;
/**
 * Corresponds to a simple HTML element. The AST allows component arguments and modifiers to support
 * future extensions.
 */
export declare class SimpleElement extends SimpleElement_base {
    get args(): Args;
}
export declare type ElementNode = NamedBlock | InvokeComponent | SimpleElement;
export {};
//# sourceMappingURL=content.d.ts.map