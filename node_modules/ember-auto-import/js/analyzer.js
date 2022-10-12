"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const broccoli_funnel_1 = require("broccoli-funnel");
const walk_sync_1 = __importDefault(require("walk-sync"));
const fs_1 = require("fs");
const fs_tree_diff_1 = __importDefault(require("fs-tree-diff"));
const debug_1 = __importDefault(require("debug"));
const path_1 = require("path");
const lodash_1 = require("lodash");
const analyzer_syntax_1 = require("./analyzer-syntax");
const typescript_memoize_1 = require("typescript-memoize");
debug_1.default.formatters.m = (modules) => {
    return JSON.stringify(modules.map((m) => {
        if ('specifier' in m) {
            return {
                specifier: m.specifier,
                path: m.path,
                isDynamic: m.isDynamic,
                package: m.package.name,
                treeType: m.treeType,
            };
        }
        else {
            return {
                cookedQuasis: m.cookedQuasis,
                expressionNameHints: m.expressionNameHints,
                path: m.path,
                isDynamic: m.isDynamic,
                package: m.package.name,
                treeType: m.treeType,
            };
        }
    }), null, 2);
};
const debug = debug_1.default('ember-auto-import:analyzer');
/*
  Analyzer discovers and maintains info on all the module imports that
  appear in a broccoli tree.
*/
class Analyzer extends broccoli_funnel_1.Funnel {
    constructor(inputTree, pack, treeType, supportsFastAnalyzer) {
        super(inputTree, {
            annotation: 'ember-auto-import-analyzer',
        });
        this.pack = pack;
        this.treeType = treeType;
        this.supportsFastAnalyzer = supportsFastAnalyzer;
        this.previousTree = new fs_tree_diff_1.default();
        this.modules = [];
        this.paths = new Map();
    }
    get imports() {
        if (!this.modules) {
            this.modules = lodash_1.flatten([...this.paths.values()]);
            debug('imports %m', this.modules);
        }
        return this.modules;
    }
    build(...args) {
        const _super = Object.create(null, {
            build: { get: () => super.build }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.build.call(this, ...args);
            for (let [operation, relativePath] of this.getPatchset()) {
                switch (operation) {
                    case 'unlink':
                        if (this.matchesExtension(relativePath)) {
                            this.removeImports(relativePath);
                        }
                        break;
                    case 'change':
                    case 'create': {
                        if (this.matchesExtension(relativePath)) {
                            yield this.updateImports(relativePath);
                        }
                    }
                }
            }
        });
    }
    getPatchset() {
        let input = walk_sync_1.default.entries(this.inputPaths[0]);
        let previous = this.previousTree;
        let next = (this.previousTree = fs_tree_diff_1.default.fromEntries(input));
        return previous.calculatePatch(next);
    }
    matchesExtension(path) {
        return this.pack.fileExtensions.includes(path_1.extname(path).slice(1));
    }
    removeImports(relativePath) {
        debug(`removing imports for ${relativePath}`);
        let imports = this.paths.get(relativePath);
        if (imports) {
            if (imports.length > 0) {
                this.modules = null; // invalidates cache
            }
            this.paths.delete(relativePath);
        }
    }
    updateImports(relativePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let meta;
            if (this.supportsFastAnalyzer) {
                debug(`updating imports for ${relativePath}`);
                let stream = fs_1.createReadStream(path_1.join(this.inputPaths[0], relativePath), {
                    encoding: 'utf8',
                    // @ts-ignore
                    emitClose: true, // Needs to be specified for Node 12, as default is false
                });
                meta = yield analyzer_syntax_1.deserialize(stream);
            }
            else {
                debug(`updating imports (the slower way) for ${relativePath}`);
                let parse = yield this.parser();
                meta = parse(fs_1.readFileSync(path_1.join(this.inputPaths[0], relativePath), 'utf8'), relativePath);
            }
            let newImports = meta.map((m) => (Object.assign({ path: relativePath, package: this.pack, treeType: this.treeType }, m)));
            if (!lodash_1.isEqual(this.paths.get(relativePath), newImports)) {
                this.paths.set(relativePath, newImports);
                this.modules = null; // invalidates cache
            }
        });
    }
    parser() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.pack.babelMajorVersion !== 7) {
                throw new Error(`don't know how to setup a parser for Babel version ${this.pack.babelMajorVersion} (used by ${this.pack.name})`);
            }
            const { transformSync } = yield Promise.resolve().then(() => __importStar(require('@babel/core')));
            const analyzerPlugin = require.resolve('./analyzer-plugin');
            return (source, relativePath) => {
                let options = Object.assign({}, this.pack.babelOptions);
                options.code = false;
                options.filename = relativePath;
                if (options.plugins) {
                    options.plugins = options.plugins.slice();
                }
                else {
                    options.plugins = [];
                }
                let analyzerOptions = {
                    imports: [],
                };
                options.plugins.unshift([analyzerPlugin, analyzerOptions]);
                try {
                    transformSync(source, options);
                }
                catch (err) {
                    if (err.name !== 'SyntaxError') {
                        throw err;
                    }
                    debug('Ignoring an unparseable file');
                }
                return analyzerOptions.imports;
            };
        });
    }
}
__decorate([
    typescript_memoize_1.Memoize()
], Analyzer.prototype, "parser", null);
exports.default = Analyzer;
//# sourceMappingURL=analyzer.js.map