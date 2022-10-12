import { PresentArray } from '@glimmer/interfaces';
import { SourceSpan } from './span';
export interface SourceLocation {
    start: SourcePosition;
    end: SourcePosition;
}
export interface SourcePosition {
    /** >= 1 */
    line: number;
    /** >= 0 */
    column: number;
}
export declare const UNKNOWN_POSITION: Readonly<{
    readonly line: 1;
    readonly column: 0;
}>;
export declare const SYNTHETIC_LOCATION: Readonly<{
    readonly source: "(synthetic)";
    readonly start: Readonly<{
        readonly line: 1;
        readonly column: 0;
    }>;
    readonly end: Readonly<{
        readonly line: 1;
        readonly column: 0;
    }>;
}>;
/** @deprecated */
export declare const SYNTHETIC: Readonly<{
    readonly source: "(synthetic)";
    readonly start: Readonly<{
        readonly line: 1;
        readonly column: 0;
    }>;
    readonly end: Readonly<{
        readonly line: 1;
        readonly column: 0;
    }>;
}>;
export declare const TEMPORARY_LOCATION: Readonly<{
    readonly source: "(temporary)";
    readonly start: Readonly<{
        readonly line: 1;
        readonly column: 0;
    }>;
    readonly end: Readonly<{
        readonly line: 1;
        readonly column: 0;
    }>;
}>;
export declare const NON_EXISTENT_LOCATION: Readonly<{
    readonly source: "(nonexistent)";
    readonly start: Readonly<{
        readonly line: 1;
        readonly column: 0;
    }>;
    readonly end: Readonly<{
        readonly line: 1;
        readonly column: 0;
    }>;
}>;
export declare const BROKEN_LOCATION: Readonly<{
    readonly source: "(broken)";
    readonly start: Readonly<{
        readonly line: 1;
        readonly column: 0;
    }>;
    readonly end: Readonly<{
        readonly line: 1;
        readonly column: 0;
    }>;
}>;
export declare type LocatedWithSpan = {
    offsets: SourceSpan;
};
export declare type LocatedWithOptionalSpan = {
    offsets: SourceSpan | null;
};
export declare type LocatedWithPositions = {
    loc: SourceLocation;
};
export declare type LocatedWithOptionalPositions = {
    loc?: SourceLocation;
};
export declare function isLocatedWithPositionsArray(location: LocatedWithOptionalPositions[]): location is PresentArray<LocatedWithPositions>;
export declare function isLocatedWithPositions(location: LocatedWithOptionalPositions): location is LocatedWithPositions;
export declare type HasSourceLocation = SourceLocation | LocatedWithPositions | PresentArray<LocatedWithPositions>;
export declare type MaybeHasSourceLocation = null | LocatedWithOptionalPositions | LocatedWithOptionalPositions[];
//# sourceMappingURL=location.d.ts.map