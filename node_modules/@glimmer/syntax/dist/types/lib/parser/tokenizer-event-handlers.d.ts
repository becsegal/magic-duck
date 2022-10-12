import { Option } from '@glimmer/interfaces';
import print from '../generation/print';
import { Tag } from '../parser';
import { Source } from '../source/source';
import { SourceSpan } from '../source/span';
import traverse from '../traversal/traverse';
import { NodeVisitor } from '../traversal/visitor';
import Walker from '../traversal/walker';
import * as ASTv1 from '../v1/api';
import * as HBS from '../v1/handlebars-ast';
import publicBuilder from '../v1/public-builders';
import { HandlebarsNodeVisitors } from './handlebars-node-visitors';
export declare class TokenizerEventHandlers extends HandlebarsNodeVisitors {
    private tagOpenLine;
    private tagOpenColumn;
    reset(): void;
    beginComment(): void;
    appendToCommentData(char: string): void;
    finishComment(): void;
    beginData(): void;
    appendToData(char: string): void;
    finishData(): void;
    tagOpen(): void;
    beginStartTag(): void;
    beginEndTag(): void;
    finishTag(): void;
    finishStartTag(): void;
    finishEndTag(isVoid: boolean): void;
    markTagAsSelfClosing(): void;
    appendToTagName(char: string): void;
    beginAttribute(): void;
    appendToAttributeName(char: string): void;
    beginAttributeValue(isQuoted: boolean): void;
    appendToAttributeValue(char: string): void;
    finishAttributeValue(): void;
    reportSyntaxError(message: string): void;
    assembleConcatenatedValue(parts: (ASTv1.MustacheStatement | ASTv1.TextNode)[]): ASTv1.ConcatStatement;
    validateEndTag(tag: Tag<'StartTag' | 'EndTag'>, element: ASTv1.ElementNode, selfClosing: boolean): void;
    assembleAttributeValue(parts: (ASTv1.MustacheStatement | ASTv1.TextNode)[], isQuoted: boolean, isDynamic: boolean, span: SourceSpan): ASTv1.ConcatStatement | ASTv1.MustacheStatement | ASTv1.TextNode;
}
/**
  ASTPlugins can make changes to the Glimmer template AST before
  compilation begins.
*/
export interface ASTPluginBuilder<TEnv extends ASTPluginEnvironment = ASTPluginEnvironment> {
    (env: TEnv): ASTPlugin;
}
export interface ASTPlugin {
    name: string;
    visitor: NodeVisitor;
}
export interface ASTPluginEnvironment {
    meta?: object;
    syntax: Syntax;
}
interface HandlebarsParseOptions {
    srcName?: string;
    ignoreStandalone?: boolean;
}
export interface TemplateIdFn {
    (src: string): Option<string>;
}
export interface PrecompileOptions extends PreprocessOptions {
    id?: TemplateIdFn;
    customizeComponentName?(input: string): string;
}
export interface PreprocessOptions {
    strictMode?: boolean;
    locals?: string[];
    meta?: {
        moduleName?: string;
    };
    plugins?: {
        ast?: ASTPluginBuilder[];
    };
    parseOptions?: HandlebarsParseOptions;
    customizeComponentName?(input: string): string;
    /**
      Useful for specifying a group of options together.
  
      When `'codemod'` we disable all whitespace control in handlebars
      (to preserve as much as possible) and we also avoid any
      escaping/unescaping of HTML entity codes.
     */
    mode?: 'codemod' | 'precompile';
}
export interface Syntax {
    parse: typeof preprocess;
    builders: typeof publicBuilder;
    print: typeof print;
    traverse: typeof traverse;
    Walker: typeof Walker;
}
export declare function preprocess(input: string | Source | HBS.Program, options?: PreprocessOptions): ASTv1.Template;
export {};
//# sourceMappingURL=tokenizer-event-handlers.d.ts.map