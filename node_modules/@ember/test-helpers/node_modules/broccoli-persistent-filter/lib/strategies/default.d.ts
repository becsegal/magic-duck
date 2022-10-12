import { Context, Strategy } from './strategy';
import Dependencies = require('../dependencies');
declare class DefaultStrategy implements Strategy {
    init(): void;
    processString(ctx: Context, contents: string, relativePath: string): Promise<string>;
    /**
     * By default initial dependencies are empty.
     */
    initialDependencies(rootFS: Dependencies.FSFacade, inputEncoding: string): Dependencies;
    /**
     * Seals the dependencies and captures the dependency state.
     * @param dependencies {Dependencies} The dependencies to seal.
     */
    sealDependencies(dependencies: Dependencies): void;
}
export = DefaultStrategy;
//# sourceMappingURL=default.d.ts.map