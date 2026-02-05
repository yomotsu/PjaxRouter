export interface PjaxRouterOptions {
    timeout?: number;
    triggers?: string[];
    ignores?: string[];
    selectors: string[];
    switches: {
        [selector: string]: (newEl: Element, oldEl: Element) => void;
    };
}
type EventCallback = (arg?: any) => void;
export default class PjaxRouter {
    static readonly supported: boolean;
    private lastStartTime;
    private url;
    private timeout;
    private triggers;
    private ignores;
    private selectors;
    private switches;
    private _listeners;
    private _onLinkClick;
    private _onPopstate;
    constructor(options: PjaxRouterOptions);
    pageTransition(newDocument: Document): void;
    load(url: string, isPopstate?: boolean): Promise<void>;
    on(type: string, listener: EventCallback, options?: {
        once?: boolean;
    }): void;
    once(type: string, listener: EventCallback): void;
    off(type: string, listener?: EventCallback): void;
    emit(type: string, argument?: any): void;
    private onLinkClick;
    private onPopstate;
}
export {};
