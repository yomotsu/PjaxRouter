import { LoadOptions } from './load';
export interface PjaxRouterOptions {
    timeout?: number;
    triggers?: string[];
    formTriggers?: string[];
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
    private formTriggers;
    private ignores;
    private selectors;
    private switches;
    private _listeners;
    private _onLinkClick;
    private _onFormSubmit;
    private _onPopstate;
    constructor(options: PjaxRouterOptions);
    pageTransition(newDocument: Document): void;
    load(url: string, isPopstate?: boolean, loadOptions?: LoadOptions): Promise<void>;
    on(type: string, listener: EventCallback, options?: {
        once?: boolean;
    }): void;
    once(type: string, listener: EventCallback): void;
    off(type: string, listener?: EventCallback): void;
    emit(type: string, argument?: any): void;
    private onLinkClick;
    private onFormSubmit;
    private onPopstate;
}
export {};
