import { Dict, Option, PresentArray } from '@glimmer/interfaces';
import { ParserNodeBuilder } from '../parser';
import { SourceLocation } from '../source/location';
import { SourceOffset, SourceSpan } from '../source/span';
import * as ASTv1 from './api';
/**
 * The Parser Builder differentiates from the public builder API by:
 *
 * 1. Offering fewer different ways to instantiate nodes
 * 2. Mandating source locations
 */
declare class Builders {
    pos(line: number, column: number): {
        line: number;
        column: number;
    };
    blockItself({ body, blockParams, chained, loc, }: {
        body?: ASTv1.Statement[];
        blockParams?: string[];
        chained?: boolean;
        loc: SourceSpan;
    }): ASTv1.Block;
    template({ body, blockParams, loc, }: {
        body?: ASTv1.Statement[];
        blockParams?: string[];
        loc: SourceSpan;
    }): ASTv1.Template;
    mustache({ path, params, hash, trusting, loc, strip, }: {
        path: ASTv1.Expression;
        params: ASTv1.Expression[];
        hash: ASTv1.Hash;
        trusting: boolean;
        loc: SourceSpan;
        strip: ASTv1.StripFlags;
    }): ASTv1.MustacheStatement;
    block({ path, params, hash, defaultBlock, elseBlock, loc, openStrip, inverseStrip, closeStrip, }: {
        path: ASTv1.PathExpression | ASTv1.SubExpression;
        params: ASTv1.Expression[];
        hash: ASTv1.Hash;
        defaultBlock: ASTv1.Block;
        elseBlock?: Option<ASTv1.Block>;
        loc: SourceSpan;
        openStrip: ASTv1.StripFlags;
        inverseStrip: ASTv1.StripFlags;
        closeStrip: ASTv1.StripFlags;
    }): ASTv1.BlockStatement;
    comment(value: string, loc: SourceOffset): ParserNodeBuilder<ASTv1.CommentStatement>;
    mustacheComment(value: string, loc: SourceSpan): ASTv1.MustacheCommentStatement;
    concat(parts: PresentArray<ASTv1.TextNode | ASTv1.MustacheStatement>, loc: SourceSpan): ASTv1.ConcatStatement;
    element({ tag, selfClosing, attrs, blockParams, modifiers, comments, children, loc, }: BuildElementOptions): ASTv1.ElementNode;
    elementModifier({ path, params, hash, loc, }: {
        path: ASTv1.PathExpression | ASTv1.SubExpression;
        params: ASTv1.Expression[];
        hash: ASTv1.Hash;
        loc: SourceSpan;
    }): ASTv1.ElementModifierStatement;
    attr({ name, value, loc, }: {
        name: string;
        value: ASTv1.AttrNode['value'];
        loc: SourceSpan;
    }): ASTv1.AttrNode;
    text({ chars, loc }: {
        chars: string;
        loc: SourceSpan;
    }): ASTv1.TextNode;
    sexpr({ path, params, hash, loc, }: {
        path: ASTv1.PathExpression | ASTv1.SubExpression;
        params: ASTv1.Expression[];
        hash: ASTv1.Hash;
        loc: SourceSpan;
    }): ASTv1.SubExpression;
    path({ head, tail, loc, }: {
        head: ASTv1.PathHead;
        tail: string[];
        loc: SourceSpan;
    }): ASTv1.PathExpression;
    head(head: string, loc: SourceSpan): ASTv1.PathHead;
    this(loc: SourceSpan): ASTv1.PathHead;
    atName(name: string, loc: SourceSpan): ASTv1.PathHead;
    var(name: string, loc: SourceSpan): ASTv1.PathHead;
    hash(pairs: ASTv1.HashPair[], loc: SourceSpan): ASTv1.Hash;
    pair({ key, value, loc, }: {
        key: string;
        value: ASTv1.Expression;
        loc: SourceSpan;
    }): ASTv1.HashPair;
    literal<T extends ASTv1.Literal>({ type, value, loc, }: {
        type: T['type'];
        value: T['value'];
        loc?: SourceLocation;
    }): T;
    undefined(): ASTv1.UndefinedLiteral;
    null(): ASTv1.NullLiteral;
    string(value: string, loc: SourceSpan): ASTv1.StringLiteral;
    boolean(value: boolean, loc: SourceSpan): ASTv1.BooleanLiteral;
    number(value: number, loc: SourceSpan): ASTv1.NumberLiteral;
}
export declare type ElementParts = ['attrs', ...AttrSexp[]] | ['modifiers', ...ModifierSexp[]] | ['body', ...ASTv1.Statement[]] | ['comments', ...ElementComment[]] | ['as', ...string[]] | ['loc', SourceLocation];
export declare type PathSexp = string | ['path', string, LocSexp?];
export declare type ModifierSexp = string | [PathSexp, LocSexp?] | [PathSexp, ASTv1.Expression[], LocSexp?] | [PathSexp, ASTv1.Expression[], Dict<ASTv1.Expression>, LocSexp?];
export declare type AttrSexp = [string, ASTv1.AttrNode['value'] | string, LocSexp?];
export declare type LocSexp = ['loc', SourceLocation];
export declare type ElementComment = ASTv1.MustacheCommentStatement | SourceLocation | string;
export declare type SexpValue = string | ASTv1.Expression[] | Dict<ASTv1.Expression> | LocSexp | PathSexp | undefined;
export interface BuildElementOptions {
    tag: string;
    selfClosing: boolean;
    attrs: ASTv1.AttrNode[];
    modifiers: ASTv1.ElementModifierStatement[];
    children: ASTv1.Statement[];
    comments: ElementComment[];
    blockParams: string[];
    loc: SourceSpan;
}
declare const _default: Builders;
export default _default;
//# sourceMappingURL=parser-builders.d.ts.map