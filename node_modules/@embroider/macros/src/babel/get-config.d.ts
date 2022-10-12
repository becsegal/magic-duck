import type { NodePath } from '@babel/traverse';
import State from './state';
import type * as Babel from '@babel/core';
import type { types as t } from '@babel/core';
export declare type Mode = 'own' | 'getGlobalConfig' | 'package';
export default function getConfig(path: NodePath<t.CallExpression>, state: State, mode: Mode): unknown;
export declare function insertConfig(path: NodePath<t.CallExpression>, state: State, mode: Mode, context: typeof Babel): void;
export declare function inlineRuntimeConfig(path: NodePath<t.FunctionDeclaration>, state: State, context: typeof Babel): void;
