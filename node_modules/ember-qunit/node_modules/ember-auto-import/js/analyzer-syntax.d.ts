/// <reference types="node" />
import { ReadStream } from 'fs';
export interface LiteralImportSyntax {
    isDynamic: boolean;
    specifier: string;
}
export interface TemplateImportSyntax {
    isDynamic: boolean;
    cookedQuasis: string[];
    expressionNameHints: (string | null)[];
}
export declare type ImportSyntax = LiteralImportSyntax | TemplateImportSyntax;
export declare const MARKER = "eaimeta@70e063a35619d71f";
export declare function serialize(imports: ImportSyntax[]): string;
export declare function deserialize(source: ReadStream): Promise<ImportSyntax[]>;
