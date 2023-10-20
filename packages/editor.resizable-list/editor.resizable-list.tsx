import * as React from 'react';

import styles from './editor.resizable-list.less';
import SplitPane from './react-split-pane/SplitPane';

export type ResizableListItem = {
    id: string;
    content: React.ReactNode;
    initialSize: string;
    minWidth?: string;
};

type SizeMap = { [id: string]: string };

const average = (map: SizeMap) => {
    const sizeStrings = Object.values(map);
    const sum = sizeStrings.map((size) => parseInt(size, 10)).reduce((acc, x) => acc + x);

    return String(sum / sizeStrings.length);
};

const ResizablePane: React.FC<{ initialSize: string; minSize: string }> = ({ children }) => {
    return <div className={styles.pane}>{children}</div>;
};

export const ResizableList: React.FC<{
    direction: 'vertical' | 'horizontal';
    items: ResizableListItem[];
}> = React.memo(({ direction, items }) => {
    const [sizes, setSizes] = React.useState<SizeMap>(() => {
        const initialSizes: SizeMap = {};

        items.forEach((item) => {
            initialSizes[item.id] = item.initialSize;
        });

        return initialSizes;
    });

    const onChange = React.useCallback(
        (updatedSizeArray) => {
            const newSizes: SizeMap = {};

            items.forEach((item, index) => {
                newSizes[item.id] = updatedSizeArray[index];
            });

            setSizes(newSizes);
        },
        [setSizes, items]
    );

    return (
        <SplitPane
            split={direction === 'vertical' ? 'horizontal' : 'vertical'}
            className={styles.split}
            onChange={onChange}
        >
            {items.map((item) => (
                <ResizablePane
                    initialSize={sizes[item.id] || average(sizes)}
                    key={item.id}
                    minSize={item.minWidth || '10%'}
                >
                    {item.content}
                </ResizablePane>
            ))}
        </SplitPane>
    );
});
ResizableList.displayName = 'ResizableList';
