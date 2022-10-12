import Analyzer, { LiteralImport, TemplateImport } from './analyzer';
import Package from './package';
import BundleConfig from './bundle-config';
export interface ResolvedImport {
    specifier: string;
    packageName: string;
    packageRoot: string;
    importedBy: LiteralImport[];
}
export interface ResolvedTemplateImport {
    cookedQuasis: string[];
    expressionNameHints: string[];
    packageName: string;
    packageRoot: string;
    importedBy: TemplateImport[];
}
export interface BundleDependencies {
    staticImports: ResolvedImport[];
    staticTemplateImports: ResolvedTemplateImport[];
    dynamicImports: ResolvedImport[];
    dynamicTemplateImports: ResolvedTemplateImport[];
}
export interface SplitterOptions {
    bundles: BundleConfig;
    analyzers: Map<Analyzer, Package>;
}
export default class Splitter {
    private options;
    private lastImports;
    private lastDeps;
    private packageVersions;
    constructor(options: SplitterOptions);
    deps(): Promise<Map<string, BundleDependencies>>;
    private importsChanged;
    private computeTargets;
    private handleLiteralImport;
    private handleTemplateImport;
    private versionOfPackage;
    private assertSafeVersion;
    private computeDeps;
    private sortDependencies;
    private sortBundle;
    private chooseBundle;
    private bundleFor;
}
