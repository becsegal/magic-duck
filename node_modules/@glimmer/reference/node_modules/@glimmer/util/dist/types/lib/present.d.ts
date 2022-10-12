import { Option, PresentArray } from '@glimmer/interfaces';
export declare function isPresent<T>(list: readonly T[]): list is PresentArray<T>;
export declare function ifPresent<T, U, V>(list: T[], ifPresent: (input: PresentArray<T>) => U, otherwise: () => V): U | V;
export declare function toPresentOption<T>(list: T[]): Option<PresentArray<T>>;
export declare function assertPresent<T>(list: T[], message?: string): asserts list is PresentArray<T>;
export declare function mapPresent<T, U>(list: PresentArray<T>, callback: (input: T) => U): PresentArray<U>;
export declare function mapPresent<T, U>(list: PresentArray<T> | null, callback: (input: T) => U): PresentArray<U> | null;
//# sourceMappingURL=present.d.ts.map