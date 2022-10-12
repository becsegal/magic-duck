"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rollup_1 = require("rollup");
const dependencies_1 = require("./dependencies");
const heimdall_1 = require("./heimdall");
const utils_1 = require("./utils");
class RollupHelper {
    constructor(inputPath, buildPath, outputPath, inputOptions, outputOptions, shouldCache) {
        this.inputPath = inputPath;
        this.buildPath = buildPath;
        this.outputPath = outputPath;
        this.inputOptions = inputOptions;
        this.outputOptions = outputOptions;
        this.shouldCache = shouldCache;
        this.digests = new Map();
        this.lastBuildStale = true;
        this.lastBuildTree = undefined;
        this.cache = undefined;
        this.lastOutputTree = undefined;
        this.dependencies = new dependencies_1.default(buildPath);
    }
    async build() {
        const inputTree = this.syncInput();
        // no changes
        if (inputTree === undefined) {
            return;
        }
        const originalWorkingDir = process.cwd();
        try {
            process.chdir(this.buildPath);
            const outputTree = await this.rollup(inputTree);
            this.syncOutput(outputTree);
        }
        finally {
            process.chdir(originalWorkingDir);
        }
    }
    syncInput() {
        const token = heimdall_1.heimdall.start('syncInput');
        try {
            const inputPath = this.inputPath;
            const buildPath = this.buildPath;
            const inputTree = utils_1.treeFromPath(inputPath);
            const lastBuildTree = this.lastBuildTree;
            let inputChanges;
            if (lastBuildTree !== undefined) {
                inputChanges = lastBuildTree.calculatePatch(inputTree);
                if (!this.dependencies.shouldBuild(inputChanges)) {
                    return;
                }
            }
            if (inputChanges === undefined || this.lastBuildStale) {
                // need to use current state of buildPath
                inputChanges = utils_1.treeFromPath(buildPath).calculatePatch(inputTree);
            }
            utils_1.syncFiles(inputPath, buildPath, inputChanges);
            return inputTree;
        }
        finally {
            token.stop();
        }
    }
    async rollup(inputTree) {
        const token = heimdall_1.heimdall.start('rollup');
        try {
            const options = this.inputOptions;
            options.cache = this.cache;
            const build = await rollup_1.rollup(options);
            if (this.shouldCache) {
                this.cache = build.cache;
            }
            for (const outputOptions of this.outputOptions) {
                await build.write(outputOptions);
            }
            const buildTree = utils_1.treeFromPath(this.buildPath);
            const outputTree = calculateOutputTree(inputTree, buildTree);
            // used to check input on next build
            this.dependencies.add(build);
            this.lastBuildTree = buildTree;
            this.lastBuildStale = false;
            return outputTree;
        }
        catch (e) {
            this.lastBuildStale = true;
            throw e;
        }
        finally {
            token.stop();
        }
    }
    syncOutput(outputTree) {
        const token = heimdall_1.heimdall.start('syncOutput');
        try {
            let lastOutputTree = this.lastOutputTree;
            if (lastOutputTree === undefined) {
                lastOutputTree = utils_1.treeFromPath(this.outputPath);
            }
            const outputChanges = lastOutputTree.calculatePatch(outputTree);
            utils_1.syncFiles(this.buildPath, this.outputPath, outputChanges, this.digests);
            this.lastOutputTree = outputTree;
        }
        catch (e) {
            this.lastOutputTree = undefined;
            throw e;
        }
        finally {
            token.stop();
        }
    }
}
exports.default = RollupHelper;
function calculateOutputTree(inputTree, buildTree) {
    const buildDiff = inputTree.calculatePatch(buildTree);
    const outputEntries = buildDiff
        .filter(change => change[0] === 'create')
        .map(change => change[2]);
    return utils_1.treeFromEntries(outputEntries, {
        sortAndExpand: true,
    });
}
//# sourceMappingURL=rollup-helper.js.map