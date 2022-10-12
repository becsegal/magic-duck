export declare const EMPTY_ARRAY: readonly unknown[];
export declare function emptyArray<T extends unknown>(): T[];
export declare const EMPTY_STRING_ARRAY: string[];
export declare const EMPTY_NUMBER_ARRAY: number[];
/**
 * This function returns `true` if the input array is the special empty array sentinel,
 * which is sometimes used for optimizations.
 */
export declare function isEmptyArray(input: unknown[] | readonly unknown[]): boolean;
//# sourceMappingURL=array-utils.d.ts.map