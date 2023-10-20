import {
    ArrayNode,
    BoolNode,
    ErrorNode,
    KeyNode,
    MissingNode,
    NullNode,
    NumberNode,
    ObjectNode,
    ParseError,
    PropertyNode,
    StringNode,
    ValueNode
} from './ast';
import { createScanner, JSONScanner, SyntaxKind } from './scanner';

// Infinite loop guard
const maxIter = 100000;

// Meta
export type ParseMeta = {
    errors: ErrorNode[];
};

// Node constructors
const numberNode = (from: number, to: number, value: number): NumberNode => ({
    type: 'number',
    value,
    from,
    to
});

const stringNode = (from: number, to: number, value: string): StringNode => ({
    type: 'string',
    value,
    from,
    to
});

const boolNode = (from: number, to: number, value: boolean): BoolNode => ({
    type: 'boolean',
    value,
    from,
    to
});

const nullNode = (from: number, to: number): NullNode => ({
    type: 'null',
    from,
    to
});

const arrayNode = (from: number, to: number, items: ArrayNode['items']): ArrayNode => ({
    type: 'array',
    items,
    from,
    to
});

const keyNode = (from: number, to: number, value: string, owner: ObjectNode): KeyNode => ({
    type: 'key',
    owner,
    value,
    from,
    to
});

const propNode = (
    from: number,
    to: number,
    key: KeyNode | MissingNode,
    value: ValueNode | MissingNode
): PropertyNode => ({
    type: 'prop',
    key,
    value,
    from,
    to
});

const objectNode = (from: number, to: number, props: PropertyNode[]): ObjectNode => ({
    type: 'object',
    props,
    from,
    to
});

const missingNode = (from: number, to: number): MissingNode => ({
    type: 'missing',
    from,
    to
});

const logError = (meta: ParseMeta, from: number, to: number, error: ParseError): ErrorNode => {
    const err: ErrorNode = {
        type: 'error',
        error,
        from,
        to
    };

    meta.errors.push(err);

    return err;
};

// skippers
const skipTo = (scanner: JSONScanner, targets: SyntaxKind[]) => {
    let kind = scanner.scan();

    while (kind !== SyntaxKind.EOF && !targets.includes(kind)) {
        kind = scanner.scan();
    }

    scanner.setPosition(scanner.getTokenOffset());
};
const skipToNot = (scanner: JSONScanner, targets: SyntaxKind[]) => {
    let kind = scanner.scan();

    while (kind !== SyntaxKind.EOF && targets.includes(kind)) {
        kind = scanner.scan();
    }

    scanner.setPosition(scanner.getTokenOffset());
};
const skipSpaces = (scanner: JSONScanner) => {
    skipToNot(scanner, [
        SyntaxKind.Trivia,
        SyntaxKind.LineBreakTrivia,
        SyntaxKind.LineCommentTrivia,
        SyntaxKind.BlockCommentTrivia
    ]);
};

