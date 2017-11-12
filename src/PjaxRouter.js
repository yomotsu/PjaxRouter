import load from './load.js';
import closest from './closest.js';
import elementMatches from './elementMatches.js';

class PjaxRouter {

	constructor ( option = {} ) {

		if ( ! PjaxRouter.supported ) { return; }

		this.lastStartTime = -1;
		// this.loading = false;
		this.url = location.href;
		this.triggers = option.triggers;
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

	pageTransition ( tmpDocument, loadStartTime ) {

		if ( this.lastStartTime !== loadStartTime ) { return; }

		// this.loading = false;
		this.dispatch( 'load' );
		this.dispatch( 'beforeswitch' );

		this.selectors.forEach( ( selector ) => {

			const oldEl = document.querySelector( selector );
			const newEl = tmpDocument.querySelector( selector );

			if ( typeof this.switches[ selector ] === 'function' ) {

				this.switches[ selector ]( newEl, oldEl );

			}

		} );

		this.dispatch( 'afterswitch' );

	}

	load ( url, isPopstate ) {

		this.dispatch( 'beforeload' );

		const loadStartTime = Date.now();

		this.url = url;
		// this.loading = true;
		this.lastStartTime = loadStartTime;

		load( this.url, ( tmpDocument ) => {

			if ( ! tmpDocument ) {

				// onerror or timeout
				this.dispatch( 'error' );
				location.href = this.url;
				return;

			}

			if ( ! isPopstate ) {

				const title = tmpDocument.querySelector( 'title' ).textContent;
				const state = {
					url: this.url,
					scrollTop: document.body.scrollTop || document.documentElement.scrollTop
				};
				history.pushState( state, title, this.url );

			}

			this.pageTransition( tmpDocument, loadStartTime );

		} );

	}

	on ( type, listener ) {

		if ( ! this._listeners[ type ] ) {

			this._listeners[ type ] = [];

		}

		if ( this._listeners[ type ].indexOf( listener ) === - 1 ) {

			this._listeners[ type ].push( listener );

		}

	}

	once ( type, listener ) {

		const onetimeListener = () => {

			listener();
			this.off( type, onetimeListener );

		}

		this.on( type, onetimeListener );

	}

	off ( type, listener ) {

		const listenerArray = this._listeners[ type ];

		if ( !!listenerArray ) {

			const index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	}

	dispatch ( type ) {

		const listenerArray = this._listeners[ type ];

		if ( !! listenerArray ) {

			const length = listenerArray.length;

			for ( let i = 0; i < length; i ++ ) {

				listenerArray[ i ].call( this );

			}

		}

	}

}

PjaxRouter.supported = ( window.history && window.history.pushState );

const origin = new RegExp( location.origin );

function onLinkClick ( event ) {

	let delegateTarget;
	const isMatched = this.triggers.some( selector => {

		delegateTarget = closest( event.target, selector );
		return !! delegateTarget;

	} );

	const isIgnored = this.ignores.some( selector => !! closest( event.target, selector ) );

	if ( ! isMatched || isIgnored ) { return; }

	const isExternalLink = ! origin.test( delegateTarget.href );

	if ( isExternalLink ) { return; }

	event.preventDefault();

	if ( this.url === delegateTarget.href ) { return; }

	this.load( delegateTarget.href );

}


function onPopstate ( event ) {

	if ( ! event.state ) { return; }

	this.load( event.state.url, true );

}

export default PjaxRouter;
