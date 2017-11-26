/*!
 * PjaxRouter
 * https://github.com/yomotsu/PjaxRouter
 * (c) 2017 @yomotsu
 * Released under the MIT License.
 */
// const tmpDocument = document.createElement( 'html' );
var xhr = new XMLHttpRequest();

var load = function load(url, loadedCallback, loadingCallback) {
	var timeout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5000;


	var startTime = Date.now();

	xhr.open('GET', url, true);
	xhr.timeout = timeout;
	xhr.onload = function (event) {

		loadedCallback(xhr.responseText, {
			loaded: event.loaded,
			total: event.total,
			elapsedTime: Date.now() - startTime
		});
	};

	xhr.ontimeout = function () {

		loadedCallback(null);
	};

	xhr.onerror = function () {

		loadedCallback(null);
	};

	xhr.onprogress = function (event) {

		loadingCallback({
			loaded: event.loaded,
			total: event.total,
			elapsedTime: Date.now() - startTime
		});
	};

	xhr.send(null);
};

// https://developer.mozilla.org/ja/docs/Web/API/Element/matches#Polyfill
var matches = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

function elementMatches(el, selector) {

	return matches.call(el, selector);
}

var DOCUMENT_NODE_TYPE = 9;

function closest(el, selector) {

	while (el && el.nodeType !== DOCUMENT_NODE_TYPE) {

		if (elementMatches(el, selector)) return el;

		el = el.parentNode;
	}
}

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PjaxRouter = function () {
	function PjaxRouter() {
		var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, PjaxRouter);

		if (!PjaxRouter.supported) return;

		this.lastStartTime = -1;
		// this.loading = false;
		this.url = location.href;
		this.xhrTimeout = option.xhrTimeout || 5000;
		this.triggers = option.triggers || [];
		this.ignores = option.ignores || [];
		this.selectors = option.selectors;
		this.switches = option.switches;

		this._listeners = {};
		this._onLinkClick = onLinkClick.bind(this);
		this._onPopstate = onPopstate.bind(this);

		window.history.replaceState({
			url: window.location.href,
			scrollTop: document.body.scrollTop || document.documentElement.scrollTop
		}, document.title);
		document.body.addEventListener('click', this._onLinkClick);
		window.addEventListener('popstate', this._onPopstate);
	}

	PjaxRouter.prototype.pageTransition = function pageTransition(newDocument) {
		var _this = this;

		// this.loading = false;
		this.emit('beforeswitch');

		this.selectors.forEach(function (selector) {

			var oldEl = document.querySelector(selector);
			var newEl = newDocument.querySelector(selector);

			if (typeof _this.switches[selector] === 'function') {

				_this.switches[selector].bind(_this)(newEl, oldEl);
			}
		});

		this.emit('afterswitch');
	};

	PjaxRouter.prototype.load = function load$$1(url, isPopstate) {
		var _this2 = this;

		this.emit('beforeload');

		var loadStartTime = Date.now();

		this.url = url;
		// this.loading = true;
		this.lastStartTime = loadStartTime;

		load(this.url, function (htmlSrc, progress) {

			if (!htmlSrc) {

				// onerror or timeout
				_this2.emit('error');
				location.href = _this2.url;
				return;
			}

			var parser = new DOMParser();
			var newDocument = parser.parseFromString(htmlSrc, 'text/html');

			if (!isPopstate) {

				var title = !!newDocument.querySelector('title').innerHTML || _this2.url;
				var state = {
					url: _this2.url,
					scrollTop: document.body.scrollTop || document.documentElement.scrollTop
				};
				history.pushState(state, title, _this2.url);
			}

			if (_this2.lastStartTime !== loadStartTime) return;

			_this2.emit('load', progress);
			_this2.pageTransition(newDocument);
		}, function (progress) {

			_this2.emit('loading', progress);
		}, this.xhrTimeout);
	};

	PjaxRouter.prototype.on = function on(type, listener, options) {

		if (!this._listeners[type]) {

			this._listeners[type] = [];
		}

		var handler = {
			callback: listener,
			once: options && options.once || false
		};
		var contains = this._listeners[type].some(function (handler) {

			return handler.listener === listener;
		});

		if (!contains) {

			this._listeners[type].push(handler);
		}
	};

	PjaxRouter.prototype.once = function once(type, listener) {

		this.on(type, listener, { once: true });
	};

	PjaxRouter.prototype.off = function off(type, listener) {

		if (!this._listeners[type]) return;

		if (!listener) {

			delete this._listeners[type];
			return;
		}

		var listenerArray = this._listeners[type];

		for (var i = 0, l = listenerArray.length; i < l; i += 1) {

			if (listenerArray[i].callback === listener) {

				listenerArray.splice(i, 1);
				return;
			}
		}
	};

	PjaxRouter.prototype.emit = function emit(type, argument) {
		var _this3 = this;

		var listenerArray = this._listeners[type];

		if (!listenerArray) return;

		this._listeners[type] = listenerArray.filter(function (el) {

			el.callback.call(_this3, argument);
			return !el.once;
		});
	};

	return PjaxRouter;
}();

PjaxRouter.supported = window.history && window.history.pushState;

var origin = new RegExp(location.origin);

function onLinkClick(event) {

	var delegateTarget = void 0;
	var isMatched = this.triggers.some(function (selector) {

		delegateTarget = closest(event.target, selector);
		return !!delegateTarget;
	});

	var isIgnored = this.ignores.some(function (selector) {
		return !!closest(event.target, selector);
	});

	if (!isMatched || isIgnored) return;

	var isExternalLink = !origin.test(delegateTarget.href);

	if (isExternalLink) return;

	event.preventDefault();

	if (this.url === delegateTarget.href) return;

	this.load(delegateTarget.href);
}

function onPopstate(event) {

	if (!event.state) return;

	this.load(event.state.url, true);
}

export default PjaxRouter;
