import type { Node } from 'broccoli-node-api';
import { Funnel } from 'broccoli-funnel';
import type Package from './package';
import { ImportSyntax, LiteralImportSyntax, TemplateImportSyntax } from './analyzer-syntax';
export declare type TreeType = 'app' | 'addon' | 'addon-templates' | 'addon-test-support' | 'styles' | 'templates' | 'test';
interface PackageContext {
    path: string;
    package: Package;
    treeType: TreeType | undefined;
}
export declare type LiteralImport = LiteralImportSyntax & PackageContext;
export declare type TemplateImport = TemplateImportSyntax & PackageContext;
export declare type Import = LiteralImport | TemplateImport;
export default class Analyzer extends Funnel {
    private pack;
    private treeType;
    private supportsFastAnalyzer;
    private previousTree;
    private modules;
    private paths;
    constructor(inputTree: Node, pack: Package, treeType: TreeType | undefined, supportsFastAnalyzer: true | undefined);
    get imports(): Import[];
    build(...args: unknown[]): Promise<void>;
    private getPatchset;
    private matchesExtension;
    removeImports(relativePath: string): void;
    updateImports(relativePath: string): Promise<void>;
    parser(): Promise<(source: string, relativePath: string) => ImportSyntax[]>;
}
export {};
