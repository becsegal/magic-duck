"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const semver_1 = require("semver");
const error_1 = __importDefault(require("./error"));
const evaluate_json_1 = require("./evaluate-json");
function dependencySatisfies(path, state) {
    if (path.node.arguments.length !== 2) {
        throw (0, error_1.default)(path, `dependencySatisfies takes exactly two arguments, you passed ${path.node.arguments.length}`);
    }
    const [packageName, range] = path.node.arguments;
    if (packageName.type !== 'StringLiteral') {
        throw (0, error_1.default)((0, evaluate_json_1.assertArray)(path.get('arguments'))[0], `the first argument to dependencySatisfies must be a string literal`);
    }
    if (range.type !== 'StringLiteral') {
        throw (0, error_1.default)((0, evaluate_json_1.assertArray)(path.get('arguments'))[1], `the second argument to dependencySatisfies must be a string literal`);
    }
    try {
        let us = state.packageCache.ownerOfFile(state.sourceFile);
        if (!(us === null || us === void 0 ? void 0 : us.hasDependency(packageName.value))) {
            return false;
        }
        let version = state.packageCache.resolve(packageName.value, us).version;
        return (0, semver_1.satisfies)(version, range.value, {
            includePrerelease: true,
        });
    }
    catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') {
            throw err;
        }
        return false;
    }
}
exports.default = dependencySatisfies;
//# sourceMappingURL=dependency-satisfies.js.map