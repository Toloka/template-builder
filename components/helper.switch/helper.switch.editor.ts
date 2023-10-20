export const genSwitchSchema = (result: any, cases: any[], defaultValue?: any) =>
    ({
        title: 'helper.switch',
        type: 'object',
        properties: {
            type: {
                type: 'string',
                const: 'helper.switch',
                default: 'helper.switch'
            },
            cases: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        condition: {
                            $ref: '#/definitions/condition'
                        },
                        result: {
                            ...result
                        }
                    },
                    required: ['condition', 'result']
                }
            },
            default: {
                ...result
            }
        },
        default: {
            type: 'helper.switch',
            cases: cases.map(({ value, result }) => ({
                condition: {
                    type: 'condition.equals',
                    items: [
                        {
                            type: 'data.input',
                            path: 'somePath'
                        },
                        value
                    ]
                },
                result
            })),
            default: defaultValue
        },
        required: ['type', 'cases']
    } as any);

export const schema = genSwitchSchema(
    {
        docType: 'any'
    },
    [],
    []
);
