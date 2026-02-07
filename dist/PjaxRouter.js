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

	async function load(url, progressCallback, timeout = 5000, options = {}) {
	    var _a;
	    const startTime = Date.now();
	    const controller = new AbortController();
	    const timeoutId = setTimeout(() => controller.abort(), timeout);
	    try {
	        const fetchOptions = {
	            method: options.method || 'GET',
	            signal: controller.signal,
	        };
	        if (options.body) {
	            fetchOptions.body = options.body;
	        }
	        if (options.headers) {
	            fetchOptions.headers = options.headers;
	        }
	        const response = await fetch(url, fetchOptions);
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

	function isHistoryState(state) {
	    return (state &&
	        typeof state === 'object' &&
	        typeof state.url === 'string' &&
	        typeof state.scrollTop === 'number');
	}
	function isValidMethod(method) {
	    const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
	    return validMethods.includes(method);
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
	        this.formTriggers = options.formTriggers || [];
	        this.ignores = options.ignores || [];
	        this.selectors = options.selectors;
	        this.switches = options.switches;
	        this._onLinkClick = (event) => this.onLinkClick(event);
	        this._onFormSubmit = (event) => this.onFormSubmit(event);
	        this._onPopstate = (event) => this.onPopstate(event);
	        const initialState = {
	            url: window.location.href,
	            scrollTop: document.body.scrollTop || document.documentElement.scrollTop,
	        };
	        window.history.replaceState(initialState, document.title);
	        document.body.addEventListener('click', this._onLinkClick);
	        document.addEventListener('submit', this._onFormSubmit, true);
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
	    async load(url, isPopstate = false, loadOptions = {}) {
	        this.emit('beforeload', { nextUrl: url });
	        const loadStartTime = Date.now();
	        this.url = url;
	        this.lastStartTime = loadStartTime;
	        try {
	            const result = await load(this.url, (progress) => this.emit('loading', progress), this.timeout, loadOptions);
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
	        if (!(event.target instanceof Element))
	            return;
	        const origin = new RegExp(location.origin);
	        let delegateTarget = null;
	        const isMatched = this.triggers.some((selector) => {
	            const target = event.target instanceof Element
	                ? event.target.closest(selector)
	                : null;
	            if (target) {
	                delegateTarget = target;
	                return true;
	            }
	            return false;
	        });
	        const isIgnored = this.ignores.some((selector) => {
	            return event.target instanceof Element
	                ? !!event.target.closest(selector)
	                : false;
	        });
	        if (!isMatched || isIgnored || !delegateTarget)
	            return;
	        const isExternalLink = !origin.test(delegateTarget.href);
	        if (isExternalLink)
	            return;
	        // Ignore navigation if it's the same page (excluding hash)
	        if (this.url.replace(/#.*$/, '') === delegateTarget.href.replace(/#.*$/, ''))
	            return;
	        event.preventDefault();
	        this.load(delegateTarget.href);
	    }
	    onFormSubmit(event) {
	        if (!(event.target instanceof Element))
	            return;
	        const origin = new RegExp(location.origin);
	        let delegateTarget = null;
	        const isMatched = this.formTriggers.some((selector) => {
	            const target = event.target instanceof Element
	                ? event.target.closest(selector)
	                : null;
	            if (target) {
	                delegateTarget = target;
	                return true;
	            }
	            return false;
	        });
	        const isIgnored = this.ignores.some((selector) => {
	            return event.target instanceof Element
	                ? !!event.target.closest(selector)
	                : false;
	        });
	        if (!isMatched || isIgnored || !delegateTarget)
	            return;
	        const methodString = (delegateTarget.method || 'GET').toUpperCase();
	        const method = isValidMethod(methodString) ? methodString : 'GET';
	        const action = form.action || location.href;
	        const isExternalLink = !origin.test(action);
	        if (isExternalLink)
	            return;
	        event.preventDefault();
	        const formData = new FormData(delegateTarget);
	        // GET and HEAD methods send parameters in URL, others in body
	        if (method === 'GET' || method === 'HEAD') {
	            const params = new URLSearchParams();
	            for (const [key, value] of formData.entries()) {
	                if (typeof value === 'string') {
	                    params.append(key, value);
	                }
	            }
	            const url = action.split('?')[0] + '?' + params.toString();
	            this.load(url, false, { method });
	        }
	        else {
	            // POST, PUT, PATCH, DELETE, OPTIONS send data in body
	            this.load(action, false, { method, body: formData });
	        }
	    }
	    onPopstate(event) {
	        if (!isHistoryState(event.state))
	            return;
	        this.load(event.state.url, true);
	    }
	}
	PjaxRouter.supported = !!(window.history && window.history.pushState);

	return PjaxRouter;

}));
//# sourceMappingURL=PjaxRouter.js.map
