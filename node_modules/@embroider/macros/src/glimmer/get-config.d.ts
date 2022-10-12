import type { PackageCache } from '@embroider/shared-internals';
export default function getConfig(node: any, userConfigs: {
    [packageRoot: string]: unknown;
}, baseDir: string | undefined, moduleName: string, own: boolean, packageCache: PackageCache): any;
