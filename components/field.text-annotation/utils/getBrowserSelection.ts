export const getBrowserSelection = (container: HTMLElement) => {
    const selection = window.getSelection();

    if (!selection) return null;
    if (selection.rangeCount === 0) return null;

    let offset = 0;
    const range = selection.getRangeAt(0);

    let {
        startContainer,
        endContainer
    }: {
        startContainer: Node | null;
        endContainer: Node | null;
    } = range;

    while (startContainer !== null && startContainer !== container) startContainer = startContainer?.parentNode || null;
    while (endContainer !== null && endContainer !== container) endContainer = endContainer?.parentNode || null;

    if (startContainer === null && endContainer === null) return null;

    let length = range.toString().length;
    const preCaretRange = range.cloneRange();

    preCaretRange.selectNodeContents(container);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    if (length) {
        offset = preCaretRange.toString().length - length;
    } else {
        offset = preCaretRange.toString().length;
    }

    if (offset < 0) return null;

    const containerOverflow = offset + length - (container.textContent?.length || 0);

    if (containerOverflow > 0) {
        length = length - containerOverflow;
    }

    if (length === 0) return null;

    return {
        offset,
        length,
        trigger: 'selection' as const
    };
};
