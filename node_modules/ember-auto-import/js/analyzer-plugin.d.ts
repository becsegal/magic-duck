import type { types as t, NodePath } from '@babel/core';
import type * as Babel from '@babel/core';
import { ImportSyntax } from './analyzer-syntax';
interface State {
    imports: ImportSyntax[];
    handled: WeakSet<t.CallExpression>;
    opts: {
        imports?: ImportSyntax[];
    };
}
export = analyzerPlugin;
declare function analyzerPlugin(babel: typeof Babel): {
    visitor: {
        Program: {
            enter(_path: NodePath<t.Program>, state: State): void;
            exit(path: NodePath<t.Program>, state: State): void;
        };
        CallExpression(path: NodePath<t.CallExpression>, state: State): void;
        ImportDeclaration(path: NodePath<t.ImportDeclaration>, state: State): void;
        ExportNamedDeclaration(path: NodePath<t.ExportNamedDeclaration>, state: State): void;
        ExportAllDeclaration(path: NodePath<t.ExportAllDeclaration>, state: State): void;
    };
};
