"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const crypto_1 = __importDefault(require("crypto"));
const find_up_1 = __importDefault(require("find-up"));
const shared_internals_1 = require("@embroider/shared-internals");
const ast_transform_1 = require("./glimmer/ast-transform");
const partition_1 = __importDefault(require("lodash/partition"));
// this is a module-scoped cache. If multiple callers ask _this copy_ of
// @embroider/macros for a shared MacrosConfig, they'll all get the same one.
// And if somebody asks a *different* copy of @embroider/macros for the shared
// MacrosConfig, it will have its own instance with its own code, but will still
// share the GlobalSharedState beneath.
let localSharedState = new WeakMap();
function gatherAddonCacheKeyWorker(item, memo) {
    item.addons.forEach((addon) => {
        let key = `${addon.pkg.name}@${addon.pkg.version}`;
        memo.add(key);
        gatherAddonCacheKeyWorker(addon, memo);
    });
}
let addonCacheKey = new WeakMap();
// creates a string representing all addons and their versions
// (foo@1.0.0|bar@2.0.0) to use as a cachekey
function gatherAddonCacheKey(project) {
    let cacheKey = addonCacheKey.get(project);
    if (cacheKey) {
        return cacheKey;
    }
    let memo = new Set();
    project.addons.forEach((addon) => {
        let key = `${addon.pkg.name}@${addon.pkg.version}`;
        memo.add(key);
        gatherAddonCacheKeyWorker(addon, memo);
    });
    cacheKey = [...memo].join('|');
    addonCacheKey.set(project, cacheKey);
    return cacheKey;
}
class MacrosConfig {
    constructor(appRoot) {
        this.appRoot = appRoot;
        this.mode = 'compile-time';
        this.globalConfig = {};
        this.isDevelopingPackageRoots = new Set();
        this._importSyncImplementation = 'cjs';
        this._configWritable = true;
        this.configs = new Map();
        this.configSources = new WeakMap();
        this.mergers = new Map();
        this.moves = new Map();
        // this uses globalConfig because these things truly are global. Even if a
        // package doesn't have a dep or peerDep on @embroider/macros, it's legit
        // for them to want to know the answer to these questions, and there is only
        // one answer throughout the whole dependency graph.
        this.globalConfig['@embroider/macros'] = {
            // this powers the `isTesting` macro. It always starts out false here,
            // because:
            //  - if this is a production build, we will evaluate all macros at build
            //    time and isTesting will stay false, so test-only code will not be
            //    included.
            //  - if this is a dev build, we evaluate macros at runtime, which allows
            //    both "I'm running my app in development" and "I'm running my test
            //    suite" to coexist within a single build. When you run the test
            //    suite, early in the runtime boot process we can flip isTesting to
            //    true to distinguish the two.
            isTesting: false,
        };
        this.packageCache = shared_internals_1.PackageCache.shared('embroider-stage3', appRoot);
    }
    static for(key, appRoot) {
        let found = localSharedState.get(key);
        if (found) {
            return found;
        }
        let g = global;
        if (!g.__embroider_macros_global__) {
            g.__embroider_macros_global__ = new WeakMap();
        }
        let shared = g.__embroider_macros_global__.get(key);
        if (shared) {
            // if an earlier version of @embroider/macros created the shared state, it
            // would have configSources.
            if (!shared.configSources) {
                shared.configSources = new WeakMap();
            }
        }
        else {
            shared = {
                configs: new Map(),
                configSources: new WeakMap(),
                mergers: new Map(),
            };
            g.__embroider_macros_global__.set(key, shared);
        }
        let config = new MacrosConfig(appRoot);
        config.configs = shared.configs;
        config.configSources = shared.configSources;
        config.mergers = shared.mergers;
        localSharedState.set(key, config);
        return config;
    }
    enableRuntimeMode() {
        if (this.mode !== 'run-time') {
            if (!this._configWritable) {
                throw new Error(`[Embroider:MacrosConfig] attempted to enableRuntimeMode after configs have been finalized`);
            }
            this.mode = 'run-time';
        }
    }
    enablePackageDevelopment(packageRoot) {
        if (!this.isDevelopingPackageRoots.has(packageRoot)) {
            if (!this._configWritable) {
                throw new Error(`[Embroider:MacrosConfig] attempted to enablePackageDevelopment after configs have been finalized`);
            }
            this.isDevelopingPackageRoots.add(packageRoot);
        }
    }
    get importSyncImplementation() {
        return this._importSyncImplementation;
    }
    set importSyncImplementation(value) {
        if (!this._configWritable) {
            throw new Error(`[Embroider:MacrosConfig] attempted to set importSyncImplementation after configs have been finalized`);
        }
        this._importSyncImplementation = value;
    }
    // Registers a new source of configuration to be given to the named package.
    // Your config type must be json-serializable. You must always set fromPath to
    // `__filename`.
    setConfig(fromPath, packageName, config) {
        return this.internalSetConfig(fromPath, packageName, config);
    }
    // Registers a new source of configuration to be given to your own package.
    // Your config type must be json-serializable. You must always set fromPath to
    // `__filename`.
    setOwnConfig(fromPath, config) {
        return this.internalSetConfig(fromPath, undefined, config);
    }
    // Registers a new source of configuration to be shared globally within the
    // app. USE GLOBALS SPARINGLY! Prefer setConfig or setOwnConfig instead,
    // unless your state is truly, necessarily global.
    //
    // Include a relevant package name in your key to help avoid collisions.
    //
    // Your value must be json-serializable. You must always set fromPath to
    // `__filename`.
    setGlobalConfig(fromPath, key, value) {
        if (!this._configWritable) {
            throw new Error(`[Embroider:MacrosConfig] attempted to set global config after configs have been finalized from: '${fromPath}'`);
        }
        this.globalConfig[key] = value;
    }
    internalSetConfig(fromPath, packageName, config) {
        if (!this._configWritable) {
            throw new Error(`[Embroider:MacrosConfig] attempted to set config after configs have been finalized from: '${fromPath}'`);
        }
        if (!isSerializable(config)) {
            throw new Error(`[Embroider:MacrosConfig] the given config from '${fromPath}' for packageName '${packageName}' is not JSON serializable.`);
        }
        let targetPackage = this.resolvePackage(fromPath, packageName);
        let peers = (0, shared_internals_1.getOrCreate)(this.configs, targetPackage.root, () => []);
        peers.push(config);
        this.configSources.set(config, fromPath);
    }
    // Allows you to set the merging strategy used for your package's config. The
    // merging strategy applies when multiple other packages all try to send
    // configuration to you.
    useMerger(fromPath, merger) {
        if (this._configWritable) {
            throw new Error(`[Embroider:MacrosConfig] attempted to call useMerger after configs have been finalized`);
        }
        let targetPackage = this.resolvePackage(fromPath, undefined);
        let other = this.mergers.get(targetPackage.root);
        if (other) {
            throw new Error(`[Embroider:MacrosConfig] conflicting mergers registered for package ${targetPackage.name} at ${targetPackage.root}. See ${other.fromPath} and ${fromPath}.`);
        }
        this.mergers.set(targetPackage.root, { merger, fromPath });
    }
    get userConfigs() {
        if (this._configWritable) {
            throw new Error('[Embroider:MacrosConfig] cannot read userConfigs until MacrosConfig has been finalized.');
        }
        if (!this.cachedUserConfigs) {
            let userConfigs = {};
            let sourceOfConfig = this.makeConfigSourcer(this.configSources);
            for (let [pkgRoot, configs] of this.configs) {
                let combined;
                if (configs.length > 1) {
                    combined = this.mergerFor(pkgRoot)(configs, { sourceOfConfig });
                }
                else {
                    combined = configs[0];
                }
                userConfigs[pkgRoot] = combined;
            }
            for (let [oldPath, newPath] of this.moves) {
                userConfigs[newPath] = userConfigs[oldPath];
            }
            this.cachedUserConfigs = userConfigs;
        }
        return this.cachedUserConfigs;
    }
    makeConfigSourcer(configSources) {
        return config => {
            let fromPath = configSources.get(config);
            if (!fromPath) {
                throw new Error(`unknown object passed to sourceOfConfig(). You can only pass back the configs you were given.`);
            }
            let maybePkg = this.packageCache.ownerOfFile(fromPath);
            if (!maybePkg) {
                throw new Error(`bug: unexpected error, we always check that fromPath is owned during internalSetConfig so this should never happen`);
            }
            let pkg = maybePkg;
            return {
                get name() {
                    return pkg.name;
                },
                get version() {
                    return pkg.version;
                },
                get root() {
                    return pkg.root;
                },
            };
        };
    }
    // to be called from within your build system. Returns the thing you should
    // push into your babel plugins list.
    //
    // owningPackageRoot is needed when the files you will process (1) all belongs
    // to one package, (2) will not be located in globally correct paths such that
    // normal node_modules resolution can find their dependencies. In other words,
    // owningPackageRoot is needed when you use this inside classic ember-cli, and
    // it's not appropriate inside embroider.
    babelPluginConfig(appOrAddonInstance) {
        var _a;
        let self = this;
        let owningPackageRoot = appOrAddonInstance ? appOrAddonInstance.root || appOrAddonInstance.project.root : null;
        let opts = {
            // this is deliberately lazy because we want to allow everyone to finish
            // setting config before we generate the userConfigs
            get userConfigs() {
                return self.userConfigs;
            },
            get globalConfig() {
                return self.globalConfig;
            },
            owningPackageRoot,
            isDevelopingPackageRoots: [...this.isDevelopingPackageRoots].map(root => this.moves.get(root) || root),
            appPackageRoot: (_a = this.moves.get(this.appRoot)) !== null && _a !== void 0 ? _a : this.appRoot,
            // This is used as a signature so we can detect ourself among the plugins
            // emitted from v1 addons.
            embroiderMacrosConfigMarker: true,
            get mode() {
                return self.mode;
            },
            importSyncImplementation: this.importSyncImplementation,
        };
        let lockFilePath = find_up_1.default.sync(['yarn.lock', 'package-lock.json', 'pnpm-lock.yaml'], { cwd: opts.appPackageRoot });
        if (!lockFilePath) {
            lockFilePath = find_up_1.default.sync('package.json', { cwd: opts.appPackageRoot });
        }
        let lockFileBuffer = lockFilePath ? fs_1.default.readFileSync(lockFilePath) : 'no-cache-key';
        // @embroider/macros provides a macro called dependencySatisfies which checks if a given
        // package name satisfies a given semver version range. Due to the way babel caches this can
        // cause a problem where the macro plugin does not run (because it has been cached) but the version
        // of the dependency being checked for changes (due to installing a different version). This will lead to
        // the old evaluated state being used which might be invalid. This cache busting plugin keeps track of a
        // hash representing the lock file of the app and if it ever changes forces babel to rerun its plugins.
        // more information in issue #906
        let hash = crypto_1.default.createHash('sha256');
        hash = hash.update(lockFileBuffer);
        if (appOrAddonInstance) {
            // ensure that the actual running addon names and versions are accounted
            // for in the cache key; this ensures that we still invalidate the cache
            // when linking another project (e.g. ember-source) which would normally
            // not cause the lockfile to change;
            hash = hash.update(gatherAddonCacheKey(appOrAddonInstance.project));
        }
        let cacheKey = hash.digest('hex');
        return [
            [(0, path_1.join)(__dirname, 'babel', 'macros-babel-plugin.js'), opts],
            [
                require.resolve('@embroider/shared-internals/src/babel-plugin-cache-busting.js'),
                { version: cacheKey },
                `@embroider/macros cache buster: ${owningPackageRoot}`,
            ],
        ];
    }
    static astPlugins(owningPackageRoot) {
        let configs;
        let lazyParams = {
            // this is deliberately lazy because we want to allow everyone to finish
            // setting config before we generate the userConfigs
            get configs() {
                if (!configs) {
                    throw new Error(`Bug: @embroider/macros ast-transforms were not plugged into a MacrosConfig`);
                }
                return configs.userConfigs;
            },
            packageRoot: owningPackageRoot,
            get appRoot() {
                if (!configs) {
                    throw new Error(`Bug: @embroider/macros ast-transforms were not plugged into a MacrosConfig`);
                }
                return configs.appRoot;
            },
        };
        let plugins = [(0, ast_transform_1.makeFirstTransform)(lazyParams), (0, ast_transform_1.makeSecondTransform)()].reverse();
        function setConfig(c) {
            configs = c;
        }
        return { plugins, setConfig, lazyParams };
    }
    mergerFor(pkgRoot) {
        let entry = this.mergers.get(pkgRoot);
        if (entry) {
            return entry.merger;
        }
        return defaultMergerFor(pkgRoot);
    }
    // this exists because @embroider/compat rewrites and moves v1 addons, and
    // their macro configs need to follow them to their new homes.
    packageMoved(oldPath, newPath) {
        if (!this._configWritable) {
            throw new Error(`[Embroider:MacrosConfig] attempted to call packageMoved after configs have been finalized`);
        }
        this.moves.set(oldPath, newPath);
    }
    resolvePackage(fromPath, packageName) {
        let us = this.packageCache.ownerOfFile(fromPath);
        if (!us) {
            throw new Error(`[Embroider:MacrosConfig] unable to determine which npm package owns the file ${fromPath}`);
        }
        if (packageName) {
            return this.packageCache.resolve(packageName, us);
        }
        else {
            return us;
        }
    }
    finalize() {
        this._configWritable = false;
    }
}
exports.default = MacrosConfig;
function defaultMergerFor(pkgRoot) {
    return function defaultMerger(configs, { sourceOfConfig }) {
        let [ownConfigs, otherConfigs] = (0, partition_1.default)(configs, c => sourceOfConfig(c).root === pkgRoot);
        return Object.assign({}, ...ownConfigs, ...otherConfigs);
    };
}
function isSerializable(obj) {
    if (isScalar(obj)) {
        return true;
    }
    if (Array.isArray(obj)) {
        return !obj.some((arrayItem) => !isSerializable(arrayItem));
    }
    if (isPlainObject(obj)) {
        for (let property in obj) {
            let value = obj[property];
            if (!isSerializable(value)) {
                return false;
            }
        }
        return true;
    }
    console.error('non serializable item found in config:', obj);
    return false;
}
function isScalar(val) {
    return (typeof val === 'undefined' ||
        typeof val === 'string' ||
        typeof val === 'boolean' ||
        typeof val === 'number' ||
        val === null);
}
function isPlainObject(obj) {
    return typeof obj === 'object' && obj.constructor === Object && obj.toString() === '[object Object]';
}
//# sourceMappingURL=macros-config.js.map