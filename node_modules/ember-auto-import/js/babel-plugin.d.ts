import type * as Babel from '@babel/core';
import type { NodePath } from '@babel/core';
declare function emberAutoImport(babel: typeof Babel): {
    inherits: any;
    visitor: {
        Import(path: Babel.NodePath<Babel.types.Import>): void;
        CallExpression(path: Babel.NodePath<Babel.types.CallExpression>): void;
    };
};
declare namespace emberAutoImport {
    var baseDir: () => string;
}
export = emberAutoImport;
