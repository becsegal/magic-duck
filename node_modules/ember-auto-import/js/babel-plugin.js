"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
// @ts-ignore
const babel_plugin_syntax_dynamic_import_1 = __importDefault(require("babel-plugin-syntax-dynamic-import"));
const package_1 = __importDefault(require("./package"));
function emberAutoImport(babel) {
    let t = babel.types;
    return {
        inherits: babel_plugin_syntax_dynamic_import_1.default,
        visitor: {
            Import(path) {
                let call = path.parentPath;
                let arg = call.node.arguments[0];
                if (arg.type === 'StringLiteral') {
                    let cat = package_1.default.categorize(arg.value);
                    if (cat === 'dep') {
                        call.replaceWith(t.callExpression(t.identifier('emberAutoImportDynamic'), [arg]));
                    }
                }
                else if (arg.type === 'TemplateLiteral') {
                    let cat = package_1.default.categorize(arg.quasis[0].value.cooked, true);
                    if (cat === 'dep') {
                        call.replaceWith(t.callExpression(t.identifier('emberAutoImportDynamic'), [
                            t.stringLiteral(arg.quasis.map((q) => q.value.cooked).join('${e}')),
                            ...arg.expressions,
                        ]));
                    }
                }
            },
            CallExpression(path) {
                let callee = path.get('callee');
                if (callee.isIdentifier() &&
                    callee.referencesImport('@embroider/macros', 'importSync')) {
                    let arg = path.node.arguments[0];
                    if (arg.type === 'StringLiteral') {
                        let cat = package_1.default.categorize(arg.value);
                        if (cat === 'url') {
                            throw new Error('You cannot use importSync() with a URL.');
                        }
                        callee.replaceWith(t.identifier('require'));
                    }
                    else if (arg.type === 'TemplateLiteral') {
                        let cat = package_1.default.categorize(arg.quasis[0].value.cooked, true);
                        if (cat === 'url') {
                            throw new Error('You cannot use importSync() with a URL.');
                        }
                        path.replaceWith(t.callExpression(t.identifier('emberAutoImportSync'), [
                            t.stringLiteral(arg.quasis.map((q) => q.value.cooked).join('${e}')),
                            ...arg.expressions,
                        ]));
                    }
                }
            },
        },
    };
}
emberAutoImport.baseDir = function () {
    return __dirname;
};
module.exports = emberAutoImport;
//# sourceMappingURL=babel-plugin.js.map