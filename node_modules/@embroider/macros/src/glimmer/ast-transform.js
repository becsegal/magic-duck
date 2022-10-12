"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSecondTransform = exports.makeFirstTransform = exports.buildPlugin = void 0;
const literal_1 = __importDefault(require("./literal"));
const get_config_1 = __importDefault(require("./get-config"));
const dependency_satisfies_1 = __importDefault(require("./dependency-satisfies"));
const macro_maybe_attrs_1 = require("./macro-maybe-attrs");
const macro_condition_1 = require("./macro-condition");
const fail_build_1 = require("./fail-build");
const shared_internals_1 = require("@embroider/shared-internals");
function buildPlugin(params) {
    return {
        name: params.name,
        plugin: params.methodName === 'makeFirstTransform'
            ? makeFirstTransform(params.firstTransformParams)
            : makeSecondTransform(),
        baseDir: () => params.baseDir,
    };
}
exports.buildPlugin = buildPlugin;
function makeFirstTransform(opts) {
    function embroiderFirstMacrosTransform(env) {
        if (!opts.packageRoot && !env.filename) {
            throw new Error(`bug in @embroider/macros. Running without packageRoot but don't have filename.`);
        }
        let packageCache = shared_internals_1.PackageCache.shared('embroider-stage3', opts.appRoot);
        let scopeStack = [];
        // packageRoot is set when we run inside classic ember-cli. Otherwise we're in
        // Embroider, where we can use absolute filenames.
        const moduleName = opts.packageRoot ? env.meta.moduleName : env.filename;
        return {
            name: '@embroider/macros/first',
            visitor: {
                Program: {
                    enter(node) {
                        if (node.blockParams.length > 0) {
                            scopeStack.push(node.blockParams);
                        }
                    },
                    exit(node) {
                        if (node.blockParams.length > 0) {
                            scopeStack.pop();
                        }
                    },
                },
                SubExpression(node) {
                    if (node.path.type !== 'PathExpression') {
                        return;
                    }
                    if (inScope(scopeStack, node.path.parts[0])) {
                        return;
                    }
                    if (node.path.original === 'macroGetOwnConfig') {
                        return (0, literal_1.default)((0, get_config_1.default)(node, opts.configs, opts.packageRoot, moduleName, true, packageCache), env.syntax.builders);
                    }
                    if (node.path.original === 'macroGetConfig') {
                        return (0, literal_1.default)((0, get_config_1.default)(node, opts.configs, opts.packageRoot, moduleName, false, packageCache), env.syntax.builders);
                    }
                    if (node.path.original === 'macroDependencySatisfies') {
                        return (0, literal_1.default)((0, dependency_satisfies_1.default)(node, opts.packageRoot, moduleName, packageCache), env.syntax.builders);
                    }
                },
                MustacheStatement(node) {
                    if (node.path.type !== 'PathExpression') {
                        return;
                    }
                    if (inScope(scopeStack, node.path.parts[0])) {
                        return;
                    }
                    if (node.path.original === 'macroGetOwnConfig') {
                        return env.syntax.builders.mustache((0, literal_1.default)((0, get_config_1.default)(node, opts.configs, opts.packageRoot, moduleName, true, packageCache), env.syntax.builders));
                    }
                    if (node.path.original === 'macroGetConfig') {
                        return env.syntax.builders.mustache((0, literal_1.default)((0, get_config_1.default)(node, opts.configs, opts.packageRoot, moduleName, false, packageCache), env.syntax.builders));
                    }
                    if (node.path.original === 'macroDependencySatisfies') {
                        return env.syntax.builders.mustache((0, literal_1.default)((0, dependency_satisfies_1.default)(node, opts.packageRoot, moduleName, packageCache), env.syntax.builders));
                    }
                },
            },
        };
    }
    embroiderFirstMacrosTransform.embroiderMacrosASTMarker = true;
    embroiderFirstMacrosTransform.parallelBabel = {
        requireFile: __filename,
        buildUsing: 'makeFirstTransform',
        get params() {
            return opts;
        },
    };
    return embroiderFirstMacrosTransform;
}
exports.makeFirstTransform = makeFirstTransform;
function makeSecondTransform() {
    function embroiderSecondMacrosTransform(env) {
        let scopeStack = [];
        return {
            name: '@embroider/macros/second',
            visitor: {
                Program: {
                    enter(node) {
                        if (node.blockParams.length > 0) {
                            scopeStack.push(node.blockParams);
                        }
                    },
                    exit(node) {
                        if (node.blockParams.length > 0) {
                            scopeStack.pop();
                        }
                    },
                },
                BlockStatement(node) {
                    if (node.path.type !== 'PathExpression') {
                        return;
                    }
                    if (inScope(scopeStack, node.path.parts[0])) {
                        return;
                    }
                    if (node.path.original === 'if') {
                        return (0, macro_condition_1.macroIfBlock)(node);
                    }
                },
                SubExpression(node) {
                    if (node.path.type !== 'PathExpression') {
                        return;
                    }
                    if (inScope(scopeStack, node.path.parts[0])) {
                        return;
                    }
                    if (node.path.original === 'if') {
                        return (0, macro_condition_1.macroIfExpression)(node, env.syntax.builders);
                    }
                    if (node.path.original === 'macroFailBuild') {
                        (0, fail_build_1.failBuild)(node);
                    }
                },
                ElementNode(node) {
                    node.modifiers = node.modifiers.filter((modifier) => {
                        if (modifier.path.type === 'SubExpression' &&
                            modifier.path.path.type === 'PathExpression' &&
                            modifier.path.path.original === 'if') {
                            modifier.path = (0, macro_condition_1.macroIfExpression)(modifier.path, env.syntax.builders);
                            if (modifier.path.type === 'UndefinedLiteral') {
                                return false;
                            }
                        }
                        if (modifier.path.type !== 'PathExpression') {
                            return true;
                        }
                        if (inScope(scopeStack, modifier.path.parts[0])) {
                            return true;
                        }
                        if (modifier.path.original === 'macroMaybeAttrs') {
                            (0, macro_maybe_attrs_1.maybeAttrs)(node, modifier, env.syntax.builders);
                        }
                        else {
                            return true;
                        }
                    });
                },
                MustacheStatement(node) {
                    if (node.path.type !== 'PathExpression') {
                        return;
                    }
                    if (inScope(scopeStack, node.path.parts[0])) {
                        return;
                    }
                    if (node.path.original === 'if') {
                        return (0, macro_condition_1.macroIfMustache)(node, env.syntax.builders);
                    }
                    if (node.path.original === 'macroFailBuild') {
                        (0, fail_build_1.failBuild)(node);
                    }
                },
            },
        };
    }
    embroiderSecondMacrosTransform.embroiderMacrosASTMarker = true;
    embroiderSecondMacrosTransform.parallelBabel = {
        requireFile: __filename,
        buildUsing: 'makeSecondTransform',
        params: undefined,
    };
    return embroiderSecondMacrosTransform;
}
exports.makeSecondTransform = makeSecondTransform;
function inScope(scopeStack, name) {
    for (let scope of scopeStack) {
        if (scope.includes(name)) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=ast-transform.js.map