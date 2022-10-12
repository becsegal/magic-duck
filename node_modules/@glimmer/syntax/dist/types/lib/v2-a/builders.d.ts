import type { PresentArray } from '@glimmer/interfaces';
import { SourceSlice } from '../source/slice';
import { SourceSpan } from '../source/span';
import { BlockSymbolTable, ProgramSymbolTable, SymbolTable } from '../symbol-table';
import * as ASTv2 from './api';
export interface CallParts {
    callee: ASTv2.ExpressionNode;
    args: ASTv2.Args;
}
export declare class Builder {
    template(symbols: ProgramSymbolTable, body: ASTv2.ContentNode[], loc: SourceSpan): ASTv2.Template;
    block(symbols: BlockSymbolTable, body: ASTv2.ContentNode[], loc: SourceSpan): ASTv2.Block;
    namedBlock(name: SourceSlice, block: ASTv2.Block, loc: SourceSpan): ASTv2.NamedBlock;
    simpleNamedBlock(name: SourceSlice, block: ASTv2.Block, loc: SourceSpan): ASTv2.NamedBlock;
    slice(chars: string, loc: SourceSpan): SourceSlice;
    args(positional: ASTv2.PositionalArguments, named: ASTv2.NamedArguments, loc: SourceSpan): ASTv2.Args;
    positional(exprs: ASTv2.ExpressionNode[], loc: SourceSpan): ASTv2.PositionalArguments;
    namedArgument(key: SourceSlice, value: ASTv2.ExpressionNode): ASTv2.NamedArgument;
    named(entries: ASTv2.NamedArgument[], loc: SourceSpan): ASTv2.NamedArguments;
    attr({ name, value, trusting, }: {
        name: SourceSlice;
        value: ASTv2.ExpressionNode;
        trusting: boolean;
    }, loc: SourceSpan): ASTv2.HtmlAttr;
    splatAttr(symbol: number, loc: SourceSpan): ASTv2.SplatAttr;
    arg({ name, value, trusting, }: {
        name: SourceSlice;
        value: ASTv2.ExpressionNode;
        trusting: boolean;
    }, loc: SourceSpan): ASTv2.ComponentArg;
    path(head: ASTv2.VariableReference, tail: SourceSlice[], loc: SourceSpan): ASTv2.PathExpression;
    self(loc: SourceSpan): ASTv2.VariableReference;
    at(name: string, symbol: number, loc: SourceSpan): ASTv2.VariableReference;
    freeVar({ name, context, symbol, loc, }: {
        name: string;
        context: ASTv2.FreeVarResolution;
        symbol: number;
        loc: SourceSpan;
    }): ASTv2.FreeVarReference;
    localVar(name: string, symbol: number, isTemplateLocal: boolean, loc: SourceSpan): ASTv2.VariableReference;
    sexp(parts: CallParts, loc: SourceSpan): ASTv2.CallExpression;
    deprecatedCall(arg: SourceSlice, callee: ASTv2.FreeVarReference, loc: SourceSpan): ASTv2.DeprecatedCallExpression;
    interpolate(parts: ASTv2.ExpressionNode[], loc: SourceSpan): ASTv2.InterpolateExpression;
    literal(value: string, loc: SourceSpan): ASTv2.LiteralExpression & {
        value: string;
    };
    literal(value: number, loc: SourceSpan): ASTv2.LiteralExpression & {
        value: number;
    };
    literal(value: boolean, loc: SourceSpan): ASTv2.LiteralExpression & {
        value: boolean;
    };
    literal(value: null, loc: SourceSpan): ASTv2.LiteralExpression & {
        value: null;
    };
    literal(value: undefined, loc: SourceSpan): ASTv2.LiteralExpression & {
        value: undefined;
    };
    literal(value: string | number | boolean | null | undefined, loc: SourceSpan): ASTv2.LiteralExpression;
    append({ table, trusting, value, }: {
        table: SymbolTable;
        trusting: boolean;
        value: ASTv2.ExpressionNode;
    }, loc: SourceSpan): ASTv2.AppendContent;
    modifier({ callee, args }: CallParts, loc: SourceSpan): ASTv2.ElementModifier;
    namedBlocks(blocks: ASTv2.NamedBlock[], loc: SourceSpan): ASTv2.NamedBlocks;
    blockStatement({ symbols, program, inverse, ...call }: {
        symbols: SymbolTable;
        program: ASTv2.Block;
        inverse?: ASTv2.Block | null;
    } & CallParts, loc: SourceSpan): ASTv2.InvokeBlock;
    element(options: BuildBaseElement): BuildElement;
}
export interface BuildBaseElement {
    selfClosing: boolean;
    attrs: ASTv2.HtmlOrSplatAttr[];
    componentArgs: ASTv2.ComponentArg[];
    modifiers: ASTv2.ElementModifier[];
    comments: ASTv2.GlimmerComment[];
}
export declare class BuildElement {
    readonly base: BuildBaseElement;
    readonly builder: Builder;
    constructor(base: BuildBaseElement);
    simple(tag: SourceSlice, body: ASTv2.ContentNode[], loc: SourceSpan): ASTv2.SimpleElement;
    named(name: SourceSlice, block: ASTv2.Block, loc: SourceSpan): ASTv2.NamedBlock;
    selfClosingComponent(callee: ASTv2.ExpressionNode, loc: SourceSpan): ASTv2.InvokeComponent;
    componentWithDefaultBlock(callee: ASTv2.ExpressionNode, children: ASTv2.ContentNode[], symbols: BlockSymbolTable, loc: SourceSpan): ASTv2.InvokeComponent;
    componentWithNamedBlocks(callee: ASTv2.ExpressionNode, blocks: PresentArray<ASTv2.NamedBlock>, loc: SourceSpan): ASTv2.InvokeComponent;
}
//# sourceMappingURL=builders.d.ts.map