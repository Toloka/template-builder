import { domEvent } from 'monaco-editor/esm/vs/base/browser/event';
import { ListView } from 'monaco-editor/esm/vs/base/browser/ui/list/listView';
import { List } from 'monaco-editor/esm/vs/base/browser/ui/list/listWidget';
import { Event } from 'monaco-editor/esm/vs/base/common/event';
import { SuggestWidget } from 'monaco-editor/esm/vs/editor/contrib/suggest/suggestWidget';
const realMonacoShowSuggestions = SuggestWidget.prototype.showSuggestions;

let itemFocusTimeout = -1;

let eventHandlersAdded = false;

SuggestWidget.prototype.showSuggestions = function(...args: any[]) {
    realMonacoShowSuggestions.call(this, ...args);

    /**
     * Expanded suggestion hint by default
     */

    /**
     * code for modern version of monaco editor (by 19.10.20)
     * ```if (!this._isDetailsVisible()) {```
     *  */

    if (!this.expandDocsSettingFromStorage()) {
        this.toggleDetails();
    }

    if (!eventHandlersAdded) {
        /**
         * Suggestion item focus by mouseover
         */
        this.toDispose.add(
            this.list.onMouseOver((e: any) => {
                if (typeof e.element === 'undefined' || typeof e.index === 'undefined') {
                    return;
                }

                itemFocusTimeout = window.setTimeout(() => {
                    this.list.setFocus([e.index], e);
                }, 500);
            })
        );
        this.toDispose.add(
            this.list.onMouseOut(() => {
                clearTimeout(itemFocusTimeout);
            })
        );
        eventHandlersAdded = true;
    }
};

/**
 * Monaco lists mouseover handling for suggestion item focus by mouseover
 */
Object.defineProperty(List.prototype, 'onMouseOver', {
    get() {
        return this.view.onMouseOver;
    },
    enumerable: true,
    configurable: true
});

Object.defineProperty(ListView.prototype, 'onMouseOver', {
    get() {
        return Event.map(domEvent(this.domNode, 'mouseover'), (e: any) => {
            return this.toMouseEvent(e);
        });
    },
    enumerable: true,
    configurable: true
});

/**
 * Monaco lists mosueout handling for suggestion item focus by mouseover
 */
Object.defineProperty(List.prototype, 'onMouseOut', {
    get() {
        return this.view.onMouseOut;
    },
    enumerable: true,
    configurable: true
});

Object.defineProperty(ListView.prototype, 'onMouseOut', {
    get() {
        return Event.map(domEvent(this.domNode, 'mouseout'), (e: any) => {
            return this.toMouseEvent(e);
        });
    },
    enumerable: true,
    configurable: true
});
