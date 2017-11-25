import load from './load.js';
import closest from './closest.js';

const tmpDocument = document.createElement( 'html' );

class PjaxRouter {

	constructor( option = {} ) {

		if ( ! PjaxRouter.supported ) return;

		this.lastStartTime = - 1;
		// this.loading = false;
		this.url = location.href;
		this.xhrTimeout = option.xhrTimeout || 5000;
		this.triggers = option.triggers || [];
		this.ignores = option.ignores || [];
		this.selectors = option.selectors;
		this.switches = option.switches;

		this._listeners = {};
		this._onLinkClick = onLinkClick.bind( this );
		this._onPopstate = onPopstate.bind( this );

		window.history.replaceState(
			{
				url: window.location.href,
				scrollTop: document.body.scrollTop || document.documentElement.scrollTop
			},
			document.title
		);
		document.body.addEventListener( 'click', this._onLinkClick );
		window.addEventListener( 'popstate', this._onPopstate );

	}

	pageTransition( htmlSrc ) {

		// this.loading = false;
		this.emit( 'beforeswitch' );

		tmpDocument.innerHTML = htmlSrc.replace( /^(.+)?<html(.+)?>/gi, '' );

		this.selectors.forEach( ( selector ) => {

			const oldEl = document.querySelector( selector );
			const newEl = tmpDocument.querySelector( selector );

			if ( typeof this.switches[ selector ] === 'function' ) {

				this.switches[ selector ].bind( this )( newEl, oldEl );

			}

		} );

		tmpDocument.innerHTML = '';

		this.emit( 'afterswitch' );

	}

	load( url, isPopstate ) {

		this.emit( 'beforeload' );

		const loadStartTime = Date.now();

		this.url = url;
		// this.loading = true;
		this.lastStartTime = loadStartTime;

		load(
			this.url,
			( htmlSrc, progress ) => {

				if ( ! htmlSrc ) {

					// onerror or timeout
					this.emit( 'error' );
					location.href = this.url;
					return;

				}

				if ( ! isPopstate ) {

					const matchedTitle = htmlSrc.match( /<title[^>]*>([^<]+)<\/title>/i );
					const title = !! matchedTitle ? matchedTitle[ 1 ] : this.url;
					const state = {
						url: this.url,
						scrollTop: document.body.scrollTop || document.documentElement.scrollTop
					};
					history.pushState( state, title, this.url );

				}

				if ( this.lastStartTime !== loadStartTime ) return;

				this.emit( 'load', progress );
				this.pageTransition( htmlSrc );

			},
			progress => {

				this.emit( 'loading', progress );

			},
			this.xhrTimeout
		);

	}

	on( type, listener, options ) {

		if ( ! this._listeners[ type ] ) {

			this._listeners[ type ] = [];

		}

		const handler = {
			callback: listener,
			once    : options && options.once || false
		};
		const contains = this._listeners[ type ].some( handler => {

			return handler.listener === listener;

		} );

		if ( ! contains ) {

			this._listeners[ type ].push( handler );

		}

	}

	once( type, listener ) {

		this.on( type, listener, { once: true } );

	}

	off( type, listener ) {

		if ( ! this._listeners[ type ] ) return;

		if ( ! listener ) {

			delete this._listeners[ type ];
			return;

		}

		const listenerArray = this._listeners[ type ];

		for ( let i = 0, l = listenerArray.length; i < l; i += 1 ) {

			if ( listenerArray[ i ].callback === listener ) {

				listenerArray.splice( i, 1 );
				return;

			}

		}

	}

	emit( type, argument ) {

		const listenerArray = this._listeners[ type ];

		if ( ! listenerArray ) return;

		this._listeners[ type ] = listenerArray.filter( el => {

			el.callback.call( this, argument );
			return ! el.once;

		} );

	}

}

PjaxRouter.supported = ( window.history && window.history.pushState );

const origin = new RegExp( location.origin );

function onLinkClick( event ) {

	let delegateTarget;
	const isMatched = this.triggers.some( selector => {

		delegateTarget = closest( event.target, selector );
		return !! delegateTarget;

	} );

	const isIgnored = this.ignores.some( selector => !! closest( event.target, selector ) );

	if ( ! isMatched || isIgnored ) return;

	const isExternalLink = ! origin.test( delegateTarget.href );

	if ( isExternalLink ) return;

	event.preventDefault();

	if ( this.url === delegateTarget.href ) return;

	this.load( delegateTarget.href );

}


function onPopstate( event ) {

	if ( ! event.state ) return;

	this.load( event.state.url, true );

}

export default PjaxRouter;
