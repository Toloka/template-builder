export type PopoverMixedEvent = Event & {
    __cc_popoverMixedEvent: true;
    __cc_popoverAnchors: HTMLElement[];
    __cc_popoverGroups: string[];
};

export const mixinEvent = (event: Event | { nativeEvent: Event }, target?: HTMLElement | null, groupId?: string) => {
    const originalEvent = ('nativeEvent' in event ? event.nativeEvent : event) as PopoverMixedEvent;
    originalEvent.__cc_popoverMixedEvent = true;
    if (target) {
        originalEvent.__cc_popoverAnchors = [...(originalEvent.__cc_popoverAnchors || []), target];
    }
    if (groupId) {
        originalEvent.__cc_popoverGroups = [...(originalEvent.__cc_popoverGroups || []), groupId];
    }
};

export const isEventMixed = (
    event: Event | { nativeEvent: Event } | PopoverMixedEvent,
    target?: HTMLElement | null,
    groupId?: string,
) => {
    const originalEvent = ('nativeEvent' in event ? event.nativeEvent : event) as PopoverMixedEvent;

    if (originalEvent.__cc_popoverMixedEvent !== true) {
        return false;
    }

    if (target && originalEvent.__cc_popoverAnchors && !originalEvent.__cc_popoverAnchors.includes(target)) {
        return false;
    }
    if (groupId && originalEvent.__cc_popoverGroups && !originalEvent.__cc_popoverGroups.includes(groupId)) {
        return false;
    }

    return true;
};
