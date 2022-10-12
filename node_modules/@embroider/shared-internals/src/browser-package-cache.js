"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const get_or_create_1 = require("./get-or-create");
class PackageCache {
    ownerOfFile(_file) {
        throw new Error('no real ownerOfFile');
    }
    resolve(_specifier, _from) {
        throw new Error('no real resolve');
    }
    static shared(identifier) {
        return (0, get_or_create_1.getOrCreate)(shared, identifier, () => new PackageCache());
    }
}
exports.default = PackageCache;
const shared = new Map();
//# sourceMappingURL=browser-package-cache.js.map