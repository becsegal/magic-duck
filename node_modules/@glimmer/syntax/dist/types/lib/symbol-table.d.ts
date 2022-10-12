import { Core, Dict } from '@glimmer/interfaces';
import { ASTv2 } from '..';
export declare abstract class SymbolTable {
    static top(locals: string[], customizeComponentName: (input: string) => string): ProgramSymbolTable;
    abstract has(name: string): boolean;
    abstract get(name: string): [symbol: number, isRoot: boolean];
    abstract getLocalsMap(): Dict<number>;
    abstract getEvalInfo(): Core.EvalInfo;
    abstract allocateFree(name: string, resolution: ASTv2.FreeVarResolution): number;
    abstract allocateNamed(name: string): number;
    abstract allocateBlock(name: string): number;
    abstract allocate(identifier: string): number;
    abstract setHasEval(): void;
    child(locals: string[]): BlockSymbolTable;
}
export declare class ProgramSymbolTable extends SymbolTable {
    private templateLocals;
    private customizeComponentName;
    constructor(templateLocals: string[], customizeComponentName: (input: string) => string);
    symbols: string[];
    upvars: string[];
    private size;
    private named;
    private blocks;
    private usedTemplateLocals;
    _hasEval: boolean;
    getUsedTemplateLocals(): string[];
    setHasEval(): void;
    get hasEval(): boolean;
    has(name: string): boolean;
    get(name: string): [number, boolean];
    getLocalsMap(): Dict<number>;
    getEvalInfo(): Core.EvalInfo;
    allocateFree(name: string, resolution: ASTv2.FreeVarResolution): number;
    allocateNamed(name: string): number;
    allocateBlock(name: string): number;
    allocate(identifier: string): number;
}
export declare class BlockSymbolTable extends SymbolTable {
    private parent;
    symbols: string[];
    slots: number[];
    constructor(parent: SymbolTable, symbols: string[], slots: number[]);
    get locals(): string[];
    has(name: string): boolean;
    get(name: string): [number, boolean];
    getLocalsMap(): Dict<number>;
    getEvalInfo(): Core.EvalInfo;
    setHasEval(): void;
    allocateFree(name: string, resolution: ASTv2.FreeVarResolution): number;
    allocateNamed(name: string): number;
    allocateBlock(name: string): number;
    allocate(identifier: string): number;
}
//# sourceMappingURL=symbol-table.d.ts.map