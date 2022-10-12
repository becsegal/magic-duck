import { SourceSpan } from './source/span';
export interface GlimmerSyntaxError extends Error {
    location: SourceSpan | null;
    code: string | null;
}
export declare function generateSyntaxError(message: string, location: SourceSpan): GlimmerSyntaxError;
//# sourceMappingURL=syntax-error.d.ts.map