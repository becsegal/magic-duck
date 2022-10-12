"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inlineRuntimeConfig = exports.insertConfig = void 0;
const error_1 = __importDefault(require("./error"));
const evaluate_json_1 = require("./evaluate-json");
const assert_never_1 = __importDefault(require("assert-never"));
function getPackage(path, state, mode) {
    let packageName;
    if (mode === 'own') {
        if (path.node.arguments.length !== 0) {
            throw (0, error_1.default)(path, `getOwnConfig takes zero arguments, you passed ${path.node.arguments.length}`);
        }
        packageName = undefined;
    }
    else if (mode === 'package') {
        if (path.node.arguments.length !== 1) {
            throw (0, error_1.default)(path, `getConfig takes exactly one argument, you passed ${path.node.arguments.length}`);
        }
        let packageNode = path.node.arguments[0];
        if (packageNode.type !== 'StringLiteral') {
            throw (0, error_1.default)((0, evaluate_json_1.assertArray)(path.get('arguments'))[0], `the argument to getConfig must be a string literal`);
        }
        packageName = packageNode.value;
    }
    else {
        (0, assert_never_1.default)(mode);
    }
    return targetPackage(state.sourceFile, packageName, state.packageCache);
}
// this evaluates to the actual value of the config. It can be used directly by the Evaluator.
function getConfig(path, state, mode) {
    let config;
    if (mode === 'getGlobalConfig') {
        return state.opts.globalConfig;
    }
    let pkg = getPackage(path, state, mode);
    if (pkg) {
        config = state.opts.userConfigs[pkg.root];
    }
    return config;
}
exports.default = getConfig;
// this is the imperative version that's invoked directly by the babel visitor
// when we encounter getConfig. It's implemented in terms of getConfig so we can
// be sure we have the same semantics.
function insertConfig(path, state, mode, context) {
    if (state.opts.mode === 'compile-time') {
        let config = getConfig(path, state, mode);
        let collapsed = collapse(path, config);
        let literalResult = (0, evaluate_json_1.buildLiterals)(collapsed.config, context);
        collapsed.path.replaceWith(literalResult);
    }
    else {
        if (mode === 'getGlobalConfig') {
            let callee = path.get('callee');
            callee.replaceWith(state.importUtil.import(callee, state.pathToOurAddon('runtime'), 'getGlobalConfig'));
        }
        else {
            let pkg = getPackage(path, state, mode);
            let pkgRoot;
            if (pkg) {
                pkgRoot = context.types.stringLiteral(pkg.root);
            }
            else {
                pkgRoot = context.types.identifier('undefined');
            }
            path.replaceWith(context.types.callExpression(state.importUtil.import(path, state.pathToOurAddon('runtime'), 'config'), [
                pkgRoot,
            ]));
        }
    }
}
exports.insertConfig = insertConfig;
function targetPackage(fromPath, packageName, packageCache) {
    let us = packageCache.ownerOfFile(fromPath);
    if (!us) {
        throw new Error(`unable to determine which npm package owns the file ${fromPath}`);
    }
    if (!packageName) {
        return us;
    }
    try {
        return packageCache.resolve(packageName, us);
    }
    catch (err) {
        return null;
    }
}
function collapse(path, config) {
    let evaluator = new evaluate_json_1.Evaluator({ knownPaths: new Map([[path, { confident: true, value: config }]]) });
    while (true) {
        let parentPath = path.parentPath;
        let result = evaluator.evaluate(parentPath);
        if (!result.confident || parentPath.isAssignmentExpression()) {
            return { path, config: evaluator.evaluate(path).value };
        }
        path = parentPath;
    }
}
function inlineRuntimeConfig(path, state, context) {
    path.get('body').node.body = [
        context.types.returnStatement((0, evaluate_json_1.buildLiterals)({ packages: state.opts.userConfigs, global: state.opts.globalConfig }, context)),
    ];
}
exports.inlineRuntimeConfig = inlineRuntimeConfig;
//# sourceMappingURL=get-config.js.map