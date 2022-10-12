"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builders = exports.useCustomPrinter = void 0;
const syntax_1 = require("@glimmer/syntax");
// The glimmer printer doesn't have any formatting suppport.
// It always uses double quotes, and won't print attrs without
// a value. To choose quote types or omit the value, we've
// gotta do it ourselves.
function useCustomPrinter(node) {
    switch (node.type) {
        case 'StringLiteral':
            return !!node.quoteType;
            break;
        case 'AttrNode':
            {
                const n = node;
                return !!n.isValueless || n.quoteType !== undefined;
            }
            break;
        default:
            return false;
    }
}
exports.useCustomPrinter = useCustomPrinter;
exports.builders = syntax_1.builders;
//# sourceMappingURL=custom-nodes.js.map