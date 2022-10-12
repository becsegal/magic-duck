import type { NodePath } from '@babel/traverse';
import type { types as t } from '@babel/core';
import State from './state';
export declare type MacroConditionPath = NodePath<t.IfStatement | t.ConditionalExpression> & {
    get(test: 'test'): NodePath<t.CallExpression> & {
        get(callee: 'callee'): NodePath<t.Identifier>;
    };
};
export declare function isMacroConditionPath(path: NodePath<t.IfStatement | t.ConditionalExpression>): path is MacroConditionPath;
export default function macroCondition(conditionalPath: MacroConditionPath, state: State): void;
