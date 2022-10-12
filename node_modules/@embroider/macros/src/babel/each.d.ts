import type { NodePath } from '@babel/traverse';
import type { types as t } from '@babel/core';
import State from './state';
import type * as Babel from '@babel/core';
declare type CallEachExpression = NodePath<t.CallExpression> & {
    get(callee: 'callee'): NodePath<t.Identifier>;
};
export declare type EachPath = NodePath<t.ForOfStatement> & {
    get(right: 'right'): CallEachExpression;
};
export declare function isEachPath(path: NodePath<t.ForOfStatement>): path is EachPath;
export declare function insertEach(path: EachPath, state: State, context: typeof Babel): void;
export {};
