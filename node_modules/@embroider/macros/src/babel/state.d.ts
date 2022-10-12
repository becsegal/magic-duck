import type { NodePath, Node } from '@babel/traverse';
import { Package, PackageCache } from '@embroider/shared-internals';
import { ImportUtil } from 'babel-import-util';
import type * as Babel from '@babel/core';
export default interface State {
    importUtil: ImportUtil;
    generatedRequires: Set<Node>;
    removed: Set<Node>;
    calledIdentifiers: Set<Node>;
    jobs: (() => void)[];
    packageCache: PackageCache;
    sourceFile: string;
    pathToOurAddon(moduleName: string): string;
    owningPackage(): Package;
    cloneDeep(node: Node): Node;
    opts: {
        userConfigs: {
            [pkgRoot: string]: unknown;
        };
        globalConfig: {
            [key: string]: unknown;
        };
        owningPackageRoot: string | undefined;
        isDevelopingPackageRoots: string[];
        appPackageRoot: string;
        embroiderMacrosConfigMarker: true;
        mode: 'compile-time' | 'run-time';
        importSyncImplementation: 'cjs' | 'eager';
    };
}
export declare function initState(t: typeof Babel.types, path: NodePath<Babel.types.Program>, state: State): void;
