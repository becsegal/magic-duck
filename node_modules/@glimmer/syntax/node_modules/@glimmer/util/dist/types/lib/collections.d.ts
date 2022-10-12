import { Dict, Option, Stack } from '@glimmer/interfaces';
export declare function dict<T = unknown>(): Dict<T>;
export declare function isDict<T>(u: T): u is Dict & T;
export declare function isObject<T>(u: T): u is object & T;
export declare class StackImpl<T> implements Stack<T> {
    private stack;
    current: Option<T>;
    constructor(values?: T[]);
    get size(): number;
    push(item: T): void;
    pop(): Option<T>;
    nth(from: number): Option<T>;
    isEmpty(): boolean;
    toArray(): T[];
}
//# sourceMappingURL=collections.d.ts.map