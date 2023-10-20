import { stringifyAny } from '@toloka-tb/common/utils/stringifyAny';
import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import cn from 'classnames';
import { Radiobox } from '@toloka-tb/common/components/Radiobox';
import * as React from 'react';
import ReactMarkdown from 'react-markdown';

import styles from './field.quiz.less';
import { Hint } from './ui/Hint';

const type = 'field.quiz';

type QuizQuestionOptionType<T> = { label: string; value: T; hint?: string; correct: boolean };

type QuizQuestionType<T> = {
    options: Array<QuizQuestionOptionType<T>>;
    border: boolean;
    disabled: boolean;
    label: string;
    key: string;
};

export type QuizProps<T = any> = { options: Array<QuizQuestionType<T>>; instruction: string } & FieldProps<T>;

const render: { [nodeType: string]: React.ElementType<any> } = {
    // eslint-disable-next-line react/display-name
    link: (props) => (
        <a href={props.href} target="_blank" rel="noopener noreferrer">
            {props.children}
        </a>
    ),
    // eslint-disable-next-line react/display-name
    image: (props) => {
        return <img src={props.src} alt={props.alt} title={props.title} style={{ maxWidth: '100%' }} />;
    }
};

const QuizQuestion = <T,>({
    core,
    ...props
}: QuizQuestionType<T> & {
    core: Core;
    questionValue: any;
    onChange: (value: any, err?: string | undefined) => void;
}) => {
    const stringifiedSelectedValue = React.useMemo(() => stringifyAny(props.questionValue, true), [
        props.questionValue
    ]);
    const stringifiedValues = React.useMemo(
        () => props.options.filter(Boolean).map(({ value }) => stringifyAny(value, true)),
        [props.options]
    );

    return (
        <core.ui.list.ListContainer direction="vertical" size="s">
            {props.label && (
                <div className={styles.questionLabel}>
                    <ReactMarkdown source={String(props.label)} renderers={render} />
                </div>
            )}
            {props.options.filter(Boolean).map(({ label, value, hint, correct }, index) => {
                const answered = props.questionValue === value && Boolean(hint);

                return (
                    <core.ui.list.ListItem size="s" direction="vertical" key={index}>
                        <div className={styles.option}>
                            <Radiobox
                                view="default"
                                size="m"
                                onChange={() => props.onChange(value)}
                                value={stringifiedSelectedValue}
                                disabled={props.disabled}
                                className={cn(answered && styles.answeredRadio, correct && styles.correctRadio)}
                                options={[
                                    {
                                        label: (
                                            <div className={styles.radioLabel}>
                                                <ReactMarkdown source={String(label)} renderers={render} />
                                            </div>
                                        ),
                                        className: styles.radio,
                                        value: stringifiedValues[index]
                                    }
                                ]}
                            />
                            {answered && (
                                <div className={styles.hint}>
                                    <Hint
                                        text={<ReactMarkdown source={String(hint)} renderers={render} />}
                                        type={correct ? 'success' : 'error'}
                                    />
                                </div>
                            )}
                        </div>
                    </core.ui.list.ListItem>
                );
            })}
        </core.ui.list.ListContainer>
    );
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.field<QuizProps>(type, (props) => {
            const [quizValue, setQuizValue] = React.useState<Record<string, any>>({});
            const [countedQuizValue, setCountedQuizValue] = React.useState<Record<string, any>>({});

            const onChange = (value: any, key: string) => {
                if (typeof countedQuizValue[key] === 'undefined') {
                    setCountedQuizValue((firstQuizValue) => ({ ...firstQuizValue, [key]: value }));
                }

                setQuizValue({ ...quizValue, [key]: value });
            };

            React.useEffect(() => {
                const enabledOptions = props.options.filter((option) => !option.disabled);

                if (Object.keys(countedQuizValue).length === enabledOptions.length) {
                    props.onChange(countedQuizValue);
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [countedQuizValue]);

            React.useEffect(() => {
                if (typeof props.value === 'undefined') {
                    setQuizValue({});
                    setCountedQuizValue({});
                }
            }, [props.value]);

            React.useEffect(() => {
                if (typeof props.value !== 'undefined') {
                    setQuizValue(props.value);
                    setCountedQuizValue(props.value);
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, []);

            const questions = props.options.filter(Boolean).map(({ options, border, disabled, label, key }) => {
                const questionValue = quizValue[key] ?? '';

                return (
                    <core.ui.list.ListItem size="s" direction="vertical" key={key}>
                        <QuizQuestion
                            key={key}
                            label={label}
                            onChange={(value) => onChange(value, key)}
                            options={options}
                            border={border}
                            core={core}
                            disabled={disabled}
                            questionValue={questionValue}
                        />
                    </core.ui.list.ListItem>
                );
            });

            return (
                <div className={styles.quiz}>
                    <ReactMarkdown source={String(props.instruction)} renderers={render} />
                    <core.ui.list.ListContainer direction="vertical" size="s">
                        {questions}
                    </core.ui.list.ListContainer>
                </div>
            );
        })
    };
};
