export * from './lib/array-utils';
export { default as assert, deprecate } from './lib/assert';
export { dict, isDict, isObject, StackImpl as Stack } from './lib/collections';
export * from './lib/dom';
export { isSerializationFirstNode, SERIALIZATION_FIRST_NODE_STRING, } from './lib/is-serialization-first-node';
export { assign, fillNulls, values } from './lib/object-utils';
export * from './lib/platform-utils';
export * from './lib/string';
export * from './lib/immediate';
export * from './lib/template';
export { default as _WeakSet } from './lib/weak-set';
export { castToSimple, castToBrowser, checkNode } from './lib/simple-cast';
export * from './lib/present';
export { default as intern } from './lib/intern';
export { default as buildUntouchableThis } from './lib/untouchable-this';
export { default as debugToString } from './lib/debug-to-string';
export { beginTestSteps, endTestSteps, logStep, verifySteps } from './lib/debug-steps';
export declare type FIXME<T, S extends string> = (T & S) | T;
/**
 * This constant exists to make it easier to differentiate normal logs from
 * errant console.logs. LOCAL_LOGGER should only be used inside a
 * LOCAL_SHOULD_LOG check.
 *
 * It does not alleviate the need to check LOCAL_SHOULD_LOG, which is used
 * for stripping.
 */
export declare const LOCAL_LOGGER: Console;
/**
 * This constant exists to make it easier to differentiate normal logs from
 * errant console.logs. LOGGER can be used outside of LOCAL_SHOULD_LOG checks,
 * and is meant to be used in the rare situation where a console.* call is
 * actually appropriate.
 */
export declare const LOGGER: Console;
export declare function assertNever(value: never, desc?: string): never;
//# sourceMappingURL=index.d.ts.map