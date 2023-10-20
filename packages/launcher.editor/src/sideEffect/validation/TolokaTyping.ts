type TolokaString = {
    type: 'string';
    required?: boolean;
    pattern?: string;
    min_length?: number;
    max_length?: number;
    allowed_values?: string[];
};
type TolokaStringArray = {
    type: 'array_string';
    required?: boolean;
    pattern?: string;
    allowed_values?: string[];
    min_size?: number;
    max_size?: number;
};
type TolokaUrl = {
    type: 'url';
    required?: boolean;
};
type TolokaUrlArray = {
    type: 'array_url';
    required?: boolean;
    allowed_values?: string[];
    min_size?: number;
    max_size?: number;
};
type TolokaBoolean = {
    type: 'boolean';
    required?: boolean;
    allowed_values?: [true] | [false];
};
type TolokaBooleanArray = {
    type: 'array_boolean';
    required?: boolean;
    allowed_values?: [true] | [false];
    min_size?: number;
    max_size?: number;
};
type TolokaInteger = {
    type: 'integer';
    required?: boolean;
    allowed_values?: number[];
    min_value?: number;
    max_value?: number;
};
type TolokaArrayInteger = {
    type: 'array_integer';
    required?: boolean;
    allowed_values?: number[];
    min_value?: number;
    max_value?: number;
    min_size?: number;
    max_size?: number;
};
type TolokaFloat = {
    type: 'float';
    required?: boolean;
    allowed_values?: number[];
    min_value?: number;
    max_value?: number;
};
type TolokaArrayFloat = {
    type: 'array_float';
    required?: boolean;
    allowed_values?: number[];
    min_value?: number;
    max_value?: number;
    min_size?: number;
    max_size?: number;
};
type TolokaFile = {
    type: 'file';
    required?: boolean;
};
type TolokaCoordinates = {
    type: 'coordinates';
    required?: boolean;
    current_location: false;
};
type TolokaArrayCoordinates = {
    type: 'array_coordinates';
    required?: boolean;
    min_size?: number;
    max_size?: number;
};
type TolokaCurrentCoordinates = {
    type: 'coordinates';
    required?: boolean;
    current_location: true;
};
type TolokaJson = {
    type: 'json';
    required?: boolean;
};
type TolokaArrayJson = {
    type: 'array_json';
    required?: boolean;
    min_size?: number;
    max_size?: number;
};

export type TolokaDataProperty =
    | TolokaString
    | TolokaStringArray
    | TolokaUrl
    | TolokaUrlArray
    | TolokaBoolean
    | TolokaBooleanArray
    | TolokaInteger
    | TolokaArrayInteger
    | TolokaFloat
    | TolokaArrayFloat
    | TolokaFile
    | TolokaCoordinates
    | TolokaArrayCoordinates
    | TolokaCurrentCoordinates
    | TolokaJson
    | TolokaArrayJson;

export type TolokaDataSpec = {
    [propName: string]: TolokaDataProperty;
};
