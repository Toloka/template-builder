export const initEnConfig = {
    view: {
        type: 'view.list',
        items: [
            {
                type: 'view.group',
                label: 'Template builder',
                content: {
                    type: 'view.list',
                    items: [
                        {
                            type: 'view.text',
                            content: {
                                type: 'helper.join',
                                items: [
                                    'A new way to create task interfaces using ready-made components adapted for desktop and mobile devices.',
                                    'If this is your first time using the template builder, we suggest reviewing the Quick start guide in the documentation.'
                                ],
                                by: '\n'
                            }
                        },
                        {
                            type: 'view.link',
                            url: 'https://toloka.ai/docs/template-builder/quickstart/#interface',
                            content: 'Quick start'
                        }
                    ]
                }
            },
            {
                type: 'view.group',
                label: 'Instructions and examples',
                content: {
                    type: 'view.list',
                    items: [
                        {
                            type: 'view.text',
                            content:
                                "In the instructions, you'll learn how to work with input and output data, insert images, videos, and audio, and work with text."
                        },
                        {
                            type: 'view.link',
                            url: 'https://toloka.ai/docs/template-builder/operations/all/',
                            content: 'All instructions'
                        },
                        {
                            type: 'view.list',
                            direction: 'horizontal',
                            size: 's',
                            items: [
                                {
                                    type: 'view.link',
                                    url: 'https://toloka.ai/docs/template-builder/operations/components-for-texts/',
                                    content: 'How to work with text'
                                },
                                {
                                    type: 'view.link',
                                    url: 'https://toloka.ai/docs/template-builder/operations/insert-images/',
                                    content: 'How to add an image'
                                },
                                {
                                    type: 'view.link',
                                    url: 'https://toloka.ai/docs/template-builder/operations/input-output-data/',
                                    content: 'How to work with data'
                                },
                                {
                                    type: 'view.link',
                                    url: 'https://toloka.ai/docs/template-builder/operations/play-audio/',
                                    content: 'How to add audio'
                                }
                            ]
                        }
                    ]
                }
            },
            {
                type: 'view.group',
                label: 'Component list',
                content: {
                    type: 'view.list',
                    items: [
                        {
                            type: 'view.text',
                            content: {
                                type: 'helper.join',
                                items: [
                                    "If you don't know which component to use for your task, check the component list.",
                                    'A detailed description is provided for each one.'
                                ],
                                by: '\n'
                            }
                        },
                        {
                            type: 'view.link',
                            url: 'https://toloka.ai/docs/template-builder/reference/',
                            content: 'Component list'
                        }
                    ]
                }
            },
            {
                type: 'view.group',
                label: 'Keyboard shortcuts',
                content: {
                    type: 'view.markdown',
                    content:
                        '*Tab* — Open the component list with prompts.  \n *Ctrl+S (for Mac: Cmd+S)* — Automatically align the configuration file.  \n*Ctrl+Z (for Mac: Cmd+Z)* — Undo the previous action.'
                }
            }
        ]
    }
};
/* eslint-disable no-cyrillic-string/no-cyrillic-string */
export const initRuConfig = {
    view: {
        type: 'view.list',
        items: [
            {
                type: 'view.group',
                label: 'Конструктор шаблонов',
                content: {
                    type: 'view.list',
                    items: [
                        {
                            type: 'view.text',
                            content: {
                                type: 'helper.join',
                                items: [
                                    'новый способ создания интерфейсов заданий из готовых компонентов адаптированных под десктопные и мобильные устройства.',
                                    'Если вы первый раз пользуетелесь конструктором шаблонов рекомендуем изучить раздел в документации «Быстрый старт».'
                                ],
                                by: '\n'
                            }
                        },
                        {
                            type: 'view.link',
                            url: 'https://toloka.ai/docs/template-builder/quickstart/#interface',
                            content: 'Быстрый старт'
                        }
                    ]
                }
            },
            {
                type: 'view.group',
                label: 'Инструкции и примеры',
                content: {
                    type: 'view.list',
                    items: [
                        {
                            type: 'view.text',
                            content:
                                'В разделе инструкции вы узнаете, как работать с входными и выходными данными, вставлять картинки, видео и аудио, работать с текстом.'
                        },
                        {
                            type: 'view.link',
                            url: 'https://toloka.ai/docs/template-builder/operations/all/',
                            content: 'Список всех инструкций'
                        },
                        {
                            type: 'view.list',
                            direction: 'horizontal',
                            size: 's',
                            items: [
                                {
                                    type: 'view.link',
                                    url: 'https://toloka.ai/docs/template-builder/operations/components-for-texts/',
                                    content: 'Как работать с текстом'
                                },
                                {
                                    type: 'view.link',
                                    url: 'https://toloka.ai/docs/template-builder/operations/insert-images/',
                                    content: 'Как добавить картинку'
                                },
                                {
                                    type: 'view.link',
                                    url: 'https://toloka.ai/docs/template-builder/operations/input-output-data/',
                                    content: 'Как работать с данными'
                                },
                                {
                                    type: 'view.link',
                                    url: 'https://toloka.ai/docs/template-builder/operations/play-audio/',
                                    content: 'Как добавить аудиоплеер'
                                }
                            ]
                        }
                    ]
                }
            },
            {
                type: 'view.group',
                label: 'Справочник компонентов',
                content: {
                    type: 'view.list',
                    items: [
                        {
                            type: 'view.text',
                            content: {
                                type: 'helper.join',
                                items: [
                                    'Если вы не знаете какой компонент подойдет для ваших задач — загляните в справочник компонентов.',
                                    'У каждого компонента есть подробное описание.'
                                ],
                                by: '\n'
                            }
                        },
                        {
                            type: 'view.link',
                            url: 'https://toloka.ai/docs/template-builder/reference/',
                            content: 'Cправочник компонетов'
                        }
                    ]
                }
            },
            {
                type: 'view.group',
                label: 'Горячие клавиши',
                content: {
                    type: 'view.markdown',
                    content:
                        '*Tab* — открывает список компонентов с подсказками  \n *Ctrl+S (для Mac: Cmd+S)* — для автоматического выравнивания конфига  \n*Ctrl+Z (для Mac: Cmd+Z)* — отмена последнего действия'
                }
            }
        ]
    }
};

export const unknownLanguageInitConfig = {
    view: {
        type: 'view.list',
        items: [
            {
                type: 'view.text',
                content: 'hello world'
            }
        ]
    }
};
