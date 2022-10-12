import type { NodePath } from '@babel/traverse';
import type * as Babel from '@babel/core';
import type { types as t } from '@babel/core';
import State from './state';
export interface ConfidentResult {
    confident: true;
    value: any;
}
export interface UnknownResult {
    confident: false;
}
export declare type EvaluateResult = ConfidentResult | UnknownResult;
export interface EvaluationEnv {
    knownPaths?: Map<NodePath, EvaluateResult>;
    locals?: {
        [localVar: string]: any;
    };
    state?: State;
}
export declare class Evaluator {
    private knownPaths;
    private locals;
    private state;
    constructor(env?: EvaluationEnv);
    evaluateMember(path: NodePath<t.MemberExpression | t.OptionalMemberExpression>, optionalChain: boolean): EvaluateResult;
    evaluateKey(path: NodePath): EvaluateResult;
    evaluate(path: NodePath): EvaluateResult;
    private realEvaluate;
    private maybeEvaluateRuntimeConfig;
    evaluateMacroCall(path: NodePath<t.CallExpression>): EvaluateResult;
}
export declare function assertNotArray<T>(input: T | T[]): T;
export declare function assertArray<T>(input: T | T[]): T[];
export declare function buildLiterals(value: unknown | undefined, babelContext: typeof Babel): t.Identifier | t.ObjectExpression;
