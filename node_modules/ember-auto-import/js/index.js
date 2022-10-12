"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auto_import_1 = __importDefault(require("./auto-import"));
// @ts-ignore
const package_1 = __importDefault(require("../package"));
module.exports = {
    name: package_1.default.name,
    init(...args) {
        this._super.init.apply(this, args);
        auto_import_1.default.register(this);
    },
    setupPreprocessorRegistry(type, registry) {
        // we register on our parent registry (so we will process code
        // from the app or addon that chose to include us) rather than our
        // own registry (which would cause us to process our own code)
        if (type !== 'parent') {
            return;
        }
        // This is where we hook our analyzer into the build pipeline so
        // it will see all the consumer app or addon's javascript
        registry.add('js', {
            name: 'ember-auto-import-analyzer',
            toTree: (tree, _inputPath, _outputPath, options) => {
                let treeType;
                if (typeof options === 'object' &&
                    options !== null &&
                    options.treeType) {
                    treeType = options.treeType;
                }
                return auto_import_1.default.lookup(this).analyze(tree, this, treeType, true);
            },
        });
    },
    included(...args) {
        this._super.included.apply(this, ...args);
        auto_import_1.default.lookup(this).included(this);
    },
    // this exists to be called by @embroider/addon-shim
    registerV2Addon(packageName, packageRoot) {
        auto_import_1.default.lookup(this).registerV2Addon(packageName, packageRoot);
    },
    // this only runs on top-level addons, so we don't need our own
    // !isDeepAddonInstance check here.
    postprocessTree(which, tree) {
        if (which === 'all') {
            return auto_import_1.default.lookup(this).addTo(tree);
        }
        else {
            return tree;
        }
    },
};
//# sourceMappingURL=index.js.map