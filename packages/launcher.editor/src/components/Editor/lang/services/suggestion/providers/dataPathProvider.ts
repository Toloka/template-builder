import { createEnvStore } from '@toloka-tb/editor.preview';

import { InputState } from '../../../../../../store/inputStore';
import { ContextDependentData, PreviewState } from '../../../../../../store/previewStore';
import { AutoCompleteProvider, makeResult } from '../suggestionTypes';

let previewStore: PreviewState = { ctx: undefined, env: createEnvStore() };
let inputStore: InputState = {
    current: '{}',
    valid: {},

    errors: {
        parsing: undefined,
        validation: []
    },

    relevantErrors: [],

    isDirty: false,
    nextValidationErrors: [],

    monaco: null,
    monacoModel: null
};
let contextDependentData: ContextDependentData = { readable: {}, writable: {} };

import('../../../../../../store/previewStore').then(
    ({ previewStore: realPreviewStore, contextDependentData: realContextDependentData }) => {
        previewStore = realPreviewStore;
        contextDependentData = realContextDependentData;
    }
);
import('../../../../../../store/inputStore').then(({ inputStore: realInputStore }) => (inputStore = realInputStore));

const getDataValue: { [dataType: string]: (inConfigPath: string) => object } = {
    'data.input': () => inputStore.valid,
    'data.internal': () => previewStore.ctx?.internal.value || {},
    'data.output': () => previewStore.ctx?.output.value || {},
    'data.local': (inConfigPath) => contextDependentData.readable[inConfigPath] || {},
    'data.relative': (inConfigPath) => contextDependentData.writable[inConfigPath] || {}
};

export const dataPathProvider: AutoCompleteProvider = (expectations, { componentPath }) => {
    if (
        expectations.expectedType === 'value' &&
        componentPath.type in getDataValue &&
        componentPath.path.length === 1
    ) {
        const inConfigPath = [...componentPath.globalPath];

        if (inConfigPath[inConfigPath.length - 1] === 'path') {
            inConfigPath.pop();
        }
        const dataValue = getDataValue[componentPath.type](inConfigPath.join('.'));
        const allPaths: string[][] = [];
        const traverse = (obj: object | string | number | boolean | null, path: string[]) => {
            allPaths.push(path);
            if (typeof obj === 'object' && obj !== null) {
                Object.entries(obj).forEach(([key, value]) => traverse(value, [...path, key]));
            }
        };

        Object.entries(dataValue).forEach(([key, value]) => traverse(value, [key]));
        const stringPaths = allPaths.map((path) => path.join('.'));

        return stringPaths.map((path) => makeResult(path, 0, { kind: 3 }));
    }

    return [];
};
