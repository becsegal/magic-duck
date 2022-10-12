import { InputOptions, OutputOptions } from 'rollup';
export default class RollupHelper {
    inputPath: string;
    buildPath: string;
    outputPath: string;
    inputOptions: InputOptions;
    outputOptions: OutputOptions[];
    shouldCache: boolean;
    private dependencies;
    private digests;
    private lastBuildStale;
    private lastBuildTree;
    private cache;
    private lastOutputTree;
    constructor(inputPath: string, buildPath: string, outputPath: string, inputOptions: InputOptions, outputOptions: OutputOptions[], shouldCache: boolean);
    build(): Promise<void>;
    private syncInput;
    private rollup;
    private syncOutput;
}
//# sourceMappingURL=rollup-helper.d.ts.map