import type { Option } from '@glimmer/interfaces';
import { SourceLocation, SourcePosition } from './location';
import { SourceOffset, SourceSpan } from './span';
export declare class Source {
    readonly source: string;
    readonly module: string;
    constructor(source: string, module?: string);
    /**
     * Validate that the character offset represents a position in the source string.
     */
    check(offset: number): boolean;
    slice(start: number, end: number): string;
    offsetFor(line: number, column: number): SourceOffset;
    spanFor({ start, end }: Readonly<SourceLocation>): SourceSpan;
    hbsPosFor(offset: number): Option<SourcePosition>;
    charPosFor(position: SourcePosition): number | null;
}
//# sourceMappingURL=source.d.ts.map