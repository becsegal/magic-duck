import BroccoliPlugin = require('broccoli-plugin');
export declare type InputOptions = import('rollup').InputOptions;
export declare type OutputOptions = import('rollup').OutputOptions;
export interface BroccoliRollupOptions {
    annotation?: string;
    name?: string;
    rollup: RollupOptions;
    cache?: boolean;
    nodeModulesPath?: string;
}
export declare type RollupOptions = InputOptions & {
    output: OutputOptions | OutputOptions[];
};
export default function rollup(node: any, options: BroccoliRollupOptions): BroccoliRollup;
export declare class BroccoliRollup extends BroccoliPlugin {
    rollupOptions: RollupOptions;
    cache: boolean;
    nodeModulesPath: string;
    private _rollupHelper;
    constructor(node: any, options: BroccoliRollupOptions);
    build(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map