/* eslint-disable max-depth */
// AST should be used instead
import { createScanner, ScanError, SyntaxKind } from '@toloka-tb/lang.json/src/scanner';
import { languages } from 'monaco-editor';

const types = ['view', 'data', 'plugin', 'helper', 'field', 'action', 'condition', 'layout'] as const;
const tokens = types.map((type) => `type.${type}.tb`);

export const token = {
    // json noise
    delimiter: {
        object: 'delimiter.object.tb',
        array: 'delimiter.array.tb',
        colon: 'delimiter.colon.tb',
        comma: 'delimiter.comma.tb',
        quote: 'delimiter.quote.tb'
    },
    key: 'string.key.tb',

    // json meaning
    value: {
        boolean: 'keyword.json',
        null: 'keyword.json',
        string: 'string.value.json',
        number: 'number.json'
    },

    // tb meaning
    ref: 'keyword.ref.tb',
    type: types.reduce((acc, type) => ({ ...acc, [type]: `type.${type}.tb` }), {}) as {
        [type in typeof types[number]]: string;
    },

    // comments if we will allow them
    comment: {
        line: 'comment.block.json',
        block: 'comment.line.json'
    }
} as const;

// state is used to only retokenize changed parts
class JSONState implements languages.IState {
    private _state: languages.IState;

    public scanError: ScanError;
    public lastWasColon: boolean;
    public lastKey: string;
    public stack: Array<'arr' | 'obj'>;

    constructor(
        state: languages.IState | null,
        scanError: ScanError,
        lastWasColon: boolean,
        stack: Array<'arr' | 'obj'>,
        lastKey: string
    ) {
        this._state = state!;
        this.scanError = scanError;
        this.lastWasColon = lastWasColon;
        this.lastKey = lastKey;
        this.stack = stack;
    }

    public clone(): JSONState {
        return new JSONState(this._state, this.scanError, this.lastWasColon, this.stack, this.lastKey);
    }

    public equals(other: languages.IState): boolean {
        if (other === this) {
            return true;
        }
        if (!other || !(other instanceof JSONState)) {
            return false;
        }

        if (this.stack.length !== other.stack.length) {
            return false;
        }
        for (let i = 0; i < this.stack.length; ++i) {
            if (this.stack[i] !== other.stack[i]) {
                return false;
            }
        }

        return this.scanError === (<JSONState>other).scanError && this.lastWasColon === (<JSONState>other).lastWasColon;
    }

    public getStateData(): languages.IState {
        return this._state;
    }

    public setStateData(state: languages.IState): void {
        this._state = state;
    }
}

const tokenize = (comments: boolean, line: string, state: JSONState): languages.ILineTokens => {
    // handle multiline strings and block comments
    let numberOfInsertedCharacters = 0;
    let currentLine = line;
    let adjustOffset = false;
    let stack = state.stack;

    switch (state.scanError) {
        case ScanError.UnexpectedEndOfString:
            currentLine = `"${currentLine}`;
            numberOfInsertedCharacters = 1;
            break;
        case ScanError.UnexpectedEndOfComment:
            currentLine = `/*${currentLine}`;
            numberOfInsertedCharacters = 2;
            break;
    }

    const scanner = createScanner(currentLine);
    let lastWasColon = state.lastWasColon;
    let lastKey = state.lastKey;

    const ret = {
        tokens: <languages.IToken[]>[],
        endState: state.clone()
    };

    // eslint-disable-next-line no-constant-condition
    while (true) {
        let offset = scanner.getPosition();
        let type = '';

        const kind = scanner.scan();
        const value = scanner.getTokenValue();

        if (kind === SyntaxKind.EOF) {
            break;
        }

        // Check that the scanner has advanced
        if (offset === scanner.getPosition()) {
            throw new Error(`Scanner did not advance, next 3 characters are: ${line.substr(scanner.getPosition(), 3)}`);
        }

        // In case we inserted /* or " character, we need to
        // adjust the offset of all tokens (except the first)
        if (adjustOffset) {
            offset -= numberOfInsertedCharacters;
        }
        adjustOffset = numberOfInsertedCharacters > 0;

        // brackets and type
        switch (kind) {
            case SyntaxKind.OpenBraceToken:
                type = token.delimiter.object;
                lastWasColon = false;
                stack = stack.concat('obj');
                break;
            case SyntaxKind.CloseBraceToken:
                type = token.delimiter.object;
                lastWasColon = false;
                stack = stack.slice(0, -1);
                break;
            case SyntaxKind.OpenBracketToken:
                type = token.delimiter.array;
                lastWasColon = false;
                stack = stack.concat('arr');
                break;
            case SyntaxKind.CloseBracketToken:
                type = token.delimiter.array;
                lastWasColon = false;
                stack = stack.slice(0, -1);
                break;
            case SyntaxKind.ColonToken:
                type = token.delimiter.colon;
                lastWasColon = true;
                break;
            case SyntaxKind.CommaToken:
                type = token.delimiter.comma;
                lastWasColon = false;
                break;
            case SyntaxKind.TrueKeyword:
            case SyntaxKind.FalseKeyword:
                type = token.value.boolean;
                lastWasColon = false;
                break;
            case SyntaxKind.NullKeyword:
                type = token.value.null;
                lastWasColon = false;
                break;
            case SyntaxKind.StringLiteral:
                if (stack[stack.length - 1] === 'obj') {
                    if (lastWasColon) {
                        if (lastKey === 'type') {
                            // value of "type" property
                            types.forEach((typeValue, idx) => {
                                if (value.substr(0, typeValue.length) === typeValue) {
                                    type = tokens[idx];
                                }
                            });

                            if (!type) {
                                // unknown type
                                type = token.value.string;
                            }
                        } else if (
                            lastKey === '$ref' ||
                            /* not sure if "$empty" requires special treatment */ lastKey === '$empty'
                        ) {
                            // $refs are very different form strings
                            type = token.ref;
                        } else {
                            // string value of any other property
                            type = token.value.string;
                        }
                    } else {
                        // property name
                        lastKey = value;
                        type = token.key;
                    }
                } else {
                    // string value in array
                    type = token.value.string;
                }
                lastWasColon = false;
                break;
            case SyntaxKind.NumericLiteral:
                type = token.value.number;
                lastWasColon = false;
                break;
        }

        // comments, if enabled
        if (comments) {
            switch (kind) {
                case SyntaxKind.LineCommentTrivia:
                    type = token.comment.line;
                    break;
                case SyntaxKind.BlockCommentTrivia:
                    type = token.comment.block;
                    break;
            }
        }

        const err = scanner.getTokenError();

        ret.endState = new JSONState(state.getStateData(), err, lastWasColon, stack, lastKey);
        // separate quotes form key
        if (type === token.key) {
            ret.tokens.push(
                {
                    startIndex: offset,
                    scopes: token.delimiter.quote
                },
                {
                    startIndex: offset + 1,
                    scopes: type
                },
                {
                    startIndex: value.length + offset + 1,
                    scopes: token.delimiter.quote
                }
            );
        } else {
            ret.tokens.push({
                startIndex: offset,
                scopes: type
            });
        }
    }

    return ret;
};

export const createTokenizationSupport = (supportComments: boolean = false): languages.TokensProvider => ({
    getInitialState: () => new JSONState(null, 0, false, [], ''),
    tokenize: (line, state) => tokenize(supportComments, line, <JSONState>state)
});
