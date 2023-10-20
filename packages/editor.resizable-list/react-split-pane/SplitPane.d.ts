import React from 'react';

declare class SplitPane extends React.Component<{
    split: 'vertical' | 'horizontal';
    resizerSize?: number;
    className?: string;
    onChange?: (updatedSizeArray: string[]) => void;
    onResizeStart?: () => void;
    onResizeEnd?: () => void;
}> {}

export default SplitPane;
