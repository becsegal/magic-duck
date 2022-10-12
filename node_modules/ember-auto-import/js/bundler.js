"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugBundler = void 0;
const broccoli_debug_1 = require("broccoli-debug");
const debugTree = broccoli_debug_1.buildDebugCallback('ember-auto-import');
// a Bundler is a broccoli transform node that also has an added property, so to
// wrap it in broccoli-debug we need a little extra work
function debugBundler(bundler, label) {
    let outputTree = debugTree(bundler, label);
    if (outputTree !== bundler) {
        Object.defineProperty(outputTree, 'buildResult', {
            get() {
                return bundler.buildResult;
            },
        });
    }
    return outputTree;
}
exports.debugBundler = debugBundler;
//# sourceMappingURL=bundler.js.map