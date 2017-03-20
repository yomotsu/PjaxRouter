/*!
 * PjaxRouter
 * https://github.com/yomotsu/PjaxRouter
 * (c) 2017 @yomotsu
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.PjaxRouter = factory());
}(this, (function () { 'use strict';

	var tmpDocument = document.createElement('html');
	var xhr = new XMLHttpRequest();
	xhr.timeout = 2000;

	var load = function load(url, callback) {

		xhr.open('GET', url, true);
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

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var PjaxRouter = function () {
		function PjaxRouter() {
			var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, PjaxRouter);

			this.lastStartTime = -1;
			// this.loading = false;
			this.url = location.href;
			this.triggers = option.triggers;
			this.selectors = option.selectors;
			this.switches = option.switches;

			this._listeners = [];
			this._onLinkClick = onLinkClick.bind(this);
			this._onPopstate = onPopstate.bind(this);

			window.history.replaceState({ url: window.location.href }, document.title);
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

				_this.switches[selector](oldEl, newEl);
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
						url: _this2.url
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

	var origin = new RegExp(location.origin);

	function onLinkClick(event) {

		var triggerEl = event.target;
		var isMatched = this.triggers.some(function (selector) {
			return triggerEl.matches(selector);
		});

		if (!isMatched) {
			return;
		}

		var isExternalLink = !origin.test(triggerEl.href);

		if (isExternalLink) {
			return;
		}

		event.preventDefault();

		if (this.url === triggerEl.href) {
			return;
		}

		this.load(triggerEl.href);
	}

	function onPopstate(event) {

		if (!event.state) {
			return;
		}

		this.load(event.state.url, true);
	}

	return PjaxRouter;

})));
