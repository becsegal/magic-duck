"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initState = void 0;
const cloneDeepWith_1 = __importDefault(require("lodash/cloneDeepWith"));
const cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
const path_1 = require("path");
const shared_internals_1 = require("@embroider/shared-internals");
const babel_import_util_1 = require("babel-import-util");
function initState(t, path, state) {
    state.importUtil = new babel_import_util_1.ImportUtil(t, path);
    state.generatedRequires = new Set();
    state.jobs = [];
    state.removed = new Set();
    state.calledIdentifiers = new Set();
    state.packageCache = shared_internals_1.PackageCache.shared('embroider-stage3', state.opts.appPackageRoot);
    state.sourceFile = state.opts.owningPackageRoot || path.hub.file.opts.filename;
    state.pathToOurAddon = pathToAddon;
    state.owningPackage = owningPackage;
    state.cloneDeep = cloneDeep;
}
exports.initState = initState;
const runtimeAddonPath = (0, path_1.resolve)((0, path_1.join)(__dirname, '..', 'addon'));
function pathToAddon(moduleName) {
    if (!this.opts.owningPackageRoot) {
        // running inside embroider, so make a relative path to the module
        return (0, shared_internals_1.explicitRelative)((0, path_1.dirname)(this.sourceFile), (0, path_1.join)(runtimeAddonPath, moduleName));
    }
    else {
        // running inside a classic build, so use a classic-compatible runtime
        // specifier.
        //
        // CAUTION: the module we're pointing at here gets merged between all
        // present versions of @embroider/macros, and one will win. So if you are
        // introducing incompatible changes to its API, you need to change this name
        // (by tacking on a version number, etc) and rename the corresponding file
        // in ../addon.
        return `@embroider/macros/${moduleName}`;
    }
}
function owningPackage() {
    let pkg = this.packageCache.ownerOfFile(this.sourceFile);
    if (!pkg) {
        throw new Error(`unable to determine which npm package owns the file ${this.sourceFile}`);
    }
    return pkg;
}
function cloneDeep(node) {
    let state = this;
    return (0, cloneDeepWith_1.default)(node, function (value) {
        if (state.generatedRequires.has(value)) {
            let cloned = (0, cloneDeep_1.default)(value);
            state.generatedRequires.add(cloned);
            return cloned;
        }
    });
}
//# sourceMappingURL=state.js.map