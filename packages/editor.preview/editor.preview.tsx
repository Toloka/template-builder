import 'microtip/microtip.css';

import { TbContext } from '@toloka-tb/bootstrap/domain';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import styles from './editor.preview.less';
import { createEnvStore, EnvStore, resetEnvStore } from './env.store';
import { Error, Errors } from './src/Errors/Errors';
import { LayoutBlank } from './src/Layout/LayoutBlank';
import { LayoutPager } from './src/Layout/LayoutPager';
import { LayoutScroll } from './src/Layout/LayoutScroll';
import { MobileDesktopRadioButton, MobileOrDesktop } from './src/MobileDesktopRatdioButton/MobileDesktopRadioButton';

export const Preview: React.FC<{
    ctx?: TbContext; // optional in case only erros are available
    device?: 'MOBILE' | 'DESKTOP';
    env: EnvStore;
    errors: Error[];

    onSubmit: (values: unknown) => void;
}> = observer(({ ctx, errors, env, onSubmit, device }) => {
    const template = ctx && (
        <ctx.Component ctx={ctx} onSubmit={onSubmit}>
            <div className={styles.instanceRootScrollPadding}></div>
        </ctx.Component>
    );

    const notifications = env.Notifications && <env.Notifications input={[ctx ? ctx.input : {}]} />;

    const taskPreview = env.layout ? (
        <>
            {env.layout.kind === 'pager' && (
                <LayoutPager device={device} notifications={notifications} taskWidth={env.layout.taskWidth}>
                    {template}
                </LayoutPager>
            )}
            {env.layout.kind === 'scroll' && (
                <LayoutScroll device={device} notifications={notifications} taskWidth={env.layout.taskWidth}>
                    {template}
                </LayoutScroll>
            )}
        </>
    ) : (
        <LayoutBlank device={device}>{template}</LayoutBlank>
    );

    return (
        <>
            <div className={styles.wrapper}>
                <Errors errors={errors} />
                <div className={styles.instanceRoot}>{taskPreview}</div>
            </div>
        </>
    );
});
Preview.displayName = 'editor.preview';

export { Error, EnvStore, createEnvStore, resetEnvStore, MobileDesktopRadioButton, MobileOrDesktop };
