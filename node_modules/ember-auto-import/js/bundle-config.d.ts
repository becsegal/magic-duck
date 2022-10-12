import type { TreeType } from './analyzer';
export declare type BundleName = 'app' | 'tests';
export declare type BundleType = 'js' | 'css';
interface OutputPaths {
    vendor: {
        js: string;
        css: string;
    };
    app: {
        html: string;
    };
}
export default class BundleConfig {
    private outputPaths;
    constructor(outputPaths: OutputPaths);
    get names(): ReadonlyArray<BundleName>;
    isBuiltInBundleName(name: string): name is BundleName;
    get types(): ReadonlyArray<BundleType>;
    bundleEntrypoint(name: BundleName, type: BundleType): string;
    bundleForTreeType(treeType: TreeType): BundleName;
    bundleForPath(path: string): BundleName;
    get lazyChunkPath(): string;
    htmlEntrypoints(): string[];
}
export {};
