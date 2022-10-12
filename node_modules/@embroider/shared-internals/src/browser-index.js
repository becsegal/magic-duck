"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageCache = exports.extensionsPattern = exports.explicitRelative = exports.getOrCreate = void 0;
var get_or_create_1 = require("./get-or-create");
Object.defineProperty(exports, "getOrCreate", { enumerable: true, get: function () { return get_or_create_1.getOrCreate; } });
var paths_1 = require("./paths");
Object.defineProperty(exports, "explicitRelative", { enumerable: true, get: function () { return paths_1.explicitRelative; } });
Object.defineProperty(exports, "extensionsPattern", { enumerable: true, get: function () { return paths_1.extensionsPattern; } });
var browser_package_cache_1 = require("./browser-package-cache");
Object.defineProperty(exports, "PackageCache", { enumerable: true, get: function () { return __importDefault(browser_package_cache_1).default; } });
//# sourceMappingURL=browser-index.js.map