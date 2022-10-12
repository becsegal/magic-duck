"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rollup_pluginutils_1 = require("rollup-pluginutils");
const utils_1 = require("./utils");
class Dependencies {
    constructor(buildPath) {
        this.inputDependencies = new Set();
        this.filter = rollup_pluginutils_1.createFilter();
        this.buildPath = utils_1.realpath(buildPath);
    }
    add(rollupBuild) {
        const watchedFiles = rollupBuild.watchFiles;
        const buildPath = this.buildPath;
        const relativeStart = buildPath.length + 1;
        const inputDependencies = new Set();
        for (const watchedFile of watchedFiles) {
            if (!this.filter(watchedFile)) {
                continue;
            }
            const normalized = utils_1.realpath(watchedFile);
            if (normalized.startsWith(buildPath)) {
                inputDependencies.add(normalized.slice(relativeStart));
            }
        }
        this.inputDependencies = inputDependencies;
    }
    shouldBuild(inputChanges) {
        // is undefined on first build
        const inputDependencies = this.inputDependencies;
        let shouldBuild = false;
        for (const change of inputChanges) {
            const inputPath = change[1];
            if (inputDependencies.has(inputPath)) {
                shouldBuild = true;
                break;
            }
        }
        return shouldBuild;
    }
}
exports.default = Dependencies;
//# sourceMappingURL=dependencies.js.map