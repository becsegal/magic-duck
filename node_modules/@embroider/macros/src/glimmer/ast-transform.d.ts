export interface BuildPluginParams {
    name: string;
    baseDir: string;
    methodName: string;
    firstTransformParams: FirstTransformParams;
}
export interface FirstTransformParams {
    packageRoot: string | undefined;
    appRoot: string;
    configs: {
        [packageRoot: string]: object;
    };
}
export declare function buildPlugin(params: BuildPluginParams): {
    name: string;
    plugin: (env: {
        syntax: {
            builders: any;
        };
        meta: {
            moduleName: string;
        };
        filename: string;
    }) => {
        name: string;
        visitor: {
            Program: {
                enter(node: any): void;
                exit(node: any): void;
            };
            SubExpression(node: any): any;
            MustacheStatement(node: any): any;
        };
    };
    baseDir: () => string;
};
export declare function makeFirstTransform(opts: FirstTransformParams): (env: {
    syntax: {
        builders: any;
    };
    meta: {
        moduleName: string;
    };
    filename: string;
}) => {
    name: string;
    visitor: {
        Program: {
            enter(node: any): void;
            exit(node: any): void;
        };
        SubExpression(node: any): any;
        MustacheStatement(node: any): any;
    };
};
export declare function makeSecondTransform(): (env: {
    syntax: {
        builders: any;
    };
}) => {
    name: string;
    visitor: {
        Program: {
            enter(node: any): void;
            exit(node: any): void;
        };
        BlockStatement(node: any): any;
        SubExpression(node: any): any;
        ElementNode(node: any): void;
        MustacheStatement(node: any): any;
    };
};
