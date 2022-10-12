import { Source } from './index';
import { SerializedSourceSpan, SourceSpan } from './span';
export declare type SerializedSourceSlice<Chars extends string = string> = [
    chars: Chars,
    span: SerializedSourceSpan
];
export declare class SourceSlice<Chars extends string = string> {
    static synthetic<S extends string>(chars: S): SourceSlice<S>;
    static load(source: Source, slice: SerializedSourceSlice): SourceSlice;
    readonly chars: Chars;
    readonly loc: SourceSpan;
    constructor(options: {
        loc: SourceSpan;
        chars: Chars;
    });
    getString(): string;
    serialize(): SerializedSourceSlice<Chars>;
}
//# sourceMappingURL=slice.d.ts.map