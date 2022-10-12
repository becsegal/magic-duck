import FSTree = require('fs-tree-diff');
export declare type Entry = import('fs-tree-diff').Entry;
export declare type Operation = import('fs-tree-diff').Operation;
export declare type Tree = FSTree;
export declare function syncFiles(src: string, dest: string, changes: Operation[], digests?: Map<string, string>): void;
export declare function writeFile(src: string, dest: string, entry: Entry, digests?: Map<string, string>): void;
export declare function realpath(path: string): string;
export declare function normalize(path: string): string;
export declare function treeFromPath(path: string): FSTree<import("fs-tree-diff/lib/entry").DefaultEntry>;
export declare function treeFromEntries(entries: Entry[], options?: {
    sortAndExpand?: boolean;
}): FSTree;
export declare function normalizeArray<T>(arr: T | T[]): T[];
export declare const nodeModulesPath: (cwd: string) => string;
//# sourceMappingURL=utils.d.ts.map