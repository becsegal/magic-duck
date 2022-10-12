export declare type KeywordType = 'Call' | 'Modifier' | 'Append' | 'Block';
export declare function isKeyword(word: string): boolean;
/**
 * This includes the full list of keywords currently in use in the template
 * language, and where their valid usages are.
 */
export declare const KEYWORDS_TYPES: {
    [key: string]: KeywordType[];
};
//# sourceMappingURL=keywords.d.ts.map