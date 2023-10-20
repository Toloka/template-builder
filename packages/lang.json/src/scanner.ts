import * as json from 'jsonc-parser';

// Hacks to fix disappearing enums from jsonc-parser
export enum ScanError {
    None = 0,
    UnexpectedEndOfComment = 1,
    UnexpectedEndOfString = 2,
    UnexpectedEndOfNumber = 3,
    InvalidUnicode = 4,
    InvalidEscapeCharacter = 5,
    InvalidCharacter = 6
}

export enum SyntaxKind {
    OpenBraceToken = 1,
    CloseBraceToken = 2,
    OpenBracketToken = 3,
    CloseBracketToken = 4,
    CommaToken = 5,
    ColonToken = 6,
    NullKeyword = 7,
    TrueKeyword = 8,
    FalseKeyword = 9,
    StringLiteral = 10,
    NumericLiteral = 11,
    LineCommentTrivia = 12,
    BlockCommentTrivia = 13,
    LineBreakTrivia = 14,
    Trivia = 15,
    Unknown = 16,
    EOF = 17
}

export type JSONScanner = Omit<json.JSONScanner, 'scan' | 'getToken' | 'getTokenError'> & {
    scan(): SyntaxKind;
    getToken(): SyntaxKind;
    getTokenError(): ScanError;
};

export const createScanner = (source: string) => {
    const scanner = json.createScanner(source);

    return (scanner as any) as JSONScanner;
};
