/*!
 * PjaxRouter v2.0.0
 * https://github.com/yomotsu/PjaxRouter
 * (c) 2017 @yomotsu
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.PjaxRouter = factory());
})(this, (function () { 'use strict';

	async function load(url, progressCallback, timeout = 5000) {
	    var _a;
	    const startTime = Date.now();
	    const controller = new AbortController();
	    const timeoutId = setTimeout(() => controller.abort(), timeout);
	    try {
	        const response = await fetch(url, { signal: controller.signal });
	        if (!response.ok) {
	            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	        }
	        // Stream response for progress tracking
	        const reader = (_a = response.body) === null || _a === void 0 ? void 0 : _a.getReader();
	        const contentLength = parseInt(response.headers.get('Content-Length') || '0', 10);
	        if (!reader) {
	            // Fallback if streaming not available
	            const text = await response.text();
	            clearTimeout(timeoutId);
	            return {
	                text,
	                progress: {
	                    loaded: text.length,
	                    total: text.length,
	                    elapsedTime: Date.now() - startTime,
	                },
	            };
	        }
	        let receivedLength = 0;
	        const chunks = [];
	        while (true) {
	            const { done, value } = await reader.read();
	            if (done)
	                break;
	            chunks.push(value);
	            receivedLength += value.length;
	            if (progressCallback) {
	                progressCallback({
	                    loaded: receivedLength,
	                    total: contentLength || receivedLength,
	                    elapsedTime: Date.now() - startTime,
	                });
	            }
	        }
	        clearTimeout(timeoutId);
	        // Concatenate chunks and decode
	        const blob = new Blob(chunks);
	        const text = await blob.text();
	        return {
	            text,
	            progress: {
	                loaded: receivedLength,
	                total: contentLength || receivedLength,
	                elapsedTime: Date.now() - startTime,
	            },
	        };
	    }
	    catch (error) {
	        clearTimeout(timeoutId);
	        if (error instanceof Error && error.name === 'AbortError') {
	            throw new Error('Request timeout');
	        }
	        throw error;
	    }
	}

	class PjaxRouter {
	    constructor(options) {
	        this.lastStartTime = -1;
	        this._listeners = {};
	        if (!PjaxRouter.supported)
	            return;
	        this.url = location.href;
	        this.timeout = options.timeout || 5000;
	        this.triggers = options.triggers || [];
	        this.ignores = options.ignores || [];
	        this.selectors = options.selectors;
	        this.switches = options.switches;
	        this._onLinkClick = (event) => this.onLinkClick(event);
	        this._onPopstate = (event) => this.onPopstate(event);
	        window.history.replaceState({
	            url: window.location.href,
	            scrollTop: document.body.scrollTop || document.documentElement.scrollTop,
	        }, document.title);
	        document.body.addEventListener('click', this._onLinkClick);
	        window.addEventListener('popstate', this._onPopstate);
	    }
	    pageTransition(newDocument) {
	        this.emit('beforeswitch');
	        this.selectors.forEach((selector) => {
	            const oldEl = document.querySelector(selector);
	            const newEl = newDocument.querySelector(selector);
	            if (oldEl && newEl && typeof this.switches[selector] === 'function') {
	                this.switches[selector].call(this, newEl, oldEl);
	            }
	        });
	        this.emit('afterswitch');
	    }
	    async load(url, isPopstate = false) {
	        this.emit('beforeload', { nextUrl: url });
	        const loadStartTime = Date.now();
	        this.url = url;
	        this.lastStartTime = loadStartTime;
	        try {
	            const result = await load(this.url, (progress) => this.emit('loading', progress), this.timeout);
	            const parser = new DOMParser();
	            const newDocument = parser.parseFromString(result.text, 'text/html');
	            if (!isPopstate) {
	                const titleEl = newDocument.querySelector('title');
	                const title = titleEl ? titleEl.innerHTML : this.url;
	                const state = {
	                    url: this.url,
	                    scrollTop: document.body.scrollTop || document.documentElement.scrollTop,
	                };
	                history.pushState(state, title, this.url);
	            }
	            // Prevent race condition
	            if (this.lastStartTime !== loadStartTime)
	                return;
	            this.emit('load', result.progress);
	            this.pageTransition(newDocument);
	        }
	        catch (error) {
	            this.emit('error', error);
	            location.href = this.url; // Fallback to full page load
	        }
	    }
	    on(type, listener, options) {
	        if (!this._listeners[type]) {
	            this._listeners[type] = [];
	        }
	        const handler = {
	            callback: listener,
	            once: (options === null || options === void 0 ? void 0 : options.once) || false,
	        };
	        const contains = this._listeners[type].some((h) => h.callback === listener);
	        if (!contains) {
	            this._listeners[type].push(handler);
	        }
	    }
	    once(type, listener) {
	        this.on(type, listener, { once: true });
	    }
	    off(type, listener) {
	        if (!this._listeners[type])
	            return;
	        if (!listener) {
	            delete this._listeners[type];
	            return;
	        }
	        const listenerArray = this._listeners[type];
	        const index = listenerArray.findIndex((h) => h.callback === listener);
	        if (index !== -1)
	            listenerArray.splice(index, 1);
	    }
	    emit(type, argument) {
	        const listenerArray = this._listeners[type];
	        if (!listenerArray)
	            return;
	        this._listeners[type] = listenerArray.filter((el) => {
	            el.callback.call(this, argument);
	            return !el.once;
	        });
	    }
	    onLinkClick(event) {
	        const origin = new RegExp(location.origin);
	        let delegateTarget = null;
	        const isMatched = this.triggers.some((selector) => {
	            const target = event.target.closest(selector);
	            if (target) {
	                delegateTarget = target;
	                return true;
	            }
	            return false;
	        });
	        const isIgnored = this.ignores.some((selector) => !!event.target.closest(selector));
	        if (!isMatched || isIgnored || !delegateTarget)
	            return;
	        // TypeScript now knows delegateTarget is not null
	        const anchor = delegateTarget;
	        const isExternalLink = !origin.test(anchor.href);
	        if (isExternalLink)
	            return;
	        event.preventDefault();
	        if (this.url === anchor.href)
	            return;
	        this.load(anchor.href);
	    }
	    onPopstate(event) {
	        if (!event.state)
	            return;
	        const state = event.state;
	        this.load(state.url, true);
	    }
	}
	PjaxRouter.supported = !!(window.history && window.history.pushState);

	return PjaxRouter;

}));
//# sourceMappingURL=PjaxRouter.js.map
