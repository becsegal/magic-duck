import { SourceLocation, SourcePosition } from '../location';
import { SourceSlice } from '../slice';
import { Source } from '../source';
import { MatchFn } from './match';
import { AnyPosition, BROKEN, CharPosition, HbsPosition, OffsetKind, SourceOffset } from './offset';
/**
 * All spans have these details in common.
 */
interface SpanData {
    readonly kind: OffsetKind;
    /**
     * Convert this span into a string. If the span is broken, return `''`.
     */
    asString(): string;
    /**
     * Gets the module the span was located in.
     */
    getModule(): string;
    /**
     * Get the starting position for this span. Try to avoid creating new position objects, as they
     * cache computations.
     */
    getStart(): AnyPosition;
    /**
     * Get the ending position for this span. Try to avoid creating new position objects, as they
     * cache computations.
     */
    getEnd(): AnyPosition;
    /**
     * Compute the `SourceLocation` for this span, returned as an instance of `HbsSpan`.
     */
    toHbsSpan(): HbsSpan | null;
    /**
     * For compatibility, whenever the `start` or `end` of a {@see SourceOffset} changes, spans are
     * notified of the change so they can update themselves. This shouldn't happen outside of AST
     * plugins.
     */
    locDidUpdate(changes: {
        start?: SourcePosition;
        end?: SourcePosition;
    }): void;
    /**
     * Serialize into a {@see SerializedSourceSpan}, which is compact and designed for readability in
     * context like AST Explorer. If you need a {@see SourceLocation}, use {@see toJSON}.
     */
    serialize(): SerializedSourceSpan;
}
/**
 * A `SourceSpan` object represents a span of characters inside of a template source.
 *
 * There are three kinds of `SourceSpan` objects:
 *
 * - `ConcreteSourceSpan`, which contains byte offsets
 * - `LazySourceSpan`, which contains `SourceLocation`s from the Handlebars AST, which can be
 *   converted to byte offsets on demand.
 * - `InvisibleSourceSpan`, which represent source strings that aren't present in the source,
 *   because:
 *     - they were created synthetically
 *     - their location is nonsensical (the span is broken)
 *     - they represent nothing in the source (this currently happens only when a bug in the
 *       upstream Handlebars parser fails to assign a location to empty blocks)
 *
 * At a high level, all `SourceSpan` objects provide:
 *
 * - byte offsets
 * - source in column and line format
 *
 * And you can do these operations on `SourceSpan`s:
 *
 * - collapse it to a `SourceSpan` representing its starting or ending position
 * - slice out some characters, optionally skipping some characters at the beginning or end
 * - create a new `SourceSpan` with a different starting or ending offset
 *
 * All SourceSpan objects implement `SourceLocation`, for compatibility. All SourceSpan
 * objects have a `toJSON` that emits `SourceLocation`, also for compatibility.
 *
 * For compatibility, subclasses of `AbstractSourceSpan` must implement `locDidUpdate`, which
 * happens when an AST plugin attempts to modify the `start` or `end` of a span directly.
 *
 * The goal is to avoid creating any problems for use-cases like AST Explorer.
 */
