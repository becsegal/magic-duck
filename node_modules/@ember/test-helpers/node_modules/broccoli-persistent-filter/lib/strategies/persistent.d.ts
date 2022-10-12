import { Context, Strategy, InstrumentationSchema } from './strategy';
import AsyncDiskCache = require('async-disk-cache');
import SyncDiskCache = require('sync-disk-cache');
import Dependencies = require('../dependencies');
interface IPersistentStrategy extends Strategy {
    _cache?: AsyncDiskCache;
    _syncCache?: SyncDiskCache;
    cacheKey(ctx: Context): string;
}
declare class PersistentStrategy implements IPersistentStrategy {
    _cache?: AsyncDiskCache;
    _syncCache?: SyncDiskCache;
    init(ctx: Context): void;
    cacheKey(ctx: Context): string;
    processString(ctx: Context, contents: string, relativePath: string, forceInvalidation: boolean, instrumentation: InstrumentationSchema): Promise<string>;
    /**
     * By default initial dependencies are empty.
     * @returns {Dependencies}
     */
    initialDependencies(rootFS: Dependencies.FSFacade, inputEncoding: string): Dependencies;
    /**
     * Seals the dependencies and captures the dependency state.
     * @param dependencies {Dependencies} The dependencies to seal.
     */
    sealDependencies(dependencies: Dependencies): void;
}
export = PersistentStrategy;
//# sourceMappingURL=persistent.d.ts.map