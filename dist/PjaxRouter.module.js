/*!
 * PjaxRouter
 * https://github.com/yomotsu/PjaxRouter
 * (c) 2017 @yomotsu
 * Released under the MIT License.
 */
var tmpDocument = document.createElement('html');
var xhr = new XMLHttpRequest();

var load = function load(url, callback) {

	xhr.open('GET', url, true);
	xhr.timeout = 5000;
	xhr.onload = function () {

		tmpDocument.innerHTML = xhr.responseText.replace(/^(.+)?<html(.+)?>/gi, '');
		callback(tmpDocument);
	};

	xhr.ontimeout = function () {

		callback(null);
	};

	xhr.onerror = function () {

		callback(null);
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

		if (!PjaxRouter.supported) {
			return;
		}

		this.lastStartTime = -1;
		// this.loading = false;
		this.url = location.href;
		this.triggers = option.triggers;
		this.ignores = option.ignores || [];
		this.selectors = option.selectors;
		this.switches = option.switches;

		this._listeners = [];
		this._onLinkClick = onLinkClick.bind(this);
		this._onPopstate = onPopstate.bind(this);

		window.history.replaceState({
			url: window.location.href,
			scrollTop: document.body.scrollTop || document.documentElement.scrollTop
		}, document.title);
		document.body.addEventListener('click', this._onLinkClick);
		window.addEventListener('popstate', this._onPopstate);
	}

	PjaxRouter.prototype.pageTransition = function pageTransition(tmpDocument, loadStartTime) {
		var _this = this;

		if (this.lastStartTime !== loadStartTime) {
			return;
		}

		// this.loading = false;
		this.dispatch({ type: 'load' });
		this.dispatch({ type: 'beforeswitch' });

		this.selectors.forEach(function (selector) {

			var oldEl = document.querySelector(selector);
			var newEl = tmpDocument.querySelector(selector);

			if (typeof _this.switches[selector] === 'function') {

				_this.switches[selector](newEl, oldEl);
			}
		});

		this.dispatch({ type: 'afterswitch' });
	};

	PjaxRouter.prototype.load = function load$$1(url, isPopstate) {
		var _this2 = this;

		this.dispatch({ type: 'beforeload' });

		var loadStartTime = Date.now();

		this.url = url;
		// this.loading = true;
		this.lastStartTime = loadStartTime;

		load(this.url, function (tmpDocument) {

			if (!tmpDocument) {

				// onerror or timeout
				_this2.dispatch({ type: 'error' });
				location.href = _this2.url;
				return;
			}

			if (!isPopstate) {

				var title = tmpDocument.querySelector('title').textContent;
				var state = {
					url: _this2.url,
					scrollTop: document.body.scrollTop || document.documentElement.scrollTop
				};
				history.pushState(state, title, _this2.url);
			}

			_this2.pageTransition(tmpDocument, loadStartTime);
		});
	};

	PjaxRouter.prototype.on = function on(type, listener) {

		if (!this._listeners[type]) {

			this._listeners[type] = [];
		}

		if (this._listeners[type].indexOf(listener) === -1) {

			this._listeners[type].push(listener);
		}
	};

	PjaxRouter.prototype.off = function off(type, listener) {

		var listenerArray = this._listeners[type];

		if (!!listenerArray) {

			var index = listenerArray.indexOf(listener);

			if (index !== -1) {

				listenerArray.splice(index, 1);
			}
		}
	};

	PjaxRouter.prototype.dispatch = function dispatch(event) {

		var listenerArray = this._listeners[event.type];

		if (!!listenerArray) {

			event.target = this;
			var length = listenerArray.length;

			for (var i = 0; i < length; i++) {

				listenerArray[i].call(this, event);
			}
		}
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

	if (!isMatched || isIgnored) {
		return;
	}

	var isExternalLink = !origin.test(delegateTarget.href);

	if (isExternalLink) {
		return;
	}

	event.preventDefault();

	if (this.url === delegateTarget.href) {
		return;
	}

	this.load(delegateTarget.href);
}

function onPopstate(event) {

	if (!event.state) {
		return;
	}

	this.load(event.state.url, true);
}

export default PjaxRouter;
