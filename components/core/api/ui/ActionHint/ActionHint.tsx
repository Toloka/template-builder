import classNames from 'classnames';
import { computed } from 'mobx';
import { useObserver } from 'mobx-react-lite';
import * as React from 'react';

import { CtxBag } from '../../../ctx/ctxBag';
import { useCtxBag } from '../../../ctx/nodeCtx';
import { resolveGetters } from '../../../resolveGetters/resolveGetters';
import { Action, ActionCreator, ActionCreatorProps } from '../../helpers/action';
import { makeTranslator } from '../../i18n';
import styles from './ActionHint.less';

export type ActionHintProps<AC extends ActionCreator> = ActionCreatorProps<AC> & {
    className?: string;
    dispatch?: boolean;
    theme?: 'default' | 'outlined';
};

const isMac = navigator.platform.toLowerCase().includes('mac');

const beautify = (givenKey: string) => {
    const key = givenKey.toLowerCase();

    if (key === 'alt' || key === 'option') return isMac ? '⌥' : 'alt';
    if (key === 'command' || key === 'meta') return isMac ? '⌘' : 'win';
    if (key === 'ctrl') return isMac ? '⌃' : 'ctrl';
    if (key === 'backspace') return isMac ? '⌫' : 'backspace';
    if (key === 'shift') return '⇧';

    return key;
};

export const getActionHint = (action: Action, bag: CtxBag) => {
    const resolvedAction = resolveGetters(action, bag);
    const t = makeTranslator(bag, 'core');

    let sequence = '';

    bag.tb.plugins.forEach((plugin) => {
        if (plugin.type === 'action' && plugin.name && !sequence) {
            sequence = plugin.match(resolvedAction, bag);
        }
    });

    if (!sequence) return '';

    return sequence
        .split('+')
        .map((key) => {
            return t(beautify(key));
        })
        .join('+');
};

const ActionHintBase = <AC extends ActionCreator>(props: ActionHintProps<AC>) => {
    const { action, className, dispatch = true } = props;
    const payload = (props as any).payload;
    const bag = useCtxBag();

    const fullAction = React.useMemo(
        () =>
            typeof action === 'object'
                ? action
                : (action as any)({
                      payload,
                      view: { ...bag.component.view, __tbViewKey: bag.component.__tbViewKey },
                      data: bag.component.data
                  }),
        [action, bag.component, payload]
    );

    const onClick = React.useCallback(() => {
        if (!dispatch) {
            return;
        }
        bag.tb.dispatch(fullAction, bag);
    }, [bag, dispatch, fullAction]);

    const contentComputed = React.useMemo(
        () =>
            computed(() => {
                const hint = getActionHint(fullAction, bag);

                if (!hint) {
                    return null;
                }

                const keys = hint.split('+').map((key) => (
                    <div
                        className={classNames(
                            (styles as any)[props.theme ? `${props.theme}Theme` : 'defaultTheme'],
                            key.length === 1 && styles.hotkeyChar
                        )}
                        key={key}
                    >
                        {key}
                    </div>
                ));

                const content: React.ReactNode[] = [];

                keys.forEach((key, index) => {
                    if (index !== 0) content.push(<span key={`separator-${index}`}>&nbsp;+&nbsp;</span>);

                    content.push(key);
                });

                return content;
            }),
        [bag, fullAction, props.theme]
    );

    const content = useObserver(() => contentComputed.get());

    if (!content) {
        return null;
    }

    return (
        <div className={classNames(className, styles.fullSequence, 'text-s')} onClick={onClick}>
            {content}
        </div>
    );
};

ActionHintBase.displayName = 'ActionHint';

export const ActionHint = React.memo(ActionHintBase);
