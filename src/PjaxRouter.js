import load from './load.js';
import elementMatches from './elementMatches.js';

class PjaxRouter {

	constructor ( option = {} ) {

		if ( ! PjaxRouter.supported ) { return; }

		this.lastStartTime = -1;
		// this.loading = false;
		this.url = location.href;
		this.triggers = option.triggers;
		this.selectors = option.selectors;
		this.switches = option.switches;

		this._listeners = [];
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
		this.dispatch( { type: 'load' } );
		this.dispatch( { type: 'beforeswitch' } );

		this.selectors.forEach( ( selector ) => {

			const oldEl = document.querySelector( selector );
			const newEl = tmpDocument.querySelector( selector );

			if ( typeof this.switches[ selector ] === 'function' ) {

				this.switches[ selector ]( oldEl, newEl );

			}

		} );

		this.dispatch( { type: 'afterswitch' } );

	}

	load ( url, isPopstate ) {

		this.dispatch( { type: 'beforeload' } );

		const loadStartTime = Date.now();

		this.url = url;
		// this.loading = true;
		this.lastStartTime = loadStartTime;

		load( this.url, ( tmpDocument ) => {

			if ( ! tmpDocument ) {

				// onerror or timeout
				this.dispatch( { type: 'error' } );
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

	off ( type, listener ) {

		const listenerArray = this._listeners[ type ];

		if ( !!listenerArray ) {

			const index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	}

	dispatch ( event ) {

		const listenerArray = this._listeners[ event.type ];

		if ( !! listenerArray ) {

			event.target = this;
			const length = listenerArray.length;

			for ( let i = 0; i < length; i ++ ) {

				listenerArray[ i ].call( this, event );

			}

		}

	}

}

PjaxRouter.supported = ( window.history && window.history.pushState );

const origin = new RegExp( location.origin );

function onLinkClick ( event ) {

	const triggerEl = event.target;
	const isMatched = this.triggers.some( ( selector ) => elementMatches( triggerEl, selector ) );

	if ( ! isMatched ) { return; }

	const isExternalLink = ! origin.test( triggerEl.href );

	if ( isExternalLink ) { return; }

	event.preventDefault();

	if ( this.url === triggerEl.href ) { return; }

	this.load( triggerEl.href );

}


function onPopstate ( event ) {

	if ( ! event.state ) { return; }

	this.load( event.state.url, true );

}

export default PjaxRouter;
