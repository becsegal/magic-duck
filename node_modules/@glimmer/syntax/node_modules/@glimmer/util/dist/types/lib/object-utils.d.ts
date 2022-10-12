export declare let assign: {
    <T, U>(target: T, source: U): T & U;
    <T_1, U_1, V>(target: T_1, source1: U_1, source2: V): T_1 & U_1 & V;
    <T_2, U_2, V_1, W>(target: T_2, source1: U_2, source2: V_1, source3: W): T_2 & U_2 & V_1 & W;
    (target: object, ...sources: any[]): any;
};
export declare function fillNulls<T>(count: number): T[];
export declare function values<T>(obj: {
    [s: string]: T;
}): T[];
//# sourceMappingURL=object-utils.d.ts.map