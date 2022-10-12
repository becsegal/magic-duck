import type Package from './package';
export default class PackageCache {
    ownerOfFile(_file: string): Package | undefined;
    resolve(_specifier: string, _from: Package): Package;
    static shared(identifier: string): PackageCache;
}