// Specific parsers
const _parse = {
    value: (scanner: JSONScanner, meta: ParseMeta): ValueNode | undefined => {
        skipSpaces(scanner);

        const kind = scanner.scan();
        const value = scanner.getTokenValue();
        const from = scanner.getTokenOffset();
        const to = scanner.getPosition();

        switch (kind) {
            case SyntaxKind.OpenBraceToken:
                scanner.setPosition(from);

                return _parse.object(scanner, meta);

            case SyntaxKind.OpenBracketToken:
                scanner.setPosition(from);

                return _parse.array(scanner, meta);

            case SyntaxKind.TrueKeyword:
                return boolNode(from, to, true);

            case SyntaxKind.FalseKeyword:
                return boolNode(from, to, false);

            case SyntaxKind.NullKeyword:
                return nullNode(from, to);

            case SyntaxKind.StringLiteral:
                return stringNode(from, to, value);

            case SyntaxKind.NumericLiteral:
                return numberNode(from, to, parseFloat(value));
        }

        logError(meta, from, to, 'error.unknown');
    },
    array: (scanner: JSONScanner, meta: ParseMeta): ArrayNode | undefined => {
        const from = scanner.getPosition();

        // skip OpenBracketToken
        scanner.scan();

        const items: ArrayNode['items'] = [];

        let i = 0;
        let kind: SyntaxKind;
        let last: ',' | 'value' | '[' = '[';

        do {
            i++;

            skipSpaces(scanner);

            kind = scanner.scan();
            const lastValidChar = items.length > 0 ? items[items.length - 1].to : from;

            switch (kind) {
                case SyntaxKind.CloseBracketToken:
                    if (last === ',') {
                        const from = lastValidChar;
                        const to = lastValidChar + 1;

                        logError(meta, from, to, 'error.array.trailing_comma');
                        items.push(missingNode(from, to));
                    }

                    return arrayNode(from, scanner.getPosition(), items);
                case SyntaxKind.CloseBraceToken:
                case SyntaxKind.EOF:
                case SyntaxKind.ColonToken:
                    logError(meta, lastValidChar, lastValidChar + 1, 'error.array.not_closed');

                    scanner.setPosition(scanner.getTokenOffset());

                    return arrayNode(from, scanner.getPosition(), items);

                case SyntaxKind.CommaToken:
                    if (last !== 'value') {
                        const from = scanner.getPosition() - 1;
                        const to = from + 1;

                        logError(meta, from, to, 'error.array.excess_comma');
                        items.push(missingNode(from, to));
                    }
                    last = ',';
                    break;
                default: {
                    scanner.setPosition(scanner.getTokenOffset());

                    const value = _parse.value(scanner, meta);

                    if (value) {
                        items.push(value);
                    } else {
                        items.push(missingNode(lastValidChar + 1, scanner.getPosition()));
                    }

                    if (last === 'value') {
                        logError(meta, lastValidChar, lastValidChar + 1, 'error.array.missing_comma');
                    }

                    last = 'value';
                }
            }
        } while (i < maxIter);

        logError(meta, scanner.getTokenOffset(), scanner.getPosition(), 'error.unknown');
    },
    prop: (scanner: JSONScanner, meta: ParseMeta, owner: ObjectNode): PropertyNode => {
        skipSpaces(scanner);
        let kind = scanner.scan();
        const from = scanner.getTokenOffset();
        let valueFrom = from;

        let key: KeyNode | MissingNode = missingNode(from, from);

        // key
        if (kind !== SyntaxKind.StringLiteral) {
            if (kind === SyntaxKind.Unknown) {
                logError(meta, from, scanner.getPosition(), 'error.object.unquoted_key');
                key = keyNode(from, scanner.getPosition(), scanner.getTokenValue(), owner);
                valueFrom = key.to + 1;
            } else {
                logError(meta, from - 1, scanner.getPosition() - 1, 'error.object.missing_key');
                key.to = scanner.getPosition();
            }

            // colons would be parsed later
            if (kind === SyntaxKind.ColonToken) {
                scanner.setPosition(scanner.getTokenOffset());
            }
        } else {
            key = keyNode(from, scanner.getPosition(), scanner.getTokenValue(), owner);
        }

        // colon
        skipSpaces(scanner);
        kind = scanner.scan();

        if (kind !== SyntaxKind.ColonToken) {
            logError(meta, key.to, key.to + 1, 'error.object.missing_colon');
            scanner.setPosition(scanner.getTokenOffset());
        } else {
            valueFrom = scanner.getPosition();
        }

        // value
        const value = _parse.propValue(scanner, meta, owner, valueFrom);

        return propNode(from, value.to, key, value);
    },
    propValue: (scanner: JSONScanner, meta: ParseMeta, owner: ObjectNode, from: number): ValueNode | MissingNode => {
        const noValueError = () => {
            const pos = scanner.getPosition() - 1;

            const noValue = missingNode(from, Math.max(pos, from));

            logError(meta, noValue.from, noValue.to, 'error.object.missing_value');

            return noValue;
        };

        skipSpaces(scanner);
        const kind = scanner.scan();

        // other parsers would handle it anyway
        scanner.setPosition(scanner.getTokenOffset());

        // check if prop has no value (because current prop or object ends)
        if (kind === SyntaxKind.CommaToken || kind === SyntaxKind.CloseBraceToken) {
            return noValueError();
        }

        // check if prop has no value (because next prop starts)
        const nextPropMeta: ParseMeta = { errors: [] };
        const posBeforeNextProp = scanner.getPosition();

        const maybeProp = _parse.prop(scanner, nextPropMeta, owner);

        scanner.setPosition(posBeforeNextProp);

        if (
            maybeProp.key.type === 'key' &&
            !nextPropMeta.errors.find((x) => x.error === 'error.object.missing_colon')
        ) {
            return noValueError();
        }

        const parsedValue = _parse.value(scanner, meta);

        if (parsedValue) {
            return parsedValue;
        }

        // invalid prop value, error was added to the meta
        scanner.setPosition(scanner.getTokenOffset());
        skipTo(scanner, [SyntaxKind.CommaToken, SyntaxKind.CloseBraceToken]);

        return missingNode(from, scanner.getPosition() - 1);
    },
    object: (scanner: JSONScanner, meta: ParseMeta): ObjectNode | undefined => {
        const from = scanner.getPosition();

        // skip OpenBracketToken
        scanner.scan();

        const items: PropertyNode[] = [];
        const node = objectNode(from, from, items);

        let i = 0;
        let kind: SyntaxKind;
        let last: ',' | 'value' | '{' = '{';

        do {
            i++;

            skipSpaces(scanner);

            kind = scanner.scan();
            const lastValidChar = items.length > 0 ? items[items.length - 1].to : from;

            switch (kind) {
                case SyntaxKind.CloseBraceToken:
                    if (last === ',') {
                        const from = lastValidChar;
                        const to = lastValidChar + 1;

                        logError(meta, from, to, 'error.object.trailing_comma');
                    }

                    node.to = scanner.getPosition();

                    return node;
                case SyntaxKind.CloseBracketToken:
                case SyntaxKind.EOF:
                    scanner.setPosition(scanner.getTokenOffset());

                    logError(meta, lastValidChar, lastValidChar + 1, 'error.object.not_closed');

                    return node;

                case SyntaxKind.CommaToken:
                    if (last !== 'value') {
                        const from = scanner.getPosition() - 1;
                        const to = from + 1;

                        logError(meta, from, to, 'error.object.excess_comma');
                    } else {
                        items[items.length - 1].to = scanner.getTokenOffset();
                    }
                    last = ',';
                    break;
                default: {
                    scanner.setPosition(scanner.getTokenOffset());

                    const prop = _parse.prop(scanner, meta, node);

                    items.push(prop);

                    if (last === 'value') {
                        logError(meta, lastValidChar, lastValidChar + 1, 'error.object.missing_comma');
                    }

                    last = 'value';
                }
            }
        } while (i < maxIter);

        logError(meta, scanner.getTokenOffset(), scanner.getPosition(), 'error.unknown');
    }
};

// Generic parse process
export const parseJSON = (source: string) => {
    const parseMeta: ParseMeta = {
        errors: []
    };

    const scanner = createScanner(source);
    const value = _parse.value(scanner, parseMeta);

    const trimmedSource = source.trimEnd();

    if (scanner.getPosition() < trimmedSource.length && parseMeta.errors.length === 0) {
        const multipleJSONMeta: ParseMeta = {
            // actually error many values
            errors: [
                { type: 'error', from: scanner.getPosition(), to: trimmedSource.length, error: 'error.multiple_roots' }
            ]
        };

        return {
            value,
            meta: multipleJSONMeta
        };
    }

    return { value, meta: parseMeta };
};
