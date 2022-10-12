import type { PluginItem } from '@babel/core';
import { FirstTransformParams } from './glimmer/ast-transform';
export declare type SourceOfConfig = (config: object) => {
    readonly name: string;
    readonly root: string;
    readonly version: string;
};
export declare type Merger = (configs: object[], params: {
    sourceOfConfig: SourceOfConfig;
}) => object;
export default class MacrosConfig {
    private appRoot;
    static for(key: any, appRoot: string): MacrosConfig;
    private mode;
    private globalConfig;
    private isDevelopingPackageRoots;
    enableRuntimeMode(): void;
    enablePackageDevelopment(packageRoot: string): void;
    private _importSyncImplementation;
    get importSyncImplementation(): 'cjs' | 'eager';
    set importSyncImplementation(value: 'cjs' | 'eager');
    private packageCache;
    private constructor();
    private _configWritable;
    private configs;
    private configSources;
    private mergers;
    setConfig(fromPath: string, packageName: string, config: object): void;
    setOwnConfig(fromPath: string, config: object): void;
    setGlobalConfig(fromPath: string, key: string, value: object): void;
    private internalSetConfig;
    useMerger(fromPath: string, merger: Merger): void;
    private cachedUserConfigs;
    private get userConfigs();
    private makeConfigSourcer;
    babelPluginConfig(appOrAddonInstance?: any): PluginItem[];
    static astPlugins(owningPackageRoot?: string): {
        plugins: Function[];
        setConfig: (config: MacrosConfig) => void;
        lazyParams: FirstTransformParams;
    };
    private mergerFor;
    packageMoved(oldPath: string, newPath: string): void;
    private moves;
    private resolvePackage;
    finalize(): void;
}
