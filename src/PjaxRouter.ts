import load, { LoadProgress } from './load';

export interface PjaxRouterOptions {

	timeout?: number;
	triggers?: string[];
	ignores?: string[];
	selectors: string[];
	switches: {
		[ selector: string ]: ( newEl: Element, oldEl: Element ) => void;
	};

}

interface EventListener {

	callback: EventCallback;
	once: boolean;

}

type EventCallback = ( arg?: any ) => void;

interface HistoryState {

	url: string;
	scrollTop: number;

}

export default class PjaxRouter {

	static readonly supported: boolean = !! ( window.history && window.history.pushState );

	private lastStartTime: number = - 1;
	private url!: string;
	private timeout!: number;
	private triggers!: string[];
	private ignores!: string[];
	private selectors!: string[];
	private switches!: { [ selector: string ]: ( newEl: Element, oldEl: Element ) => void };
	private _listeners: { [ type: string ]: EventListener[] } = {};
	private _onLinkClick!: ( event: MouseEvent ) => void;
	private _onPopstate!: ( event: PopStateEvent ) => void;

	constructor( options: PjaxRouterOptions ) {

		if ( ! PjaxRouter.supported ) return;

		this.url = location.href;
		this.timeout = options.timeout || 5000;
		this.triggers = options.triggers || [];
		this.ignores = options.ignores || [];
		this.selectors = options.selectors;
		this.switches = options.switches;

		this._onLinkClick = ( event: MouseEvent ) => this.onLinkClick( event );
		this._onPopstate = ( event: PopStateEvent ) => this.onPopstate( event );

		window.history.replaceState(
			{
				url: window.location.href,
				scrollTop: document.body.scrollTop || document.documentElement.scrollTop,
			} as HistoryState,
			document.title,
		);

		document.body.addEventListener( 'click', this._onLinkClick );
		window.addEventListener( 'popstate', this._onPopstate );

	}

	pageTransition( newDocument: Document ): void {

		this.emit( 'beforeswitch' );

		this.selectors.forEach( ( selector ) => {

			const oldEl = document.querySelector( selector );
			const newEl = newDocument.querySelector( selector );

			if ( oldEl && newEl && typeof this.switches[ selector ] === 'function' ) {

				this.switches[ selector ].call( this, newEl, oldEl );

			}

		} );

		this.emit( 'afterswitch' );

	}

	async load( url: string, isPopstate: boolean = false ): Promise<void> {

		this.emit( 'beforeload', { nextUrl: url } );

		const loadStartTime = Date.now();
		this.url = url;
		this.lastStartTime = loadStartTime;

		try {

			const result = await load(
				this.url,
				( progress: LoadProgress ) => this.emit( 'loading', progress ),
				this.timeout,
			);

			const parser = new DOMParser();
			const newDocument = parser.parseFromString( result.text, 'text/html' );

			if ( ! isPopstate ) {

				const titleEl = newDocument.querySelector( 'title' );
				const title = titleEl ? titleEl.innerHTML : this.url;
				const state: HistoryState = {
					url: this.url,
					scrollTop: document.body.scrollTop || document.documentElement.scrollTop,
				};
				history.pushState( state, title, this.url );

			}

			// Prevent race condition
			if ( this.lastStartTime !== loadStartTime ) return;

			this.emit( 'load', result.progress );
			this.pageTransition( newDocument );

		} catch ( error ) {

			this.emit( 'error', error );
			location.href = this.url; // Fallback to full page load

		}

	}

	on( type: string, listener: EventCallback, options?: { once?: boolean } ): void {

		if ( ! this._listeners[ type ] ) {

			this._listeners[ type ] = [];

		}

		const handler: EventListener = {
			callback: listener,
			once: options?.once || false,
		};

		const contains = this._listeners[ type ].some( ( h ) => h.callback === listener );

		if ( ! contains ) {

			this._listeners[ type ].push( handler );

		}

	}

	once( type: string, listener: EventCallback ): void {

		this.on( type, listener, { once: true } );

	}

	off( type: string, listener?: EventCallback ): void {

		if ( ! this._listeners[ type ] ) return;

		if ( ! listener ) {

			delete this._listeners[ type ];
			return;

		}

		const listenerArray = this._listeners[ type ];
		const index = listenerArray.findIndex( ( h ) => h.callback === listener );

		if ( index !== - 1 ) listenerArray.splice( index, 1 );

	}

	emit( type: string, argument?: any ): void {

		const listenerArray = this._listeners[ type ];

		if ( ! listenerArray ) return;

		this._listeners[ type ] = listenerArray.filter( ( el ) => {

			el.callback.call( this, argument );
			return ! el.once;

		} );

	}

	private onLinkClick( event: MouseEvent ): void {

		const origin = new RegExp( location.origin );
		let delegateTarget: HTMLAnchorElement | null = null;

		const isMatched = this.triggers.some( ( selector ) => {

			const target = ( event.target as Element ).closest<HTMLAnchorElement>( selector );
			if ( target ) {

				delegateTarget = target;
				return true;

			}

			return false;

		} );

		const isIgnored = this.ignores.some( ( selector ) =>
			!! ( event.target as Element ).closest( selector )
		);

		if ( ! isMatched || isIgnored || ! delegateTarget ) return;

		// TypeScript now knows delegateTarget is not null
		const anchor = delegateTarget as HTMLAnchorElement;
		const isExternalLink = ! origin.test( anchor.href );

		if ( isExternalLink ) return;

		event.preventDefault();

		// Ignore navigation if it's the same page (excluding hash)
		if ( this.url.replace( /#.*$/, '' ) === anchor.href.replace( /#.*$/, '' ) ) return;

		this.load( anchor.href );

	}

	private onPopstate( event: PopStateEvent ): void {

		if ( ! event.state ) return;

		const state = event.state as HistoryState;
		this.load( state.url, true );

	}

}
