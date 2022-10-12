import { RollupBuild } from 'rollup';
import { Operation } from './utils';
export default class Dependencies {
    private buildPath;
    private inputDependencies;
    private filter;
    constructor(buildPath: string);
    add(rollupBuild: RollupBuild): void;
    shouldBuild(inputChanges: Operation[]): boolean;
}
//# sourceMappingURL=dependencies.d.ts.map