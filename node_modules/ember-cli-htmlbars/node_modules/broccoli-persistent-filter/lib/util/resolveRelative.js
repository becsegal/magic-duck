"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const PARENT_DIR = '..' + path_1.posix.sep;
/**
 * This is like path.resolve, but it requires the first path segment to be relative.
 * The result will be a relative path unless one of the other paths is absolute.
 * When an absolute path is encountered, all subsequent paths are resolved against that.
 * If any combination of paths causes the cumulative path at that point to try
 * to escape current root, an error is raised (even if a subsequent path is absolute).
 */
function resolveRelative(relativePath, ...otherPaths) {
    let cumulativePath = path_1.posix.normalize(relativePath);
    if (path_1.posix.isAbsolute(cumulativePath)) {
        throw new Error(`The first path must be relative. Got: ${relativePath}`);
    }
    if (cumulativePath.startsWith(PARENT_DIR)) {
        throw new Error(`The first path cannot start outside the local root of the filesystem. Got: ${relativePath}`);
    }
    for (let nextPath of otherPaths) {
        let originalNextPath = nextPath;
        if (path_1.posix.isAbsolute(nextPath)) {
            cumulativePath = path_1.posix.normalize(nextPath);
        }
        else {
            nextPath = path_1.posix.normalize(nextPath);
            cumulativePath = path_1.posix.normalize(path_1.posix.join(cumulativePath, nextPath));
            if (cumulativePath.startsWith(PARENT_DIR) || cumulativePath === '..') {
                throw new Error(`Illegal path segment would cause the cumulative path to escape the local or global filesystem: ${originalNextPath}`);
            }
        }
    }
    return cumulativePath;
}
exports.default = resolveRelative;
//# sourceMappingURL=resolveRelative.js.map