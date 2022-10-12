import type { PresentArray } from '@glimmer/interfaces';
import { LocatedWithOptionalSpan, LocatedWithSpan } from './location';
import { SourceOffset, SourceSpan } from './span';
export declare type HasSpan = SourceSpan | LocatedWithSpan | PresentArray<LocatedWithSpan>;
export declare type MaybeHasSpan = SourceSpan | LocatedWithOptionalSpan | LocatedWithOptionalSpan[] | null;
export declare type ToSourceOffset = number | SourceOffset;
export declare class SpanList {
    static range(span: PresentArray<HasSourceSpan>): SourceSpan;
    static range(span: HasSourceSpan[], fallback: SourceSpan): SourceSpan;
    _span: SourceSpan[];
    constructor(span?: SourceSpan[]);
    add(offset: SourceSpan): void;
    getRangeOffset(fallback: SourceSpan): SourceSpan;
}
export declare type HasSourceSpan = {
    loc: SourceSpan;
} | SourceSpan | [HasSourceSpan, ...HasSourceSpan[]];
export declare function loc(span: HasSourceSpan): SourceSpan;
export declare type MaybeHasSourceSpan = {
    loc: SourceSpan;
} | SourceSpan | MaybeHasSourceSpan[];
export declare function hasSpan(span: MaybeHasSourceSpan): span is HasSourceSpan;
export declare function maybeLoc(location: MaybeHasSourceSpan, fallback: SourceSpan): SourceSpan;
//# sourceMappingURL=span-list.d.ts.map