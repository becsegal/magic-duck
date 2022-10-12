import { Option } from '@glimmer/interfaces';
import { Parser } from '../parser';
import * as ASTv1 from '../v1/api';
import * as HBS from '../v1/handlebars-ast';
export declare abstract class HandlebarsNodeVisitors extends Parser {
    abstract appendToCommentData(s: string): void;
    abstract beginAttributeValue(quoted: boolean): void;
    abstract finishAttributeValue(): void;
    private get isTopLevel();
    Program(program: HBS.Program): ASTv1.Block;
    Program(program: HBS.Program): ASTv1.Template;
    Program(program: HBS.Program): ASTv1.Template | ASTv1.Block;
    BlockStatement(block: HBS.BlockStatement): ASTv1.BlockStatement | void;
    MustacheStatement(rawMustache: HBS.MustacheStatement): ASTv1.MustacheStatement | void;
    appendDynamicAttributeValuePart(part: ASTv1.MustacheStatement): void;
    finalizeTextPart(): void;
    startTextPart(): void;
    ContentStatement(content: HBS.ContentStatement): void;
    CommentStatement(rawComment: HBS.CommentStatement): Option<ASTv1.MustacheCommentStatement>;
    PartialStatement(partial: HBS.PartialStatement): never;
    PartialBlockStatement(partialBlock: HBS.PartialBlockStatement): never;
    Decorator(decorator: HBS.Decorator): never;
    DecoratorBlock(decoratorBlock: HBS.DecoratorBlock): never;
    SubExpression(sexpr: HBS.SubExpression): ASTv1.SubExpression;
    PathExpression(path: HBS.PathExpression): ASTv1.PathExpression;
    Hash(hash: HBS.Hash): ASTv1.Hash;
    StringLiteral(string: HBS.StringLiteral): ASTv1.StringLiteral;
    BooleanLiteral(boolean: HBS.BooleanLiteral): ASTv1.BooleanLiteral;
    NumberLiteral(number: HBS.NumberLiteral): ASTv1.NumberLiteral;
    UndefinedLiteral(undef: HBS.UndefinedLiteral): ASTv1.UndefinedLiteral;
    NullLiteral(nul: HBS.NullLiteral): ASTv1.NullLiteral;
}
//# sourceMappingURL=handlebars-node-visitors.d.ts.map