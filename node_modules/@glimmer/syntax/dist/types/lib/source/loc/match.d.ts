import { CharPosition, HbsPosition, InvisiblePosition, OffsetKind, PositionData } from './offset';
/**
 * This file implements the DSL used by span and offset in places where they need to exhaustively
 * consider all combinations of states (Handlebars offsets, character offsets and invisible/broken
 * offsets).
 *
 * It's probably overkill, but it makes the code that uses it clear. It could be refactored or
 * removed.
 */
export declare const MatchAny = "MATCH_ANY";
export declare type MatchAny = 'MATCH_ANY';
declare type Matches = 'Char,Hbs' | 'Hbs,Char' | 'Hbs,Hbs' | 'Char,Char' | 'Invisible,Any' | 'Any,Invisible';
export declare const IsInvisible = "IS_INVISIBLE";
export declare type IsInvisible = 'IS_INVISIBLE';
declare type Pattern = OffsetKind | IsInvisible | MatchAny;
declare class When<Out> {
    _map: Map<Pattern, Out>;
    get(pattern: Pattern, or: () => Out): Out;
    add(pattern: Pattern, out: Out): void;
    match(kind: OffsetKind): Out[];
}
declare type ExhaustiveCheck<Out, In extends Matches, Removed extends Matches> = Exclude<In, Removed> extends never ? ExhaustiveMatcher<Out> : Matcher<Out, Exclude<In, Removed>>;
export declare type MatchFn<Out> = (left: PositionData, right: PositionData) => Out;
interface ExhaustiveMatcher<Out> {
    check(): MatchFn<Out>;
}
export declare function match<Out>(callback: (m: Matcher<Out>) => ExhaustiveMatcher<Out>): MatchFn<Out>;
declare class Matcher<Out, M extends Matches = Matches> {
    _whens: When<When<(left: PositionData, right: PositionData) => Out>>;
    /**
     * You didn't exhaustively match all possibilities.
     */
    protected check(): MatchFn<Out>;
    private matchFor;
    when(left: OffsetKind.CharPosition, right: OffsetKind.HbsPosition, callback: (left: CharPosition, right: HbsPosition) => Out): ExhaustiveCheck<Out, M, 'Char,Hbs'>;
    when(left: OffsetKind.HbsPosition, right: OffsetKind.CharPosition, callback: (left: HbsPosition, right: CharPosition) => Out): ExhaustiveCheck<Out, M, 'Hbs,Char'>;
    when(left: OffsetKind.HbsPosition, right: OffsetKind.HbsPosition, callback: (left: HbsPosition, right: HbsPosition) => Out): ExhaustiveCheck<Out, M, 'Hbs,Hbs'>;
    when(left: OffsetKind.CharPosition, right: OffsetKind.CharPosition, callback: (left: CharPosition, right: CharPosition) => Out): ExhaustiveCheck<Out, M, 'Char,Char'>;
    when(left: IsInvisible, right: MatchAny, callback: (left: InvisiblePosition, right: PositionData) => Out): Matcher<Out, Exclude<M, 'Invisible,Any'>>;
    when(left: MatchAny, right: IsInvisible, callback: (left: PositionData, right: InvisiblePosition) => Out): ExhaustiveCheck<Out, M, 'Any,Invisible'>;
    when(left: MatchAny, right: MatchAny, callback: (left: PositionData, right: PositionData) => Out): ExhaustiveMatcher<Out>;
}
export {};
//# sourceMappingURL=match.d.ts.map