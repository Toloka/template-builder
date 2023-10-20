module.exports.genSwitchSchema = (result, cases, defaultValue) => ({
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
                        $ref: '#/definitions/condition',
                        description: 'условие, которое будет проверено хелпером'
                    },
                    result: {
                        description:
                            'Результат, который вернет хелпер если соответствующий condition вернет положительный результат',
                        ...result
                    }
                },
                required: ['condition', 'result']
            },
            description: 'Список вида условие - результат.'
        },
        default: {
            description: 'Значение, которое вернется если ни один condition из cases не вернул положительный результат',
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
    required: ['type', 'cases', 'default']
});

module.exports.docs = module.exports.genSwitchSchema({ $ref: '#/definitions/value' }, []);
