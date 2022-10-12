import type { NodePath } from '@babel/traverse';
import type { types as t } from '@babel/core';
import State from './state';
export default function failBuild(path: NodePath<t.CallExpression>, state: State): void;
