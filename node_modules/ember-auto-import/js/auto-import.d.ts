import Analyzer from './analyzer';
import type { TreeType } from './analyzer';
import type { Node } from 'broccoli-node-api';
import { AddonInstance } from '@embroider/shared-internals';
export interface AutoImportSharedAPI {
    isPrimary(addonInstance: AddonInstance): boolean;
    analyze(tree: Node, addon: AddonInstance, treeType?: TreeType, supportsFastAnalyzer?: true): Node;
    included(addonInstance: AddonInstance): void;
    addTo(tree: Node): Node;
    registerV2Addon(packageName: string, packageRoot: string): void;
}
export default class AutoImport implements AutoImportSharedAPI {
    private packages;
    private env;
    private consoleWrite;
    private analyzers;
    private bundles;
    private v2Addons;
    static register(addon: AddonInstance): void;
    static lookup(addon: AddonInstance): AutoImportSharedAPI;
    constructor(addonInstance: AddonInstance);
    isPrimary(_addon: AddonInstance): boolean;
    analyze(tree: Node, addon: AddonInstance, treeType?: TreeType, supportsFastAnalyzer?: true): Analyzer;
    registerV2Addon(packageName: string, packageRoot: string): void;
    private makeBundler;
    private get rootPackage();
    addTo(allAppTree: Node): Node;
    included(addonInstance: AddonInstance): void;
    private installBabelPlugin;
    private configureFingerprints;
}
