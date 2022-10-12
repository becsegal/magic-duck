import { PrecompileOptions } from '../parser/tokenizer-event-handlers';
import { SourceLocation } from '../source/location';
import { Source } from '../source/source';
import { SourceSpan } from '../source/span';
import { BlockSymbolTable, SymbolTable } from '../symbol-table';
import * as ASTv1 from '../v1/api';
import * as ASTv2 from './api';
import { Builder } from './builders';
import { Resolution } from './loose-resolution';
export declare function normalize(source: Source, options?: PrecompileOptions): [ast: ASTv2.Template, locals: string[]];
/**
 * A `BlockContext` represents the block that a particular AST node is contained inside of.
 *
 * `BlockContext` is aware of template-wide options (such as strict mode), as well as the bindings
 * that are in-scope within that block.
 *
 * Concretely, it has the `PrecompileOptions` and current `SymbolTable`, and provides
 * facilities for working with those options.
 *
 * `BlockContext` is stateless.
 */
export declare class BlockContext<Table extends SymbolTable = SymbolTable> {
    readonly source: Source;
    private readonly options;
    readonly table: Table;
    readonly builder: Builder;
    constructor(source: Source, options: PrecompileOptions, table: Table);
    get strict(): boolean;
    loc(loc: SourceLocation): SourceSpan;
    resolutionFor<N extends ASTv1.CallNode | ASTv1.PathExpression>(node: N, resolution: Resolution<N>): {
        resolution: ASTv2.FreeVarResolution;
    } | {
        resolution: 'error';
        path: string;
        head: string;
    };
    private isFreeVar;
    hasBinding(name: string): boolean;
    child(blockParams: string[]): BlockContext<BlockSymbolTable>;
    customizeComponentName(input: string): string;
}
//# sourceMappingURL=normalize.d.ts.map