export declare class SourceSpan implements SourceLocation {
    private data;
    static get NON_EXISTENT(): SourceSpan;
    static load(source: Source, serialized: SerializedSourceSpan): SourceSpan;
    static forHbsLoc(source: Source, loc: SourceLocation): SourceSpan;
    static forCharPositions(source: Source, startPos: number, endPos: number): SourceSpan;
    static synthetic(chars: string): SourceSpan;
    static broken(pos?: SourceLocation): SourceSpan;
    readonly isInvisible: boolean;
    constructor(data: SpanData & AnySpan);
    getStart(): SourceOffset;
    getEnd(): SourceOffset;
    get loc(): SourceLocation;
    get module(): string;
    /**
     * Get the starting `SourcePosition` for this `SourceSpan`, lazily computing it if needed.
     */
    get startPosition(): SourcePosition;
    /**
     * Get the ending `SourcePosition` for this `SourceSpan`, lazily computing it if needed.
     */
    get endPosition(): SourcePosition;
    /**
     * Support converting ASTv1 nodes into a serialized format using JSON.stringify.
     */
    toJSON(): SourceLocation;
    /**
     * Create a new span with the current span's end and a new beginning.
     */
    withStart(other: SourceOffset): SourceSpan;
    /**
     * Create a new span with the current span's beginning and a new ending.
     */
    withEnd(this: SourceSpan, other: SourceOffset): SourceSpan;
    asString(): string;
    /**
     * Convert this `SourceSpan` into a `SourceSlice`. In debug mode, this method optionally checks
     * that the byte offsets represented by this `SourceSpan` actually correspond to the expected
     * string.
     */
    toSlice(expected?: string): SourceSlice;
    /**
     * For compatibility with SourceLocation in AST plugins
     *
     * @deprecated use startPosition instead
     */
    get start(): SourcePosition;
    /**
     * For compatibility with SourceLocation in AST plugins
     *
     * @deprecated use withStart instead
     */
    set start(position: SourcePosition);
    /**
     * For compatibility with SourceLocation in AST plugins
     *
     * @deprecated use endPosition instead
     */
    get end(): SourcePosition;
    /**
     * For compatibility with SourceLocation in AST plugins
     *
     * @deprecated use withEnd instead
     */
    set end(position: SourcePosition);
    /**
     * For compatibility with SourceLocation in AST plugins
     *
     * @deprecated use module instead
     */
    get source(): string;
    collapse(where: 'start' | 'end'): SourceSpan;
    extend(other: SourceSpan): SourceSpan;
    serialize(): SerializedSourceSpan;
    slice({ skipStart, skipEnd }: {
        skipStart?: number;
        skipEnd?: number;
    }): SourceSpan;
    sliceStartChars({ skipStart, chars }: {
        skipStart?: number;
        chars: number;
    }): SourceSpan;
    sliceEndChars({ skipEnd, chars }: {
        skipEnd?: number;
        chars: number;
    }): SourceSpan;
}
declare type AnySpan = HbsSpan | CharPositionSpan | InvisibleSpan;
declare class CharPositionSpan implements SpanData {
    readonly source: Source;
    readonly charPositions: {
        start: CharPosition;
        end: CharPosition;
    };
    readonly kind = OffsetKind.CharPosition;
    _locPosSpan: HbsSpan | BROKEN | null;
    constructor(source: Source, charPositions: {
        start: CharPosition;
        end: CharPosition;
    });
    wrap(): SourceSpan;
    asString(): string;
    getModule(): string;
    getStart(): AnyPosition;
    getEnd(): AnyPosition;
    locDidUpdate(): void;
    toHbsSpan(): HbsSpan | null;
    serialize(): SerializedSourceSpan;
    toCharPosSpan(): CharPositionSpan;
}
export declare class HbsSpan implements SpanData {
    readonly source: Source;
    readonly hbsPositions: {
        start: HbsPosition;
        end: HbsPosition;
    };
    readonly kind = OffsetKind.HbsPosition;
    _charPosSpan: CharPositionSpan | BROKEN | null;
    _providedHbsLoc: SourceLocation | null;
    constructor(source: Source, hbsPositions: {
        start: HbsPosition;
        end: HbsPosition;
    }, providedHbsLoc?: SourceLocation | null);
    serialize(): SerializedConcreteSourceSpan;
    wrap(): SourceSpan;
    private updateProvided;
    locDidUpdate({ start, end }: {
        start?: SourcePosition;
        end?: SourcePosition;
    }): void;
    asString(): string;
    getModule(): string;
    getStart(): AnyPosition;
    getEnd(): AnyPosition;
    toHbsLoc(): SourceLocation;
    toHbsSpan(): HbsSpan;
    toCharPosSpan(): CharPositionSpan | null;
}
declare class InvisibleSpan implements SpanData {
    readonly kind: OffsetKind.Broken | OffsetKind.InternalsSynthetic | OffsetKind.NonExistent;
    readonly loc: SourceLocation;
    readonly string: string | null;
    constructor(kind: OffsetKind.Broken | OffsetKind.InternalsSynthetic | OffsetKind.NonExistent, loc: SourceLocation, string?: string | null);
    serialize(): SerializedConcreteSourceSpan;
    wrap(): SourceSpan;
    asString(): string;
    locDidUpdate({ start, end }: {
        start?: SourcePosition;
        end?: SourcePosition;
    }): void;
    getModule(): string;
    getStart(): AnyPosition;
    getEnd(): AnyPosition;
    toCharPosSpan(): InvisibleSpan;
    toHbsSpan(): null;
    toHbsLoc(): SourceLocation;
}
export declare const span: MatchFn<SourceSpan>;
export declare type SerializedConcreteSourceSpan = /** collapsed */ number | /** normal */ [start: number, size: number] | /** synthetic */ string;
export declare type SerializedSourceSpan = SerializedConcreteSourceSpan | OffsetKind.NonExistent | OffsetKind.Broken;
export {};
//# sourceMappingURL=span.d.ts.map