import { SourceSlice } from '../../source/slice';
import { BlockSymbolTable, ProgramSymbolTable } from '../../symbol-table';
import { Args } from './args';
import type { ComponentArg, ElementModifier, HtmlOrSplatAttr } from './attr-block';
import type { GlimmerParentNodeOptions } from './base';
import { BaseNodeFields } from './node';
declare const Template_base: import("./node").NodeConstructor<{
    table: ProgramSymbolTable;
} & GlimmerParentNodeOptions & BaseNodeFields>;
/**
 * Corresponds to an entire template.
 */
export declare class Template extends Template_base {
}
declare const Block_base: import("./node").NodeConstructor<{
    scope: BlockSymbolTable;
} & GlimmerParentNodeOptions & BaseNodeFields>;
/**
 * Represents a block. In principle this could be merged with `NamedBlock`, because all cases
 * involving blocks have at least a notional name.
 */
export declare class Block extends Block_base {
}
declare const NamedBlocks_base: import("./node").NodeConstructor<{
    blocks: readonly NamedBlock[];
} & BaseNodeFields>;
/**
 * Corresponds to a collection of named blocks.
 */
export declare class NamedBlocks extends NamedBlocks_base {
    /**
     * Get the `NamedBlock` for a given name.
     */
    get(name: 'default'): NamedBlock;
    get(name: string): NamedBlock | null;
}
export interface NamedBlockFields extends BaseNodeFields {
    name: SourceSlice;
    block: Block;
    attrs: readonly HtmlOrSplatAttr[];
    componentArgs: readonly ComponentArg[];
    modifiers: readonly ElementModifier[];
}
declare const NamedBlock_base: import("./node").NodeConstructor<NamedBlockFields & BaseNodeFields>;
/**
 * Corresponds to a single named block. This is used for anonymous named blocks (`default` and
 * `else`).
 */
export declare class NamedBlock extends NamedBlock_base {
    get args(): Args;
}
export {};
//# sourceMappingURL=internal-node.d.ts.map