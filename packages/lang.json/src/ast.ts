type BaseNode = {
    from: number;
    to: number;
};

export type NumberNode = BaseNode & { type: 'number'; value: number };
export type StringNode = BaseNode & { type: 'string'; value: string };
export type BoolNode = BaseNode & { type: 'boolean'; value: boolean };
export type NullNode = BaseNode & { type: 'null' };

export type ArrayNode = BaseNode & { type: 'array'; items: Array<ValueNode | MissingNode> };

export type KeyNode = BaseNode & { type: 'key'; value: string; owner: ObjectNode };
export type PropertyNode = BaseNode & { type: 'prop'; key: KeyNode | MissingNode; value: ValueNode | MissingNode };
export type ObjectNode = BaseNode & { type: 'object'; props: PropertyNode[] };

export type ValueNode = NumberNode | StringNode | BoolNode | NullNode | ObjectNode | ArrayNode;

export type MissingNode = BaseNode & { type: 'missing' };

export type ParseError =
    | 'error.unknown'
    | 'error.array.not_closed'
    | 'error.array.excess_comma'
    | 'error.array.missing_comma'
    | 'error.array.trailing_comma'
    | 'error.object.unquoted_key'
    | 'error.object.missing_key'
    | 'error.object.missing_colon'
    | 'error.object.missing_value'
    | 'error.object.not_closed'
    | 'error.object.excess_comma'
    | 'error.object.missing_comma'
    | 'error.object.trailing_comma'
    | 'error.multiple_roots';
export type ErrorNode = BaseNode & {
    type: 'error';
    error: ParseError;
};
